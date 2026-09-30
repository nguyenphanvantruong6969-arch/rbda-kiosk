"""Vẽ hình cho poster: một sơ đồ quy trình và hai biểu đồ.

    python poster/tao_hinh.py

Ra poster/hinh/*.svg (sửa được) và *.png (in, rộng 3 200 px).

Mọi số ở đây chép từ tệp nguồn ghi ngay cạnh — không đo lại, không làm tròn khác.
Sơ đồ mang nhãn "Sơ đồ do AI tạo ra"; biểu đồ mang nhãn "Dữ liệu mô phỏng"
(Phụ lục 1 — xem BAN_GIAO.md mục 6).
"""

import glob
from pathlib import Path

HERE = Path(__file__).resolve().parent
RA = HERE / "hinh"

INK = "#1C2321"
SLATE = "#5B6570"
MUTED = "#8A929A"
HAIR = "#DBDCD5"
PAPER = "#F3F4F1"
WHITE = "#FFFFFF"
GREEN = "#27805A"      # đã chạy validate_palette: đạt, cặp với GOLD cần nhãn trực tiếp
GOLD = "#B8781A"
GOLD_SOFT = "#F1DFB8"
GREEN_SOFT = "#DCE9E0"
GRAY_BAR = "#B9BEC3"

# Số liệu biểu đồ — dùng chung cho PNG ở đây và biểu đồ SỬA ĐƯỢC trong pptx.
# Đổi hạt giống bốc thăm 200 lần — SO_LIEU_DA_KIEM_CHUNG.md §3c.
# (bộ, số em, luôn giữ nguyên CLB, trung bình số em đổi CLB mỗi lần)
GIU_NGUYEN_DATA = [("Bộ 10 em", 10, 10, "0"), ("Bộ 120 em", 120, 116, "1,9"), ("Bộ 140 em", 140, 127, "6,0")]
# Điều gì làm kết quả đổi nhiều nhất — NGHIEN_CUU_TOI_UU.md TN6, cả 3 bộ.
# Đọc thẳng từ tệp số liệu thô (do du_lieu_test/do_ben_vung.py sinh ra), không chép tay.
def _doc_nhieu():
    import json
    tho = json.loads((HERE.parent / "du_lieu_test" / "so_lieu_ben_vung.json").read_text(encoding="utf-8"))["ket_qua"]
    bo = {}
    for khoa, ten in (("vi_du_huong_dan", "Bộ 10 em"), ("TEST_0", "Bộ 120 em"), ("bo_sach", "Bộ 140 em")):
        bo[ten] = next(v for k, v in tho.items() if k.startswith(khoa))
    loai = [("diem_0_5", "Điểm chấm lệch ±0,5"), ("diem_0_1", "Điểm chấm lệch ±0,1"),
            ("doi_seed", "Đổi hạt giống bốc thăm"), ("bot_1_hoc_sinh", "Bớt 1 học sinh"),
            ("chi_tieu_1", "Chỉ tiêu mỗi CLB ±1"), ("them_1_hoc_sinh", "Thêm 1 học sinh")]
    return [(nhan, [bo[b][k]["doi_clb_tb_phan_tram"] for b in bo]) for k, nhan in loai], list(bo)


NHIEU_DATA, NHIEU_BO = _doc_nhieu()      # [(loại thay đổi, [% bộ 10, bộ 120, bộ 140])], tên 3 bộ
NHIEU_MAU = ["#A9CDB9", "#5FA07E", GREEN]  # nhạt → đậm theo độ chật của bộ dữ liệu
NHIEU_NHAN = "Đổi hạt giống bốc thăm"      # hàng được tô nổi bật


def phan_tram(x, so_le=1):
    """Số kiểu Việt Nam: dấu phẩy thập phân; số 0 ghi gọn là 0."""
    if x == 0:
        return "0"
    return f"{x:.{so_le}f}".replace(".", ",")

FONT = "'Be Vietnam Pro','IBM Plex Sans',Arial,sans-serif"
BODY = "'IBM Plex Sans',Arial,sans-serif"


def svg(w, h, body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" '
            f'font-family="{BODY}">\n<rect width="{w}" height="{h}" fill="{WHITE}"/>\n{body}\n</svg>')


def t(x, y, s, size=28, fill=INK, weight=400, anchor="start", family=BODY):
    return (f'<text x="{x}" y="{y}" font-size="{size}" fill="{fill}" font-weight="{weight}" '
            f'text-anchor="{anchor}" font-family="{family}">{s}</text>')


