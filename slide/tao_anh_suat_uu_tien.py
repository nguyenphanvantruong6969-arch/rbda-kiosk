"""Vẽ ảnh "Suất ưu tiên": cùng 6 em, cùng 2 chỗ, chỉ khác có hay không có suất ưu tiên.

    python slide/tao_anh_suat_uu_tien.py

Ra hai ảnh, mỗi ảnh một .svg (sửa được) và một .png (rộng 3 200 px, dán vào slide):
  anh_suat_uu_tien            xếp theo ĐIỂM:  A 9,5 > B 9,0 > C 8,5 (đã thi) > D, E, F (không thi, bốc thăm)
  anh_suat_uu_tien_boc_tham   xếp theo SỐ BỐC THĂM: cả 6 em không thi, số nhỏ trước (A #3 … F #31)

Cả hai chạy thật bằng compute_club_priority + club_choice_function (rbda_priority_pipeline.py),
sức chứa 2, chỉ C thuộc diện ưu tiên:
    - dự trữ 0 -> A, B          - dự trữ 1 -> C (suất ưu tiên), A (suất chung)
Màu và phông giống slide/tao_mo_hinh_toa_nha.js.
"""

from pathlib import Path

HERE = Path(__file__).resolve().parent

INK, SLATE, HAIR, PAPER = "#1C2321", "#5B6570", "#DBDCD5", "#F3F4F1"
GREEN, GREEN_SOFT = "#3F6B52", "#DCE9E0"
GOLD_D, GOLD_SOFT, GOLD_LINE = "#A8700F", "#FCF6E8", "#E9D3A2"
GREY = "#DBDCD5"

BODY = "Calibri, Carlito, Arial, sans-serif"
HEAD = "Cambria, Caladea, Georgia, serif"
W, H = 1600, 940

# (chữ, giá trị dưới chip) theo thứ hạng
QUEUES = {
    # 3 em đầu đã thi (điểm), 3 em sau không thi (số bốc thăm)
    "anh_suat_uu_tien": [("A", "9,5"), ("B", "9,0"), ("C", "8,5"), ("D", "#2"), ("E", "#5"), ("F", "#9")],
    # cả 6 em không thi: thuần số bốc thăm, số nhỏ trước
    "anh_suat_uu_tien_boc_tham": [("A", "#3"), ("B", "#7"), ("C", "#12"), ("D", "#18"), ("E", "#25"), ("F", "#31")],
}


def t(x, y, s, size=28, fill=INK, weight=400, anchor="start", family=BODY, italic=False):
    st = ' font-style="italic"' if italic else ""
    return (f'<text x="{x}" y="{y}" font-size="{size}" fill="{fill}" font-weight="{weight}" '
            f'text-anchor="{anchor}" font-family="{family}"{st}>{s}</text>')


def chip(cx, cy, r, letter, fill, color="#FFFFFF", size=40, ring=None):
    stroke = f' stroke="{ring}" stroke-width="4"' if ring else ""
    return (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}"{stroke}/>'
            + t(cx, cy + size * 0.35, letter, size, color, 700, "middle"))


def seat(cx, cy, letter, fill, line, label, label_color):
    s = 130
    return (f'<rect x="{cx - s / 2}" y="{cy - s / 2}" width="{s}" height="{s}" rx="22" fill="#FFFFFF" '
            f'stroke="{line}" stroke-width="5"/>'
            + chip(cx, cy, 44, letter, fill, size=44)
            + t(cx, cy + s / 2 + 40, label, 28, label_color, 700, "middle"))


