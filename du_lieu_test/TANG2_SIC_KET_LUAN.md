# Bốc thăm + chu trình cải thiện (SIC): có thật sự tốt hơn không?

> Dữ liệu MÔ PHỎNG của kho. Chạy lại (~25 phút, 4 lõi):
> `python3 du_lieu_test/do_sic_kiem_chung.py` → `so_lieu_sic_kiem_chung.json`.

**Phán quyết: SIC tốt hơn A một chút, ở mọi phép thử, và không làm ai thiệt.
Nhưng lợi nhỏ khi điểm thi ít hoà; nó đáng thêm vào chủ yếu khi điểm thi chấm
tròn hoặc nhiều CLB không thi. Cái giá là phải giải thích vì sao có em số bốc
thăm xấu hơn lại ngồi ở CLB em khác muốn.**

## K1 — Cài đặt có đúng không? (bộ vét cạn viết độc lập)

300 thể hiện nhỏ × 3 kiểu điểm. Bộ kiểm tự viết lại từ định nghĩa, không dùng
hàm nào của SIC hay của phần mềm; liệt kê MỌI cách xếp.

| Kiểu điểm | A ổn định | SIC ổn định | SIC làm ai thiệt | A còn cách xếp ổn định tốt hơn cho mọi em | SIC còn cách tốt hơn |
|---|---|---|---|---|---|
| điểm gốc | 300 | 300 | 0 | 21 (7%) | **0** |
| làm tròn 1 | 300 | 300 | 0 | 21 | **0** |
| làm tròn + bỏ 50% điểm | 300 | 300 | 0 | 32 (11%) | **0** |

SIC tìm ra **toàn bộ** lợi ích mà A bỏ sót, không bỏ sót lần nào. Giới hạn: bộ
vét cạn chỉ chạy được khi không có suất dự trữ và ≤ 6 em.

## K2/K3 — Trên 6 bộ dữ liệu (28 buổi, 4 149 em, 20 lá thăm)

| Kiểu điểm | Em được lợi | Em bị thiệt | NV1: A → SIC | Lợi NV1 (KTC 95%) | Vi phạm ổn định |
|---|---|---|---|---|---|
| điểm gốc (1 chữ số thập phân) | 0,80% | **0** | 30,43 → 30,89 | +0,46 (0,42–0,50) | 0 |
| làm tròn 0,5 | 2,21% | **0** | 30,47 → 31,45 | +0,97 (0,91–1,04) | 0 |
| làm tròn 1 | 3,29% | **0** | 30,90 → 32,41 | +1,50 (1,40–1,61) | 0 |
| chỉ 50% em có điểm | 4,84% | **0** | 29,77 → 32,01 | +2,24 (2,16–2,31) | 0 |

Hoà càng nhiều, SIC càng lợi — vì SIC chỉ đổi chỗ trong các nhóm hoà ưu tiên.
Trần 500 vòng không lần nào chạm. 1 200 em một buổi: ~3 giây.

## K4 — Khai gian

* Học sinh "cấp 1" (biết độ hot, không biết lá thăm): dưới SIC **4 / 4 149** em
  có lý do đổi tờ khai (B: 311). So ghép cặp cùng em, cùng lá thăm: khi nửa
  trường tính toán, em khai thật đổi 31,92 → 31,90 NV1, không đổi tỉ lệ trượt.
  Tức là trên thực tế không có gì để gian.
* Vét cạn kiểu "biết hết cả lá thăm": 0,29% (điểm gốc), 0,76% (bỏ 50% điểm).
  Khác 0 — đúng như Định lý 1 của Abdulkadiroğlu, Pathak & Roth (2009).

**Sửa số của chính mình về B:** bản trước nói em khai thật trượt nhiều hơn em
tính toán 1,9 điểm. Con số đó so hai NỬA ngẫu nhiên khác nhau, lẫn khác biệt
thành phần nhóm (ở SIC, nơi gần như không ai đổi tờ khai, hai nửa vẫn lệch 2
điểm NV1). So ghép cặp đúng: khi nửa trường tính toán dưới B, **em khai thật
trượt nhiều hơn chính các em ấy lúc mọi người khai thật 1,14 điểm**
(32,21 → 33,35) và mất 0,95 điểm NV1; em tính toán bớt trượt 1,15 điểm. Kết luận
về B không đổi chiều, nhưng con số đúng là ~1,1 chứ không phải 1,9.

## K5 — Cái giá: "sao em số xấu hơn lại vào được?"

Dưới A, em bốc số tốt luôn được ưu tiên hơn em cùng hạng. SIC phá điều đó:

| Kiểu điểm | Em thấy một em số xấu hơn ở CLB mình muốn |
|---|---|
| điểm gốc | 5,9% |
| làm tròn 1 | 15,3% |
| chỉ 50% em có điểm | 23,1% |

Các em này **không mất gì** so với A (K2: 0 em thiệt) — chỗ đó chỉ trống ra vì
một em khác nhả nó để đổi lấy CLB em ấy thích hơn. Nhưng đó là câu phải giải
thích được với phụ huynh, và lời hứa "số bốc thăm quyết định thứ tự" trong
tài liệu hiện tại không còn đúng nguyên văn.

## Điều gì sẽ làm phán quyết đổi

* Điểm thi gần như không bao giờ hoà và trường thi ở mọi CLB → lợi < 0,5 điểm,
  không đáng thêm độ phức tạp.
* Nhà trường coi "số bốc thăm là luật" quan trọng hơn +0,5 – 2,2 điểm NV1 → giữ A.
* Dữ liệu thật cho thấy ít hoà hơn mô phỏng → lợi nhỏ hơn bảng K2.
* Có suất dự trữ phức tạp hơn bộ dữ liệu → cần kiểm lại K1 có dự trữ (bộ vét
  cạn độc lập hiện chưa có dự trữ).

## Chỗ tôi chưa kiểm được

* Phép tìm chu trình độc lập thứ hai trên dữ liệu thật (thử mọi đổi chỗ 2 và 3
  em) chạy quá chậm và bị dừng; kiểm độc lập chỉ có ở thể hiện nhỏ (K1).
* Mọi số đều trên dữ liệu mô phỏng.
