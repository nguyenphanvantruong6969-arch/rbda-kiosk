# Kiosk UI — Phân bổ Câu lạc bộ (RB-DA)

## Cách chạy

```bash
pip install -r requirements.txt
python3 main.py            # dùng app.db mặc định cùng thư mục
python3 main.py /path/to/app.db   # hoặc chỉ định DB khác
```

`rbda_priority_pipeline.py` đã được đặt cùng thư mục với `api.py` —
không cần chỉnh `sys.path.insert` hay copy thêm gì.

## Cấu trúc

```
rbda-kiosk/
  main.py      -> điểm khởi động, tạo cửa sổ pywebview (KHÔNG BAO GIỜ
                  chết ngầm nếu app.db hỏng — mở recovery.html thay vào)
  api.py       -> lớp PipelineAPI, cầu nối JS <-> rbda_priority_pipeline.py
  rbda_priority_pipeline.py -> thuật toán RB-DA + I/O SQLite (DEFAULT_SCHEMA
                  + connect_db(), pragma bền vững dùng chung mọi kết nối)
  recovery.py  -> lớp RecoveryAPI, chỉ dùng khi app.db hỏng/mất (xem mục
                  "Bền vững dữ liệu & phục hồi sự cố" bên dưới)
  browser_host.py -> chế độ chạy DỰ PHÒNG bằng trình duyệt, tự bật khi
                  pywebview không khởi động được (xem mục cùng tên bên dưới)
  i18n_errors.py -> catalog lỗi song ngữ (vi/en) dùng ở Python (xem "Song ngữ" bên dưới)
  index.html   -> 5 tab: Vận hành pipeline / Kết quả / Nhập dự phòng /
                  Quản lý club & dự trữ / Chấm điểm (mù)
  recovery.html -> màn hình phục hồi độc lập, chỉ mở khi app.db hỏng/mất
  style.css    -> giao diện (token: giấy lạnh + ink + vàng đồng)
  i18n.js      -> catalog văn bản song ngữ (vi/en) + hàm dịch dùng ở JS
  app.js       -> logic frontend, gọi window.pywebview.api.*
  recovery.js  -> logic frontend cho recovery.html, gọi RecoveryAPI
  tests/       -> bộ test tự động (pytest)
```

## Song ngữ (vi/en)

Toàn bộ giao diện — nhãn tĩnh, toast, thông báo lỗi từ backend — hỗ trợ
2 ngôn ngữ, đổi bằng nút góc trên sidebar (lưu lựa chọn vào
`localStorage`, mặc định tiếng Việt).

Kiến trúc: `api.py` KHÔNG trả về chuỗi tiếng Việt đã format sẵn cho lỗi
nữa — mọi `_fail(...)` trả về `{"code": "...", "params": {...}}` (xem
`i18n_errors.py`). Phía JS (`i18n.js`) có một bản sao **y hệt**
(`ERROR_MESSAGES`) để dịch các code đó sang ngôn ngữ đang chọn mà không
cần gọi lại Python. Văn bản tĩnh trong `index.html` dùng thuộc tính
`data-i18n`/`data-i18n-placeholder`/`data-i18n-html`, áp dụng bằng
`I18N.applyStaticText()`.

Tên club/học sinh (dữ liệu do trường nhập) KHÔNG bị dịch — chỉ chữ
"khung" của app (nhãn nút, tiêu đề, thông báo lỗi/trạng thái) mới song
ngữ.

3 test trong `tests/test_i18n_sync.py` khoá 2 catalog (Python + JS)
luôn khớp nhau tuyệt đối — sửa 1 bên mà quên bên kia sẽ FAIL test ngay,
không đợi phát hiện bằng mắt.

**Lưu ý an toàn đã xử lý:** đổi ngôn ngữ giữa lúc một nút xác nhận
2 bước (`armTwoStepConfirm` — vd "Xoá học sinh") đang ở trạng thái
"đã bấm lần 1" sẽ KHÔNG bị ghi đè nhãn về trạng thái ban đầu (nếu ghi
đè, trạng thái nội bộ "đã bấm lần 1" vẫn còn mà nhãn lại hiện như chưa
bấm — bấm tiếp sẽ xoá NGAY không cảnh báo). Tương tự, thanh xác nhận
"Chạy lại sẽ ghi đè kết quả" (`runConfirmBar`) sẽ tự đóng khi đổi ngôn
ngữ thay vì hiển thị sai ngôn ngữ — người dùng bấm "Chạy pipeline" lại
để có thanh xác nhận mới đúng ngôn ngữ hiện tại.

## Cảnh báo sức khoẻ dữ liệu (pre-flight)

