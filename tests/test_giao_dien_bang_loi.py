"""Bảng thông báo lỗi SINH TỰ ĐỘNG (i18n_loi.js) được nạp thật trong trình duyệt.

`tests/test_i18n_sync.py` chứng minh tệp sinh ra khớp nguồn. Tệp này chứng
minh phần còn lại: cả hai trang (màn chính và màn phục hồi) NẠP được nó, và
`I18N.translateError` dịch ra đúng câu của `i18n_errors.py`, cả hai ngôn ngữ.
Quên thẻ <script> hay nạp sai thứ tự thì mọi thông báo lỗi hiện ra thành mã
thô — thứ không test Python nào nhìn thấy.

Máy nào không có playwright/Chromium thì bỏ qua cả tệp.
"""

import os

import pytest

pytest.importorskip("playwright", reason="chưa cài playwright")
from playwright.sync_api import sync_playwright  # noqa: E402

import browser_host  # noqa: E402
from i18n_errors import MESSAGES, format_message  # noqa: E402

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROMIUM = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
if not os.path.exists(CHROMIUM):
    CHROMIUM = None

MAU = [
    ("hat_giong_da_khoa", {"cu": 42, "moi": 43}),
    ("health_thi_qua_tran_buoi", {"n": 1, "buoi": "thu_2", "tran": 5,
                                  "sample": "HS1 (6)"}),
    ("health_vi_pham_mo_coi_clb", {"bang": "preferences", "n": 2,
                                   "sample": "a, b"}),
    ("error_reading_last_run", {"detail": "x"}),
    ("recovery_fresh_created", {}),
]


@pytest.mark.parametrize("trang", ["index.html", "recovery.html"])
def test_trang_dich_dung_ma_loi_ca_hai_ngon_ngu(api, trang):
    if CHROMIUM is None:
        pytest.skip("khong tim thay Chromium")
    for ma, _ in MAU:
        assert ma in MESSAGES, ma
    url = browser_host.serve(api, GOC, trang, open_browser=False)
    with sync_playwright() as pw:
        br = pw.chromium.launch(executable_path=CHROMIUM, args=["--no-sandbox"])
        page = br.new_page()
        page.goto(url)
        page.wait_for_function("window.I18N && window.I18N_ERROR_MESSAGES")
        for lang in ("vi", "en"):
            page.evaluate("l => I18N.setLang(l)", lang)
            for ma, params in MAU:
                tren_trang = page.evaluate(
                    "([c, p]) => I18N.translateError({code: c, params: p})",
                    [ma, params])
                assert tren_trang == format_message(ma, params, lang), (trang, lang, ma)
        br.close()
