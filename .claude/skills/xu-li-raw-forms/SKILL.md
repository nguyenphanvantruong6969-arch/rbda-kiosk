---
name: xu-li-raw-forms
description: Xử lí dữ liệu raw xuất từ biểu mẫu Google Forms "Đăng ký CLB và thi tuyển" (tệp RAW_PHIEU.xlsx và DAP_AN.xlsx do hàm chamTheoCLB tạo) thành ba tệp nạp phần mềm xếp CLB rbda-kiosk (01 danh sách CLB, 02 chọn CLB dự thi kèm điểm, 03 xếp hạng nguyện vọng theo buổi), chấm lại bài thi theo đáp án gốc, và soát dữ liệu bất thường (phiếu trùng, mã sai dạng, đáp án Forms lệch, làm bài không tick, tick không làm, thiếu xếp hạng). Dùng khi người dùng nói "xử lí raw", "xử lý dữ liệu raw", "RAW_PHIEU", "chuyển kết quả Google Forms sang phần mềm", "làm tệp nạp từ biểu mẫu", "soát phiếu", "process the raw export", hoặc đưa một thư mục "Kết quả CLB ...".
---

# Xử lí dữ liệu raw của Google Forms thành tệp nạp phần mềm

Biểu mẫu Google Forms được dựng bằng `mau_forms_thi_clb/TAO_GOOGLE_FORM.gs`.
Hàm `chamTheoCLB` trong đó xuất thư mục "Kết quả CLB <ngày giờ>" có
`RAW_PHIEU.xlsx` và `DAP_AN.xlsx`. Định dạng hai tệp này nằm trong
`mau_forms_thi_clb/DINH_DANG_RAW.md`: **đọc tài liệu đó trước** nếu cần hiểu
một cột.

Skill này biến raw thành đúng ba tệp phần mềm xếp CLB nạp được, và viết một
báo cáo bất thường cho người vận hành đọc.

## Nguyên tắc

- **Không tin mù quáng các cột tính sẵn trong raw.** Script tự chấm lại theo
  `DAP_AN.xlsx`, tự chọn phiếu giữ (phiếu đầu của mỗi mã), tự quyết bài nào
  được tính (phải tick, phải được xếp ở bảng Top, tối đa 5 CLB mỗi buổi).
  Chỗ nào khác với raw thì ghi vào báo cáo.
- **Ô sai lẻ thì bỏ riêng ô đó và báo.** Một phiếu trùng, một bài không tick
  không làm hỏng cả bộ.
- **Đầu vào hỏng thì không ghi tệp nào**: thiếu cột, tệp chỉ tiêu thiếu CLB,
  buổi của CLB không khớp. Một bộ tệp hỏng trông y như thật còn tệ hơn không có.
- **Không bịa chỉ tiêu.** Chỉ tiêu CLB do nhà trường lập. Không có tệp chỉ
  tiêu thì tệp 01 là mẫu với cột `capacity` trống, và phải nói rõ với người dùng.
- **Dữ liệu là của học sinh thật.** Không chép tên, mã học sinh vào kho mã
  nguồn, không đưa vào tệp mẫu hay test.

## Cách chạy

```bash
python .claude/skills/xu-li-raw-forms/scripts/xu_li_raw.py \
    --raw  "<thư mục kết quả>/RAW_PHIEU.xlsx" \
    --dap-an "<thư mục kết quả>/DAP_AN.xlsx" \
    --clb  "<tệp 01 đã điền chỉ tiêu>.xlsx" \
    --ra   ./nap
```

- `--raw` bắt buộc. Nhận `.xlsx` hoặc `.csv`.
- `--dap-an` nên có. Thiếu thì dùng cột `diem` có sẵn trong raw, không chấm lại.
- `--clb` là tệp danh sách CLB đã điền chỉ tiêu (cột `club_id, name, capacity,
  reserve_capacity, reserve_group, buoi`). Thường là `01_danh_sach_CLB.xlsx`
  trong thư mục kết quả sau khi nhà trường điền cột `capacity`. Thiếu thì ghi mẫu.
