/* js/03_ket_qua.js — Thẻ 02 — Kết quả: các bảng, thu gọn mục, xuất tệp.

   Một phần của giao diện chính, tách từ app.js cũ. Các tệp js/ là SCRIPT
   THƯỜNG (không phải ES module) nạp theo đúng thứ tự trong index.html và
   dùng chung một phạm vi — như một tệp duy nhất trước đây. Không dùng ES
   module vì mở trang bằng file:// thì trình duyệt chặn chúng.
*/
"use strict";

/* ------------------------------------------------------------------ *
 * 4. TAB 2 — KẾT QUẢ
 * ------------------------------------------------------------------ */

function loadResultsTab() {
  loadClubFillStats();
  loadMatchResults(el("resultsSearch") ? el("resultsSearch").value : "");
  loadDoPhu();
  loadThoiKhoaBieu(el("tkbSearch") ? el("tkbSearch").value : "");
  loadSoBocTham(el("thamSearch") ? el("thamSearch").value : "");
  loadPhanBoNguyenVong();
  loadEmChuaCoCho();
  loadSuatDuTru();
  /* Tieu de danh sach thanh vien la chu DONG (co ten cau lac bo), nen
     applyStaticText() khong dich duoc. Mo lai dung cai dang mo — giong
     het cach `openScoringClub` duoc goi lai o the 05. */
  if (clbDangMo) moDanhSachCLB(clbDangMo);
}

/* ---- Thu gọn / mở rộng từng mục ở thẻ Kết quả ----

   Thẻ này xếp năm mục chồng nhau, và mục dài nhất có một dòng cho mỗi em
   mỗi buổi — với 140 em × 3 buổi là hơn 400 dòng. Cuộn qua hết để tới
   mục cuối là việc thật, nên từng mục đóng lại được.

   HAI ĐIỀU DỄ LÀM SAI, đã tránh có chủ ý:

   1. `hidden` đặt trên `.panel-body`, KHÔNG BAO GIỜ trên `.panel`. Ba mục
      doPhu/tkb/tham đã dùng `hidden` trên chính `.panel` để nói "chưa có
      dữ liệu nên chưa hiện". Trộn hai nghĩa vào một thuộc tính thì
      "Mở rộng tất cả" sẽ lôi cả một mục rỗng ra giữa màn hình.

   2. Nhãn nút chung ĐỔI theo trạng thái nên nó là chữ ĐỘNG: nút không
      mang `data-i18n`, vì applyStaticText() sẽ đè chữ tĩnh lên đúng như
      LỖI 3 ở đầu tests/test_giao_dien_chon_buoi.py. Đổi ngôn ngữ thì vẽ
      lại trong reapplyDynamicTextForLangChange(). */

const MUC_KET_QUA = ["fillPanel", "clbPanel", "duTruPanel", "doPhuPanel",
                     "nvPanel", "chuaCoChoPanel", "tkbPanel", "thamPanel",
                     "dsXepPanel"];

/* Lần đầu mở: TẤT CẢ các mục đều đóng, chỉ hiện tiêu đề kèm con số.
   Bản trước để mở sẵn "Tỉ lệ lấp đầy theo CLB" và "Danh sách xếp CLB" —
   với 84 câu lạc bộ, vừa mở thẻ đã là một bức tường thanh ngang và dòng.
   Nhà trường chọn: màn hình gọn, cần mục nào thì bấm mở mục đó.
   Đổi mặc định = sửa đúng mảng này. */
const MAC_DINH_DONG = MUC_KET_QUA.slice();

/* `_v2`: máy nào đã bấm thu gọn/mở rộng dù một lần là đã LƯU trạng thái
   của cả chín mục — tức lưu luôn cái mặc định cũ "lấp đầy đang mở". Giữ
   khoá cũ thì mặc định mới không bao giờ tới được những máy đó. Lựa chọn
   lưu từ nay trở đi vẫn được nhớ như trước. */