`validate_data_integrity()` chỉ bắt dữ liệu **không hợp lệ**. Nhưng có cả
một nhóm tình huống mà dữ liệu **vẫn hợp lệ**, pipeline **vẫn chạy**, kết
quả **vẫn trông bình thường** — trong khi ai được vào club đã bị đổi bởi
một thiếu sót người vận hành không nhìn thấy. Đã kiểm chứng bằng thực
nghiệm: cả 6 tình huống dưới đây trước đây đều **im lặng hoàn toàn**.

Ví dụ nguy hiểm nhất: giáo viên mới chấm 1/3 danh sách → em được 4.0 điểm
chiếm chắc một suất, còn 2 em chưa chấm bị đẩy xuống Tầng 2 và chỉ được
xét bằng số bốc thăm. Kết quả trông hoàn toàn bình thường.

`get_data_health_report()` rà soát và hiện các cảnh báo này **ngay phía
trên nút "Chạy pipeline"**, phân theo 3 mức (Nghiêm trọng / Cần lưu ý /
Thông tin), sắp xếp nghiêm trọng lên trước:

| # | Tình huống | Hậu quả âm thầm | Mức |
|---|---|---|---|
| 1 | Club có người đăng ký thi nhưng **chưa chấm ai** | Cả club rơi xuống Tầng 2, vòng thi vô nghĩa | Nghiêm trọng |
| 2 | **Chấm dở dang** (mới chấm một phần) | Em chưa chấm bị xếp dưới cả em thấp điểm nhất | Nghiêm trọng |
| 3 | **Thi nhưng không xếp nguyện vọng** club đó | Điểm bị bỏ phí, không bao giờ được xếp vào đó | Nghiêm trọng |
| 4 | Nhãn dự trữ của học sinh **không club nào dùng** (gõ sai) | Học sinh mất quyền ưu tiên ở mọi nơi | Nghiêm trọng |
| 5 | Club có suất dự trữ nhưng **chưa đặt nhãn** | Suất dự trữ âm thầm thành suất phổ thông | Nghiêm trọng |
| 6 | Học sinh **chưa xếp nguyện vọng nào** | Chắc chắn không được xếp vào đâu | Cần lưu ý |
| 7 | Club dành suất cho nhãn **chưa ai mang** | Suất dự trữ không dùng đến | Cần lưu ý |
| 8 | **Tổng chỗ ít hơn số học sinh** | Ít nhất N em chắc chắn không có chỗ | Thông tin |
| 9 | Học sinh **thi quá 5 CLB trong một buổi** (thường do CLB vừa đổi buổi ở màn Quản lý) | Em đó được xét Tầng 1 ở nhiều chỗ hơn em khác | Nghiêm trọng |

Đây là **cảnh báo, không phải lỗi** — không chặn chạy pipeline, chỉ bắt
buộc hiện ra để người vận hành tự quyết định.

## Bền vững dữ liệu & phục hồi sự cố

Xuất phát từ một buổi rà soát thực nghiệm riêng (mô phỏng mất điện giữa
chừng, tệp DB bị cắt cụt/hỏng, ghi đè khi có 2 tiến trình cùng mở app.db)
— đã tìm thấy 4 lỗ hổng thật, cả 4 đều đã vá:

1. **`run_pipeline()` giờ là MỘT giao dịch (transaction) duy nhất.** Vẽ
   STB + khoá STB + ghi `match_results` + ghi `run_meta`/`run_history`
   đều nằm trong cùng 1 connection, chỉ `commit()` MỘT LẦN ở cuối. Nếu
   bất kỳ bước nào ở giữa lỗi — kể cả bị ngắt bằng Ctrl+C/`KeyboardInterrupt`
   — TOÀN BỘ giao dịch rollback, **kể cả số STB vừa vẽ** ("full
   rollback", phương án đã chốt: một crash giữa chừng không bao giờ để
   lại trạng thái "STB đã khoá nhưng không có kết quả nào đi kèm"). Xuất
   CSV chuyển sang xảy ra SAU KHI đã commit thành công — lỗi ghi file
   CSV (hết dung lượng, mất quyền...) không còn có thể kéo DB vào trạng
   thái dở dang.
2. **Tự động sao lưu trước MỖI lần chạy pipeline.** Dùng SQLite Backup
   API (`connection.backup()`, không phải copy file thô — an toàn kể cả
   khi có tiến trình khác đang mở app.db, khác với copy tay có thể chụp
   phải trạng thái nửa-ghi), lưu vào `app.db.bak-<timestamp>` cùng thư
   mục, tự động chỉ giữ lại 10 bản gần nhất.
