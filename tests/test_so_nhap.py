# -*- coding: utf-8 -*-
"""Canh Sổ nhập CLB — một tệp Excel thay cho ba tệp nạp (so_nhap.py).

Điều quan trọng nhất: nạp SỔ và nạp BỘ BA CSV cũ phải ra CÙNG MỘT CSDL và
CÙNG MỘT KẾT QUẢ phân bổ. Sổ chỉ là lớp vỏ dễ dùng hơn — nó không được đổi
dù một em học sinh vào CLB nào.

Còn lại: sổ lỗi thì KHÔNG ghi gì, lỗi chỉ đúng sheet và dòng; tên CLB và mã
CLB đều dùng được trong ô NV; chữ `thi` nghĩa là đã thi, chấm sau.
"""

import base64
import csv
import io
import os
import sqlite3

import openpyxl
import pytest

import so_nhap

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAU = os.path.join(GOC, "mau_csv")
TEP_CSV = ["01_danh_sach_CLB.csv", "02_chon_CLB_muon_thi.csv",
           "03_xep_hang_nguyen_vong.csv"]


def b64_tep(duong_dan) -> str:
    with open(duong_dan, "rb") as f:
        return base64.b64encode(f.read()).decode()


def b64_sach(clubs, students, **kw) -> str:
    buf = io.BytesIO()
    so_nhap.ghi_so_nhap(buf, clubs, students, **kw)
    return base64.b64encode(buf.getvalue()).decode()


def b64_wb(wb) -> str:
    buf = io.BytesIO()
    wb.save(buf)
    return base64.b64encode(buf.getvalue()).decode()


def chup_csdl(api) -> dict:
    """Mọi bảng ĐẦU VÀO, sắp cố định — để so hai CSDL."""
    con = sqlite3.connect(api.db_path)
    try:
        return {
            "clubs": con.execute(
                "SELECT club_id, name, capacity, reserve_capacity, "
                "COALESCE(reserve_group,''), COALESCE(buoi,'') FROM clubs ORDER BY 1").fetchall(),
            "students": con.execute(
                "SELECT student_id, name, COALESCE(reserve_group,'') FROM students "
                "ORDER BY 1").fetchall(),
            "preferences": con.execute(
                "SELECT student_id, club_id, rank FROM preferences ORDER BY 1, 3").fetchall(),
            "tick": con.execute(
                "SELECT student_id, club_id FROM club_test_selection ORDER BY 1, 2").fetchall(),
            "scores": con.execute(
                "SELECT student_id, club_id, score FROM club_scores ORDER BY 1, 2").fetchall(),
        }
    finally:
        con.close()


def chup_ket_qua(api) -> list:
    con = sqlite3.connect(api.db_path)
    try:
        return con.execute(
            "SELECT * FROM match_results ORDER BY 1, 2").fetchall()
    finally:
        con.close()


CLB = [
    {"club_id": "", "name": "CLB Tin học", "capacity": 3, "reserve_capacity": 0,
     "reserve_group": "", "buoi": "thu_2"},
    {"club_id": "", "name": "CLB Bóng rổ", "capacity": 3, "reserve_capacity": 1,
     "reserve_group": "chinh_sach", "buoi": "thu_2"},
    {"club_id": "clb_robot", "name": "CLB Robotics", "capacity": 2, "reserve_capacity": 0,
     "reserve_group": "", "buoi": "thu_4"},
]


def hs(sid, *nv, nhom=""):
    """hs('HS1', ('CLB Tin học', 9), 'CLB Bóng rổ') — tuple là (CLB, điểm)."""
    ds = []
    for x in nv:
        ten, diem = (x if isinstance(x, tuple) else (x, None))
        ds.append({"club_id": ten, "thi": diem is not None,
                   "diem": "" if diem in (None, "thi") else diem})
    return {"student_id": sid, "name": "Em " + sid, "reserve_group": nhom, "nv": ds}


