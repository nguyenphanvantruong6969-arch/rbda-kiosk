"""
do_tang2_theo_nguyen_vong.py
============================
Tầng 2 (em không thi) nên xếp theo SỐ BỐC THĂM, hay theo THỨ HẠNG NGUYỆN VỌNG
em dành cho CLB đó (ai xếp CLB cao hơn được ưu tiên, bốc thăm chỉ để phá hoà)?

    python3 du_lieu_test/do_tang2_theo_nguyen_vong.py
    python3 du_lieu_test/do_tang2_theo_nguyen_vong.py --so-seed 200 --so-the-hien 100

Hai cơ chế đều là Gale–Shapley do học sinh đề xuất, đều giữ nguyên Tầng 1 (điểm
thi) và suất dự trữ. Chỉ khác đúng thứ tự TRONG Tầng 2:

  A — BỐC THĂM   : Tầng 2 sắp theo (số bốc thăm, mã HS). Phần mềm đang chạy.
  B — NGUYỆN VỌNG: Tầng 2 sắp theo (thứ hạng em xếp CLB này, số bốc thăm, mã HS).

B được cài bằng cách thay TẠM `compute_club_priority` trong lúc gọi `run_rbda`,
nên mọi thứ khác (hàm lựa chọn, dự trữ, vòng DA) là đúng mã của phần mềm.

Đo ba thứ:
  1. Kết cục khi mọi em KHAI THẬT (NV1, NV1–3, hạng TB, số em trượt), trung bình
     trên nhiều seed bốc thăm.
  2. Hai kiểu "bất công" — mỗi cơ chế không có kiểu của chính nó:
       * "ghen theo nguyện vọng" : em X xếp CLB c cao hơn em Y, cả hai Tầng 2,
         Y được c còn X trượt c (A có, B không);
       * "ghen theo bốc thăm"   : X bốc số tốt hơn Y, cả hai Tầng 2, X muốn c
         hơn chỗ hiện tại, Y được c (B có, A không).
  3. KHAI GIAN có lợi không — cùng bộ dò vét cạn của `do_khai_that.py`, có
     Boston làm đối chứng ngược.

Dữ liệu MÔ PHỎNG của kho. Không đụng `app.db` thật.
"""

import argparse
import contextlib
import json
import os
import random
import statistics
import sys
import tempfile
import shutil

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import rbda_priority_pipeline as loi  # noqa: E402
import co_che_doi_chung as cc  # noqa: E402
from do_anh_huong_seed import nap_bo  # noqa: E402
from do_khai_that import do_mot_the_hien  # noqa: E402
from do_toi_uu_on_dinh import HAT_SINH, sinh_the_hien_nho  # noqa: E402

GOC = os.path.dirname(os.path.abspath(__file__))
DUONG_JSON = os.path.join(GOC, "so_lieu_tang2_nguyen_vong.json")

BO = [
    ("bo_sach", ["bo_sach/SACH_01_danh_sach_CLB.csv",
                 "bo_sach/SACH_02_chon_CLB_muon_thi.csv",
                 "bo_sach/SACH_03_xep_hang_nguyen_vong.csv"]),
    ("bo_can_bang", ["bo_can_bang/CANBANG_01_danh_sach_CLB.csv",
                     "bo_can_bang/CANBANG_02_chon_CLB_muon_thi.csv",
                     "bo_can_bang/CANBANG_03_xep_hang_nguyen_vong.csv"]),
    ("bo_kich_tran", ["bo_kich_tran/KICHTRAN_01_danh_sach_CLB.csv",
                      "bo_kich_tran/KICHTRAN_02_chon_CLB_muon_thi.csv",
                      "bo_kich_tran/KICHTRAN_03_xep_hang_nguyen_vong.csv"]),
    ("bo_toan_tuan", ["bo_toan_tuan/TOANTUAN_01_danh_sach_CLB.csv",
                      "bo_toan_tuan/TOANTUAN_02_chon_CLB_muon_thi.csv",
                      "bo_toan_tuan/TOANTUAN_03_xep_hang_nguyen_vong.csv"]),
    ("bo_nhieu_buoi", ["bo_nhieu_buoi/NHIEUBUOI_01_danh_sach_CLB.csv",
                       "bo_nhieu_buoi/NHIEUBUOI_02_chon_CLB_muon_thi.csv",
                       "bo_nhieu_buoi/NHIEUBUOI_03_xep_hang_nguyen_vong.csv"]),
    ("bo_sau_buoi", ["bo_sau_buoi/SAUBUOI_01_danh_sach_CLB.csv",
                     "bo_sau_buoi/SAUBUOI_02_chon_CLB_muon_thi.csv",
                     "bo_sau_buoi/SAUBUOI_03_xep_hang_nguyen_vong.csv"]),
]


