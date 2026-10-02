// Dựng slide "tòa nhà": hai tầng xếp hạng + suất ưu tiên trên sân thượng.
// Một slide, mọi thứ là hình khối PowerPoint thật nên sửa được.
//
//     NODE_PATH=<nơi cài pptxgenjs> node slide/tao_mo_hinh_toa_nha.js
//
// Cách đọc tòa nhà (bản vẽ mặt cắt, nhìn từ dưới lên):
//   - Tầng 1 (đã thi, xếp theo điểm) ở dưới, Tầng 2 (không thi, xếp theo bốc thăm) ở trên
//     -> "Tầng 1 luôn đứng trước Tầng 2" thành "xét từ dưới lên".
//   - Sân thượng là 2 chỗ trong CLB: 1 ô vàng (suất ưu tiên, lượt 1) + 1 ô xanh (suất chung, lượt 2).
//   - Em đã có chỗ để lại vòng nét đứt ở tầng của mình; em chưa có chỗ vẫn đứng đó (xám).
//
// Ví dụ chạy thật bằng club_choice_function (rbda_priority_pipeline.py):
//   6 em A..F cùng đăng ký một CLB, sức chứa 2, dự trữ 1, chỉ C thuộc diện ưu tiên;
//   A 9,5 > B 9,0 > C 8,5 (Tầng 1, có điểm) > D, E, F (Tầng 2, bốc thăm).
//   -> C (lượt dự trữ), A (lượt chung). B xếp trên C mà hết chỗ. Không có em ưu tiên thì ra A, B.
// Khổ, màu, phông giống slide/tao_mo_hinh_hai_tang.js và TRINH_BAY_BAN_GIAM_HIEU.pptx.

const path = require("path");
const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.title = "Xếp hạng hai tầng và suất ưu tiên — mô hình tòa nhà";
pres.author = "";

const INK = "1C2321", SLATE = "5B6570", HAIR = "DBDCD5", PAPER = "F3F4F1";
const GREEN = "3F6B52", GREEN_SOFT = "DCE9E0";
const GOLD_D = "A8700F", GOLD_SOFT = "F8EBCF";
const HEAD = "Cambria", BODY = "Calibri";

const s = pres.addSlide();
s.background = { color: "FFFFFF" };

// ---- phần tử dùng lại -----------------------------------------------------
const chip = (name, x, y, d, letter, fill, color, size, line) =>
  s.addText(letter, {
    shape: pres.shapes.OVAL, x, y, w: d, h: d,
    fill: { color: fill }, line: line || { type: "none" }, color,
    fontFace: BODY, fontSize: size, bold: true, align: "center", valign: "middle",
    margin: 0, objectName: name,
  });

const rect = (name, x, y, w, h, fill, line) =>
  s.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h, fill: { color: fill }, line: line || { type: "none" }, objectName: name,
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

// ---- hình học tòa nhà -----------------------------------------------------
const BX0 = 2.0, BX1 = 7.1, COL = (BX1 - BX0) / 3;          // 3 phòng mỗi tầng
const colCenter = (i) => BX0 + COL * (i + 0.5);
const Y_TERRACE = 1.3, Y_ROOF = 2.3, Y_F2 = 2.4, Y_SLAB = 3.42, Y_F1 = 3.5, Y_GROUND = 4.52;
const FLOOR_H = 1.02;

// thân nhà: tường + vách ngăn phòng + sàn
rect("Thân tòa nhà", BX0, Y_F2, BX1 - BX0, Y_GROUND - Y_F2, PAPER, { color: INK, width: 2.25 });
[1, 2].forEach((i) =>
  s.addShape(pres.shapes.LINE, {
    x: BX0 + COL * i, y: Y_F2, w: 0, h: Y_GROUND - Y_F2,
    line: { color: HAIR, width: 1.25 }, objectName: `Vách phòng ${i}`,
  }));
rect("Mái", BX0 - 0.1, Y_ROOF, BX1 - BX0 + 0.2, 0.1, INK);
rect("Sàn tầng 2", BX0, Y_SLAB, BX1 - BX0, 0.08, INK);
rect("Nền móng", BX0 - 0.2, Y_GROUND, BX1 - BX0 + 0.4, 0.1, INK);

// ---- sân thượng: 2 chỗ trong CLB -----------------------------------------
const HALF = (BX1 - BX0) / 2;                                  // hai vùng sân thượng chia đôi
rect("Sân thượng ưu tiên", BX0, Y_TERRACE, HALF - 0.02, Y_ROOF - Y_TERRACE, GOLD_SOFT);
rect("Sân thượng chung", BX0 + HALF + 0.02, Y_TERRACE, HALF - 0.02, Y_ROOF - Y_TERRACE, GREEN_SOFT);
text("Nhãn suất ưu tiên", "Suất ưu tiên · 1", BX0, Y_TERRACE + 0.07, HALF - 0.02, 0.24,
  { fontSize: 13, bold: true, color: GOLD_D, align: "center" });
text("Nhãn suất chung", "Suất chung · 1", BX0 + HALF + 0.02, Y_TERRACE + 0.07, HALF - 0.02, 0.24,
  { fontSize: 13, bold: true, color: GREEN, align: "center" });

const seat = (who, cx, fill, line) => {
  const sz = 0.64, x = cx - sz / 2, y = Y_TERRACE + 0.34;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w: sz, h: sz, rectRadius: 0.1, fill: { color: "FFFFFF" },
    line: { color: line, width: 1.5 }, objectName: `Ô chỗ ${who}`,
  });
  chip(`Chip ${who} (có chỗ)`, cx - 0.23, y + 0.09, 0.46, who, fill, "FFFFFF", 17);
};
seat("C", BX0 + HALF / 2, GOLD_D, GOLD_D);
seat("A", BX0 + HALF * 1.5, GREEN, GREEN);

