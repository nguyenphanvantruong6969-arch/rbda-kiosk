/* js/02_van_hanh.js — Thẻ 01 — Vận hành: chạy sắp xếp, sức khoẻ dữ liệu, nạp tệp CSV/Excel.

   Một phần của giao diện chính, tách từ app.js cũ. Các tệp js/ là SCRIPT
   THƯỜNG (không phải ES module) nạp theo đúng thứ tự trong index.html và
   dùng chung một phạm vi — như một tệp duy nhất trước đây. Không dùng ES
   module vì mở trang bằng file:// thì trình duyệt chặn chúng.
*/
"use strict";

/* ------------------------------------------------------------------ *
 * 3. TAB 1 — VẬN HÀNH PIPELINE
 * ------------------------------------------------------------------ */

/* Hang doi file da tha, cho nhap. Moi phan tu:
   { ten, text, kind, format, confident, candidates, xong, ketQua, loi } */
let importQueue = [];

// Bộ nhớ lần render gần nhất của stepper/log — dùng để dịch lại đúng
// nội dung khi người dùng đổi ngôn ngữ giữa chừng (không gọi lại API).
let lastRenderedSteps = null;
let lastRenderedTopErrors = null;

/* O hat giong: hien DUNG so lan chay truoc da dung, khong phai 42 co
   dinh. Truoc day mo lai app la o ve 42, va chay lai mot buoi voi hat
   giong khac lan truoc bi phan loi tu choi (khong_doi_hat_giong_...).
   Nguoi dung da go tay thi KHONG ghi de — chuyen the roi quay lai khong
   duoc xoa so ho vua go. */
let seedDaSua = false;

// Goi tu refreshSidebarStatus(), noi da doc san thong tin lan chay truoc.
function napHatGiongLanTruoc(lanTruoc) {
  if (seedDaSua || !lanTruoc) return;
  const seed = lanTruoc.seed;
  if (seed !== null && seed !== undefined) el("seedInput").value = seed;
}

/* Tra ve so nguyen, hoac null neu o khong phai so nguyen. Truoc day
   `parseInt(...) || 42` bien o trong, so 0, hay "1.5" thanh 42 ma khong
   noi gi — chay voi mot hat giong nguoi dung khong he chon. */
function docHatGiong() {
  const chu = String(el("seedInput").value).trim();
  if (!/^-?\d+$/.test(chu)) return null;
  const so = Number(chu);
  return Number.isSafeInteger(so) ? so : null;
}

function loadPipelineTab() {
  refreshDashboardStats();
  refreshStbLockLine();
  refreshSidebarStatus();
  loadHealthReport();
  loadChonBuoi();
}

/* ---- Cảnh báo sức khoẻ dữ liệu (pre-flight) ---- */

/* Tra ve promise cua lan goi, de nut Kiem tra dung chung mot ket qua
   voi o Canh bao du lieu thay vi hoi phan loi hai lan. */
function loadHealthReport() {
  const hoi = callApi("get_data_health_report");
  hoi.then((res) => {
    const summary = el("healthSummary");
    const list = el("healthList");
    clear(list);

    if (!res.ok) {
      summary.className = "health-summary is-warn";
      summary.textContent = trErrs(res.errors).join(" ");
      ganChiTietKyThuat(summary, res.errors);
      return;
    }

    const d = res.data;
    if (!d.n_warnings) {
      summary.className = "health-summary is-clean";
      summary.textContent = t("health_clean");
      return;
    }

    summary.className = "health-summary is-warn";
    summary.textContent = t("health_summary", { n: d.n_warnings, n_high: d.n_high });

    const SEV_LABEL = {
      high: "health_sev_high",
      medium: "health_sev_medium",
      info: "health_sev_info",
    };
    // nghiêm trọng lên trước — người vận hành đọc từ trên xuống
    const order = { high: 0, medium: 1, info: 2 };
    d.warnings
      .slice()
      .sort((a, b) => (order[a.severity] ?? 9) - (order[b.severity] ?? 9))
      .forEach((w) => {
        const row = document.createElement("div");
        row.className = "health-item sev-" + (w.severity || "info");
        const sev = document.createElement("span");
        sev.className = "health-sev";
        sev.textContent = t(SEV_LABEL[w.severity] || "health_sev_info");
        const msg = document.createElement("span");
        msg.textContent = trErr(w);
        row.appendChild(sev);
        row.appendChild(msg);
        list.appendChild(row);
      });
  });
  return hoi;
}

function refreshDashboardStats() {
  callApi("get_dashboard_status").then((res) => {
    if (!res.ok) {
      showErrorToast(res.errors);
      return;
    }
    el("statStudents").textContent = res.data.n_students;
    el("statClubs").textContent = res.data.n_clubs;
    el("statPrefs").textContent = res.data.n_students_with_preferences;
    el("statMatched").textContent = res.data.n_matched;
  });
}

