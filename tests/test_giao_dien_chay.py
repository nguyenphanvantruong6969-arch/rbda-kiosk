"""Test nút Chạy và thông báo bằng TRÌNH DUYỆT THẬT (Playwright + Chromium).

LỖI 1 — bấm đúp lần chạy đầu tiên là chạy HAI lần.
    `runPipelineFlow` hỏi phần lõi "đã có kết quả chưa" rồi mới khoá nút.
    Lần chạy đầu không cần xác nhận, nên cú bấm thứ hai lọt qua khoảng hở
    đó và gọi `run_pipeline` lần nữa: hai dòng lịch sử cho một lần bấm.

LỖI 2 — trong lúc chạy, màn hình đứng yên ở "Chưa chạy".
    Mọi bước bị đặt về "Chưa chạy" và chỉ vẽ lại khi phần lõi trả về.
    Nhìn như treo; vùng thả tệp và bộ chọn buổi vẫn bấm được giữa chừng.

LỖI 3 — thông báo tự tắt sau 3,6 giây, kể cả lỗi.
    Người dùng chưa đọc xong đã mất; đường dẫn tệp vừa xuất cũng vậy.

LỖI 4 — bước sao lưu và bước hoàn tác không bao giờ hiện ra.
    `renderSteps` bỏ qua mọi bước không có dòng dựng sẵn: sao lưu hỏng
    vẫn báo thành công xanh, và câu trấn an "dữ liệu đã quay về trạng thái
    trước khi chạy" không bao giờ tới mắt người dùng.

Máy nào không có playwright/Chromium thì bỏ qua cả tệp.
"""

import io
import os
import time

import pytest

pytest.importorskip("playwright", reason="chưa cài playwright")
from playwright.sync_api import sync_playwright  # noqa: E402

import api as api_module  # noqa: E402
import browser_host  # noqa: E402

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BO_MAU = os.path.join(GOC, "du_lieu_test", "bo_nhieu_buoi")

CHROMIUM = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
if not os.path.exists(CHROMIUM):
    CHROMIUM = None


def _nap_du_lieu(api):
    for ten in ("NHIEUBUOI_01_danh_sach_CLB.csv",
                "NHIEUBUOI_02_chon_CLB_muon_thi.csv",
                "NHIEUBUOI_03_xep_hang_nguyen_vong.csv"):
        with io.open(os.path.join(BO_MAU, ten), encoding="utf-8-sig") as f:
            assert api.import_csv_auto(f.read())["ok"]


@pytest.fixture
def mo_trang(api):
    """Trả về hàm mở trang; gọi SAU khi đã vá `api` theo ý từng test."""
    if CHROMIUM is None:
        pytest.skip("khong tim thay Chromium")
    _nap_du_lieu(api)
    with sync_playwright() as pw:
        br = pw.chromium.launch(executable_path=CHROMIUM, args=["--no-sandbox"])

        def mo():
            url = browser_host.serve(api, GOC, "index.html", open_browser=False)
            page = br.new_page()
            loi = []
            page.on("pageerror", lambda e: loi.append(str(e)))
            page.goto(url)
            page.wait_for_selector("#chonBuoiChip .buoi-chip")
            return page, loi

        yield mo
        br.close()


def _cham(ham, giay):
    """Bọc một phương thức API cho nó chậm lại — để thấy trạng thái giữa chừng."""
    def boc(*a, **k):
        time.sleep(giay)
        return ham(*a, **k)
    return boc


def _so_lan_chay(api):
    return len(api.get_run_history(50)["data"])


class TestKhongChayHaiLan:

    def test_bam_dup_lan_chay_dau_chi_chay_mot_lan(self, api, mo_trang):
        # Hỏi "đã có kết quả chưa" chậm một chút: đúng khoảng hở cũ.
        api.get_pipeline_run_warning = _cham(api.get_pipeline_run_warning, 0.4)
        page, loi = mo_trang()
        assert _so_lan_chay(api) == 0
        page.dblclick("#btnRun")
        page.wait_for_function(
            "!document.querySelector('#btnRun').disabled "
            "&& document.querySelector('.toast.is-success')", timeout=20000)
        page.wait_for_timeout(500)
        assert _so_lan_chay(api) == 1, "một cú bấm đúp chạy sắp xếp hai lần"
        assert loi == [], loi

    def test_nut_chay_khoa_ngay_khi_bam(self, api, mo_trang):
        api.get_pipeline_run_warning = _cham(api.get_pipeline_run_warning, 0.6)
        page, loi = mo_trang()
        page.click("#btnRun")
        assert page.eval_on_selector("#btnRun", "b => b.disabled") is True
        assert loi == [], loi


