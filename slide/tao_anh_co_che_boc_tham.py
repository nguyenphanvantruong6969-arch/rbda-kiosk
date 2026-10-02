"""Vẽ ảnh giải thích CƠ CHẾ số bốc thăm (STB), cùng phong cách với anh_suat_uu_tien.

    python slide/tao_anh_co_che_boc_tham.py

Ra slide/anh_co_che_boc_tham.svg (sửa được) và .png (rộng 3 200 px, dán vào slide).

Ba ý, mỗi ý một khung — mọi ý đối chiếu được với rbda_priority_pipeline.py:
  1. Mỗi em MỘT số, dùng chung mọi CLB       generate_stb_lottery  (một dict {mã: số})
  2. Chỉ dùng để phá hoà                     compute_club_priority (Tầng 1 bằng điểm -> STB tăng dần;
                                             Tầng 2 thuần STB tăng dần)
  3. Bốc một lần rồi khoá                    cùng TẬP mã + cùng seed -> cùng bộ số, kể cả đổi thứ tự nhập
Các số #3, #7, ... là số minh hoạ (không phải kết quả của một seed cụ thể).
"""

from pathlib import Path

from tao_anh_suat_uu_tien import (BODY, GREEN, HAIR, HEAD, INK, PAPER, SLATE, chip, chromium, t)

HERE = Path(__file__).resolve().parent
W, H = 1600, 1070
PX, PW, PH = 80, 1440, 260


def panel(py, so, title, sub, content):
    return "\n".join([
        f'<rect x="{PX}" y="{py}" width="{PW}" height="{PH}" rx="26" fill="{PAPER}" stroke="{HAIR}" stroke-width="3"/>',
        f'<circle cx="{PX + 66}" cy="{py + 50}" r="22" fill="{INK}"/>',
        t(PX + 66, py + 59, so, 26, "#FFFFFF", 700, "middle"),
        t(PX + 104, py + 64, title, 38, INK, 700, family=HEAD),
        t(PX + PW - 44, py + 62, sub, 25, SLATE, anchor="end"),
        content,
    ])


def big_arrow(ax, cy):
    return (f'<path d="M{ax},{cy - 14} H{ax + 54} V{cy - 32} L{ax + 90},{cy} L{ax + 54},{cy + 32} V{cy + 14} H{ax} Z" '
            f'fill="{SLATE}"/>')


def padlock(cx, cy):
    return (f'<path d="M{cx - 18},{cy - 4} V{cy - 22} a18,18 0 0 1 36,0 V{cy - 4}" fill="none" stroke="{SLATE}" '
            f'stroke-width="8" stroke-linecap="round"/>'
            f'<rect x="{cx - 32}" y="{cy - 6}" width="64" height="48" rx="9" fill="{SLATE}"/>'
            f'<circle cx="{cx}" cy="{cy + 16}" r="7" fill="#FFFFFF"/>'
            f'<rect x="{cx - 3}" y="{cy + 18}" width="6" height="14" rx="3" fill="#FFFFFF"/>')


# ---- 1. mỗi em một số, dùng chung mọi CLB ------------------------------------
def y1(py):
    cy = py + 165
    out = [chip(PX + 130, cy - 12, 44, "C", GREEN, size=40), t(PX + 130, cy + 64, "#12", 32, INK, 700, "middle"),
           big_arrow(280, cy)]
    for i, x in enumerate((400, 740, 1080)):
        out.append(f'<rect x="{x}" y="{cy - 65}" width="300" height="130" rx="20" fill="#FFFFFF" '
                   f'stroke="{HAIR}" stroke-width="3"/>')
        out.append(t(x + 26, cy - 32, f"CLB {i + 1}", 25, SLATE, 700))
        out.append(chip(x + 80, cy + 20, 34, "C", GREEN, size=32))
        out.append(t(x + 135, cy + 33, "#12", 40, INK, 700))
    out += [t(720, cy + 16, "=", 46, SLATE, 700, "middle"), t(1060, cy + 16, "=", 46, SLATE, 700, "middle")]
    return "\n".join(out)