# ------------------------------------------------------------- biểu đồ 1
def bieu_do_giu_nguyen():
    """Đổi hạt giống 200 lần: bao nhiêu em luôn giữ nguyên CLB."""
    W, H = 1600, 760
    x0, x1 = 470, 1560
    out = [t(60, 80, "Đổi hạt giống bốc thăm 200 lần", 44, INK, 700, family=FONT),
           t(60, 128, "Bao nhiêu em luôn giữ nguyên CLB? · 3 bộ dữ liệu mô phỏng", 28, SLATE)]
    out.append(f'<rect x="{x0}" y="164" width="26" height="26" rx="4" fill="{GREEN}"/>')
    out.append(t(x0 + 38, 186, "Luôn giữ nguyên CLB", 26, INK))
    out.append(f'<rect x="{x0 + 340}" y="164" width="26" height="26" rx="4" fill="{GOLD}"/>')
    out.append(t(x0 + 378, 186, "Có lúc đổi CLB", 26, INK))
    for i, (bo, n, giu, tb) in enumerate(GIU_NGUYEN_DATA):
        y = 222 + i * 135
        bh = 100
        doi = n - giu
        wg = (x1 - x0) * giu / n
        out.append(t(60, y + 34, bo, 32, INK, 700, family=FONT))
        out.append(t(60, y + 72, f"có lúc đổi: {doi} em", 26, SLATE))
        out.append(t(60, y + 106, f"TB mỗi lần: {tb} em đổi", 26, SLATE))
        out.append(f'<rect x="{x0}" y="{y}" width="{wg}" height="{bh}" rx="6" fill="{GREEN}"/>')
        if doi:
            out.append(f'<rect x="{x0 + wg + 4}" y="{y}" width="{x1 - x0 - wg - 4}" height="{bh}" rx="6" fill="{GOLD}"/>')
        nhan = "100%" if giu == n else f"{phan_tram(100 * giu / n)}% · {giu} em"
        out.append(t(x0 + 28, y + bh / 2 + 12, nhan, 34, WHITE, 700))
    out.append(t(60, 670, "Chỉ 3/270 em (1,1%) có lúc mất suất vì bốc thăm · 0 cặp phá vỡ ở mọi hạt giống",
                 28, INK, 600))
    out.append(t(60, 725, "Dữ liệu mô phỏng — nguồn: du_lieu_test/SO_LIEU_DA_KIEM_CHUNG.md, mục 3c", 24, MUTED))
    return svg(W, H, "\n".join(out))


# ------------------------------------------------------------- biểu đồ 2
def bieu_do_nhieu():
    """Điều gì làm kết quả thay đổi nhiều nhất — 3 bộ, thanh nhóm; hàng bốc thăm nổi bật."""
    W, H = 1600, 1000
    x0, x1, vmax = 520, 1440, 16
    out = [t(60, 80, "Điều gì làm kết quả thay đổi nhiều nhất?", 44, INK, 700, family=FONT),
           t(60, 128, "% học sinh đổi CLB, trung bình · 3 bộ dữ liệu mô phỏng", 28, SLATE)]
    lx = x0
    for ten, mau in zip(NHIEU_BO, NHIEU_MAU):
        out.append(f'<rect x="{lx}" y="158" width="24" height="24" rx="4" fill="{mau}"/>')
        out.append(t(lx + 34, 178, ten, 24, INK))
        lx += 190
    y0, nhom, bh, khe = 205, 108, 28, 4
    for i, (nhan, vals) in enumerate(NHIEU_DATA):
        y = y0 + i * nhom
        if nhan == NHIEU_NHAN:
            out.append(f'<rect x="40" y="{y - 10}" width="1530" height="{3 * bh + 2 * khe + 20}" rx="10" fill="{GOLD_SOFT}"/>')
    for v in (0, 5, 10, 15):
        x = x0 + (x1 - x0) * v / vmax
        out.append(f'<line x1="{x}" x2="{x}" y1="195" y2="{y0 + 6 * nhom - 12}" stroke="{HAIR}" stroke-width="2"/>')
        out.append(t(x, y0 + 6 * nhom + 22, f"{v}%", 24, MUTED, anchor="middle"))
    for i, (nhan, vals) in enumerate(NHIEU_DATA):
        y = y0 + i * nhom
        noi_bat = nhan == NHIEU_NHAN
        out.append(t(x0 - 24, y + (3 * bh + 2 * khe) / 2 + 11, nhan, 30, INK, 700 if noi_bat else 400, "end"))
        for j, (v, mau) in enumerate(zip(vals, NHIEU_MAU)):
            by = y + j * (bh + khe)
            w = max((x1 - x0) * v / vmax, 3)
            out.append(f'<rect x="{x0}" y="{by}" width="{w}" height="{bh}" rx="4" fill="{mau}"/>')
            out.append(t(x0 + w + 12, by + bh - 6, f"{phan_tram(v, 2)}%", 22, INK, 700 if noi_bat else 400))
    out.append(f'<line x1="{x0}" x2="{x0}" y1="195" y2="{y0 + 6 * nhom - 12}" stroke="{SLATE}" stroke-width="2"/>')
    bt = dict(NHIEU_DATA)[NHIEU_NHAN]
    out.append(t(60, 918, f"Bốc thăm: {phan_tram(min(bt), 2)}% – {phan_tram(max(bt), 2)}% tuỳ độ chật của dữ liệu"
                 f" · 392 phép thử · 0 cặp phá vỡ", 28, INK, 600))
    out.append(t(60, 968, "Dữ liệu mô phỏng — nguồn: NGHIEN_CUU_TOI_UU.md, TN6 (du_lieu_test/so_lieu_ben_vung.json)",
                 24, MUTED))
    return svg(W, H, "\n".join(out))