// ---- hai tầng: học sinh đứng theo hạng, trái -> phải ---------------------
const floors = [
  { y: Y_F2, tier: "Tầng 2", who: "Không thi", rule: "theo bốc thăm",
    kids: [["D", "#2"], ["E", "#5"], ["F", "#9"]] },
  { y: Y_F1, tier: "Tầng 1", who: "Đã thi", rule: "theo điểm",
    kids: [["A", "9,5", "in"], ["B", "9,0"], ["C", "8,5", "prio"]] },
];
floors.forEach((f) => {
  // bảng hiệu ngoài tường bên trái
  text(`Bảng hiệu ${f.tier}`, [
    { text: f.tier, options: { fontFace: HEAD, fontSize: 20, bold: true, breakLine: true } },
    { text: f.who, options: { fontSize: 12, color: SLATE, breakLine: true } },
    { text: f.rule, options: { fontSize: 12, color: SLATE } },
  ], 0.5, f.y, 1.4, FLOOR_H);

  f.kids.forEach(([who, val, state], i) => {
    const cx = colCenter(i), x = cx - 0.26, y = f.y + 0.12;
    if (state) {
      // đã có chỗ trên sân thượng: để lại vòng nét đứt
      const col = state === "prio" ? GOLD_D : GREEN;
      chip(`Chip ${who} (đã lên)`, x, y, 0.52, who, PAPER, col, 17,
        { color: col, width: 1.75, dashType: "dash" });
    } else {
      chip(`Chip ${who} (chưa có chỗ)`, x, y, 0.52, who, HAIR, SLATE, 17);
    }
    const runs = [{ text: val, options: { color: INK } }];
    if (state === "prio") runs.push({ text: "  ·  ưu tiên", options: { color: GOLD_D, bold: true } });
    text(`Giá trị ${who}`, runs, BX0 + COL * i, f.y + 0.7, COL, 0.24, { fontSize: 13, align: "center" });
  });
});

// bảng hiệu sân thượng + cổng vào
text("Bảng hiệu CLB", [
  { text: "CLB", options: { fontFace: HEAD, fontSize: 20, bold: true, breakLine: true } },
  { text: "2 chỗ", options: { fontSize: 12, color: SLATE } },
], 0.5, Y_TERRACE, 1.4, Y_ROOF - Y_TERRACE);
text("Cổng vào", "Cổng vào · 6 em đăng ký", BX0, 4.68, BX1 - BX0, 0.26,
  { fontSize: 12, color: SLATE, align: "center" });

// ---- chú thích bên phải ---------------------------------------------------
s.addShape(pres.shapes.UP_ARROW, {
  x: 7.5, y: 2.55, w: 0.3, h: 1.5, fill: { color: SLATE }, line: { type: "none" },
  objectName: "Mũi tên xét từ dưới lên",
});
text("Thứ tự xét", [
  { text: "Xét từ dưới lên", options: { bold: true, breakLine: true } },
  { text: "Tầng 1 trước, rồi tầng 2", options: { color: SLATE } },
], 7.95, 2.55, 1.55, 1.5, { fontSize: 13, valign: "top" });

chip("Chip B (ghi chú)", 7.5, 4.3, 0.3, "B", HAIR, SLATE, 12);
text("Ghi chú B", "xếp trên C nhưng hết chỗ: C đã lấy suất ưu tiên", 7.95, 4.18, 1.55, 0.62,
  { fontSize: 11, italic: true, color: SLATE, valign: "top" });

// ---- chân trang -----------------------------------------------------------
chip("Chú giải chấm vàng", 0.5, 5.2, 0.14, "", GOLD_D, "FFFFFF", 8);
text("Chú giải ưu tiên", "Em thuộc diện ưu tiên", 0.72, 5.15, 1.8, 0.24, { fontSize: 11, color: SLATE });
chip("Chú giải nét đứt", 2.75, 5.2, 0.14, "", PAPER, SLATE, 8, { color: SLATE, width: 1, dashType: "dash" });
text("Chú giải nét đứt", "Nét đứt: đã có chỗ ở sân thượng", 2.97, 5.15, 2.6, 0.24, { fontSize: 11, color: SLATE });
text("Nhãn dữ liệu", "Dữ liệu minh hoạ", 5.5, 5.15, 4.0, 0.24,
  { fontSize: 11, color: SLATE, align: "right" });

s.addNotes(
  "Cách đọc tòa nhà: mỗi tầng lầu là một tầng xếp hạng. Tầng 1 (đã thi) xếp theo điểm, hoà điểm mới tới số bốc thăm; " +
  "Tầng 2 (không thi) xếp thuần theo số bốc thăm. Tầng 1 luôn đứng trọn trước Tầng 2 nên xét từ dưới lên. " +
  "Sân thượng là 2 chỗ trong CLB. Lượt 1 chỉ xét em diện ưu tiên cho suất ưu tiên: C (có điểm 8,5, diện ưu tiên). " +
  "Lượt 2 xét mọi em còn lại theo thứ hạng cho suất chung: A. " +
  "B xếp trên C nhưng hết chỗ vì C đã lấy suất ưu tiên. " +
  "Suất ưu tiên là suất mềm: nếu không có em nào thuộc diện thì suất chuyển sang lượt chung (khi đó là A, B). " +
  "Ví dụ chạy thật bằng club_choice_function của phần mềm."
);

const out = path.join(__dirname, "mo_hinh_toa_nha.pptx");
pres.writeFile({ fileName: out }).then(() => console.log("Đã ghi", out));
