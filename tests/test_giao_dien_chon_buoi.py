"""Test bộ chọn buổi bằng TRÌNH DUYỆT THẬT (Playwright + Chromium).

Ba lỗi dưới đây không tầng Python nào bắt được, vì chúng nằm ở khoảng cách
giữa CÂU PHẦN MỀM HỨA và VIỆC PHẦN MỀM LÀM — mà câu hứa chỉ tồn tại trong
trình duyệt.

LỖI 1 — thanh xác nhận hứa một phạm vi, chạy một phạm vi khác.
    `runPipelineFlow` dựng câu hứa từ `buoiGuiDi()`, rồi nút Xác nhận gọi
    `executeRun`, mà `executeRun` GỌI LẠI `buoiGuiDi()` lúc gửi. Đổi lựa
    chọn ở giữa hai thời điểm đó thì hai bên nói hai chuyện khác nhau:
    chọn thứ Năm → bấm Chạy → bấm Chọn tất cả → bấm Xác nhận = GHI ĐÈ CẢ
    TUẦN, trong khi hộp thoại vừa hứa các buổi khác giữ nguyên. Hứa sai về
    phạm vi của một việc không hoàn tác được là đúng thứ tính năng này sinh
    ra để tránh.

LỖI 2 — không chọn buổi nào vẫn hiện hộp xác nhận trống.
    `buoiGuiDi()` trả `[]`, mà `[]` là TRUTHY trong JavaScript, nên nhánh
    "chạy một phần" chạy với danh sách rỗng và `{buoi}` thành chuỗi trắng.

LỖI 3 — đổi ngôn ngữ xoá mất dòng nhắc.
    `#chonBuoiNhac` từng mang cả `data-i18n` lẫn nội dung do JavaScript ghi,
    nên `applyStaticText()` ghi đè câu động bằng câu tĩnh và dòng nêu ĐÍCH
    DANH buổi nào được giữ nguyên biến mất, trong khi dải thẻ vẫn hiện một
    lựa chọn một phần.

Máy nào không có playwright/Chromium thì bỏ qua cả tệp.
"""

import io
import os

import pytest

pytest.importorskip("playwright", reason="chưa cài playwright")
from playwright.sync_api import sync_playwright  # noqa: E402

import browser_host  # noqa: E402

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BO_MAU = os.path.join(GOC, "du_lieu_test", "bo_nhieu_buoi")

CHROMIUM = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
if not os.path.exists(CHROMIUM):
    CHROMIUM = None


@pytest.fixture
def trang(api):
    if CHROMIUM is None:
        pytest.skip("khong tim thay Chromium")
    for ten in ("NHIEUBUOI_01_danh_sach_CLB.csv",
                "NHIEUBUOI_02_chon_CLB_muon_thi.csv",
                "NHIEUBUOI_03_xep_hang_nguyen_vong.csv"):
        with io.open(os.path.join(BO_MAU, ten), encoding="utf-8-sig") as f:
            assert api.import_csv_auto(f.read())["ok"]
    api.run_pipeline(seed=42)     # có kết quả cũ -> bấm Chạy sẽ hỏi xác nhận

    url = browser_host.serve(api, GOC, "index.html", open_browser=False)
    with sync_playwright() as pw:
        br = pw.chromium.launch(executable_path=CHROMIUM, args=["--no-sandbox"])
        page = br.new_page()
        loi = []
        page.on("pageerror", lambda e: loi.append(str(e)))
        page.goto(url)
        page.wait_for_selector("#chonBuoiChip .buoi-chip")
        yield page, loi, api
        br.close()


def _the(page, nhan):
    return page.locator("#chonBuoiChip .buoi-chip", has_text=nhan).first


class TestThanhXacNhanKhongHuaSai:

    def test_doi_lua_chon_thi_thanh_xac_nhan_bi_go(self, trang):
        page, loi, _api = trang
        # Bỏ chọn hai buổi -> còn một lựa chọn một phần
        _the(page, "thu_6").click()
        _the(page, "thu_5").click()
        page.click("#btnRun")
        page.wait_for_selector("#runConfirmBar")

        # Đổi ý: chọn hết. Câu hứa cũ lập tức sai.
        page.click("#btnChonTatCaBuoi")
        assert page.locator("#runConfirmBar").count() == 0, (
            "thanh xác nhận còn treo với câu hứa đã sai"
        )
        assert loi == []

    def test_bam_the_cung_go_thanh_xac_nhan(self, trang):
        page, loi, _api = trang
        _the(page, "thu_6").click()
        page.click("#btnRun")
        page.wait_for_selector("#runConfirmBar")
        _the(page, "thu_2").click()
        assert page.locator("#runConfirmBar").count() == 0
        assert loi == []

    def test_cau_hua_neu_dich_danh_buoi_se_ghi_de(self, trang):
        page, loi, _api = trang
        _the(page, "thu_6").click()
        page.click("#btnRun")
        page.wait_for_selector("#runConfirmBar")
        cau = page.locator("#runConfirmBar span").inner_text()
        assert "thu_2" in cau and "thu_6" not in cau, cau
        assert loi == []


class TestKhongChonBuoiNao:

    def test_bo_chon_het_thi_bao_ngay_khong_dung_thanh(self, trang):
        page, loi, _api = trang
        for nhan in ("thu_2", "thu_3", "thu_4", "thu_5", "thu_6"):
            _the(page, nhan).click()
        page.click("#btnRun")
        page.wait_for_timeout(300)
        assert page.locator("#runConfirmBar").count() == 0, (
            "dựng hộp xác nhận cho một lựa chọn rỗng"
        )
        assert loi == []


class TestDoiNgonNguGiuDongNhac:

    def test_dong_nhac_van_neu_dung_buoi_sau_khi_doi_ngon_ngu(self, trang):
        page, loi, _api = trang
        _the(page, "thu_6").click()
        truoc = page.locator("#chonBuoiNhac").inner_text()
        assert "thu_6" in truoc, truoc

        page.locator("#btnLangToggle").click()
        page.wait_for_function("document.documentElement.lang === 'en'")
        page.wait_for_timeout(200)

        sau = page.locator("#chonBuoiNhac").inner_text()
        assert sau != truoc, "không đổi ngôn ngữ thì test này không canh được gì"
        # Nhãn buổi là mã thô ở cả hai thứ tiếng; CÂU quanh nó mới đổi.
        assert "thu_6" in sau, sau
        assert loi == []