const KHOA_THU_GON = "rbda_thu_gon_ket_qua_v2";

let mucDangDong = null;

function docTrangThaiThuGon() {
  /* Bản .exe chạy qua pywebview. Một lỗi kho lưu trữ được phép làm mất
     lựa chọn, KHÔNG được phép ném ra và làm hỏng cả thẻ.

     LƯU DẠNG BẢN ĐỒ {id: đang_mở}, KHÔNG phải mảng các mục đang đóng.
     Bản đầu lưu mảng, và mục nào không có trong mảng thì được hiểu là
     ĐANG MỞ — nên mỗi lần thêm mục mới, người đã dùng tính năng này sẽ
     thấy nó mở toang, đúng cái điều MAC_DINH_DONG sinh ra để tránh. Bản
     đồ phân biệt được "người này đã mở nó" với "chưa từng thấy mục này",
     và trường hợp thứ hai phải lấy mặc định. */
  const kq = new Set(MAC_DINH_DONG);
  try {
    const raw = window.localStorage &&
                window.localStorage.getItem(KHOA_THU_GON);
    if (!raw) return kq;
    const luu = JSON.parse(raw);
    if (!luu || typeof luu !== "object" || Array.isArray(luu)) return kq;
    MUC_KET_QUA.forEach((id) => {
      if (Object.prototype.hasOwnProperty.call(luu, id)) {
        if (luu[id]) kq.delete(id);
        else kq.add(id);
      }
    });
  } catch (e) { /* không đọc được thì dùng mặc định */ }
  return kq;
}

function luuTrangThaiThuGon() {
  try {
    if (window.localStorage) {
      const ban_do = {};
      MUC_KET_QUA.forEach((id) => { ban_do[id] = !mucDangDong.has(id); });
      window.localStorage.setItem(KHOA_THU_GON, JSON.stringify(ban_do));
    }
  } catch (e) { /* không ghi được thì thôi, giao diện vẫn chạy */ }
}

function datMuc(id, mo) {
  const than = el(id + "Body");
  const nut = document.querySelector("#" + id + " .panel-toggle");
  if (!than || !nut) return;
  than.hidden = !mo;
  nut.setAttribute("aria-expanded", mo ? "true" : "false");
  const dau = document.querySelector("#" + id + " .panel-head");
  if (dau) dau.classList.toggle("is-dong", !mo);
  if (mo) mucDangDong.delete(id);
  else mucDangDong.add(id);
}

function capNhatNutTatCa() {
  const nut = el("btnThuGonTatCa");
  if (!nut || !mucDangDong) return;
  const dongHet = MUC_KET_QUA.every((id) => mucDangDong.has(id));
  nut.textContent = t(dongHet ? "btn_mo_rong_tat_ca" : "btn_thu_gon_tat_ca");
  nut.dataset.mo = dongHet ? "1" : "0";
}

/* Một mục đang đóng vẫn phải nói nó chứa bao nhiêu — nếu không, đóng lại
   trông y hệt mất bảng. Giữ cả khoá lẫn con số trong dataset để vẽ lại
   được lúc đổi ngôn ngữ mà không phải hỏi lại phần mềm. */
function veDemMuc(id, khoa, n) {
  const o = el(id + "Dem");
  if (!o) return;
  if (!khoa || n === null || n === undefined) {
    o.textContent = "";
    delete o.dataset.khoa;
    return;
  }
  o.dataset.khoa = khoa;
  o.dataset.n = n;
  o.textContent = t(khoa, { n: n });
}

function veLaiCacDemMuc() {
  MUC_KET_QUA.forEach((id) => {
    const o = el(id + "Dem");
    if (o && o.dataset.khoa) {
      o.textContent = t(o.dataset.khoa, { n: o.dataset.n });
    }
  });
}