3. **Không bao giờ chết ngầm nếu app.db hỏng/mất.** Trước đây
   `PipelineAPI(db_path)` (gọi `init_db` bên trong) lỗi thì tiến trình
   thoát với exit code 1 và KHÔNG cửa sổ nào hiện ra — đặc biệt nghiêm
   trọng trên bản build Windows `console=False` (không có terminal nào
   để người vận hành thấy lỗi). Giờ `main.py` bọc bước này trong
   try/except: nếu lỗi, mở `recovery.html` (màn hình riêng, qua
   `RecoveryAPI`) thay vì màn hình chính — hiện lỗi kỹ thuật + danh sách
   bản sao lưu tìm thấy, cho chọn:
   - **Khôi phục từ bản sao lưu gần nhất còn đọc được** — kiểm tra bằng
     `PRAGMA quick_check`; nếu bản mới nhất CŨNG hỏng, tự động lùi sang
     bản kế trước cho tới khi tìm được bản đọc được hoặc hết bản để thử
     (không dừng lại ở bản đầu tiên gặp lỗi).
   - **Bắt đầu với cơ sở dữ liệu mới** — tệp hỏng được ĐỔI TÊN thành
     `app.db.corrupt-<timestamp>` (không xoá, vẫn có thể gửi đi kiểm tra
     sau), rồi tạo `app.db` mới hoàn toàn trống.
   Cả hai thao tác xong đều yêu cầu đóng và mở lại ứng dụng.
4. **Pragma bền vững trên mọi kết nối** (qua `connect_db()` dùng chung
   trong `rbda_priority_pipeline.py`, thay cho gọi `sqlite3.connect()`
   rải rác khắp nơi): `busy_timeout=15000` (15 giây thay vì mặc định 5
   giây — 2 tiến trình cùng mở app.db sẽ CHỜ thay vì báo lỗi "database is
   locked" ngay lập tức) và `synchronous=FULL` (đảm bảo dữ liệu đã thật
   sự nằm trên đĩa sau khi `commit()` trả về, không chỉ trong bộ nhớ
   đệm của hệ điều hành). **Cố tình KHÔNG bật `journal_mode=WAL`** — đã
   thử nghiệm trực tiếp: WAL tạo tệp phụ `app.db-wal` chứa dữ liệu đã
   commit; quy trình sao lưu bằng USB (copy tay file `app.db`) mà không
   biết tới tệp `-wal` sẽ tạo ra bản sao lưu THIẾU dữ liệu mới nhất mà
   không hề báo lỗi — giữ `journal_mode` mặc định (`DELETE`) để file
   `.db` vẫn là bản sao DUY NHẤT cần copy.

## Ràng buộc ở tầng CSDL

Năm bảng (`clubs`, `club_test_selection`, `club_scores`, `preferences`,
`match_results`) có FOREIGN KEY và CHECK, định nghĩa MỘT lần ở
`_BANG_RANG_BUOC` (`rbda_priority_pipeline.py`); `connect_db` bật
`PRAGMA foreign_keys = ON`. Luật khớp đúng luật phần mềm đã có: sức chứa > 0,
0 ≤ dự trữ ≤ sức chứa, thứ hạng ≥ 1, điểm ≥ 0, mã học sinh / CLB ở bảng con
phải tồn tại. Không dùng `ON DELETE CASCADE` — xoá vẫn do mã Python làm tường
minh (con trước, cha sau) và chặn khi có kết quả tham chiếu.

CSDL cũ được `di_tru_schema` nâng lên **chỉ khi dữ liệu sạch**: sao lưu trước
(`app.db.bak-…`), dựng lại năm bảng trong một giao dịch, kiểm
`PRAGMA foreign_key_check`, lỗi thì rollback và chạy tiếp như cũ. CSDL có dòng
vi phạm thì **không bị đụng vào**; bảng sức khoẻ dữ liệu chỉ ra từng loại
(`health_vi_pham_*`), sửa xong mở lại phần mềm là được nâng lên.

Test: `tests/test_rang_buoc_csdl.py`.

## Khoá bốc thăm và hạt giống

Lần chạy đầu vẽ bộ số bốc thăm rồi **khoá** nó cùng **hạt giống** đã dùng
(`stb_lock.seed`). Ở trường nhiều buổi, thứ tự ưu tiên của từng buổi dẫn xuất
từ bộ số + hạt giống, nên khoá bộ số mà để hở hạt giống thì vẫn đổi được kết
quả đã công bố (đo trên `bo_nhieu_buoi`: đổi 42 → 43 làm 22/800 ô đổi chủ).

