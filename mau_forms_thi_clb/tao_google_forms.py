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
 *   Chọn hàm chamTheoCLB, bấm Chạy. Hàm tạo một bảng tính mới có điểm từng
 *   CLB và các trang sẵn để nạp vào phần mềm xếp CLB. Đường dẫn bảng tính
 *   nằm trong "Nhật ký thực thi".
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

    const clubs = d.clubs.map(function (c) {
      const trangCong = form.addPageBreakItem().setTitle(d.ten + ': ' + c.name);
      const cong = form.addMultipleChoiceItem()
          .setTitle('[thi-' + c.id + '] Thi ' + c.name + '? Tối đa ' + TRAN_THI + ' CLB mỗi buổi.')
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
 */
function chamTheoCLB() {
  const form = moBieuMau_();
  const phieu = form.getResponses();
  const daCo = {};
  const hocSinh = [];
  const canhBao = [];

  phieu.forEach(function (r, i) {
    const tl = {};
    r.getItemResponses().forEach(function (ir) {
      const m = String(ir.getItem().getTitle()).match(/^\s*\[([^\]]+)\]/);
      if (m) tl[m[1]] = ir.getResponse();
    });
    const sid = String(tl.student_id || '').trim();
    const dong = 'Phiếu thứ ' + (i + 1);
    if (!sid) { canhBao.push([dong, '', 'Không có mã học sinh, bỏ cả phiếu']); return; }
    if (daCo[sid]) {
      canhBao.push([dong, sid, 'Nộp lần nữa. Bỏ phiếu này, giữ phiếu đầu (' + daCo[sid] + ')']);
      return;
    }
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

      let soThi = 0;
      d.clubs.forEach(function (c) {
        if (tl['thi-' + c.id] !== CO) return;
        soThi++;
        let dung = 0;
        c.de.forEach(function (q, j) {
          if (chuanHoa_(tl[c.id + '-' + (j + 1)]) === chuanHoa_(q.dung)) dung++;
        });
        hs.diem[c.id] = dung * DIEM_CAU;
        hs.thi.push(c.id);
      });
      if (soThi > TRAN_THI) {
        canhBao.push([dong, sid, d.ten + ': thi ' + soThi + ' CLB, quá ' + TRAN_THI + '. Phần mềm sẽ bỏ cả buổi này.']);
      }
    });
    hocSinh.push(hs);
  });

  const ss = SpreadsheetApp.create('Chấm theo CLB ' + Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd HH:mm'));

  // Bảng điểm
  const coThi = [];
  BUOI.forEach(function (d) { d.clubs.forEach(function (c) { if (c.de.length) coThi.push(c); }); });
  const bang = [['Mã HS', 'Họ tên'].concat(coThi.map(function (c) { return c.name; })).concat(['Số CLB đã thi'])];
  hocSinh.forEach(function (h) {
    bang.push([h.sid, h.ten].concat(coThi.map(function (c) {
      return h.diem.hasOwnProperty(c.id) ? h.diem[c.id] : '';
    })).concat([h.thi.length]));
  });
  ghiTrang_(ss.getSheets()[0].setName('Bảng điểm'), bang);

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
  ghiTrang_(ss.insertSheet('02_chon_CLB_muon_thi'), f2);

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
  ghiTrang_(ss.insertSheet('03_xep_hang_nguyen_vong'), f3);

  ghiTrang_(ss.insertSheet('Cảnh báo'),
      [['Phiếu', 'Mã HS', 'Nội dung']].concat(canhBao.length ? canhBao : [['', '', 'Không có cảnh báo nào.']]));

  Logger.log('Đã chấm ' + hocSinh.length + ' học sinh. Bảng tính: ' + ss.getUrl());
  if (canhBao.length) Logger.log('Có ' + canhBao.length + ' cảnh báo, xem trang "Cảnh báo".');
}

function ghiTrang_(sh, rows) {
  // Ghi dạng chữ để mã như 001 hay điểm 10 không bị Sheets tự đổi định dạng.
  sh.getRange(1, 1, rows.length, rows[0].length).setNumberFormat('@').setValues(rows);
  sh.setFrozenRows(1);
  sh.getRange(1, 1, 1, rows[0].length).setFontWeight('bold');
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