function khoiTaoThuGon() {
  mucDangDong = docTrangThaiThuGon();
  MUC_KET_QUA.forEach((id) => {
    const dau = document.querySelector("#" + id + " .panel-head");
    if (!dau) return;
    datMuc(id, !mucDangDong.has(id));
    /* Cả vùng tiêu đề bấm được cho dễ trúng, TRỪ vùng bên phải: bấm vào
       ô tìm kiếm mà mục đóng sập lại là một cái bẫy. Nút <button> vẫn
       giữ nguyên để bàn phím tới được. */
    dau.addEventListener("click", (ev) => {
      if (ev.target.closest && ev.target.closest(".panel-actions")) return;
      datMuc(id, mucDangDong.has(id));
      luuTrangThaiThuGon();
      capNhatNutTatCa();
    });
  });
  const nutTatCa = el("btnThuGonTatCa");
  if (nutTatCa) {
    nutTatCa.addEventListener("click", () => {
      const mo = nutTatCa.dataset.mo === "1";
      MUC_KET_QUA.forEach((id) => datMuc(id, mo));
      luuTrangThaiThuGon();
      capNhatNutTatCa();
    });
  }
  capNhatNutTatCa();
}

function loadClubFillStats() {
  callApiDocChung("get_club_fill_stats").then((res) => {
    const box = el("clubFillList");
    clear(box);
    if (!res.ok || !res.data.length) {
      box.innerHTML = '<div class="empty-state"></div>';
      box.firstChild.textContent = t("admin_club_empty");
      veDemMuc("fillPanel", null, null);
      veBangNhuCauCLB([]);
      return;
    }
    res.data.forEach((c) => {
      /* Hai doan LIEN NHAU trong mot mang flex, khong chong mo len
         nhau: vang = so em vao BANG SUAT DU TRU, xanh = so em vao o
         chi tieu chung. Cong lai dung bang ti le lap day in ben phai,
         va khop voi cot "Dien trung tuyen" trong tep xuat ra.

         Ban cu ve doan vang theo reserve_capacity — tuc la chi tieu du
         tru cua CLB, mot thuoc tinh cua CLB chu khong phai dieu da xay
         ra. Chu giai ghi "Co suat du tru" nen doc len khong ai biet no
         dang noi ve cai nao. */
      const suc = c.capacity > 0 ? c.capacity : 0;
      const duTru = Math.min(c.matched_reserve || 0, c.matched);
      const chung = Math.max(0, c.matched - duTru);
      /* Tinh be rong tu SO GOC. Lam tron tung doan roi cong lai thi
         tong co the vuot 100%. */
      const phanTram = (n) => (suc > 0 ? Math.min(100, (n / suc) * 100) : 0);

      const row = document.createElement("div");
      row.className = "fill-row";
      row.innerHTML =
        `<span class="fill-name">${esc(c.name || c.club_id)}</span>` +
        `<span class="fill-track">` +
        (duTru > 0
          ? `<span class="fill-bar is-reserve" style="width:${phanTram(duTru)}%"></span>`
          : "") +
        (chung > 0
          ? `<span class="fill-bar" style="width:${phanTram(chung)}%"></span>`
          : "") +
        `</span>` +
        `<span class="fill-count">${c.matched}/${c.capacity}</span>`;
      box.appendChild(row);
    });
    veDemMuc("fillPanel", "dem_cau_lac_bo", res.data.length);
    veBangNhuCauCLB(res.data);
  });
}

/* ---- Theo từng câu lạc bộ: nhu cầu + danh sách thành viên ----

   Bảng này dùng CHÍNH kết quả của `get_club_fill_stats` mà mục tỉ lệ lấp
   đầy đang vẽ — một câu truy vấn, hai cách hiện. Hai đường tính song song
   cho cùng một con số là thứ sớm muộn cũng trôi khỏi nhau. */

let clbDangMo = null;      // mã câu lạc bộ đang mở danh sách, null = đóng

function soThapPhan(x) {
  /* Người Việt viết 4,35 chứ không phải 4.35. */
  return x === null || x === undefined ? "—" : String(x).replace(".", ",");
}

