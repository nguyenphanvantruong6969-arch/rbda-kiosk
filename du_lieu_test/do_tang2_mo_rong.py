"""
do_tang2_mo_rong.py
===================
Phần mở rộng của `do_tang2_theo_nguyen_vong.py`: tự phản biện kết luận cũ.

    python3 du_lieu_test/do_tang2_mo_rong.py            # đầy đủ (~1 giờ, 4 lõi)
    python3 du_lieu_test/do_tang2_mo_rong.py --nhanh    # bản thử

Kết luận cũ ("giữ bốc thăm") dựa trên một phép dò KHAI GIAN: nếu một em đổi
thứ tự / cắt ngắn danh sách nguyện vọng thì có được CLB tốt hơn không. Phản
biện chính đáng: phép dò đó giả định em kia BIẾT HẾT tờ khai của mọi em khác
và biết trước số bốc thăm. Học sinh thật không biết. Nên tệp này hỏi lại:

  Đ1. Nếu MỌI em khai thật, cơ chế nào tốt hơn, và tốt hơn cho AI?
  Đ2. Nếu một phần em "tính toán" (chỉ biết độ hot của CLB, KHÔNG biết số bốc
      thăm của mình) thì chuyện gì xảy ra — với em tính toán, và với em khai thật?
  Đ3. Có cách nào lấy được cái lợi của B mà không mở kênh khai gian không?
      Thử thêm ba phương án mới.
  Đ4. Kết luận có đứng vững khi tỉ lệ em đi thi thay đổi không?

CÁC PHƯƠNG ÁN TẦNG 2 (Tầng 1 và suất dự trữ giữ nguyên ở mọi phương án)
  A    — bốc thăm (phần mềm đang chạy).
  B    — thứ hạng em xếp CLB đó, bốc thăm phá hoà.
  C    — chỉ ưu tiên em xếp CLB đó là NV1; còn lại bốc thăm.
  CADA — "Choice-augmented DA" (Abdulkadiroğlu, Che & Yasuda 2015): mỗi em
         nêu RIÊNG một "CLB mục tiêu"; Tầng 2 của CLB đó xếp em mục tiêu lên
         trước, rồi bốc thăm. Danh sách nguyện vọng KHÔNG ảnh hưởng ưu tiên.
  SIC  — chạy A rồi tìm "chu trình cải thiện ổn định" (Erdil & Ergin 2008):
         các em Tầng 2 đổi chỗ vòng tròn khi ai cũng được CLB thích hơn mà
         không tạo ra ai bị oan theo điểm thi / dự trữ.

Dữ liệu MÔ PHỎNG của kho, không phải học sinh có thật.
"""

import argparse
import json
import os
import random
import statistics
import sys
from multiprocessing import Pool

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import rbda_priority_pipeline as loi  # noqa: E402
import co_che_doi_chung as cc  # noqa: E402
from do_tang2_theo_nguyen_vong import nap_thi_truong, _thay_uu_tien, _uu_tien_goc  # noqa: E402
from do_khai_that import do_mot_the_hien  # noqa: E402
from do_toi_uu_on_dinh import HAT_SINH, sinh_the_hien_nho  # noqa: E402

GOC = os.path.dirname(os.path.abspath(__file__))
DUONG_JSON = os.path.join(GOC, "so_lieu_tang2_mo_rong.json")


# ---------------------------------------------------------------------------
# CƠ CHẾ
# ---------------------------------------------------------------------------

def _uu_tien_tang2(khoa_t2):
    """compute_club_priority mới: Tầng 1 như cũ, Tầng 2 sắp ổn định theo
    `khoa_t2(sid, club_id)` — trong cùng khoá giữ thứ tự bốc thăm."""
    def fn(club_id, applicants_for_club, tested_scores_for_club, stb_lottery):
        thu_tu = _uu_tien_goc(club_id, applicants_for_club,
                              tested_scores_for_club, stb_lottery)
        t1 = [s for s in thu_tu if s in tested_scores_for_club]
        t2 = [s for s in thu_tu if s not in tested_scores_for_club]
        t2.sort(key=lambda s: khoa_t2(s, club_id))
        return t1 + t2
    return fn