class TestDangChayThayDuoc:

    def test_trong_luc_chay_cac_buoc_hien_dang_chay_va_bi_khoa(self, api, mo_trang):
        api.run_pipeline = _cham(api.run_pipeline, 1.5)
        page, loi = mo_trang()
        nhan_truoc = page.locator("#btnRun").inner_text()
        page.click("#btnRun")
        page.wait_for_function(
            "document.querySelector('#stepper .step[data-status=\"running\"]')")
        assert page.locator("#btnRun").inner_text() != nhan_truoc
        assert page.eval_on_selector("#btnRun", "b => b.disabled") is True
        assert page.eval_on_selector("#btnValidate", "b => b.disabled") is True
        assert page.eval_on_selector("#btnImportAll", "b => b.disabled") is True
        assert page.eval_on_selector_all(
            "#chonBuoiChip .buoi-chip", "ns => ns.every(n => n.disabled)") is True
        assert page.get_attribute("#dropZone", "aria-disabled") == "true"

        page.wait_for_function(
            "!document.querySelector('#btnRun').disabled", timeout=20000)
        assert page.locator("#btnRun").inner_text() == nhan_truoc
        assert page.locator('#stepper .step[data-status="running"]').count() == 0, (
            "còn bước treo ở 'đang chạy' sau khi đã xong")
        assert page.eval_on_selector_all(
            "#chonBuoiChip .buoi-chip", "ns => ns.every(n => !n.disabled)") is True
        assert loi == [], loi

    def test_huy_thanh_xac_nhan_thi_nut_chay_mo_lai(self, api, mo_trang):
        assert api.run_pipeline(seed=42)["ok"]      # có kết quả cũ -> phải xác nhận
        page, loi = mo_trang()
        page.click("#btnRun")
        page.wait_for_selector("#runConfirmBar")
        assert page.eval_on_selector("#btnRun", "b => b.disabled") is True
        page.click("#runConfirmBar .btn-ghost")
        assert page.eval_on_selector("#btnRun", "b => b.disabled") is False
        # Đổi buổi cũng gỡ thanh xác nhận -> nút Chạy cũng phải mở lại.
        page.click("#btnRun")
        page.wait_for_selector("#runConfirmBar")
        page.locator("#chonBuoiChip .buoi-chip").first.click()
        assert page.locator("#runConfirmBar").count() == 0
        assert page.eval_on_selector("#btnRun", "b => b.disabled") is False
        assert loi == [], loi


class TestThongBaoDocDuoc:

    def test_loi_o_lai_toi_khi_bam_dong(self, api, mo_trang):
        page, loi = mo_trang()
        # Bỏ chọn hết buổi rồi bấm Chạy -> một thông báo lỗi.
        for n in page.locator("#chonBuoiChip .buoi-chip").all():
            n.click()
        page.click("#btnRun")
        page.wait_for_selector(".toast.is-error")
        page.wait_for_timeout(5000)       # quá 3,6 giây cũ
        assert page.locator(".toast.is-error").count() == 1, "lỗi tự tắt trước khi đọc xong"
        assert page.get_attribute(".toast.is-error", "role") == "alert"
        page.click(".toast.is-error .toast-close")
        page.wait_for_function("!document.querySelector('.toast.is-error')")
        assert loi == [], loi

    def test_thong_bao_thanh_cong_van_tu_tat(self, api, mo_trang):
        page, loi = mo_trang()
        page.evaluate("() => document.querySelector('#toastStack').innerHTML = ''")
        page.click("#btnRun")
        page.wait_for_selector(".toast.is-success", timeout=20000)
        page.wait_for_function("!document.querySelector('.toast')", timeout=12000)
        assert loi == [], loi

    def test_vung_thong_bao_duoc_doc_len(self, api, mo_trang):
        page, _ = mo_trang()
        assert page.get_attribute("#toastStack", "aria-live") == "polite"

    def test_khong_de_qua_bon_thong_bao(self, api, mo_trang):
        page, loi = mo_trang()
        for n in page.locator("#chonBuoiChip .buoi-chip").all():
            n.click()
        for _ in range(6):
            page.click("#btnRun")
        page.wait_for_timeout(400)
        assert page.locator(".toast:not(.is-leaving)").count() <= 4
        assert loi == [], loi

    def test_nhac_ve_lai_con_hien_khi_che_do_con_bat(self, api, mo_trang):
        assert api.run_pipeline(seed=42)["ok"]      # có khoá -> có nút vẽ lại
        page, loi = mo_trang()
        page.wait_for_selector("#stbLockLine .redraw-toggle")
        page.click("#stbLockLine .redraw-toggle")
        page.wait_for_selector(".toast.is-warn")
        page.wait_for_timeout(5000)
        assert page.locator(".toast.is-warn").count() == 1
        # Bấm lần nữa = tắt chế độ -> lời nhắc phải biến mất theo.
        page.click("#stbLockLine .redraw-toggle")
        page.wait_for_function("!document.querySelector('.toast.is-warn:not(.is-leaving)')")
        assert loi == [], loi


class TestBuocSaoLuuVaHoanTac:

    def test_sao_luu_hong_thi_khong_bao_thanh_cong_xanh(self, api, mo_trang):
        def hong():
            raise OSError("dia day")
        api._backup_db = hong
        page, loi = mo_trang()
        page.click("#btnRun")
        page.wait_for_selector(".toast.is-warn", timeout=20000)
        assert page.locator(".toast.is-success").count() == 0
        assert "dia day" in page.locator(".toast.is-warn").inner_text()
        assert page.get_attribute('#stepper .step[data-step="backup"]', "data-status") == "error"
        assert loi == [], loi

    def test_hoan_tac_hien_ra_khi_chay_hong(self, api, mo_trang, monkeypatch):
        def hong(*a, **k):
            raise RuntimeError("hong giua chung")
        monkeypatch.setattr(api_module, "generate_stb_lottery", hong)
        page, loi = mo_trang()
        page.click("#btnRun")
        page.wait_for_selector('#stepper .step[data-step="rollback"]', timeout=20000)
        dong = page.locator('#stepper .step[data-step="rollback"]')
        assert dong.get_attribute("data-status") == "done"
        assert dong.locator(".step-title").inner_text().strip() not in ("", "step_title_rollback")
        assert page.locator('#stepper .step[data-step="unknown"]').count() == 1

        # Chạy lại (không hỏng) thì dòng thêm phải biến mất.
        monkeypatch.undo()
        page.click("#btnRun")
        page.wait_for_selector(".toast.is-success", timeout=20000)
        assert page.locator('#stepper .step[data-step="rollback"]').count() == 0
        assert loi == [], loi
