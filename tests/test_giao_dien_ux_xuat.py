"""Người dùng làm được việc mình định làm — đo bằng TRÌNH DUYỆT THẬT.

Mỗi test là MỘT ý định của người dùng, đi đúng đường họ sẽ đi trên màn
hình (xem kế hoạch "UI review"):

  1. Đang mở một em ở thẻ 03 -> xuất ngay em đó.
  2. Trường nhiều buổi -> chọn được cả em KHÔNG được xếp chỗ nào.
  3. Mục Xuất ở đầu thẻ 02 -> tới được danh sách chọn học sinh, xuất một lần.
  4. Thẻ 04 -> biết mình đang đánh dấu bao nhiêu em.
  5. Sau khi xuất -> có nút mở thư mục.
  6. Dải "kết quả có thể đã cũ" -> một nút đưa tới chỗ chạy lại.
  7. Thẻ 03 -> không mất thay đổi chưa lưu khi bấm sang em khác / thẻ khác.
"""

import csv
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
def api_hai_buoi(api):
    """Hai buổi, 6 em. HS05 và HS06 không được xếp chỗ nào cả tuần."""
    api.create_or_update_club("clb_a", "CLB Tin học", 2, 0, "", "thu_2")
    api.create_or_update_club("clb_c", "CLB Nấu ăn", 2, 0, "", "thu_4")
    ten = ["Ngô Văn An", "Lê Thị Bình", "Trần Chi", "Phạm Dũng", "Đỗ Khoa", "Vũ Hà"]
    for i, t in enumerate(ten, 1):
        sid = "HS%02d" % i
        api.create_student_if_missing(sid, t)
        api.submit_test_selection(sid, ["clb_a", "clb_c"])
        api.submit_preferences(sid, ["clb_a", "clb_c"])
    diem = [{"student_id": "HS%02d" % i, "score": 10 - i} for i in range(1, 7)]
    api.submit_club_scores("clb_a", diem)
    api.submit_club_scores("clb_c", diem)
    assert api.run_pipeline(42)["ok"]
    return api


@pytest.fixture
def trang(api_hai_buoi, monkeypatch):
    if CHROMIUM is None:
        pytest.skip("khong tim thay Chromium")
    mo = []
    monkeypatch.setattr(type(api_hai_buoi), "mo_thu_muc",
                        lambda self, p: (mo.append(p), {"ok": True, "data": {"dir": p}, "errors": []})[1])
    url = browser_host.serve(api_hai_buoi, GOC, "index.html", open_browser=False)
    with sync_playwright() as pw:
        br = pw.chromium.launch(executable_path=CHROMIUM, args=["--no-sandbox"])
        page = br.new_page(locale="vi-VN", viewport={"width": 1280, "height": 900})
        loi = []
        page.on("pageerror", lambda e: loi.append(str(e)))
        page.goto(url)
        page.wait_for_selector("#dropZone")
        yield page, api_hai_buoi, loi, mo
        br.close()


def tai_ve():
    return os.environ["RBDA_THU_MUC_TAI_VE"]


def ma_trong(path):
    with open(path, encoding="utf-8-sig", newline="") as f:
        return {r[0] for r in list(csv.reader(f))[1:] if r}


def toast_co(page, chu):
    page.wait_for_function(
        "(c) => [...document.querySelectorAll('#toastStack .toast')].some(t => t.textContent.includes(c))",
        arg=chu)


def mo_the(page, ten):
    page.locator('[data-tab="%s"]' % ten).click()


def mo_hs_the_03(page, ma):
    page.fill("#studentSearchInput", ma)
    page.wait_for_function(
        "(m) => { const i = document.querySelectorAll('#studentSearchResults .search-result-item');"
        " return i.length === 1 && i[0].textContent.includes(m); }", arg=ma)
    page.locator("#studentSearchResults .search-result-item").first.click()
    page.wait_for_function(
        "(m) => document.getElementById('currentStudentLabel').textContent.includes(m)", arg=ma)


# ------------------------------------------------------------------ #