# ------------------------------------------------------------------ #
# 1. SỔ VÀ BỘ BA CSV RA CÙNG MỘT CSDL, CÙNG MỘT KẾT QUẢ
# ------------------------------------------------------------------ #

@pytest.mark.parametrize("bo", ["vi_du_day_du", "vi_du_ca_tuan"])
def test_so_vi_du_ra_dung_csdl_va_ket_qua_nhu_bo_ba_csv(api_factory, bo):
    api_csv = api_factory()
    for ten in TEP_CSV:
        with io.open(os.path.join(MAU, bo, ten), encoding="utf-8-sig") as f:
            assert api_csv.import_csv_auto(f.read())["ok"]

    api_so = api_factory()
    kq = api_so.import_so_nhap(b64_tep(os.path.join(MAU, bo, "SO_NHAP_CLB_vi_du.xlsx")))
    assert kq["ok"], kq
    assert kq["data"]["warnings"] == [], kq["data"]["warnings"]

    assert chup_csdl(api_so) == chup_csdl(api_csv)

    assert api_csv.run_pipeline(seed=42)["ok"]
    assert api_so.run_pipeline(seed=42)["ok"]
    assert chup_ket_qua(api_so) == chup_ket_qua(api_csv)


DLT = os.path.join(GOC, "du_lieu_test")


@pytest.mark.parametrize("thu_muc,tien_to,duoi,ten_so", [
    (os.path.join(DLT, "vi_du_huong_dan"), "VIDU_", ".csv", "SO_NHAP_VIDU.xlsx"),
    (os.path.join(DLT, "bo_sach"), "SACH_", ".csv", "SO_NHAP_SACH.xlsx"),
    (DLT, "TEST_", ".xlsx", "SO_NHAP_TEST.xlsx"),
])
def test_so_du_lieu_test_ra_dung_csdl_nhu_bo_cu(api_factory, thu_muc, tien_to, duoi, ten_so):
    """Các bộ chạy thử trong du_lieu_test/ có bản sổ nhập: nạp sổ phải ra
    đúng CSDL như nạp bộ ba tệp cũ (mau_csv/tao_so_nhap.py sinh sổ từ đó)."""
    api_cu = api_factory()
    for t in TEP_CSV:
        p = os.path.join(thu_muc, tien_to + t.replace(".csv", duoi))
        if duoi == ".csv":
            with io.open(p, encoding="utf-8-sig") as f:
                text = f.read()
        else:
            text = api_cu.xlsx_to_csv_text(b64_tep(p))["data"]["csv_text"]
        assert api_cu.import_csv_auto(text)["ok"]
    api_so = api_factory()
    kq = api_so.import_so_nhap(b64_tep(os.path.join(thu_muc, ten_so)))
    assert kq["ok"], kq
    assert chup_csdl(api_so) == chup_csdl(api_cu)


def test_so_co_loi_co_y_bao_dung_nam_loi_va_khong_ghi_gi(api):
    import importlib.util
    spec = importlib.util.spec_from_file_location(
        "tao_so_nhap", os.path.join(MAU, "tao_so_nhap.py"))
    tsn = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(tsn)

    kq = api.import_so_nhap(b64_tep(os.path.join(DLT, "SO_NHAP_CO_LOI_CO_Y.xlsx")))
    assert not kq["ok"]
    assert sorted(e["code"] for e in kq["errors"]) == sorted(x[3] for x in tsn.LOI_CO_Y)
    assert chup_csdl(api)["clubs"] == []


