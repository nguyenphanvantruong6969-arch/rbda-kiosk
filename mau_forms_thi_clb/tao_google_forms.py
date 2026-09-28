"""Sinh đoạn mã Google Apps Script dựng biểu mẫu 6 buổi trên Google Forms.

    python mau_forms_thi_clb/tao_google_forms.py

Ghi ra mau_forms_thi_clb/TAO_GOOGLE_FORM.gs. Dán tệp đó vào script.google.com
và chạy hàm taoBieuMau: biểu mẫu được dựng đủ câu hỏi, đáp án, điểm và rẽ
nhánh, không phải đặt tay chỗ nào.

Dữ liệu CLB và đề thi lấy từ THIET_KE_6_PHAN.html (qua tao_word_6_phan.py),
thứ tự lựa chọn xáo giống hệt tệp nhập Microsoft Forms và trang chạy thử.
"""

import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import tao_nhap_forms_6_phan as tn  # noqa: E402
import tao_word_6_phan as tw  # noqa: E402

RA = os.path.join(tw.THU_MUC, "TAO_GOOGLE_FORM.gs")

MAU = r"""/**
 * Dựng biểu mẫu Google Forms "Đăng ký CLB và thi tuyển".
 *
 * TỆP NÀY DO tao_google_forms.py SINH RA. Sửa đề thì sửa THIET_KE_6_PHAN.html
 * rồi chạy lại tao_google_forms.py, không sửa tay danh sách BUOI bên dưới.
 *
 * Cách dùng:
 *   1. Mở script.google.com, bấm "Dự án mới".
 *   2. Xoá hết chữ có sẵn, dán toàn bộ tệp này vào, bấm Lưu.
 *   3. Chọn hàm taoBieuMau ở thanh trên, bấm Chạy, cho phép quyền truy cập.
 *   4. Mở "Nhật ký thực thi" để lấy đường dẫn sửa và đường dẫn gửi học sinh.
 *
 * Mỗi lần chạy tạo một biểu mẫu MỚI trong Google Drive, không sửa biểu mẫu cũ.
 *
 * Chấm điểm theo từng CLB (sau khi học sinh nộp):
 *   Chọn hàm chamTheoCLB, bấm Chạy. Hàm tạo trong Google Drive một thư mục
 *   "Kết quả CLB <ngày giờ>" chứa các tệp Excel: bảng điểm, 3 tệp nạp
 *   phần mềm xếp CLB, dữ liệu raw đã chấm từng câu, và đáp án. Đường dẫn thư mục nằm trong "Nhật ký thực thi".
 *   Nếu biểu mẫu được tạo bằng bản mã cũ (trước khi có hàm này), dán đường
 *   dẫn SỬA biểu mẫu vào LINK_BIEU_MAU bên dưới trước khi chạy.
 */

// Để trống nếu biểu mẫu được tạo bằng chính dự án này sau khi có hàm chamTheoCLB.
const LINK_BIEU_MAU = '';

const DIEM_CAU = %(diem)d;
const TRAN_THI = %(tran)d;
const CO_BUOI = %(co_buoi)s;
const KHONG_BUOI = %(khong_buoi)s;
const CO = %(co)s;
const KHONG = %(khong)s;
const DUNG = %(dung)s;

// [{ma, ten, clubs: [{id, name, de: [{q, opts, dung}]}]}]
const BUOI = %(buoi)s;

function taoBieuMau() {
  const form = FormApp.create('Đăng ký CLB và thi tuyển');
  form.setIsQuiz(true)
      .setDescription('Xếp hạng CLB từng buổi từ Thứ Hai tới Thứ Sáu. Muốn thi CLB nào thì chọn "Có" để làm đề thi của CLB đó. Mỗi buổi thi tối đa ' + TRAN_THI + ' CLB.')
      .setShuffleQuestions(false)
      .setProgressBar(true)
      .setShowLinkToRespondAgain(false)
      .setPublishingSummary(false)
      .setConfirmationMessage('Em đã nộp phiếu. Cảm ơn em.');

  form.addTextItem().setTitle('[student_id] Mã học sinh').setRequired(true);
  form.addTextItem().setTitle('[name] Họ và tên').setRequired(true);

  // Bước 1: tạo đủ các trang và câu hỏi theo đúng thứ tự.
  const days = BUOI.map(function (d) {
    const trangBuoi = form.addPageBreakItem().setTitle(d.ten);
    const cauBuoi = form.addMultipleChoiceItem()
        .setTitle('[di-' + d.ma + '] Em có đăng ký sinh hoạt ' + d.ten + ' không?')
        .setRequired(true);

    const trangXep = form.addPageBreakItem()
        .setTitle(d.ten + ': xếp hạng CLB')
        .setHelpText('Mỗi CLB chọn một hạng, mỗi hạng chỉ dùng cho một CLB. Hạng 1 là CLB em thích nhất.');
    const xep = form.addGridItem()
        .setTitle('[' + d.ma + '] Xếp hạng các CLB ' + d.ten)
        .setRows(d.clubs.map(function (c) { return c.name + ' (' + c.id + ')'; }))
        .setColumns(d.clubs.map(function (_, i) { return 'Hạng ' + (i + 1); }))
        .setRequired(true);
    xep.setValidation(FormApp.createGridValidation()
        .setHelpText('Mỗi hạng chỉ chọn cho một CLB.')
        .requireLimitOneResponsePerColumn()
        .build());

    // Google chặn cứng: không tick được quá TRAN_THI CLB. Chỉ bài thi của CLB
    // đã tick ở đây mới được tính điểm (xem chamTheoCLB).
    const chon = form.addCheckboxItem()
        .setTitle('[chon-' + d.ma + '] Chọn các CLB em muốn thi ' + d.ten + ' (tối đa ' + TRAN_THI + ')')
        .setHelpText('Không thi CLB nào thì bỏ trống. Chỉ bài thi của CLB em tick ở đây mới được tính điểm.')
        .setChoiceValues(d.clubs.map(function (c) { return c.name + ' (' + c.id + ')'; }));
    chon.setValidation(FormApp.createCheckboxValidation()
        .setHelpText('Chỉ được chọn tối đa ' + TRAN_THI + ' CLB.')
        .requireSelectAtMost(TRAN_THI)
        .build());

    const clubs = d.clubs.map(function (c) {
      const trangCong = form.addPageBreakItem().setTitle(d.ten + ': ' + c.name);
      const cong = form.addMultipleChoiceItem()
          .setTitle('[thi-' + c.id + '] Thi ' + c.name + '? Chỉ chọn Có nếu em đã tick CLB này ở câu chọn CLB muốn thi.')
          .setRequired(true);
      const trangDe = form.addPageBreakItem().setTitle('Đề thi ' + c.name);
      c.de.forEach(function (q, j) {
        const it = form.addMultipleChoiceItem()
            .setTitle('[' + c.id + '-' + (j + 1) + '] ' + q.q)
            .setPoints(DIEM_CAU)
            .setRequired(true);
        it.setChoices(q.opts.map(function (o) { return it.createChoice(o, o === q.dung); }));
      });
      return {trangCong: trangCong, cong: cong, trangDe: trangDe};
    });
    return {trangBuoi: trangBuoi, cauBuoi: cauBuoi, trangXep: trangXep, clubs: clubs};
  });

  // Bước 2: nối rẽ nhánh. Làm xong đề thi một CLB, Google tự sang trang kế
  // tiếp, chính là câu "Thi CLB ...?" của CLB sau, nên đề thi không cần rẽ nhánh.
  days.forEach(function (d, k) {
    const sau = k + 1 < days.length ? days[k + 1].trangBuoi : FormApp.PageNavigationType.SUBMIT;
    d.cauBuoi.setChoices([
      d.cauBuoi.createChoice(CO_BUOI, d.trangXep),
      d.cauBuoi.createChoice(KHONG_BUOI, sau)
    ]);
    d.clubs.forEach(function (c, i) {
      const ke = i + 1 < d.clubs.length ? d.clubs[i + 1].trangCong : sau;
      c.cong.setChoices([
        c.cong.createChoice(CO, c.trangDe),
        c.cong.createChoice(KHONG, ke),
        c.cong.createChoice(DUNG, sau)
      ]);
    });
  });

  // Google Forms mới có nút "Xuất bản": chưa xuất bản thì học sinh không mở được.
  // Bản Apps Script cũ không có hàm này nên kiểm tra trước khi gọi.
  if (typeof form.setPublished === 'function') form.setPublished(true);
  PropertiesService.getScriptProperties().setProperty('FORM_ID', form.getId());
  Logger.log('Đường dẫn để SỬA biểu mẫu: ' + form.getEditUrl());
  Logger.log('Đường dẫn gửi HỌC SINH: ' + form.getPublishedUrl());
}

function moBieuMau_() {
  if (LINK_BIEU_MAU) return FormApp.openByUrl(LINK_BIEU_MAU);
  const id = PropertiesService.getScriptProperties().getProperty('FORM_ID');
  if (id) return FormApp.openById(id);
  throw new Error('Chưa biết chấm biểu mẫu nào. Dán đường dẫn SỬA biểu mẫu vào LINK_BIEU_MAU ở đầu tệp rồi chạy lại.');
}

function chuanHoa_(s) {
  return String(s == null ? '' : s).trim().replace(/\s+/g, ' ').toLowerCase();
}

/**
 * Chấm lại mọi phiếu theo đáp án trong BUOI, tách điểm từng CLB (thang 10),
 * và ghi ra một bảng tính mới gồm 4 trang:
 *   Bảng điểm                   mỗi em một dòng, mỗi CLB có thi một cột
 *   02_chon_CLB_muon_thi        tải về dạng CSV để nạp phần mềm
 *   03_xep_hang_nguyen_vong     tải về dạng CSV để nạp phần mềm
 *   Cảnh báo                    phiếu bị bỏ và lý do
 * Ngoài ra ghi riêng RAW_PHIEU.xlsx (mọi câu trả lời, đã chấm từng câu) và
 * DAP_AN.xlsx (đáp án). Định dạng hai tệp này: DINH_DANG_RAW.md.
 */
function chamTheoCLB() {
  const form = moBieuMau_();
  const phieu = form.getResponses();
  const daCo = {};
  const hocSinh = [];
  const canhBao = [];

  const META = moTaCau_();
  const raw = [COT_RAW];

  phieu.forEach(function (r, i) {
    const tl = {};
    const cacCau = [];
    r.getItemResponses().forEach(function (ir) {
      const m = String(ir.getItem().getTitle()).match(/^\s*\[([^\]]+)\]\s*(.*)$/);
      if (!m) return;
      let diemForms = '';
      try { const s = ir.getScore(); if (s !== null && s !== undefined) diemForms = s; } catch (e) {}
      tl[m[1]] = ir.getResponse();
      cacCau.push({ma: m[1], cau: m[2], tl: ir.getResponse(), diemForms: diemForms});
    });
    const sid = String(tl.student_id || '').trim();
    const dong = 'Phiếu thứ ' + (i + 1);
    // Cách xử lí từng CLB trong phiếu: {club_id: [được tính 1/0, ghi chú]}.
    const xuLi = {};
    let trangThai = 'giu';

    if (!sid) {
      trangThai = 'bo_khong_ma';
      canhBao.push([dong, '', 'Không có mã học sinh, bỏ cả phiếu']);
    } else if (daCo[sid]) {
      trangThai = 'bo_nop_trung';
      canhBao.push([dong, sid, 'Nộp lần nữa. Bỏ phiếu này, giữ phiếu đầu (' + daCo[sid] + ')']);
    } else {
      daCo[sid] = dong;
      const hs = {sid: sid, ten: String(tl.name || '').trim(), nv: {}, diem: {}, thi: []};
      BUOI.forEach(function (d) {
        if (tl['di-' + d.ma] !== CO_BUOI) return;
        // Bảng lưới: mỗi dòng (CLB) nhận "Hạng n". Sắp CLB theo hạng.
        const hang = tl[d.ma] || [];
        const xep = d.clubs.map(function (c, k) {
          const n = parseInt(String(hang[k] || '').replace(/\D/g, ''), 10);
          return {id: c.id, n: isNaN(n) ? 99 : n};
        }).sort(function (a, b) { return a.n - b.n; });
        hs.nv[d.ma] = xep.map(function (x) { return x.id; });

        // CLB em đã tick ở câu [chon-...]: Google trả về mảng chữ "Tên (mã)".
        const daTick = {};
        [].concat(tl['chon-' + d.ma] || []).forEach(function (v) {
          const m = String(v).match(/\(([A-Za-z0-9_]+)\)\s*$/);
          if (m) daTick[m[1]] = true;
        });

        let soThi = 0;
        d.clubs.forEach(function (c) {
          const lam = tl['thi-' + c.id] === CO;
          if (!lam) {
            if (daTick[c.id]) canhBao.push([dong, sid, d.ten + ': tick ' + c.name + ' nhưng không làm bài.']);
            return;
          }
          if (!daTick[c.id]) {
            xuLi[c.id] = [0, 'khong_tick'];
            canhBao.push([dong, sid, d.ten + ': làm bài ' + c.name + ' nhưng không tick ở câu chọn CLB thi, không tính điểm.']);
            return;
          }
          // Phòng hờ: Google đã chặn tick quá TRAN_THI, nhưng biểu mẫu có thể bị sửa tay.
          if (soThi >= TRAN_THI) {
            xuLi[c.id] = [0, 'qua_tran'];
            canhBao.push([dong, sid, d.ten + ': quá ' + TRAN_THI + ' CLB, bỏ bài ' + c.name + '.']);
            return;
          }
          soThi++;
          xuLi[c.id] = [1, ''];
          let dung = 0;
          c.de.forEach(function (q, j) {
            if (chuanHoa_(tl[c.id + '-' + (j + 1)]) === chuanHoa_(q.dung)) dung++;
          });
          hs.diem[c.id] = dung * DIEM_CAU;
          hs.thi.push(c.id);
        });
      });
      hocSinh.push(hs);
    }

    ghiRaw_(raw, META, i + 1, r, sid, trangThai, xuLi, cacCau);
  });

  const luc = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd HH-mm');
  const thuMuc = DriveApp.createFolder('Kết quả CLB ' + luc);
  const ss = SpreadsheetApp.create('BANG_DIEM ' + luc);
  DriveApp.getFileById(ss.getId()).moveTo(thuMuc);

  // Bảng điểm
  const coThi = [];
  BUOI.forEach(function (d) { d.clubs.forEach(function (c) { if (c.de.length) coThi.push(c); }); });
  const bang = [['Mã HS', 'Họ tên'].concat(coThi.map(function (c) { return c.name; })).concat(['Số CLB đã thi'])];
  hocSinh.forEach(function (h) {
    bang.push([h.sid, h.ten].concat(coThi.map(function (c) {
      return h.diem.hasOwnProperty(c.id) ? h.diem[c.id] : '';
    })).concat([h.thi.length]));
  });
  ghiTrang_(ss.getSheets()[0].setName('Bảng điểm'), bang, false);

  // 02: CLB dự thi và điểm
  const soCap = Math.max.apply(null, [1].concat(hocSinh.map(function (h) { return h.thi.length; })));
  const t2 = ['student_id', 'name', 'reserve_group'];
  for (let i = 1; i <= soCap; i++) t2.push('test_club_' + i, 'score_' + i);
  const f2 = [t2].concat(hocSinh.map(function (h) {
    const row = [h.sid, h.ten, ''];
    h.thi.forEach(function (id) { row.push(id, h.diem[id]); });
    while (row.length < t2.length) row.push('');
    return row;
  }));
  ghiTrang_(ss.insertSheet('02_chon_CLB_muon_thi'), f2, true);

  // 03: nguyện vọng theo buổi
  const t3 = ['student_id', 'name', 'reserve_group'];
  BUOI.forEach(function (d) { d.clubs.forEach(function (_, i) { t3.push(d.ma + '_pref_' + (i + 1)); }); });
  const f3 = [t3].concat(hocSinh.map(function (h) {
    const row = [h.sid, h.ten, ''];
    BUOI.forEach(function (d) {
      const nv = h.nv[d.ma] || [];
      d.clubs.forEach(function (_, i) { row.push(nv[i] || ''); });
    });
    return row;
  }));
  ghiTrang_(ss.insertSheet('03_xep_hang_nguyen_vong'), f3, true);

  ghiTrang_(ss.insertSheet('Cảnh báo'),
      [['Phiếu', 'Mã HS', 'Nội dung']].concat(canhBao.length ? canhBao : [['', '', 'Không có cảnh báo nào.']]), false);

  // 01: danh sách CLB. Cột capacity (chỉ tiêu) để trống: nhà trường tự điền.
  const f1 = [['club_id', 'name', 'capacity', 'reserve_capacity', 'reserve_group', 'buoi']];
  BUOI.forEach(function (d) { d.clubs.forEach(function (c) { f1.push([c.id, c.name, '', '0', '', d.ma]); }); });

  // Phần mềm xếp CLB chỉ đọc TRANG ĐẦU của tệp Excel, nên mỗi tệp nạp là một
  // tệp riêng chỉ có một trang. BANG_DIEM.xlsx thì giữ đủ 4 trang để xem.
  SpreadsheetApp.flush();
  xuatExcel_(ss.getId(), thuMuc, 'BANG_DIEM.xlsx');
  taoTepNap_(thuMuc, '01_danh_sach_CLB', f1);
  taoTepNap_(thuMuc, '02_chon_CLB_muon_thi', f2);
  taoTepNap_(thuMuc, '03_xep_hang_nguyen_vong', f3);

  taoTepNap_(thuMuc, 'RAW_PHIEU', raw);
  taoTepNap_(thuMuc, 'DAP_AN', bangDapAn_());

  Logger.log('Đã chấm ' + hocSinh.length + ' học sinh.');
  Logger.log('Thư mục kết quả: ' + thuMuc.getUrl());
  if (canhBao.length) Logger.log('Có ' + canhBao.length + ' cảnh báo, xem trang "Cảnh báo" trong BANG_DIEM.xlsx.');
  Logger.log('Nhớ điền cột capacity (chỉ tiêu) trong 01_danh_sach_CLB.xlsx trước khi nạp.');
}

// ------------------------------------------------------------------------
// Dữ liệu raw và đáp án. Định dạng mô tả trong DINH_DANG_RAW.md: đổi cột ở
// đây thì phải sửa cả tài liệu đó, vì skill xử lí sau đọc theo tài liệu.

const COT_RAW = ['phieu_so', 'thoi_gian_nop', 'email', 'student_id', 'trang_thai_phieu',
  'ma_cau', 'loai_cau', 'buoi', 'club_id', 'cau_so', 'cau_hoi', 'tra_loi',
  'dap_an_dung', 'dung_sai', 'diem', 'diem_toi_da', 'diem_forms', 'duoc_tinh', 'ghi_chu'];

function moTaCau_() {
  const M = {student_id: {loai: 'thong_tin'}, name: {loai: 'thong_tin'}};
  BUOI.forEach(function (d) {
    M['di-' + d.ma] = {loai: 'dang_ky_buoi', buoi: d.ma};
    M[d.ma] = {loai: 'xep_hang', buoi: d.ma, clubs: d.clubs};
    M['chon-' + d.ma] = {loai: 'chon_thi', buoi: d.ma};
    d.clubs.forEach(function (c) {
      M['thi-' + c.id] = {loai: 'cong_thi', buoi: d.ma, club: c.id};
      c.de.forEach(function (q, j) {
        M[c.id + '-' + (j + 1)] = {loai: 'de_thi', buoi: d.ma, club: c.id, so: j + 1, dung: q.dung};
      });
    });
  });
  return M;
}

function ghiRaw_(raw, META, so, r, sid, trangThai, xuLi, cacCau) {
  let luc = '', email = '';
  try { luc = Utilities.formatDate(r.getTimestamp(), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd HH:mm:ss'); } catch (e) {}
  try { email = r.getRespondentEmail() || ''; } catch (e) {}
  const dau = [so, luc, email, sid, trangThai];

  cacCau.forEach(function (c) {
    const m = META[c.ma] || {loai: 'khac'};
    const dong = function (club, cauSo, traLoi, them) {
      raw.push(dau.concat([c.ma, m.loai, m.buoi || '', club || '', cauSo || '', c.cau, traLoi])
          .concat(them || ['', '', '', '', '', '', '']));
    };
    if (m.loai === 'xep_hang') {
      // Một dòng cho mỗi CLB trong bảng lưới, trả lời là "Hạng n".
      const mang = [].concat(c.tl || []);
      m.clubs.forEach(function (cl, k) { dong(cl.id, '', mang[k] || ''); });
    } else if (m.loai === 'chon_thi') {
      // Một dòng cho mỗi CLB đã tick.
      [].concat(c.tl || []).forEach(function (v) {
        const k = String(v).match(/\(([A-Za-z0-9_]+)\)\s*$/);
        dong(k ? k[1] : '', '', v);
      });
    } else if (m.loai === 'de_thi') {
      const dung = chuanHoa_(c.tl) === chuanHoa_(m.dung) ? 1 : 0;
      const xl = trangThai !== 'giu' ? [0, trangThai] : (xuLi[m.club] || [0, 'khong_lam_bai']);
      dong(m.club, m.so, c.tl, [m.dung, dung, dung * DIEM_CAU, DIEM_CAU, c.diemForms, xl[0], xl[1]]);
    } else {
      dong(m.club, '', Array.isArray(c.tl) ? c.tl.join(' ; ') : c.tl);
    }
  });
}

function bangDapAn_() {
  const rows = [['buoi', 'ten_buoi', 'club_id', 'ten_clb', 'ma_cau', 'cau_so', 'cau_hoi',
    'lua_chon_a', 'lua_chon_b', 'lua_chon_c', 'lua_chon_d', 'dap_an_dung', 'diem']];
  BUOI.forEach(function (d) {
    d.clubs.forEach(function (c) {
      c.de.forEach(function (q, j) {
        const lc = q.opts.slice(0, 4);
        while (lc.length < 4) lc.push('');
        rows.push([d.ma, d.ten, c.id, c.name, c.id + '-' + (j + 1), j + 1, q.q]
            .concat(lc).concat([q.dung, DIEM_CAU]));
      });
    });
  });
  return rows;
}

function ghiTrang_(sh, rows, laChu) {
  const vung = sh.getRange(1, 1, rows.length, rows[0].length);
  // Tệp nạp ghi dạng chữ để mã như 001 không bị Sheets đổi thành số 1.
  if (laChu) vung.setNumberFormat('@');
  vung.setValues(rows);
  sh.setFrozenRows(1);
  sh.getRange(1, 1, 1, rows[0].length).setFontWeight('bold');
}

function taoTepNap_(thuMuc, ten, rows) {
  const tam = SpreadsheetApp.create(ten);
  ghiTrang_(tam.getSheets()[0].setName(ten), rows, true);
  SpreadsheetApp.flush();
  xuatExcel_(tam.getId(), thuMuc, ten + '.xlsx');
  DriveApp.getFileById(tam.getId()).setTrashed(true);
}

function xuatExcel_(id, thuMuc, ten) {
  const url = 'https://docs.google.com/spreadsheets/d/' + id + '/export?format=xlsx';
  const res = UrlFetchApp.fetch(url, {
    headers: {Authorization: 'Bearer ' + ScriptApp.getOAuthToken()},
    muteHttpExceptions: true
  });
  if (res.getResponseCode() !== 200) {
    throw new Error('Không xuất được ' + ten + ' (mã lỗi ' + res.getResponseCode() + '). Chạy lại chamTheoCLB.');
  }
  thuMuc.createFile(res.getBlob().setName(ten));
}
"""


def du_lieu_gs():
    return [{"ma": ma, "ten": ten, "clubs": [
        {"id": cid, "name": name, "de": [
            {"q": q, "opts": tn.xao(ops, cid + str(j)), "dung": dung}
            for j, (q, dung, ops) in enumerate(de)]}
        for cid, name, de in ds]}
        for ma, ten, ds in tw.doc_du_lieu()]


def noi_dung():
    j = lambda x: json.dumps(x, ensure_ascii=False)  # noqa: E731
    return MAU % {
        "diem": tw.DIEM_CAU, "tran": tw.TRAN_THI,
        "co_buoi": j(tw.CO_BUOI), "khong_buoi": j(tw.KHONG_BUOI),
        "co": j(tw.CO), "khong": j(tw.KHONG), "dung": j(tw.DUNG),
        "buoi": json.dumps(du_lieu_gs(), ensure_ascii=False, indent=1),
    }


def main():
    with open(RA, "w", encoding="utf-8") as f:
        f.write(noi_dung())
    print("Đã ghi %s" % RA)


if __name__ == "__main__":
    sys.exit(main())
