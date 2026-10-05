"""
do_sic_kiem_chung.py
====================
Phương án "giữa": bốc thăm như cũ (A) rồi chạy chu trình cải thiện ổn định
(SIC, Erdil & Ergin 2008). Tệp này cố ĐÁNH ĐỔ kết luận "SIC tốt hơn A".

    python3 du_lieu_test/do_sic_kiem_chung.py           # ~20 phút, 4 lõi
    python3 du_lieu_test/do_sic_kiem_chung.py --nhanh

K1  Cài đặt có đúng không? Đối chiếu với một bộ VÉT CẠN viết độc lập (không
    dùng hàm nào của SIC): liệt kê mọi cách xếp của thể hiện nhỏ, lọc cách xếp
    ổn định yếu bằng bộ kiểm riêng, rồi hỏi: SIC có ổn định không, có làm ai
    thiệt so với A không, và còn cách xếp ổn định nào tốt hơn SIC cho mọi em
    không (tức SIC có bỏ sót lợi ích không).
K2  Trên 6 bộ dữ liệu: có em nào bị THIỆT so với A không; bao nhiêu em được
    lợi; khoảng tin cậy bootstrap của mức lợi.
K3  Hoà điểm: điểm thật thường tròn 0,5 hoặc 1 — làm tròn điểm rồi đo lại;
    và bỏ bớt điểm thi.
K4  Khai gian: học sinh "cấp 1" (biết độ hot, không biết lá thăm) dưới SIC,
    và vét cạn kiểu "biết hết" trên thể hiện nhỏ có nhiều hoà điểm.
K5  Cái giá công bằng: SIC đổi chỗ trái thứ tự bốc thăm — đếm số cặp em có số
    bốc thăm TỐT hơn mà nay thấy em số xấu hơn ngồi ở CLB mình muốn.

Dữ liệu MÔ PHỎNG của kho, không phải học sinh có thật.
"""

import argparse
import itertools
import json
import os
import random
import statistics
import sys
from multiprocessing import Pool

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import rbda_priority_pipeline as loi  # noqa: E402
from do_tang2_mo_rong import (  # noqa: E402
    co_che, sic, vi_pham_on_dinh_yeu, phan_ung_tot_nhat, tom_tat,
)
from do_tang2_theo_nguyen_vong import nap_thi_truong  # noqa: E402
from do_khai_that import do_mot_the_hien  # noqa: E402
from do_toi_uu_on_dinh import HAT_SINH, sinh_the_hien_nho  # noqa: E402

GOC = os.path.dirname(os.path.abspath(__file__))
DUONG_JSON = os.path.join(GOC, "so_lieu_sic_kiem_chung.json")


# ---------------------------------------------------------------------------
# K1 — BỘ VÉT CẠN ĐỘC LẬP (không dùng club_choice_function, không dùng SIC)
# ---------------------------------------------------------------------------

def _khoa(s, c, scores):
    d = scores.get(c, {}).get(s)
    return (0, -d) if d is not None else (1, 0.0)


def on_dinh_yeu_doc_lap(xep, clubs, scores, app, prefs):
    """Ổn định yếu, KHÔNG có suất dự trữ, viết lại từ định nghĩa:
    (s, c) phá vỡ nếu s thích c hơn chỗ hiện tại, s có trong ứng viên của c,
    và c còn chỗ trống HOẶC c đang giữ một em có ưu tiên THẤP HẲN s."""
    giu = {c: [] for c in clubs}
    for s, c in xep.items():
        if c is not None:
            giu[c].append(s)
    for s, ps in prefs.items():
        hien = xep.get(s)
        gh = ps.index(hien) if hien in ps else len(ps)
        for c in ps[:gh]:
            if s not in app.get(c, []):
                continue
            if len(giu[c]) < clubs[c]["capacity"]:
                return False
            ks = _khoa(s, c, scores)
            if any(ks < _khoa(t, c, scores) for t in giu[c]):
                return False
    return True


def moi_cach_xep(clubs, prefs):
    ds = sorted(prefs)
    lua = [[None] + list(prefs[s]) for s in ds]
    for chon in itertools.product(*lua):
        dem = {}
        ok = True
        for c in chon:
            if c is not None:
                dem[c] = dem.get(c, 0) + 1
                if dem[c] > clubs[c]["capacity"]:
                    ok = False
                    break
        if ok:
            yield dict(zip(ds, chon))


def _hang(xep, prefs, s):
    c = xep.get(s)
    return prefs[s].index(c) if c in prefs[s] else len(prefs[s])