- Mã thoát `1` và dòng "KHÔNG GHI TỆP NÀO" nghĩa là đầu vào hỏng: đọc lý do,
  báo người dùng, không tự sửa dữ liệu.

Người dùng đưa thư mục đã giải nén từ Drive thì tìm ba tệp trong đó. Có nhiều
thư mục "Kết quả CLB ..." thì dùng thư mục mới nhất theo tên, và nói rõ đã dùng
thư mục nào.

## Đầu ra (trong `--ra`)

| Tệp | Nội dung |
|---|---|
| `01_danh_sach_CLB.csv` | Danh sách CLB có chỉ tiêu (hoặc mẫu, capacity trống) |
| `02_chon_CLB_muon_thi.csv` | Mỗi em một dòng: `test_club_n, score_n`, điểm thang 10 |
| `03_xep_hang_nguyen_vong.csv` | `<buoi>_pref_n` theo thứ tự hạng em chọn |
| `BAO_CAO_BAT_THUONG.md` | Mọi điều bất thường, kèm mã học sinh |

Ba tệp CSV ghi bằng `ghi_bo()` và được soát bằng `soat()` của skill
`sinh-du-lieu-clb` (9 điều bắt buộc của phần mềm), nên định dạng giống hệt các
bộ mẫu khác trong kho.

## Đọc báo cáo và nói với người dùng

Tóm tắt cho người dùng theo thứ tự ưu tiên:

1. **Đáp án Forms lệch đáp án gốc**: gom theo câu. Nhiều bài lệch ở cùng một
   câu gần như chắc chắn là đáp án trên Google Forms bị tick sai. Điểm trong
   tệp 02 đã theo đáp án gốc, nhưng nên sửa đáp án trên Forms.
2. **Làm bài mà không tick**: bài không được tính. Hỏi người dùng có muốn
   liên hệ học sinh không; **không tự tính điểm** cho những bài này.
3. **Phiếu trùng, phiếu không mã, mã sai dạng, một email nhiều mã**: có thể
   là gõ nhầm mã. Liệt kê để người dùng kiểm với danh sách lớp.
4. **Bỏ trống một Top ở giữa**: nguyện vọng đã được dồn lên, chỉ cần báo.
5. **Thiếu xếp hạng, trùng hạng, câu lạ**: dấu hiệu biểu mẫu bị sửa tay.
6. Chưa có chỉ tiêu: nhắc điền `capacity` trước khi nạp.

Nói bằng tiếng Việt đơn giản, nêu con số cụ thể.

## Luôn kiểm bằng phần mềm thật

Có chỉ tiêu thì nạp thử trước khi giao:

```python
import sys, io, os, tempfile
sys.path.insert(0, "<đường dẫn tới rbda-kiosk>")
from api import PipelineAPI

d = tempfile.mkdtemp()
api = PipelineAPI(os.path.join(d, "app.db"), thu_muc_xuat=d)
for t in ("01_danh_sach_CLB.csv", "02_chon_CLB_muon_thi.csv",
          "03_xep_hang_nguyen_vong.csv"):
    kq = api.import_csv_auto(io.open(os.path.join(RA, t), encoding="utf-8-sig").read())
    print(t, kq["ok"], (kq.get("data") or {}).get("warnings"))
print(api.get_data_health_report()["data"]["n_warnings"])
print(api.run_pipeline(seed=42)["ok"])
```

Tiêu chuẩn: nạp được cả ba tệp, 0 cảnh báo khi nạp, chạy xếp CLB được. Cảnh
báo sức khoẻ dữ liệu (ví dụ "điểm lạ" khi một bài 0 điểm) có thể là thật: đối
chiếu với báo cáo rồi nói với người dùng, đừng tự sửa điểm.

## Kiểm bộ test

`tests/test_skill_xu_li_raw.py` dựng raw giả với đủ các loại bất thường, chạy
script, rồi nạp kết quả vào phần mềm thật và đếm cảnh báo.
