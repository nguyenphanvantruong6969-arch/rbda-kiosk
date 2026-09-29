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

function loadPipelineTab() {
  refreshDashboardStats();
  refreshStbLockLine();
  refreshSidebarStatus();
  loadHealthReport();
  loadChonBuoi();
}

/* ---- Cảnh báo sức khoẻ dữ liệu (pre-flight) ---- */

function loadHealthReport() {
  callApi("get_data_health_report").then((res) => {
    const summary = el("healthSummary");
    const list = el("healthList");
    clear(list);

    if (!res.ok) {
      summary.className = "health-summary is-warn";
      summary.textContent = trErrs(res.errors).join("; ");
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
}

function refreshDashboardStats() {
  callApi("get_dashboard_status").then((res) => {
    if (!res.ok) {
      showToast(cauLoi(res.errors, "toast_dashboard_read_failed"), "error");
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
    }
  });
}

let forceRedrawArmed = false;
let forceRedrawTimer = null;

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
  const khoa = seedKhoa !== null && !forceRedrawArmed;
  if (khoa) o.value = seedKhoa;
  o.readOnly = khoa;
  o.title = khoa ? t("seed_locked_hint", { seed: seedKhoa }) : "";
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

function datVeLai(bat) {
  forceRedrawArmed = bat;
  capNhatOHatGiong();
}

function promptForceRedraw() {
  /* Huy hen gio cu: bat -> tat -> bat lai trong 20 giay thi hen gio cua
     lan bat DAU se tat lan bat moi som hon nguoi dung tuong. */
  clearTimeout(forceRedrawTimer);
  if (!forceRedrawArmed) {
    datVeLai(true);
    showToast(t("toast_redraw_armed"), "error");
    forceRedrawTimer = setTimeout(() => {
      datVeLai(false);
    }, 20000);
  } else {
    datVeLai(false);
  }
}

function renderSteps(steps) {
  lastRenderedSteps = steps;
  const stepper = el("stepper");
  steps.forEach((s) => {
    const li = stepper.querySelector(`.step[data-step="${s.step}"]`);
    if (!li) return;
    li.dataset.status = s.status;
    const detail = li.querySelector(".step-detail");
    if (s.status === "running") detail.textContent = t("step_running");
    else if (s.status === "done") detail.textContent = s.detail ? trErr(s.detail) : t("step_done_default");
    else if (s.status === "error")
      detail.textContent = Array.isArray(s.detail) ? trErrs(s.detail).join(" | ") : (s.detail ? trErr(s.detail) : t("generic_error"));
  });
}

function resetSteps() {
  lastRenderedSteps = null;
  document.querySelectorAll("#stepper .step").forEach((li) => {
    li.dataset.status = "";
    li.querySelector(".step-detail").textContent = t("step_not_run_yet");
  });
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
  box.textContent = trErrs(errors).join("\n");
}

function initPipelineHandlers() {
  el("btnValidate").addEventListener("click", () => {
    el("btnValidate").disabled = true;
    callApi("check_data_integrity").then((res) => {
      el("btnValidate").disabled = false;
      if (res.ok) {
        showToast(t("toast_data_valid", { n_students: res.data.n_students, n_clubs: res.data.n_clubs }), "success");
        showLog(null);
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

  callApi("get_pipeline_run_warning").then((warn) => {
    /* `|| 42` bien seed 0 — mot seed hop le — thanh 42. Chi lui ve 42
       khi o trong hoac khong phai so. */
    const seedNhap = parseInt(el("seedInput").value, 10);
    const seed = Number.isNaN(seedNhap) ? 42 : seedNhap;
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
      bar.remove();
      datVeLai(false);
      executeRun(seed, wantsRedraw, chiBuoi);
    });
    const cancelBtn = document.createElement("button");
    cancelBtn.className = "btn btn-ghost";
    cancelBtn.textContent = t("btn_cancel");
    cancelBtn.addEventListener("click", () => {
      bar.remove();
      datVeLai(false);
    });
    bar.appendChild(confirmBtn);
    bar.appendChild(cancelBtn);
    el("stepper").insertAdjacentElement("beforebegin", bar);
  });
}

function executeRun(seed, forceRedraw, chiBuoi) {
  resetSteps();
  showLog(null);
  el("btnRun").disabled = true;
  el("btnValidate").disabled = true;

  /* Nhan `chiBuoi` tu tren xuong, KHONG goi lai `buoiGuiDi()`: con so
     gui di phai dung bang con so da hua o thanh xac nhan. */
  callApi("run_pipeline", seed, forceRedraw, chiBuoi).then((res) => {
    el("btnRun").disabled = false;
    el("btnValidate").disabled = false;
    const steps = (res.data && res.data.steps) || [];
    renderSteps(steps);

    if (res.ok) {
      showToast(
        t("toast_run_success", {
          n_matched: res.data.n_matched,
          n_total: res.data.n_total,
          rounds: res.data.rounds_run,
        }),
        "success"
      );
      showLog(null);
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

  zone.addEventListener("click", () => input.click());
  zone.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); input.click(); }
  });
  input.addEventListener("change", (ev) => {
    themFileVaoHangDoi(ev.target.files);
    input.value = ""; // cho phep tha lai dung file do
  });

  ["dragenter", "dragover"].forEach((e) =>
    zone.addEventListener(e, (ev) => {
      ev.preventDefault();
      zone.classList.add("is-dragover");
    })
  );
  ["dragleave", "drop"].forEach((e) =>
    zone.addEventListener(e, (ev) => {
      ev.preventDefault();
      zone.classList.remove("is-dragover");
    })
  );
  zone.addEventListener("drop", (ev) => {
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
    else if (muc.loiRaw) chiTiet.textContent = trErrs(muc.loiRaw).join("; ");
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

  const btn = el("btnImportAll");
  btn.disabled = true;
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
    .finally(() => { btn.disabled = false; })
    .then(() => {
      veHangDoi();
      const soXong = importQueue.filter((m) => m.xong).length;
      feedback(el("feedbackImportAll"), t("feedback_import_done", { n: soXong }), false);
      showToast(t("feedback_import_done", { n: soXong }), "success");

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
      loadChonBuoi();
    });
}