# ---------------------------------------------------------------------------
# HAI CƠ CHẾ
# ---------------------------------------------------------------------------

_uu_tien_goc = loi.compute_club_priority


def _uu_tien_theo_nguyen_vong(preferences):
    hang = cc.bang_thu_hang_nguyen_vong(preferences)

    def fn(club_id, applicants_for_club, tested_scores_for_club, stb_lottery):
        thu_tu = _uu_tien_goc(club_id, applicants_for_club,
                              tested_scores_for_club, stb_lottery)
        t1 = [s for s in thu_tu if s in tested_scores_for_club]
        t2 = [s for s in thu_tu if s not in tested_scores_for_club]
        # sorted ổn định -> trong cùng hạng nguyện vọng giữ thứ tự bốc thăm.
        t2.sort(key=lambda s: hang.get(s, {}).get(club_id, 99))
        return t1 + t2
    return fn


@contextlib.contextmanager
def _thay_uu_tien(fn):
    loi.compute_club_priority = fn
    try:
        yield
    finally:
        loi.compute_club_priority = _uu_tien_goc


def chay_A(students, clubs, scores, app, prefs, stb, elig):
    return loi.run_rbda(students, clubs, scores, app, prefs, stb, elig)


def chay_B(students, clubs, scores, app, prefs, stb, elig):
    with _thay_uu_tien(_uu_tien_theo_nguyen_vong(prefs)):
        return loi.run_rbda(students, clubs, scores, app, prefs, stb, elig)


def A_dict(*a):
    return dict(chay_A(*a).assignment)


def B_dict(*a):
    return dict(chay_B(*a).assignment)


# ---------------------------------------------------------------------------
# NẠP DỮ LIỆU — mỗi buổi là một thị trường độc lập (đúng như phần mềm cắt)
# ---------------------------------------------------------------------------

def nap_thi_truong():
    ra = []
    for ten, files in BO:
        tm = tempfile.mkdtemp()
        try:
            db = nap_bo(tm, files)
            students, clubs, scores, app, prefs, _ = loi.load_from_sqlite(db)
        finally:
            shutil.rmtree(tm)
        for buoi, ds_clb in loi.nhom_theo_buoi(clubs).items():
            c_b, s_b, a_b, p_b = loi.cat_du_lieu_theo_buoi(
                buoi, ds_clb, clubs, scores, app, prefs)
            p_b = {s: v for s, v in p_b.items() if v}
            ra.append((ten, buoi, (students, c_b, s_b, a_b, p_b)))
    return ra


# ---------------------------------------------------------------------------
# ĐO 1 + 2 — KẾT CỤC VÀ HAI KIỂU GHEN, KHI KHAI THẬT
# ---------------------------------------------------------------------------