def co_che(ten, muc_tieu=None):
    """Trả về hàm (students, clubs, scores, app, prefs, stb, elig) -> {sid: cid}.

    `muc_tieu` chỉ dùng cho CADA: {sid: club mục tiêu}. None = NV1 thật của
    danh sách ĐANG KHAI (hành vi chân thật mặc định)."""
    def chay(students, clubs, scores, app, prefs, stb, elig):
        if ten == "A":
            return dict(loi.run_rbda(students, clubs, scores, app, prefs, stb, elig).assignment)
        if ten == "SIC":
            return sic(students, clubs, scores, app, prefs, stb, elig)
        if ten == "B":
            hang = cc.bang_thu_hang_nguyen_vong(prefs)
            k = lambda s, c: hang.get(s, {}).get(c, 99)
        elif ten == "C":
            k = lambda s, c: 0 if prefs.get(s) and prefs[s][0] == c else 1
        elif ten == "CADA":
            mt = muc_tieu if muc_tieu is not None else {
                s: (ps[0] if ps else None) for s, ps in prefs.items()}
            k = lambda s, c: 0 if mt.get(s) == c else 1
        else:
            raise ValueError(ten)
        with _thay_uu_tien(_uu_tien_tang2(k)):
            return dict(loi.run_rbda(students, clubs, scores, app, prefs, stb, elig).assignment)
    return chay


# ---------------------------------------------------------------------------
# SIC — chu trình cải thiện ổn định trên ưu tiên YẾU (Tầng 2 coi như hoà)
# ---------------------------------------------------------------------------

def _khoa_yeu(sid, cid, scores):
    d = scores.get(cid, {}).get(sid)
    return (0, -d) if d is not None else (1, 0.0)


def vi_pham_on_dinh_yeu(xep, clubs, scores, app, prefs, elig, stb):
    """Các cặp (s, c) phá vỡ theo ưu tiên YẾU: hoà ở Tầng 2 xử CÓ LỢI cho em
    đang giữ chỗ. Đây là định nghĩa ổn định mà SIC phải giữ — ai bị oan theo
    điểm thi hoặc theo suất dự trữ thì vẫn bị bắt."""
    bang = cc.bang_thu_hang_nguyen_vong(prefs)
    giu = {c: [] for c in clubs}
    for s, c in xep.items():
        if c is not None:
            giu[c].append(s)
    ung = {c: set(app.get(c, [])) for c in clubs}
    loi_ra = []
    for s, ps in prefs.items():
        hien = xep.get(s)
        gh = bang[s].get(hien, len(ps)) if hien else len(ps)
        for c in ps[:gh]:
            if c not in clubs or s not in ung[c]:
                continue
            pool = giu[c] + [s]
            thu_tu = sorted(pool, key=lambda x: (_khoa_yeu(x, c, scores), x == s, stb[x], x))
            rank = {x: i for i, x in enumerate(thu_tu)}
            nhan, _ = loi.club_choice_function(
                pool, clubs[c]["capacity"], clubs[c]["reserve_capacity"],
                lambda x, _c=c: elig(x, _c), rank)
            if s in nhan:
                loi_ra.append((s, c))
    return loi_ra


def _tim_chu_trinh(canh, thu_tu):
    """DFS tìm một chu trình bất kỳ; duyệt theo `thu_tu` (bốc thăm) để tái lập."""
    mau = {}
    for goc in thu_tu:
        if goc in mau or goc not in canh:
            continue
        ngan = [(goc, iter(canh.get(goc, ())))]
        duong = [goc]
        mau[goc] = 1
        while ngan:
            u, it = ngan[-1]
            v = next(it, None)
            if v is None:
                mau[u] = 2
                ngan.pop()
                duong.pop()
                continue
            if mau.get(v) == 1:
                return duong[duong.index(v):]
            if v not in mau:
                mau[v] = 1
                duong.append(v)
                ngan.append((v, iter(canh.get(v, ()))))
    return None


