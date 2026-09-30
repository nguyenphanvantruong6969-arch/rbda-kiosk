---
name: sinh-du-lieu-clb
description: Sinh, soát và sửa bộ dữ liệu đầu vào CSV cho phần mềm phân bổ câu lạc bộ RB-DA (rbda-kiosk) — ba tệp danh sách câu lạc bộ, chọn câu lạc bộ dự thi kèm điểm, và xếp hạng nguyện vọng theo buổi. Dùng khi cần tạo dữ liệu thử, dựng bộ dữ liệu cho một trường mới, kiểm một bộ CSV đã có xem có nhập được không, hoặc tìm lý do phần mềm báo cảnh báo khi nhập. Cũng dùng khi người dùng nói "tạo dữ liệu mẫu", "sinh dữ liệu test", "làm file đầu vào", "kiểm tra file CSV", "generate input data", "sample data for the kiosk".
---

# Sinh dữ liệu đầu vào cho phần mềm phân bổ câu lạc bộ

Phần mềm `rbda-kiosk` nhận **ba tệp CSV**. Kỹ năng này dựng chúng sao cho nhập
vào **không một cảnh báo nào**, và soát một bộ đã có để tìm chỗ sai.

## Nguyên tắc bất di bất dịch

**Ba tệp phải đi ra từ MỘT nguồn.** Gõ tay ba tệp rời thì sớm muộn cũng có một
mã câu lạc bộ trong tệp nguyện vọng không còn tồn tại trong danh sách, và không
ai thấy cho tới lúc nhập vào phần mềm. Luôn dùng `scripts/sinh_du_lieu.py`.

**Sai thì không ghi tệp nào.** Một bộ dữ liệu hỏng còn tệ hơn không có, vì nó
trông y như thật. Đoạn mã soát trước, ghi sau, và **không tự sửa** — sửa giúp
là giấu mất chỗ sai.

**Không bịa dữ liệu học sinh thật.** Mọi tên do kỹ năng này sinh ra là tên bịa
ghép từ bảng họ/đệm/tên. Không bao giờ chép tên học sinh có thật vào kho mã
nguồn hay vào tệp mẫu.

## Cách dùng

```bash
# Một trường ngẫu nhiên nhưng luôn hợp lệ — tất định theo --seed
python scripts/sinh_du_lieu.py ngau --ra ./bo_moi \
    --hoc-sinh 180 --buoi thu_2,thu_4,thu_6 --clb-moi-buoi 3 --seed 42

# Trường một buổi: bỏ hẳn --buoi
python scripts/sinh_du_lieu.py ngau --ra ./bo_moi --hoc-sinh 120

# Dựng từ bản khai báo JSON tường minh
python scripts/sinh_du_lieu.py tao --spec truong.json --ra ./bo_moi

# Soát một bộ đã có — không sửa gì
python scripts/sinh_du_lieu.py soat ./bo_moi
```

`--do-choi` chỉnh độ chật: `1.15` là tổng chỗ nhiều hơn nhu cầu 15%. Dưới `1.0`
thì chắc chắn nhiều em trắng tay; trên `1.5` thì gần như ai cũng có chỗ và kết
quả không nói lên điều gì.

## Ba tệp trông thế nào

### 1 · `01_danh_sach_CLB.csv` — nhập TRƯỚC hai tệp kia

```csv
club_id,name,capacity,reserve_capacity,reserve_group,buoi
clb_bongro,CLB Bóng rổ,6,0,,thu_2
clb_vanhoc,CLB Văn học,5,2,chinh_sach,thu_2
```

| Cột | Bắt buộc | Quy tắc |
|---|---|---|
| `club_id` | ✅ | Không dấu, không khoảng trắng. Khớp **từng ký tự** với hai tệp kia |
| `name` | ✅ | Tên hiển thị, có dấu |
| `capacity` | ✅ | **> 0** |
| `reserve_capacity` | | ≤ `capacity`. Lớn hơn 0 thì **bắt buộc** có `reserve_group` |
| `reserve_group` | | Nhãn nhóm ưu tiên |
| `buoi` | | Trường một buổi thì **bỏ hẳn cột này**. Khai thì phải khai cho **mọi** câu lạc bộ |

### 2 · `02_chon_CLB_muon_thi.csv` — ai thi gì, và điểm bao nhiêu

```csv
student_id,name,reserve_group,test_club_1,score_1,test_club_2,score_2
HS001,Nguyễn Văn An,,clb_tinhoc,"9,5",clb_robotics,"8,0"
```

- `score_N` ghép với `test_club_N` **theo con số trong tên cột, không theo vị
  trí**. Nên chỉ cần số cặp cột bằng số câu lạc bộ nhiều nhất *một* em dự thi —
  không phải 5 × số buổi.
- Dấu phẩy thập phân (`9,5`) đọc được, dấu chấm (`9.5`) cũng đọc được.
- Câu lạc bộ **không ai khai** ở tệp này = câu lạc bộ **không tổ chức thi**.
  Không có cột nào đánh dấu điều đó; phần mềm suy ra từ chính tệp này.
- Cột `score_*` **chỉ có tác dụng trong tệp này**.

### 3 · `03_xep_hang_nguyen_vong.csv` — muốn vào đâu, theo thứ tự nào

