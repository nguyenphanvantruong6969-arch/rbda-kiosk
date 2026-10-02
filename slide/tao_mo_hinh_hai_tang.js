// Dựng slide "Xếp hạng hai tầng + suất ưu tiên" (một slide, mọi thứ là hình khối
// PowerPoint thật nên sửa được: bấm đúp vào chữ, đổi màu, kéo chip).
//
//     NODE_PATH=<nơi cài pptxgenjs> node slide/tao_mo_hinh_hai_tang.js
//
// Khổ 10 x 5,625 in = đúng khổ bộ TRINH_BAY_BAN_GIAM_HIEU.pptx, nên dán vào
// không bị lệch. Màu và phông chép từ bộ đó (Cambria tiêu đề, Calibri nội dung).
//
// Ví dụ chạy thật bằng club_choice_function (rbda_priority_pipeline.py):
//   6 em A..F cùng đăng ký một CLB, sức chứa 2, dự trữ 1, chỉ C thuộc diện ưu tiên;
//   A 9,5 > B 9,0 > C 8,5 (Tầng 1, có điểm) > D, E, F (Tầng 2, bốc thăm).
//   -> C (lượt dự trữ), A (lượt chung). B xếp trên C mà hết chỗ. Không có em ưu tiên thì ra A, B.

const path = require("path");
const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.title = "Xếp hạng hai tầng và suất ưu tiên";
pres.author = "";

const INK = "1C2321", SLATE = "5B6570", HAIR = "DBDCD5", PAPER = "F3F4F1";
const GREEN = "3F6B52", GREEN_SOFT = "DCE9E0";
const GOLD = "C98A1F", GOLD_D = "A8700F", GOLD_SOFT = "F8EBCF";
const HEAD = "Cambria", BODY = "Calibri";

const s = pres.addSlide();
s.background = { color: "FFFFFF" };

// ---- phần tử dùng lại -----------------------------------------------------
const chip = (name, x, y, d, letter, fill, color, size) =>
  s.addText(letter, {
    shape: pres.shapes.OVAL, x, y, w: d, h: d, fill: { color: fill }, color,
    fontFace: BODY, fontSize: size, bold: true, align: "center", valign: "middle",
    margin: 0, objectName: name,
  });

const card = (name, x, y, w, h, fill, line) =>
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, rectRadius: 0.1, fill: { color: fill },
    line: line ? { color: line, width: 1 } : { type: "none" }, objectName: name,
  });

const text = (name, str, x, y, w, h, o = {}) =>
  s.addText(str, {
    x, y, w, h, margin: 0, valign: "middle", fontFace: BODY, color: INK,
    isTextBox: true, objectName: name, ...o,
  });

// ---- tiêu đề --------------------------------------------------------------
text("Tiêu đề", "Xếp hạng hai tầng và suất ưu tiên", 0.5, 0.3, 9, 0.55,
  { fontFace: HEAD, fontSize: 28, bold: true });
text("Phụ đề", "Ví dụ: 6 em cùng đăng ký một câu lạc bộ nhận 2 em — 1 suất ưu tiên và 1 suất chung",
  0.5, 0.88, 9, 0.3, { fontSize: 14, color: SLATE });

// ---- cột trái: xếp hạng hai tầng -----------------------------------------
const LX = 0.5, LW = 4.0, TOP = 1.4;
chip("Số 1", LX, TOP, 0.34, "1", INK, "FFFFFF", 13);
text("Tên bước 1", "Xếp hạng", LX + 0.46, TOP, 1.5, 0.34, { fontFace: HEAD, fontSize: 18, bold: true });
text("Ghi chú bước 1", "Tầng 1 luôn đứng trước tầng 2", LX + 1.55, TOP, LW - 1.55, 0.34,
  { fontSize: 12, color: SLATE, align: "right" });

const tiers = [
  { y: 1.95, name: "Tầng 1 · Đã thi", rule: "theo điểm", labelColor: GREEN,
    rows: [["1", "A", "điểm 9,5"], ["2", "B", "điểm 9,0"], ["3", "C", "điểm 8,5", true]] },
  { y: 3.5, name: "Tầng 2 · Không thi", rule: "theo số bốc thăm, số nhỏ trước", labelColor: SLATE,
    rows: [["4", "D", "bốc thăm #2"], ["5", "E", "bốc thăm #5"], ["6", "F", "bốc thăm #9"]] },
];
tiers.forEach((t, ti) => {
  card(`Khung ${t.name}`, LX, t.y, LW, 1.45, PAPER, HAIR);
  text(`Nhãn ${t.name}`, t.name, LX + 0.2, t.y + 0.08, 1.9, 0.28,
    { fontSize: 13, bold: true, color: t.labelColor });
  text(`Quy tắc ${t.name}`, t.rule, LX + 1.75, t.y + 0.08, LW - 1.95, 0.28,
    { fontSize: 11, color: SLATE, align: "right" });
  t.rows.forEach(([rank, who, val, prio], i) => {
    const ry = t.y + 0.42 + i * 0.33;
    text(`Hạng ${who}`, rank, LX + 0.2, ry, 0.25, 0.3, { fontSize: 12, color: SLATE });
    chip(`Chip ${who}`, LX + 0.5, ry, 0.3, who, prio ? GOLD_D : GREEN, "FFFFFF", 12);
    const runs = [{ text: val, options: { color: INK } }];
    if (prio) runs.push({ text: "  ·  ưu tiên", options: { color: GOLD_D, bold: true } });
    text(`Giá trị ${who}`, runs, LX + 0.95, ry, LW - 1.15, 0.3, { fontSize: 13 });
  });
});