def ghen(xep, clubs, scores, app, prefs, stb):
    """(ghen theo nguyện vọng, ghen theo bốc thăm) giữa các em Tầng 2."""
    hang = cc.bang_thu_hang_nguyen_vong(prefs)
    gnv = gbt = 0
    for cid in clubs:
        t2 = [s for s in app.get(cid, []) if s not in scores.get(cid, {})
              and cid in hang.get(s, {})]
        dang_o = [s for s in t2 if xep.get(s) == cid]
        muon = [s for s in t2 if xep.get(s) != cid
                and cc.thich_hon(hang, s, cid, xep.get(s))]
        for x in muon:
            for y in dang_o:
                if hang[x][cid] < hang[y][cid]:
                    gnv += 1
                if stb[x] < stb[y]:
                    gbt += 1
    return gnv, gbt


def ket_cuc(xep, prefs, tang2_ids):
    def hang(s):
        c = xep.get(s)
        return prefs[s].index(c) + 1 if c in prefs.get(s, []) else None
    h = [hang(s) for s in prefs]
    h2 = [hang(s) for s in prefs if s in tang2_ids]
    return {
        "so_em": len(h),
        "nv1": sum(1 for x in h if x == 1),
        "nv1_3": sum(1 for x in h if x and x <= 3),
        "truot": sum(1 for x in h if x is None),
        "hang_tb": statistics.mean([x for x in h if x]) if any(h) else 0,
        "tang2_nv1": sum(1 for x in h2 if x == 1),
        "tang2_truot": sum(1 for x in h2 if x is None),
    }


def do_ket_cuc(thi_truong, so_seed):
    tong = {"A": {}, "B": {}}
    chi_tiet = []
    so_em_doi = []
    for ten, buoi, (students, clubs, scores, app, prefs) in thi_truong:
        st = {s: students[s] for s in prefs}
        elig = loi.default_reserve_eligible_fn(students, clubs)
        cap2 = sum(1 for c in clubs for s in app.get(c, []) if s not in scores.get(c, {}))
        cap_all = sum(len(app.get(c, [])) for c in clubs)
        # em có ít nhất một nguyện vọng mà em ở Tầng 2
        tang2_ids = {s for s, ps in prefs.items()
                     if any(s not in scores.get(c, {}) for c in ps)}
        acc = {"A": [], "B": []}
        for seed in range(1, so_seed + 1):
            stb = loi.generate_stb_lottery(sorted(students), seed)
            xa = A_dict(st, clubs, scores, app, prefs, stb, elig)
            xb = B_dict(st, clubs, scores, app, prefs, stb, elig)
            so_em_doi.append(sum(1 for s in prefs if xa.get(s) != xb.get(s)))
            for k, x in (("A", xa), ("B", xb)):
                r = ket_cuc(x, prefs, tang2_ids)
                r["ghen_nv"], r["ghen_bt"] = ghen(x, clubs, scores, app, prefs, stb)
                acc[k].append(r)
        dong = {"bo": ten, "buoi": buoi, "so_em": len(prefs),
                "cap_tang2_phan_tram": round(100 * cap2 / cap_all, 1) if cap_all else 0,
                "suc_chua": sum(c["capacity"] for c in clubs.values())}
        for k in ("A", "B"):
            tb = {m: statistics.mean(r[m] for r in acc[k]) for m in acc[k][0]}
            dong[k] = {m: round(v, 2) for m, v in tb.items()}
            for m, v in tb.items():
                tong[k][m] = tong[k].get(m, 0) + v
        chi_tiet.append(dong)
    return {"tong": {k: {m: round(v, 1) for m, v in d.items()} for k, d in tong.items()},
            "chi_tiet": chi_tiet,
            "so_em_khac_cho_tb_moi_thi_truong": round(statistics.mean(so_em_doi), 2)}


# ---------------------------------------------------------------------------
# ĐO 3 — KHAI GIAN
# ---------------------------------------------------------------------------

def sinh_the_hien_co_tang2(rng):
    """Thể hiện nhỏ của do_toi_uu_on_dinh, nhưng chỉ ~30% cặp có điểm, để
    Tầng 2 thật sự đông (bản gốc chấm 60%)."""
    students, clubs, scores, app, prefs = sinh_the_hien_nho(rng, co_du_tru=True)
    for c in scores:
        for s in list(scores[c]):
            if rng.random() < 0.5:
                del scores[c][s]
    return students, clubs, scores, app, prefs