# ------------------------------------------------------------- biểu đồ 3
def _doc_toc_do():
    """Tổng thời gian nạp, xếp, xuất theo số học sinh — du_lieu_test/thu_tai/ket_qua_thu_tai.csv.

    Đọc thẳng tệp thô (204 lần chạy), không chép tay. Trả về [(số em, trung vị giây, chậm nhất giây)].
    """
    import csv
    import statistics
    tep = HERE.parent / "du_lieu_test" / "thu_tai" / "ket_qua_thu_tai.csv"
    nhom = {}
    with open(tep, encoding="utf-8-sig") as fh:
        for d in csv.DictReader(fh):
            tong = float(d["t_nap_giay"]) + float(d["t_phan_bo_giay"]) + float(d["t_xuat_giay"])
            nhom.setdefault(int(d["hoc_sinh"]), []).append(tong)
    return [(n, statistics.median(v), max(v), len(v)) for n, v in sorted(nhom.items())]


def so_em(n):
    return f"{n:,}".replace(",", " ")


def bieu_do_toc_do():
    """Bao lâu để xếp xong — cột là trung vị, vạch mảnh là lần chậm nhất."""
    W, H = 1600, 1000
    du_lieu = _doc_toc_do()
    tong_lan = sum(d[3] for d in du_lieu)
    x0, x1, y_day, y_dinh, vmax = 170, 1540, 820, 280, 13
    out = [t(60, 80, "Bao lâu để xếp xong?", 44, INK, 700, family=FONT),
           t(60, 128, f"Tổng thời gian nhập, xếp và xuất tệp · {tong_lan} lần chạy mô phỏng", 28, SLATE)]
    out.append(f'<rect x="60" y="176" width="26" height="26" rx="4" fill="{GREEN}"/>')
    out.append(t(98, 198, "trung vị (lần chạy điển hình)", 26, INK))
    out.append(f'<line x1="520" x2="520" y1="172" y2="206" stroke="{INK}" stroke-width="3"/>')
    out.append(f'<line x1="508" x2="532" y1="172" y2="172" stroke="{INK}" stroke-width="3"/>')
    out.append(t(546, 198, "lần chậm nhất", 26, INK))

    def yv(v):
        return y_day - (y_day - y_dinh) * v / vmax

    for v in (0, 3, 6, 9, 12):
        out.append(f'<line x1="{x0}" x2="{x1}" y1="{yv(v)}" y2="{yv(v)}" stroke="{HAIR}" stroke-width="2"/>')
        out.append(t(x0 - 18, yv(v) + 9, f"{v} giây" if v else "0", 24, MUTED, anchor="end"))
    cot = (x1 - x0) / len(du_lieu)
    bw = cot * 0.46
    for i, (n, tv, cham, _) in enumerate(du_lieu):
        cx = x0 + cot * (i + 0.5)
        yt, yc = yv(tv), yv(cham)
        out.append(f'<path d="M{cx - bw / 2},{y_day} V{yt + 6} Q{cx - bw / 2},{yt} {cx - bw / 2 + 6},{yt} '
                   f'H{cx + bw / 2 - 6} Q{cx + bw / 2},{yt} {cx + bw / 2},{yt + 6} V{y_day} Z" fill="{GREEN}"/>')
        out.append(f'<line x1="{cx}" x2="{cx}" y1="{yt}" y2="{yc}" stroke="{INK}" stroke-width="3"/>')
        out.append(f'<line x1="{cx - 16}" x2="{cx + 16}" y1="{yc}" y2="{yc}" stroke="{INK}" stroke-width="3"/>')
        out.append(t(cx, yc - 44, f"{phan_tram(tv, 2)} giây", 32, INK, 700, "middle"))
        out.append(t(cx, yc - 12, f"chậm nhất {phan_tram(cham, 2)}", 22, SLATE, anchor="middle"))
        out.append(t(cx, y_day + 44, f"{so_em(n)} em", 30, INK, 600, "middle"))
    out.append(f'<line x1="{x0}" x2="{x1}" y1="{y_day}" y2="{y_day}" stroke="{SLATE}" stroke-width="2"/>')
    out.append(t(60, 930, "Đo trên một máy tính · số CLB, số nguyện vọng và cách chia chỉ tiêu thay đổi theo từng lần chạy",
                 26, INK, 600))
    out.append(t(60, 972, "Dữ liệu mô phỏng — nguồn: du_lieu_test/thu_tai/ket_qua_thu_tai.csv", 22, MUTED))
    return svg(W, H, "\n".join(out))