function refreshStbLockLine() {
  callApi("get_stb_lock_status").then((res) => {
    const line = el("stbLockLine");
    if (!res.ok) {
      line.textContent = "";
      return;
    }
    clear(line);
    const dot = document.createElement("span");
    dot.className = "lock-dot";
    line.className = "stb-lock-line" + (res.data.is_locked ? "" : " is-unlocked");
    line.appendChild(dot);
    const label = document.createElement("span");
    label.textContent = res.data.is_locked
      ? t("stb_locked_label", { locked_at: res.data.locked_at })
      : t("stb_unlocked_label");
    line.appendChild(label);

    seedKhoa = res.data.is_locked && res.data.seed !== null && res.data.seed !== undefined
      ? res.data.seed : null;
    capNhatOHatGiong();

    if (res.data.is_locked) {
      const redrawBtn = document.createElement("button");
      redrawBtn.className = "redraw-toggle";
      redrawBtn.textContent = t("btn_redraw_stb");
      redrawBtn.addEventListener("click", () => promptForceRedraw());
      line.appendChild(redrawBtn);
      capNhatKhoaVanHanh(); // nut moi dung lai: ap dung trang thai khoa
    }
  });
}

let forceRedrawArmed = false;
let veLaiTimer = null;
let veLaiToast = null;

/* Bat/tat che do "ve lai so boc tham". Thong bao nhac GAN LIEN voi trang
   thai: con bat thi con hien, tat (bam lai, het 20 giay, xac nhan, huy,
   doi ngon ngu) thi go ngay. Truoc day thong bao tat sau 3,6 giay con
   che do van bat 20 giay — nguoi dung khong biet no con bat hay khong.
   Bam × tren thong bao cung la tat che do. */
function datCheDoVeLai(bat) {
  forceRedrawArmed = bat;
  clearTimeout(veLaiTimer);
  veLaiTimer = null;
  if (veLaiToast) {
    const cu = veLaiToast;
    veLaiToast = null;          // truoc goBo(): khiDong ben duoi khong goi lai
    cu.goBo();
  }
  if (bat) {
    /* Ghim: gioi han 4 thong bao khong duoc go loi nhac nay trong khi che
       do van bat. Va dong no bang BAT KY duong nao (× hay cach khac) deu
       tat che do — khong bao gio con che do bat ma khong con loi nhac. */
    const nhac = showToast(t("toast_redraw_armed"), "warn", {
      ghim: true,
      khiDong: () => { if (veLaiToast === nhac) datCheDoVeLai(false); },
    });
    veLaiToast = nhac;
    veLaiTimer = setTimeout(() => datCheDoVeLai(false), 20000);
  }
  capNhatOHatGiong();
}

/* Hat giong dang khoa cung bo so boc tham (null = chua khoa). Khoa roi
   thi o hat giong CHI DOC va hien dung hat giong da khoa: doi no cung
   doi thu tu uu tien moi buoi, tuc la cung tac dung voi ve lai bo so —
   nen phai di cung mot cua, qua nut "Ve lai". Backend cung chan
   (`hat_giong_da_khoa`); o day chi de nguoi dung khong phai go roi moi
   biet la khong duoc. */
let seedKhoa = null;

function capNhatOHatGiong() {
  const o = el("seedInput");
  const goiY = el("seedLockHint");
  if (!o) return;
  const dangKhoa = seedKhoa !== null && !forceRedrawArmed;
  if (dangKhoa) o.value = seedKhoa;
  o.readOnly = dangKhoa;
  o.title = dangKhoa ? t("seed_locked_hint", { seed: seedKhoa }) : "";
  if (goiY) {
    if (seedKhoa === null) {
      goiY.hidden = true;
      goiY.textContent = "";
    } else {
      goiY.hidden = false;
      goiY.textContent = forceRedrawArmed
        ? t("seed_unlocked_for_redraw")
        : t("seed_locked_hint", { seed: seedKhoa });
    }
  }
}

/* Mot cua duy nhat bat/tat che do ve lai: loi nhac ghim, hen gio 20 giay
   va o hat giong (mo khoa khi ve lai) di cung nhau. */
function datVeLai(bat) {
  datCheDoVeLai(bat);
}

function promptForceRedraw() {
  datCheDoVeLai(!forceRedrawArmed);
}

/* Buoc nao phan loi tra ve ma KHONG co dong tinh trong #stepper (vd.
   "rollback" khi mot lan chay bi hoan tac, "unknown" khi loi la) thi
   them mot dong rieng cho no. Truoc day renderSteps lang le bo qua cac
   buoc nay — nen cau tran an "du lieu da quay ve dung trang thai truoc
   khi bam chay" chua bao gio hien ra. */