def test_1_xuat_em_dang_mo_o_the_03_va_5_mo_thu_muc(trang):
    page, api, loi, mo = trang
    mo_the(page, "fallback")
    mo_hs_the_03(page, "HS03")
    page.click("#btnXuatEmNay")
    page.wait_for_function(
        "() => document.getElementById('fallbackXuatFeedback').textContent.includes('Hồ sơ 1 em')")
    p = os.path.join(tai_ve(), "hoc_sinh_HS03.csv")
    assert ma_trong(p) == {"HS03"}
    page.click("#fallbackXuatFeedback .nut-mo-thu-muc")
    page.wait_for_timeout(300)
    assert mo == [p]
    assert not loi, loi


def test_2_3_chon_ca_em_khong_duoc_xep_va_xuat_tu_muc_xuat(trang):
    page, api, loi, mo = trang
    mo_the(page, "results")
    page.wait_for_selector("#resultsTableBody .chon-hs")
    hien = lambda: set(page.eval_on_selector_all(
        "#resultsTableBody .chon-hs", "e => e.map(x => x.dataset.studentId)"))
    assert not ({"HS05", "HS06"} & hien())      # mặc định: chỉ chỗ đã xếp
    assert page.is_disabled("#xuatHocSinh")

    # Từ mục Xuất: nút đưa tới danh sách, kể cả khi danh sách đang thu gọn.
    page.locator("#dsXepPanel .panel-toggle").click()
    assert page.locator("#dsXepPanel .panel-toggle").get_attribute("aria-expanded") == "false"
    page.click("#btnChonHocSinh")
    page.wait_for_function(
        "() => document.querySelector('#dsXepPanel .panel-toggle').getAttribute('aria-expanded') === 'true'")
    page.wait_for_function("() => document.activeElement.id === 'resultsSearch'")

    page.check("#hienCaEmChuaXep")
    page.wait_for_function(
        "() => [...document.querySelectorAll('#resultsTableBody .chon-hs')]"
        ".some(x => x.dataset.studentId === 'HS06')")
    assert {"HS05", "HS06"} <= hien()
    # Mỗi em chưa xếp chỉ MỘT dòng, không lặp theo buổi.
    assert page.eval_on_selector_all(
        '#resultsTableBody .chon-hs[data-student-id="HS06"]', "e => e.length") == 1
    # ...và dòng đó nói "Cả tuần", không nói một buổi cụ thể.
    buoi = page.eval_on_selector(
        '#resultsTableBody .chon-hs[data-student-id="HS06"]',
        "e => e.closest('tr').querySelector('.cot-buoi').textContent")
    assert buoi == "Cả tuần"

    page.locator('#resultsTableBody .chon-hs[data-student-id="HS06"]').check()
    page.locator('#resultsTableBody .chon-hs[data-student-id="HS01"]').first.check()
    # Chọn em đầu tiên thì ô "Hồ sơ học sinh đã chọn" tự bật.
    assert page.is_enabled("#xuatHocSinh") and page.is_checked("#xuatHocSinh")
    assert "2 em" in page.text_content("#xuatHocSinhDem")

    page.uncheck("#xuatKetQua")
    page.click("#btnXuatTuyChon")
    page.wait_for_function(
        "() => document.getElementById('xuatFeedback').textContent.includes('Hồ sơ 2 em')")
    assert ma_trong(os.path.join(tai_ve(), "hoc_sinh_da_chon_2_em.csv")) == {"HS01", "HS06"}
    assert page.locator("#xuatFeedback .nut-mo-thu-muc").count() == 1
    assert not loi, loi


def test_4_the_04_tieu_de_va_dem_danh_dau(trang):
    page, api, loi, mo = trang
    mo_the(page, "admin")
    page.wait_for_selector(".admin-row-checkbox")
    assert "xuất hồ sơ" in page.text_content('[data-i18n="admin_reserve_assign_title"]')
    assert page.text_content("#adminDemDanhDau") == ""
    page.locator('.admin-row-checkbox[data-student-id="HS02"]').check()
    assert page.text_content("#adminDemDanhDau") == "Đã đánh dấu 1 em"
    page.check("#adminChonTatCa")
    assert page.text_content("#adminDemDanhDau") == "Đã đánh dấu 6 em"
    page.click("#btnAdminXuatHs")
    page.wait_for_function(
        "() => document.getElementById('adminXuatFeedback').textContent.includes('Hồ sơ 6 em')")
    assert not loi, loi