def panel(py, title, sub, title_color, bg, border, states, seats, queue, theo_diem):
    """states: trạng thái từng chip trong hàng xếp hạng: 'in' xanh · 'prio' vàng · 'out' xám."""
    px, pw, ph = 80, 1440, 330
    out = [f'<rect x="{px}" y="{py}" width="{pw}" height="{ph}" rx="26" fill="{bg}" stroke="{border}" stroke-width="3"/>',
           t(px + 44, py + 66, title, 38, title_color, 700, family=HEAD),
           t(px + pw - 44, py + 64, sub, 25, SLATE, anchor="end")]
    cy, x0, step = py + 172, px + 110, 112
    if theo_diem:      # vách ngăn đã thi | không thi
        xd = x0 + 2 * step + step / 2
        out += [f'<line x1="{xd}" x2="{xd}" y1="{py + 100}" y2="{py + 260}" stroke="{HAIR}" stroke-width="3"/>',
                t(x0 + step, py + 120, "đã thi", 23, SLATE, anchor="middle"),
                t(x0 + 4 * step, py + 120, "không thi", 23, SLATE, anchor="middle")]
    else:              # cả 6 em một nhóm không thi
        out.append(t(x0 + 2.5 * step, py + 120, "không thi · xếp theo số bốc thăm, số nhỏ trước",
                     23, SLATE, anchor="middle"))
    for i, ((who, val), st) in enumerate(zip(queue, states)):
        cx = x0 + i * step
        fill, col = {"in": (GREEN, "#FFFFFF"), "prio": (GOLD_D, "#FFFFFF"), "out": (GREY, SLATE)}[st]
        out.append(chip(cx, cy, 38, who, fill, col, 36))
        out.append(t(cx, cy + 78, val, 26, INK, anchor="middle"))
        if st == "prio":
            out.append(t(cx, cy + 108, "ưu tiên", 24, GOLD_D, 700, "middle"))
    # mũi tên sang các chỗ
    ax = x0 + 5 * step + 80
    out.append(f'<path d="M{ax},{cy - 22} H{ax + 60} V{cy - 44} L{ax + 112},{cy} L{ax + 60},{cy + 44} V{cy + 22} H{ax} Z" '
               f'fill="{SLATE}"/>')
    for sx, who, fill, line, label, lc in seats:
        out.append(seat(sx, py + 165, who, fill, line, label, lc))
    return "\n".join(out)


def build(ten):
    queue, theo_diem = QUEUES[ten], ten == "anh_suat_uu_tien"
    body = [t(80, 98, "Suất ưu tiên", 62, INK, 700, family=HEAD),
            t(80, 148, "Cùng 6 em, cùng 2 chỗ — chỉ khác có hay không có suất ưu tiên", 30, SLATE)]
    body.append(panel(
        185, "Không có suất ưu tiên", "2 chỗ chung, chia theo thứ hạng", INK, PAPER, HAIR,
        ["in", "in", "out", "out", "out", "out"],
        [(1190, "A", GREEN, GREEN, "Suất chung", GREEN), (1350, "B", GREEN, GREEN, "Suất chung", GREEN)],
        queue, theo_diem))
    body.append(panel(
        535, "Có 1 suất ưu tiên", "lượt 1: chỉ em diện ưu tiên · lượt 2: mọi em còn lại", GOLD_D, GOLD_SOFT, GOLD_LINE,
        ["in", "out", "prio", "out", "out", "out"],
        [(1190, "C", GOLD_D, GOLD_D, "Suất ưu tiên", GOLD_D), (1350, "A", GREEN, GREEN, "Suất chung", GREEN)],
        queue, theo_diem))
    body.append(t(80, 905, "B xếp trên C nhưng hết chỗ vì C đã lấy suất ưu tiên. "
                           "Không có em nào thuộc diện thì suất chuyển sang chung.", 25, SLATE, italic=True))
    body.append(t(W - 80, 905, "Dữ liệu minh hoạ", 25, SLATE, anchor="end"))
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" font-family="{BODY}">\n'
            f'<rect width="{W}" height="{H}" fill="#FFFFFF"/>\n' + "\n".join(body) + "\n</svg>")


def chromium():
    import glob
    for c in ["/opt/pw-browsers/chromium"] + sorted(glob.glob("/opt/pw-browsers/chromium-*/chrome-linux/chrome")):
        if Path(c).is_file():
            return c
    return None


def main():
    from playwright.sync_api import sync_playwright

    with sync_playwright() as p:
        br = p.chromium.launch(executable_path=chromium())
        for ten in QUEUES:
            s = build(ten)
            (HERE / f"{ten}.svg").write_text(s, encoding="utf-8")
            pg = br.new_page(viewport={"width": W, "height": H}, device_scale_factor=3200 / W)
            pg.set_content(f'<html><head><meta charset="utf-8"><style>body{{margin:0}}</style></head>'
                           f'<body>{s}</body></html>')
            pg.evaluate("document.fonts.ready")
            pg.wait_for_timeout(200)
            pg.screenshot(path=str(HERE / f"{ten}.png"), clip={"x": 0, "y": 0, "width": W, "height": H})
        br.close()
    print("Đã vẽ vào", HERE)


if __name__ == "__main__":
    main()