def sic(students, clubs, scores, app, prefs, stb, elig, toi_da=500):
    xep = dict(loi.run_rbda(students, clubs, scores, app, prefs, stb, elig).assignment)
    bang = cc.bang_thu_hang_nguyen_vong(prefs)
    ung = {c: set(app.get(c, [])) for c in clubs}
    cam = set()
    thu_tu = sorted(prefs, key=lambda s: (stb[s], s))
    for _ in range(toi_da):
        giu = {c: [] for c in clubs}
        for s, c in xep.items():
            if c is not None:
                giu[c].append(s)
        # Ai "muốn" CLB c: mọi em (kể cả em trượt) xếp c trên chỗ hiện tại.
        muon = {c: [] for c in clubs}
        for s, ps in prefs.items():
            hien = xep.get(s)
            gh = bang[s][hien] if hien else len(ps)
            for c in ps[:gh]:
                if c in clubs and s in ung[c]:
                    muon[c].append(s)
        # Erdil–Ergin: chỉ em thuộc lớp ưu tiên YẾU cao nhất trong số em muốn c
        # mới được nhận chỗ trống ở c — nếu không, em cao hơn bị oan.
        dinh = {}
        for c, ds in muon.items():
            if ds:
                k = min(_khoa_yeu(s, c, scores) for s in ds)
                dinh[c] = {s for s in ds if _khoa_yeu(s, c, scores) == k}
        canh = {}
        for s in thu_tu:
            hien = xep.get(s)
            if hien is None:
                continue        # em trượt không nhả chỗ nào, không vào được chu trình
            for c in prefs[s][:bang[s][hien]]:
                if s not in dinh.get(c, ()):
                    continue
                for t in giu[c]:
                    if (s, t) not in cam:
                        canh.setdefault(s, []).append(t)   # s lấy chỗ t nhả ra
        ct = _tim_chu_trinh(canh, thu_tu)
        if not ct:
            break
        moi = dict(xep)
        for i, s in enumerate(ct):
            moi[s] = xep[ct[(i + 1) % len(ct)]]
        if vi_pham_on_dinh_yeu(moi, clubs, scores, app, prefs, elig, stb):
            cam.add((ct[0], ct[1]))
            continue
        xep = moi
    return xep


# ---------------------------------------------------------------------------
# ĐO KẾT CỤC THEO NGUYỆN VỌNG THẬT
# ---------------------------------------------------------------------------

def hang_that(xep, that):
    out = {}
    for s, ps in that.items():
        c = xep.get(s)
        out[s] = ps.index(c) + 1 if c in ps else None
    return out


def tom_tat(ds_hang):
    """ds_hang: list hạng (None = trượt). Trả NV1%, NV1-3%, hạng TB (đã xếp), trượt%."""
    n = len(ds_hang)
    xep = [h for h in ds_hang if h]
    return {
        "n": n,
        "nv1_pct": round(100 * sum(1 for h in xep if h == 1) / n, 2) if n else 0,
        "nv1_3_pct": round(100 * sum(1 for h in xep if h <= 3) / n, 2) if n else 0,
        "hang_tb": round(statistics.mean(xep), 3) if xep else 0,
        "truot_pct": round(100 * (n - len(xep)) / n, 2) if n else 0,
    }


# ---------------------------------------------------------------------------
# Đ2 — HỌC SINH "TÍNH TOÁN" KHÔNG BIẾT SỐ BỐC THĂM
# ---------------------------------------------------------------------------

def ung_vien_khai(that):
    """Các cách khai một em bình thường nghĩ ra được."""
    L = len(that)
    cach = {tuple(that)}
    for j in range(L):
        cach.add(tuple([that[j]] + that[:j] + that[j + 1:]))   # đẩy j lên đầu
        cach.add((that[j],))                                    # chỉ ghi j
    for j in range(L - 1):
        d = list(that)
        d[j], d[j + 1] = d[j + 1], d[j]
        cach.add(tuple(d))                                      # đổi chỗ liền kề
    for k in range(1, L):
        cach.add(tuple(that[:k]))                               # cắt ngắn
    return [list(x) for x in cach]