function veBangNhuCauCLB(ds) {
  const panel = el("clbPanel");
  if (!panel) return;
  const body = el("clbBody");
  const rong = el("clbEmpty");
  clear(body);
  panel.hidden = !ds.length;
  if (rong) rong.hidden = ds.length > 0;
  if (!ds.length) {
    veDemMuc("clbPanel", null, null);
    dongDanhSachCLB();
    return;
  }

  /* Lớp CSS RIÊNG (`.cot-buoi-clb`), không dùng chung `.cot-buoi` với
     bảng danh sách xếp CLB. `loadMatchResults` bật tắt `.cot-buoi` theo
     số buổi có trong KẾT QUẢ, còn bảng này đếm theo DANH SÁCH CÂU LẠC
     BỘ — hai quy tắc khác nhau trên cùng một lớp thì bên chạy sau thắng.
     Đã đo: trường hai buổi mà chỉ chạy một buổi thì cột Buổi ở đây biến
     mất, và bảng còn lại hai dòng không nói nổi dòng nào thuộc buổi nào. */
  const nhieuBuoi = new Set(ds.map((c) => c.buoi)).size > 1;

  ds.forEach((c) => {
    const tr = document.createElement("tr");
    tr.innerHTML =
      `<td class="cot-buoi-clb">${esc(nhanBuoi(c.buoi))}</td>` +
      `<td>${esc(c.club_id)}</td>` +
      `<td>${esc(c.name || c.club_id)}</td>` +
      `<td class="num">${esc(c.so_dang_ky)}</td>` +
      `<td class="num">${esc(c.so_dat_nv1)}</td>` +
      `<td class="num">${esc(c.capacity)}</td>` +
      `<td class="num">${esc(c.matched)}</td>` +
      `<td class="num">${esc(soThapPhan(c.ti_le_choi))}</td>` +
      `<td></td>`;
    tr.querySelector(".cot-buoi-clb").hidden = !nhieuBuoi;

    const nut = document.createElement("button");
    nut.className = "btn btn-ghost";
    nut.dataset.clb = c.club_id;
    nut.textContent = t(clbDangMo === c.club_id
                        ? "btn_dong_danh_sach" : "btn_xem_danh_sach");
    nut.addEventListener("click", () => {
      if (clbDangMo === c.club_id) dongDanhSachCLB();
      else moDanhSachCLB(c.club_id);
    });
    tr.lastElementChild.appendChild(nut);
    body.appendChild(tr);
  });
  document.querySelectorAll("#clbTable thead .cot-buoi-clb")
    .forEach((o) => { o.hidden = !nhieuBuoi; });
  veDemMuc("clbPanel", "dem_cau_lac_bo", ds.length);
}

/* Nhãn nút phải theo trạng thái thật. Bản đầu chỉ ẩn vùng danh sách đi
   mà không đụng tới nút, nên đóng xong nút vẫn ghi "Đóng danh sách" —
   một nút nói dối về việc bấm nó sẽ làm gì. */
function capNhatNhanNutDanhSach() {
  document.querySelectorAll("#clbBody tr").forEach((tr) => {
    const nut = tr.querySelector("button");
    if (nut) {
      nut.textContent = t(nut.dataset.clb === clbDangMo
                          ? "btn_dong_danh_sach" : "btn_xem_danh_sach");
    }
  });
}

function dongDanhSachCLB() {
  clbDangMo = null;
  const vung = el("clbDsArea");
  if (vung) vung.hidden = true;
  capNhatNhanNutDanhSach();
}

