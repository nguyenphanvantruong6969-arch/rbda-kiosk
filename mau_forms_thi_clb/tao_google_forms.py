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
 */

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

  Logger.log('Đường dẫn để SỬA biểu mẫu: ' + form.getEditUrl());
  Logger.log('Đường dẫn gửi HỌC SINH: ' + form.getPublishedUrl());
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
