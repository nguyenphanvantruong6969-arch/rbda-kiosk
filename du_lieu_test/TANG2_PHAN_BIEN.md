# Tầng 2 — tự phản biện: khi học sinh không biết số bốc thăm

> Dữ liệu MÔ PHỎNG của kho, không phải học sinh có thật.
> Chạy lại (~30 phút, 4 lõi): `python3 du_lieu_test/do_tang2_mo_rong.py`
> Số liệu: `so_lieu_tang2_mo_rong.json`. Bản trước: `TANG2_BOC_THAM_HAY_NGUYEN_VONG.md`.

## Vì sao phải đo lại

Bản trước kết luận "giữ bốc thăm" dựa trên một phép dò khai gian giả định học
sinh **biết hết**: biết tờ khai của mọi em khác *và* biết trước số bốc thăm của
mình. Học sinh thật không biết số bốc thăm. Con số 8,29% ở bản trước còn đo trên
thể hiện mà tôi tự bỏ 50% điểm thi đi để Tầng 2 đông hơn — tức là tôi đã tự chọn
điều kiện làm phương án B trông xấu nhất. Tệp này sửa cả hai chỗ.

**Khai gian** ở đây = ghi danh sách nguyện vọng KHÁC với thứ tự mình thật sự
thích (đẩy CLB "chắc đỗ" lên NV1, hoặc chỉ ghi một CLB) để được xếp tốt hơn.
Không phải gian lận theo nghĩa đạo đức — đó là chiến thuật hợp lệ trên tờ khai.

## Năm phương án (Tầng 1 và suất dự trữ giữ nguyên ở mọi phương án)

| | Tầng 2 sắp theo |
|---|---|
| **A** | số bốc thăm (phần mềm đang chạy) |
| **B** | thứ hạng em xếp CLB đó, bốc thăm phá hoà |
| **C** | em xếp CLB đó là NV1 trước, còn lại bốc thăm |
| **CADA** | em chọn CLB đó làm "CLB mục tiêu" (một ô riêng, tách khỏi danh sách) trước, còn lại bốc thăm — Abdulkadiroğlu, Che & Yasuda 2015 |
| **SIC** | chạy A, rồi cho các em đổi chỗ vòng tròn khi ai cũng được CLB thích hơn mà không ai bị oan theo điểm thi / dự trữ — Erdil & Ergin 2008 |

28 thị trường (bộ × buổi), 4 149 em, 20 bộ số bốc thăm mỗi thị trường.

## Đ1. Nếu mọi em khai thật

| | A | B | C | CADA | SIC |
|---|---|---|---|---|---|
| Được NV1 (% mọi em) | 30,43 | **32,75** | 32,72 | 32,72 | 30,89 |
| Được NV1–3 | 51,44 | **51,81** | 51,59 | 51,59 | 51,65 |
| Hạng TB (em được xếp) | 2,676 | **2,610** | 2,632 | 2,632 | 2,651 |
| Không có CLB | 32,45 | 32,43 | 32,43 | 32,43 | 32,45 |
| Em có kết cục đổi theo lần bốc thăm | 1 249 | **951** | 1 037 | 1 037 | 1 230 |

Phản biện chính mình: **khi khai thật, B tốt hơn A thật**. Chuyển A → B: 456 em
tăng xác suất được NV1, chỉ 13 em giảm. B còn làm 24% ít em phải phó mặc cho lá
thăm hơn. Bản trước nói "+3,5 điểm không có thật" là nói quá.

## Đ2. Nếu một phần em "tính toán" (biết CLB nào hot, KHÔNG biết số bốc thăm)

Mỗi em thử ~3L cách khai (đẩy một CLB lên đầu, chỉ ghi một CLB, đổi chỗ liền kề,
cắt ngắn) và giữ cách cho hạng thật kỳ vọng tốt nhất trên 6 lá thăm tưởng tượng.
Hoà thì giữ khai thật.

**Chỉ 311 / 4 149 em (7,5%) có lý do đổi tờ khai dưới B.** 92,5% còn lại khai
thật vẫn là tốt nhất — nên nhận định "đa số sẽ khai thật" là đúng.

Kết cục theo nguyện vọng THẬT, phương án B:

| Tỉ lệ em tính toán | Nhóm | NV1 | NV1–3 | Không có CLB |
|---|---|---|---|---|
| 0% | mọi em | 32,75 | 51,81 | 32,43 |
| 50% | em tính toán | 30,00 | 52,32 | **31,49** |
| 50% | em khai thật | 32,80 | 50,87 | **33,37** |
| 100% | mọi em | 30,66 | 51,55 | 32,45 |
| *(A, mọi trường hợp)* | *mọi em* | *30,43* | *51,44* | *32,45* |

Đọc bảng:
* Em tính toán đổi NV1 lấy chỗ chắc: ít NV1 hơn nhưng ít trượt hơn.
* Ở mức 50%, em khai thật **trượt nhiều hơn em tính toán 1,9 điểm**, và nhiều
  hơn chính em đó dưới A 0,9 điểm. Đây là cái giá thật của B: bất công giữa em
  "biết mẹo" và em ngây thơ, không phải tổng phúc lợi.
* Khi **mọi em** đều tính toán, B ≈ A (30,66 so với 30,43 NV1). Cái lợi của B
  chỉ tồn tại chừng nào phần lớn em còn khai thật.