def diem(h, L):
    return h if h else L + 1


def phan_ung_tot_nhat(ten, thi_truong, seeds_niem_tin):
    """Mỗi em: chọn cách khai làm hạng THẬT kỳ vọng tốt nhất, khi mọi em khác
    khai thật và số bốc thăm của chính em CHƯA biết (lấy trung bình trên
    `seeds_niem_tin`). Hoà thì giữ khai thật. Trả {sid: tờ khai}.

    Đây là học sinh "cấp 1": biết CLB nào hot (vì biết các em khác khai gì
    — tương đương số liệu đăng ký năm trước), không biết vận may của mình."""
    S, clubs, scores, app, that = thi_truong
    st = {s: S[s] for s in that}
    elig = loi.default_reserve_eligible_fn(S, clubs)
    stbs = [loi.generate_stb_lottery(sorted(S), sd) for sd in seeds_niem_tin]
    out = {}
    for sid, ps in that.items():
        if len(ps) < 2:
            continue
        if ten == "CADA":
            cach = [("mt", c) for c in ps]
        else:
            cach = [("ds", tuple(x)) for x in ung_vien_khai(ps)]
        tot, chon = None, None
        for loai, v in cach:
            tong = 0
            for stb in stbs:
                if loai == "mt":
                    mt = {s: (p[0] if p else None) for s, p in that.items()}
                    mt[sid] = v
                    xep = co_che("CADA", mt)(st, clubs, scores, app, that, stb, elig)
                else:
                    p2 = dict(that)
                    p2[sid] = list(v)
                    xep = co_che(ten)(st, clubs, scores, app, p2, stb, elig)
                c = xep.get(sid)
                tong += diem(ps.index(c) + 1 if c in ps else None, len(ps))
            la_that = (loai == "mt" and v == ps[0]) or (loai == "ds" and list(v) == ps)
            if tot is None or tong < tot - 1e-9 or (abs(tong - tot) < 1e-9 and la_that):
                tot, chon = tong, (loai, v)
        loai, v = chon
        if loai == "mt" and v != ps[0]:
            out[sid] = ("mt", v)
        elif loai == "ds" and list(v) != ps:
            out[sid] = ("ds", list(v))
    return out


def chay_voi_ti_le(ten, thi_truong, br, ti_le, seeds_danh_gia, hat):
    S, clubs, scores, app, that = thi_truong
    st = {s: S[s] for s in that}
    elig = loi.default_reserve_eligible_fn(S, clubs)
    rng = random.Random(hat)
    tinh = {s for s in sorted(that) if rng.random() < ti_le}
    khai = dict(that)
    mt = {s: (p[0] if p else None) for s, p in that.items()}
    doi = set()
    for s in tinh:
        if s in br:
            loai, v = br[s]
            if loai == "mt":
                mt[s] = v
            else:
                khai[s] = v
            doi.add(s)
    h_tinh, h_that = [], []
    for sd in seeds_danh_gia:
        stb = loi.generate_stb_lottery(sorted(S), sd)
        f = co_che("CADA", mt) if ten == "CADA" else co_che(ten)
        xep = f(st, clubs, scores, app, khai, stb, elig)
        h = hang_that(xep, that)
        for s, v in h.items():
            (h_tinh if s in tinh else h_that).append(v)
    return h_tinh, h_that, len(tinh), len(doi)


# ---------------------------------------------------------------------------
# CÔNG VIỆC CHO TỪNG THỊ TRƯỜNG (chạy song song)
# ---------------------------------------------------------------------------

CO_CHE_TAT_CA = ["A", "B", "C", "CADA", "SIC"]
CO_CHE_CHIEN_LUOC = ["B", "C", "CADA"]
TI_LE = [0.0, 0.25, 0.5, 1.0]


