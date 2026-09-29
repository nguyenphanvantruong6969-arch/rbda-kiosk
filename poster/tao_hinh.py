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

FONT = "'Be Vietnam Pro','IBM Plex Sans',Arial,sans-serif"
BODY = "'IBM Plex Sans',Arial,sans-serif"


def svg(w, h, body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" '
            f'font-family="{BODY}">\n<rect width="{w}" height="{h}" fill="{WHITE}"/>\n{body}\n</svg>')


def t(x, y, s, size=28, fill=INK, weight=400, anchor="start", family=BODY):
    return (f'<text x="{x}" y="{y}" font-size="{size}" fill="{fill}" font-weight="{weight}" '
            f'text-anchor="{anchor}" font-family="{family}">{s}</text>')


# ------------------------------------------------------------- biểu đồ 1
def bieu_do_nguyen_vong():
    """Được xếp vào nguyện vọng thứ mấy — SO_LIEU_DA_KIEM_CHUNG.md §2."""
    data = [("NV 1", 64), ("NV 2", 28), ("NV 3", 10), ("NV 4", 6)]
    tong = sum(v for _, v in data)          # 108
    W, H = 1600, 1000
    x0, y0, x1, y1 = 140, 170, 1540, 820     # vùng vẽ
    vmax = 70
    bw, gap = 230, (x1 - x0 - 4 * 230) / 4
    out = [t(60, 80, "Được xếp vào nguyện vọng thứ mấy", 44, INK, 700, family=FONT),
           t(60, 128, f"{tong} em được xếp · bộ 120 học sinh, 10 CLB · seed 42", 28, SLATE)]
    for v in (0, 20, 40, 60):
        y = y1 - (y1 - y0) * v / vmax
        out.append(f'<line x1="{x0}" x2="{x1}" y1="{y}" y2="{y}" stroke="{HAIR}" stroke-width="2"/>')
        out.append(t(x0 - 20, y + 10, v, 26, MUTED, anchor="end"))
    for i, (lab, v) in enumerate(data):
        x = x0 + gap / 2 + i * (bw + gap)
        h = (y1 - y0) * v / vmax
        fill = GREEN if i == 0 else "#7FAE95"
        # đầu thanh bo 4px, chân thanh vuông trên đường nền
        out.append(f'<path d="M{x},{y1} V{y1 - h + 6} Q{x},{y1 - h} {x + 6},{y1 - h} H{x + bw - 6} '
                   f'Q{x + bw},{y1 - h} {x + bw},{y1 - h + 6} V{y1} Z" fill="{fill}"/>')
        pct = round(100 * v / tong)
        out.append(t(x + bw / 2, y1 - h - 22, f"{v} em · {pct}%", 34, INK, 600, "middle"))
        out.append(t(x + bw / 2, y1 + 50, lab, 32, INK, 600, "middle"))
    out.append(f'<line x1="{x0}" x2="{x1}" y1="{y1}" y2="{y1}" stroke="{SLATE}" stroke-width="2"/>')
    out.append(t(60, 960, "Dữ liệu mô phỏng — nguồn: du_lieu_test/SO_LIEU_DA_KIEM_CHUNG.md, mục 2", 24, MUTED))
    return svg(W, H, "\n".join(out))


# ------------------------------------------------------------- biểu đồ 2
def bieu_do_khai_gian():
    """Khai gian nguyện vọng có lợi — NGHIEN_CUU_TOI_UU.md TN3 (vét cạn)."""
    data = [("Phần mềm (RB-DA)", 0, GREEN), ("Cơ chế Boston", 258, GRAY_BAR)]
    W, H = 1600, 760
    x0, x1 = 480, 1120
    vmax = 300
    out = [t(60, 80, "Số em khai sai nguyện vọng mà được lợi", 44, INK, 700, family=FONT),
           t(60, 128, "Vét cạn mọi cách khai của từng em · 200 thể hiện, 1 400 lượt học sinh", 28, SLATE)]
    for v in (0, 100, 200, 300):
        x = x0 + (x1 - x0) * v / vmax
        out.append(f'<line x1="{x}" x2="{x}" y1="200" y2="560" stroke="{HAIR}" stroke-width="2"/>')
        out.append(t(x, 600, v, 26, MUTED, anchor="middle"))
    for i, (lab, v, fill) in enumerate(data):
        y = 240 + i * 170
        bh = 110
        out.append(t(x0 - 30, y + bh / 2 + 12, lab, 34, INK, 600, "end"))
        if v:
            w = (x1 - x0) * v / vmax
            out.append(f'<path d="M{x0},{y} H{x0 + w - 6} Q{x0 + w},{y} {x0 + w},{y + 6} V{y + bh - 6} '
                       f'Q{x0 + w},{y + bh} {x0 + w - 6},{y + bh} H{x0} Z" fill="{fill}"/>')
            out.append(t(x0 + w + 20, y + bh / 2 + 13, f"{v} / 1 400 em (18,43%)", 34, INK, 600))
        else:
            out.append(f'<rect x="{x0}" y="{y}" width="8" height="{bh}" rx="3" fill="{fill}"/>')
            out.append(t(x0 + 30, y + bh / 2 + 13, "0 / 1 400 em", 34, INK, 600))
    out.append(f'<line x1="{x0}" x2="{x0}" y1="200" y2="560" stroke="{SLATE}" stroke-width="2"/>')
    out.append(t(60, 700, "Dữ liệu mô phỏng — nguồn: NGHIEN_CUU_TOI_UU.md, TN3", 24, MUTED))
    return svg(W, H, "\n".join(out))