def troi_pareto(x, y, prefs):
    """x trội Pareto y (mọi em không tệ hơn, ít nhất một em tốt hơn)."""
    hon = False
    for s in prefs:
        a, b = _hang(x, prefs, s), _hang(y, prefs, s)
        if a > b:
            return False
        if a < b:
            hon = True
    return hon


def viec_k1(arg):
    i, bo_diem, lam_tron = arg
    rng = random.Random(9000 + i)
    S, clubs, scores, app, prefs = sinh_the_hien_nho(rng, so_em=6, co_du_tru=False)
    for c in scores:
        for s in list(scores[c]):
            if rng.random() < bo_diem:
                del scores[c][s]
            elif lam_tron:
                scores[c][s] = float(round(scores[c][s]))
    stb = loi.generate_stb_lottery(sorted(S), rng.randint(1, 10 ** 6))
    elig = loi.default_reserve_eligible_fn(S, clubs)
    a = co_che("A")(S, clubs, scores, app, prefs, stb, elig)
    b = sic(S, clubs, scores, app, prefs, stb, elig)
    on_dinh = [x for x in moi_cach_xep(clubs, prefs)
               if on_dinh_yeu_doc_lap(x, clubs, scores, app, prefs)]
    return {
        "A_on_dinh": on_dinh_yeu_doc_lap(a, clubs, scores, app, prefs),
        "SIC_on_dinh": on_dinh_yeu_doc_lap(b, clubs, scores, app, prefs),
        "SIC_lam_ai_thiet": any(_hang(b, prefs, s) > _hang(a, prefs, s) for s in prefs),
        "A_bi_troi": any(troi_pareto(x, a, prefs) for x in on_dinh),
        "SIC_bi_troi": any(troi_pareto(x, b, prefs) for x in on_dinh),
        "SIC_khac_A": a != b,
    }


# ---------------------------------------------------------------------------
# K2 + K3 + K5 — DỮ LIỆU KHO, CÓ BIẾN THỂ ĐIỂM
# ---------------------------------------------------------------------------

def bien_the_diem(scores, kieu, rng):
    if kieu == "goc":
        return scores
    if kieu == "tron_0.5":
        return {c: {s: round(v * 2) / 2 for s, v in d.items()} for c, d in scores.items()}
    if kieu == "tron_1":
        return {c: {s: float(round(v)) for s, v in d.items()} for c, d in scores.items()}
    if kieu == "giu_50":
        return {c: {s: v for s, v in d.items() if rng.random() < 0.5} for c, d in scores.items()}
    raise ValueError(kieu)


def ghen_boc_thamt(xep, clubs, scores, app, prefs, stb):
    """Cặp (x, y) cùng hạng ưu tiên yếu ở c, x bốc số tốt hơn y, x muốn c hơn
    chỗ đang có, y đang ở c. A không có cặp nào kiểu này (đó là định nghĩa
    ổn định khi phá hoà bằng bốc thăm)."""
    giu = {c: [] for c in clubs}
    for s, c in xep.items():
        if c is not None:
            giu[c].append(s)
    n = 0
    em = set()
    for x, ps in prefs.items():
        gh = _hang(xep, prefs, x)
        for c in ps[:gh]:
            if x not in app.get(c, []):
                continue
            kx = _khoa(x, c, scores)
            for y in giu[c]:
                if _khoa(y, c, scores) == kx and stb[x] < stb[y]:
                    n += 1
                    em.add(x)
    return n, len(em)


def viec_k2(arg):
    idx, ten, buoi, tt, kieu, so_seed = arg
    S, clubs, scores, app, that = tt
    rng = random.Random(555 + idx)
    sc = bien_the_diem(scores, kieu, rng)
    st = {s: S[s] for s in that}
    elig = loi.default_reserve_eligible_fn(S, clubs)
    ra = []
    for sd in range(1, so_seed + 1):
        stb = loi.generate_stb_lottery(sorted(S), sd)
        a = co_che("A")(st, clubs, sc, app, that, stb, elig)
        b = sic(st, clubs, sc, app, that, stb, elig)
        loi_ = sum(1 for s in that if _hang(b, that, s) < _hang(a, that, s))
        thiet = sum(1 for s in that if _hang(b, that, s) > _hang(a, that, s))
        nv1a = sum(1 for s in that if _hang(a, that, s) == 0)
        nv1b = sum(1 for s in that if _hang(b, that, s) == 0)
        vp = len(vi_pham_on_dinh_yeu(b, clubs, sc, app, that, elig, stb))
        ga = ghen_boc_thamt(a, clubs, sc, app, that, stb)
        gb = ghen_boc_thamt(b, clubs, sc, app, that, stb)
        ra.append({"loi": loi_, "thiet": thiet, "nv1a": nv1a, "nv1b": nv1b,
                   "vi_pham": vp, "ghen_a": ga, "ghen_b": gb, "n": len(that)})
    return {"bo": ten, "buoi": buoi, "kieu": kieu, "seeds": ra}