// ---- mũi tên giữa -----------------------------------------------------------
s.addShape(pres.shapes.RIGHT_ARROW, {
  x: 4.62, y: 3.2, w: 0.42, h: 0.4, fill: { color: SLATE }, line: { type: "none" },
  objectName: "Mũi tên",
});

// ---- cột phải: chia suất hai lượt ----------------------------------------
const RX = 5.2, RW = 4.3;
chip("Số 2", RX, TOP, 0.34, "2", INK, "FFFFFF", 13);
text("Tên bước 2", "Chia suất", RX + 0.46, TOP, 1.5, 0.34, { fontFace: HEAD, fontSize: 18, bold: true });
text("Ghi chú bước 2", "Ưu tiên lấy trước, còn lại chia chung", RX + 1.4, TOP, RW - 1.4, 0.34,
  { fontSize: 12, color: SLATE, align: "right" });

const seat = (name, x, y, who, fill, line) => {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w: 0.72, h: 0.72, rectRadius: 0.1, fill: { color: "FFFFFF" },
    line: { color: line, width: 1.5 }, objectName: `Ô suất ${name}`,
  });
  chip(`Chip ${who} (kết quả)`, x + 0.11, y + 0.11, 0.5, who, fill, "FFFFFF", 18);
};

const lanes = [
  { y: 1.95, tag: "LƯỢT 1", title: "Suất ưu tiên · 1 suất", desc: "Chỉ xét em thuộc diện ưu tiên",
    bg: GOLD_SOFT, tagColor: GOLD_D, line: GOLD, seats: [["C", GOLD_D]] },
  { y: 3.17, tag: "LƯỢT 2", title: "Suất chung · 1 suất", desc: "Xét mọi em còn lại, theo thứ hạng",
    bg: GREEN_SOFT, tagColor: GREEN, line: GREEN, seats: [["A", GREEN]] },
];
lanes.forEach((l) => {
  card(`Khung ${l.tag}`, RX, l.y, RW, 1.1, l.bg);
  text(`Nhãn ${l.tag}`, l.tag, RX + 0.2, l.y + 0.1, 1.5, 0.22,
    { fontSize: 11, bold: true, color: l.tagColor, charSpacing: 1 });
  text(`Tên ${l.tag}`, l.title, RX + 0.2, l.y + 0.34, 2.3, 0.3, { fontSize: 15, bold: true });
  text(`Mô tả ${l.tag}`, l.desc, RX + 0.2, l.y + 0.66, 2.3, 0.38, { fontSize: 11, color: SLATE, valign: "top" });
  l.seats.forEach(([who, fill], i) => {
    const n = l.seats.length;
    seat(who, RX + RW - 0.2 - n * 0.72 - (n - 1) * 0.12 + i * 0.84, l.y + 0.19, who, fill, l.line);
  });
});

// hàng "chưa có suất"
text("Nhãn chưa có suất", "Chưa có suất", RX, 4.4, 1.15, 0.34, { fontSize: 13, bold: true, color: SLATE });
["B", "D", "E", "F"].forEach((who, i) =>
  chip(`Chip ${who} (chưa có suất)`, RX + 1.2 + i * 0.42, 4.4, 0.34, who, HAIR, SLATE, 13));
text("Ghi chú C", "B xếp trên C nhưng suất ưu tiên đã thuộc về C", RX, 4.76, RW, 0.22,
  { fontSize: 11, color: SLATE, italic: true });

// ---- chân trang -----------------------------------------------------------
chip("Chú giải chấm vàng", 0.5, 5.2, 0.14, "", GOLD_D, "FFFFFF", 8);
text("Chú giải", "Em thuộc diện ưu tiên", 0.72, 5.15, 2.5, 0.24, { fontSize: 11, color: SLATE });
text("Nhãn AI", "Dữ liệu minh hoạ", 5.5, 5.15, 4.0, 0.24,
  { fontSize: 11, color: SLATE, align: "right" });

s.addNotes(
  "Ví dụ chạy thật bằng hàm lựa chọn của phần mềm (club_choice_function): 6 em A–F cùng đăng ký một CLB, " +
  "sức chứa 2, 1 suất dự trữ (ưu tiên), chỉ C thuộc diện ưu tiên. " +
  "Xếp hạng: Tầng 1 (đã thi) theo điểm, hoà điểm mới tới số bốc thăm; Tầng 2 (không thi) thuần số bốc thăm; Tầng 1 luôn trước Tầng 2. " +
  "Chia suất hai lượt: lượt 1 chỉ xét em diện ưu tiên (C); lượt 2 xét mọi em còn lại theo thứ hạng (A). " +
  "B xếp trên C nhưng hết chỗ vì C đã lấy suất ưu tiên. " +
  "Suất ưu tiên là suất mềm: nếu không có em nào thuộc diện thì suất tự chuyển sang lượt chung (khi đó kết quả là A, B)."
);

const out = path.join(__dirname, "mo_hinh_hai_tang_suat_uu_tien.pptx");
pres.writeFile({ fileName: out }).then(() => console.log("Đã ghi", out));