```csv
student_id,name,reserve_group,thu_2_pref_1,thu_2_pref_2,thu_4_pref_1
HS001,Nguyễn Văn An,,clb_tinhoc,clb_bongro,clb_robotics
```

- Nhiều buổi: tên cột là **`<buổi>_pref_<số>`**, thứ tự đếm lại từ 1 ở mỗi buổi.
- Một buổi: chỉ `pref_1`, `pref_2`, …
- Bỏ trống cả một buổi = **em bận ngày đó**. Đó là dữ liệu hợp lệ, không phải
  thiếu sót.

## Chín điều phải đúng, nếu không thì không ghi

1. mọi `club_id` trong tệp học sinh đều có trong danh sách câu lạc bộ;
2. mỗi câu lạc bộ nằm đúng cột buổi của nó;
3. không nguyện vọng nào trùng trong cùng một buổi;
4. ≤ **10 nguyện vọng mỗi buổi** (đúng giới hạn câu hỏi Ranking của Microsoft Forms);
5. ≤ **5 câu lạc bộ dự thi mỗi buổi**;
6. `capacity > 0`, `reserve_capacity ≤ capacity`, có dự trữ thì có nhóm;
7. chỉ chấm điểm cho câu lạc bộ có thật;
8. chỉ chấm điểm cho câu lạc bộ em **có khai nguyện vọng** — điểm cho câu lạc
   bộ em không xếp là điểm không dùng tới, và gần như chắc chắn là gõ lệch cột;
9. mã học sinh duy nhất (phần mềm **phân biệt hoa thường**: `hs001` và `HS001`
   là hai em khác nhau).

Ngoài ra kỹ năng in **cảnh báo mềm** — không chặn, nhưng nên đọc: buổi chọi quá
3 lần, buổi thừa chỗ, số em không khai nguyện vọng nào.

## Luôn kiểm bằng phần mềm thật, đừng tin mình

Soát xong vẫn phải nhập thử. Đây là phép kiểm duy nhất đáng tin:

```python
import sys, io, os, tempfile
sys.path.insert(0, "<đường dẫn tới rbda-kiosk>")
from api import PipelineAPI

d = tempfile.mkdtemp()
api = PipelineAPI(os.path.join(d, "app.db"), thu_muc_xuat=d)
for t in ("01_danh_sach_CLB.csv", "02_chon_CLB_muon_thi.csv",
          "03_xep_hang_nguyen_vong.csv"):
    kq = api.import_csv_auto(io.open(os.path.join(BO, t), encoding="utf-8-sig").read())
    assert kq["ok"] and not (kq["data"].get("warnings") or []), (t, kq)
canh_bao = api.get_data_health_report()["data"]["warnings"]
assert [w for w in canh_bao
        if w["code"] != "health_oversubscribed_buoi"] == [], canh_bao
assert api.run_pipeline(seed=42)["ok"]
```

**Tiêu chuẩn: 0 cảnh báo khi nhập, 0 cảnh báo sức khoẻ dữ liệu (trừ đúng một
mã, xem dưới), chạy được.** Một bộ mẫu mà phần mềm phải kêu là một bộ mẫu đang dạy
người ta làm sai, và người đọc không có cách nào biết cảnh báo đó là cố ý hay
là lỗi.

Chỉ được phép đúng một mã: `health_oversubscribed_buoi` — một buổi có ít chỗ
hơn số em xếp nguyện vọng buổi đó. Đó là sự thật về độ chọi, không phải lỗi dữ
liệu: bộ sinh ra cố ý để chật chỗ cho kết quả có ý nghĩa. Đọc nó để biết buổi
nào sẽ có em trắng tay. Mọi mã khác, kể cả mức "info", vẫn phải bằng 0.

## Bản khai báo JSON

```json
{
  "cau_lac_bo": [
    {"club_id": "clb_covua", "name": "CLB Cờ vua", "capacity": 4,
     "reserve_capacity": 0, "reserve_group": "", "buoi": "thu_2"}
  ],
  "hoc_sinh": [
    {"student_id": "HS001", "name": "Nguyễn Văn An", "reserve_group": "",
     "nguyen_vong": {"thu_2": ["clb_covua"]},
     "diem": {}}
  ]
}
```

`nguyen_vong` là `{buổi: [club_id theo thứ tự ưu tiên]}`.
`diem` là `{club_id: điểm}` — chỉ cho câu lạc bộ em vừa khai nguyện vọng.

## Đọc thêm khi cần chi tiết

| Cần gì | Đọc đâu |
|---|---|
| Một trường hoàn chỉnh đã kiểm chứng | `mau_csv/vi_du_day_du/` và `GIAI_THICH.md` của nó |
| Một trường sinh hoạt cả tuần (6 buổi) | `mau_csv/vi_du_ca_tuan/` và `GIAI_THICH.md` của nó |
| Mọi biến thể định dạng (dạng dài, dạng rộng, Excel) | `mau_csv/HUONG_DAN_CSV.md` |
| Cách dựng biểu mẫu Microsoft Forms khớp các trần này | `docs/BO_CAU_HOI_FORMS.md` |
| Thuật toán xếp chỗ hoạt động ra sao | `docs/NGHIEN_CUU_TOI_UU.md`, `docs/CO_CHE_THUAT_TOAN.md` |