def pptx_toc_do(duong_dan):
    """Một slide riêng, biểu đồ gốc PowerPoint (sửa được) để đưa vào Canva."""
    from pptx import Presentation
    from pptx.chart.data import CategoryChartData
    from pptx.dml.color import RGBColor
    from pptx.enum.chart import XL_CHART_TYPE, XL_LABEL_POSITION
    from pptx.util import Cm, Pt

    du_lieu = _doc_toc_do()
    prs = Presentation()
    prs.slide_width, prs.slide_height = Cm(40), Cm(25)
    sl = prs.slides.add_slide(prs.slide_layouts[6])

    def chu(x, y, w, h, noi_dung, co, mau=INK, dam=False, font="IBM Plex Sans"):
        tf = sl.shapes.add_textbox(Cm(x), Cm(y), Cm(w), Cm(h)).text_frame
        tf.word_wrap = True
        r = tf.paragraphs[0].add_run()
        r.text, r.font.size, r.font.bold, r.font.name = noi_dung, Pt(co), dam, font
        r.font.color.rgb = RGBColor.from_string(mau.lstrip("#"))

    chu(1.5, 1.0, 37, 1.6, "Bao lâu để xếp xong?", 32, dam=True, font="Be Vietnam Pro")
    chu(1.5, 2.6, 37, 1.0, f"Tổng thời gian nhập, xếp và xuất tệp (trung vị, giây) · "
        f"{sum(d[3] for d in du_lieu)} lần chạy mô phỏng", 16, SLATE)
    cd = CategoryChartData()
    cd.categories = [f"{so_em(n)} em" for n, *_ in du_lieu]
    cd.add_series("Trung vị (giây)", [round(tv, 2) for _, tv, _, _ in du_lieu])
    cd.add_series("Lần chậm nhất (giây)", [round(c, 2) for _, _, c, _ in du_lieu])
    ch = sl.shapes.add_chart(XL_CHART_TYPE.COLUMN_CLUSTERED, Cm(1.5), Cm(4), Cm(37), Cm(18), cd).chart
    ch.has_legend = True
    ch.font.size, ch.font.name = Pt(14), "IBM Plex Sans"
    for ser, mau in zip(ch.plots[0].series, (GREEN, GRAY_BAR)):
        ser.format.fill.solid()
        ser.format.fill.fore_color.rgb = RGBColor.from_string(mau.lstrip("#"))
        for i, pt in enumerate(ser.points):
            dl = pt.data_label
            dl.position = XL_LABEL_POSITION.OUTSIDE_END
            dl.text_frame.text = phan_tram(list(ser.values)[i], 2)
    ch.value_axis.has_major_gridlines = True
    ch.value_axis.major_gridlines.format.line.color.rgb = RGBColor.from_string(HAIR.lstrip("#"))
    chu(1.5, 22.6, 37, 1.0, "Đo trên một máy tính · dữ liệu mô phỏng — nguồn: "
        "du_lieu_test/thu_tai/ket_qua_thu_tai.csv", 12, MUTED)
    prs.save(duong_dan)