def test_so_vi_du_khop_bo_csv_cung_thu_muc():
    """Sổ ví dụ sinh từ CSV (mau_csv/tao_so_nhap.py). Ai sửa CSV mà quên
    sinh lại sổ thì test này đỏ."""
    for bo in ("vi_du_day_du", "vi_du_ca_tuan"):
        def doc(ten):
            with io.open(os.path.join(MAU, bo, ten), encoding="utf-8-sig", newline="") as f:
                return list(csv.DictReader(f))
        clubs, students, _ = so_nhap.tu_csv(*(doc(t) for t in TEP_CSV))
        wb = openpyxl.load_workbook(os.path.join(MAU, bo, "SO_NHAP_CLB_vi_du.xlsx"),
                                    read_only=True)
        du = so_nhap.doc_so_nhap(wb)
        assert du["loi"] == []
        assert [c["club_id"] for c in du["clubs"]] == [c["club_id"] for c in clubs]
        assert [(s["student_id"], [x["club_id"] for x in s["nv"]]) for s in du["students"]] \
            == [(s["student_id"], [x["club_id"] for x in s["nv"]]) for s in students]


def test_mau_trong_doc_duoc_va_dung_bo_cuc():
    wb = openpyxl.load_workbook(os.path.join(MAU, "SO_NHAP_CLB.xlsx"))
    assert wb.sheetnames[:2] == [so_nhap.SHEET_CLB, so_nhap.SHEET_HS]
    assert so_nhap.SHEET_HD in wb.sheetnames
    clb, hs_ = wb[so_nhap.SHEET_CLB], wb[so_nhap.SHEET_HS]
    assert [c.value for c in clb[1]] == so_nhap.COT_CLB
    tieu_de = [c.value for c in hs_[1]]
    assert tieu_de[:5] == ["Mã HS", "Họ tên", "Nhóm ưu tiên", "NV1", "Điểm 1"]
    assert tieu_de.count("NV%d" % so_nhap.SO_NV_MAC_DINH) == 1
    # Ô NV là danh sách thả xuống lấy tên CLB từ sheet 1.
    nguon = [dv.formula1 for dv in hs_.data_validations.dataValidation if dv.type == "list"]
    assert any(so_nhap.SHEET_CLB in f for f in nguon), nguon
    assert any(dv.type == "list" for dv in clb.data_validations.dataValidation)


# ------------------------------------------------------------------ #
# 2. ĐỌC Ô: tên hay mã, buổi, điểm, chữ "thi"
# ------------------------------------------------------------------ #

def test_nv_nhan_ca_ten_lan_ma_clb_va_khong_phan_biet_dau(api):
    students = [hs("HS1", ("CLB Tin học", 9.5), "clb_robot"),
                hs("HS2", "clb tin hoc", ("CLB BÓNG RỔ", "8,5"))]
    kq = api.import_so_nhap(b64_sach(CLB, students))
    assert kq["ok"], kq
    db = chup_csdl(api)
    assert [c[0] for c in db["clubs"]] == ["clb_bong_ro", "clb_robot", "clb_tin_hoc"]
    assert db["preferences"] == [("HS1", "clb_tin_hoc", 1), ("HS1", "clb_robot", 2),
                                 ("HS2", "clb_tin_hoc", 1), ("HS2", "clb_bong_ro", 2)]
    assert db["tick"] == [("HS1", "clb_tin_hoc"), ("HS2", "clb_bong_ro")]
    assert db["scores"] == [("HS1", "clb_tin_hoc", 9.5), ("HS2", "clb_bong_ro", 8.5)]


def test_chu_thi_la_da_thi_cham_sau_va_khong_xoa_diem_da_cham(api):
    kq = api.import_so_nhap(b64_sach(CLB, [hs("HS1", ("CLB Tin học", "thi"))]))
    assert kq["ok"], kq
    db = chup_csdl(api)
    assert db["tick"] == [("HS1", "clb_tin_hoc")]
    assert db["scores"] == []
    # Chấm trong phần mềm rồi nạp lại đúng sổ đó: điểm vừa chấm còn nguyên.
    con = sqlite3.connect(api.db_path)
    con.execute("INSERT INTO club_scores VALUES ('HS1','clb_tin_hoc',7)")
    con.commit()
    con.close()
    assert api.import_so_nhap(b64_sach(CLB, [hs("HS1", ("CLB Tin học", "thi"))]))["ok"]
    assert chup_csdl(api)["scores"] == [("HS1", "clb_tin_hoc", 7.0)]


