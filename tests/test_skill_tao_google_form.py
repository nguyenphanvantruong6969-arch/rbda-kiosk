# -*- coding: utf-8 -*-
"""Skill `tao-google-form-clb`: tệp Excel -> TAO_GOOGLE_FORM.gs + hướng dẫn.

Ba phép kiểm:
  1. vòng tròn: tệp mẫu (bộ đề ví dụ) -> .gs giống hệt tệp .gs trong kho;
  2. soát: điền sai thì không ghi tệp nào, và báo đúng dòng;
  3. chạy thật đoạn mã sinh ra trên bản giả lập FormApp (cần Node): CLB không
     thi không có trong câu tick, rẽ nhánh chỉ hiện đề CLB được chọn.
"""

import importlib.util
import json
import os
import shutil
import subprocess

import pytest

openpyxl = pytest.importorskip("openpyxl")

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRIPT = os.path.join(GOC, ".claude", "skills", "tao-google-form-clb", "scripts", "tao_form.py")


@pytest.fixture(scope="module")
def tf():
    spec = importlib.util.spec_from_file_location("tao_form", SCRIPT)
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


def _sua(duong, trang, sua):
    """sua(ws): chỉnh một trang của tệp Excel rồi lưu."""
    wb = openpyxl.load_workbook(duong)
    sua(wb[trang])
    wb.save(duong)


def test_vong_tron_ra_dung_tep_gs_trong_kho(tf, tmp_path):
    mau = str(tmp_path / "MAU.xlsx")
    assert tf.main(["mau", "--ra", mau]) == 0
    assert tf.main(["tao", "--vao", mau, "--ra", str(tmp_path / "ra")]) == 0
    with open(os.path.join(GOC, "mau_forms_thi_clb", "TAO_GOOGLE_FORM.gs"), encoding="utf-8") as f:
        goc = f.read()
    with open(str(tmp_path / "ra" / "TAO_GOOGLE_FORM.gs"), encoding="utf-8") as f:
        assert f.read() == goc
    with open(str(tmp_path / "ra" / "HUONG_DAN_TUNG_BUOC.md"), encoding="utf-8") as f:
        hd = f.read()
    assert "—" not in hd and "–" not in hd
    assert "167 câu hỏi" in hd and "taoBieuMau" in hd and "chamTheoCLB" in hd


def test_dien_sai_thi_khong_ghi_gi(tf, tmp_path):
    mau = str(tmp_path / "MAU.xlsx")
    tf.main(["mau", "--ra", mau])

    def hong(ws):
        ws["C3"] = "clb_covua"          # CLB dòng 3 trùng mã với dòng 2
        ws["A4"] = "thu_9"              # buổi không hợp lệ

    def hong_de(ws):
        ws["G2"] = "e"                  # đáp án ngoài a..d
        ws["D3"] = ws["C3"].value       # hai lựa chọn giống nhau
    _sua(mau, "CLB", hong)
    _sua(mau, "De_thi", hong_de)
    ra = tmp_path / "ra"
    with pytest.raises(tf.LoiDuLieu) as e:
        tf.tao(mau, str(ra))
    s = str(e.value)
    assert "CLB dòng 3" in s and "bị trùng" in s
    assert "CLB dòng 4" in s and "thu_9" in s
    assert "De_thi dòng 2" in s and "dap_an" in s
    assert "De_thi dòng 3" in s and "giống nhau" in s
    assert not ra.exists()
    assert tf.main(["tao", "--vao", mau, "--ra", str(ra)]) == 1


def test_qua_10_clb_mot_buoi_va_tran_qua_5(tf, tmp_path):
    mau = str(tmp_path / "MAU.xlsx")
    tf.main(["mau", "--ra", mau])

    def them(ws):
        ws.append(["thu_2", "Thứ Hai", "clb_them", "CLB Thêm"])

    def cai(ws):
        ws["B4"] = 6
    _sua(mau, "CLB", them)
    _sua(mau, "Cai_dat", cai)
    with pytest.raises(tf.LoiDuLieu) as e:
        tf.tao(mau, str(tmp_path / "ra"))
    assert "thu_2 có 11 CLB" in str(e.value) and "toi_da_clb_thi_moi_buoi" in str(e.value)


def _bo_de_nho(tf, tmp_path, tran=2):
    """Hai buổi: Thứ Hai có 3 CLB (1 CLB không thi), Thứ Tư chỉ có CLB không thi."""
    from openpyxl import Workbook
    wb = Workbook()
    ws = wb.active
    ws.title = "Cai_dat"
    for r in (["khoa", "gia_tri"], ["tieu_de", "Form thử"], ["diem_moi_cau", 4],
              ["toi_da_clb_thi_moi_buoi", tran]):
        ws.append(r)
    c = wb.create_sheet("CLB")
    c.append(tf.COT_CLB)
    for r in (["thu_2", "", "clb_a", "CLB A"], ["thu_2", "", "clb_b", "CLB B (mới)"],
              ["thu_2", "", "clb_c", "CLB C"], ["thu_4", "", "clb_d", "CLB D"]):
        c.append(r)
    d = wb.create_sheet("De_thi")
    d.append(tf.COT_DE)
    d.append(["clb_a", "1 + 1 = ?", "2", "3", "", "", "a"])
    d.append(["clb_c", "Thủ đô Việt Nam?", "Huế", "Hà Nội", "Đà Nẵng", "", "B"])
    d.append(["clb_c", "5 x 5 = ?", "10", "25", "", "", "b"])
    p = str(tmp_path / "nho.xlsx")
    wb.save(p)
    return p