function moDanhSachCLB(club_id) {
  callApi("get_danh_sach_clb", club_id).then((res) => {
    if (!res.ok) {
      /* Câu lạc bộ đã bị xoá ở thẻ Quản lý trong lúc danh sách của nó
         đang mở: đóng lại là đúng, còn ném một hộp lỗi đỏ lên màn hình
         thì đang báo động về một việc người dùng vừa CỐ Ý làm. Lỗi khác
         (đọc cơ sở dữ liệu hỏng) thì vẫn phải nói. */
      const ma_loi = (res.errors && res.errors[0] && res.errors[0].code) || "";
      if (ma_loi === "club_not_found") dongDanhSachCLB();
      else showToast(trErrs(res.errors).join("; "), "error");
      return;
    }
    clbDangMo = club_id;
    const d = res.data;
    const vung = el("clbDsArea");
    el("clbDsTieuDe").textContent =
      t("clb_ds_tieu_de", { ten: d.club_name || d.club_id });

    const body = el("clbDsBody");
    clear(body);
    d.thanh_vien.forEach((em) => {
      const dien = nhanDien(em.matched_tier);
      const tr = document.createElement("tr");
      tr.innerHTML =
        `<td>${esc(em.student_id)}</td>` +
        `<td>${esc(em.name || "")}</td>` +
        `<td class="num">${esc(em.rank_in_student_pref ?? "—")}</td>` +
        `<td>${esc(dien)}</td>` +
        `<td>${esc(em.reserve_group || "")}</td>`;
      body.appendChild(tr);
    });
    if (vung) vung.hidden = false;
    capNhatNhanNutDanhSach();
  });
}

/* ---- Nguyện vọng thứ mấy thì được ---- */

function loadPhanBoNguyenVong() {
  const panel = el("nvPanel");
  if (!panel) return;
  callApi("get_phan_bo_nguyen_vong").then((res) => {
    if (!res.ok || !res.data.tong_da_xep) {
      panel.hidden = true;
      return;
    }
    panel.hidden = false;
    const d = res.data;
    const box = el("nvCot");
    clear(box);

    const hang = d.phan_bo.slice();
    if (d.khong_ro) hang.push({ hang: null, gop: false, so_em: d.khong_ro });
    const lonNhat = Math.max(1, ...hang.map((h) => h.so_em));

    hang.forEach((h) => {
      const nhan = h.hang === null ? t("nv_khong_ro")
                 : h.gop ? t("nv_hang_gop", { n: h.hang })
                 : t("nv_hang", { n: h.hang });
      const ti_le = d.tong_da_xep
        ? Math.round((h.so_em / d.tong_da_xep) * 1000) / 10 : 0;
      const dong = document.createElement("div");
      dong.className = "do-phu-dong" + (h.hang === 1 ? " is-nv1" : "");
      dong.innerHTML =
        `<span class="do-phu-nhan">${esc(nhan)}</span>` +
        `<span class="do-phu-track"><span class="do-phu-bar" ` +
        `style="width:${(h.so_em / lonNhat) * 100}%"></span></span>` +
        `<span class="do-phu-so-em">${esc(h.so_em)}` +
        `<span class="nv-ti-le"> · ${esc(soThapPhan(ti_le))}%</span></span>`;
      box.appendChild(dong);
    });
    veDemMuc("nvPanel", "dem_cho", d.tong_da_xep);
  });
}

/* ---- Em chưa có chỗ nào ---- */

function loadEmChuaCoCho() {
  const panel = el("chuaCoChoPanel");
  if (!panel) return;
  callApi("get_em_chua_co_cho").then((res) => {
    if (!res.ok) { panel.hidden = true; return; }
    const d = res.data;
    const body = el("chuaCoChoBody");
    const rong = el("chuaCoChoEmpty");
    clear(body);

    /* Chua chay lan nao thi KHONG hien mot bang trong reo "moi em deu co
       cau lac bo" — cau do se sai va sai theo huong yen long nhat. */
    panel.hidden = !d.tong_hoc_sinh;
    if (rong) rong.hidden = d.so_em > 0;

    d.danh_sach.forEach((em) => {
      const khai = em.da_khai.length
        ? em.da_khai.map((k) =>
            `<span class="club-tag">${esc(k.ten_clb || k.club_id)}` +
            (k.ti_le_choi === null || k.ti_le_choi === undefined ? ""
             : ` <span class="nv-ti-le">${esc(soThapPhan(k.ti_le_choi))}</span>`) +
            `</span>`).join(" ")
        : `<span class="tkb-trong">${esc(t("chua_khai_gi"))}</span>`;
      const tr = document.createElement("tr");
      tr.innerHTML =
        `<td>${esc(em.student_id)}</td>` +
        `<td>${esc(em.name || "")}</td>` +
        `<td class="num">${esc(em.so_nguyen_vong)}</td>` +
        `<td>${khai}</td>`;
      body.appendChild(tr);
    });
    veDemMuc("chuaCoChoPanel", "dem_hoc_sinh", d.so_em);
  });
}