function dongBuocThem(stepper, ten) {
  let li = stepper.querySelector(`.step[data-step="${ten}"]`);
  if (li) return li;
  li = document.createElement("li");
  li.className = "step";
  li.dataset.step = ten;
  li.dataset.dong = "them";
  // Khung co dinh, khong chua du lieu; chu do renderSteps ghi bang textContent.
  li.innerHTML = '<span class="step-dot"></span><div class="step-body">'
    + '<div class="step-title"></div><div class="step-detail"></div></div>';
  stepper.appendChild(li);
  return li;
}

function renderSteps(steps) {
  lastRenderedSteps = steps;
  const stepper = el("stepper");
  steps.forEach((s) => {
    const li = dongBuocThem(stepper, s.step);
    if (li.dataset.dong === "them") {
      // Dat lai tieu de moi lan ve de doi ngon ngu cung dich theo.
      const khoaTieuDe = "step_title_" + s.step;
      const tieuDe = t(khoaTieuDe);
      li.querySelector(".step-title").textContent =
        tieuDe !== khoaTieuDe ? tieuDe : t("step_title_unknown");
    }
    li.dataset.status = s.status;
    const detail = li.querySelector(".step-detail");
    if (s.status === "running") detail.textContent = t("step_running");
    else if (s.status === "done") detail.textContent = s.detail ? trErr(s.detail) : t("step_done_default");
    else if (s.status === "error")
      detail.textContent = Array.isArray(s.detail) ? trErrs(s.detail).join(" ") : (s.detail ? trErr(s.detail) : t("generic_error"));
  });
}

function resetSteps() {
  lastRenderedSteps = null;
  document.querySelectorAll('#stepper .step[data-dong="them"]').forEach((li) => li.remove());
  document.querySelectorAll("#stepper .step").forEach((li) => {
    li.dataset.status = "";
    li.querySelector(".step-detail").textContent = t("step_not_run_yet");
  });
}

/* Luc bam Chay, phan loi chi tra ket qua cac buoc KHI DA XONG HET. Trong
   luc cho, danh dau moi buoc la "dang chay" de man hinh khong dung yen o
   "Chua chay" — nhin nhu treo, va nguoi dung bam tiep hoac chuyen the. */
function danhDauDangChay() {
  renderSteps(
    Array.from(document.querySelectorAll("#stepper .step")).map((li) => ({
      step: li.dataset.step, status: "running",
    }))
  );
}

/* ---- Khoa thao tac trong luc lam viec ----
   Moi co mot co rieng; capNhatKhoaVanHanh() suy ra trang thai MOI nut tu
   tat ca cac co, thay vi moi thao tac tu bat/tat nut theo y minh. Truoc
   day nut Kiem tra bat lai nut cua chinh no giua luc dang chay, va nut
   Chay chi bi khoa SAU khi hoi xong phan loi — bam dup la chay hai lan. */
const khoa = {
  dangHoiChay: false,   // tu luc bam Chay toi luc biet co can xac nhan hay khong
  dangChay: false,      // run_pipeline dang chay
  dangKiemTra: false,   // check_data_integrity dang chay
  dangNhap: false,      // dang nhap tep
  dangXuat: false,      // mot lan xuat (chayXuat) dang chay
};

function capNhatKhoaVanHanh() {
  const coThanhXacNhan = !!el("runConfirmBar");
  const btnRun = el("btnRun");
  btnRun.disabled = khoa.dangChay || khoa.dangHoiChay || coThanhXacNhan
    || khoa.dangNhap || khoa.dangKiemTra;
  btnRun.textContent = khoa.dangChay ? t("btn_dang_chay") : t("btn_run_pipeline");
  el("stepper").setAttribute("aria-busy", khoa.dangChay ? "true" : "false");
  el("btnValidate").disabled = khoa.dangChay || khoa.dangKiemTra || khoa.dangNhap;
  el("btnImportAll").disabled = khoa.dangChay || khoa.dangNhap;
  el("btnClearQueue").disabled = khoa.dangChay || khoa.dangNhap;
  if (el("btnXuatTuyChon")) el("btnXuatTuyChon").disabled = khoa.dangChay || khoa.dangXuat;

  const zone = el("dropZone");
  const khoaTha = khoaVungTha();
  zone.classList.toggle("is-disabled", khoaTha);
  zone.setAttribute("aria-disabled", khoaTha ? "true" : "false");

  // Doi pham vi buoi giua luc dang chay la vo nghia: pham vi da gui di roi.
  document.querySelectorAll(
    "#seedInput, #chonBuoiChip .buoi-chip, #chonBuoiTu, #chonBuoiDen, #btnChonTatCaBuoi, #stbLockLine .redraw-toggle"
  ).forEach((n) => { n.disabled = khoa.dangChay; });
}