- Đã khoá mà chạy với hạt giống khác → lỗi `hat_giong_da_khoa`, không ghi gì.
- Đổi hạt giống chỉ qua đường **vẽ lại** (`force_redraw_stb`, xác nhận hai bước).
- Giao diện: ô hạt giống chỉ đọc khi đã khoá; bấm "Vẽ lại số bốc thăm…" thì mở.
- CSDL cũ: `di_tru_schema` lấy hạt giống từ `run_meta` của lần chạy gần nhất.
- `reset_data` mở khoá cả hai.

Test: `tests/test_khoa_hat_giong.py`, `tests/test_giao_dien_khoa_hat_giong.py`.

## Chế độ dự phòng: cửa sổ ứng dụng riêng dựng bằng trình duyệt

Trên Windows, pywebview **bắt buộc** đi qua `pythonnet` → .NET Framework —
đây là mắt xích hay hỏng nhất khi đóng gói bằng PyInstaller. Đã gặp lỗi
thật trên máy người dùng khi chạy bản `.exe`:

```
RuntimeError: Failed to resolve Python.Runtime.Loader.Initialize
from ...\_internal\pythonnet\runtime\Python.Runtime.dll
```

Chữ "from" cho thấy tệp DLL **có mặt** — .NET tìm thấy nhưng từ chối nạp.

**Nguyên nhân đã tìm ra (31/08):** Windows gắn dấu "tải từ Internet" (luồng NTFS
`Zone.Identifier`) vào mọi tệp giải nén từ `.zip` tải về, và .NET Framework từ chối
nạp assembly mang dấu đó. `chan_doan.go_dau_tai_ve()` gỡ dấu lúc khởi động, **trước**
khi nạp `webview` — đo trên máy thật: 173 tệp mang dấu, gỡ xong pywebview mở được
ngay. Xem `BAN_GIAO.md` mục 5.

**Chế độ dự phòng dưới đây vì vậy KHÔNG còn là đường đang chạy** — nó là lưới an
toàn cho máy thiếu WebView2 Runtime, và cho trường hợp lớp gỡ dấu không ăn. Góc dưới
thanh bên của app nói rõ đang chạy đường nào.

Giờ `main.py` thử theo thứ tự:

1. **Cửa sổ pywebview** — ưu tiên, đúng trải nghiệm kiosk (cửa sổ riêng).
2. **Nếu pywebview hỏng vì bất kỳ lý do gì** → tự động chuyển sang
   `browser_host.py`: dựng một máy chủ HTTP cục bộ rồi mở **một CỬA SỔ
   ỨNG DỤNG RIÊNG**. Chế độ này **không dùng pythonnet/.NET/thư viện GUI
   nào cả** — chỉ thư viện chuẩn của Python + trình duyệt vốn có sẵn trên
   mọi máy Windows — nên gần như không thể hỏng vì lý do đóng gói.

### Vì sao vẫn là "ứng dụng riêng", không phải tab trình duyệt

Mọi trình duyệt nhân Chromium (Edge, Chrome, Brave, Chromium) đều hiểu cờ
`--app=<url>`: mở **một cửa sổ riêng, không thanh địa chỉ, không thanh
tab, không nút Back/Refresh**, có mục riêng trên thanh tác vụ. Nhìn và
dùng y như một ứng dụng desktop.

Điều này quan trọng với máy kiosk đặt ở trường: có thanh địa chỉ nghĩa là
học sinh gõ được sang trang khác, đóng nhầm tab của app, hoặc nhìn thấy cả
token trong URL.

`browser_host.find_app_window_browser()` tìm theo thứ tự: biến môi trường
`RBDA_BROWSER` (nếu người vận hành muốn chỉ định thẳng) → đường dẫn cài
đặt tiêu chuẩn của **Edge** rồi Chrome/Brave trên Windows → cuối cùng mới
tra `PATH`. **Windows 10/11 luôn có sẵn Edge**, nên trên máy trường gần
như chắc chắn tìm được.

Cửa sổ chạy bằng **hồ sơ trình duyệt riêng** (`--user-data-dir` trong thư
mục tạm): không dính extension, lịch sử, hay hộp thoại "khôi phục tab" của
người dùng. Mất hồ sơ đó cũng không sao — dữ liệu thật nằm hết trong
`app.db`.

Firefox không có cờ tương đương (`-kiosk` chiếm trọn màn hình, không có
nút đóng — quá tay cho phòng máy dùng chung), nên chỉ tìm nhóm Chromium.
Máy nào không có trình duyệt Chromium nào thì mới đành mở tab thường —
vẫn dùng được đủ tính năng, chỉ kém gọn.