# ---------------------------------------------------------------------------
# K4 — KHAI GIAN
# ---------------------------------------------------------------------------

def viec_k4_cap1(arg):
    """So sánh GHÉP CẶP: cùng một nhóm em, cùng lá thăm, chỉ khác việc nửa kia
    có tính toán hay không. So hai nửa ngẫu nhiên với nhau (như bản trước) lẫn
    cả khác biệt THÀNH PHẦN nhóm vào kết quả — đã thấy ở SIC: hai nửa lệch nhau
    1,8 điểm NV1 dù gần như không em nào đổi tờ khai."""
    idx, ten, buoi, tt, so_seed, so_nt, m = arg
    S, clubs, scores, app, that = tt
    st = {s: S[s] for s in that}
    elig = loi.default_reserve_eligible_fn(S, clubs)
    br = phan_ung_tot_nhat(m, tt, list(range(1001, 1001 + so_nt)))
    rng = random.Random(777 + idx)
    tinh = {s for s in sorted(that) if rng.random() < 0.5}
    khai = dict(that)
    for s in tinh:
        if s in br:
            khai[s] = br[s][1]
    nhom = {"tinh_khi_tinh": [], "tinh_khi_that": [], "that_khi_tinh": [], "that_khi_that": []}
    for sd in range(1, so_seed + 1):
        stb = loi.generate_stb_lottery(sorted(S), sd)
        x0 = co_che(m)(st, clubs, scores, app, that, stb, elig)
        x1 = co_che(m)(st, clubs, scores, app, khai, stb, elig)
        for s in that:
            h0 = _hang(x0, that, s) + 1
            h1 = _hang(x1, that, s) + 1
            L = len(that[s])
            h0 = h0 if h0 <= L else None
            h1 = h1 if h1 <= L else None
            g = "tinh" if s in tinh else "that"
            nhom[g + "_khi_that"].append(h0)
            nhom[g + "_khi_tinh"].append(h1)
    return {"co_che": m, "muon_doi": len(br), "nhom": nhom}


def viec_tran_vong(arg):
    """SIC có chạm trần 500 vòng không? So với trần 20 000."""
    idx, tt, so_seed = arg
    S, clubs, scores, app, that = tt
    st = {s: S[s] for s in that}
    elig = loi.default_reserve_eligible_fn(S, clubs)
    khac = 0
    for sd in range(1, so_seed + 1):
        stb = loi.generate_stb_lottery(sorted(S), sd)
        sc = {c: {s: float(round(v)) for s, v in d.items()} for c, d in scores.items()}
        if sic(st, clubs, sc, app, that, stb, elig) != sic(st, clubs, sc, app, that, stb, elig, toi_da=20000):
            khac += 1
    return khac


def viec_k4_vet_can(arg):
    ten, bo_diem, lam_tron, so = arg
    rng = random.Random(HAT_SINH + 7)
    gian = thu = 0
    vi_du = None
    for _ in range(so):
        th = sinh_the_hien_nho(rng, co_du_tru=True)
        for c in th[2]:
            for s in list(th[2][c]):
                if rng.random() < bo_diem:
                    del th[2][c][s]
                elif lam_tron:
                    th[2][c][s] = float(round(th[2][c][s]))
        stb = loi.generate_stb_lottery(sorted(th[0]), rng.randint(1, 10 ** 6))
        elig = loi.default_reserve_eligible_fn(th[0], th[1])
        r = do_mot_the_hien(th, stb, elig, co_che(ten), sorted(th[0]), rng=random.Random(1))
        gian += r["so_em_khai_gian_duoc"]
        thu += r["so_em_thu"]
        vi_du = vi_du or r["vi_du"]
    return {"co_che": ten, "bo_diem": bo_diem, "lam_tron": lam_tron,
            "gian": gian, "thu": thu, "pct": round(100 * gian / thu, 2) if thu else 0,
            "vi_du": vi_du}


# ---------------------------------------------------------------------------