# ------------------------------------------------------------- sơ đồ 5 lớp
SO_DO_W, SO_DO_H = 2400, 1020


def so_do_spec():
    """Năm lớp cơ chế — CO_CHE_THUAT_TOAN.md. Chỉ nhãn, không câu văn.

    Trả về danh sách phần tử hình học (đơn vị: khung 2400 x 900). Cả bản SVG ở đây
    lẫn bản hình khối SỬA ĐƯỢC trong pptx (tao_poster.py) cùng vẽ từ danh sách này.
      ("rect", x, y, w, h, fill, stroke, stroke_w)
      ("circle", cx, cy, r, fill, label)
      ("text", x, y_chân_chữ, chữ, cỡ, màu, đậm?, font)
      ("arrow", x1, y, x2)      mũi tên ngang
      ("darrow", x, y1, y2)     mũi tên xuống
    """
    E = []

    def box(x, y, w, h, fill, stroke, title, lines, num=None, ts=44, ls=32, gap=48, sw=3):
        E.append(("rect", x, y, w, h, fill, stroke, sw))
        tx = x + 32
        if num:
            E.append(("circle", x + 56, y + 58, 30, GOLD, num))
            tx = x + 104
        ty = y + 30 + ts
        E.append(("text", tx, ty, title, ts, INK, True, FONT))
        for i, ln in enumerate(lines):
            E.append(("text", x + 32, ty + gap + 20 + i * gap, ln, ls, SLATE, False, BODY))

    # ---- hàng 1: luồng chính, theo đúng thứ tự phần mềm chạy
    box(30, 30, 270, 560, PAPER, HAIR, "Đầu vào",
        ["Danh sách CLB", "· số chỗ", "· suất dự trữ", "", "Điểm thi", "· chấm mù", "",
         "Nguyện vọng", "· xếp hạng CLB"])
    E.append(("arrow", 300, 310, 350))
    box(350, 30, 620, 560, WHITE, GREEN, "Xếp ưu tiên ở mỗi CLB",
        ["Tầng 1 · em đã thi CLB đó", "· điểm cao xếp trước",
         "· bằng điểm → số bốc thăm nhỏ trước", "Tầng 2 · em không thi CLB đó",
         "· xếp theo số bốc thăm", "Tầng 1 luôn đứng trước tầng 2",
         "CLB không biết em chọn mình", "là nguyện vọng thứ mấy"], num="1", ts=42)
    E.append(("arrow", 970, 310, 1020))
    E.append(("rect", 1020, 30, 760, 560, GREEN_SOFT, GREEN, 4))
    E.append(("circle", 1076, 88, 30, GOLD, "2"))
    E.append(("text", 1124, 104, "Xét duyệt nhiều vòng", 44, INK, True, FONT))
    for i, ln in enumerate(["1. Em nộp vào nguyện vọng cao nhất còn mở",
                            "2. CLB giữ tạm các em ưu tiên cao nhất",
                            "3. Em bị trả lại nộp nguyện vọng kế tiếp",
                            "4. Lặp đến khi không còn ai phải nộp lại"]):
        E.append(("text", 1052, 172 + i * 48, ln, 32, SLATE, False, BODY))
    box(1052, 340, 696, 236, WHITE, GOLD, "Suất dự trữ — xét hai lượt",
        ["Lượt 1 · chỉ xét em thuộc diện dự trữ", "Lượt 2 · xét chung phần chỗ còn lại",
         "Dư suất dự trữ → tự chuyển sang xét chung"], ts=36, ls=30, gap=42)
    E.append(("arrow", 1780, 310, 1830))
    box(1830, 30, 540, 310, WHITE, GREEN, "Kiểm tra",
        ["Tìm cặp phá vỡ: em thích", "CLB khác hơn và CLB đó", "cũng nhận em", "Yêu cầu: 0 cặp"], num="3")
    E.append(("darrow", 2100, 340, 370))
    box(1830, 370, 540, 220, PAPER, HAIR, "Kết quả",
        ["Mỗi em một CLB", "Xuất danh sách từng CLB"])

    # ---- hàng 2: bốc thăm hoạt động thế nào
    E.append(("darrow", 660, 590, 650))
    E.append(("rect", 30, 650, 2340, 320, GOLD_SOFT, GOLD, 3))
    E.append(("text", 62, 714, "Bốc thăm hoạt động thế nào", 40, INK, True, FONT))
    the = [
        ("Một em · một số", ["Bốc một lần cho mỗi học sinh", "Dùng chung cho mọi CLB",
                             "Số nhỏ hơn → ưu tiên hơn"]),
        ("Chỉ dùng khi hoà", ["Hai em bằng điểm ở cùng CLB", "hoặc em không thi CLB đó",
                              "Điểm luôn quyết định trước"]),
        ("Kiểm tra lại được", ["Không phụ thuộc thứ tự nhập tên", "Cùng dữ liệu và cùng hạt giống",
                               "→ ra đúng một kết quả"]),
        ("Khoá sau khi bốc", ["Số đã bốc giữ nguyên ở lần chạy sau",
                              "Muốn bốc lại thì đổi hạt giống", "và xác nhận thêm một lần"]),
    ]
    cw = (2340 - 64 - 3 * 28) / 4
    for i, (tieu_de, dong) in enumerate(the):
        box(62 + i * (cw + 28), 738, cw, 212, WHITE, GOLD, tieu_de, dong, ts=34, ls=28, gap=38, sw=2)
    E.append(("text", 30, 1005, "Sơ đồ do AI tạo ra", 24, MUTED, False, BODY))
    return E