/* ---- Suất dự trữ dùng tới đâu ---- */

function loadSuatDuTru() {
  const panel = el("duTruPanel");
  if (!panel) return;
  callApi("get_suat_du_tru").then((res) => {
    if (!res.ok || !res.data.length) {
      panel.hidden = true;
      return;
    }
    panel.hidden = false;
    const ds = res.data;
    const nhieuBuoi = new Set(ds.map((c) => c.buoi)).size > 1;
    const body = el("duTruBody");
    clear(body);
    let tong_thua = 0;
    ds.forEach((c) => {
      tong_thua += c.con_thua || 0;
      const tr = document.createElement("tr");
      tr.innerHTML =
        `<td class="cot-buoi-clb">${esc(nhanBuoi(c.buoi))}</td>` +
        `<td>${esc(c.name || c.club_id)}</td>` +
        `<td>${esc(c.reserve_group || "")}</td>` +
        `<td class="num">${esc(c.reserve_capacity)}</td>` +
        `<td class="num">${esc(c.nhom_dang_ky)}</td>` +
        `<td class="num">${esc(c.da_dung)}</td>` +
        `<td class="num${c.con_thua > 0 ? " is-canh-bao-o" : ""}">` +
        `${esc(c.con_thua)}</td>`;
      tr.querySelector(".cot-buoi-clb").hidden = !nhieuBuoi;
      body.appendChild(tr);
    });
    document.querySelectorAll("#duTruTable thead .cot-buoi-clb")
      .forEach((o) => { o.hidden = !nhieuBuoi; });
    const rong = el("duTruEmpty");
    if (rong) rong.hidden = true;
    // Con so dang nhin la SUAT BI BO PHI, khong phai so cau lac bo.
    veDemMuc("duTruPanel", "dem_suat", tong_thua);
  });
}