def test_clb_khong_thi_va_buoi_khong_co_ai_thi(tf, tmp_path):
    du_lieu, canh_bao = tf.tao(_bo_de_nho(tf, tmp_path), str(tmp_path / "ra"))
    assert [d["ten"] for d in du_lieu] == ["Thứ Hai", "Thứ Tư"]      # tên buổi tự điền
    assert [len(c["de"]) for c in du_lieu[0]["clubs"]] == [1, 0, 2]
    assert du_lieu[0]["clubs"][2]["de"][0]["dung"] == "Hà Nội"         # "B" viết hoa vẫn nhận
    noi = " | ".join(canh_bao)
    assert "CLB B (mới)" in noi and "Thứ Tư không có CLB nào tổ chức thi" in noi
    # 2 + Thứ Hai (2 + tick + trước + 1 tiếp theo + 3 câu đề) + Thứ Tư (2)
    assert tf.dem_cau(du_lieu) == 2 + (2 + 2 + 1 + 3) + 2


MOCK = r"""
const fs = require('fs');
const items = []; const SUBMIT = 'SUBMIT';
function base(type) { const o = {type, title: '', choices: [], values: [],
  setTitle(t) { this.title = t; return this; }, setRequired() { return this; }, setHelpText() { return this; },
  setPoints(p) { this.points = p; return this; }, setRows(r) { this.rows = r; return this; },
  setColumns(c) { this.cols = c; return this; }, setChoiceValues(v) { this.values = v; return this; },
  setValidation(v) { this.val = v; return this; },
  createChoice(v, x) { return {v, nav: (x === true || x === false) ? undefined : x, correct: x === true}; },
  setChoices(c) { this.choices = c; return this; }}; items.push(o); return o; }
const form = {setIsQuiz() { return this; }, setDescription() { return this; }, setShuffleQuestions() { return this; },
  setProgressBar() { return this; }, setShowLinkToRespondAgain() { return this; }, setPublishingSummary() { return this; },
  setConfirmationMessage() { return this; }, setPublished() { return this; }, getId: () => 'F',
  addTextItem: () => base('text'), addPageBreakItem: () => base('page'), addMultipleChoiceItem: () => base('mc'),
  addGridItem: () => base('grid'), addCheckboxItem: () => base('cb'), getEditUrl: () => 'e', getPublishedUrl: () => 'p'};
function vb() { return {setHelpText() { return this; }, requireLimitOneResponsePerColumn() { return this; },
  requireSelectAtMost(n) { this.max = n; return this; }, build() { return {max: this.max}; }}; }
let title = null;
global.FormApp = {create: (t) => { title = t; return form; }, PageNavigationType: {SUBMIT},
  createGridValidation: vb, createCheckboxValidation: vb};
global.Logger = {log() {}};
global.PropertiesService = {getScriptProperties: () => ({setProperty() {}})};
eval(fs.readFileSync(process.argv[2], 'utf8').replace(/^const /gm, 'var ')); taoBieuMau();
const pages = [[]], pageOf = new Map();
items.forEach(it => { if (it.type === 'page') { pages.push([]); pageOf.set(it, pages.length - 1); } else pages[pages.length - 1].push(it); });
function walk(pick) { let p = 0, seen = []; while (p < pages.length) { let nav = null;
  for (const q of pages[p]) { seen.push(q.title.match(/^\[([^\]]+)\]/)[1]);
    if (q.type === 'mc') { const v = pick(q); const c = q.choices.find(x => x.v === v); if (!c) throw new Error(v); if (c.nav) nav = c.nav; } }
  if (nav === SUBMIT) break; p = nav ? pageOf.get(nav) : p + 1; } return seen; }
const cb = items.filter(i => i.type === 'cb');
const firstSel = items.find(i => i.title.startsWith('[thi-thu_2]'));
const s = walk(q => { const t = q.title;
  if (t.startsWith('[di-')) return CO_BUOI;
  if (t.startsWith('[thi-thu_2]')) return 'CLB C (clb_c)';
  return q.choices[0].v; });
console.log(JSON.stringify({title, n: items.filter(i => i.type !== 'page').length,
  cb: cb.map(c => [c.values, c.val.max]), first: firstSel.choices.map(c => c.v),
  points: items.filter(i => i.points).map(i => i.points), walk: s}));
"""


@pytest.mark.skipif(shutil.which("node") is None, reason="cần Node.js để chạy bản giả lập FormApp")
def test_ma_sinh_ra_chay_dung_tren_ban_gia_lap(tf, tmp_path):
    du_lieu, _ = tf.tao(_bo_de_nho(tf, tmp_path), str(tmp_path / "ra"))
    js = tmp_path / "mock.js"
    js.write_text(MOCK, encoding="utf-8")
    out = subprocess.run(["node", str(js), str(tmp_path / "ra" / "TAO_GOOGLE_FORM.gs")],
                         capture_output=True, text=True, check=True).stdout
    kq = json.loads(out)
    assert kq["title"] == "Form thử"
    assert kq["n"] == tf.dem_cau(du_lieu)
    # CLB B không thi: không có trong câu tick và trang chọn; Thứ Tư không có câu tick.
    assert kq["cb"] == [[["CLB A (clb_a)", "CLB C (clb_c)"], 2]]
    assert kq["first"] == ["CLB A (clb_a)", "CLB C (clb_c)", "Em không thi CLB nào buổi này"]
    assert set(kq["points"]) == {4}
    # Chọn CLB C trước: không thấy đề CLB A, làm xong CLB C (cuối) là sang Thứ Tư.
    assert kq["walk"] == ["student_id", "name", "di-thu_2", "thu_2", "chon-thu_2", "thi-thu_2",
                          "clb_c-1", "clb_c-2", "di-thu_4", "thu_4"]