def so_do_5_lop():
    out = []
    for e in so_do_spec():
        k = e[0]
        if k == "rect":
            _, x, y, w, h, fill, stroke, sw = e
            out.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="18" fill="{fill}" '
                       f'stroke="{stroke}" stroke-width="{sw}"/>')
        elif k == "circle":
            _, cx, cy, r, fill, label = e
            out.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}"/>')
            out.append(t(cx, cy + 11, label, 30, WHITE, 700, "middle", FONT))
        elif k == "text":
            _, x, y, s, size, fill, bold, fam = e
            out.append(t(x, y, s, size, fill, 700 if bold else 400, family=fam))
        elif k == "arrow":
            _, x1, y, x2 = e
            out.append(f'<line x1="{x1}" y1="{y}" x2="{x2 - 18}" y2="{y}" stroke="{SLATE}" stroke-width="5"/>'
                       f'<path d="M{x2 - 26},{y - 16} L{x2},{y} L{x2 - 26},{y + 16} Z" fill="{SLATE}"/>')
        elif k == "darrow":
            _, x, y1, y2 = e
            out.append(f'<line x1="{x}" y1="{y1}" x2="{x}" y2="{y2 - 18}" stroke="{SLATE}" stroke-width="5"/>'
                       f'<path d="M{x - 16},{y2 - 25} L{x},{y2} L{x + 16},{y2 - 25} Z" fill="{SLATE}"/>')
    return svg(SO_DO_W, SO_DO_H, "\n".join(out))


def chromium():
    for c in ["/opt/pw-browsers/chromium"] + sorted(glob.glob("/opt/pw-browsers/chromium-*/chrome-linux/chrome")):
        if Path(c).is_file():
            return c
    return None


def main():
    from playwright.sync_api import sync_playwright

    RA.mkdir(exist_ok=True)
    hinh = {"bieu_do_giu_nguyen": bieu_do_giu_nguyen(),
            "bieu_do_nhieu": bieu_do_nhieu(),
            "bieu_do_toc_do": bieu_do_toc_do(),
            "so_do_5_lop": so_do_5_lop()}
    fonts = (HERE.parent / "assets" / "fonts" / "fonts.css").as_uri()
    with sync_playwright() as p:
        br = p.chromium.launch(executable_path=chromium())
        for ten, s in hinh.items():
            (RA / f"{ten}.svg").write_text(s, encoding="utf-8")
            w = int(s.split('width="')[1].split('"')[0])
            h = int(s.split('height="')[1].split('"')[0])
            pg = br.new_page(viewport={"width": w, "height": h}, device_scale_factor=3200 / w)
            tam = HERE / "_hinh_tam.html"
            tam.write_text(f'<html><head><meta charset="utf-8"><link rel="stylesheet" href="{fonts}">'
                           f'<style>body{{margin:0}}</style></head><body>{s}</body></html>', encoding="utf-8")
            pg.goto(tam.as_uri())
            tam.unlink()
            pg.evaluate("document.fonts.ready")
            pg.wait_for_timeout(200)
            pg.screenshot(path=str(RA / f"{ten}.png"), clip={"x": 0, "y": 0, "width": w, "height": h})
        br.close()
    pptx_toc_do(HERE / "bieu_do_toc_do.pptx")
    print("Đã vẽ vào", RA)


if __name__ == "__main__":
    main()