function khoaVungTha() {
  return khoa.dangChay || khoa.dangNhap;
}

function datKhoa(ten, bat) {
  khoa[ten] = bat;
  capNhatKhoaVanHanh();
}

function showLog(errors) {
  lastRenderedTopErrors = errors;
  const panel = el("logPanel");
  const box = el("logBox");
  if (!errors || !errors.length) {
    panel.hidden = true;
    box.textContent = "";
    return;
  }
  panel.hidden = false;
  clear(box);
  (Array.isArray(errors) ? errors : [errors]).forEach((e) => {
    const dong = document.createElement("div");
    dong.className = "log-dong";
    const cau = document.createElement("div");
    cau.textContent = trErr(e);
    dong.appendChild(cau);
    ganChiTietKyThuat(dong, [e]);
    box.appendChild(dong);
  });
}

function initPipelineHandlers() {
  el("btnValidate").addEventListener("click", () => {
    datKhoa("dangKiemTra", true);
    callApi("check_data_integrity").then((res) => {
      datKhoa("dangKiemTra", false);
      if (res.ok) {
        showLog(null);
        const hopLe = t("toast_data_valid", { n_students: res.data.n_students, n_clubs: res.data.n_clubs });
        /* "Hop le" chi co nghia la khong co loi CHAN chay. Canh bao nghiem
           trong (vd. thieu diem) van con thi noi ro, dung de mot thong bao
           xanh noi nguoc voi o Canh bao du lieu ngay phia tren. */
        loadHealthReport().then((sk) => {
          const nHigh = sk && sk.ok && sk.data ? sk.data.n_high : 0;
          if (nHigh > 0) {
            showToast(hopLe + "\n" + t("toast_hop_le_con_canh_bao", { n_high: nHigh }), "warn");
          } else {
            showToast(hopLe, "success");
          }
        });
      } else {
        showToast(t("toast_data_invalid"), "error");
        showLog(res.errors);
      }
    });
  });

  el("btnRun").addEventListener("click", () => {
    runPipelineFlow();
  });

  el("btnToggleHistory").addEventListener("click", () => {
    const table = el("historyTable");
    table.hidden = !table.hidden;
    if (!table.hidden) loadRunHistory();
  });

  el("btnHealthRecheck").addEventListener("click", () => loadHealthReport());

  el("seedInput").addEventListener("input", () => { seedDaSua = true; });

  initCsvImportHandlers();
}

function runPipelineFlow() {
  /* CHUP MOT LAN, dung suot ca luong. `buoiGuiDi()` doc trang thai dang
     chon TAI LUC GOI, nen hoi lai no o nut Xac nhan la hoi mot trang thai
     co the da khac: chon thu_5 -> bam Chay -> bam Chon tat ca -> bam Xac
     nhan thi ghi de CA TUAN, trong khi hop thoai vua hua giu nguyen cac
     buoi khac. Hua sai ve pham vi mot viec khong hoan tac duoc la dung
     cai ma tinh nang nay sinh ra de tranh. */
  const chiBuoi = buoiGuiDi();

  /* `[]` la TRUTHY trong JavaScript, nen khong chan o day thi nhanh
     "chay mot phan" chay voi danh sach rong: hop thoai hien ra KHONG NEU
     BUOI NAO, va phai di het mot vong len nen tang moi bao loi. */
  if (chiBuoi && chiBuoi.length === 0) {
    showToast(trErr({ code: "chua_chon_buoi_nao", params: {} }), "error");
    return;
  }

  /* Khoa nut Chay NGAY, truoc khi hoi phan loi. Khoa sau khi hoi (nhu
     truoc day) thi co mot khoang ho: bam dup lan chay dau tien (khong
     can xac nhan) la goi run_pipeline HAI lan. */
  if (khoa.dangHoiChay || khoa.dangChay) return;

  const seed = docHatGiong();
  if (seed === null) {
    showToast(t("hat_giong_khong_hop_le"), "error");
    el("seedInput").focus();
    return;
  }

  datKhoa("dangHoiChay", true);

  callApi("get_pipeline_run_warning").then((warn) => {
    khoa.dangHoiChay = false;
    const wantsRedraw = forceRedrawArmed;
    const needsConfirm = (warn.ok && warn.data.has_existing_results) || wantsRedraw;

    if (!needsConfirm) {
      executeRun(seed, false, chiBuoi);
      return;
    }

    // Chèn thanh xác nhận ngay dưới nút, thay vì confirm() native.
    let bar = el("runConfirmBar");
    if (bar) bar.remove();
    bar = document.createElement("div");
    bar.id = "runConfirmBar";
    bar.className = "run-confirm-bar";
    const msg = document.createElement("span");
    /* Chạy một phần thì câu "sẽ GHI ĐÈ kết quả cũ" nói sai phạm vi: nó
       chỉ ghi đè những buổi đang chọn. Người vận hành đọc câu đó rồi
       huỷ vì tưởng mất hết các ngày đã công bố — đúng cái tính năng này
       sinh ra để tránh. Nêu đích danh buổi sẽ bị ghi đè. */
    const chon = chiBuoi;
    if (wantsRedraw) {
      msg.textContent = t("confirm_redraw_run");
    } else if (chon) {
      msg.textContent = t("confirm_overwrite_mot_phan")
        .replace("{buoi}", chon.map(nhanBuoi).join(", "));
    } else {
      msg.textContent = t("confirm_overwrite_run");
    }
    bar.appendChild(msg);
    const confirmBtn = document.createElement("button");
    confirmBtn.className = "btn btn-primary";
    confirmBtn.textContent = t("btn_confirm_run");
    confirmBtn.addEventListener("click", () => {
      confirmBtn.disabled = true;
      goThanhXacNhanNeuCo();
      executeRun(seed, wantsRedraw, chiBuoi);
    });
    const cancelBtn = document.createElement("button");
    cancelBtn.className = "btn btn-ghost";
    cancelBtn.textContent = t("btn_cancel");
    cancelBtn.addEventListener("click", () => goThanhXacNhanNeuCo());
    bar.appendChild(confirmBtn);
    bar.appendChild(cancelBtn);
    el("stepper").insertAdjacentElement("beforebegin", bar);
    capNhatKhoaVanHanh();
    confirmBtn.focus();
  });
}