def test_nap_lai_so_da_bo_thi_thi_xoa_luon_tick_cu(api):
    assert api.import_so_nhap(b64_sach(CLB, [hs("HS1", ("CLB Tin học", 9))]))["ok"]
    assert api.import_so_nhap(b64_sach(CLB, [hs("HS1", "CLB Tin học")]))["ok"]
    db = chup_csdl(api)
    assert db["tick"] == [] and db["scores"] == []
    assert db["preferences"] == [("HS1", "clb_tin_hoc", 1)]


@pytest.mark.parametrize("nhan,ma", [
    ("Thứ 2", "thu_2"), ("thu 3", "thu_3"), ("T4", "thu_4"), ("Chủ nhật", "chu_nhat"),
    ("CN", "chu_nhat"), ("", ""), ("thu_3_tiet_9", "thu_3_tiet_9"),
    ("Sáng thứ 7", "sáng_thứ_7"),
])
def test_nhan_buoi(nhan, ma):
    assert so_nhap.ma_buoi(nhan) == ma


def test_truong_mot_buoi_de_trong_cot_buoi(api):
    clubs = [dict(c, buoi="") for c in CLB]
    kq = api.import_so_nhap(b64_sach(clubs, [hs("HS1", "CLB Tin học")]))
    assert kq["ok"], kq
    assert kq["data"]["n_buoi"] == 1
    assert {c[5] for c in chup_csdl(api)["clubs"]} == {""}


def test_ma_tu_sinh_khong_trung_ma_nguoi_dung_dat(api):
    clubs = [{"club_id": "clb_tin_hoc", "name": "Tin học nâng cao", "capacity": 2},
             {"club_id": "", "name": "CLB Tin học", "capacity": 2}]
    kq = api.import_so_nhap(b64_sach(clubs, []))
    assert kq["ok"], kq
    assert [c[0] for c in chup_csdl(api)["clubs"]] == ["clb_tin_hoc", "clb_tin_hoc_2"]


def test_chua_co_hoc_sinh_thi_nap_rieng_clb(api):
    kq = api.import_so_nhap(b64_sach(CLB, []))
    assert kq["ok"], kq
    assert kq["data"]["n_clb"] == 3 and kq["data"]["n_hoc_sinh"] == 0
    assert len(chup_csdl(api)["clubs"]) == 3


# ------------------------------------------------------------------ #
# 3. SỔ LỖI: không ghi gì, chỉ đúng sheet và dòng
# ------------------------------------------------------------------ #

def _so_co(sua):
    """Sổ sạch, rồi `sua(wb)` làm hỏng một chỗ."""
    buf = io.BytesIO()
    so_nhap.ghi_so_nhap(buf, CLB, [hs("HS1", ("CLB Tin học", 9)), hs("HS2", "CLB Bóng rổ")])
    wb = openpyxl.load_workbook(io.BytesIO(buf.getvalue()))
    sua(wb)
    return b64_wb(wb)