def test_6_dai_ket_qua_cu_co_nut_toi_cho_chay_lai(trang):
    page, api, loi, mo = trang
    api.submit_club_scores("clb_a", [{"student_id": "HS06", "score": 10}])
    mo_the(page, "results")
    page.wait_for_selector("#ketQuaCuBanner", state="visible")
    page.click("#btnDiToiChay")
    page.wait_for_selector("#view-pipeline.is-active")
    assert not loi, loi


def test_7_thay_doi_chua_luu_khong_bi_mat_im_lang(trang):
    page, api, loi, mo = trang
    mo_the(page, "fallback")
    mo_hs_the_03(page, "HS01")
    assert page.is_hidden("#chuaLuuThi") and page.is_hidden("#chuaLuuNv")

    # Bỏ tick clb_c -> hiện "Chưa lưu".
    page.locator('#testSelectionGrid .option-row[data-club-id="clb_c"]').click()
    assert page.is_visible("#chuaLuuThi")
    # Tick lại -> đúng như đã lưu -> dấu biến mất.
    page.locator('#testSelectionGrid .option-row[data-club-id="clb_c"]').click()
    assert page.is_hidden("#chuaLuuThi")

    page.locator('#testSelectionGrid .option-row[data-club-id="clb_c"]').click()
    # Bấm sang em khác lần 1: KHÔNG đi, cảnh báo.
    page.fill("#studentSearchInput", "HS02")
    page.wait_for_function(
        "() => { const i = document.querySelectorAll('#studentSearchResults .search-result-item');"
        " return i.length === 1 && i[0].textContent.includes('HS02'); }")
    page.locator("#studentSearchResults .search-result-item").first.click()
    toast_co(page, "HS01 còn thay đổi chưa lưu")
    assert "HS01" in page.text_content("#currentStudentLabel")
    # Bấm sang THẺ khác ngay sau đó KHÔNG được tính là xác nhận: xác nhận
    # phải là bấm lại đúng chỗ vừa bấm.
    mo_the(page, "results")
    page.wait_for_timeout(300)
    assert page.is_visible("#view-fallback")
    assert "HS01" in page.text_content("#currentStudentLabel")
    # Bấm lại đúng em HS02 (lần 2, trong 4 giây) -> bỏ thay đổi, sang em đó.
    page.locator("#studentSearchResults .search-result-item").first.click()
    page.wait_for_timeout(100)
    page.locator("#studentSearchResults .search-result-item").first.click()
    page.wait_for_function(
        "() => document.getElementById('currentStudentLabel').textContent.includes('HS02')")
    conn = sqlite3.connect(api.db_path)
    ticks = conn.execute(
        "SELECT club_id FROM club_test_selection WHERE student_id='HS01' ORDER BY 1").fetchall()
    conn.close()
    assert ticks == [("clb_a",), ("clb_c",)]

    # Đổi nguyện vọng rồi LƯU -> đi ngay, không cảnh báo.
    page.click("#btnClearRanking")
    assert page.is_visible("#chuaLuuNv")
    page.locator('#rankingSourceGrid .option-row[data-club-id="clb_c"]').click()
    page.click("#btnSubmitPreferences")
    page.wait_for_function("() => document.getElementById('chuaLuuNv').hidden")
    mo_the(page, "results")
    page.wait_for_selector("#view-results.is-active")

    # Xuất em đang có thay đổi chưa lưu -> nhắc lưu trước, không xuất.
    mo_the(page, "fallback")
    mo_hs_the_03(page, "HS03")
    page.locator('#testSelectionGrid .option-row[data-club-id="clb_a"]').click()
    page.click("#btnXuatEmNay")
    toast_co(page, "bấm Lưu trước")
    assert not os.path.exists(os.path.join(tai_ve(), "hoc_sinh_HS03.csv"))
    assert not loi, loi


def test_tieng_anh_du_nhan_moi(trang):
    page, api, loi, mo = trang
    mo_the(page, "results")
    page.wait_for_selector("#resultsTableBody .chon-hs")
    page.click("#btnLangToggle")
    page.wait_for_function(
        "() => document.getElementById('btnChonHocSinh').textContent === 'Choose students…'")
    assert page.text_content('[data-i18n="xuat_opt_hoc_sinh"]') == "Selected student profiles"
    assert page.text_content("#xuatHocSinhDem") == "(no students selected)"
    assert page.text_content('[data-i18n="hien_ca_em_chua_xep"]') == "Also show students with no place"
    assert not loi, loi
