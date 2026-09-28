"""Thẻ "Nhập tại chỗ" — đo bằng TRÌNH DUYỆT THẬT (Playwright + Chromium).

Test Python (`test_diem_theo_o_tick.py`, `test_tim_kiem_tieng_viet.py`)
khoá hành vi của API. File này khoá phần NỐI giữa API và màn hình:

  * gõ "BINH" không dấu vào ô tìm thì ra đúng em "Lê Thị Bình";
  * bỏ tick một CLB đã chấm rồi bấm Lưu thì màn hình NÓI là đã xoá điểm,
    điểm biến khỏi CSDL, thẻ "n CLB thi" trong danh sách cập nhật ngay,
    và thẻ Nhập điểm không còn liệt kê em đó;
  * "Sửa lại từ đầu" báo số điểm đã xoá.

Mọi phép kiểm cuối cùng nhìn vào CSDL, không chỉ nhìn chữ trên màn hình.
"""

import os
import sqlite3

import pytest

pytest.importorskip("playwright", reason="chưa cài playwright")
from playwright.sync_api import sync_playwright  # noqa: E402

import browser_host  # noqa: E402

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

CHROMIUM = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
if not os.path.exists(CHROMIUM):
    CHROMIUM = None


@pytest.fixture
def api_da_cham(api):
    api.create_or_update_club("clb_a", "CLB A", 1, 0, "")
    api.create_or_update_club("clb_b", "CLB B", 5, 0, "")
    for sid, ten in (("HS01", "Ngô Văn An"), ("HS02", "Lê Thị Bình")):
        api.create_student_if_missing(sid, ten)
        api.submit_test_selection(sid, ["clb_a"])
        api.submit_preferences(sid, ["clb_a", "clb_b"])
    api.submit_club_scores("clb_a", [
        {"student_id": "HS01", "score": 5},
        {"student_id": "HS02", "score": 9},
    ])
    return api


@pytest.fixture
def trang(api_da_cham):
    if CHROMIUM is None:
        pytest.skip("khong tim thay Chromium")
    url = browser_host.serve(api_da_cham, GOC, "index.html", open_browser=False)
    with sync_playwright() as pw:
        br = pw.chromium.launch(executable_path=CHROMIUM, args=["--no-sandbox"])
        page = br.new_page(locale="vi-VN")
        loi = []
        page.on("pageerror", lambda e: loi.append(str(e)))
        page.goto(url)
        page.wait_for_selector("#dropZone")
        page.locator('[data-tab="fallback"]').click()
        page.wait_for_selector("#studentSearchResults .search-result-item")
        yield page, api_da_cham, loi
        br.close()


def _diem(api):
    conn = sqlite3.connect(api.db_path)
    r = set(conn.execute("SELECT student_id, club_id FROM club_scores").fetchall())
    conn.close()
    return r


def _mo_hoc_sinh(page, go, ma):
    page.fill("#studentSearchInput", go)
    page.wait_for_function(
        "(ma) => { const it = document.querySelectorAll('#studentSearchResults .search-result-item');"
        " return it.length === 1 && it[0].textContent.includes(ma); }",
        arg=ma,
    )
    page.locator("#studentSearchResults .search-result-item").first.click()
    page.wait_for_function(
        "(ma) => !document.getElementById('fallbackWorkArea').hidden &&"
        " document.getElementById('currentStudentLabel').textContent.includes(ma)",
        arg=ma,
    )


def test_tim_khong_dau_ra_dung_hoc_sinh(trang):
    page, api, loi = trang
    _mo_hoc_sinh(page, "BINH", "HS02")
    assert "Lê Thị Bình" in page.text_content("#currentStudentLabel")
    assert not loi, loi


def test_bo_tick_clb_da_cham_bao_da_xoa_diem_va_moi_the_khop(trang):
    page, api, loi = trang
    _mo_hoc_sinh(page, "binh", "HS02")

    page.locator('#testSelectionGrid .option-row[data-club-id="clb_a"]').click()
    page.locator("#btnSubmitTestSelection").click()
    page.wait_for_function(
        "() => document.getElementById('testSelectionFeedback').textContent.includes('xoá 1 điểm')"
    )
    # CSDL: điểm của HS02 ở clb_a đã đi theo ô tick.
    assert _diem(api) == {("HS01", "clb_a")}

    # Danh sách bên trên cập nhật ngay: HS02 giờ là "0 CLB thi".
    page.wait_for_function(
        "() => { const it = document.querySelector('#studentSearchResults .search-result-item');"
        " return it && it.textContent.includes('0 CLB thi'); }"
    )

    # Thẻ Nhập điểm chỉ còn HS01 — khớp đúng tập điểm lần chạy sẽ dùng.
    page.locator('[data-tab="scoring"]').click()
    page.wait_for_selector(".btn-row-link")
    page.locator(".btn-row-link").first.click()
    page.wait_for_selector(".score-input")
    assert page.locator(".score-input").count() == 1
    assert not loi, loi


def test_sua_lai_tu_dau_bao_so_diem_da_xoa(trang):
    page, api, loi = trang
    _mo_hoc_sinh(page, "ngo van", "HS01")
    nut = page.locator("#btnResetStudentEntry")
    nut.click()
    nut.click()      # xác nhận hai bước
    page.wait_for_function(
        "() => [...document.querySelectorAll('#toastStack .toast')]"
        ".some(t => t.textContent.includes('1 điểm đã chấm'))"
    )
    assert _diem(api) == {("HS02", "clb_a")}
    assert not loi, loi