# ---- 2. chỉ dùng để phá hoà ----------------------------------------------------
def y2(py):
    cy = py + 176
    out = [t(124, py + 114, "Tầng 1 · bằng điểm → số nhỏ trước", 26, INK, 700),
           t(900, py + 114, "Tầng 2 · không có điểm → thuần số bốc thăm", 26, INK, 700),
           f'<line x1="850" x2="850" y1="{py + 96}" y2="{py + 238}" stroke="{HAIR}" stroke-width="3"/>']
    for cx, who, val in ((190, "B", "9,0 · #7"), (420, "E", "9,0 · #25")):
        out += [chip(cx, cy, 36, who, GREEN, size=34), t(cx, cy + 66, val, 27, INK, anchor="middle")]
    out.append(t(305, cy + 16, "›", 60, SLATE, 700, "middle"))
    for cx, who, val in ((960, "A", "#3"), (1130, "C", "#12"), (1300, "F", "#31")):
        out += [chip(cx, cy, 36, who, GREEN, size=34), t(cx, cy + 66, val, 27, INK, anchor="middle")]
    out += [t(1045, cy + 16, "›", 60, SLATE, 700, "middle"), t(1215, cy + 16, "›", 60, SLATE, 700, "middle")]
    return "\n".join(out)


# ---- 3. bốc một lần rồi khoá ---------------------------------------------------
def y3(py):
    cy = py + 165
    out = [f'<rect x="124" y="{cy - 40}" width="230" height="80" rx="18" fill="#FFFFFF" stroke="{SLATE}" '
           f'stroke-width="3"/>', t(239, cy + 10, "hạt giống", 32, INK, 700, "middle"), big_arrow(384, cy)]
    for i, (who, val) in enumerate(zip("ABCDEF", ("#3", "#7", "#12", "#18", "#25", "#31"))):
        cx = 560 + i * 112
        out += [chip(cx, cy, 36, who, GREEN, size=34), t(cx, cy + 66, val, 27, INK, anchor="middle")]
    out += [padlock(1290, cy - 30), t(1290, cy + 58, "khoá sau khi bốc", 26, SLATE, 700, "middle")]
    return "\n".join(out)


def build():
    body = [t(80, 98, "Số bốc thăm", 62, INK, 700, family=HEAD),
            t(80, 148, "Mỗi em một số, dùng chung cho mọi CLB — số nhỏ xếp trước", 30, SLATE),
            panel(185, "1", "Mỗi em một số, dùng chung mọi CLB", "không bốc lại ở từng CLB", y1(185)),
            panel(465, "2", "Chỉ dùng để phá hoà", "điểm đứng trước, bốc thăm đứng sau", y2(465)),
            panel(745, "3", "Bốc một lần, rồi khoá", "cùng hạt giống → cùng bộ số", y3(745)),
            t(80, 1042, "Chạy lại — kể cả đổi thứ tự nhập — vẫn ra đúng bộ số đã khoá.", 25, SLATE, italic=True),
            t(W - 80, 1042, "Dữ liệu minh hoạ", 25, SLATE, anchor="end")]
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" font-family="{BODY}">\n'
            f'<rect width="{W}" height="{H}" fill="#FFFFFF"/>\n' + "\n".join(body) + "\n</svg>")


def main():
    from playwright.sync_api import sync_playwright

    s = build()
    (HERE / "anh_co_che_boc_tham.svg").write_text(s, encoding="utf-8")
    with sync_playwright() as p:
        br = p.chromium.launch(executable_path=chromium())
        pg = br.new_page(viewport={"width": W, "height": H}, device_scale_factor=3200 / W)
        pg.set_content(f'<html><head><meta charset="utf-8"><style>body{{margin:0}}</style></head><body>{s}</body></html>')
        pg.evaluate("document.fonts.ready")
        pg.wait_for_timeout(200)
        pg.screenshot(path=str(HERE / "anh_co_che_boc_tham.png"), clip={"x": 0, "y": 0, "width": W, "height": H})
        br.close()
    print("Đã vẽ vào", HERE)


if __name__ == "__main__":
    main()
