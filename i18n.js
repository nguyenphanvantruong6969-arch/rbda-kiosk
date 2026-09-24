/* ==========================================================================
   i18n.js — bilingual (vi/en) text catalog + helpers for the kiosk UI.
   ==========================================================================
   ERROR_MESSAGES MUST stay in sync with MESSAGES in i18n_errors.py (a
   Python test asserts every code() the backend can emit exists here with
   both langs — but this file itself isn't covered by that test, so any
   edit here needs its mirror edited in i18n_errors.py too).
   UI_STRINGS covers every other string the app shows: static HTML text
   (via data-i18n[-placeholder|-html] attributes, applied by
   applyStaticText()) and dynamic text app.js builds at runtime (via
   I18N.t(key, params)).
   ========================================================================== */

(function (global) {
  "use strict";

  const ERROR_MESSAGES = {
    error_reading_last_run: {
      vi: "Không đọc được thông tin lần sắp xếp gần nhất. Hãy thử lại.",
      en: "Couldn't load the latest allocation. Try again.",
    },
    error_reading_dashboard: {
      vi: "Không tải được trang tổng quan. Hãy thử lại.",
      en: "Couldn't load the overview. Try again.",
    },
    error_checking_integrity: {
      vi: "Không kiểm tra được dữ liệu. Hãy thử lại.",
      en: "Couldn't check the data. Try again.",
    },
    error_checking_run_warning: {
      vi: "Không kiểm tra được dữ liệu trước khi sắp xếp. Hãy thử lại.",
      en: "Couldn't check the data before allocating. Try again.",
    },
    error_reading_stb_lock: {
      vi: "Không kiểm tra được số bốc thăm. Hãy thử lại.",
      en: "Couldn't check the lottery numbers. Try again.",
    },
    error_reading_run_history: {
      vi: "Không mở được nhật ký các lần sắp xếp. Hãy thử lại.",
      en: "Couldn't open the allocation history. Try again.",
    },
    error_running_pipeline: {
      vi: "Sắp xếp bị dừng giữa chừng do một lỗi ngoài dự kiến. Dữ liệu chưa bị thay đổi. Hãy thử lại.",
      en: "The allocation stopped because of an unexpected problem. No data was changed. Try again.",
    },
    error_reading_csv_preview: {
      vi: "Không xem trước được tệp này. Kiểm tra lại tệp rồi thử lần nữa.",
      en: "Couldn't preview this file. Check the file and try again.",
    },
    error_importing_preferences_csv: {
      vi: "Không nạp được tệp nguyện vọng. Kiểm tra lại tệp rồi thử lần nữa.",
      en: "Couldn't import the preferences file. Check the file and try again.",
    },
    error_importing_test_selection_csv: {
      vi: "Không nạp được tệp chọn CLB dự thi. Kiểm tra lại tệp rồi thử lần nữa.",
      en: "Couldn't import the test club file. Check the file and try again.",
    },
    error_reading_scoring_overview: {
      vi: "Không tải được tình hình chấm điểm. Hãy thử lại.",
      en: "Couldn't load the scoring overview. Try again.",
    },
    error_reading_scoring_list: {
      vi: "Không tải được danh sách chấm điểm. Hãy thử lại.",
      en: "Couldn't load the scoring list. Try again.",
    },
    error_saving_scores: {
      vi: "Không lưu được điểm. Hãy thử lại.",
      en: "Couldn't save the scores. Try again.",
    },
    error_reading_club_roster: {
      vi: "Không tải được danh sách thành viên của câu lạc bộ. Hãy thử lại.",
      en: "Couldn't load the club's member list. Try again.",
    },
    error_reading_pref_distribution: {
      vi: "Không tải được thống kê nguyện vọng. Hãy thử lại.",
      en: "Couldn't load the preference summary. Try again.",
    },
    error_reading_unplaced: {
      vi: "Không tải được danh sách học sinh chưa có chỗ. Hãy thử lại.",
      en: "Couldn't load the list of unplaced students. Try again.",
    },
    error_reading_reserve_usage: {
      vi: "Không tải được thống kê suất dự trữ. Hãy thử lại.",
      en: "Couldn't load the reserve seat summary. Try again.",
    },
    error_reading_results: {
      vi: "Không tải được kết quả. Hãy thử lại.",
      en: "Couldn't load the results. Try again.",
    },
    error_detecting_csv_kind: {
      vi: "Không nhận ra được đây là tệp gì. Kiểm tra lại tệp rồi thử lần nữa.",
      en: "Couldn't tell what kind of file this is. Check the file and try again.",
    },
    error_importing_csv_auto: {
      vi: "Không nạp được tệp này. Kiểm tra lại tệp rồi thử lần nữa.",
      en: "Couldn't import this file. Check the file and try again.",
    },
    error_importing_clubs_csv: {
      vi: "Không nạp được tệp danh sách CLB. Kiểm tra lại tệp rồi thử lần nữa.",
      en: "Couldn't import the club list file. Check the file and try again.",
    },
    csv_kind_ambiguous: {
      vi: "Chưa rõ đây là tệp chọn CLB dự thi hay tệp xếp hạng nguyện vọng (các cột: {fieldnames}). Hãy chọn loại tệp, hoặc thêm cột rank nếu đây là tệp nguyện vọng.",
      en: "Couldn't tell whether this is a test club file or a preferences file (columns: {fieldnames}). Choose the file type, or add a rank column if it holds preferences.",
    },
    csv_kind_unknown: {
      vi: "Không nhận ra định dạng của tệp này. Xem các cột được hỗ trợ trong mau_csv/HUONG_DAN_CSV.md.",
      en: "This file format isn't recognised. See the supported columns in mau_csv/HUONG_DAN_CSV.md.",
    },
    csv_club_row_invalid: {
      vi: "Dòng {line} bị bỏ qua vì {reason} không hợp lệ. Tổng chỗ phải lớn hơn 0 và suất dự trữ không được nhiều hơn tổng chỗ.",
      en: "Line {line} was skipped because {reason} isn't valid. Total seats must be above 0, and reserve seats can't be more than total seats.",
    },
    xlsx_read_failed: {
      vi: "Không mở được tệp Excel này. Kiểm tra tệp có đúng định dạng .xlsx không, hoặc lưu lại tệp rồi thử lần nữa.",
      en: "Couldn't open this Excel file. Check that it's an .xlsx file, or save it again and retry.",
    },
    xlsx_empty: {
      vi: "Tệp Excel này không có dữ liệu.",
      en: "This Excel file has no data.",
    },
    xlsx_support_missing: {
      vi: "Bản cài này không mở được tệp Excel. Hãy lưu tệp ở dạng CSV UTF-8 rồi nạp lại.",
      en: "This version can't open Excel files. Save the file as CSV UTF-8 and import it again.",
    },
    csv_reserve_group_unknown: {
      vi: "Nhãn dự trữ {reserve_group} không khớp với câu lạc bộ nào, nên {n} học sinh mang nhãn này sẽ không được xét suất dự trữ. Có thể nhãn đúng là {goi_y}.",
      en: "The reserve label {reserve_group} doesn't match any club, so {n} student(s) with this label won't be considered for reserve seats. The intended label may be {goi_y}.",
    },
    csv_duplicate_student_rows: {
      vi: "Mã {student_id} có ở {n} dòng trong tệp. Chỉ dòng cuối cùng được giữ.",
      en: "Student {student_id} appears on {n} rows. Only the last row was kept.",
    },
    csv_score_not_a_number: {
      vi: "Điểm “{score}” của học sinh {student_id} ở CLB {club_id} không phải là số nên chưa được lưu. Các lựa chọn dự thi vẫn được giữ. Sửa điểm rồi nạp lại tệp.",
      en: "The score “{score}” for student {student_id} in club {club_id} isn't a number, so it wasn't saved. The test club choices were kept. Fix the score and import the file again.",
    },
    csv_score_negative: {
      vi: "Điểm “{score}” của học sinh {student_id} ở CLB {club_id} là số âm, có thể do gõ thừa dấu trừ. Điểm này chưa được lưu.",
      en: "The score “{score}” for student {student_id} in club {club_id} is negative, probably an extra minus sign. This score wasn't saved.",
    },
    csv_score_for_unselected_club: {
      vi: "Học sinh {student_id} có điểm ở CLB {club_id} nhưng không đăng ký dự thi CLB này, nên điểm chưa được lưu. Kiểm tra xem mã CLB có bị gõ nhầm không.",
      en: "Student {student_id} has a score for club {club_id} but didn't sign up to test for it, so the score wasn't saved. Check the club code for typos.",
    },
    csv_score_without_club: {
      vi: "Học sinh {student_id} có điểm ở ô điểm số {cot} nhưng ô mã CLB bên cạnh để trống, có thể do lệch cột. Điểm này chưa được lưu.",
      en: "Student {student_id} has a score in score column {cot} but the club column next to it is empty, probably a shifted column. This score wasn't saved.",
    },
    csv_scores_ignored_here: {
      vi: "Tệp xếp hạng nguyện vọng không dùng để nạp điểm, nên các cột điểm trong tệp này được bỏ qua. Hãy đưa điểm vào tệp chọn CLB dự thi.",
      en: "Scores can't be imported from a preferences file, so the score columns here were ignored. Put the scores in the test club file instead.",
    },
    csv_student_id_case_conflict: {
      vi: "Mã {student_id} và mã {da_co} chỉ khác nhau ở chữ hoa, chữ thường nên đang được tính là hai học sinh. Nếu là cùng một học sinh, hãy viết mã giống nhau ở cả hai tệp.",
      en: "The codes {student_id} and {da_co} differ only in upper and lower case, so they count as two students. If both codes belong to one student, write the code the same way in both files.",
    },
    csv_student_id_maybe_truncated: {
      vi: "Mã {student_id} có {do_dai} chữ số, trong khi phần lớn mã khác có {do_dai_pho_bien}. Có thể Excel đã bỏ số 0 ở đầu. Mở tệp gốc, đặt cột mã ở dạng Text rồi nạp lại.",
      en: "The code {student_id} has {do_dai} digits while most codes have {do_dai_pho_bien}. Excel may have removed a leading zero. Open the original file, set the code column to Text, and import again.",
    },
    error_reading_club_stats: {
      vi: "Không tải được thống kê câu lạc bộ. Hãy thử lại.",
      en: "Couldn't load the club summary. Try again.",
    },
    error_exporting_csv: {
      vi: "Không xuất được tệp kết quả. Kiểm tra thư mục lưu còn chỗ trống và tệp cũ không đang mở, rồi thử lại.",
      en: "Couldn't export the results. Check that the folder has free space and the old file isn't open, then try again.",
    },
    error_saving_club: {
      vi: "Không lưu được câu lạc bộ. Hãy thử lại.",
      en: "Couldn't save the club. Try again.",
    },
    error_deleting_club: {
      vi: "Không xoá được câu lạc bộ. Hãy thử lại.",
      en: "Couldn't delete the club. Try again.",
    },
    error_reading_reserve_groups: {
      vi: "Không tải được danh sách nhãn dự trữ. Hãy thử lại.",
      en: "Couldn't load the reserve labels. Try again.",
    },
    error_assigning_reserve_group: {
      vi: "Không gán được nhãn dự trữ. Hãy thử lại.",
      en: "Couldn't assign the reserve label. Try again.",
    },
    error_bulk_assigning: {
      vi: "Không gán được nhãn cho các học sinh đã chọn. Hãy thử lại.",
      en: "Couldn't assign the label to the selected students. Try again.",
    },
    error_reading_student_list: {
      vi: "Không tải được danh sách học sinh. Hãy thử lại.",
      en: "Couldn't load the student list. Try again.",
    },
    error_reading_club_list: {
      vi: "Không tải được danh sách câu lạc bộ. Hãy thử lại.",
      en: "Couldn't load the club list. Try again.",
    },
    error_searching_students: {
      vi: "Không tìm được học sinh lúc này. Hãy thử lại.",
      en: "Couldn't search for students right now. Try again.",
    },
    error_reading_student_state: {
      vi: "Không tải được thông tin của học sinh này. Hãy thử lại.",
      en: "Couldn't load this student's details. Try again.",
    },
    error_saving_test_selection: {
      vi: "Không lưu được lựa chọn CLB dự thi. Hãy thử lại.",
      en: "Couldn't save the test club choices. Try again.",
    },
    error_saving_preferences: {
      vi: "Không lưu được nguyện vọng. Hãy thử lại.",
      en: "Couldn't save the preferences. Try again.",
    },
    error_creating_student: {
      vi: "Không tạo được học sinh mới. Hãy thử lại.",
      en: "Couldn't add the new student. Try again.",
    },
    error_resetting_student_entry: {
      vi: "Không xoá được lựa chọn của học sinh này. Hãy thử lại.",
      en: "Couldn't clear this student's choices. Try again.",
    },
    error_deleting_student: {
      vi: "Không xoá được học sinh. Hãy thử lại.",
      en: "Couldn't delete the student. Try again.",
    },
    reset_confirmation_mismatch: {
      vi: "Chưa xoá dữ liệu nào vì thiếu bước xác nhận. Hãy bấm nút xoá thêm một lần để xác nhận.",
      en: "Nothing was deleted because the confirmation step was missing. Click the delete button once more to confirm.",
    },
    reset_scope_unknown: {
      vi: "Chưa xoá dữ liệu nào vì yêu cầu xoá không hợp lệ. Hãy dùng các nút xoá trong ứng dụng.",
      en: "Nothing was deleted because the request wasn't valid. Use the delete buttons in the app.",
    },
    error_resetting_data: {
      vi: "Không xoá được dữ liệu. Nếu bản sao lưu đã được tạo, bản đó vẫn nằm trong thư mục dữ liệu.",
      en: "Couldn't delete the data. If a backup was made, it's still in the data folder.",
    },
    csv_empty: {
      vi: "Tệp này trống hoặc không có dòng nào đọc được.",
      en: "This file is empty, or none of its rows could be read.",
    },
    csv_missing_columns: {
      vi: "Tệp dạng dọc cần có cột mã học sinh và cột mã CLB (tên cột \"student_id\" và \"club_id\"). Các cột đang có: {fieldnames}",
      en: "A long-format file needs a student code column and a club code column (named \"student_id\" and \"club_id\"). Columns found: {fieldnames}",
    },
    capacity_must_be_positive: {
      vi: "Tổng chỗ phải lớn hơn 0.",
      en: "Total seats must be more than 0.",
    },
    no_data_to_run: {
      vi: "Chưa có dữ liệu để sắp xếp. Cần ít nhất một câu lạc bộ và một học sinh.",
      en: "There's no data to allocate yet. Add at least one club and one student.",
    },
    clb_thieu_buoi: {
      vi: "Có {n} câu lạc bộ chưa có buổi sinh hoạt: {club_ids}. Các câu lạc bộ này sẽ bị tính chung một buổi, nên mỗi học sinh chỉ vào được một trong số đó. Hãy điền buổi cho tất cả câu lạc bộ, hoặc để trống cột buổi ở tất cả.",
      en: "{n} club(s) have no session: {club_ids}. These clubs will be treated as one session, so a student can join only one of them. Fill in a session for every club, or leave the session column empty for all of them.",
    },
    buoi_khong_ton_tai: {
      vi: "Không có buổi sinh hoạt nào tên “{buoi}”. Các buổi hiện có: {dang_co}.",
      en: "There's no session called “{buoi}”. Current sessions: {dang_co}.",
    },
    chua_chon_buoi_nao: {
      vi: "Chưa chọn buổi nào để sắp xếp. Hãy chọn ít nhất một buổi.",
      en: "No session is selected. Choose at least one session.",
    },
    khong_ve_lai_tham_khi_chay_mot_phan: {
      vi: "Không thể bốc thăm lại khi chỉ sắp xếp một số buổi, vì bốc thăm lại sẽ đổi thứ tự của cả những buổi đang giữ kết quả cũ. Muốn bốc thăm lại, hãy chọn tất cả các buổi.",
      en: "The lottery can't be redrawn when only some sessions are allocated, because a redraw also changes the order of the sessions that keep their results. To redraw, select every session.",
    },
    khong_chen_tham_khi_chay_mot_phan: {
      vi: "Có {n} học sinh chưa có số bốc thăm. Cấp số mới sẽ đổi thứ tự của mọi buổi, kể cả những buổi đang giữ kết quả cũ. Hãy chọn tất cả các buổi rồi sắp xếp một lần cho cả tuần.",
      en: "{n} student(s) don't have a lottery number yet. Adding them changes the order of every session, including those keeping their results. Select every session and allocate the whole week at once.",
    },
    khong_doi_hat_giong_khi_chay_mot_phan: {
      vi: "Lần sắp xếp trước dùng số khởi tạo bốc thăm {cu}, lần này là {moi}. Đổi số này sẽ đổi thứ tự của mọi buổi, kể cả những buổi đang giữ kết quả cũ. Hãy đặt lại số {cu}, hoặc chọn tất cả các buổi và sắp xếp một lần cho cả tuần.",
      en: "The last allocation used lottery starting number {cu}; this one uses {moi}. Changing it changes the order of every session, including those keeping their results. Set it back to {cu}, or select every session and allocate the whole week at once.",
    },
    nguyen_vong_lech_buoi: {
      vi: "Dòng {line}: học sinh {student_id} xếp CLB {club_id} vào cột buổi {buoi_cot}, nhưng CLB này sinh hoạt buổi {buoi_that}. Nguyện vọng này được bỏ qua.",
      en: "Row {line}: student {student_id} put club {club_id} under {buoi_cot}, but the club meets on {buoi_that}. This preference was skipped.",
    },
    reserve_capacity_exceeds_capacity: {
      vi: "Suất dự trữ không được nhiều hơn tổng chỗ.",
      en: "Reserve seats can't be more than total seats.",
    },
    club_id_required: {
      vi: "Hãy nhập mã CLB.",
      en: "Enter a club code.",
    },
    cannot_delete_club_referenced: {
      vi: "Không xoá được CLB {club_id} vì CLB này đang có trong {n_prefs} nguyện vọng và {n_matches} kết quả. Hãy xử lý các dữ liệu đó trước.",
      en: "Club {club_id} can't be deleted because it's still in {n_prefs} preference(s) and {n_matches} result(s). Deal with that data first.",
    },
    student_not_found: {
      vi: "Không tìm thấy học sinh {student_id}.",
      en: "Student {student_id} wasn't found.",
    },
    club_not_found: {
      vi: "Không tìm thấy CLB {club_id}.",
      en: "Club {club_id} wasn't found.",
    },
    unknown_clubs: {
      vi: "Không tìm thấy các CLB: {club_ids}.",
      en: "These clubs weren't found: {club_ids}.",
    },
    scores_must_be_nonempty_list: {
      vi: "Chưa có điểm nào để lưu.",
      en: "There are no scores to save.",
    },
    student_ids_must_be_nonempty_list: {
      vi: "Chưa chọn học sinh nào.",
      en: "No students are selected.",
    },
    club_ids_must_be_list: {
      vi: "Danh sách CLB không hợp lệ. Hãy thử lại.",
      en: "The club list isn't valid. Try again.",
    },
    ordered_club_ids_must_be_list: {
      vi: "Danh sách nguyện vọng không hợp lệ. Hãy thử lại.",
      en: "The preference list isn't valid. Try again.",
    },
    must_rank_at_least_one: {
      vi: "Hãy chọn ít nhất một nguyện vọng.",
      en: "Choose at least one preference.",
    },
    max_pref_moi_buoi: {
      vi: "Buổi {buoi} đã đủ {tran} nguyện vọng. Muốn thêm, hãy bỏ bớt một CLB của buổi này.",
      en: "{buoi} already has {tran} preferences, the most allowed. To add another, remove one from this session.",
    },
    max_thi_moi_buoi: {
      vi: "Buổi {buoi} đã đủ {tran} CLB dự thi. Muốn thêm, hãy bỏ bớt một CLB của buổi này.",
      en: "{buoi} already has {tran} test clubs, the most allowed. To add another, remove one from this session.",
    },
    duplicate_preference_in_list: {
      vi: "CLB này đã có trong danh sách nguyện vọng.",
      en: "This club is already in the preference list.",
    },
    cannot_delete_student_matched: {
      vi: "Không xoá được học sinh {student_id} vì học sinh này có trong kết quả sắp xếp gần nhất. Hãy xử lý xong rồi sắp xếp lại.",
      en: "Student {student_id} can't be deleted because the student is in the latest results. Sort that out, then run the allocation again.",
    },
    stb_redrawn_and_locked: {
      vi: "Đã bốc thăm cho {n} học sinh và khoá kết quả bốc thăm.",
      en: "Drew lottery numbers for {n} student(s) and locked them.",
    },
    stb_supplemented: {
      vi: "Số bốc thăm đã khoá. Thứ tự cũ được giữ nguyên, {n} học sinh mới được xếp ngẫu nhiên vào.",
      en: "Lottery numbers were already locked. The existing order was kept and {n} new student(s) were added at random.",
    },
    stb_reused: {
      vi: "Số bốc thăm đã khoá nên được dùng lại, không bốc thăm mới.",
      en: "Lottery numbers were already locked, so they were reused.",
    },
    rbda_done: {
      vi: "Hoàn tất sau {rounds} vòng, không có lỗi.",
      en: "Finished in {rounds} round(s) with no errors.",
    },
    db_backed_up: {
      vi: "Đã sao lưu dữ liệu trước khi sắp xếp: {backup_name}",
      en: "Backed up the data before allocating: {backup_name}",
    },
    db_backup_failed: {
      vi: "Không sao lưu được dữ liệu. Việc sắp xếp vẫn tiếp tục.",
      en: "Couldn't back up the data. The allocation continued anyway.",
    },
    pipeline_rolled_back: {
      vi: "Sắp xếp bị dừng giữa chừng nên mọi thay đổi của lần này đã được huỷ, kể cả số bốc thăm mới. Dữ liệu giữ nguyên như trước khi bấm chạy.",
      en: "The allocation stopped partway, so every change from this run was undone, including new lottery numbers. The data is the same as before the run.",
    },
    pref_student_not_in_students: {
      vi: "Mã {student_id} có nguyện vọng nhưng không có trong danh sách học sinh.",
      en: "Code {student_id} has preferences but isn't in the student list.",
    },
    pref_duplicate_club: {
      vi: "Học sinh {student_id} có một CLB bị lặp trong danh sách nguyện vọng.",
      en: "Student {student_id} has the same club twice in the preference list.",
    },
    pref_too_many: {
      vi: "Học sinh {student_id} có {count} nguyện vọng, nhiều hơn mức tối đa 10.",
      en: "Student {student_id} has {count} preferences. The most allowed is 10.",
    },
    pref_too_many_buoi: {
      vi: "Học sinh {student_id} có {count} nguyện vọng ở buổi {buoi}, nhiều hơn mức tối đa 10 mỗi buổi.",
      en: "Student {student_id} has {count} preferences in {buoi}. The most allowed is 10 per session.",
    },
    thi_too_many: {
      vi: "Học sinh {student_id} đăng ký dự thi {count} CLB, nhiều hơn mức tối đa 5.",
      en: "Student {student_id} signed up to test for {count} clubs. The most allowed is 5.",
    },
    thi_too_many_buoi: {
      vi: "Học sinh {student_id} đăng ký dự thi {count} CLB ở buổi {buoi}, nhiều hơn mức tối đa 5 mỗi buổi.",
      en: "Student {student_id} signed up to test for {count} clubs in {buoi}. The most allowed is 5 per session.",
    },
    pref_unknown_club: {
      vi: "Học sinh {student_id} có nguyện vọng vào CLB {club_id}, nhưng không tìm thấy CLB này.",
      en: "Student {student_id} chose club {club_id}, but that club wasn't found.",
    },
    club_capacity_not_positive: {
      vi: "CLB {club_id} có tổng chỗ bằng 0. Tổng chỗ phải lớn hơn 0.",
      en: "Club {club_id} has 0 seats. Total seats must be more than 0.",
    },
    club_reserve_exceeds_capacity: {
      vi: "CLB {club_id} có suất dự trữ nhiều hơn tổng chỗ.",
      en: "Club {club_id} has more reserve seats than total seats.",
    },
    applicants_unknown_club: {
      vi: "Danh sách dự thi có CLB {club_id}, nhưng không tìm thấy CLB này.",
      en: "The test list includes club {club_id}, but that club wasn't found.",
    },
    applicants_unknown_student: {
      vi: "Danh sách dự thi có mã {student_id}, nhưng không tìm thấy học sinh này.",
      en: "The test list includes student {student_id}, but that student wasn't found.",
    },
    assignment_not_in_preferences: {
      vi: "Học sinh {student_id} được xếp vào CLB {club_id} dù CLB này không có trong nguyện vọng.",
      en: "Student {student_id} was placed in club {club_id}, which isn't among the student's preferences.",
    },
    club_over_capacity: {
      vi: "CLB {club_id} có {count} học sinh nhưng chỉ có {capacity} chỗ.",
      en: "Club {club_id} has {count} student(s) but only {capacity} seat(s).",
    },
    club_over_reserve_capacity: {
      vi: "CLB {club_id} có {count} học sinh dùng suất dự trữ nhưng chỉ có {reserve_capacity} suất.",
      en: "Club {club_id} has {count} student(s) in reserve seats but only {reserve_capacity} reserve seat(s).",
    },
    blocking_pair: {
      vi: "Có thể chưa công bằng: học sinh {student_id} thích CLB {club_id} hơn CLB đang được xếp ({current_club}) và đủ điều kiện vào {club_id}. CLB {club_id} hiện đã nhận {n_holders}/{capacity} chỗ.",
      en: "Possible unfair result: student {student_id} prefers club {club_id} to the assigned club ({current_club}) and qualifies for {club_id}. Club {club_id} has filled {n_holders}/{capacity} seats.",
    },
    csv_pref_duplicate_deduped: {
      vi: "{student_id}: có CLB bị lặp trong nguyện vọng, phần lặp đã được bỏ.",
      en: "{student_id}: a club was listed twice in the preferences. The repeat was removed.",
    },
    csv_thi_bo_buoi_qua_tran: {
      vi: "{student_id}: buổi {buoi} có {count} CLB dự thi, nhiều hơn mức tối đa {tran}. Buổi này chưa được nạp, kể cả điểm. Các buổi khác vẫn được nạp.",
      en: "{student_id}: {buoi} has {count} test clubs, more than the limit of {tran}. This session wasn't imported, scores included. The other sessions were.",
    },
    csv_pref_bo_buoi_qua_tran: {
      vi: "{student_id}: buổi {buoi} có {count} nguyện vọng, nhiều hơn mức tối đa {tran}. Buổi này chưa được nạp. Các buổi khác vẫn được nạp. Sửa buổi này rồi nạp lại nếu cần.",
      en: "{student_id}: {buoi} has {count} preferences, more than the limit of {tran}. This session wasn't imported. The other sessions were. Fix it and import again if needed.",
    },
    csv_pref_too_many_skipped: {
      vi: "{student_id}: có {count} nguyện vọng, nhiều hơn mức tối đa {tran}, nên học sinh này chưa được nạp.",
      en: "{student_id}: has {count} preferences, more than the limit of {tran}, so this student wasn't imported.",
    },
    csv_thi_too_many_skipped: {
      vi: "{student_id}: đăng ký dự thi {count} CLB, nhiều hơn mức tối đa {tran}, nên học sinh này chưa được nạp.",
      en: "{student_id}: signed up to test for {count} clubs, more than the limit of {tran}, so this student wasn't imported.",
    },
    csv_unknown_clubs_skipped: {
      vi: "{student_id}: không tìm thấy các CLB {club_ids}, nên học sinh này chưa được nạp.",
      en: "{student_id}: clubs {club_ids} weren't found, so this student wasn't imported.",
    },
    csv_student_missing_skipped: {
      vi: "{student_id}: chưa có trong danh sách học sinh nên được bỏ qua. Bật tuỳ chọn tự tạo học sinh mới để nạp cả mã này.",
      en: "{student_id}: not in the student list, so it was skipped. Turn on adding new students automatically to include it.",
    },
    score_not_applicant: {
      vi: "{student_id}: không có trong danh sách dự thi của CLB này.",
      en: "{student_id}: isn't on this club's test list.",
    },
    score_not_a_number: {
      vi: "{student_id}: điểm “{score}” không phải là số nên chưa được lưu.",
      en: "{student_id}: the score “{score}” isn't a number, so it wasn't saved.",
    },
    score_negative: {
      vi: "{student_id}: điểm “{score}” là số âm, có thể do gõ thừa dấu trừ. Điểm này chưa được lưu.",
      en: "{student_id}: the score “{score}” is negative, probably an extra minus sign. It wasn't saved.",
    },
    health_scoring_none: {
      vi: "CLB {club_id}: có {n_applicants} học sinh dự thi nhưng chưa ai được chấm điểm. Nếu sắp xếp lúc này, các học sinh đó chỉ được xét theo số bốc thăm.",
      en: "Club {club_id}: {n_applicants} student(s) took the test but none have a score yet. If the allocation runs now, those students will be ranked by lottery number only.",
    },
    health_scoring_partial: {
      vi: "CLB {club_id}: mới chấm {n_scored}/{n_applicants} học sinh. {n_missing} học sinh chưa có điểm sẽ xếp sau tất cả học sinh đã có điểm.",
      en: "Club {club_id}: {n_scored} of {n_applicants} students are scored. The {n_missing} without a score will rank below every scored student.",
    },
    health_tested_not_ranked: {
      vi: "{n} lượt dự thi sẽ không có tác dụng vì học sinh dự thi một CLB nhưng không chọn CLB đó làm nguyện vọng. Ví dụ: {sample}",
      en: "{n} test sign-up(s) won't count because the student tested for a club but didn't list it as a preference. For example: {sample}",
    },
    health_student_no_preferences: {
      vi: "{n} học sinh chưa có nguyện vọng nào nên sẽ không được xếp vào CLB nào. Ví dụ: {sample}",
      en: "{n} student(s) have no preferences, so none of them will be placed in a club. For example: {sample}",
    },
    health_orphan_student_group: {
      vi: "Nhãn dự trữ \"{reserve_group}\" đang gán cho {n} học sinh nhưng không CLB nào dùng nhãn này, có thể do gõ sai (ví dụ: {sample}). Các học sinh này sẽ không được ưu tiên ở đâu. Sửa ở thẻ Quản lý: tìm học sinh, đánh dấu, để trống ô nhãn rồi bấm \"Gán cho học sinh đã đánh dấu\".",
      en: "The reserve label \"{reserve_group}\" is given to {n} student(s) but no club uses it, which may be a typo (for example: {sample}). These students won't get priority anywhere. To fix it on the Admin tab: find the students, tick them, leave the label box empty, and click \"Assign to ticked students\".",
    },
    health_club_reserve_no_group: {
      vi: "CLB {club_id} có {reserve_capacity} suất dự trữ nhưng chưa có nhãn dự trữ, nên các suất này sẽ thành suất thường.",
      en: "Club {club_id} has {reserve_capacity} reserve seat(s) but no reserve label, so those seats will become regular seats.",
    },
    health_club_group_no_students: {
      vi: "CLB {club_id} để {reserve_capacity} suất cho nhãn \"{reserve_group}\", nhưng chưa học sinh nào có nhãn này. Các suất đó sẽ bỏ trống.",
      en: "Club {club_id} keeps {reserve_capacity} seat(s) for the label \"{reserve_group}\", but no student has that label. Those seats will go unused.",
    },
    health_score_outlier: {
      vi: "CLB {club_id}: có {n} điểm khác hẳn các điểm còn lại (điểm giữa của CLB là {trung_vi}). Ví dụ: {sample}. Có thể điểm bị gõ nhầm, như 70 thay cho 7,0. Kiểm tra lại ở thẻ Chấm điểm.",
      en: "Club {club_id}: {n} score(s) are far from the rest (the club's middle score is {trung_vi}). For example: {sample}. A score may be mistyped, such as 70 instead of 7.0. Check them on the Scoring tab.",
    },
    health_oversubscribed: {
      vi: "Tổng số chỗ là {n_seats} nhưng có {n_students} học sinh đã nộp nguyện vọng. Ít nhất {n_short} học sinh sẽ không có chỗ.",
      en: "There are {n_seats} seats in total but {n_students} students submitted preferences. At least {n_short} student(s) won't get a seat.",
    },
    recovery_no_backups: {
      vi: "Không tìm thấy bản sao lưu nào. Có thể máy này chưa sắp xếp lần nào, hoặc thư mục sao lưu đã bị xoá.",
      en: "No backups were found. This computer may not have run an allocation yet, or the backup folder was deleted.",
    },
    recovery_all_backups_corrupt: {
      vi: "Đã thử {n_tried} bản sao lưu nhưng không bản nào mở được.",
      en: "Tried {n_tried} backup(s), but none could be opened.",
    },
    recovery_restore_failed: {
      vi: "Không khôi phục được dữ liệu. Hãy thử lại.",
      en: "Couldn't restore the data. Try again.",
    },
    recovery_restored_from: {
      vi: "Đã khôi phục từ bản sao lưu {backup_name}. Bỏ qua {n_skipped} bản mới hơn vì không mở được.",
      en: "Restored from backup {backup_name}. Skipped {n_skipped} newer backup(s) that couldn't be opened.",
    },
    recovery_fresh_created: {
      vi: "Đã tạo một tệp dữ liệu mới, trống. Tệp cũ được đổi tên và vẫn nằm trong cùng thư mục.",
      en: "Created a new, empty data file. The old file was renamed and is still in the same folder.",
    },
  };

  const UI_STRINGS = {
    vi: {
      page_title: "Sắp xếp Câu lạc bộ · RB-DA",
      lang_toggle_label: "EN",
      brand_title: "Sắp xếp CLB",
      brand_sub: "Reserve-Based DA",
      nav_pipeline: "Vận hành sắp xếp",
      nav_results: "Kết quả",
      nav_fallback: "Nhập tại chỗ",
      nav_admin: "Quản lý CLB & dự trữ",
      nav_scoring: "Nhập điểm",
      db_status_loading: "Đang tải…",
      db_connected: "Đã kết nối dữ liệu",
      backend_dang_ket_noi: "Đang kết nối với phần lõi chương trình…",
      backend_khong_ket_noi: "Chưa kết nối được dữ liệu",
      backend_qua_han: "Chương trình chưa khởi động xong. Hãy đóng cửa sổ rồi mở lại. Nếu vẫn không được, gửi tệp loi_khoi_dong.txt (nằm trong thư mục dữ liệu) cho người phụ trách.",
      display_native: "Cửa sổ ứng dụng riêng",
      display_browser: "Chế độ dự phòng (trình duyệt)",
      last_run_line: "Chạy gần nhất: {run_at} (số khởi tạo {seed}, xếp được {n_matched}/{n_total})",
      never_run: "Chưa chạy sắp xếp lần nào",

      pipeline_title: "Vận hành sắp xếp",
      pipeline_desc: "Kiểm tra dữ liệu, bốc thăm, xếp học sinh vào CLB và xuất kết quả.",
      label_students: "học sinh",
      label_clubs: "CLB",
      label_submitted_prefs: "đã nộp nguyện vọng",
      label_matched: "đã xếp CLB",
      import_panel_title: "Nhập dữ liệu",
      import_hint: "Kéo tệp Excel (.xlsx) hoặc CSV vào ô bên dưới. Phần mềm tự nhận ra đó là danh sách CLB, tệp chọn CLB dự thi hay tệp xếp hạng nguyện vọng. Có thể thả nhiều tệp cùng lúc.",
      drop_zone_main: "Kéo tệp Excel hoặc CSV vào đây",
      drop_zone_sub: "Nhận tệp .xlsx và .csv. Bấm để chọn, có thể chọn nhiều tệp.",
      btn_import_all: "Nhập tất cả",
      btn_clear_queue: "Bỏ danh sách",
      csv_kind_clubs: "Danh sách CLB",
      csv_kind_test_selection: "Chọn CLB dự thi",
      csv_kind_preferences: "Xếp hạng nguyện vọng",
      csv_kind_unknown_label: "Chưa rõ",
      queue_detected: "Nhận diện: {kind}",
      queue_ambiguous: "Chưa rõ đây là loại tệp nào. Hãy chọn loại tệp ở ô bên phải.",
      queue_unknown: "Không nhận ra định dạng của tệp này. Xem các cột được hỗ trợ trong mau_csv/HUONG_DAN_CSV.md.",
      queue_pick_kind: "Chọn loại tệp",
      queue_result_clubs: "Xong: {n_created} CLB mới, {n_updated} CLB cập nhật, {n_skipped} dòng bỏ qua",
      queue_result_students: "Xong: {n_written} học sinh có dữ liệu, {n_created} học sinh mới, {n_skipped} dòng bỏ qua",
      feedback_import_done: "Đã nhập xong {n} tệp",
      steps_panel_title: "Các bước xử lý",
      label_seed: "Số khởi tạo bốc thăm",
      btn_validate: "Kiểm tra dữ liệu",
      btn_run_pipeline: "Chạy sắp xếp",
      step_title_validate: "Kiểm tra dữ liệu",
      step_title_stb: "Bốc thăm",
      step_title_rbda: "Xếp học sinh vào CLB",
      step_title_write: "Lưu kết quả",
      step_title_export: "Xuất kết quả",
      step_not_run_yet: "Chưa chạy",
      step_running: "Đang chạy…",
      step_done_default: "Hoàn tất",
      generic_error: "Có lỗi xảy ra",
      error_log_title: "Các lỗi cần xử lý",
      history_panel_title: "Lịch sử sắp xếp",
      btn_toggle: "Hiện/ẩn",
      th_time: "Thời điểm",
      th_seed: "Số khởi tạo",
      th_rounds: "Số vòng",
      th_matched_count: "Đã xếp",
      th_total: "Tổng",
      th_buoi_da_chay: "Buổi đã xếp",
      th_redrawn: "Đã bốc lại",
      history_empty: "Chưa có lần sắp xếp nào.",
      yes: "Có",
      no: "Không",

      results_title: "Kết quả",
      results_desc: "Học sinh đã được xếp vào CLB nào và mỗi CLB đã đủ chỗ chưa.",
      aria_thu_gon_muc: "Thu gọn hoặc mở rộng mục này",
      btn_thu_gon_tat_ca: "Thu gọn tất cả",
      btn_mo_rong_tat_ca: "Mở rộng tất cả",
      dem_hoc_sinh: "{n} học sinh",
      dem_cau_lac_bo: "{n} câu lạc bộ",
      dem_dong: "{n} dòng",
      clb_title: "Theo từng câu lạc bộ",
      clb_desc: "Không cộng dồn cột \"Số học sinh đăng ký\": một học sinh chọn ba CLB trong cùng buổi sẽ được đếm ở cả ba dòng, nhưng chỉ nhận được một chỗ.",
      clb_empty: "Chưa có câu lạc bộ nào.",
      clb_ds_tieu_de: "Thành viên {ten}",
      btn_xem_danh_sach: "Xem danh sách",
      btn_dong_danh_sach: "Đóng danh sách",
      th_so_dang_ky: "Số học sinh đăng ký",
      th_dat_nv1: "Đặt nguyện vọng 1",
      th_da_xep: "Đã xếp",
      du_tru_title: "Suất dự trữ đã dùng",
      du_tru_desc: "Suất dự trữ không ai dùng sẽ thành suất thường, và phần ưu tiên dành cho nhóm đó không còn tác dụng.",
      du_tru_khong_co: "Chưa câu lạc bộ nào đặt suất dự trữ.",
      th_nhom_dang_ky: "Học sinh thuộc nhóm đã đăng ký",
      th_da_dung: "Đã dùng",
      th_con_thua: "Còn thừa",
      nv_title: "Học sinh vào được nguyện vọng thứ mấy",
      nv_desc: "Số học sinh có chỗ chưa cho biết chỗ đó có đúng nguyện vọng hay không. Bảng này cho biết điều đó.",
      nv_hang: "Nguyện vọng {n}",
      nv_hang_gop: "Nguyện vọng {n} trở lên",
      nv_khong_ro: "Không rõ thứ hạng",
      chua_co_cho_title: "Học sinh chưa có CLB nào",
      chua_co_cho_desc: "Học sinh chỉ chọn một CLB đông người và học sinh chọn nhiều CLB nhưng vẫn chưa có chỗ là hai trường hợp khác nhau, cần cách xử lý khác nhau.",
      chua_co_cho_khong_ai: "Mọi học sinh đều có ít nhất một CLB.",
      th_so_nguyen_vong: "Số nguyện vọng",
      th_da_khai: "Các CLB đã chọn",
      chua_khai_gi: "Chưa chọn nguyện vọng nào",
      dem_suat: "{n} suất chưa dùng",
      dem_cho: "{n} chỗ đã xếp",
      fill_panel_title: "Mức lấp đầy của từng CLB",
      legend_general: "Suất thường",
      legend_reserve: "Vào bằng suất dự trữ",
      results_list_title: "Danh sách xếp CLB",
      placeholder_results_search: "Tìm theo mã hoặc tên học sinh…",
      btn_export_csv: "Xuất CSV",
      th_student_id: "Mã học sinh",
      th_name: "Họ tên",
      th_club: "Câu lạc bộ",
      th_tier: "Loại chỗ",
      th_pref_rank: "Hạng nguyện vọng",
      results_empty_state: "Chưa có kết quả. Hãy chạy sắp xếp ở thẻ \"Vận hành sắp xếp\" trước.",
      not_matched_label: "Không xếp được",
      unmatched_badge: "{n} học sinh chưa có CLB",
      tier_general: "Tổng quát",
      tier_reserve: "Dự trữ",

      fallback_title: "Nhập tại chỗ",
      fallback_desc: "Tìm hoặc tạo học sinh, rồi làm hai bước: chọn CLB dự thi và xếp hạng nguyện vọng. Hai bước này không phụ thuộc nhau.",
      fallback_step0_title: "Tìm hoặc tạo học sinh",
      placeholder_fallback_search: "Nhập mã học sinh hoặc tên…",
      btn_search: "Tìm",
      placeholder_new_student_id: "Mã học sinh mới",
      placeholder_full_name: "Họ tên",
      btn_create_student: "Tạo học sinh mới",
      btn_reset_entry: "Sửa lại từ đầu",
      confirm_reset_entry: "Bấm lần nữa để xoá hết và nhập lại",
      btn_delete_student: "Xoá học sinh",
      confirm_delete_student: "Bấm lần nữa để xoá học sinh",
      fallback_step1_title: "Bước 1. Chọn CLB dự thi",
      fallback_step1_hint: "Mỗi buổi chọn tối đa 5 CLB.",
      btn_save_test_selection: "Lưu CLB dự thi",
      fallback_step2_title: "Bước 2. Xếp hạng nguyện vọng",
      fallback_step2_hint: "Bấm vào CLB theo thứ tự muốn vào nhất trước, mỗi buổi tối đa 10 CLB. Có thể chọn cả CLB không có ở Bước 1.",
      ranking_current_label: "Thứ tự nguyện vọng",
      btn_clear_all: "Xoá hết",
      btn_save_preferences: "Lưu nguyện vọng",
      btn_remove_ranked: "xoá",
      search_no_students_found: "Không tìm thấy học sinh nào.",
      hs_nhan_clb_thi: "CLB dự thi",
      hs_nhan_nguyen_vong: "Nguyện vọng",
      hs_chua_chon: "Chưa chọn",
      hs_trang_thai_du: "Đã nhập đủ",
      hs_trang_thai_thieu_thi: "Thiếu CLB dự thi",
      hs_trang_thai_thieu_nv: "Thiếu nguyện vọng",
      hs_trang_thai_trong: "Chưa nhập gì",
      toast_need_id_and_name: "Cần nhập cả mã học sinh và họ tên.",
      toast_student_created: "Đã tạo học sinh mới.",
      toast_student_exists: "Học sinh này đã có sẵn. Đang mở thông tin.",
      feedback_test_selection_saved: "Đã lưu {n} CLB dự thi.",
      feedback_preferences_saved: "Đã lưu {n} nguyện vọng.",
      toast_reset_done: "Đã xoá CLB dự thi và nguyện vọng. Có thể nhập lại.",
      toast_student_deleted: "Đã xoá học sinh {student_id}.",

      admin_title: "Quản lý CLB & dự trữ",
      admin_desc: "Thêm, sửa CLB và gán nhãn dự trữ cho học sinh. Trường tự quyết định ai được dự trữ. Phần mềm chỉ ghép học sinh và CLB có cùng nhãn.",
      admin_club_form_title: "Thêm hoặc sửa CLB",
      placeholder_club_id: "Mã CLB (ví dụ: clb_01)",
      placeholder_club_name: "Tên CLB",
      placeholder_capacity: "Tổng chỗ",
      placeholder_reserve_capacity: "Suất dự trữ",
      placeholder_reserve_group: "Nhãn dự trữ (để trống nếu không có)",
      btn_save_club: "Lưu CLB",
      th_club_id: "Mã CLB",
      th_name_short: "Tên",
      th_capacity: "Tổng chỗ",
      th_reserve_capacity: "Suất dự trữ",
      th_reserve_group: "Nhãn dự trữ",
      admin_club_empty: "Chưa có CLB nào. Thêm CLB đầu tiên bằng biểu mẫu ở trên.",
      admin_reserve_assign_title: "Gán nhãn dự trữ cho học sinh",
      placeholder_admin_student_search: "Tìm học sinh theo mã hoặc tên…",
      placeholder_reserve_group_apply: "Nhãn dự trữ cần gán",
      btn_bulk_assign: "Gán cho học sinh đã đánh dấu",
      th_current_reserve_group: "Nhãn dự trữ hiện tại",
      admin_student_empty: "Chưa có học sinh nào. Thêm ở thẻ \"Nhập tại chỗ\" hoặc nạp tệp từ Microsoft Forms.",
      btn_prev_page: "‹ Trước",
      btn_next_page: "Sau ›",
      pagination_label: "Trang {page}/{total_pages} · {total} học sinh",
      btn_delete: "Xoá",
      confirm_delete_generic: "Bấm lần nữa để xoá",
      toast_club_deleted: "Đã xoá CLB {club_id}.",

      danger_zone_title: "Vùng nguy hiểm: xoá dữ liệu để làm lại",
      danger_zone_desc: "Nạp tệp chỉ thêm học sinh mới, không xoá học sinh cũ. Muốn làm lại với bộ dữ liệu khác, hãy xoá ở đây trước, nếu không học sinh cũ vẫn chiếm chỗ.",
      danger_zone_safety: "Cả hai nút đều tự sao lưu dữ liệu trước khi xoá. Lịch sử các lần sắp xếp được giữ lại.",
      btn_reset_students: "Xoá toàn bộ học sinh (giữ CLB)",
      btn_reset_all: "Xoá toàn bộ dữ liệu (cả CLB)",
      confirm_reset_students: "Bấm lần nữa để xoá tất cả học sinh",
      confirm_reset_all: "Bấm lần nữa để xoá tất cả dữ liệu",
      confirm_reset_students_has_results: "Bấm lần nữa. Kết quả đã sắp xếp cũng sẽ bị xoá",
      confirm_reset_all_has_results: "Bấm lần nữa. CLB và kết quả đã sắp xếp cũng sẽ bị xoá",
      toast_reset_students_done: "Đã xoá {n_students} học sinh, giữ lại {n_clubs_left} CLB. Bản sao lưu: {backup_name}",
      toast_reset_all_done: "Đã xoá {n_students} học sinh và {n_clubs} CLB. Bản sao lưu: {backup_name}",
      feedback_club_form_required: "Hãy nhập mã CLB, tên và tổng chỗ.",
      feedback_club_saved: "Đã lưu CLB {club_id}.",
      toast_no_students_ticked: "Chưa đánh dấu học sinh nào.",
      toast_bulk_assign_success: "Đã gán cho {n} học sinh.",

      scoring_title: "Nhập điểm",
      scoring_desc: "Chọn CLB để chấm. Danh sách chỉ có mã và họ tên, không có số bốc thăm hay thứ hạng nguyện vọng, để việc chấm điểm được khách quan.",
      scoring_overview_title: "Tiến độ chấm của từng CLB",
      th_n_applicants: "Đã đăng ký",
      th_n_scored: "Đã chấm",
      scoring_overview_empty: "Chưa CLB nào có học sinh đăng ký dự thi.",
      btn_save_scores: "Lưu điểm",
      th_score: "Điểm",
      btn_score_link: "Chấm →",
      feedback_scores_saved: "Đã lưu điểm cho {n} học sinh.",

      stb_locked_label: "Số bốc thăm đã khoá từ {locked_at}. Các lần sắp xếp sau giữ nguyên thứ tự cũ, học sinh mới được xếp ngẫu nhiên vào.",
      stb_unlocked_label: "Chưa bốc thăm lần nào. Lần sắp xếp đầu tiên sẽ bốc thăm và tự khoá kết quả.",
      btn_redraw_stb: "Bốc thăm lại…",
      toast_redraw_armed: "Bấm \"Chạy sắp xếp\" để bốc thăm lại. Sẽ có thêm một bước xác nhận trước khi chạy.",
      health_panel_title: "Cảnh báo dữ liệu",
      health_panel_hint: "Những điểm dưới đây không chặn việc sắp xếp nhưng có thể làm kết quả sai lệch. Nên xem trước khi chạy.",
      health_clean: "Không thấy vấn đề nào. Dữ liệu đã sẵn sàng.",
      health_summary: "{n} cảnh báo, {n_high} cảnh báo nghiêm trọng.",
      health_sev_high: "Nghiêm trọng",
      health_sev_medium: "Cần lưu ý",
      health_sev_info: "Thông tin",
      btn_health_recheck: "Kiểm tra lại",
      toast_data_valid: "Dữ liệu hợp lệ: {n_students} học sinh, {n_clubs} CLB.",
      toast_data_invalid: "Dữ liệu có lỗi. Xem danh sách lỗi bên dưới.",
      confirm_redraw_run: "Bốc thăm lại toàn bộ và sắp xếp lại? Kết quả hiện tại sẽ bị thay thế.",
      confirm_overwrite_run: "Đã có kết quả cũ. Sắp xếp lại sẽ thay kết quả này, bản cũ vẫn được lưu trong lịch sử. Tiếp tục?",
      confirm_overwrite_mot_phan: "Sắp xếp lại {buoi} và thay kết quả cũ của các buổi đó. Các buổi khác giữ nguyên. Tiếp tục?",
      btn_confirm_run: "Chạy",
      btn_cancel: "Huỷ",
      toast_run_success: "Sắp xếp xong: {n_matched}/{n_total} học sinh có CLB, sau {rounds} vòng.",
      toast_run_failed: "Sắp xếp không thành công. Xem danh sách lỗi bên dưới.",
      feedback_no_file_selected: "Chưa chọn tệp.",
      toast_export_success: "Đã xuất {n_rows} dòng vào {path}, kèm tệp Excel tổng hợp, tệp tóm tắt và {n_club_files} tệp theo từng CLB.",

      recovery_title: "Phục hồi dữ liệu",
      recovery_heading: "Không mở được dữ liệu",
      recovery_intro: "Chương trình không khởi động được vì tệp dữ liệu bị lỗi. Dữ liệu có thể vẫn còn. Hãy thử các bước bên dưới trước khi nhờ hỗ trợ.",
      recovery_error_detail_label: "Chi tiết kỹ thuật (gửi cho người hỗ trợ nếu cần)",
      recovery_backups_label: "Các bản sao lưu tìm thấy trên máy này:",
      th_backup_name: "Tên tệp",
      th_backup_time: "Thời điểm sao lưu",
      th_backup_size: "Dung lượng",
      btn_restore_backup: "Khôi phục từ bản sao lưu gần nhất",
      btn_start_fresh: "Bắt đầu với dữ liệu trống",
      confirm_start_fresh: "Bấm lần nữa để xác nhận. Tệp lỗi sẽ được đổi tên, không bị xoá",
      recovery_working: "Đang xử lý…",
      recovery_please_restart: "Hãy đóng và mở lại chương trình để tiếp tục.",

      /* --- Nhiều buổi sinh hoạt trong tuần --- */
      buoi_chua_chia: "Chưa chia buổi",
      th_buoi: "Buổi",
      placeholder_buoi: "Buổi sinh hoạt (ví dụ: thu_3)",
      buoi_hint_form: "Hai CLB cùng buổi là trùng giờ, mỗi học sinh chỉ vào được một. Để trống nếu trường chỉ có một buổi.",
      admin_lich_tuan_title: "Lịch tuần",
      admin_lich_tuan_desc: "Mỗi cột là một buổi. Thanh dưới mỗi CLB là mức lấp đầy của lần sắp xếp gần nhất.",
      admin_tai_buoi_title: "Tải theo buổi",
      admin_tai_buoi_desc: "Nên xem trước khi sắp xếp. Nếu một buổi quá đông trong khi buổi khác còn chỗ, hãy chuyển bớt CLB sang buổi vắng hơn.",
      th_so_clb: "Số CLB",
      th_tong_cho: "Tổng chỗ",
      th_em_muon_buoi: "Học sinh chọn buổi này",
      th_ti_le_choi: "Tỉ lệ chọi",
      ti_le_choi_giai_thich: "Tỉ lệ chọi tính theo số học sinh, không theo số nguyện vọng, vì mỗi học sinh chỉ nhận một chỗ mỗi buổi.",
      tai_buoi_qua_tai: "Quá tải",
      tai_buoi_vua_du: "Vừa đủ",
      tai_buoi_con_trong: "Còn trống",
      tai_buoi_empty: "Chưa có CLB nào để tính tải.",
      chon_buoi_title: "Buổi sẽ xếp",
      chon_buoi_tu: "Từ",
      chon_buoi_den: "đến",
      chon_buoi_tat_ca: "Chọn tất cả",
      chon_buoi_nhac_giu: "Giữ nguyên kết quả của: {buoi}. Chỉ các buổi đang chọn được sắp xếp lại.",
      chon_buoi_nhac_het: "Sắp xếp lại tất cả các buổi trong tuần.",
      tham_title: "Số bốc thăm theo buổi",
      tham_desc: "Mỗi buổi có thứ tự riêng, được xáo từ bộ số đã khoá, nên không học sinh nào bị xếp cuối ở mọi buổi.",
      tham_tai_lap: "Chỉ cần công bố bộ số đã khoá và số khởi tạo. Ai tính lại cũng ra đúng bảng này.",
      tham_cach_cu: "Lần sắp xếp gần nhất dùng cách bốc thăm cũ, một thứ tự chung cho cả tuần, nên các cột bên dưới giống nhau. Chạy sắp xếp lại để mỗi buổi có thứ tự riêng.",
      results_xem_tkb: "Thời khoá biểu",
      results_xem_danh_sach: "Danh sách",
      tkb_title: "Thời khoá biểu tuần",
      tkb_desc: "Mỗi học sinh một dòng, mỗi buổi một ô. Ô trống là buổi đó chưa có CLB.",
      tkb_so_clb: "Số CLB",
      do_phu_title: "Số CLB của mỗi học sinh",
      do_phu_desc: "Con số quan trọng nhất là số học sinh không có CLB nào trong cả tuần.",
      do_phu_tb: "CLB trung bình mỗi học sinh",
      do_phu_trang_tay: "Học sinh không có CLB nào cả tuần",
      do_phu_x_clb: "{n} CLB",
      do_phu_0_clb: "Không CLB nào",
      do_phu_1_clb: "1 CLB",
      do_phu_danh_sach: "Học sinh chưa có CLB",
      fallback_buoi_hint: "Mỗi buổi chỉ nhận được tối đa một CLB. Chọn CLB ở nhiều buổi để có lịch cả tuần.",
      fallback_phu_buoi: "Đã xếp hạng ở {n}/{tong} buổi",
      chi_tiet_ky_thuat: "Chi tiết kỹ thuật",
      btn_dong_thong_bao: "Đóng",
    },

    en: {
      page_title: "Club Allocation · RB-DA",
      lang_toggle_label: "VI",
      brand_title: "Club Allocation",
      brand_sub: "Reserve-Based DA",
      nav_pipeline: "Allocation",
      nav_results: "Results",
      nav_fallback: "Kiosk entry",
      nav_admin: "Clubs & reserves",
      nav_scoring: "Score entry",
      db_status_loading: "Loading…",
      db_connected: "Data connected",
      backend_dang_ket_noi: "Connecting to the application core…",
      backend_khong_ket_noi: "Data not connected yet",
      backend_qua_han: "The program didn't finish starting. Close the window and open it again. If that doesn't help, send the file loi_khoi_dong.txt (in the data folder) to the person in charge.",
      display_native: "Native application window",
      display_browser: "Fallback mode (browser)",
      last_run_line: "Last run: {run_at} (starting number {seed}, {n_matched}/{n_total} placed)",
      never_run: "No allocation has been run yet",

      pipeline_title: "Allocation",
      pipeline_desc: "Check the data, draw lottery numbers, place students in clubs, and export the results.",
      label_students: "students",
      label_clubs: "clubs",
      label_submitted_prefs: "submitted preferences",
      label_matched: "matched to a club",
      import_panel_title: "Import data",
      import_hint: "Drop Excel (.xlsx) or CSV files below. The app works out whether each file is a club list, a test club file, or a preferences file. Several files can be dropped at once.",
      drop_zone_main: "Drop Excel or CSV files here",
      drop_zone_sub: "Accepts .xlsx and .csv. Click to choose one or more files.",
      btn_import_all: "Import all",
      btn_clear_queue: "Clear list",
      csv_kind_clubs: "Club list",
      csv_kind_test_selection: "Test clubs",
      csv_kind_preferences: "Ranked preferences",
      csv_kind_unknown_label: "Unclear",
      queue_detected: "Detected: {kind}",
      queue_ambiguous: "Not sure what kind of file this is. Choose the type on the right.",
      queue_unknown: "This file format isn't recognised. See the supported columns in mau_csv/HUONG_DAN_CSV.md.",
      queue_pick_kind: "Choose file type",
      queue_result_clubs: "Done: {n_created} new club(s), {n_updated} updated, {n_skipped} row(s) skipped",
      queue_result_students: "Done: {n_written} student(s) written, {n_created} created, {n_skipped} skipped",
      feedback_import_done: "Imported {n} file(s)",
      steps_panel_title: "Processing steps",
      label_seed: "Lottery starting number",
      btn_validate: "Validate data",
      btn_run_pipeline: "Run allocation",
      step_title_validate: "Check data",
      step_title_stb: "Draw lottery numbers",
      step_title_rbda: "Place students in clubs",
      step_title_write: "Save results",
      step_title_export: "Export results",
      step_not_run_yet: "Not run yet",
      step_running: "Running…",
      step_done_default: "Done",
      generic_error: "Something went wrong",
      error_log_title: "Problems to fix",
      history_panel_title: "Allocation history",
      btn_toggle: "Show/hide",
      th_time: "Time",
      th_seed: "Starting number",
      th_rounds: "Rounds",
      th_matched_count: "Matched",
      th_total: "Total",
      th_buoi_da_chay: "Sessions allocated",
      th_redrawn: "Redrawn",
      history_empty: "No allocations yet.",
      yes: "Yes",
      no: "No",

      results_title: "Results",
      results_desc: "Students matched to a club, and how full each club is.",
      aria_thu_gon_muc: "Collapse or expand this section",
      btn_thu_gon_tat_ca: "Collapse all",
      btn_mo_rong_tat_ca: "Expand all",
      dem_hoc_sinh: "{n} students",
      dem_cau_lac_bo: "{n} clubs",
      dem_dong: "{n} rows",
      clb_title: "By club",
      clb_desc: "Don't add up the \"Applicants\" column: a student who picks three clubs in one session is counted on all three rows but can only get one seat.",
      clb_empty: "No clubs yet.",
      clb_ds_tieu_de: "Members of {ten}",
      btn_xem_danh_sach: "View roster",
      btn_dong_danh_sach: "Close roster",
      th_so_dang_ky: "Students who applied",
      th_dat_nv1: "Ranked it first",
      th_da_xep: "Placed",
      du_tru_title: "Reserve seats used",
      du_tru_desc: "Reserve seats nobody uses become regular seats, and the priority meant for that group is lost.",
      du_tru_khong_co: "No club reserves any seats yet.",
      th_nhom_dang_ky: "Group members who applied",
      th_da_dung: "Used",
      th_con_thua: "Unused",
      nv_title: "Which preference students got",
      nv_desc: "A seat count doesn't show whether each seat matches a preference. This chart does.",
      nv_hang: "Choice {n}",
      nv_hang_gop: "Choice {n} or later",
      nv_khong_ro: "Rank not recorded",
      chua_co_cho_title: "Students without a club",
      chua_co_cho_desc: "A student who chose one crowded club and a student who chose many clubs but still has no seat are different cases that need different fixes.",
      chua_co_cho_khong_ai: "Every student has at least one club.",
      th_so_nguyen_vong: "Preferences entered",
      th_da_khai: "Clubs ranked",
      chua_khai_gi: "No preferences yet",
      dem_suat: "{n} unused seats",
      dem_cho: "{n} placements",
      fill_panel_title: "Fill rate by club",
      legend_general: "Regular seats",
      legend_reserve: "Admitted on a reserved seat",
      results_list_title: "Club assignments",
      placeholder_results_search: "Search by student ID or name…",
      btn_export_csv: "Export CSV",
      th_student_id: "Student ID",
      th_name: "Name",
      th_club: "Club",
      th_tier: "Seat type",
      th_pref_rank: "Preference rank",
      results_empty_state: "No results yet. Run the allocation on the \"Allocation\" tab first.",
      not_matched_label: "Not matched",
      unmatched_badge: "{n} student(s) without a club",
      tier_general: "General",
      tier_reserve: "Reserve",

      fallback_title: "Kiosk entry",
      fallback_desc: "Find or add a student, then complete two steps: choose test clubs and rank preferences. The steps don't depend on each other.",
      fallback_step0_title: "Find or create a student",
      placeholder_fallback_search: "Enter student ID or name…",
      btn_search: "Search",
      placeholder_new_student_id: "New student ID",
      placeholder_full_name: "Full name",
      btn_create_student: "Create new student",
      btn_reset_entry: "Start over",
      confirm_reset_entry: "Click again to clear and start over",
      btn_delete_student: "Delete student",
      confirm_delete_student: "Click again to delete this student",
      fallback_step1_title: "Step 1. Choose test clubs",
      fallback_step1_hint: "Up to 5 clubs per session.",
      btn_save_test_selection: "Save test clubs",
      fallback_step2_title: "Step 2. Rank preferences",
      fallback_step2_hint: "Click clubs in order, most wanted first, up to 10 per session. Clubs not picked in Step 1 can be ranked too.",
      ranking_current_label: "Preference order",
      btn_clear_all: "Clear all",
      btn_save_preferences: "Save preferences",
      btn_remove_ranked: "remove",
      search_no_students_found: "No students found.",
      hs_nhan_clb_thi: "Test clubs",
      hs_nhan_nguyen_vong: "Preferences",
      hs_chua_chon: "None yet",
      hs_trang_thai_du: "Complete",
      hs_trang_thai_thieu_thi: "No test clubs",
      hs_trang_thai_thieu_nv: "No preferences",
      hs_trang_thai_trong: "Nothing entered",
      toast_need_id_and_name: "Both a student ID and a name are required.",
      toast_student_created: "New student created.",
      toast_student_exists: "This student already exists. Opening the details.",
      feedback_test_selection_saved: "Saved {n} test club(s).",
      feedback_preferences_saved: "Saved {n} preference(s).",
      toast_reset_done: "Cleared the test clubs and preferences. Ready to enter again.",
      toast_student_deleted: "Deleted student {student_id}.",

      admin_title: "Clubs & reserves",
      admin_desc: "Add or edit clubs and give students reserve labels. The school decides who gets reserve seats. The app only matches students and clubs that share a label.",
      admin_club_form_title: "Add or edit a club",
      placeholder_club_id: "Club ID (e.g. club_01)",
      placeholder_club_name: "Club name",
      placeholder_capacity: "Total seats",
      placeholder_reserve_capacity: "Reserved seats",
      placeholder_reserve_group: "Reserve label (leave blank if none)",
      btn_save_club: "Save club",
      th_club_id: "Club ID",
      th_name_short: "Name",
      th_capacity: "Total seats",
      th_reserve_capacity: "Reserved seats",
      th_reserve_group: "Reserve label",
      admin_club_empty: "No clubs yet. Add the first one with the form above.",
      admin_reserve_assign_title: "Give students a reserve label",
      placeholder_admin_student_search: "Search students by ID or name…",
      placeholder_reserve_group_apply: "Reserve label to apply",
      btn_bulk_assign: "Assign to ticked students",
      th_current_reserve_group: "Current reserve label",
      admin_student_empty: "No students yet. Add them on the \"Kiosk entry\" tab or import a Microsoft Forms file.",
      btn_prev_page: "‹ Prev",
      btn_next_page: "Next ›",
      pagination_label: "Page {page}/{total_pages} · {total} students",
      btn_delete: "Delete",
      confirm_delete_generic: "Click again to delete",
      toast_club_deleted: "Deleted club {club_id}.",

      danger_zone_title: "Danger zone: delete data to start over",
      danger_zone_desc: "Importing a file only adds students. It doesn't remove existing ones. To start over with a different set, delete here first, or the old students will keep taking seats.",
      danger_zone_safety: "Both buttons back up the data before deleting. The allocation history is kept.",
      btn_reset_students: "Delete all students (keep clubs)",
      btn_reset_all: "Delete all data (clubs too)",
      confirm_reset_students: "Click again to delete all students",
      confirm_reset_all: "Click again to delete all data",
      confirm_reset_students_has_results: "Click again. The allocation results will also be deleted",
      confirm_reset_all_has_results: "Click again. Clubs and allocation results will also be deleted",
      toast_reset_students_done: "Deleted {n_students} student(s); {n_clubs_left} club(s) kept. Backup: {backup_name}",
      toast_reset_all_done: "Deleted {n_students} student(s) and {n_clubs} club(s). Backup: {backup_name}",
      feedback_club_form_required: "Enter the club code, name, and total seats.",
      feedback_club_saved: "Saved club {club_id}.",
      toast_no_students_ticked: "No students ticked.",
      toast_bulk_assign_success: "Assigned to {n} student(s).",

      scoring_title: "Score entry",
      scoring_desc: "Choose a club to score. The list shows only codes and names, never lottery numbers or preference ranks, so scoring stays fair.",
      scoring_overview_title: "Scoring progress by club",
      th_n_applicants: "Registered",
      th_n_scored: "Scored",
      scoring_overview_empty: "No club has students signed up to test yet.",
      btn_save_scores: "Save scores",
      th_score: "Score",
      btn_score_link: "Score →",
      feedback_scores_saved: "Saved scores for {n} student(s).",

      stb_locked_label: "Lottery numbers locked since {locked_at}. Later allocations keep the same order, and new students are added at random.",
      stb_unlocked_label: "No lottery has been drawn yet. The first allocation will draw and lock the numbers.",
      btn_redraw_stb: "Redraw lottery…",
      toast_redraw_armed: "Click \"Run allocation\" to redraw the lottery. There will be one more confirmation before it runs.",
      health_panel_title: "Data warnings",
      health_panel_hint: "These don't stop the allocation, but they can skew the results. Check them before running.",
      health_clean: "No problems found. The data is ready.",
      health_summary: "{n} warning(s), {n_high} serious.",
      health_sev_high: "Serious",
      health_sev_medium: "Worth checking",
      health_sev_info: "Information",
      btn_health_recheck: "Re-check",
      toast_data_valid: "The data is valid: {n_students} students, {n_clubs} clubs.",
      toast_data_invalid: "The data has problems. See the list below.",
      confirm_redraw_run: "Redraw every lottery number and allocate again? The current results will be replaced.",
      confirm_overwrite_run: "Results already exist. Allocating again replaces them, and the old ones stay in the history. Continue?",
      confirm_overwrite_mot_phan: "Allocate {buoi} again and replace those sessions' results. Other sessions stay as they are. Continue?",
      btn_confirm_run: "Run",
      btn_cancel: "Cancel",
      toast_run_success: "Allocation finished: {n_matched}/{n_total} students placed in {rounds} round(s).",
      toast_run_failed: "The allocation didn't finish. See the list below.",
      feedback_no_file_selected: "No file selected.",
      toast_export_success: "Exported {n_rows} row(s) to {path}, plus a combined Excel file, a summary file, and {n_club_files} file(s) per club.",

      recovery_title: "Data recovery",
      recovery_heading: "Couldn't open the data",
      recovery_intro: "The program couldn't start because the data file has a problem. The data may still be there. Try the steps below before asking for help.",
      recovery_error_detail_label: "Technical details (send to support if needed)",
      recovery_backups_label: "Backups found on this machine:",
      th_backup_name: "File name",
      th_backup_time: "Backed up at",
      th_backup_size: "Size",
      btn_restore_backup: "Restore from the latest backup",
      btn_start_fresh: "Start with empty data",
      confirm_start_fresh: "Click again to confirm. The damaged file will be renamed, not deleted",
      recovery_working: "Working…",
      recovery_please_restart: "Close and reopen the program to continue.",

      /* --- Multiple sessions per week --- */
      buoi_chua_chia: "No session set",
      th_buoi: "Session",
      placeholder_buoi: "Session (e.g. thu_3)",
      buoi_hint_form: "Two clubs in the same session clash, so a student can join only one. Leave it blank if the school has a single session.",
      admin_lich_tuan_title: "The week at a glance",
      admin_lich_tuan_desc: "Each column is one session. The bar under each club shows how full it was on the latest run.",
      admin_tai_buoi_title: "Demand by session",
      admin_tai_buoi_desc: "Check this before allocating. If one session is crowded while another has room, move a club to the quieter session.",
      th_so_clb: "Clubs",
      th_tong_cho: "Seats",
      th_em_muon_buoi: "Students wanting it",
      th_ti_le_choi: "Applicants per seat",
      ti_le_choi_giai_thich: "Applicants per seat counts students, not preferences, because each student gets at most one seat per session.",
      tai_buoi_qua_tai: "Oversubscribed",
      tai_buoi_vua_du: "About right",
      tai_buoi_con_trong: "Room to spare",
      tai_buoi_empty: "No clubs yet, so there is nothing to measure.",
      chon_buoi_title: "Sessions to allocate",
      chon_buoi_tu: "From",
      chon_buoi_den: "to",
      chon_buoi_tat_ca: "Select all",
      chon_buoi_nhac_giu: "Keeping the existing results for {buoi}. Only the selected sessions are allocated again.",
      chon_buoi_nhac_het: "Every session in the week will be allocated again.",
      tham_title: "Lottery order by session",
      tham_desc: "Each session has its own order, shuffled from the locked numbers, so no student ends up last in every session.",
      tham_tai_lap: "Publishing the locked numbers and the starting number is enough. Anyone who recalculates gets this exact table.",
      tham_cach_cu: "The last allocation used the old lottery, one order for the whole week, so the columns below match. Run the allocation again to give each session its own order.",
      results_xem_tkb: "Timetable",
      results_xem_danh_sach: "List",
      tkb_title: "The week each student gets",
      tkb_desc: "One row per student, one cell per session. An empty cell means no club for that student in that session.",
      tkb_so_clb: "Clubs",
      do_phu_title: "How many clubs each student got",
      do_phu_desc: "The most important number is how many students have no club all week.",
      do_phu_tb: "Clubs per student",
      do_phu_trang_tay: "Students with no club all week",
      do_phu_x_clb: "{n} clubs",
      do_phu_0_clb: "No club",
      do_phu_1_clb: "1 club",
      do_phu_danh_sach: "Students without a club",
      fallback_buoi_hint: "A student can get at most one club per session. Choosing clubs in several sessions fills the week.",
      fallback_phu_buoi: "Ranked in {n} of {tong} sessions",
      chi_tiet_ky_thuat: "Technical details",
      btn_dong_thong_bao: "Close",
    },
  };

  let currentLang = "vi";
  try {
    const stored = global.localStorage && global.localStorage.getItem("rbda_lang");
    if (stored === "vi" || stored === "en") currentLang = stored;
  } catch (e) {
    /* localStorage unavailable — default to vi */
  }

  function interpolate(template, params) {
    if (!params) return template;
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      if (!(key in params)) return match;
      const v = params[key];
      if (v === null || v === undefined) return "";
      return Array.isArray(v) ? v.join(", ") : String(v);
    });
  }

  function t(key, params) {
    const table = UI_STRINGS[currentLang] || UI_STRINGS.vi;
    const template = key in table ? table[key] : (UI_STRINGS.vi[key] || key);
    return interpolate(template, params);
  }

  function translateError(entry) {
    if (entry === null || entry === undefined) return "";
    if (typeof entry === "string") return entry;
    if (typeof entry === "object" && entry.code) {
      const table = ERROR_MESSAGES[entry.code];
      const template = table ? (table[currentLang] || table.vi) : entry.code;
      return interpolate(template, entry.params);
    }
    try {
      return JSON.stringify(entry);
    } catch (e) {
      return String(entry);
    }
  }

  function translateErrors(list) {
    if (!Array.isArray(list)) return [translateError(list)];
    return list.map(translateError);
  }

  /* Chi tiet ky thuat (params.detail = thong bao goc cua may) cua mot
     danh sach loi, bo trung va bo rong. Cau loi khong chen chi tiet nay;
     giao dien hien no rieng trong muc "Chi tiet ky thuat". */
  function errorDetails(list) {
    const ds = Array.isArray(list) ? list : [list];
    const kq = [];
    ds.forEach((e) => {
      const d = e && typeof e === "object" && e.params ? e.params.detail : null;
      if (d !== null && d !== undefined && String(d).trim() && kq.indexOf(String(d)) === -1) {
        kq.push(String(d));
      }
    });
    return kq;
  }

  function applyStaticText() {
    document.querySelectorAll("[data-i18n]").forEach((elm) => {
      // Skip a two-step-confirm button while it's armed (.is-confirming):
      // armTwoStepConfirm tracks "armed" state internally and only the
      // element's OWN reset logic may change its label back — overwriting
      // it here would desync visible state from internal state (button
      // would look freshly-unarmed while a single click still fires the
      // destructive action).
      if (elm.classList && elm.classList.contains("is-confirming")) return;
      elm.textContent = t(elm.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-html]").forEach((elm) => {
      elm.innerHTML = t(elm.getAttribute("data-i18n-html"));
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((elm) => {
      elm.placeholder = t(elm.getAttribute("data-i18n-placeholder"));
    });
    /* Nut chi co bieu tuong thi khong co chu nao de doc len — nhan cho
       trinh doc man hinh phai dich theo ngon ngu nhu moi chu khac.
       CANH: bieu thuc trong tests/test_i18n_sync.py phai phu ca duoi
       "-aria-label", neu khong khoa moi se lot khoi luoi canh va hien ra
       chuoi khoa tho ma khong test nao do. */
    document.querySelectorAll("[data-i18n-aria-label]").forEach((elm) => {
      elm.setAttribute("aria-label", t(elm.getAttribute("data-i18n-aria-label")));
    });
    document.title = t("page_title");
    const langBtn = document.getElementById("btnLangToggle");
    if (langBtn) langBtn.textContent = t("lang_toggle_label");
  }

  function getLang() {
    return currentLang;
  }

  function setLang(lang) {
    if (lang !== "vi" && lang !== "en") return;
    currentLang = lang;
    try {
      global.localStorage && global.localStorage.setItem("rbda_lang", lang);
    } catch (e) {
      /* ignore */
    }
    document.documentElement.lang = lang;
    applyStaticText();
    global.dispatchEvent(new Event("langchange"));
  }

  global.I18N = { t, translateError, translateErrors, errorDetails, getLang, setLang, applyStaticText };
})(window);