function executeRun(seed, forceRedraw, chiBuoi) {
  resetSteps();
  showLog(null);
  datKhoa("dangChay", true);
  danhDauDangChay();

  /* Nhan `chiBuoi` tu tren xuong, KHONG goi lai `buoiGuiDi()`: con so
     gui di phai dung bang con so da hua o thanh xac nhan. */
  callApi("run_pipeline", seed, forceRedraw, chiBuoi).then((res) => {
    datKhoa("dangChay", false);
    const steps = (res.data && res.data.steps) || (res.errors && res.errors.steps) || [];
    // Xoa dau "dang chay" o nhung buoc phan loi khong bao lai (vd. dung som).
    resetSteps();
    renderSteps(steps);

    if (res.ok) {
      const thongBao = t("toast_run_success", {
        n_matched: res.data.n_matched,
        n_total: res.data.n_total,
        rounds: res.data.rounds_run,
      });
      /* Chay xong nhung KHONG sao luu duoc truoc do: van la thanh cong,
         nhung nguoi dung phai biet minh dang khong co ban sao luu. */
      const saoLuuHong = steps.find((x) => x.step === "backup" && x.status === "error");
      if (saoLuuHong) {
        showToast(thongBao + "\n" + t("toast_run_success_no_backup"), "warn",
          [saoLuuHong.detail]);
      } else {
        showToast(thongBao, "success");
      }
      showLog(null);
      seedDaSua = false;
      refreshDashboardStats();
      refreshStbLockLine();
      refreshSidebarStatus();
      if (!el("historyTable").hidden) loadRunHistory();
    } else {
      const errs = Array.isArray(res.errors) ? res.errors : [String(res.errors)];
      showToast(t("toast_run_failed"), "error");
      showLog(errs);
    }
  });
}

/* Hien nhan buoi cho nguoi doc, khong hien ma tho. Dong cu (truoc khi
   co cot nay) de trong — dung la "khong biet", va noi dung the con hon
   doan. Truong mot buoi cung de trong: o do khong co khai niem buoi. */
function nhanBuoiDaChay(gia_tri) {
  if (!gia_tri) return "—";
  const ds = String(gia_tri).split(",").filter(Boolean);
  if (!ds.length) return "—";
  if (ds.length === 1 && ds[0] === BUOI_MAC_DINH) return "—";
  return ds.map(nhanBuoi).join(", ");
}

function loadRunHistory() {
  callApi("get_run_history", 20).then((res) => {
    const body = el("historyTableBody");
    clear(body);
    if (!res.ok || !res.data.length) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 8;
      td.textContent = t("history_empty");
      tr.appendChild(td);
      body.appendChild(tr);
      return;
    }
    res.data.forEach((r) => {
      const tr = document.createElement("tr");
      tr.innerHTML =
        `<td>${esc(r.run_id)}</td><td>${esc(r.run_at)}</td><td>${esc(r.seed)}</td>` +
        `<td>${esc(r.rounds_run)}</td><td>${esc(r.n_matched)}</td><td>${esc(r.n_total)}</td>` +
        `<td>${esc(nhanBuoiDaChay(r.buoi_da_chay))}</td>` +
        `<td>${r.stb_redrawn ? esc(t("yes")) : esc(t("no"))}</td>`;
      body.appendChild(tr);
    });
  });
}

