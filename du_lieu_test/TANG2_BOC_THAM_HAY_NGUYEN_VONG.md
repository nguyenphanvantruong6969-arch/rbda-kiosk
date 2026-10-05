# Tầng 2 nên xếp theo bốc thăm, hay theo thứ hạng nguyện vọng?

> **Đã sửa bởi `TANG2_PHAN_BIEN.md`.** Kết luận dưới đây nói quá: phép dò khai
> gian giả định học sinh biết trước số bốc thăm, và 8,29% đo trên thể hiện đã bỏ
> bớt điểm thi. Với học sinh không biết số bốc thăm, B không kém A ở kịch bản
> nào; cái giá thật là chênh lệch giữa em biết mẹo và em khai thật.

> Dữ liệu MÔ PHỎNG của kho (`bo_sach`, `bo_can_bang`, `bo_kich_tran`,
> `bo_toan_tuan`, `bo_nhieu_buoi`, `bo_sau_buoi`) — không phải học sinh có thật.
> Chạy lại: `python3 du_lieu_test/do_tang2_theo_nguyen_vong.py --so-seed 50
> --so-the-hien 300 --so-em-mau 20 --tran 400`
> Số liệu thô: `so_lieu_tang2_nguyen_vong.json`.

## Hai phương án

Cả hai đều là Gale–Shapley do học sinh đề xuất, giữ nguyên Tầng 1 (điểm thi) và
suất dự trữ. Khác đúng một chỗ — thứ tự **trong Tầng 2** (em không thi):

* **A — bốc thăm** (phần mềm đang chạy): sắp theo (số bốc thăm, mã HS).
* **B — theo nguyện vọng**: sắp theo (thứ hạng em xếp CLB này, số bốc thăm, mã HS);
  bốc thăm chỉ còn phá hoà.

B cài bằng cách thay tạm `compute_club_priority`, nên hàm lựa chọn, dự trữ và
vòng DA là đúng mã phần mềm.

## Quy mô phép đo

28 thị trường (bộ × buổi), 4 149 lượt học sinh-buổi, 50 bộ số bốc thăm mỗi thị
trường. Tầng 2 chiếm 28–100% số cặp ứng viên tuỳ buổi. 7/28 buổi ra kết quả
**y hệt** nhau (Tầng 2 không tranh chỗ ở đó); trung bình mỗi lần chạy chỉ 7,8 em
đổi chỗ.

## 1. Kết cục khi mọi em khai thật

| | A — bốc thăm | B — theo nguyện vọng |
|---|---|---|
| Số em được xếp (10 seed × 28 thị trường) | 28 026 | 28 031 |
| Được NV1 (trên số em được xếp) | **44,98%** | **48,52%** |
| Hạng nguyện vọng trung bình | 2,677 | **2,608** |
| Em trượt (tổng 28 thị trường, TB 50 seed) | 1 345,7 | 1 345,4 |
| Cặp phá vỡ (280 lần chạy mỗi cơ chế) | 0 | 0 |

B hơn A khoảng **+3,5 điểm phần trăm NV1** và nhẹ hơn 0,07 bậc nguyện vọng.
Số em được xếp **không đổi** — B không cứu được em nào khỏi trượt, nó chỉ đổi
*ai* vào CLB nào.

## 2. Hai kiểu bất công — mỗi cơ chế chỉ tránh được kiểu của mình

Đếm trên các em cùng Tầng 2 của một CLB (TB mỗi lần chạy, tổng 28 thị trường):

| Kiểu ghen | A | B |
|---|---|---|
| X xếp CLB c cao hơn Y, Y được c, X trượt c | 1 923 | **32** |
| X bốc số tốt hơn Y, X muốn c hơn chỗ đang có, Y được c | **84** | 1 742 |

Đây là đánh đổi thuần: bỏ kiểu ghen này thì nhận kiểu ghen kia, với lượng xấp xỉ
bằng nhau. Không có bên nào "công bằng hơn" theo nghĩa tuyệt đối — chỉ khác ở câu
*cái gì đáng được tôn trọng khi em không thi*: nguyện vọng em khai, hay vận may
đã công khai trước.

## 3. Khai gian có lợi không — chỗ quyết định

Cùng bộ dò vét cạn của `do_khai_that.py` (mọi hoán vị, mọi cách cắt ngắn danh
sách nguyện vọng của một em, giữ nguyên khai báo của mọi em khác), có Boston làm
đối chứng ngược:

| Cơ chế | Vét cạn, 300 thể hiện nhỏ | Trên 6 bộ dữ liệu kho |
|---|---|---|
| A — bốc thăm | **0 / 2 100** | **0 / 560** |
| B — theo nguyện vọng | **174 / 2 100 (8,29%)** | 26 / 560 (4,64%), lợi TB 2,6 bậc |
| Boston (đối chứng) | 406 / 2 100 (19,33%) | — |

Ví dụ B sinh ra: em có nguyện vọng thật `[C2, C3, C1, C0]`, khai thật thì được
nguyện vọng thứ 6 (trượt); chỉ khai `[C0]` thì được đúng `C0` — nguyện vọng thứ 4.
Đó là chiến thuật "chỉ ghi CLB mình chắc đỗ", đúng thứ mà RB-DA sinh ra để chặn.

## Kết luận

**Giữ bốc thăm cho Tầng 2.**

Con số +3,5 điểm NV1 của B **không có thật** như nó trông. Nó đo trên giả định
mọi em khai thật, mà chính B phá giả định đó: xếp ưu tiên theo thứ hạng nguyện
vọng làm ưu tiên của CLB phụ thuộc vào tờ khai, nên tờ khai thành một ván cược.
8,29% em vét cạn được lợi nhờ khai gian nghĩa là cột "được NV1" của B đếm cả
những em khai khéo, không phải những em thật sự được CLB mình thích nhất — y hệt
lập luận đã dùng cho Boston (92 em NV1 nhưng 18,4% khai gian được).

Đây cũng đúng là ràng buộc chống nội sinh ghi ở `rbda_priority_pipeline.py:138`
(*"hàm này KHÔNG được nhận bất kỳ tham số nào liên quan đến thứ hạng nguyện
vọng"*). Phép đo này là bằng chứng số cho dòng ghi chú đó: gỡ ràng buộc ra thì
mở kênh khai gian 8,29%, đổi lấy 0 em được xếp thêm và một kiểu bất công thay
cho một kiểu bất công khác.
