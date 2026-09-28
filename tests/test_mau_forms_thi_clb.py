"""Mẫu Microsoft Forms "Đăng ký CLB và thi tuyển" (mau_forms_thi_clb/).

Chốt ba điều:
  1. tệp xuất mẫu đi qua bộ chuyển đổi rồi nạp vào phần mềm THẬT với
     0 cảnh báo nhập, 0 cảnh báo sức khoẻ dữ liệu, và chạy được pipeline;
  2. bộ chuyển đổi chấm đúng, và bỏ riêng từng ô sai kèm cảnh báo nêu dòng;
  3. tệp sinh ra (CAI_DAT_FORMS.md) không lệch khỏi de_thi.json.
"""

import copy
import csv
import io
import os
import sys

import pytest

openpyxl = pytest.importorskip("openpyxl")

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
THU_MUC = os.path.join(GOC, "mau_forms_thi_clb")
sys.path.insert(0, THU_MUC)

import bieu_mau as bm  # noqa: E402
import chuyen_forms_sang_phan_mem as cv  # noqa: E402
import tao_mau_forms as tm  # noqa: E402

from api import PipelineAPI  # noqa: E402

TEP = ("01_danh_sach_CLB.csv", "02_chon_CLB_muon_thi.csv",
       "03_xep_hang_nguyen_vong.csv")


@pytest.fixture
def de():
    return bm.doc_de_thi()