* C và CADA cho số gần như trùng B ở mọi dòng.

## Đ3. Ba phương án mới có thoát được không?

Dò vét cạn (biết hết, mọi hoán vị) trên 150 thể hiện nhỏ — đây là cận TRÊN của
khả năng khai gian:

| | giữ 100% điểm | giữ 50% điểm |
|---|---|---|
| A | 0 / 1 050 | 0 / 1 050 |
| B | 27 (2,57%) | 83 (7,90%) |
| C | 27 (2,57%) | 90 (8,57%) |
| CADA — sửa danh sách | **0** | **0** |
| CADA — sửa CLB mục tiêu | 27 (2,57%) | 90 (8,57%) |
| SIC | 3 (0,29%) | 4 (0,38%) |

* **C** không thoát: chỉ thưởng NV1 vẫn đủ để mở kênh khai gian.
* **CADA** giữ được danh sách an toàn (0, đúng lý thuyết), nhưng kênh khai gian
  chuyển sang ô "CLB mục tiêu" — với số y hệt C. Lợi ích lý thuyết của CADA đến
  từ *mức độ* thích (cardinal), thứ mà dữ liệu chỉ có thứ hạng của kho không đo
  được; nên ở đây CADA không hơn C.
* **SIC** gần như không khai gian được (0,3%, và đây là em biết hết), giữ 0 cặp
  phá vỡ theo điểm thi / dự trữ (0 vi phạm trên 560 lần chạy), nhưng lợi nhỏ:
  +0,46 điểm NV1. Lần chạy đầu tôi viết sai điều kiện chu trình và SIC ra đúng
  bằng A; đã sửa và kiểm trên ví dụ tay trước khi đo lại.

## Đ4. Độ nhạy theo tỉ lệ em đi thi (khai thật)

Bỏ ngẫu nhiên một phần điểm thi để Tầng 2 đông lên:

| Giữ điểm | A NV1 | B NV1 | CADA NV1 | SIC NV1 |
|---|---|---|---|---|
| 100% | 30,45 | 32,81 (+2,4) | 32,76 | 30,85 (+0,4) |
| 50% | 30,14 | 35,62 (+5,5) | 34,85 | 32,41 (+2,3) |
| 0% | 43,85 | 52,50 (+8,7) | 52,50 | 43,90 (+0,05) |

Trường càng ít CLB thi, B càng lợi — nhưng kênh khai gian cũng rộng theo
(2,57% → 7,90%). Không có điểm thi nào thì SIC hết tác dụng: mọi em cùng một hàng
bốc thăm, không còn chu trình nào để đổi.

## Kết luận đã sửa

1. **Bản trước nói quá.** B không phải "cái lợi giả". Khi khai thật nó hơn A
   rõ rệt và hầu như không ai thiệt; khi mọi em tính toán nó lùi về ngang A —
   **không có kịch bản nào đo được mà B kém A về tổng thể**.
2. **Cái giá thật của B là công bằng giữa các em, không phải tổng phúc lợi:** em
   biết mẹo ít trượt hơn em khai thật ~1,9 điểm. Và phần mềm mất lời hứa "khai
   thật luôn là an toàn nhất" (đang in trên poster: 0/1 400).
3. **Lựa chọn là lựa chọn giá trị, không phải lựa chọn kỹ thuật:**
   * Ưu tiên "không ai bị thiệt vì ngây thơ" → giữ **A**, có thể thêm **SIC**
     (+0,5 tới +2,3 điểm NV1, gần như không khai gian được, giải thích khó hơn).
   * Ưu tiên "nhiều em được CLB mình thích nhất" và chấp nhận chênh ~2 điểm cho
     em biết mẹo → **B**, phải gỡ ràng buộc chống nội sinh ở
     `rbda_priority_pipeline.py:138` và sửa câu trên poster.
   * C và CADA không đáng thêm độ phức tạp: số gần như trùng B.

## Giới hạn — chỗ tôi còn nghi chính phép đo này

* Dữ liệu mô phỏng: nguyện vọng sinh theo "độ hút" chung của CLB cộng ngẫu
  nhiên. Trường thật có thể có nguyện vọng tương quan theo nhóm bạn, khối lớp.
* Em tính toán là "cấp 1": phản ứng với một quần thể khai thật, một vòng. Nếu
  em tính toán cũng biết em khác tính toán, cân bằng có thể khác.
* Lợi ích đo bằng hạng (ordinal). Nếu một em thích CLB NV1 *rất nhiều* so với
  NV2, B và CADA có lợi mà bảng này không thấy.
* 6 lá thăm "niềm tin", 20 lá thăm đánh giá, 150 thể hiện vét cạn — đủ cho chiều
  hướng, chưa đủ cho chữ số thập phân thứ hai.

## Tham khảo

* Pathak & Sönmez (2008), *Leveling the Playing Field: Sincere and Sophisticated
  Players in the Boston Mechanism*, AER 98(4) — cùng hiện tượng em ngây thơ thiệt.
* Abdulkadiroğlu, Che & Yasuda (2015), *Expanding "Choice" in School Choice*,
  AEJ: Micro — CADA.
* Erdil & Ergin (2008), *What's the Matter with Tie-Breaking?*, AER 98(3) — SIC.