**Toàn bộ tính năng giữ nguyên**, và `app.js`/`recovery.js` **không phải
sửa một dòng nào**: giao diện vẫn gọi backend qua đúng
`window.pywebview.api.<tên_hàm>(...)` như cũ, còn `browser_host` chèn sẵn
một đoạn JS dựng `window.pywebview.api` giả lập (bằng Proxy) vào mỗi trang
HTML nó phục vụ — mỗi lời gọi biến thành một POST tới `/__api__/<tên_hàm>`.

An toàn (đây là máy chứa dữ liệu học sinh):

- Chỉ lắng nghe trên `127.0.0.1` — không ra ngoài mạng LAN.
- Mọi lời gọi API phải kèm **token ngẫu nhiên** sinh lúc khởi động, để một
  trang web bất kỳ đang mở trong cùng trình duyệt không thể tự gọi vào.
- **Không cho gọi phương thức nội bộ** (tên bắt đầu bằng `_`, ví dụ
  `_backup_db`) qua HTTP.
- Endpoint tắt máy chủ (`/__closed__`) cũng **bắt buộc có token**, để một
  trang web khác dò trúng cổng không tắt được app đang chạy dở.

Tắt đúng lúc — không tắt nhầm khi thu nhỏ:

- Đóng cửa sổ → trang gửi `navigator.sendBeacon("/__closed__")` trong sự
  kiện `pagehide`, máy chủ **tắt ngay** (đo thực tế: ~3 giây).
- Ngoài ra trang vẫn gửi tín hiệu "còn mở" mỗi 3 giây; quá **120 giây**
  không thấy tín hiệu thì tiến trình tự tắt — lưới an toàn cho trường hợp
  trình duyệt bị kill cứng, không kịp gửi beacon.
- **Vì sao 120 giây chứ không phải 25:** trình duyệt bóp thắt (throttle)
  `setInterval` của trang đang bị ẩn, cửa sổ thu nhỏ lâu thì tín hiệu tụt
  xuống khoảng 1 lần/phút. Với ngưỡng 25 giây cũ, người vận hành chỉ cần
  thu nhỏ cửa sổ đi làm việc khác là **app tự tắt giữa chừng** — một ứng
  dụng thật không hành xử như vậy.

## Nhập dữ liệu bằng CSV

Thư mục **`mau_csv/`** chứa 8 file mẫu chạy được ngay và
**`mau_csv/HUONG_DAN_CSV.md`** mô tả đầy đủ định dạng. Năm file đầu dành cho
trường sinh hoạt **một buổi**; ba file `06_`–`08_` dành cho trường xếp **cả
tuần** (mục 3.7 của hướng dẫn), và bộ câu hỏi Microsoft Forms tương ứng ở
**`BO_CAU_HOI_FORMS.md`**.

| File mẫu | Loại | Dạng |
|---|---|---|
| `01_chon_club_thi_dang_rong.csv` | Chọn club muốn thi (Bước 1) | rộng — 1 dòng/học sinh |
| `02_chon_club_thi_dang_dai.csv` | Chọn club muốn thi (Bước 1) | dài — 1 dòng/lựa chọn |
| `03_nguyen_vong_dang_rong.csv` | Xếp hạng nguyện vọng (Bước 2) | rộng |
| `04_nguyen_vong_dang_dai.csv` | Xếp hạng nguyện vọng (Bước 2) | dài |
| `05_danh_sach_club.csv` | Danh sách CLB | — |

### Đọc thẳng file Excel

Microsoft Forms xuất kết quả ra `.xlsx`. Trước đây người vận hành phải mở
Excel → *Save As* → chọn đúng *CSV UTF-8* rồi mới nạp được — và chính bước
thừa đó là bước dễ sai nhất: chọn nhầm *CSV (Comma delimited)* thì tên tiếng
Việt hỏng hết dấu, còn chọn đúng thì Excel chèn BOM (bản cũ báo thiếu cột
`student_id` vì thế). Bỏ hẳn bước chuyển đổi là bỏ được cả lớp lỗi đó.

`xlsx_to_csv_text()` đọc file bằng `openpyxl` rồi trả về text CSV, nên phần
còn lại của luồng (`detect_csv_kind`, `import_csv_auto`) không cần biết dữ
liệu đến từ `.csv` hay `.xlsx`. Trộn hai định dạng trong cùng một lần thả
cũng chạy.