def _doc_csv(duong):
    with open(duong, encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def _tieu_de_theo_ma(de):
    return {bm.ma_cua_cau(td): td for _, cac in bm.cac_phan(de) for td, *_ in cac}


def _tao_xuat(de, duong, phieu, diem_forms=None, tieu_de_them=()):
    """phieu: [{mã câu: giá trị}]. diem_forms: [{mã câu: điểm}] -> cột Points."""
    theo_ma = _tieu_de_theo_ma(de)
    tieu_de = ["ID", "Start time", "Completion time", "Email", "Name"]
    tieu_de += list(theo_ma.values()) + list(tieu_de_them)
    if diem_forms:
        tieu_de += ["Points - " + theo_ma[m] for m in sorted({m for d in diem_forms for m in d})]
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.append(tieu_de)
    for n, p in enumerate(phieu):
        o = {theo_ma.get(k, k): v for k, v in p.items()}
        for m, v in (diem_forms[n] if diem_forms else {}).items():
            o["Points - " + theo_ma[m]] = v
        ws.append([n + 1, None, None, "anonymous", ""] + [o.get(c) for c in tieu_de[5:]])
    wb.save(duong)


def _phieu(de, sid, xep=None, thi=None):
    """xep: {buổi: [club_id]}; thi: {club_id: số câu đúng (từ câu 1)}."""
    theo_ma = {c["club_id"]: c for c in de["cau_lac_bo"]}
    p = {"student_id": sid, "name": "Học sinh " + sid}
    for b, ds in (xep or {}).items():
        p[b] = ";".join(bm.lua_chon_clb(theo_ma[m]) for m in ds) + ";"
    for clb in bm.clb_co_thi(de):
        p["thi-" + clb["club_id"]] = bm.KHONG
    for m, so_dung in (thi or {}).items():
        clb = theo_ma[m]
        p["thi-" + m] = bm.CO
        for i, cau in enumerate(clb["de_thi"], 1):
            k = cau["dap_an"] if i <= so_dung else (cau["dap_an"] + 1) % len(cau["lua_chon"])
            p["%s-%d" % (m, i)] = cau["lua_chon"][k]
    return p


# ------------------------------------------------------------ 1. đầu-cuối

def test_tep_xuat_mau_nap_sach_vao_phan_mem(tmp_path, de):
    ra = tmp_path / "nap"
    kq = cv.chuyen(os.path.join(THU_MUC, "MAU_XUAT_TU_FORMS.xlsx"), str(ra), de)
    assert kq["canh_bao"] == []
    assert kq["n_hoc_sinh"] == 60 and kq["n_bai_thi"] > 0

    api = PipelineAPI(str(tmp_path / "app.db"), thu_muc_xuat=str(tmp_path))
    for t in TEP:
        with io.open(str(ra / t), encoding="utf-8-sig") as f:
            r = api.import_csv_auto(f.read())
        assert r["ok"] and not (r["data"].get("warnings") or []), (t, r)
    assert api.get_data_health_report()["data"]["n_warnings"] == 0
    assert api.run_pipeline(seed=42)["ok"]
    assert (ra / "BANG_DIEM.xlsx").exists()


def test_tep_xuat_mau_dung_la_ban_sinh_tu_de_thi(tmp_path, de):
    """Sửa de_thi.json mà quên chạy lại tao_mau_forms.py thì test này đỏ."""
    moi = tmp_path / "x.xlsx"
    tm.ghi_mau_xuat(de, str(moi))

    def bang(p):
        wb = openpyxl.load_workbook(p, read_only=True)
        v = [list(r) for r in wb.active.iter_rows(values_only=True)]
        wb.close()
        return v

    assert bang(str(moi)) == bang(os.path.join(THU_MUC, "MAU_XUAT_TU_FORMS.xlsx"))


def test_cai_dat_forms_khop_de_thi(de):
    with open(os.path.join(THU_MUC, "CAI_DAT_FORMS.md"), encoding="utf-8") as f:
        assert f.read() == tm.ghi_cai_dat(de)


# ------------------------------------------------------------ 2. chấm điểm

def test_cham_dung_theo_dap_an(tmp_path, de):
    x = tmp_path / "x.xlsx"
    _tao_xuat(de, str(x), [
        _phieu(de, "HS1", {"thu_2": ["clb_covua", "clb_vanhoc", "clb_nhiepanh"]},
               {"clb_covua": 5, "clb_vanhoc": 3}),
        _phieu(de, "HS2", {"thu_6": ["clb_toan", "clb_lichsu", "clb_bongro"]},
               {"clb_toan": 2}),
    ])
    kq = cv.chuyen(str(x), str(tmp_path / "ra"), de)
    assert kq["canh_bao"] == []
    thi = {r["student_id"]: r for r in _doc_csv(str(tmp_path / "ra" / TEP[1]))}
    assert (thi["HS1"]["test_club_1"], thi["HS1"]["score_1"]) == ("clb_covua", "10")
    assert (thi["HS1"]["test_club_2"], thi["HS1"]["score_2"]) == ("clb_vanhoc", "6")
    assert (thi["HS2"]["test_club_1"], thi["HS2"]["score_1"]) == ("clb_toan", "4")
    nv = {r["student_id"]: r for r in _doc_csv(str(tmp_path / "ra" / TEP[2]))}
    assert [nv["HS1"]["thu_2_pref_%d" % i] for i in (1, 2, 3)] == \
        ["clb_covua", "clb_vanhoc", "clb_nhiepanh"]
    assert nv["HS1"]["thu_6_pref_1"] == ""   # bỏ trống = em bận


def test_cham_theo_noi_dung_khong_theo_vi_tri(tmp_path, de):
    """Forms xáo lựa chọn được — thêm khoảng trắng/hoa thường cũng không sai."""
    p = _phieu(de, "HS1", {"thu_2": ["clb_covua"]}, {"clb_covua": 5})
    p["clb_covua-1"] = "  mã "
    x = tmp_path / "x.xlsx"
    _tao_xuat(de, str(x), [p])
    cv.chuyen(str(x), str(tmp_path / "ra"), de)
    assert _doc_csv(str(tmp_path / "ra" / TEP[1]))[0]["score_1"] == "10"


def test_diem_forms_lech_dap_an_thi_bao(tmp_path, de):
    x = tmp_path / "x.xlsx"
    _tao_xuat(de, str(x),
              [_phieu(de, "HS1", {"thu_2": ["clb_covua"]}, {"clb_covua": 5})],
              diem_forms=[{"clb_covua-%d" % i: (0 if i == 1 else 2) for i in range(1, 6)}])
    kq = cv.chuyen(str(x), str(tmp_path / "ra"), de)
    assert any("Forms chấm 8" in c[2] and "chấm 10" in c[2] for c in kq["canh_bao"])
    # Điểm nạp vẫn theo de_thi.json.
    assert _doc_csv(str(tmp_path / "ra" / TEP[1]))[0]["score_1"] == "10"


# ------------------------------------------------ 3. bỏ riêng ô sai, báo dòng

def test_thi_clb_chua_xep_nguyen_vong_khong_nap(tmp_path, de):
    x = tmp_path / "x.xlsx"
    _tao_xuat(de, str(x), [_phieu(de, "HS1", {"thu_2": ["clb_covua"]},
                                  {"clb_covua": 4, "clb_toan": 5})])
    kq = cv.chuyen(str(x), str(tmp_path / "ra"), de)
    assert [(c[0], c[1]) for c in kq["canh_bao"]] == [(2, "HS1")]
    assert "clb_toan" in kq["canh_bao"][0][2]
    thi = _doc_csv(str(tmp_path / "ra" / TEP[1]))[0]
    assert thi["test_club_1"] == "clb_covua"
    assert "clb_toan" not in thi.values()
    # Nhưng giáo viên vẫn thấy bài trong bảng điểm.
    wb = openpyxl.load_workbook(str(tmp_path / "ra" / "BANG_DIEM.xlsx"))
    chi_tiet = [r for r in wb["Chi tiết"].iter_rows(min_row=2, values_only=True)]
    assert any(r[2] == "clb_toan" and str(r[-1]).startswith("Không") for r in chi_tiet)


def test_nguyen_vong_la_hoac_lech_buoi_bi_bo(tmp_path, de):
    p = _phieu(de, "HS1")
    p["thu_2"] = "CLB Cờ vua (clb_covua);CLB Robotics (clb_robotics);CLB Ma (clb_ma);"
    x = tmp_path / "x.xlsx"
    _tao_xuat(de, str(x), [p])
    kq = cv.chuyen(str(x), str(tmp_path / "ra"), de)
    noi_dung = " | ".join(c[2] for c in kq["canh_bao"])
    assert "clb_robotics sinh hoạt thu_4" in noi_dung and "CLB Ma" in noi_dung
    nv = _doc_csv(str(tmp_path / "ra" / TEP[2]))[0]
    assert nv["thu_2_pref_1"] == "clb_covua" and nv.get("thu_2_pref_2", "") == ""


def test_nop_lai_giu_phieu_dau(tmp_path, de):
    """Đây là bài thi — nộp lại không được thành làm lại cho điểm cao hơn."""
    x = tmp_path / "x.xlsx"
    _tao_xuat(de, str(x), [
        _phieu(de, "HS1", {"thu_2": ["clb_covua"]}, {"clb_covua": 1}),
        _phieu(de, "HS1", {"thu_2": ["clb_covua"]}, {"clb_covua": 5}),
    ])
    kq = cv.chuyen(str(x), str(tmp_path / "ra"), de)
    assert kq["n_hoc_sinh"] == 1
    assert any(c[0] == 3 and "giữ phiếu đầu ở dòng 2" in c[2] for c in kq["canh_bao"])
    assert _doc_csv(str(tmp_path / "ra" / TEP[1]))[0]["score_1"] == "2"


def test_ranking_tach_moi_vi_tri_mot_cot_van_doc_duoc(tmp_path, de):
    theo_ma = _tieu_de_theo_ma(de)
    p = _phieu(de, "HS1")
    p["thu_2"] = "CLB Văn học (clb_vanhoc)"
    x = tmp_path / "x.xlsx"
    # Cột thứ hai cùng mã [thu_2]: nối sau cột thứ nhất.
    _tao_xuat(de, str(x), [dict(p, **{theo_ma["thu_2"] + " (2)": "CLB Cờ vua (clb_covua)"})],
              tieu_de_them=[theo_ma["thu_2"] + " (2)"])
    cv.chuyen(str(x), str(tmp_path / "ra"), de)
    nv = _doc_csv(str(tmp_path / "ra" / TEP[2]))[0]
    assert (nv["thu_2_pref_1"], nv["thu_2_pref_2"]) == ("clb_vanhoc", "clb_covua")


def test_thieu_cau_cua_mau_thi_khong_ghi_tep_nao(tmp_path, de):
    x = tmp_path / "x.xlsx"
    wb = openpyxl.Workbook()
    wb.active.append(["ID", bm.cau_ma_hoc_sinh(), bm.cau_ho_ten()])
    wb.active.append([1, "HS1", "A"])
    wb.save(str(x))
    ra = tmp_path / "ra"
    with pytest.raises(cv.LoiTepXuat, match="thiếu"):
        cv.chuyen(str(x), str(ra), de)
    assert not ra.exists()
    assert cv.main([str(x), "--ra", str(ra)]) == 1


# ------------------------------------------------------------ de_thi.json

def test_soat_de_thi_bat_du_moi_loi(de):
    hong = copy.deepcopy(de)
    hong["cau_lac_bo"][1]["club_id"] = hong["cau_lac_bo"][0]["club_id"]
    hong["cau_lac_bo"][0]["de_thi"][0]["dap_an"] = 9
    hong["cau_lac_bo"][2]["name"] = "CLB A;B"
    them = copy.deepcopy(hong["cau_lac_bo"][0])
    for i in range(5):
        hong["cau_lac_bo"].append(dict(copy.deepcopy(them), club_id="clb_x%d" % i))
    with pytest.raises(bm.LoiDeThi) as e:
        bm.soat_de_thi(hong)
    s = str(e.value)
    assert "bị trùng" in s and "dap_an" in s and "dấu ;" in s and "vượt trần 5" in s


def test_re_nhanh_moi_cau_cong_di_toi_phan_sau_de_thi(de):
    ten = [p[0] for p in bm.cac_phan(de)]
    for clb, toi in bm.re_nhanh(de):
        cong = ten.index("%s · Dự thi %s" % (bm.ten_buoi(de, clb["buoi"]), clb["name"]))
        assert ten[cong + 1].endswith("Đề thi " + clb["name"])
        assert toi == (ten[cong + 2] if cong + 2 < len(ten) else "End of the form")


def test_trang_mo_phong_dung_de_thi(de):
    """MO_PHONG_FORMS.html chép dữ liệu đề thi; lệch de_thi.json thì đỏ."""
    import json
    import re
    with open(os.path.join(THU_MUC, "MO_PHONG_FORMS.html"), encoding="utf-8") as f:
        html = f.read()
    m = re.search(r"const CLB = (\[.*?\n\])\.map", html, re.S)
    assert m, "không tìm thấy khối dữ liệu CLB"
    trong_trang = json.loads(m.group(1))
    goc = [[c["club_id"], c["name"], c["buoi"],
             [[q["cau"], q["lua_chon"], q["dap_an"]] for q in c["de_thi"]]]
            for c in de["cau_lac_bo"]]
    assert trong_trang == goc
    assert "const DIEM_CAU = %s;" % bm.ghi_so(de["diem_moi_cau"]) in html
    assert json.dumps([[b["ma"], b["ten"]] for b in de["buoi"]],
                      ensure_ascii=False, separators=(",", ":")) in html
    assert '"%s"' % bm.CO in html and '"%s"' % bm.KHONG in html


def test_word_6_phan_dung_du_lieu_va_khong_gach_ngang_dai():
    pytest.importorskip("docx")
    import tao_word_6_phan as tw
    du_lieu = tw.doc_du_lieu()
    assert [len(ds) for _, _, ds in du_lieu] == [10] * 5
    assert all(len(de) == 2 for _, _, ds in du_lieu for _, _, de in ds)
    assert tw.so_cau(du_lieu)[1] == 162
    doc = tw.viet(du_lieu)
    tw.kiem_chu(doc)   # ném lỗi nếu còn gạch ngang dài