@pytest.mark.parametrize("sua,ma_loi,tham_so", [
    (lambda wb: wb[so_nhap.SHEET_HS].__setitem__("D3", "CLB Không Có"),
     "so_nhap_clb_khong_co", {"dong": 3, "k": 1, "gia_tri": "CLB Không Có"}),
    (lambda wb: wb[so_nhap.SHEET_HS].__setitem__("F2", "CLB Tin học"),
     "so_nhap_nv_trung", {"dong": 2, "k": 2, "k_truoc": 1}),
    (lambda wb: wb[so_nhap.SHEET_HS].__setitem__("E2", "tám"),
     "so_nhap_diem_sai", {"dong": 2, "k": 1}),
    (lambda wb: wb[so_nhap.SHEET_HS].__setitem__("G3", 8),
     "so_nhap_diem_khong_nv", {"dong": 3, "k": 2}),
    (lambda wb: wb[so_nhap.SHEET_HS].__setitem__("A3", "HS1"),
     "so_nhap_hs_trung", {"dong": 3, "dong_truoc": 2}),
    (lambda wb: wb[so_nhap.SHEET_HS].__setitem__("A3", None),
     "so_nhap_thieu_ma_hs", {"dong": 3}),
    # Dòng 4 (Robotics): không em nào chọn, nên lỗi trùng tên đứng một mình.
    (lambda wb: wb[so_nhap.SHEET_CLB].__setitem__("A4", "CLB Tin học"),
     "so_nhap_clb_trung_ten", {"dong": 4, "dong_truoc": 2}),
    (lambda wb: wb[so_nhap.SHEET_CLB].__setitem__("C2", 0),
     "so_nhap_chi_tieu_sai", {"dong": 2}),
    (lambda wb: wb[so_nhap.SHEET_CLB].__setitem__("D3", 9),
     "so_nhap_chi_tieu_sai", {"dong": 3}),
    (lambda wb: wb[so_nhap.SHEET_HS].__setitem__("A1", "Số báo danh"),
     "so_nhap_thieu_cot", {"cot": "Mã HS"}),
])
def test_so_loi_khong_ghi_gi_va_chi_dung_cho(api, sua, ma_loi, tham_so):
    file_b64 = _so_co(sua)
    xem = api.xem_truoc_so_nhap(file_b64)
    assert xem["ok"], xem
    loi = xem["data"]["loi"]
    assert [e["code"] for e in loi] == [ma_loi], loi
    for k, v in tham_so.items():
        assert loi[0]["params"][k] == v, loi

    kq = api.import_so_nhap(file_b64)
    assert not kq["ok"]
    assert [e["code"] for e in kq["errors"]] == [ma_loi]
    db = chup_csdl(api)
    assert db["clubs"] == [] and db["students"] == []


def test_tep_excel_khong_phai_so_nhap(api):
    wb = openpyxl.Workbook()
    wb.active.append(["club_id", "name", "capacity"])
    wb.active.append(["clb_a", "A", 3])
    kq = api.import_so_nhap(b64_wb(wb))
    assert not kq["ok"]
    assert kq["errors"][0]["code"] == "so_nhap_khong_phai_so"
    assert not api.xem_truoc_so_nhap(b64_wb(wb))["ok"]


def test_tep_khong_phai_excel(api):
    kq = api.import_so_nhap(base64.b64encode(b"student_id,name\nHS1,A\n").decode())
    assert not kq["ok"]
    assert kq["errors"][0]["code"] == "xlsx_read_failed"


def test_tieu_de_go_lai_khong_dau_van_nhan(api):
    def sua(wb):
        ws = wb[so_nhap.SHEET_HS]
        ws["A1"], ws["B1"], ws["D1"], ws["E1"] = "MA HOC SINH", "ho va ten", "nv 1", "DIEM 1"
        wb[so_nhap.SHEET_CLB].title = "CLB"
    kq = api.import_so_nhap(_so_co(sua))
    assert kq["ok"], kq
    assert chup_csdl(api)["scores"] == [("HS1", "clb_tin_hoc", 9.0)]


# ------------------------------------------------------------------ #
# 4. LUẬT CŨ VẪN ÁP DỤNG (trần nguyện vọng mỗi buổi…)
# ------------------------------------------------------------------ #

def test_luat_cua_ham_nap_cu_van_bao_qua_so(api):
    from rbda_priority_pipeline import TRAN_CLB_THI_MOI_BUOI

    clubs = [{"club_id": "", "name": "CLB %d" % i, "capacity": 5, "buoi": "thu_2"}
             for i in range(TRAN_CLB_THI_MOI_BUOI + 1)]
    em = hs("HS1", *[("CLB %d" % i, 5) for i in range(TRAN_CLB_THI_MOI_BUOI + 1)])
    kq = api.import_so_nhap(b64_sach(clubs, [em]))
    assert kq["ok"], kq
    assert any(w["code"] == "csv_thi_bo_buoi_qua_tran" for w in kq["data"]["warnings"])