/* ---- Nạp CSV: một vùng kéo-thả, tự nhận diện loại file ----
 *
 * Giao diện cũ có HAI ô riêng và bắt người dùng tự chọn đúng ô. Kéo
 * nhầm ô KHÔNG báo lỗi: file nguyện vọng dạng dài khớp đủ cột của ô
 * "chọn CLB muốn thi", nên nó ghi vào sai bảng và vẫn báo thành công.
 * Giờ backend tự đọc dòng tiêu đề (detect_csv_kind). Chỉ khi tiêu đề
 * KHÔNG đủ kết luận thì mới hỏi lại — không bao giờ đoán.
 */

/* Thứ tự nhập BẮT BUỘC: CLB trước. Học sinh tham chiếu tới club_id,
   nạp học sinh khi CLB chưa có thì cả học sinh bị bỏ qua. Người dùng
   thả một lúc cả ba file thì phần mềm tự xếp đúng thứ tự này. */
const THU_TU_NHAP = { clubs: 0, test_selection: 1, preferences: 2 };

function initCsvImportHandlers() {
  const zone = el("dropZone");
  const input = el("fileAny");
  if (!zone || !input) return;

  zone.addEventListener("click", () => { if (!khoaVungTha()) input.click(); });
  zone.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter" || ev.key === " ") {
      ev.preventDefault();
      if (!khoaVungTha()) input.click();
    }
  });
  input.addEventListener("change", (ev) => {
    themFileVaoHangDoi(ev.target.files);
    input.value = ""; // cho phep tha lai dung file do
  });

  ["dragenter", "dragover"].forEach((e) =>
    zone.addEventListener(e, (ev) => {
      ev.preventDefault();
      if (!khoaVungTha()) zone.classList.add("is-dragover");
    })
  );
  ["dragleave", "drop"].forEach((e) =>
    zone.addEventListener(e, (ev) => {
      ev.preventDefault();
      zone.classList.remove("is-dragover");
    })
  );
  zone.addEventListener("drop", (ev) => {
    // Dang chay/dang nhap: tha tep vao luc nay la doi du lieu giua chung.
    if (khoaVungTha()) return;
    themFileVaoHangDoi(ev.dataTransfer && ev.dataTransfer.files);
  });

  el("btnImportAll").addEventListener("click", nhapTatCa);
  el("btnClearQueue").addEventListener("click", () => {
    importQueue = [];
    /* Tep dang doc do dang (Excel qua backend, nhan dien loai) se tu
       them vao hang doi khi doc xong — tuc la tep nguoi dung vua xoa
       lai hien ve va bi nhap. Doi the he de cac lan doc cu tu bo. */
    theHeHangDoi += 1;
    /* Xoa luon phan hoi va canh bao cua lan nhap truoc — de lai thi
       nguoi dung tuong ket qua do la cua danh sach dang co. */
    feedback(el("feedbackImportAll"), "", false);
    clear(el("importWarnings"));
    el("importWarnings").hidden = true;
    veHangDoi();
  });
}

/* Chuyen ArrayBuffer -> base64 de gui file nhi phan qua cau noi JS/Python.
   Phai cat khuc: String.fromCharCode.apply co gioi han so doi so, file
   vai tram KB la tran ngan xep. */
function bufferSangBase64(buf) {
  const bytes = new Uint8Array(buf);
  const KHUC = 0x8000;
  let chuoi = "";
  for (let i = 0; i < bytes.length; i += KHUC) {
    chuoi += String.fromCharCode.apply(null, bytes.subarray(i, i + KHUC));
  }
  return btoa(chuoi);
}

function laFileExcel(ten) {
  return /\.(xlsx|xlsm)$/i.test(ten || "");
}

/* Doc mot file thanh TEXT CSV, du no la .csv hay .xlsx.
   Microsoft Forms xuat ra .xlsx — truoc day nguoi dung phai tu mo Excel
   va Save As CSV UTF-8, ma do lai la buoc de sai nhat (chon nham dinh
   dang thi hong het dau tieng Viet). */