Ba chỗ `.xlsx` khác CSV, đều đã xử lý và có test: Excel lưu chỉ tiêu `20`
dưới dạng số thực nên đọc thô ra `"20.0"` và `int("20.0")` ném lỗi làm **cả
dòng CLB bị bỏ qua**; ô trống là `None` chứ không phải `""`; và sổ tính
thường có nhiều sheet — phần mềm lấy **sheet đầu tiên**, không phải sheet
đang active (sheet active chỉ là sheet người dùng xem cuối cùng trước khi
lưu).

`openpyxl` là Python thuần, không cần .NET hay thư viện hệ thống — khác hẳn
`pythonnet`, nên không kéo theo rủi ro đóng gói đã gặp với bản `.exe`.

**File mẫu Excel:** `MAU_01_danh_sach_CLB.xlsx`,
`MAU_02_chon_CLB_muon_thi.xlsx`, `MAU_03_xep_hang_nguyen_vong.xlsx`. Mỗi file
có sheet đầu là dữ liệu và sheet sau là hướng dẫn từng cột; phần mềm chỉ đọc
sheet đầu nên ghi chú không lẫn vào dữ liệu. Sinh lại bằng
`./.venv/bin/python mau_csv/tao_mau_excel.py` sau khi sửa file CSV mẫu — có
test bắt hai bộ không được lệch nhau.

### Bộ dữ liệu chạy thử ở quy mô thật

`mau_csv/` là **mẫu định dạng** (vài dòng, để nhìn cho biết cột nào là cột nào).
`du_lieu_test/` là chuyện khác: **120 học sinh, 10 CLB** — đủ lớn để thấy thuật
toán thật sự cạnh tranh, và để đo xem giao diện có chậm không.

| File | Nội dung |
|---|---|
| `TEST_01_danh_sach_CLB.xlsx` | 10 CLB, 130 suất, 4 CLB có suất dự trữ |
| `TEST_02_chon_CLB_muon_thi.xlsx` | 120 em, mỗi em thi 2–5 CLB, **kèm sẵn 396 ô điểm** |
| `TEST_03_xep_hang_nguyen_vong.xlsx` | 120 em, mỗi em 2–5 nguyện vọng |
| `TEST_04_CO_LOI_CO_Y.xlsx` | 10 dòng cố ý sai 6 chỗ, để kiểm tra cảnh báo |

Điểm nằm sẵn trong cột `score_*`, nên **nạp ba file xong là chạy phân bổ được
ngay** — không phải chấm tay ô nào. Kết quả: **108/120 em được xếp**, nguyện vọng 1
59%, **10 em vào bằng suất dự trữ**, 4 CLB đầy chỗ và 6 CLB thừa chỗ. `TEST_04`
phải làm phần mềm hiện đủ **6 cảnh báo**; thiếu cảnh báo nào là lỗi phần mềm.

> Đây là **dữ liệu mô phỏng** do `du_lieu_test/tao_du_lieu_test.py` sinh ra
> (`seed = 2026`), **không phải học sinh có thật**, và được **cố ý thiết kế cho
> cạnh tranh cao** để cơ chế thuật toán lộ ra — không mô phỏng phân bố nguyện vọng
> tự nhiên. Mỗi file có sheet "Ghi chú" nói rõ điều đó ngay trong file.

### Kéo thả, không phải chọn ô

Một vùng kéo-thả duy nhất nhận **mọi loại file**. `detect_csv_kind()` đọc
dòng tiêu đề để biết đây là file gì, nên người dùng không phải chọn loại,
cũng không phải chọn dạng "rộng"/"dài" hay dấu phân cách (`,` `;` Tab).

Thả được **nhiều file cùng lúc**, và phần mềm **tự xếp thứ tự nhập**: danh
sách CLB trước, rồi mới đến file học sinh (`THU_TU_NHAP` trong `app.js`) —
vì học sinh tham chiếu tới `club_id`, nạp ngược thứ tự thì cả học sinh bị bỏ
qua.

**Vì sao bỏ hai ô cũ:** giao diện trước có hai ô riêng — "Bước 1" và
"Bước 2" — và người dùng phải tự chọn đúng ô. Kéo nhầm ô **không hề báo
lỗi**: file nguyện vọng dạng dài (`student_id, name, club_id, rank`) khớp đủ
cột của ô "chọn CLB muốn thi", nên nó ghi thẳng vào bảng
`club_test_selection` và báo *"thành công 5 học sinh"*. Nguyện vọng thật mất
sạch, không một cảnh báo. Với phần mềm phân bổ học sinh, đó là lỗi làm sai
kết quả cả trường mà không ai biết.