def do_khai_gian_nho(so_the_hien):
    co_che = [("A — bốc thăm", A_dict), ("B — theo nguyện vọng", B_dict),
              ("Boston (đối chứng ngược)", cc.co_che_boston)]
    ket = {}
    for nhan, fn in co_che:
        rng = random.Random(HAT_SINH)
        thu = gian = th_gian = 0
        vi_du = None
        for _ in range(so_the_hien):
            th = sinh_the_hien_co_tang2(rng)
            students = th[0]
            stb = loi.generate_stb_lottery(sorted(students), rng.randint(1, 10 ** 6))
            elig = loi.default_reserve_eligible_fn(students, th[1])
            r = do_mot_the_hien(th, stb, elig, fn, sorted(students), rng=rng)
            thu += r["so_em_thu"]
            gian += r["so_em_khai_gian_duoc"]
            th_gian += int(r["so_em_khai_gian_duoc"] > 0)
            if vi_du is None and r["vi_du"]:
                vi_du = r["vi_du"]
        ket[nhan] = {"em_thu": thu, "em_khai_gian_duoc": gian,
                     "phan_tram": round(100 * gian / thu, 2) if thu else 0,
                     "the_hien_co_em_gian": th_gian, "vi_du": vi_du}
    return ket


def do_khai_gian_bo_that(thi_truong, so_em_mau, tran):
    ket = {}
    for nhan, fn in (("A — bốc thăm", A_dict), ("B — theo nguyện vọng", B_dict)):
        thu = gian = 0
        loi_tb = []
        for ten, buoi, (students, clubs, scores, app, prefs) in thi_truong:
            st = {s: students[s] for s in prefs}
            stb = loi.generate_stb_lottery(sorted(students), 42)
            elig = loi.default_reserve_eligible_fn(students, clubs)
            rng = random.Random(HAT_SINH)
            ds = sorted(prefs)
            mau = sorted(ds if len(ds) <= so_em_mau else rng.sample(ds, so_em_mau))
            r = do_mot_the_hien((st, clubs, scores, app, prefs), stb, elig, fn, mau,
                                tran=tran, rng=random.Random(1))
            thu += r["so_em_thu"]
            gian += r["so_em_khai_gian_duoc"]
            if r["so_em_khai_gian_duoc"]:
                loi_tb.append(r["muc_loi_tb"])
        ket[nhan] = {"em_thu": thu, "em_khai_gian_duoc": gian,
                     "phan_tram": round(100 * gian / thu, 2) if thu else 0,
                     "loi_tb_bac_nguyen_vong": round(statistics.mean(loi_tb), 2) if loi_tb else 0}
    return ket


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--so-seed", type=int, default=200)
    ap.add_argument("--so-the-hien", type=int, default=300)
    ap.add_argument("--so-em-mau", type=int, default=15)
    ap.add_argument("--tran", type=int, default=300)
    a = ap.parse_args()

    tt = nap_thi_truong()
    print("Thị trường (bộ × buổi):", len(tt))
    kq = {"ket_cuc": do_ket_cuc(tt, a.so_seed)}
    print(json.dumps(kq["ket_cuc"]["tong"], ensure_ascii=False, indent=1))
    kq["khai_gian_nho"] = do_khai_gian_nho(a.so_the_hien)
    print(json.dumps(kq["khai_gian_nho"], ensure_ascii=False, indent=1))
    kq["khai_gian_bo_that"] = do_khai_gian_bo_that(tt, a.so_em_mau, a.tran)
    print(json.dumps(kq["khai_gian_bo_that"], ensure_ascii=False, indent=1))
    kq["tham_so"] = vars(a)
    with open(DUONG_JSON, "w", encoding="utf-8") as f:
        json.dump(kq, f, ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
