# -*- coding: utf-8 -*-
"""Xuất "Dữ liệu đầu vào hiện tại" — ba tệp phải NẠP LẠI ĐƯỢC y nguyên.

Lời hứa của tính năng: sửa dữ liệu trong phần mềm (tick, điểm, nguyện
vọng, CLB) rồi xuất ra thì ba tệp ấy dựng lại ĐÚNG CSDL đó. Test mạnh nhất
là vòng tròn: xuất -> xoá sạch -> nạp lại qua đúng cửa giao diện dùng
(`import_csv_auto`, tự nhận diện loại tệp) -> so từng bảng -> chạy sắp xếp
cùng hạt giống -> so từng dòng kết quả.
"""

import csv
import os
import sqlite3

import pytest


def dung_truong(api):
    """Trường hai buổi, có nhãn dự trữ, có tick chưa chấm, có tên khó."""
    clb = [
        ("clb_a", "CLB A", 2, 1, "chinh_sach", "thu_2"),
        ("clb_b", 'CLB "Vì cộng đồng"', 3, 0, "", "thu_2"),
        ("clb_c", "CLB C, nấu ăn", 2, 0, "", "thu_4"),
    ]
    for c in clb:
        assert api.create_or_update_club(*c)["ok"]
    hs = [
        ("HS01", "Ngô Văn An", "", ["clb_a", "clb_c"], ["clb_a", "clb_b", "clb_c"]),
        ("HS02", "Lê Thị Bình", "chinh_sach", ["clb_a"], ["clb_a", "clb_c"]),
        ("HS03", "=1+1", "", ["clb_b", "clb_c"], ["clb_b", "clb_a"]),
        ("HS04", "Đỗ Minh Khoa", "", [], ["clb_c"]),
        ("HS05", "Chưa nhập gì", "", [], []),
    ]
    for ma, ten, nhom, thi, nv in hs:
        assert api.create_student_if_missing(ma, ten)["ok"]
        if nhom:
            assert api.set_student_reserve_group(ma, nhom)["ok"]
        if thi:
            assert api.submit_test_selection(ma, thi)["ok"]
        if nv:
            assert api.submit_preferences(ma, nv)["ok"]
    # clb_c: HS03 được chấm, HS01 tick nhưng CHƯA chấm.
    assert api.submit_club_scores("clb_a", [
        {"student_id": "HS01", "score": 8.5}, {"student_id": "HS02", "score": 7}])["ok"]
    assert api.submit_club_scores("clb_b", [{"student_id": "HS03", "score": 9}])["ok"]
    assert api.submit_club_scores("clb_c", [{"student_id": "HS03", "score": 6.25}])["ok"]


def chup(api):
    conn = sqlite3.connect(api.db_path)
    try:
        q = lambda sql: sorted(conn.execute(sql).fetchall())
        return {
            "students": q("SELECT student_id, name, COALESCE(reserve_group,'') FROM students "
                          "WHERE student_id IN (SELECT student_id FROM club_test_selection "
                          "UNION SELECT student_id FROM preferences)"),
            "clubs": q("SELECT club_id, name, capacity, reserve_capacity, "
                       "COALESCE(reserve_group,''), COALESCE(buoi,'') FROM clubs"),
            "tick": q("SELECT * FROM club_test_selection"),
            "diem": q("SELECT * FROM club_scores"),
            "nv": q("SELECT * FROM preferences"),
        }
    finally:
        conn.close()


def ket_qua(api):
    return sorted(
        (r["student_id"], r["buoi"], r["club_id"], r["matched_tier"])
        for r in api.get_match_results("")["data"])


def doc(path):
    with open(path, encoding="utf-8-sig", newline="") as f:
        return list(csv.reader(f))


def test_vong_tron_xuat_xoa_nap_lai_ra_dung_csdl_va_dung_ket_qua(api):
    dung_truong(api)
    assert api.run_pipeline(42)["ok"]
    truoc, kq_truoc = chup(api), ket_qua(api)

    res = api.export_du_lieu_dau_vao()
    assert res["ok"], res["errors"]
    d = res["data"]
    assert (d["n_clubs"], d["n_tick"], d["n_scores"], d["n_preferences"]) == (3, 5, 4, 8)

    assert api.reset_data("tat_ca", "XOA")["ok"]
    # Đúng thứ tự giao diện nạp: CLB trước, rồi hai tệp học sinh.
    for kind in ("clubs", "test_selection", "preferences"):
        with open(d["paths"][kind], encoding="utf-8-sig") as f:
            r = api.import_csv_auto(f.read())
        assert r["ok"], (kind, r["errors"])
        assert r["data"]["kind"] == kind, "tu nhan dien sai loai tep %s" % kind

    assert chup(api) == truoc
    assert api.run_pipeline(42)["ok"]
    # Khác nhau DUY NHẤT ở em không nhập gì (HS05): không định dạng nạp nào
    # chứa được em đó, và đúng con số `n_hs_khong_co_dong` đã báo trước.
    assert d["n_hs_khong_co_dong"] == 1
    assert ket_qua(api) == [r for r in kq_truoc if r[0] != "HS05"]


def test_tep_theo_dung_tieu_de_mau(api):
    dung_truong(api)
    p = api.export_du_lieu_dau_vao()["data"]["paths"]
    assert doc(p["clubs"])[0] == ["club_id", "name", "capacity",
                                  "reserve_capacity", "reserve_group", "buoi"]
    # Dạng RỘNG: dạng dài (club_id, score) cố ý bị cửa nạp coi là mơ hồ.
    assert doc(p["test_selection"])[0] == ["student_id", "name", "reserve_group",
                                           "test_club_1", "score_1",
                                           "test_club_2", "score_2"]
    for kind in p:
        with open(p[kind], encoding="utf-8-sig") as f:
            nd = api.detect_csv_kind(f.read())["data"]
        assert nd["confident"] and nd["kind"] == kind, (kind, nd)
    assert doc(p["preferences"])[0] == ["student_id", "name", "reserve_group",
                                        "club_id", "rank"]


def test_tick_chua_cham_de_trong_o_diem_va_ten_bi_chan_cong_thuc(api):
    dung_truong(api)
    p = api.export_du_lieu_dau_vao()["data"]["paths"]
    dong = {}
    for r in doc(p["test_selection"])[1:]:
        for i in range(3, len(r), 2):
            if r[i]:
                dong[(r[0], r[i])] = (r[1], r[i + 1])
    assert dong[("HS01", "clb_c")][1] == ""        # tick, chưa chấm
    assert dong[("HS01", "clb_a")][1] == "8.5"
    assert dong[("HS03", "clb_b")][0] == "'=1+1"   # Excel không tính thành 2


def test_em_khong_co_dong_nao_duoc_dem(api):
    dung_truong(api)
    d = api.export_du_lieu_dau_vao()["data"]
    assert d["n_hs_khong_co_dong"] == 1            # HS05


def test_diem_khong_con_tick_khong_duoc_xuat(api):
    dung_truong(api)
    conn = sqlite3.connect(api.db_path)
    conn.execute("DELETE FROM club_test_selection WHERE student_id='HS02'")
    conn.commit()
    conn.close()
    d = api.export_du_lieu_dau_vao()["data"]
    ids = {r[0] for r in doc(d["paths"]["test_selection"])[1:]}
    assert "HS02" not in ids


def test_xuat_vao_thu_muc_moi_khong_ghi_de(api):
    dung_truong(api)
    a = api.export_du_lieu_dau_vao()["data"]["dir"]
    b = api.export_du_lieu_dau_vao()["data"]["dir"]
    assert a != b and os.path.isdir(a) and os.path.isdir(b)
