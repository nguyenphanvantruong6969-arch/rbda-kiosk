# Tầng 2 — nghiên cứu đã công bố nói gì

Câu hỏi: có công trình nào **chứng minh** xếp Tầng 2 theo thứ hạng nguyện vọng (B,
C) hoặc bốc thăm + chu trình cải thiện (SIC) tốt hơn thiết kế hiện tại (A: bốc
thăm một lần dùng chung, Gale–Shapley do học sinh đề xuất) không?

**Trả lời ngắn: không.** Thiết kế hiện tại chính là thứ các tài liệu khuyến nghị
và các thành phố lớn đã chuyển sang. B có ủng hộ *có điều kiện*; SIC được chứng
minh là có lợi nhưng phải đánh đổi tính "khai thật là tốt nhất".

## 1. Ủng hộ A (thiết kế hiện tại)

| Nguồn | Nói gì | Áp dụng cho dự án |
|---|---|---|
| Abdulkadiroğlu, Pathak & Roth (2009), AER 99(5) — NYC | Mô phỏng trên dữ liệu thật và lý thuyết đều *"ủng hộ phá hoà cùng một cách ở mọi trường — single tie breaking — trong DA do học sinh đề xuất"*. | Đúng là A. |
| Abdulkadiroğlu, Pathak, Roth & Sönmez (2006), NBER w11965 — Boston | Dưới cơ chế cũ (ưu tiên theo thứ tự khai), *"nhiều em trượt lẽ ra được xếp nếu khai khác đi"*; có phụ huynh tính toán, có phụ huynh không. Boston chuyển sang DA năm 2005. | Bằng chứng thực tế về chênh lệch em biết mẹo / em ngây thơ — đúng cái giá tôi đo được ở B. |
| Pathak & Sönmez (2013), AER 103(1) — Chicago, Anh | Năm 2007 Bộ luật Tuyển sinh Anh **cấm** tiêu chí "first preference first" (ưu tiên em xếp trường là NV1) ở hơn 150 địa phương. Chicago 2009 bỏ giữa chừng vì *"em điểm cao bị loại chỉ vì thứ tự khai"*. | "First preference first" gần như chính là **phương án C**. Đây là tiền lệ thực tế mạnh nhất chống B/C. |
| Chen & Sönmez (2006), JET 127 — thí nghiệm | Dưới Boston, hơn 80% người chơi khai sai; Gale–Shapley cho hiệu quả cao nhất. | Ưu tiên phụ thuộc thứ tự khai thì người ta khai sai thật, không chỉ trên lý thuyết. |

## 2. Ủng hộ B (có điều kiện) — mâu thuẫn một phần với mô phỏng của tôi

| Nguồn | Nói gì | Giới hạn |
|---|---|---|
| Abdulkadiroğlu, Che & Yasuda (2011), AER 101(1) | Khi mọi em có **cùng thứ tự thích** và trường không có ưu tiên, Boston **trội Pareto** DA về phúc lợi kỳ vọng, và *"có thể có lợi chứ không hại"* cho em không biết tính toán. | Đo bằng mức độ thích (cardinal); mô phỏng của tôi chỉ đo thứ hạng nên không thấy lợi này. Điều kiện "cùng thứ tự thích" không đúng hoàn toàn với dữ liệu kho. **Mâu thuẫn** với kết quả "em ngây thơ thiệt" của tôi. |
| Featherstone & Niederle (2016), GEB 100 — thí nghiệm | Môi trường nguyện vọng không tương quan: Boston cho 50,7% NV1 so với DA 30,3% (bốc thăm nhiều lần), tỉ lệ khai thật gần nhau (58% / 66%). Môi trường nguyện vọng giống nhau: em trung bình khai thật chỉ 1,4% dưới Boston. | Hai chiều: B tốt khi sở thích phân tán, sụp khi ai cũng thích cùng vài CLB — tức là CLB "hot" của trường. |
| Abdulkadiroğlu, Che & Yasuda (2015), AEJ: Micro — CADA | DA không cho em nói *mức độ* thích; CADA giữ danh sách khai thật mà vẫn tăng hiệu quả. | Lợi đến từ mức độ thích; dữ liệu chỉ có thứ hạng không đo được, nên trong mô phỏng CADA ≈ C. |

## 3. SIC — chứng minh có lợi, nhưng có giá

| Nguồn | Nói gì |
|---|---|
| Erdil & Ergin (2008), AER 98(3) | Phá hoà ngẫu nhiên gây lãng phí; chu trình cải thiện ổn định lấy lại được mà vẫn ổn định. |
| Abdulkadiroğlu, Pathak & Roth (2009) | NYC: trung bình **1 487,5 em** được trường tốt hơn nếu chạy SIC sau DA-STB. **Định lý 1:** *"với mọi cách phá hoà, không có cơ chế nào vừa khai thật là tốt nhất vừa trội DA"* — tức SIC chắc chắn khai gian được ở một số trường hợp. |

Khớp với mô phỏng: SIC +0,46 điểm NV1, khai gian được 0,3% (Đ3 trong
`TANG2_PHAN_BIEN.md`) — nhỏ nhưng khác 0, đúng như Định lý 1.

## 4. Chỗ nghiên cứu làm yếu giả định của tôi

* Hassidim, Romm & Shorrer — tuyển sinh sau đại học ngành tâm lý ở Israel (DA,
  đã được báo nhiều lần là khai thật an toàn): **hơn 19%** (137/704) danh sách
  vẫn khai sai. Mô phỏng của tôi coi mọi em dưới A đều khai thật; thực tế không.
  Khác biệt: dưới A khai sai chỉ hại chính em đó, dưới B nó còn có lợi.
* Chen & Sönmez (2006): ngay dưới Gale–Shapley chỉ 56–72% khai thật trong phòng
  thí nghiệm.

## Kết luận

1. Không công trình nào chứng minh B hay SIC tốt hơn A **nói chung**. A (DA + một
   lần bốc thăm) là chuẩn được khuyến nghị và được Boston, NYC áp dụng.
2. Quy tắc gần B/C nhất ("first preference first") đã **bị cấm ở Anh năm 2007**.
3. B có ủng hộ lý thuyết khi sở thích phân tán và khi đo mức độ thích — điều kiện
   mà một trường có vài CLB "hot" thường không thoả.
4. SIC là cải tiến duy nhất có chứng minh, và giá của nó (mất tính khai thật an
   toàn tuyệt đối) cũng đã được chứng minh.

## Nguồn

* Abdulkadiroğlu, Pathak & Roth (2009) — https://www.nber.org/papers/w14864
* Abdulkadiroğlu, Pathak, Roth & Sönmez (2006) — https://www.nber.org/papers/w11965
* Pathak & Sönmez (2013) — https://www.nber.org/papers/w16783
* Chen & Sönmez (2006) — https://mail.yanchen.people.si.umich.edu/published/Chen_Sonmez_JET_2006.pdf
* Abdulkadiroğlu, Che & Yasuda (2011) — https://ideas.repec.org/a/aea/aecrev/v101y2011i1p399-410.html
* Featherstone & Niederle (2016) — https://web.stanford.edu/~niederle/Featherstone.Niederle.GEB.2016.pdf
* Abdulkadiroğlu, Che & Yasuda (2015) — https://scholars.duke.edu/publication/859216
* Hassidim, Romm & Shorrer — https://ideas.repec.org/p/qsh/wpaper/413411.html
* Erdil & Ergin (2008), "What's the Matter with Tie-Breaking?", AER 98(3)