def viec_thi_truong(arg):
    idx, ten_bo, buoi, tt, cfg = arg
    S, clubs, scores, app, that = tt
    st = {s: S[s] for s in that}
    elig = loi.default_reserve_eligible_fn(S, clubs)
    seeds = list(range(1, cfg["so_seed"] + 1))
    kq = {"bo": ten_bo, "buoi": buoi, "so_em": len(that)}

    # Đ1 + độ "may rủi": khai thật
    hang = {m: [] for m in CO_CHE_TAT_CA}
    cho_theo_seed = {m: {s: set() for s in that} for m in CO_CHE_TAT_CA}
    vi_pham_sic = 0
    for sd in seeds:
        stb = loi.generate_stb_lottery(sorted(S), sd)
        for m in CO_CHE_TAT_CA:
            xep = co_che(m)(st, clubs, scores, app, that, stb, elig)
            if m == "SIC":
                vi_pham_sic += len(vi_pham_on_dinh_yeu(xep, clubs, scores, app, that, elig, stb))
            h = hang_that(xep, that)
            hang[m].append(h)
            for s in that:
                cho_theo_seed[m][s].add(xep.get(s))
    kq["that"] = {m: [list(h.values()) for h in hang[m]] for m in CO_CHE_TAT_CA}
    kq["may_rui"] = {m: sum(1 for s in that if len(cho_theo_seed[m][s]) > 1)
                     for m in CO_CHE_TAT_CA}
    kq["vi_pham_sic"] = vi_pham_sic
    # ai thắng ai thua khi chuyển A -> B (theo xác suất được NV1 thật)
    p1 = {m: {s: statistics.mean(1 if h[s] == 1 else 0 for h in hang[m]) for s in that}
          for m in ("A", "B", "CADA")}
    kq["doi_nv1"] = {m: [p1[m][s] - p1["A"][s] for s in that] for m in ("B", "CADA")}

    # Đ2: chiến lược
    kq["chien_luoc"] = {}
    if cfg["chien_luoc"]:
        seeds_nt = list(range(1001, 1001 + cfg["so_seed_niem_tin"]))
        for m in CO_CHE_CHIEN_LUOC:
            br = phan_ung_tot_nhat(m, tt, seeds_nt)
            kq["chien_luoc"][m] = {"so_em_muon_doi": len(br), "theo_ti_le": {}}
            for p in TI_LE:
                ht, hth, nt, nd = chay_voi_ti_le(m, tt, br, p, seeds, 777 + idx)
                kq["chien_luoc"][m]["theo_ti_le"][str(p)] = {
                    "tinh": ht, "that": hth, "so_tinh": nt, "so_doi": nd}
    return kq


# ---------------------------------------------------------------------------
# Đ3b — DÒ KHAI GIAN VÉT CẠN (biết hết) cho các phương án mới
# ---------------------------------------------------------------------------

def sinh_nho(rng, ti_le_bo_diem):
    th = sinh_the_hien_nho(rng, co_du_tru=True)
    for c in th[2]:
        for s in list(th[2][c]):
            if rng.random() < ti_le_bo_diem:
                del th[2][c][s]
    return th


def do_muc_tieu_cada(th, stb, elig):
    """Kênh khai gian DUY NHẤT của CADA: chọn CLB mục tiêu khác NV1."""
    S, clubs, scores, app, prefs = th
    goc = co_che("CADA")(S, clubs, scores, app, prefs, stb, elig)
    gian = thu = 0
    for s, ps in prefs.items():
        if len(ps) < 2:
            continue
        thu += 1
        d0 = ps.index(goc[s]) if goc.get(s) in ps else len(ps)
        if d0 == 0:
            continue
        for c in ps[1:]:
            mt = {x: p[0] for x, p in prefs.items() if p}
            mt[s] = c
            x = co_che("CADA", mt)(S, clubs, scores, app, prefs, stb, elig)
            if (ps.index(x[s]) if x.get(s) in ps else len(ps)) < d0:
                gian += 1
                break
    return gian, thu


