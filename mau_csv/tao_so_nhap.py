"""Sinh các tệp Sổ nhập CLB (.xlsx) — mẫu trống và hai sổ ví dụ.

Chạy lại mỗi khi sửa `so_nhap.py` hoặc các bộ CSV ví dụ, để sổ và CSV không
lệch nhau:

    ./.venv/bin/python mau_csv/tao_so_nhap.py

Tạo ra:
    mau_csv/SO_NHAP_CLB.xlsx                       mẫu trống, phát cho trường
    mau_csv/vi_du_day_du/SO_NHAP_CLB_vi_du.xlsx    3 buổi · 9 CLB · 24 HS
    mau_csv/vi_du_ca_tuan/SO_NHAP_CLB_vi_du.xlsx   6 buổi · 18 CLB · 60 HS

Hai sổ ví dụ sinh THẲNG từ bộ ba CSV cùng thư mục, nên nạp sổ hay nạp ba
CSV đều ra cùng một CSDL — `tests/test_so_nhap.py` canh điều đó.
"""

import csv
import os
import sys

THU_MUC = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(THU_MUC))

import so_nhap  # noqa: E402

TEN_MAU = "SO_NHAP_CLB.xlsx"
TEN_VI_DU = "SO_NHAP_CLB_vi_du.xlsx"
BO_VI_DU = ("vi_du_day_du", "vi_du_ca_tuan")


def _doc(duong_dan):
    with open(duong_dan, encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def tao_vi_du(ten_bo: str) -> str:
    goc = os.path.join(THU_MUC, ten_bo)
    clubs, students, ngoai_nv = so_nhap.tu_csv(
        _doc(os.path.join(goc, "01_danh_sach_CLB.csv")),
        _doc(os.path.join(goc, "02_chon_CLB_muon_thi.csv")),
        _doc(os.path.join(goc, "03_xep_hang_nguyen_vong.csv")),
    )
    if ngoai_nv:
        raise SystemExit(f"{ten_bo}: thi CLB không có trong nguyện vọng: {ngoai_nv}")
    ra = os.path.join(goc, TEN_VI_DU)
    so_nhap.ghi_so_nhap(ra, clubs, students)
    return ra


def tao_mau_trong() -> str:
    ra = os.path.join(THU_MUC, TEN_MAU)
    so_nhap.ghi_so_nhap(ra)
    return ra


if __name__ == "__main__":
    print("da tao", os.path.relpath(tao_mau_trong(), os.path.dirname(THU_MUC)))
    for bo in BO_VI_DU:
        print("da tao", os.path.relpath(tao_vi_du(bo), os.path.dirname(THU_MUC)))
