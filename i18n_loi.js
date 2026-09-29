/* ==========================================================================
   i18n_loi.js — TỆP SINH TỰ ĐỘNG, KHÔNG SỬA TAY.
   ==========================================================================
   Nguồn: MESSAGES trong i18n_errors.py. Sửa ở đó rồi chạy:
       python tao_i18n_js.py
   tests/test_i18n_sync.py đỏ ngay nếu tệp này lệch khỏi nguồn.
   ========================================================================== */
window.I18N_ERROR_MESSAGES = {
  "error_reading_last_run": {
    "vi": "Lỗi đọc thông tin lần chạy gần nhất: {detail}",
    "en": "Error reading last run info: {detail}"
  },
  "error_reading_dashboard": {
    "vi": "Lỗi đọc trạng thái tổng quan: {detail}",
    "en": "Error reading dashboard status: {detail}"
  },
  "error_checking_integrity": {
    "vi": "Lỗi khi kiểm tra dữ liệu: {detail}",
    "en": "Error checking data integrity: {detail}"
  },
  "error_checking_run_warning": {
    "vi": "Lỗi kiểm tra trạng thái trước khi chạy: {detail}",
    "en": "Error checking pre-run status: {detail}"
  },
  "error_reading_stb_lock": {
    "vi": "Lỗi đọc trạng thái khoá số bốc thăm: {detail}",
    "en": "Error reading STB lock status: {detail}"
  },
  "error_reading_run_history": {
    "vi": "Lỗi đọc nhật ký chạy: {detail}",
    "en": "Error reading run history: {detail}"
  },
  "error_running_pipeline": {
    "vi": "Lỗi không xác định khi chạy sắp xếp: {detail}",
    "en": "Unexpected error while running the allocation: {detail}"
  },
  "error_reading_csv_preview": {
    "vi": "Lỗi đọc trước CSV: {detail}",
    "en": "Error previewing CSV: {detail}"
  },
  "error_importing_preferences_csv": {
    "vi": "Lỗi nhập CSV nguyện vọng: {detail}",
    "en": "Error importing preferences CSV: {detail}"
  },
  "error_importing_test_selection_csv": {
    "vi": "Lỗi nhập CSV chọn CLB thi: {detail}",
    "en": "Error importing test-selection CSV: {detail}"
  },
  "error_reading_scoring_overview": {
    "vi": "Lỗi đọc tổng quan chấm điểm: {detail}",
    "en": "Error reading scoring overview: {detail}"
  },
  "error_reading_scoring_list": {
    "vi": "Lỗi đọc danh sách chấm điểm: {detail}",
    "en": "Error reading scoring list: {detail}"
  },
  "error_saving_scores": {
    "vi": "Lỗi lưu điểm: {detail}",
    "en": "Error saving scores: {detail}"
  },
  "error_reading_club_roster": {
    "vi": "Lỗi đọc danh sách thành viên câu lạc bộ: {detail}",
    "en": "Error reading club roster: {detail}"
  },
  "error_reading_pref_distribution": {
    "vi": "Lỗi đọc phân bố nguyện vọng: {detail}",
    "en": "Error reading preference distribution: {detail}"
  },
  "error_reading_unplaced": {
    "vi": "Lỗi đọc danh sách em chưa có chỗ: {detail}",
    "en": "Error reading unplaced students: {detail}"
  },
  "error_reading_reserve_usage": {
    "vi": "Lỗi đọc mức dùng suất dự trữ: {detail}",
    "en": "Error reading reserve seat usage: {detail}"
  },
  "error_reading_results": {
    "vi": "Lỗi đọc kết quả: {detail}",
    "en": "Error reading results: {detail}"
  },
  "error_detecting_csv_kind": {
    "vi": "Lỗi nhận diện loại tệp CSV: {detail}",
    "en": "Error detecting CSV kind: {detail}"
  },
  "error_importing_csv_auto": {
    "vi": "Lỗi nhập CSV: {detail}",
    "en": "Error importing CSV: {detail}"
  },
  "error_importing_clubs_csv": {
    "vi": "Lỗi nhập CSV danh sách CLB: {detail}",
    "en": "Error importing club list CSV: {detail}"
  },
  "csv_kind_ambiguous": {
    "vi": "Chưa xác định được đây là tệp gì. Bộ cột {fieldnames} vừa có thể là chọn CLB muốn thi, vừa có thể là xếp hạng nguyện vọng. Hãy chọn giúp loại tệp, hoặc thêm cột rank nếu đây là nguyện vọng.",
    "en": "Cannot tell what this file is. The columns {fieldnames} could be either club test selection or ranked preferences. Please pick the kind, or add a rank column if these are preferences."
  },
  "csv_kind_unknown": {
    "vi": "Không nhận ra định dạng tệp. Xem mau_csv/HUONG_DAN_CSV.md để biết các cột phần mềm đọc được.",
    "en": "Unrecognised file format. See mau_csv/HUONG_DAN_CSV.md for the columns the app can read."
  },
  "csv_club_row_invalid": {
    "vi": "Dòng {line}: bỏ qua vì {reason} không hợp lệ (chỉ tiêu phải lớn hơn 0 và chỉ tiêu dự trữ không được vượt quá tổng chỉ tiêu).",
    "en": "Line {line}: skipped because {reason} is invalid (capacity must be above 0 and reserve capacity cannot exceed capacity)."
  },
  "xlsx_read_failed": {
    "vi": "Không đọc được tệp Excel: {detail}. Kiểm tra lại xem đúng là tệp .xlsx không, hoặc lưu lại rồi thử lần nữa.",
    "en": "Could not read the Excel file: {detail}. Check it really is an .xlsx file, or re-save it and try again."
  },
  "file_too_large": {
    "vi": "Tệp quá lớn ({size_mb} MB, tối đa {max_mb} MB). Tệp danh sách của một trường không lớn cỡ này — kiểm tra xem có chọn nhầm tệp không.",
    "en": "The file is too large ({size_mb} MB, maximum {max_mb} MB). A school's list is never this big — check that the right file was chosen."
  },
  "xlsx_empty": {
    "vi": "Tệp Excel không có dữ liệu nào.",
    "en": "The Excel file has no data."
  },
  "xlsx_support_missing": {
    "vi": "Bản cài này không đọc được tệp Excel. Hãy lưu tệp sang định dạng CSV UTF-8 rồi nạp lại.",
    "en": "This build cannot read Excel files. Save the file as CSV UTF-8 and try again."
  },
  "csv_reserve_group_unknown": {
    "vi": "Nhãn dự trữ {reserve_group} ({n} học sinh) không CLB nào nhận — các em này sẽ KHÔNG được xét diện dự trữ. Có phải bạn định ghi {goi_y}?",
    "en": "Reserve label {reserve_group} ({n} student(s)) is not used by any club — they will NOT be considered for reserve places. Did you mean {goi_y}?"
  },
  "csv_duplicate_student_rows": {
    "vi": "Mã {student_id} xuất hiện {n} lần trong tệp — chỉ dòng CUỐI được giữ, các dòng trước bị ghi đè. Kiểm tra lại nếu đó không phải ý bạn.",
    "en": "Student {student_id} appears {n} times in the file — only the LAST row is kept and the earlier ones are overwritten. Check this is intended."
  },
  "csv_score_not_a_number": {
    "vi": "Điểm “{score}” của học sinh {student_id} ở CLB {club_id} không phải số — ô điểm đó bị bỏ qua, các lựa chọn thi vẫn được giữ. Sửa lại rồi nạp lại tệp.",
    "en": "Score “{score}” for student {student_id} at club {club_id} is not a number — that one score is skipped, the test selections are kept. Fix it and re-import."
  },
  "csv_score_negative": {
    "vi": "Điểm “{score}” của học sinh {student_id} ở CLB {club_id} là số ÂM — gần như chắc chắn thừa dấu trừ. Ô điểm đó bị bỏ qua.",
    "en": "Score “{score}” for student {student_id} at club {club_id} is NEGATIVE — almost certainly a stray minus sign. That score is skipped."
  },
  "csv_score_for_unselected_club": {
    "vi": "Học sinh {student_id} có điểm cho CLB {club_id} nhưng KHÔNG đăng ký thi CLB đó — điểm bị bỏ qua. Kiểm tra xem có gõ nhầm mã CLB không.",
    "en": "Student {student_id} has a score for club {club_id} but did not register to test for it — the score is skipped. Check for a mistyped club id."
  },
  "csv_score_without_club": {
    "vi": "Học sinh {student_id} có điểm ở ô điểm số {cot} nhưng ô mã CLB tương ứng lại để trống — nhiều khả năng gõ lệch cột. Điểm đó bị bỏ qua.",
    "en": "Student {student_id} has a score in score slot {cot} but the matching club column is empty — the columns are probably misaligned. That score is skipped."
  },
  "csv_scores_ignored_here": {
    "vi": "Tệp này có cột điểm, nhưng đây là tệp XẾP HẠNG NGUYỆN VỌNG — điểm KHÔNG được nạp từ đây. Đưa cột điểm sang tệp chọn CLB muốn thi.",
    "en": "This file has score columns, but it is a PREFERENCE ranking file — scores are NOT imported from here. Move the score columns into the club test-selection file."
  },
  "csv_student_id_case_conflict": {
    "vi": "Mã {student_id} chỉ khác chữ hoa/thường so với mã {da_co} — phần mềm đang coi đây là HAI học sinh khác nhau. Nếu là một người, hãy sửa cho hai tệp dùng cùng một kiểu viết.",
    "en": "Student id {student_id} differs from {da_co} only in case — these are being treated as TWO different students. If they are the same person, make both files use the same spelling."
  },
  "csv_student_id_maybe_truncated": {
    "vi": "Mã {student_id} chỉ dài {do_dai} chữ số, trong khi phần lớn mã trong tệp dài {do_dai_pho_bien} — nhiều khả năng Excel đã cắt mất số 0 ở đầu. Mở tệp gốc, đặt định dạng cột mã là Text rồi nhập lại.",
    "en": "Student id {student_id} has only {do_dai} digits while most ids in the file have {do_dai_pho_bien} — Excel has most likely stripped leading zeros. Reopen the source file, set the id column to Text, and re-import."
  },
  "error_reading_club_stats": {
    "vi": "Lỗi đọc thống kê CLB: {detail}",
    "en": "Error reading club stats: {detail}"
  },
  "error_exporting_csv": {
    "vi": "Lỗi xuất CSV: {detail}",
    "en": "Error exporting CSV: {detail}"
  },
  "error_saving_club": {
    "vi": "Lỗi lưu CLB: {detail}",
    "en": "Error saving club: {detail}"
  },
  "error_deleting_club": {
    "vi": "Lỗi xoá CLB: {detail}",
    "en": "Error deleting club: {detail}"
  },
  "error_reading_reserve_groups": {
    "vi": "Lỗi đọc danh sách nhãn dự trữ: {detail}",
    "en": "Error reading reserve groups: {detail}"
  },
  "error_assigning_reserve_group": {
    "vi": "Lỗi gán nhãn dự trữ: {detail}",
    "en": "Error assigning reserve group: {detail}"
  },
  "error_bulk_assigning": {
    "vi": "Lỗi gán hàng loạt: {detail}",
    "en": "Error bulk-assigning: {detail}"
  },
  "error_reading_student_list": {
    "vi": "Lỗi đọc danh sách học sinh: {detail}",
    "en": "Error reading student list: {detail}"
  },
  "error_reading_club_list": {
    "vi": "Lỗi đọc danh sách CLB: {detail}",
    "en": "Error reading club list: {detail}"
  },
  "error_searching_students": {
    "vi": "Lỗi tìm học sinh: {detail}",
    "en": "Error searching students: {detail}"
  },
  "error_reading_student_state": {
    "vi": "Lỗi đọc trạng thái học sinh: {detail}",
    "en": "Error reading student state: {detail}"
  },
  "error_saving_test_selection": {
    "vi": "Lỗi ghi lựa chọn thi: {detail}",
    "en": "Error saving test selection: {detail}"
  },
  "error_saving_preferences": {
    "vi": "Lỗi ghi nguyện vọng: {detail}",
    "en": "Error saving preferences: {detail}"
  },
  "error_creating_student": {
    "vi": "Lỗi tạo học sinh: {detail}",
    "en": "Error creating student: {detail}"
  },
  "error_resetting_student_entry": {
    "vi": "Lỗi xoá lựa chọn để nhập lại: {detail}",
    "en": "Error resetting student entry: {detail}"
  },
  "error_deleting_student": {
    "vi": "Lỗi xoá học sinh: {detail}",
    "en": "Error deleting student: {detail}"
  },
  "reset_confirmation_mismatch": {
    "vi": "Chưa xoá gì cả — thiếu xác nhận. Muốn xoá thật thì phải gõ đúng chữ \"{can_go}\".",
    "en": "Nothing was deleted — confirmation missing. To confirm a real reset, type exactly \"{can_go}\"."
  },
  "reset_scope_unknown": {
    "vi": "Chưa xoá gì cả — yêu cầu xoá không hợp lệ. Hãy dùng đúng nút xoá trong ứng dụng thay vì gọi trực tiếp.",
    "en": "Nothing was deleted — the reset request was invalid. Use the reset buttons in the app instead of calling this directly."
  },
  "error_resetting_data": {
    "vi": "Lỗi khi xoá dữ liệu: {detail}. Bản sao lưu (nếu đã tạo) vẫn nằm cạnh app.db.",
    "en": "Error resetting data: {detail}. The backup, if one was made, is still beside app.db."
  },
  "csv_empty": {
    "vi": "Tệp CSV rỗng hoặc không đọc được dòng nào.",
    "en": "The CSV file is empty, or no rows could be read."
  },
  "csv_missing_columns": {
    "vi": "CSV dạng \"dài\" cần có cột mã học sinh (student_id) và mã CLB (club_id) — cột hiện có trong tệp: {fieldnames}",
    "en": "\"Long\" format CSV needs a student ID column (student_id) and a club ID column (club_id) — columns found in the file: {fieldnames}"
  },
  "capacity_must_be_positive": {
    "vi": "Tổng chỗ phải lớn hơn 0",
    "en": "Total seats must be greater than 0"
  },
  "no_data_to_run": {
    "vi": "Chưa có dữ liệu để chạy thử. Cần ít nhất một câu lạc bộ và một học sinh.",
    "en": "No data to try yet. At least one club and one student are required."
  },
  "clb_thieu_buoi": {
    "vi": "Có {n} câu lạc bộ chưa khai buổi sinh hoạt trong khi các câu lạc bộ khác đã khai: {club_ids}. Những câu lạc bộ này sẽ bị xếp chung một buổi, nghĩa là học sinh chỉ vào được một trong số chúng. Hãy khai buổi cho tất cả, hoặc bỏ trống cột buổi ở tất cả.",
    "en": "{n} clubs have no session while others do: {club_ids}. Those clubs will all share one session, so a student can only join one of them. Either set a session for every club, or leave the session column empty for all of them."
  },
  "buoi_khong_ton_tai": {
    "vi": "Không có buổi sinh hoạt nào tên '{buoi}'. Các buổi đang có: {dang_co}.",
    "en": "There is no session called '{buoi}'. Available sessions: {dang_co}."
  },
  "chua_chon_buoi_nao": {
    "vi": "Chưa chọn buổi nào để xếp. Hãy chọn ít nhất một buổi, hoặc chọn tất cả.",
    "en": "No session selected. Pick at least one session, or select them all."
  },
  "khong_ve_lai_tham_khi_chay_mot_phan": {
    "vi": "Không vẽ lại số bốc thăm khi chỉ xếp một phần các buổi. Vẽ lại là đổi thứ tự ưu tiên của mọi buổi, kể cả những buổi đang giữ kết quả cũ — kết quả cũ đó sẽ không còn khớp với bộ số mới. Muốn vẽ lại thì chọn tất cả các buổi.",
    "en": "The lottery cannot be redrawn while only some sessions are being allocated. A redraw changes the priority order for every session, including the ones keeping their existing results — those results would no longer match the new numbers. Select every session to redraw."
  },
  "khong_chen_tham_khi_chay_mot_phan": {
    "vi": "Có {n} học sinh chưa có số bốc thăm. Cấp số cho các em đó sẽ đánh lại số của mọi học sinh, tức đổi thứ tự ưu tiên của mọi buổi — kể cả những buổi đang giữ kết quả cũ, và kết quả cũ đó sẽ không còn giải thích được bằng bộ số mới. Hãy chọn tất cả các buổi và chạy một lần cho cả tuần.",
    "en": "{n} student(s) have no lottery number yet. Giving them one renumbers every student, which changes the priority order for every session — including the ones keeping their existing results, and those results would no longer be explainable from the new numbers. Select every session and run the whole week once."
  },
  "khong_doi_hat_giong_khi_chay_mot_phan": {
    "vi": "Lần xếp trước dùng hạt giống bốc thăm {cu}, lần này lại là {moi}. Hạt giống chính là thứ sinh ra thứ tự ưu tiên của từng buổi, nên đổi nó là đổi thứ tự của mọi buổi — kể cả những buổi đang giữ kết quả cũ, và bảng số bốc thăm sẽ hiện một thứ tự chưa bao giờ được dùng để xếp ai vào đâu. Hãy đặt hạt giống về {cu}, hoặc chọn tất cả các buổi và chạy một lần cho cả tuần.",
    "en": "The previous allocation used lottery seed {cu}; this one uses {moi}. The seed is what produces each session's priority order, so changing it changes the order for every session — including the ones keeping their existing results, and the lottery table would then show an order that was never used to place anyone. Set the seed back to {cu}, or select every session and run the whole week once."
  },
  "hat_giong_da_khoa": {
    "vi": "Hạt giống bốc thăm đã khoá ở {cu} cùng bộ số bốc thăm, nhưng lần này lại là {moi}. Đổi hạt giống là đổi thứ tự ưu tiên của từng buổi, tức là đổi kết quả đã công bố — cùng tác dụng như vẽ lại số bốc thăm. Hãy đặt hạt giống về {cu}. Muốn dùng hạt giống mới thì bấm \"Vẽ lại số bốc thăm…\" rồi chạy lại.",
    "en": "The lottery seed is locked at {cu} together with the lottery numbers, but this run uses {moi}. Changing the seed changes each session's priority order, and so the published results — the same effect as redrawing the lottery. Set the seed back to {cu}. To use a new seed, click \"Redraw lottery numbers…\" and run again."
  },
  "nguyen_vong_lech_buoi": {
    "vi": "Dòng {line}: học sinh {student_id} xếp câu lạc bộ {club_id} vào cột của buổi {buoi_cot}, nhưng câu lạc bộ đó sinh hoạt buổi {buoi_that}. Nguyện vọng này bị bỏ qua.",
    "en": "Row {line}: student {student_id} ranked {club_id} under the {buoi_cot} column, but that club meets on {buoi_that}. This preference was skipped."
  },
  "reserve_capacity_negative": {
    "vi": "Suất dự trữ không được là số âm",
    "en": "Reserve capacity cannot be negative"
  },
  "reserve_capacity_exceeds_capacity": {
    "vi": "Suất dự trữ không được lớn hơn tổng chỗ",
    "en": "Reserve capacity cannot exceed total capacity"
  },
  "club_id_required": {
    "vi": "Cần nhập mã CLB",
    "en": "Club ID is required"
  },
  "cannot_delete_club_referenced": {
    "vi": "Không thể xoá: CLB {club_id} đã có {n_prefs} nguyện vọng và {n_matches} kết quả tham chiếu tới. Phải xử lý dữ liệu liên quan trước.",
    "en": "Cannot delete: {n_prefs} student preference(s) and {n_matches} match result(s) still point to club {club_id}. Handle that data first."
  },
  "student_not_found": {
    "vi": "Học sinh {student_id} không tồn tại",
    "en": "Student {student_id} does not exist"
  },
  "club_not_found": {
    "vi": "CLB {club_id} không tồn tại",
    "en": "Club {club_id} does not exist"
  },
  "unknown_clubs": {
    "vi": "CLB không tồn tại: {club_ids}",
    "en": "Unknown club(s): {club_ids}"
  },
  "scores_must_be_nonempty_list": {
    "vi": "Danh sách điểm không được để trống",
    "en": "The list of scores cannot be empty"
  },
  "student_ids_must_be_nonempty_list": {
    "vi": "Danh sách mã học sinh không được để trống",
    "en": "The list of student IDs cannot be empty"
  },
  "club_ids_must_be_list": {
    "vi": "Danh sách mã CLB không hợp lệ",
    "en": "The list of club IDs is invalid"
  },
  "ordered_club_ids_must_be_list": {
    "vi": "Danh sách xếp hạng CLB không hợp lệ",
    "en": "The ranked club list is invalid"
  },
  "must_rank_at_least_one": {
    "vi": "Phải xếp hạng ít nhất 1 nguyện vọng",
    "en": "You must rank at least 1 preference"
  },
  "max_pref_moi_buoi": {
    "vi": "Buổi {buoi} đã xếp đủ {tran} nguyện vọng. Mỗi buổi tối đa {tran} — bỏ bớt một câu lạc bộ của buổi đó nếu muốn thêm.",
    "en": "{buoi} already has {tran} preferences. The limit is {tran} per session — drop one of that session's clubs to add another."
  },
  "max_thi_moi_buoi": {
    "vi": "Buổi {buoi} đã chọn đủ {tran} câu lạc bộ để thi. Mỗi buổi tối đa {tran} — bỏ bớt một câu lạc bộ của buổi đó nếu muốn thêm.",
    "en": "{buoi} already has {tran} clubs to test for. The limit is {tran} per session — drop one of that session's clubs to add another."
  },
  "duplicate_preference_in_list": {
    "vi": "Danh sách nguyện vọng có CLB trùng lặp",
    "en": "The preference list has a duplicate club"
  },
  "cannot_delete_student_matched": {
    "vi": "Không thể xoá: học sinh {student_id} đã có trong kết quả của lần chạy sắp xếp gần nhất. Hãy chạy lại sắp xếp sau khi xử lý.",
    "en": "Cannot delete: student {student_id} is already in the results of the latest allocation run. Re-run the allocation after handling this."
  },
  "stb_redrawn_and_locked": {
    "vi": "Đã vẽ mới số bốc thăm (STB) cho {n} học sinh và khoá lại.",
    "en": "Drew new STB numbers for {n} student(s) and locked them."
  },
  "stb_supplemented": {
    "vi": "Số bốc thăm đã khoá — giữ nguyên thứ tự các em cũ, chèn ngẫu nhiên {n} học sinh mới vào dàn số.",
    "en": "Lottery already locked — kept the existing students' relative order, inserted {n} new student(s) at random positions."
  },
  "stb_reused": {
    "vi": "Số bốc thăm đã khoá — tái sử dụng toàn bộ số cũ, không vẽ lại.",
    "en": "STB already locked — reused all existing numbers, no redraw."
  },
  "rbda_done": {
    "vi": "Hoàn tất, không phát sinh lỗi ({rounds} vòng xử lý).",
    "en": "Completed with no errors ({rounds} processing round(s))."
  },
  "db_backed_up": {
    "vi": "Đã sao lưu app.db trước khi chạy: {backup_name}",
    "en": "Backed up app.db before running: {backup_name}"
  },
  "db_backup_failed": {
    "vi": "Không sao lưu được app.db (việc sắp xếp vẫn tiếp tục chạy): {detail}",
    "en": "Could not back up app.db (pipeline still continues): {detail}"
  },
  "pipeline_rolled_back": {
    "vi": "Đã huỷ toàn bộ thay đổi của lần chạy này (kể cả số bốc thăm vừa vẽ, nếu có) do lỗi giữa chừng — dữ liệu quay lại đúng trạng thái trước khi bấm chạy.",
    "en": "Undid every change from this run (including any freshly drawn STB numbers) because of a mid-run error — data is back to exactly the state before you clicked run."
  },
  "pref_student_not_in_students": {
    "vi": "Học sinh {student_id} có nguyện vọng nhưng không có trong danh sách học sinh",
    "en": "Student {student_id} has preferences but is not in the student list"
  },
  "pref_duplicate_club": {
    "vi": "Học sinh {student_id} có CLB trùng lặp trong danh sách nguyện vọng",
    "en": "Student {student_id} has a duplicate club in their preference list"
  },
  "pref_too_many": {
    "vi": "Học sinh {student_id} có {count} nguyện vọng — tối đa 10",
    "en": "Student {student_id} has {count} preferences — the limit is 10"
  },
  "pref_too_many_buoi": {
    "vi": "Học sinh {student_id}: buổi {buoi} có {count} nguyện vọng — mỗi buổi tối đa 10",
    "en": "Student {student_id}: {buoi} has {count} preferences — the limit is 10 per session"
  },
  "thi_too_many": {
    "vi": "Học sinh {student_id} đăng ký thi {count} CLB — tối đa 5",
    "en": "Student {student_id} signed up to test for {count} clubs — the limit is 5"
  },
  "thi_too_many_buoi": {
    "vi": "Học sinh {student_id}: buổi {buoi} đăng ký thi {count} CLB — mỗi buổi tối đa 5",
    "en": "Student {student_id}: {buoi} signs up to test for {count} clubs — the limit is 5 per session"
  },
  "pref_unknown_club": {
    "vi": "Học sinh {student_id} xếp hạng CLB không tồn tại: {club_id}",
    "en": "Student {student_id} ranked a club that does not exist: {club_id}"
  },
  "club_capacity_not_positive": {
    "vi": "CLB {club_id} có tổng chỗ bằng 0 hoặc âm — phải lớn hơn 0",
    "en": "Club {club_id} has a total seat count of 0 or less — it must be greater than 0"
  },
  "club_reserve_negative": {
    "vi": "CLB {club_id} có số suất dự trữ âm — phải từ 0 trở lên",
    "en": "Club {club_id} has a negative number of reserved seats — it must be 0 or more"
  },
  "club_reserve_exceeds_capacity": {
    "vi": "CLB {club_id} có suất dự trữ lớn hơn tổng chỗ",
    "en": "Club {club_id} has more reserved seats than total seats"
  },
  "applicants_unknown_club": {
    "vi": "Danh sách đăng ký thi tham chiếu tới CLB không tồn tại: {club_id}",
    "en": "The tryout registration list references a club that does not exist: {club_id}"
  },
  "applicants_unknown_student": {
    "vi": "Danh sách đăng ký thi tham chiếu tới học sinh không tồn tại: {student_id}",
    "en": "The tryout registration list references a student that does not exist: {student_id}"
  },
  "assignment_not_in_preferences": {
    "vi": "{student_id} được xếp vào {club_id} nhưng không có trong nguyện vọng",
    "en": "{student_id} was assigned to {club_id} but it is not in their preferences"
  },
  "club_over_capacity": {
    "vi": "CLB {club_id} có {count} học sinh nhưng chỉ {capacity} chỗ — vượt quá tổng chỗ",
    "en": "Club {club_id} has {count} student(s) holding seats but only {capacity} seat(s) total — over capacity"
  },
  "club_over_reserve_capacity": {
    "vi": "CLB {club_id} có {count} học sinh giữ suất dự trữ nhưng chỉ có {reserve_capacity} suất — vượt quá suất dự trữ",
    "en": "Club {club_id} has {count} student(s) holding a reserved seat but only {reserve_capacity} reserved seat(s) exist — over the reserve limit"
  },
  "blocking_pair": {
    "vi": "Có thể chưa công bằng: học sinh {student_id} thích CLB {club_id} hơn CLB hiện tại {current_club}, và đủ điều kiện được nhận vào {club_id} nếu xét lại từ đầu (CLB đó hiện có {n_holders}/{capacity} chỗ đã nhận).",
    "en": "Possible fairness gap: student {student_id} prefers club {club_id} over their current club {current_club}, and would qualify for a seat there if it were re-evaluated from scratch (that club currently holds {n_holders}/{capacity} seats)."
  },
  "csv_pref_duplicate_deduped": {
    "vi": "{student_id}: có CLB trùng lặp trong nguyện vọng, đã tự động loại bỏ trùng.",
    "en": "{student_id}: had a duplicate club in preferences; duplicates were removed automatically."
  },
  "csv_thi_bo_buoi_qua_tran": {
    "vi": "{student_id}: buổi {buoi} đăng ký thi {count} câu lạc bộ — mỗi buổi tối đa {tran}. CHƯA nhập buổi này (kể cả điểm của nó); các buổi khác của em vẫn nhập bình thường.",
    "en": "{student_id}: {buoi} signs up to test for {count} clubs — the limit is {tran} per session. That session was NOT imported, its scores included; the student's other sessions were."
  },
  "csv_pref_bo_buoi_qua_tran": {
    "vi": "{student_id}: buổi {buoi} có {count} nguyện vọng — mỗi buổi tối đa {tran}. CHƯA nhập buổi này; các buổi khác của em vẫn nhập bình thường. Sửa lại buổi đó rồi nạp lại nếu cần.",
    "en": "{student_id}: {buoi} has {count} preferences — the limit is {tran} per session. That session was NOT imported; the student's other sessions were. Fix that session and re-import if needed."
  },
  "csv_pref_too_many_skipped": {
    "vi": "{student_id}: có {count} nguyện vọng (tối đa {tran}) — CHƯA nhập, bỏ qua học sinh này.",
    "en": "{student_id}: has {count} preferences (the limit is {tran}) — NOT imported, this student was skipped."
  },
  "csv_thi_too_many_skipped": {
    "vi": "{student_id}: đăng ký thi {count} câu lạc bộ (tối đa {tran}) — CHƯA nhập, bỏ qua học sinh này.",
    "en": "{student_id}: signed up to test for {count} clubs (the limit is {tran}) — NOT imported, this student was skipped."
  },
  "csv_unknown_clubs_skipped": {
    "vi": "{student_id}: CLB không tồn tại {club_ids} — bỏ qua học sinh này.",
    "en": "{student_id}: unknown club(s) {club_ids} — this student was skipped."
  },
  "csv_student_missing_skipped": {
    "vi": "{student_id}: chưa có trong hệ thống, bị bỏ qua vì chưa bật tuỳ chọn tự tạo học sinh mới.",
    "en": "{student_id}: not yet in the system, skipped because auto-creating new students is turned off."
  },
  "score_not_applicant": {
    "vi": "{student_id}: không nằm trong danh sách thi/xét CLB này",
    "en": "{student_id}: is not registered to test/apply for this club"
  },
  "score_not_a_number": {
    "vi": "{student_id}: điểm '{score}' không phải số — ô điểm đó KHÔNG được lưu.",
    "en": "{student_id}: score '{score}' is not a number — that score was NOT saved."
  },
  "score_negative": {
    "vi": "{student_id}: điểm '{score}' là số ÂM — gần như chắc chắn thừa dấu trừ. Ô điểm đó KHÔNG được lưu.",
    "en": "{student_id}: score '{score}' is NEGATIVE — almost certainly a stray minus sign. That score was NOT saved."
  },
  "health_scoring_none": {
    "vi": "CLB {club_id}: có {n_applicants} học sinh đăng ký thi nhưng CHƯA CHẤM ĐIỂM AI. Toàn bộ các em này sẽ rơi xuống nhóm xét sau (chỉ dựa vào số bốc thăm, không có điểm) — vòng thi coi như không có tác dụng.",
    "en": "Club {club_id}: {n_applicants} student(s) registered for the tryout but NOBODY has been scored. All of them drop to the lottery-only group (no score to rank by) — the tryout will have no effect."
  },
  "health_scoring_partial": {
    "vi": "CLB {club_id}: mới chấm {n_scored}/{n_applicants} học sinh. {n_missing} em chưa có điểm sẽ bị xếp dưới TẤT CẢ các em đã có điểm, kể cả em điểm thấp nhất.",
    "en": "Club {club_id}: only {n_scored} of {n_applicants} scored. The {n_missing} unscored student(s) will rank below EVERY scored student, including the lowest-scoring one."
  },
  "health_tested_not_ranked": {
    "vi": "{n} lượt đăng ký thi sẽ bị bỏ phí: học sinh đã đăng ký thi một CLB nhưng không xếp CLB đó vào nguyện vọng, nên dù điểm cao vẫn không thể được xếp vào đó. Ví dụ: {sample}",
    "en": "{n} tryout registration(s) will be wasted: the student registered to test for a club but did not rank it, so no matter how well they score they cannot be placed there. For example: {sample}"
  },
  "health_thi_qua_tran_buoi": {
    "vi": "{n} học sinh đăng ký thi quá {tran} câu lạc bộ trong buổi {buoi} — thường do một câu lạc bộ vừa được chuyển sang buổi này ở màn Quản lý CLB & dự trữ. Thi thêm câu lạc bộ là được xét ưu tiên ở thêm chỗ, không công bằng với các em khác. Sửa ở màn Nhập tại chỗ: mở em đó, bỏ bớt ô thi của buổi này rồi lưu. Ví dụ (số câu lạc bộ đang thi): {sample}",
    "en": "{n} student(s) are signed up to test for more than {tran} clubs on {buoi} — usually because a club was just moved to this session in Clubs & reserves. Testing for extra clubs gives them priority in more places, which is unfair to others. Fix it in the Kiosk entry tab: open the student, untick some of this session's tests and save. For example (clubs being tested for): {sample}"
  },
  "health_thi_qua_tran": {
    "vi": "{n} học sinh đăng ký thi quá {tran} câu lạc bộ — thường do danh sách câu lạc bộ vừa được sửa ở màn Quản lý CLB & dự trữ. Thi thêm câu lạc bộ là được xét ưu tiên ở thêm chỗ, không công bằng với các em khác. Sửa ở màn Nhập tại chỗ: mở em đó, bỏ bớt ô thi của buổi này rồi lưu. Ví dụ (số câu lạc bộ đang thi): {sample}",
    "en": "{n} student(s) are signed up to test for more than {tran} clubs — usually because the club list was just edited in Clubs & reserves. Testing for extra clubs gives them priority in more places, which is unfair to others. Fix it in the Kiosk entry tab: open the student, untick some of this session's tests and save. For example (clubs being tested for): {sample}"
  },
  "health_vi_pham_clb_suc_chua_sai": {
    "vi": "{n} câu lạc bộ có sức chứa không hợp lệ (sức chứa phải lớn hơn 0, suất dự trữ từ 0 tới sức chứa). Sửa ở màn Quản lý CLB & dự trữ. Ví dụ: {sample}. Phần mềm chưa bật được lớp chặn dữ liệu hỏng cho tệp dữ liệu này; sửa xong thì đóng và mở lại phần mềm để bật.",
    "en": "{n} club(s) have invalid capacity (capacity must be above 0, reserve seats between 0 and capacity). Fix them in Clubs & reserves. For example: {sample}. The software cannot switch on its bad-data protection for this database until this is fixed; after fixing, close and reopen the software to switch it on."
  },
  "health_vi_pham_nguyen_vong_hang_sai": {
    "vi": "{n} nguyện vọng có thứ hạng nhỏ hơn 1. Nhập lại nguyện vọng của các em này. Ví dụ: {sample}. Phần mềm chưa bật được lớp chặn dữ liệu hỏng cho tệp dữ liệu này; sửa xong thì đóng và mở lại phần mềm để bật.",
    "en": "{n} preference(s) have a rank below 1. Re-enter these students' preferences. For example: {sample}. The software cannot switch on its bad-data protection for this database until this is fixed; after fixing, close and reopen the software to switch it on."
  },
  "health_vi_pham_diem_am": {
    "vi": "{n} điểm chấm là số âm. Sửa ở màn Nhập điểm. Ví dụ: {sample}. Phần mềm chưa bật được lớp chặn dữ liệu hỏng cho tệp dữ liệu này; sửa xong thì đóng và mở lại phần mềm để bật.",
    "en": "{n} score(s) are negative. Fix them in the Score entry tab. For example: {sample}. The software cannot switch on its bad-data protection for this database until this is fixed; after fixing, close and reopen the software to switch it on."
  },
  "health_vi_pham_mo_coi_hoc_sinh": {
    "vi": "Bảng {bang} có dữ liệu của {n} mã học sinh không còn tồn tại. Tạo lại học sinh có mã đó, hoặc bấm \"Xoá toàn bộ học sinh (giữ CLB)\" ở màn Quản lý CLB & dự trữ. Ví dụ: {sample}. Phần mềm chưa bật được lớp chặn dữ liệu hỏng cho tệp dữ liệu này; sửa xong thì đóng và mở lại phần mềm để bật.",
    "en": "Table {bang} holds data for {n} student ID(s) that no longer exist. Recreate a student with that ID, or click \"Delete all students (keep clubs)\" in Clubs & reserves. For example: {sample}. The software cannot switch on its bad-data protection for this database until this is fixed; after fixing, close and reopen the software to switch it on."
  },
  "health_vi_pham_mo_coi_clb": {
    "vi": "Bảng {bang} có dữ liệu của {n} mã câu lạc bộ không còn tồn tại. Tạo lại câu lạc bộ có mã đó ở màn Quản lý CLB & dự trữ. Ví dụ: {sample}. Phần mềm chưa bật được lớp chặn dữ liệu hỏng cho tệp dữ liệu này; sửa xong thì đóng và mở lại phần mềm để bật.",
    "en": "Table {bang} holds data for {n} club ID(s) that no longer exist. Recreate a club with that ID in Clubs & reserves. For example: {sample}. The software cannot switch on its bad-data protection for this database until this is fixed; after fixing, close and reopen the software to switch it on."
  },
  "health_student_no_preferences": {
    "vi": "{n} học sinh chưa xếp nguyện vọng nào — các em này chắc chắn không được xếp vào CLB nào. Ví dụ: {sample}",
    "en": "{n} student(s) have not ranked any preference — they cannot be placed in any club. For example: {sample}"
  },
  "health_orphan_student_group": {
    "vi": "Nhãn dự trữ \"{reserve_group}\" đang gán cho {n} học sinh nhưng KHÔNG CLB nào dùng nhãn này (ví dụ: {sample}) — các em đó sẽ không được ưu tiên ở đâu cả, có thể do gõ sai chính tả. Sửa ở thẻ Quản lý: tìm mã em, đánh dấu, để trống ô nhãn rồi bấm \"Gán cho học sinh đã đánh dấu\".",
    "en": "Reserve label \"{reserve_group}\" is assigned to {n} student(s) but NO club uses it (for example: {sample}) — those students get no priority anywhere, possibly a typo. Fix it in the Admin tab: search the student id, tick it, leave the label box empty, and click \"Assign to ticked students\"."
  },
  "health_club_reserve_no_group": {
    "vi": "CLB {club_id} có {reserve_capacity} suất dự trữ nhưng chưa đặt nhãn dự trữ. Các suất này sẽ âm thầm chuyển thành suất phổ thông.",
    "en": "Club {club_id} has {reserve_capacity} reserve seat(s) but no reserve label set. Those seats will silently become general seats."
  },
  "health_club_group_no_students": {
    "vi": "CLB {club_id} dành {reserve_capacity} suất cho nhãn \"{reserve_group}\", nhưng chưa học sinh nào mang nhãn đó. Suất dự trữ sẽ không dùng đến.",
    "en": "Club {club_id} reserves {reserve_capacity} seat(s) for label \"{reserve_group}\", but no student carries that label. The reserve seats will go unused."
  },
  "health_score_outlier": {
    "vi": "CLB {club_id}: có {n} điểm lệch hẳn khỏi các điểm còn lại (trung vị của CLB này là {trung_vi}). Ví dụ: {sample}. Gõ 70 thay vì 7.0 là chuyện thường gặp, và điểm sai đẩy em đó lên đầu bảng — kéo theo cả những em khác tụt xuống. Kiểm tra lại ở thẻ Chấm điểm.",
    "en": "Club {club_id}: {n} score(s) sit far outside the rest (this club's median is {trung_vi}). For example: {sample}. Typing 70 instead of 7.0 is a common slip, and a wrong score pushes that student to the top of the ranking — displacing others in turn. Check them on the Scoring tab."
  },
  "health_oversubscribed": {
    "vi": "Tổng chỗ toàn hệ thống là {n_seats}, trong khi có {n_students} học sinh đã nộp nguyện vọng. Ít nhất {n_short} em chắc chắn không có chỗ.",
    "en": "Total seats across all clubs is {n_seats}, but {n_students} student(s) have submitted preferences. At least {n_short} student(s) cannot be placed."
  },
  "recovery_db_is_healthy": {
    "vi": "Tệp dữ liệu hiện tại vẫn đọc được bình thường, nên phần mềm không đổi tên hay thay thế nó. Lỗi lúc khởi động có lẽ không phải do dữ liệu hỏng — thường là thư mục không có quyền ghi, hoặc tệp đang được mở ở chương trình khác. Đóng các chương trình khác, chuyển thư mục phần mềm ra chỗ có quyền ghi (ví dụ Desktop), rồi mở lại.",
    "en": "The current data file still reads normally, so it was not renamed or replaced. The startup error is probably not corrupt data — usually the folder is not writable, or the file is open in another program. Close other programs, move the app folder somewhere writable (for example the Desktop), and open it again."
  },
  "recovery_no_backups": {
    "vi": "Không tìm thấy bản sao lưu nào — có thể chưa từng chạy sắp xếp lần nào trên máy này, hoặc thư mục sao lưu đã bị xoá.",
    "en": "No backups found — the allocation may never have run on this machine, or the backup folder was deleted."
  },
  "recovery_all_backups_corrupt": {
    "vi": "Đã thử cả {n_tried} bản sao lưu tìm thấy nhưng không bản nào đọc được nguyên vẹn.",
    "en": "Tried all {n_tried} backup(s) found, but none of them could be read intact."
  },
  "recovery_restore_failed": {
    "vi": "Khôi phục thất bại: {detail}",
    "en": "Restore failed: {detail}"
  },
  "recovery_restored_from": {
    "vi": "Đã khôi phục từ bản sao lưu {backup_name} (bỏ qua {n_skipped} bản mới hơn vì đọc không được).",
    "en": "Restored from backup {backup_name} (skipped {n_skipped} newer backup(s) that could not be read)."
  },
  "recovery_fresh_created": {
    "vi": "Đã tạo app.db mới hoàn toàn trống. Tệp cũ được đổi tên (không xoá), nằm cùng thư mục.",
    "en": "Created a brand-new, empty app.db. The old file was renamed (not deleted) and is in the same folder."
  }
};