def viec_khai_gian(arg):
    ten, ti_le_bo_diem, so = arg
    rng = random.Random(HAT_SINH)
    tong_gian = tong_thu = 0
    for _ in range(so):
        th = sinh_nho(rng, ti_le_bo_diem)
        S = th[0]
        stb = loi.generate_stb_lottery(sorted(S), rng.randint(1, 10 ** 6))
        elig = loi.default_reserve_eligible_fn(S, th[1])
        if ten == "CADA-muc-tieu":
            g, t = do_muc_tieu_cada(th, stb, elig)
        else:
            if ten == "CADA-danh-sach":
                mt_co_dinh = {s: p[0] for s, p in th[4].items() if p}
                f = co_che("CADA", mt_co_dinh)
            else:
                f = co_che(ten)
            r = do_mot_the_hien(th, stb, elig, f, sorted(S), rng=random.Random(1))
            g, t = r["so_em_khai_gian_duoc"], r["so_em_thu"]
        tong_gian += g
        tong_thu += t
    return {"co_che": ten, "ti_le_bo_diem": ti_le_bo_diem, "gian": tong_gian, "thu": tong_thu,
            "pct": round(100 * tong_gian / tong_thu, 2) if tong_thu else 0}


# ---------------------------------------------------------------------------
# Đ4 — ĐỘ NHẠY THEO TỈ LỆ ĐI THI
# ---------------------------------------------------------------------------

def viec_do_nhay(arg):
    idx, tt, giu_diem, so_seed = arg
    S, clubs, scores, app, that = tt
    rng = random.Random(4242 + idx)
    sc2 = {c: {s: v for s, v in d.items() if rng.random() < giu_diem} for c, d in scores.items()}
    st = {s: S[s] for s in that}
    elig = loi.default_reserve_eligible_fn(S, clubs)
    out = {m: [] for m in ("A", "B", "CADA", "SIC")}
    for sd in range(1, so_seed + 1):
        stb = loi.generate_stb_lottery(sorted(S), sd)
        for m in out:
            out[m].extend(hang_that(co_che(m)(st, clubs, sc2, app, that, stb, elig), that).values())
    return giu_diem, out


# ---------------------------------------------------------------------------

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--nhanh", action="store_true")
    ap.add_argument("--so-seed", type=int, default=20)
    ap.add_argument("--so-seed-niem-tin", type=int, default=6)
    ap.add_argument("--so-the-hien", type=int, default=150)
    ap.add_argument("--seed-do-nhay", type=int, default=6)
    a = ap.parse_args()
    cfg = {"so_seed": a.so_seed, "so_seed_niem_tin": a.so_seed_niem_tin, "chien_luoc": True,
           "so_the_hien": a.so_the_hien, "seed_do_nhay": a.seed_do_nhay}
    if a.nhanh:
        cfg.update(so_seed=4, so_seed_niem_tin=3, so_the_hien=20, seed_do_nhay=2)

    tt_all = nap_thi_truong()
    viec = [(i, b, bu, tt, cfg) for i, (b, bu, tt) in enumerate(tt_all)]
    with Pool(4) as pool:
        thi_truong = pool.map(viec_thi_truong, viec)
        khai_gian = pool.map(viec_khai_gian, [
            (m, bd, cfg["so_the_hien"])
            for bd in (0.0, 0.5)
            for m in ("A", "B", "C", "CADA-danh-sach", "CADA-muc-tieu", "SIC")])
        nhay = pool.map(viec_do_nhay, [
            (i, tt, g, cfg["seed_do_nhay"])
            for g in (1.0, 0.5, 0.0) for i, (_, _, tt) in enumerate(tt_all)])

    ra = {"cfg": cfg, "thi_truong": thi_truong, "khai_gian": khai_gian}
    gop = {}
    for g, out in nhay:
        for m, v in out.items():
            gop.setdefault(str(g), {}).setdefault(m, []).extend(v)
    ra["do_nhay"] = {g: {m: tom_tat(v) for m, v in d.items()} for g, d in gop.items()}
    with open(DUONG_JSON, "w", encoding="utf-8") as f:
        json.dump(ra, f, ensure_ascii=False)
    print("xong ->", DUONG_JSON)


if __name__ == "__main__":
    main()