**Không chắc thì hỏi, không đoán.** Bộ cột `student_id, name, club_id` vừa có
thể là "chọn CLB muốn thi" dạng dài, vừa có thể là "xếp hạng nguyện vọng"
dạng dài thiếu cột `rank`. Gặp trường hợp đó, phần mềm dừng lại và hiện ô cho
người dùng chọn — đoán bừa ở đây là dựng lại đúng cái bug vừa chữa.

**Ba lớp bảo vệ khi nạp, tìm ra bằng cách soát thủ công từng ca:**

| Ca | Trước | Nay |
|---|---|---|
| Cùng `student_id` hai dòng trong file dạng rộng | Dòng sau ghi đè dòng trước, **không cảnh báo** | Vẫn giữ dòng cuối, nhưng cảnh báo rõ mã nào lặp mấy lần |
| `hs001` và `HS001` | Thành **hai học sinh** khác nhau, không cảnh báo | Cảnh báo; **không** tự gộp, vì gộp nhầm hai em có thật hỏng nặng hơn |
| `CLB_BongRo` vs `clb_bongro` | Cả học sinh bị bỏ qua | Tự khớp về mã gốc trong DB; mã sai hẳn vẫn bị bỏ qua kèm cảnh báo |

Khớp `club_id` thử **chính xác trước**, chỉ khi không thấy mới bỏ qua
hoa/thường — nên nếu trường thật sự tạo cả `clb_a` lẫn `CLB_A` thì mã khớp
chính xác vẫn thắng, phần mềm không đoán hộ.

**Hai điểm dễ sai nhất, đã ghi rõ trong hướng dẫn:**

1. **`club_id` phải có trước file học sinh.** Học sinh có bất kỳ `club_id`
   nào chưa tồn tại sẽ bị **bỏ qua toàn bộ** (kèm cảnh báo) — phần mềm
   không nhập một nửa. Thả cả ba file cùng lúc là tránh được hoàn toàn.
2. **Nhãn nhóm dự trữ được chuẩn hoá về một mã.** `reserve_group` là chuỗi
   tự do gõ ở **hai nơi** — file CLB và file học sinh — và phải khớp nhau thì
   cơ chế dự trữ mới chạy. Trước đây so khớp chuỗi chính xác, nên CLB khai
   `chinh_sach` còn giáo viên gõ `Chính sách` là hai nhóm khác nhau: học sinh
   diện ưu tiên vào theo diện `general`, mất suất dự trữ, mà pipeline vẫn
   chạy hết và không báo lỗi.

   `chuan_hoa_nhom_du_tru()` bỏ dấu tiếng Việt, hạ chữ thường và thay mọi ký
   tự không phải chữ/số bằng gạch dưới, áp dụng ở **mọi đường ghi** (form
   CLB, CSV CLB, CSV học sinh, gán tay, gán hàng loạt). Chuẩn hoá lúc **ghi**
   chứ không phải lúc so sánh là chủ ý: `rbda_priority_pipeline.py` vẫn so
   khớp chuỗi chính xác như cũ nên phần thuật toán không bị đụng tới.

   Chuẩn hoá chỉ gộp các cách viết cùng một chữ — `Khối 10` và `Khối 11` vẫn
   khác nhau. Gõ sai hẳn (`chinh_sac`) thì được cảnh báo **ngay khi nạp file**
   kèm gợi ý nhóm gần giống nhất, thay vì chỉ nằm im trong mục *Cảnh báo dữ
   liệu*.

   **Dữ liệu nhập từ trước bản này** có thể còn nhãn chưa chuẩn hoá; nhập lại
   file CLB và file học sinh là tự quy về mã chuẩn.

Mọi quy tắc trong `HUONG_DAN_CSV.md` đều được khoá bằng test
(`tests/test_csv_mau.py`, `tests/test_upload_tu_nhan_dien.py`) — tài liệu và
code không thể lệch nhau mà không làm đỏ test. Riêng giao diện kéo-thả có
test chạy **trình duyệt thật** (`tests/test_giao_dien_upload.py`, Playwright +
Chromium); máy không cài `playwright` thì các test đó tự bỏ qua, phần còn lại
vẫn chạy đủ.

**Về Excel:** file lưu bằng *CSV UTF-8* có ký tự BOM vô hình ở đầu. Trước
đây chính ký tự đó khiến một file hoàn toàn đúng vẫn báo "thiếu cột
`student_id`"; nay đã được xử lý.

## Xuất kết quả cho nhà trường

Nút **Xuất CSV** (màn hình *02 Kết quả*) tạo ra hai thứ cùng lúc:

**1. Một file tổng** — `ket_qua_phan_bo.csv`, đặt **cạnh `app.db`**:

```csv
Mã học sinh,Họ tên,Mã CLB,Tên CLB,Nguyện vọng thứ,Diện trúng tuyển,Nhóm dự trữ
HS001,Nguyễn Văn An,clb_bongro,CLB Bóng rổ,1,Thường,
HS002,Trần Thị Bình,clb_tienganh,CLB Tiếng Anh,1,Dự trữ,chinh_sach
```

**2. Một thư mục theo CLB** — `ket_qua_phan_bo_theo_club/`, mỗi CLB một
file để phát cho giáo viên phụ trách, kèm `_chua_duoc_xep.csv` liệt kê các
em chưa vào CLB nào (nhóm nhà trường cần xử lý tiếp).

Ba điều đã sửa so với bản trước, đều là thứ cản người dùng dùng file:

| Trước | Nay |
|---|---|
| Chỉ 2 cột mã `student_id,club_id` — không biết em nào tên gì, đỗ nguyện vọng thứ mấy | Đủ tên học sinh, tên CLB, nguyện vọng thứ mấy, diện thường/dự trữ |
| `reserve`/`general` là mã nội bộ | Ghi thẳng **Thường** / **Dự trữ** |
| Đường dẫn tương đối → file rơi vào thư mục làm việc của tiến trình, người dùng không tìm ra | Đặt **cạnh `app.db`**, thông báo hiện **đường dẫn đầy đủ** |
| Không có BOM → thêm cột tiếng Việt là Excel hỏng font | `utf-8-sig`, Excel mở đúng dấu tiếng Việt |

`club_id` do trường tự đặt và không bị giới hạn ký tự, nên tên file theo
CLB được làm sạch trước khi ghi — một mã như `../ngoai` không thể làm file
rơi ra ngoài thư mục kết quả, và hai mã khác nhau cho ra cùng tên sau khi
làm sạch cũng không ghi đè lên nhau.

## Cảnh báo chữ ký số khi chạy `.exe` trên Windows

Windows SmartScreen cảnh báo "nhà phát hành không xác định" với **mọi** ứng dụng
không mua chữ ký số thương mại. Không phải lỗi phần mềm.

Chứng chỉ ký mã loại OV giá 200–400 USD/năm — và **vẫn bị SmartScreen cảnh báo**
cho tới khi phần mềm tích đủ lượt tải; chỉ loại EV (400–1000 USD/năm, kèm thiết bị
USB) mới bỏ qua ngay. Với phần mềm nội bộ dùng trong một trường, cách xử lý thông
thường là hai đường dưới đây, không phải mua chứng chỉ.

| Cách | Cần gì | Kết quả |
|---|---|---|
| **Bấm qua** — More info → Run anyway | Không cần gì | Windows nhớ lựa chọn, chỉ hiện lần đầu trên mỗi máy |
| **`ky_va_tin_cay.ps1`** | Quyền Administrator + Windows SDK | Hết cảnh báo hoàn toàn, nhưng **chỉ trên máy đã chạy script** |

Script tạo chứng chỉ tự ký, cài vào kho `Root` và `TrustedPublisher` của máy, rồi ký
`.exe` bằng `signtool` (kèm dấu thời gian để chữ ký không hết hiệu lực khi chứng chỉ
hết hạn). Chạy lại nhiều lần không sao — nó tìm chứng chỉ cũ trước, chỉ tạo mới khi
chưa có, nên các bản build sau dùng lại đúng chứng chỉ đó.

Chi tiết trong `HUONG_DAN_CAI_DAT.md`, được workflow chép sẵn vào thư mục cài đặt.

> **Chưa kiểm chứng:** script viết theo tài liệu Microsoft, chưa chạy thật lần nào —
> môi trường phát triển là Linux, không có `signtool` lẫn kho chứng chỉ Windows. Đã
> kiểm được cú pháp và logic tìm file; phần còn lại cần chạy thử trên máy Windows.

## Chạy test tự động

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install pytest
python3 -m pytest tests/ -v
```

## ĐÃ xác nhận trên máy Windows thật (02/09/2026)

- **Cửa sổ pywebview thật, đóng gói bằng PyInstaller — CHẠY ỔN ĐỊNH.**
  Học sinh chạy bản có bản vá lỗi 25 (`_set_window`) trên máy Windows
  của mình và xác nhận app chạy ổn định, không còn treo. Sandbox này
  không có GTK/QT nên `webview.start()` vẫn báo thiếu backend GUI —
  đó là giới hạn của môi trường chạy test, không phải của phần mềm.
- Chế độ dự phòng bằng trình duyệt cũng đã chạy thật đầy đủ (30/08).
  pywebview hỏng thì app tự chuyển sang trình duyệt.