def bootstrap(ds, rng, lan=2000):
    m = [statistics.mean(rng.choices(ds, k=len(ds))) for _ in range(lan)]
    m.sort()
    return round(m[int(0.025 * lan)], 3), round(m[int(0.975 * lan)], 3)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--nhanh", action="store_true")
    a = ap.parse_args()
    so_k1, so_seed, so_nt, so_vc = (300, 20, 6, 150) if not a.nhanh else (20, 3, 2, 10)

    tt = nap_thi_truong()
    with Pool(4) as pool:
        k1 = {}
        for bo_diem, lam_tron in ((0.0, False), (0.0, True), (0.5, True)):
            r = pool.map(viec_k1, [(i, bo_diem, lam_tron) for i in range(so_k1)])
            k1["bo_%s_tron_%s" % (bo_diem, lam_tron)] = {
                k: sum(1 for x in r if x[k]) for k in r[0]} | {"so_the_hien": len(r)}
        k2 = pool.map(viec_k2, [(i, b, bu, t, kieu, so_seed)
                                for kieu in ("goc", "tron_0.5", "tron_1", "giu_50")
                                for i, (b, bu, t) in enumerate(tt)])
        k4a = pool.map(viec_k4_cap1, [(i, b, bu, t, so_seed, so_nt, m)
                                      for m in ("SIC", "B")
                                      for i, (b, bu, t) in enumerate(tt)])
        tran = sum(pool.map(viec_tran_vong, [(i, t, 3) for i, (_, _, t) in enumerate(tt)]))
        k4b = pool.map(viec_k4_vet_can, [(m, bd, lt, so_vc)
                                         for m in ("A", "SIC")
                                         for bd, lt in ((0.0, False), (0.0, True), (0.5, True))])

    rng = random.Random(1)
    tom = {"K1_vet_can": k1, "K2_K3_K5": {}, "K4_cap1": {}, "K4_vet_can": k4b}
    for kieu in ("goc", "tron_0.5", "tron_1", "giu_50"):
        rs = [x for k in k2 if k["kieu"] == kieu for x in k["seeds"]]
        n = sum(x["n"] for x in rs)
        # lợi NV1 theo từng lần chạy toàn trường (gộp 28 thị trường cùng seed)
        theo_seed = {}
        for k in k2:
            if k["kieu"] != kieu:
                continue
            for j, x in enumerate(k["seeds"]):
                theo_seed.setdefault(j, [0, 0])
                theo_seed[j][0] += x["nv1b"] - x["nv1a"]
                theo_seed[j][1] += x["n"]
        d_pct = [100 * v[0] / v[1] for v in theo_seed.values()]
        tom["K2_K3_K5"][kieu] = {
            "luot_em": n,
            "em_loi_pct": round(100 * sum(x["loi"] for x in rs) / n, 3),
            "em_thiet": sum(x["thiet"] for x in rs),
            "nv1_A_pct": round(100 * sum(x["nv1a"] for x in rs) / n, 2),
            "nv1_SIC_pct": round(100 * sum(x["nv1b"] for x in rs) / n, 2),
            "loi_nv1_diem_pct_TB": round(statistics.mean(d_pct), 3),
            "loi_nv1_CI95": bootstrap(d_pct, rng) if len(d_pct) > 1 else None,
            "vi_pham_on_dinh_yeu": sum(x["vi_pham"] for x in rs),
            "ghen_boc_tham_A_cap": sum(x["ghen_a"][0] for x in rs),
            "ghen_boc_tham_SIC_cap": sum(x["ghen_b"][0] for x in rs),
            "ghen_boc_tham_SIC_em_pct": round(100 * sum(x["ghen_b"][1] for x in rs) / n, 3),
        }
    tom["K4_cap1"]["so_em"] = sum(len(t[2][4]) for t in tt)
    for m in ("SIC", "B"):
        ks = [k for k in k4a if k["co_che"] == m]
        tom["K4_cap1"][m] = {"muon_doi": sum(k["muon_doi"] for k in ks)}
        for g in ("tinh_khi_that", "tinh_khi_tinh", "that_khi_that", "that_khi_tinh"):
            tom["K4_cap1"][m][g] = tom_tat([h for k in ks for h in k["nhom"][g]])
    tom["SIC_cham_tran_500_vong"] = tran
    with open(DUONG_JSON, "w", encoding="utf-8") as f:
        json.dump(tom, f, ensure_ascii=False, indent=1)
    print(json.dumps(tom, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