function docFileThanhCsv(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    if (laFileExcel(file.name)) {
      reader.onload = () => {
        callApi("xlsx_to_csv_text", bufferSangBase64(reader.result), "").then(
          (res) => {
            if (!res.ok) resolve({ loiRaw: res.errors });
            else resolve({ text: res.data.csv_text });
          }
        );
      };
      // Loi cua chinh trinh duyet: khong co khoa i18n nao, giu nguyen chuoi.
      reader.onerror = () => resolve({ loiText: String(reader.error || "") });
      reader.readAsArrayBuffer(file);
    } else {
      reader.onload = () => resolve({ text: String(reader.result || "") });
      reader.onerror = () => resolve({ loiText: String(reader.error || "") });
      /* UTF-8 doc duoc ca file co BOM cua Excel — backend cat BOM. */
      reader.readAsText(file, "UTF-8");
    }
  });
}

let theHeHangDoi = 0;

function themFileVaoHangDoi(fileList) {
  const files = Array.prototype.slice.call(fileList || []);
  if (!files.length) return;
  const theHe = theHeHangDoi;
  files.forEach((file) => {
    docFileThanhCsv(file).then((doc) => {
      if (theHe !== theHeHangDoi) return; /* hang doi da bi xoa */
      if (doc.loiRaw || doc.loiText) {
        importQueue.push({
          ten: file.name, text: "", kind: "", confident: false,
          candidates: [], loiRaw: doc.loiRaw, loiText: doc.loiText,
        });
        veHangDoi();
        return;
      }
      callApi("detect_csv_kind", doc.text).then((res) => {
        if (theHe !== theHeHangDoi) return;
        if (!res.ok) {
          importQueue.push({
            ten: file.name, text: doc.text, kind: "", confident: false,
            candidates: [], loiRaw: res.errors,
          });
        } else {
          const d = res.data;
          importQueue.push({
            ten: file.name, text: doc.text, kind: d.kind, format: d.format,
            confident: d.confident, candidates: d.candidates || [],
          });
        }
        veHangDoi();
      });
    });
  });
}

function tenLoai(kind) {
  return {
    clubs: t("csv_kind_clubs"),
    test_selection: t("csv_kind_test_selection"),
    preferences: t("csv_kind_preferences"),
  }[kind] || t("csv_kind_unknown_label");
}

/* Canh bao cua lan nhap gan nhat — giu DANG GOC (mang doi tuong loi),
   dich lai moi lan ve. Truoc day chung duoc dich mot lan roi nhet thang
   vao DOM, nen doi ngon ngu xong ca o canh bao ket lai o tieng cu. */
let canhBaoNhapGanNhat = [];

function veCanhBaoNhap() {
  const box = el("importWarnings");
  if (!box) return;
  clear(box);
  box.hidden = canhBaoNhapGanNhat.length === 0;
  canhBaoNhapGanNhat.forEach((w) => {
    const div = document.createElement("div");
    div.textContent = "• " + trErr(w);
    box.appendChild(div);
  });
}

function veHangDoi() {
  const box = el("importQueue");
  const actions = el("importActions");
  clear(box);
  box.hidden = importQueue.length === 0;
  actions.hidden = importQueue.length === 0;
  if (!importQueue.length) return;

  importQueue.forEach((muc, idx) => {
    const row = document.createElement("div");
    row.className = "queue-row";
    if (muc.xong) row.classList.add("is-done");
    else if (muc.loiRaw || muc.loiText || muc.kind === "unknown") row.classList.add("is-unknown");
    else if (!muc.confident) row.classList.add("is-ambiguous");

    const trai = document.createElement("div");
    const ten = document.createElement("div");
    ten.className = "queue-file";
    ten.textContent = muc.ten;
    const chiTiet = document.createElement("div");
    chiTiet.className = "queue-detail";
    // Dich LUC VE, khong cat cau da dich. Cat cau da dich thi ve lai bao
    // nhieu lan cung ra nguyen tieng cu sau khi doi ngon ngu.
    if (muc.xong) chiTiet.textContent = t(muc.ketQuaKhoa, muc.ketQuaSo);
    else if (muc.loiRaw) {
      chiTiet.textContent = trErrs(muc.loiRaw).join(" ");
      ganChiTietKyThuat(chiTiet, muc.loiRaw);
    }
    else if (muc.loiText) chiTiet.textContent = muc.loiText;
    else if (muc.kind === "unknown") chiTiet.textContent = t("queue_unknown");
    else if (!muc.confident) chiTiet.textContent = t("queue_ambiguous");
    else chiTiet.textContent = t("queue_detected", { kind: tenLoai(muc.kind) });
    trai.appendChild(ten);
    trai.appendChild(chiTiet);
    row.appendChild(trai);

    /* Mo ho -> cho chon, KHONG tu doan giup. */
    if (!muc.xong && !muc.confident && muc.candidates && muc.candidates.length) {
      const sel = document.createElement("select");
      sel.className = "queue-kind-select";
      const rong = document.createElement("option");
      rong.value = "";
      rong.textContent = t("queue_pick_kind");
      sel.appendChild(rong);
      muc.candidates.forEach((c) => {
        const o = document.createElement("option");
        o.value = c;
        o.textContent = tenLoai(c);
        sel.appendChild(o);
      });
      sel.value = muc.kind || "";
      sel.addEventListener("change", () => {
        importQueue[idx].kind = sel.value;
        importQueue[idx].confident = !!sel.value;
        veHangDoi();
      });
      row.appendChild(sel);
    }
    box.appendChild(row);
  });
}

