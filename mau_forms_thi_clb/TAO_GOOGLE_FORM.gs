/**
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
 *
 * Chấm điểm theo từng CLB (sau khi học sinh nộp):
 *   Chọn hàm chamTheoCLB, bấm Chạy. Hàm tạo một bảng tính mới có điểm từng
 *   CLB và các trang sẵn để nạp vào phần mềm xếp CLB. Đường dẫn bảng tính
 *   nằm trong "Nhật ký thực thi".
 *   Nếu biểu mẫu được tạo bằng bản mã cũ (trước khi có hàm này), dán đường
 *   dẫn SỬA biểu mẫu vào LINK_BIEU_MAU bên dưới trước khi chạy.
 */

// Để trống nếu biểu mẫu được tạo bằng chính dự án này sau khi có hàm chamTheoCLB.
const LINK_BIEU_MAU = '';

const DIEM_CAU = 5;
const TRAN_THI = 5;
const CO_BUOI = "Có";
const KHONG_BUOI = "Không, em bận buổi này";
const CO = "Có, em thi CLB này";
const KHONG = "Không";
const DUNG = "Em không thi thêm CLB nào buổi này";

// [{ma, ten, clubs: [{id, name, de: [{q, opts, dung}]}]}]
const BUOI = [
 {
  "ma": "thu_2",
  "ten": "Thứ Hai",
  "clubs": [
   {
    "id": "clb_covua",
    "name": "CLB Cờ vua",
    "de": [
     {
      "q": "Quân nào đi theo hình chữ L?",
      "opts": [
       "Xe",
       "Hậu",
       "Tượng",
       "Mã"
      ],
      "dung": "Mã"
     },
     {
      "q": "Muốn nhập thành thì cần điều kiện nào?",
      "opts": [
       "Xe đã di chuyển trước đó",
       "Vua đang bị chiếu",
       "Vua chưa từng di chuyển",
       "Có quân đứng giữa Vua và Xe"
      ],
      "dung": "Vua chưa từng di chuyển"
     }
    ]
   },
   {
    "id": "clb_vanhoc",
    "name": "CLB Văn học",
    "de": [
     {
      "q": "Truyện Kiều là tác phẩm của ai?",
      "opts": [
       "Nguyễn Du",
       "Nguyễn Trãi",
       "Nguyễn Đình Chiểu",
       "Hồ Xuân Hương"
      ],
      "dung": "Nguyễn Du"
     },
     {
      "q": "Câu “Mặt trời xuống biển như hòn lửa” dùng biện pháp tu từ nào?",
      "opts": [
       "Ẩn dụ",
       "Nói quá",
       "Hoán dụ",
       "So sánh"
      ],
      "dung": "So sánh"
     }
    ]
   },
   {
    "id": "clb_nhiepanh",
    "name": "CLB Nhiếp ảnh",
    "de": [
     {
      "q": "Số khẩu độ nhỏ (ví dụ f/1.8) nghĩa là gì?",
      "opts": [
       "Máy chụp liên tục",
       "Lỗ mở nhỏ, ít ánh sáng vào",
       "Lỗ mở lớn, nhiều ánh sáng vào",
       "Ảnh sẽ thành đen trắng"
      ],
      "dung": "Lỗ mở lớn, nhiều ánh sáng vào"
     },
     {
      "q": "Quy tắc một phần ba giúp bức ảnh thế nào?",
      "opts": [
       "Ảnh có dung lượng nhỏ hơn",
       "Pin dùng lâu hơn",
       "Ảnh sáng hơn",
       "Bố cục cân đối và dễ nhìn"
      ],
      "dung": "Bố cục cân đối và dễ nhìn"
     }
    ]
   },
   {
    "id": "clb_caulong",
    "name": "CLB Cầu lông",
    "de": [
     {
      "q": "Một ván cầu lông thường chơi tới bao nhiêu điểm?",
      "opts": [
       "11",
       "15",
       "25",
       "21"
      ],
      "dung": "21"
     },
     {
      "q": "Quả cầu lông thi đấu thường làm từ lông gì?",
      "opts": [
       "Lông cừu",
       "Lông gà",
       "Lông ngỗng hoặc lông vịt",
       "Lông công"
      ],
      "dung": "Lông ngỗng hoặc lông vịt"
     }
    ]
   },
   {
    "id": "clb_hungbien",
    "name": "CLB Hùng biện",
    "de": [
     {
      "q": "Mở đầu bài nói nên làm gì?",
      "opts": [
       "Đọc nguyên văn tờ giấy",
       "Xin lỗi vì mình nói kém",
       "Nói thật nhanh cho xong",
       "Gây chú ý và nêu chủ đề"
      ],
      "dung": "Gây chú ý và nêu chủ đề"
     },
     {
      "q": "Khi nói trước đông người nên nhìn vào đâu?",
      "opts": [
       "Nhìn người nghe",
       "Nhắm mắt lại",
       "Nhìn lên trần nhà",
       "Nhìn xuống sàn"
      ],
      "dung": "Nhìn người nghe"
     }
    ]
   },
   {
    "id": "clb_sinhhoc",
    "name": "CLB Sinh học",
    "de": [
     {
      "q": "Bộ phận nào của tế bào chứa vật chất di truyền?",
      "opts": [
       "Màng tế bào",
       "Thành tế bào",
       "Nhân tế bào",
       "Không bào"
      ],
      "dung": "Nhân tế bào"
     },
     {
      "q": "Hồng cầu có nhiệm vụ chính là gì?",
      "opts": [
       "Vận chuyển oxy",
       "Làm đông máu",
       "Tiêu hoá thức ăn",
       "Chống vi khuẩn"
      ],
      "dung": "Vận chuyển oxy"
     }
    ]
   },
   {
    "id": "clb_guitar",
    "name": "CLB Guitar",
    "de": [
     {
      "q": "Đàn guitar thông thường có mấy dây?",
      "opts": [
       "4",
       "12",
       "6",
       "7"
      ],
      "dung": "6"
     },
     {
      "q": "Hợp âm Đô trưởng được ký hiệu là gì?",
      "opts": [
       "G",
       "A",
       "D",
       "C"
      ],
      "dung": "C"
     }
    ]
   },
   {
    "id": "clb_baochi",
    "name": "CLB Báo chí",
    "de": [
     {
      "q": "Trước khi đăng một tin, việc cần làm đầu tiên là gì?",
      "opts": [
       "Kiểm tra lại nguồn tin",
       "Xoá tên nguồn tin",
       "Thêm chi tiết cho hấp dẫn",
       "Đăng ngay cho nhanh"
      ],
      "dung": "Kiểm tra lại nguồn tin"
     },
     {
      "q": "Một bản tin tốt phải trả lời được những câu nào?",
      "opts": [
       "Ai, cái gì, ở đâu, khi nào, vì sao, như thế nào",
       "Chỉ cần trả lời ai",
       "Chỉ cần trả lời khi nào",
       "Không cần trả lời câu nào"
      ],
      "dung": "Ai, cái gì, ở đâu, khi nào, vì sao, như thế nào"
     }
    ]
   },
   {
    "id": "clb_truyentranh",
    "name": "CLB Vẽ truyện tranh",
    "de": [
     {
      "q": "Ô chứa lời nói của nhân vật trong truyện tranh gọi là gì?",
      "opts": [
       "Mục lục",
       "Khung tranh",
       "Trang bìa",
       "Bóng thoại"
      ],
      "dung": "Bóng thoại"
     },
     {
      "q": "Truyện tranh Nhật Bản thường được gọi là gì?",
      "opts": [
       "Ngụ ngôn",
       "Comic",
       "Manhwa",
       "Manga"
      ],
      "dung": "Manga"
     }
    ]
   },
   {
    "id": "clb_boiloi",
    "name": "CLB Bơi lội",
    "de": [
     {
      "q": "Kiểu bơi nào nằm ngửa trên mặt nước?",
      "opts": [
       "Bơi bướm",
       "Bơi ếch",
       "Bơi ngửa",
       "Bơi sải"
      ],
      "dung": "Bơi ngửa"
     },
     {
      "q": "Trước khi xuống nước nên làm gì?",
      "opts": [
       "Chạy quanh hồ bơi",
       "Ăn thật no",
       "Nhảy xuống ngay",
       "Khởi động kỹ"
      ],
      "dung": "Khởi động kỹ"
     }
    ]
   }
  ]
 },
 {
  "ma": "thu_3",
  "ten": "Thứ Ba",
  "clubs": [
   {
    "id": "clb_tienganh",
    "name": "CLB Tiếng Anh",
    "de": [
     {
      "q": "She ___ to school every day.",
      "opts": [
       "goes",
       "going",
       "go",
       "gone"
      ],
      "dung": "goes"
     },
     {
      "q": "Từ trái nghĩa với “ancient” là gì?",
      "opts": [
       "old",
       "modern",
       "huge",
       "quiet"
      ],
      "dung": "modern"
     }
    ]
   },
   {
    "id": "clb_mythuat",
    "name": "CLB Mỹ thuật",
    "de": [
     {
      "q": "Ba màu cơ bản trong hội hoạ truyền thống là gì?",
      "opts": [
       "Đỏ, vàng, lam",
       "Đen, trắng, xám",
       "Cam, tím, lục",
       "Đỏ, lục, lam"
      ],
      "dung": "Đỏ, vàng, lam"
     },
     {
      "q": "Màu bổ túc của màu đỏ là màu nào?",
      "opts": [
       "Lục",
       "Vàng",
       "Cam",
       "Tím"
      ],
      "dung": "Lục"
     }
    ]
   },
   {
    "id": "clb_bongda",
    "name": "CLB Bóng đá",
    "de": [
     {
      "q": "Mỗi đội bóng đá có bao nhiêu cầu thủ trên sân?",
      "opts": [
       "9",
       "10",
       "11",
       "12"
      ],
      "dung": "11"
     },
     {
      "q": "Cầu thủ nhận thẻ đỏ thì sao?",
      "opts": [
       "Chỉ bị nhắc nhở",
       "Được đá phạt",
       "Phải rời sân, không được thi đấu tiếp",
       "Được nghỉ giữa hiệp"
      ],
      "dung": "Phải rời sân, không được thi đấu tiếp"
     }
    ]
   },
   {
    "id": "clb_tiengnhat",
    "name": "CLB Tiếng Nhật",
    "de": [
     {
      "q": "Bảng chữ Hiragana dùng cho tiếng nước nào?",
      "opts": [
       "Tiếng Nhật",
       "Tiếng Hàn",
       "Tiếng Trung",
       "Tiếng Thái"
      ],
      "dung": "Tiếng Nhật"
     },
     {
      "q": "“Arigatou” nghĩa là gì?",
      "opts": [
       "Cảm ơn",
       "Xin chào",
       "Tạm biệt",
       "Xin lỗi"
      ],
      "dung": "Cảm ơn"
     }
    ]
   },
   {
    "id": "clb_kich",
    "name": "CLB Kịch",
    "de": [
     {
      "q": "Nhân vật nói một mình để bộc lộ suy nghĩ gọi là gì?",
      "opts": [
       "Độc thoại",
       "Phụ đề",
       "Đối thoại",
       "Lời dẫn chuyện"
      ],
      "dung": "Độc thoại"
     },
     {
      "q": "Ai là người chỉ đạo diễn viên trong một vở kịch?",
      "opts": [
       "Khán giả",
       "Đạo diễn",
       "Nhạc công",
       "Người soát vé"
      ],
      "dung": "Đạo diễn"
     }
    ]
   },
   {
    "id": "clb_hoahoc",
    "name": "CLB Hoá học",
    "de": [
     {
      "q": "Công thức hoá học của nước là gì?",
      "opts": [
       "CO2",
       "NaCl",
       "H2O",
       "O2"
      ],
      "dung": "H2O"
     },
     {
      "q": "Dung dịch có độ pH nhỏ hơn 7 là loại gì?",
      "opts": [
       "Nước cất",
       "Axit",
       "Bazơ",
       "Trung tính"
      ],
      "dung": "Axit"
     }
    ]
   },
   {
    "id": "clb_nauan",
    "name": "CLB Nấu ăn",
    "de": [
     {
      "q": "Vì sao phải rửa tay trước khi nấu ăn?",
      "opts": [
       "Không cần rửa tay",
       "Để giữ vệ sinh, an toàn thực phẩm",
       "Để tay đẹp hơn",
       "Để nấu nhanh hơn"
      ],
      "dung": "Để giữ vệ sinh, an toàn thực phẩm"
     },
     {
      "q": "Thịt sống và đồ ăn chín nên để thế nào?",
      "opts": [
       "Để riêng, dùng thớt riêng",
       "Rửa chung một chậu",
       "Để chung một thớt",
       "Trộn lẫn với nhau"
      ],
      "dung": "Để riêng, dùng thớt riêng"
     }
    ]
   },
   {
    "id": "clb_thietke",
    "name": "CLB Thiết kế đồ hoạ",
    "de": [
     {
      "q": "Hệ màu dùng cho màn hình máy tính là gì?",
      "opts": [
       "CMYK",
       "Pantone",
       "Đen trắng",
       "RGB"
      ],
      "dung": "RGB"
     },
     {
      "q": "Ảnh vector khác ảnh thường ở điểm nào?",
      "opts": [
       "Không in ra được",
       "Luôn có nhiều màu hơn",
       "Chỉ có hai màu",
       "Phóng to không bị vỡ hình"
      ],
      "dung": "Phóng to không bị vỡ hình"
     }
    ]
   },
   {
    "id": "clb_cotuong",
    "name": "CLB Cờ tướng",
    "de": [
     {
      "q": "Quân Tượng trong cờ tướng có được qua sông không?",
      "opts": [
       "Có",
       "Chỉ khi ăn quân",
       "Không",
       "Chỉ ở nước đi đầu"
      ],
      "dung": "Không"
     },
     {
      "q": "Quân Mã bị cản khi nào?",
      "opts": [
       "Khi gặp quân Tướng",
       "Khi đi qua sông",
       "Có quân đứng sát ngay hướng đi",
       "Có quân ở cuối đường đi"
      ],
      "dung": "Có quân đứng sát ngay hướng đi"
     }
    ]
   },
   {
    "id": "clb_mua",
    "name": "CLB Múa",
    "de": [
     {
      "q": "Múa sạp là điệu múa nổi tiếng của dân tộc nào?",
      "opts": [
       "Dân tộc Khmer",
       "Dân tộc Thái",
       "Dân tộc Hoa",
       "Dân tộc Chăm"
      ],
      "dung": "Dân tộc Thái"
     },
     {
      "q": "Khởi động trước khi tập múa giúp gì?",
      "opts": [
       "Tránh chấn thương",
       "Mệt nhanh hơn",
       "Dễ quên động tác",
       "Không có tác dụng"
      ],
      "dung": "Tránh chấn thương"
     }
    ]
   }
  ]
 },
 {
  "ma": "thu_4",
  "ten": "Thứ Tư",
  "clubs": [
   {
    "id": "clb_robotics",
    "name": "CLB Robotics",
    "de": [
     {
      "q": "Cảm biến siêu âm trên robot dùng để làm gì?",
      "opts": [
       "Đo độ ẩm",
       "Đo nhiệt độ",
       "Đo khoảng cách",
       "Nhận biết màu"
      ],
      "dung": "Đo khoảng cách"
     },
     {
      "q": "Vòng lặp trong lập trình dùng để làm gì?",
      "opts": [
       "Nối dây điện",
       "Dừng chương trình",
       "Xoá biến",
       "Lặp lại một nhóm lệnh"
      ],
      "dung": "Lặp lại một nhóm lệnh"
     }
    ]
   },
   {
    "id": "clb_khoahoc",
    "name": "CLB Khoa học",
    "de": [
     {
      "q": "Ở áp suất tiêu chuẩn, nước sôi ở bao nhiêu độ C?",
      "opts": [
       "100",
       "50",
       "90",
       "0"
      ],
      "dung": "100"
     },
     {
      "q": "Cây xanh tạo chất hữu cơ nhờ ánh sáng qua quá trình nào?",
      "opts": [
       "Hô hấp",
       "Quang hợp",
       "Thoát hơi nước",
       "Lên men"
      ],
      "dung": "Quang hợp"
     }
    ]
   },
   {
    "id": "clb_kynang",
    "name": "CLB Kỹ năng sống",
    "de": [
     {
      "q": "Số điện thoại gọi cứu hoả ở Việt Nam là số nào?",
      "opts": [
       "113",
       "114",
       "115",
       "111"
      ],
      "dung": "114"
     },
     {
      "q": "Bị lạc ở nơi đông người, em nên làm gì?",
      "opts": [
       "Đi theo người lạ",
       "Đứng yên ở chỗ dễ thấy và nhờ người có trách nhiệm",
       "Chạy khắp nơi để tìm",
       "Ngồi khóc và chờ"
      ],
      "dung": "Đứng yên ở chỗ dễ thấy và nhờ người có trách nhiệm"
     }
    ]
   },
   {
    "id": "clb_thienvan",
    "name": "CLB Thiên văn",
    "de": [
     {
      "q": "Hành tinh nào gần Mặt Trời nhất?",
      "opts": [
       "Sao Thuỷ",
       "Trái Đất",
       "Sao Kim",
       "Sao Hoả"
      ],
      "dung": "Sao Thuỷ"
     },
     {
      "q": "Trái Đất quay một vòng quanh Mặt Trời mất khoảng bao lâu?",
      "opts": [
       "Một năm",
       "Mười năm",
       "Một tháng",
       "Một ngày"
      ],
      "dung": "Một năm"
     }
    ]
   },
   {
    "id": "clb_dialy",
    "name": "CLB Địa lý",
    "de": [
     {
      "q": "Đỉnh núi cao nhất Việt Nam là đỉnh nào?",
      "opts": [
       "Bà Đen",
       "Lang Biang",
       "Fansipan",
       "Tây Côn Lĩnh"
      ],
      "dung": "Fansipan"
     },
     {
      "q": "Đường xích đạo chia Trái Đất thành hai phần nào?",
      "opts": [
       "Lục địa và đại dương",
       "Ngày và đêm",
       "Bán cầu Bắc và bán cầu Nam",
       "Bán cầu Đông và bán cầu Tây"
      ],
      "dung": "Bán cầu Bắc và bán cầu Nam"
     }
    ]
   },
   {
    "id": "clb_bongchuyen",
    "name": "CLB Bóng chuyền",
    "de": [
     {
      "q": "Mỗi đội bóng chuyền có mấy người trên sân?",
      "opts": [
       "6",
       "5",
       "7",
       "11"
      ],
      "dung": "6"
     },
     {
      "q": "Một đội được chạm bóng tối đa mấy lần trước khi đưa bóng qua lưới?",
      "opts": [
       "2",
       "3",
       "5",
       "4"
      ],
      "dung": "3"
     }
    ]
   },
   {
    "id": "clb_lamphim",
    "name": "CLB Làm phim",
    "de": [
     {
      "q": "Kịch bản phân cảnh (vẽ trước từng cảnh) dùng để làm gì?",
      "opts": [
       "Chọn nhạc nền",
       "Tính tiền vé",
       "Viết phụ đề",
       "Lên kế hoạch cho từng cảnh quay"
      ],
      "dung": "Lên kế hoạch cho từng cảnh quay"
     },
     {
      "q": "Cảnh quay sát khuôn mặt nhân vật gọi là gì?",
      "opts": [
       "Cận cảnh",
       "Toàn cảnh",
       "Trung cảnh",
       "Viễn cảnh"
      ],
      "dung": "Cận cảnh"
     }
    ]
   },
   {
    "id": "clb_moitruong",
    "name": "CLB Môi trường",
    "de": [
     {
      "q": "Loại rác nào sau đây tái chế được?",
      "opts": [
       "Thức ăn thừa",
       "Chai nhựa đã rửa sạch",
       "Vỏ chuối",
       "Khăn giấy đã dùng"
      ],
      "dung": "Chai nhựa đã rửa sạch"
     },
     {
      "q": "Ngày Môi trường Thế giới là ngày nào?",
      "opts": [
       "22 tháng 4",
       "8 tháng 3",
       "1 tháng 6",
       "5 tháng 6"
      ],
      "dung": "5 tháng 6"
     }
    ]
   },
   {
    "id": "clb_tienghan",
    "name": "CLB Tiếng Hàn",
    "de": [
     {
      "q": "Bảng chữ cái tiếng Hàn gọi là gì?",
      "opts": [
       "Kanji",
       "Hangul",
       "Pinyin",
       "Katakana"
      ],
      "dung": "Hangul"
     },
     {
      "q": "“Annyeonghaseyo” nghĩa là gì?",
      "opts": [
       "Chúc ngủ ngon",
       "Xin chào",
       "Tạm biệt",
       "Cảm ơn"
      ],
      "dung": "Xin chào"
     }
    ]
   },
   {
    "id": "clb_khoinghiep",
    "name": "CLB Khởi nghiệp",
    "de": [
     {
      "q": "Lợi nhuận được tính thế nào?",
      "opts": [
       "Chỉ tính chi phí",
       "Doanh thu cộng chi phí",
       "Doanh thu trừ chi phí",
       "Chỉ tính doanh thu"
      ],
      "dung": "Doanh thu trừ chi phí"
     },
     {
      "q": "Khách hàng mục tiêu là ai?",
      "opts": [
       "Nhà cung cấp",
       "Đối thủ cạnh tranh",
       "Mọi người trên thế giới",
       "Nhóm người mà sản phẩm hướng tới"
      ],
      "dung": "Nhóm người mà sản phẩm hướng tới"
     }
    ]
   }
  ]
 },
 {
  "ma": "thu_5",
  "ten": "Thứ Năm",
  "clubs": [
   {
    "id": "clb_tinhoc",
    "name": "CLB Tin học",
    "de": [
     {
      "q": "1 byte bằng bao nhiêu bit?",
      "opts": [
       "10",
       "16",
       "8",
       "2"
      ],
      "dung": "8"
     },
     {
      "q": "Hệ nhị phân dùng những chữ số nào?",
      "opts": [
       "A đến F",
       "0 và 1",
       "1 và 2",
       "0 đến 9"
      ],
      "dung": "0 và 1"
     }
    ]
   },
   {
    "id": "clb_amnhac",
    "name": "CLB Âm nhạc",
    "de": [
     {
      "q": "Có bao nhiêu tên nốt nhạc cơ bản?",
      "opts": [
       "7",
       "12",
       "5",
       "8"
      ],
      "dung": "7"
     },
     {
      "q": "Một nốt tròn dài bằng mấy nốt đen?",
      "opts": [
       "4",
       "8",
       "1",
       "2"
      ],
      "dung": "4"
     }
    ]
   },
   {
    "id": "clb_tinhnguyen",
    "name": "CLB Tình nguyện",
    "de": [
     {
      "q": "Hoạt động tình nguyện là gì?",
      "opts": [
       "Bài tập bắt buộc có điểm",
       "Hoạt động quảng cáo",
       "Tự nguyện giúp cộng đồng, không nhận tiền công",
       "Làm thêm có lương"
      ],
      "dung": "Tự nguyện giúp cộng đồng, không nhận tiền công"
     },
     {
      "q": "Quyên góp quần áo cũ thì nên làm gì?",
      "opts": [
       "Góp cả đồ đã rách nát",
       "Nhét chung vào một túi",
       "Để nguyên đồ bẩn",
       "Giặt sạch và phân loại trước"
      ],
      "dung": "Giặt sạch và phân loại trước"
     }
    ]
   },
   {
    "id": "clb_vatly",
    "name": "CLB Vật lý",
    "de": [
     {
      "q": "Đơn vị đo điện trở là gì?",
      "opts": [
       "Oát",
       "Vôn",
       "Ôm",
       "Ampe"
      ],
      "dung": "Ôm"
     },
     {
      "q": "Ánh sáng đi nhanh nhất trong môi trường nào?",
      "opts": [
       "Chân không",
       "Kim loại",
       "Nước",
       "Thuỷ tinh"
      ],
      "dung": "Chân không"
     }
    ]
   },
   {
    "id": "clb_hopxuong",
    "name": "CLB Hợp xướng",
    "de": [
     {
      "q": "Giọng nữ cao nhất trong hợp xướng gọi là gì?",
      "opts": [
       "Soprano",
       "Alto",
       "Tenor",
       "Bass"
      ],
      "dung": "Soprano"
     },
     {
      "q": "Giọng nam trầm nhất gọi là gì?",
      "opts": [
       "Tenor",
       "Bass",
       "Alto",
       "Soprano"
      ],
      "dung": "Bass"
     }
    ]
   },
   {
    "id": "clb_tranhbien",
    "name": "CLB Tranh biện",
    "de": [
     {
      "q": "Một lập luận tốt cần có những gì?",
      "opts": [
       "Chỉ cần cảm xúc",
       "Nói thật to",
       "Chê bai người khác",
       "Luận điểm, dẫn chứng và giải thích"
      ],
      "dung": "Luận điểm, dẫn chứng và giải thích"
     },
     {
      "q": "Khi phản bác, em nên nhắm vào đâu?",
      "opts": [
       "Trường của đối phương",
       "Lập luận của đối phương",
       "Ngoại hình đối phương",
       "Giọng nói đối phương"
      ],
      "dung": "Lập luận của đối phương"
     }
    ]
   },
   {
    "id": "clb_vothuat",
    "name": "CLB Võ thuật",
    "de": [
     {
      "q": "Vovinam là võ thuật của nước nào?",
      "opts": [
       "Hàn Quốc",
       "Nhật Bản",
       "Thái Lan",
       "Việt Nam"
      ],
      "dung": "Việt Nam"
     },
     {
      "q": "Karate bắt nguồn từ nước nào?",
      "opts": [
       "Hàn Quốc",
       "Trung Quốc",
       "Brazil",
       "Nhật Bản"
      ],
      "dung": "Nhật Bản"
     }
    ]
   },
   {
    "id": "clb_game",
    "name": "CLB Lập trình game",
    "de": [
     {
      "q": "Scratch là gì?",
      "opts": [
       "Một hệ điều hành",
       "Một trình duyệt web",
       "Công cụ lập trình bằng cách kéo thả khối lệnh",
       "Một máy chơi game"
      ],
      "dung": "Công cụ lập trình bằng cách kéo thả khối lệnh"
     },
     {
      "q": "Biến trong lập trình dùng để làm gì?",
      "opts": [
       "Nối mạng",
       "Lưu một giá trị để dùng lại",
       "Vẽ hình tròn",
       "Tắt máy tính"
      ],
      "dung": "Lưu một giá trị để dùng lại"
     }
    ]
   },
   {
    "id": "clb_sach",
    "name": "CLB Đọc sách",
    "de": [
     {
      "q": "Truyện ngắn “Lão Hạc” là của ai?",
      "opts": [
       "Tô Hoài",
       "Nam Cao",
       "Thạch Lam",
       "Kim Lân"
      ],
      "dung": "Nam Cao"
     },
     {
      "q": "“Dế Mèn phiêu lưu ký” là của ai?",
      "opts": [
       "Xuân Diệu",
       "Tô Hoài",
       "Nam Cao",
       "Nguyễn Nhật Ánh"
      ],
      "dung": "Tô Hoài"
     }
    ]
   },
   {
    "id": "clb_thucong",
    "name": "CLB Thủ công",
    "de": [
     {
      "q": "Nghệ thuật gấp giấy của Nhật Bản gọi là gì?",
      "opts": [
       "Bonsai",
       "Sushi",
       "Ikebana",
       "Origami"
      ],
      "dung": "Origami"
     },
     {
      "q": "Keo nến thường dùng với dụng cụ nào?",
      "opts": [
       "Máy khâu",
       "Thước kẻ",
       "Kéo",
       "Súng bắn keo"
      ],
      "dung": "Súng bắn keo"
     }
    ]
   }
  ]
 },
 {
  "ma": "thu_6",
  "ten": "Thứ Sáu",
  "clubs": [
   {
    "id": "clb_toan",
    "name": "CLB Toán tư duy",
    "de": [
     {
      "q": "Số tiếp theo của dãy 2, 4, 8, 16 là gì?",
      "opts": [
       "18",
       "32",
       "24",
       "20"
      ],
      "dung": "32"
     },
     {
      "q": "Lớp có 30 học sinh, 40% là nữ. Lớp có bao nhiêu bạn nữ?",
      "opts": [
       "18",
       "14",
       "10",
       "12"
      ],
      "dung": "12"
     }
    ]
   },
   {
    "id": "clb_lichsu",
    "name": "CLB Lịch sử",
    "de": [
     {
      "q": "Chiến thắng Điện Biên Phủ diễn ra năm nào?",
      "opts": [
       "1954",
       "1975",
       "1945",
       "1968"
      ],
      "dung": "1954"
     },
     {
      "q": "Ngô Quyền đánh thắng quân Nam Hán trên sông nào?",
      "opts": [
       "Sông Hương",
       "Sông Như Nguyệt",
       "Sông Hồng",
       "Sông Bạch Đằng"
      ],
      "dung": "Sông Bạch Đằng"
     }
    ]
   },
   {
    "id": "clb_bongro",
    "name": "CLB Bóng rổ",
    "de": [
     {
      "q": "Một cú ném từ ngoài vạch ba điểm được mấy điểm?",
      "opts": [
       "3",
       "4",
       "2",
       "1"
      ],
      "dung": "3"
     },
     {
      "q": "Mỗi đội bóng rổ có mấy người trên sân?",
      "opts": [
       "5",
       "11",
       "7",
       "6"
      ],
      "dung": "5"
     }
    ]
   },
   {
    "id": "clb_tiengtrung",
    "name": "CLB Tiếng Trung",
    "de": [
     {
      "q": "Cách ghi âm tiếng Trung bằng chữ cái Latinh gọi là gì?",
      "opts": [
       "Kanji",
       "Romaji",
       "Pinyin",
       "Hangul"
      ],
      "dung": "Pinyin"
     },
     {
      "q": "“Nǐ hǎo” nghĩa là gì?",
      "opts": [
       "Xin chào",
       "Cảm ơn",
       "Tạm biệt",
       "Xin lỗi"
      ],
      "dung": "Xin chào"
     }
    ]
   },
   {
    "id": "clb_socuu",
    "name": "CLB Sơ cứu",
    "de": [
     {
      "q": "Số điện thoại cấp cứu y tế ở Việt Nam là số nào?",
      "opts": [
       "114",
       "115",
       "116",
       "113"
      ],
      "dung": "115"
     },
     {
      "q": "Bị bỏng nhẹ thì nên làm gì trước tiên?",
      "opts": [
       "Bôi kem đánh răng",
       "Chườm đá thật lâu",
       "Chọc vỡ chỗ phồng",
       "Xả nước mát lên chỗ bỏng"
      ],
      "dung": "Xả nước mát lên chỗ bỏng"
     }
    ]
   },
   {
    "id": "clb_kinhte",
    "name": "CLB Kinh tế",
    "de": [
     {
      "q": "Lạm phát là gì?",
      "opts": [
       "Giá cả nói chung tăng lên theo thời gian",
       "Giá cả nói chung giảm xuống",
       "Lương tăng gấp đôi",
       "Ngân hàng đóng cửa"
      ],
      "dung": "Giá cả nói chung tăng lên theo thời gian"
     },
     {
      "q": "Tiết kiệm là gì?",
      "opts": [
       "Để dành một phần tiền kiếm được",
       "Đi vay tiền",
       "Mua thật nhiều đồ",
       "Tiêu hết số tiền có"
      ],
      "dung": "Để dành một phần tiền kiếm được"
     }
    ]
   },
   {
    "id": "clb_dienkinh",
    "name": "CLB Điền kinh",
    "de": [
     {
      "q": "Cự ly chạy ngắn phổ biến nhất là bao nhiêu?",
      "opts": [
       "42 km",
       "10 km",
       "100 m",
       "5 km"
      ],
      "dung": "100 m"
     },
     {
      "q": "Chạy marathon dài khoảng bao nhiêu?",
      "opts": [
       "42 km",
       "10 km",
       "21 km",
       "100 km"
      ],
      "dung": "42 km"
     }
    ]
   },
   {
    "id": "clb_bongban",
    "name": "CLB Bóng bàn",
    "de": [
     {
      "q": "Một ván bóng bàn chơi tới mấy điểm?",
      "opts": [
       "11",
       "15",
       "21",
       "25"
      ],
      "dung": "11"
     },
     {
      "q": "Bóng bàn còn được gọi là gì?",
      "opts": [
       "Bóng ném",
       "Cầu mây",
       "Ping pong",
       "Quần vợt"
      ],
      "dung": "Ping pong"
     }
    ]
   },
   {
    "id": "clb_dangian",
    "name": "CLB Văn hoá dân gian",
    "de": [
     {
      "q": "Tết Trung thu vào ngày nào âm lịch?",
      "opts": [
       "Mùng 5 tháng Năm",
       "Rằm tháng Giêng",
       "Rằm tháng Tám",
       "Mùng 1 tháng Giêng"
      ],
      "dung": "Rằm tháng Tám"
     },
     {
      "q": "Bánh chưng gắn với dịp nào?",
      "opts": [
       "Rằm tháng Bảy",
       "Tết Trung thu",
       "Tết Đoan ngọ",
       "Tết Nguyên đán"
      ],
      "dung": "Tết Nguyên đán"
     }
    ]
   },
   {
    "id": "clb_truyenthong",
    "name": "CLB Truyền thông",
    "de": [
     {
      "q": "Muốn dùng ảnh của người khác thì cần làm gì?",
      "opts": [
       "Đổi màu ảnh là được",
       "Xin phép và ghi nguồn",
       "Cứ dùng, không cần hỏi",
       "Cắt bỏ tên tác giả"
      ],
      "dung": "Xin phép và ghi nguồn"
     },
     {
      "q": "Bài đăng cho trang của trường nên thế nào?",
      "opts": [
       "Đăng tin chưa kiểm tra",
       "Rõ ràng, đúng thông tin, lời lẽ lịch sự",
       "Càng nhiều chữ viết tắt càng tốt",
       "Dùng ảnh mờ cho nhanh"
      ],
      "dung": "Rõ ràng, đúng thông tin, lời lẽ lịch sự"
     }
    ]
   }
  ]
 }
];

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

  PropertiesService.getScriptProperties().setProperty('FORM_ID', form.getId());
  Logger.log('Đường dẫn để SỬA biểu mẫu: ' + form.getEditUrl());
  Logger.log('Đường dẫn gửi HỌC SINH: ' + form.getPublishedUrl());
}