# ------------------------------------------------------------- sơ đồ 5 lớp
def so_do_5_lop():
    """Năm lớp cơ chế — CO_CHE_THUAT_TOAN.md. Chỉ nhãn, không câu văn."""
    W, H = 2400, 900

    def box(x, y, w, h, fill, stroke, title, lines, num=None, title_fill=INK):
        s = [f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="18" fill="{fill}" stroke="{stroke}" stroke-width="3"/>']
        tx = x + 32
        if num:
            s.append(f'<circle cx="{x + 52}" cy="{y + 56}" r="30" fill="{GOLD}"/>')
            s.append(t(x + 52, y + 67, num, 30, WHITE, 700, "middle", FONT))
            tx = x + 100
        s.append(t(tx, y + 68, title, 36, title_fill, 700, family=FONT))
        for i, ln in enumerate(lines):
            s.append(t(x + 32, y + 130 + i * 44, ln, 28, SLATE))
        return "\n".join(s)

    def arrow(x1, y, x2):
        return (f'<line x1="{x1}" y1="{y}" x2="{x2 - 18}" y2="{y}" stroke="{SLATE}" stroke-width="5"/>'
                f'<path d="M{x2 - 26},{y - 16} L{x2},{y} L{x2 - 26},{y + 16} Z" fill="{SLATE}"/>')

    out = []
    # đầu vào
    out.append(box(40, 170, 400, 560, PAPER, HAIR, "Đầu vào",
                   ["Danh sách CLB", "· sức chứa", "· suất dự trữ", "", "CLB muốn thi", "· điểm chấm mù", "",
                    "Nguyện vọng", "· xếp hạng CLB"]))
    out.append(arrow(440, 450, 530))
    # ưu tiên của CLB
    out.append(box(530, 170, 520, 265, WHITE, GREEN, "Ưu tiên hai tầng",
                   ["Tầng 1: đã thi → theo điểm", "Tầng 2: không thi"], num="4"))
    out.append(box(530, 465, 520, 265, WHITE, GREEN, "Bốc thăm dùng chung",
                   ["Một số cho mỗi em, mọi CLB", "Chỉ phá hoà · khoá theo seed"], num="3"))
    out.append(arrow(1050, 450, 1140))
    # lõi DA
    out.append(f'<rect x="1140" y="130" width="640" height="640" rx="22" fill="{GREEN_SOFT}" stroke="{GREEN}" stroke-width="4"/>')
    out.append(f'<circle cx="1192" cy="186" r="30" fill="{GOLD}"/>' + t(1192, 197, "1", 30, WHITE, 700, "middle", FONT))
    out.append(t(1240, 198, "Deferred Acceptance", 38, INK, 700, family=FONT))
    out.append(t(1172, 256, "Học sinh đề xuất theo nguyện vọng", 28, SLATE))
    out.append(t(1172, 300, "CLB giữ tạm, từ chối phần còn lại", 28, SLATE))
    out.append(t(1172, 344, "Lặp tới khi không còn đề xuất", 28, SLATE))
    out.append(box(1180, 400, 560, 330, WHITE, GOLD, "Dự trữ mềm, hai lượt",
                   ["Lượt 1: suất dự trữ", "  → chỉ em thuộc diện", "Lượt 2: lượt chung",
                    "  → suất thừa tự chuyển sang"], num="2"))
    out.append(arrow(1780, 450, 1870))
    # kiểm tra + đầu ra
    out.append(box(1870, 170, 490, 265, WHITE, GREEN, "Kiểm tra ổn định",
                   ["Tìm cặp phá vỡ bằng", "chính hàm lựa chọn"], num="5"))
    out.append(f'<line x1="2115" y1="435" x2="2115" y2="447" stroke="{SLATE}" stroke-width="5"/>'
               f'<path d="M2099,440 L2115,465 L2131,440 Z" fill="{SLATE}"/>')
    out.append(box(1870, 465, 490, 265, PAPER, HAIR, "Kết quả",
                   ["Mỗi em một CLB", "Xuất Excel / CSV theo CLB"]))
    out.append(t(40, 850, "Sơ đồ do AI tạo ra — theo CO_CHE_THUAT_TOAN.md (năm lớp cơ chế của phần mềm)", 26, MUTED))
    return svg(W, H, "\n".join(out))


def chromium():
    for c in ["/opt/pw-browsers/chromium"] + sorted(glob.glob("/opt/pw-browsers/chromium-*/chrome-linux/chrome")):
        if Path(c).is_file():
            return c
    return None


def main():
    from playwright.sync_api import sync_playwright

    RA.mkdir(exist_ok=True)
    hinh = {"bieu_do_nguyen_vong": bieu_do_nguyen_vong(),
            "bieu_do_khai_gian": bieu_do_khai_gian(),
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
    print("Đã vẽ vào", RA)


if __name__ == "__main__":
    main()