function nhapTatCa() {
  const canNhap = importQueue.filter(
    (m) => !m.xong && !m.loiRaw && !m.loiText && m.kind && m.kind !== "unknown"
  );
  if (!canNhap.length) {
    feedback(el("feedbackImportAll"), t("feedback_no_file_selected"), true);
    return;
  }
  /* CLB truoc, roi moi den hoc sinh — xem THU_TU_NHAP. */
  canNhap.sort((a, b) => (THU_TU_NHAP[a.kind] ?? 9) - (THU_TU_NHAP[b.kind] ?? 9));

  datKhoa("dangNhap", true);
  canhBaoNhapGanNhat = [];
  veCanhBaoNhap();
  const canhBao = canhBaoNhapGanNhat;

  /* Nhap TUAN TU, khong song song: file CLB phai ghi xong truoc khi
     file hoc sinh doc bang clubs de kiem tra club_id. */
  canNhap
    .reduce(
      (chuoi, muc) =>
        chuoi.then(() =>
          callApi("import_csv_auto", muc.text, muc.kind).then((res) => {
            if (!res.ok || !res.data) {
              muc.loiRaw = Array.isArray(res.errors) ? res.errors : [res.errors];
              return;
            }
            const d = res.data;
            muc.xong = true;
            // Cat KHOA + SO, khong cat cau da dich — xem veHangDoi().
            if (d.kind === "clubs") {
              muc.ketQuaKhoa = "queue_result_clubs";
              muc.ketQuaSo = {
                n_created: d.n_clubs_created, n_updated: d.n_clubs_updated,
                n_skipped: d.n_rows_skipped,
              };
            } else {
              muc.ketQuaKhoa = "queue_result_students";
              muc.ketQuaSo = {
                n_written:
                  d.n_students_with_preferences_written ??
                  d.n_students_with_selection_written ?? 0,
                n_created: d.n_students_created,
                n_skipped: d.n_students_skipped,
              };
            }
            (d.warnings || []).forEach((w) => canhBao.push(w));
          }).catch((e) => {
            /* Mot tep hong khong duoc chan ca chuoi — ghi loi vao dung
               tep do, cac tep sau van nhap. */
            muc.loiText = String(e);
          })
        ),
      Promise.resolve()
    )
    /* Mot buoc hong bat ngo thi van phai mo khoa va bao tom tat — khong thi
       nut Nhap va vung tha tep bi khoa vinh vien toi khi mo lai app. */
    .catch((e) => console.error(e))
    .then(() => {
      datKhoa("dangNhap", false);
      veHangDoi();
      /* Dem tren DUNG nhung tep vua gui di. Truoc day luon bao xanh "Da
         nhap xong {n} tep" — ke ca khi n = 0 vi moi tep deu loi. */
      const soXong = canNhap.filter((m) => m.xong).length;
      const soLoi = canNhap.length - soXong;
      if (soLoi > 0) {
        const cau = t("feedback_import_mot_phan", {
          n_ok: soXong, n_tong: canNhap.length, n_loi: soLoi,
        });
        feedback(el("feedbackImportAll"), cau, true);
        showToast(cau, "error");
      } else {
        feedback(el("feedbackImportAll"), t("feedback_import_done", { n: soXong }), false);
        showToast(t("feedback_import_done", { n: soXong }), "success");
      }

      veCanhBaoNhap();
      refreshDashboardStats();
      loadHealthReport(); // du lieu vua doi -> canh bao co the da khac
      /* Vung tha tep nam CUNG THE voi bo chon buoi, nen nhap xong ma khong
         chuyen the thi `dsBuoiCoThe` con la danh sach truoc khi nhap. Mot
         tep CLB mang buoi moi vao se khong co the nao, va neu nguoi dung da
         bo chon vai buoi tu truoc thi buoi moi bi loai khoi lan chay ma
         khong ai thay.

         Nap lai dat `buoiDangChon` ve CHON HET. Tap buoi vua doi thi do la
         huong an toan — chay ca tuan — chu khong phai huong lang le bo sot. */
      loadChonBuoi({ datLai: true });
    });
}