function moBieuMau_() {
  if (LINK_BIEU_MAU) return FormApp.openByUrl(LINK_BIEU_MAU);
  const id = PropertiesService.getScriptProperties().getProperty('FORM_ID');
  if (id) return FormApp.openById(id);
  throw new Error('Chưa biết chấm biểu mẫu nào. Dán đường dẫn SỬA biểu mẫu vào LINK_BIEU_MAU ở đầu tệp rồi chạy lại.');
}

function chuanHoa_(s) {
  return String(s == null ? '' : s).trim().replace(/\s+/g, ' ').toLowerCase();
}

/**
 * Chấm lại mọi phiếu theo đáp án trong BUOI, tách điểm từng CLB (thang 10),
 * và ghi ra một bảng tính mới gồm 4 trang:
 *   Bảng điểm                   mỗi em một dòng, mỗi CLB có thi một cột
 *   02_chon_CLB_muon_thi        tải về dạng CSV để nạp phần mềm
 *   03_xep_hang_nguyen_vong     tải về dạng CSV để nạp phần mềm
 *   Cảnh báo                    phiếu bị bỏ và lý do
 */
function chamTheoCLB() {
  const form = moBieuMau_();
  const phieu = form.getResponses();
  const daCo = {};
  const hocSinh = [];
  const canhBao = [];

  phieu.forEach(function (r, i) {
    const tl = {};
    r.getItemResponses().forEach(function (ir) {
      const m = String(ir.getItem().getTitle()).match(/^\s*\[([^\]]+)\]/);
      if (m) tl[m[1]] = ir.getResponse();
    });
    const sid = String(tl.student_id || '').trim();
    const dong = 'Phiếu thứ ' + (i + 1);
    if (!sid) { canhBao.push([dong, '', 'Không có mã học sinh, bỏ cả phiếu']); return; }
    if (daCo[sid]) {
      canhBao.push([dong, sid, 'Nộp lần nữa. Bỏ phiếu này, giữ phiếu đầu (' + daCo[sid] + ')']);
      return;
    }
    daCo[sid] = dong;

    const hs = {sid: sid, ten: String(tl.name || '').trim(), nv: {}, diem: {}, thi: []};
    BUOI.forEach(function (d) {
      if (tl['di-' + d.ma] !== CO_BUOI) return;
      // Bảng lưới: mỗi dòng (CLB) nhận "Hạng n". Sắp CLB theo hạng.
      const hang = tl[d.ma] || [];
      const xep = d.clubs.map(function (c, k) {
        const n = parseInt(String(hang[k] || '').replace(/\D/g, ''), 10);
        return {id: c.id, n: isNaN(n) ? 99 : n};
      }).sort(function (a, b) { return a.n - b.n; });
      hs.nv[d.ma] = xep.map(function (x) { return x.id; });

      let soThi = 0;
      d.clubs.forEach(function (c) {
        if (tl['thi-' + c.id] !== CO) return;
        soThi++;
        let dung = 0;
        c.de.forEach(function (q, j) {
          if (chuanHoa_(tl[c.id + '-' + (j + 1)]) === chuanHoa_(q.dung)) dung++;
        });
        hs.diem[c.id] = dung * DIEM_CAU;
        hs.thi.push(c.id);
      });
      if (soThi > TRAN_THI) {
        canhBao.push([dong, sid, d.ten + ': thi ' + soThi + ' CLB, quá ' + TRAN_THI + '. Phần mềm sẽ bỏ cả buổi này.']);
      }
    });
    hocSinh.push(hs);
  });

  const ss = SpreadsheetApp.create('Chấm theo CLB ' + Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd HH:mm'));

  // Bảng điểm
  const coThi = [];
  BUOI.forEach(function (d) { d.clubs.forEach(function (c) { if (c.de.length) coThi.push(c); }); });
  const bang = [['Mã HS', 'Họ tên'].concat(coThi.map(function (c) { return c.name; })).concat(['Số CLB đã thi'])];
  hocSinh.forEach(function (h) {
    bang.push([h.sid, h.ten].concat(coThi.map(function (c) {
      return h.diem.hasOwnProperty(c.id) ? h.diem[c.id] : '';
    })).concat([h.thi.length]));
  });
  ghiTrang_(ss.getSheets()[0].setName('Bảng điểm'), bang);

  // 02: CLB dự thi và điểm
  const soCap = Math.max.apply(null, [1].concat(hocSinh.map(function (h) { return h.thi.length; })));
  const t2 = ['student_id', 'name', 'reserve_group'];
  for (let i = 1; i <= soCap; i++) t2.push('test_club_' + i, 'score_' + i);
  const f2 = [t2].concat(hocSinh.map(function (h) {
    const row = [h.sid, h.ten, ''];
    h.thi.forEach(function (id) { row.push(id, h.diem[id]); });
    while (row.length < t2.length) row.push('');
    return row;
  }));
  ghiTrang_(ss.insertSheet('02_chon_CLB_muon_thi'), f2);

  // 03: nguyện vọng theo buổi
  const t3 = ['student_id', 'name', 'reserve_group'];
  BUOI.forEach(function (d) { d.clubs.forEach(function (_, i) { t3.push(d.ma + '_pref_' + (i + 1)); }); });
  const f3 = [t3].concat(hocSinh.map(function (h) {
    const row = [h.sid, h.ten, ''];
    BUOI.forEach(function (d) {
      const nv = h.nv[d.ma] || [];
      d.clubs.forEach(function (_, i) { row.push(nv[i] || ''); });
    });
    return row;
  }));
  ghiTrang_(ss.insertSheet('03_xep_hang_nguyen_vong'), f3);

  ghiTrang_(ss.insertSheet('Cảnh báo'),
      [['Phiếu', 'Mã HS', 'Nội dung']].concat(canhBao.length ? canhBao : [['', '', 'Không có cảnh báo nào.']]));

  Logger.log('Đã chấm ' + hocSinh.length + ' học sinh. Bảng tính: ' + ss.getUrl());
  if (canhBao.length) Logger.log('Có ' + canhBao.length + ' cảnh báo, xem trang "Cảnh báo".');
}

function ghiTrang_(sh, rows) {
  // Ghi dạng chữ để mã như 001 hay điểm 10 không bị Sheets tự đổi định dạng.
  sh.getRange(1, 1, rows.length, rows[0].length).setNumberFormat('@').setValues(rows);
  sh.setFrozenRows(1);
  sh.getRange(1, 1, 1, rows[0].length).setFontWeight('bold');
}