function loadMatchResults(search) {
  callApiMoiNhat("ket_qua", "get_match_results", search || "").then((res) => {
    const body = el("resultsTableBody");
    const empty = el("resultsEmptyState");
    const badge = el("unmatchedBadge");
    clear(body);
    /* Dung ca bang trong mot DocumentFragment roi gan MOT lan: gan tung
       dong vao bang dang hien la trinh duyet tinh lai bo cuc moi dong —
       voi 400-800 dong va moi lan go phim tim kiem, do la cai giat. */
    const manh = document.createDocumentFragment();

    if (!res.ok || !res.data.length) {
      empty.hidden = false;
      badge.hidden = true;
      veDemMuc("dsXepPanel", null, null);
      return;
    }
    empty.hidden = true;

    /* NHIỀU BUỔI: một em có MỘT dòng cho MỖI buổi, kể cả buổi em không
       có suất. Giữ nguyên cách hiện thì bảng này phồng lên gấp số buổi
       (160 em × 5 buổi = 800 dòng, phần lớn là ô trống) và huy hiệu
       "chưa được xếp" đếm số Ô TRỐNG chứ không phải số EM trắng tay —
       593 thay vì 38, một con số vừa sai vừa đáng sợ.

       Nên ở chế độ nhiều buổi, bảng này chỉ liệt kê chỗ đã xếp THẬT, còn
       "em nào chưa có gì" đọc ở bảng Độ phủ ngay phía trên — chỗ con số
       đó có đúng nghĩa. */
    const dsBuoi = new Set(res.data.map((r) => r.buoi));
    const nhieuBuoi = dsBuoi.size > 1;
    const dong = nhieuBuoi ? res.data.filter((r) => r.club_id) : res.data;

    /* Cột "Buổi" chỉ có nghĩa khi trường dùng nhiều buổi. Một buổi mà
       vẫn hiện một cột toàn "Chưa chia buổi" là thêm việc đọc cho người
       dùng mà không thêm thông tin nào. */
    document.querySelectorAll("#view-results .cot-buoi").forEach((o) => {
      o.hidden = !nhieuBuoi;
    });

    veDemMuc("dsXepPanel", "dem_dong", dong.length);

    let nUnmatched = 0;
    dong.forEach((r) => {
      const tr = document.createElement("tr");
      const clubCell = r.club_id
        ? `<span class="club-tag">${esc(r.club_name || r.club_id)}</span>`
        : `<span class="club-tag is-empty">${esc(t("not_matched_label"))}</span>`;
      if (!r.club_id) nUnmatched++;
      const tierLabel = nhanDien(r.matched_tier);
      tr.innerHTML =
        `<td>${esc(r.student_id)}</td><td>${esc(r.name)}</td>` +
        `<td class="cot-buoi">${esc(nhanBuoi(r.buoi))}</td><td>${clubCell}</td>` +
        `<td>${esc(tierLabel)}</td><td>${esc(r.rank_in_student_pref ?? "—")}</td>`;
      manh.appendChild(tr);
    });
    body.appendChild(manh);

    if (nhieuBuoi) {
      /* Huy hiệu phải nói SỐ EM không có CLB nào cả tuần. Lấy từ đúng
         nguồn đã tính điều đó thay vì suy ra từ bảng này. */
      callApiDocChung("get_do_phu").then((dp) => {
        const n = dp.ok ? dp.data.so_em_trang_tay : 0;
        badge.hidden = n <= 0;
        if (n > 0) badge.textContent = t("unmatched_badge", { n: n });
      });
    } else if (nUnmatched > 0) {
      badge.hidden = false;
      badge.textContent = t("unmatched_badge", { n: nUnmatched });
    } else {
      badge.hidden = true;
    }
  });
}

function initResultsHandlers() {
  khoiTaoThuGon();
  el("resultsSearch").addEventListener(
    "input",
    debounce((ev) => loadMatchResults(ev.target.value), 250)
  );
  if (el("tkbSearch")) {
    el("tkbSearch").addEventListener(
      "input",
      debounce((ev) => loadThoiKhoaBieu(ev.target.value), 250)
    );
  }
  if (el("btnChonTatCaBuoi")) {
    el("btnChonTatCaBuoi").addEventListener("click", () => {
      buoiDangChon = new Set(dsBuoiCoThe);
      goThanhXacNhanNeuCo();
      dongBoDaiVoiChip();
      veChonBuoi();
    });
  }
  ["chonBuoiTu", "chonBuoiDen"].forEach((id) => {
    if (el(id)) el(id).addEventListener("change", apDungDaiBuoi);
  });
  if (el("thamSearch")) {
    el("thamSearch").addEventListener(
      "input",
      debounce((ev) => loadSoBocTham(ev.target.value), 250)
    );
  }
  el("btnExport").addEventListener("click", () => {
    /* Khong truyen ten file -> backend tu dat vao THU MUC TAI XUONG
       cua nguoi dung va tra ve duong dan DAY DU, de nguoi dung biet
       file nam o dau. Da co file cung ten thi them "(2)" nhu trinh
       duyet, khong ghi de. */
    khiBan(el("btnExport"), () => callApi("export_csv", "")).then((res) => {
      if (res.ok) showToast(t("toast_export_success", {
        n_rows: res.data.n_rows, path: res.data.path,
        n_club_files: res.data.n_club_files,
      }), "success");
      else showToast(cauLoi(res.errors, "toast_export_failed"), "error");
    });
  });
}
