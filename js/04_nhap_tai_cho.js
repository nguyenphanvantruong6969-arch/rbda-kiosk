/* js/04_nhap_tai_cho.js — Thẻ 03 — Nhập tại chỗ (kiosk): chọn học sinh, tick thi, xếp nguyện vọng.

   Một phần của giao diện chính, tách từ app.js cũ. Các tệp js/ là SCRIPT
   THƯỜNG (không phải ES module) nạp theo đúng thứ tự trong index.html và
   dùng chung một phạm vi — như một tệp duy nhất trước đây. Không dùng ES
   module vì mở trang bằng file:// thì trình duyệt chặn chúng.
*/
"use strict";

/* ------------------------------------------------------------------ *
 * 5. TAB 3 — NHẬP TẠI CHỖ (KIOSK FALLBACK)
 * ------------------------------------------------------------------ */

let currentFallbackStudent = null;
let currentClubs = [];
/* Bảng tra club_id -> buổi, nạp cùng danh sách CLB ở màn nhập tại chỗ.
   Giữ riêng thay vì hỏi lại backend mỗi lần bấm, vì chỉ báo phủ buổi
   phải cập nhật ngay theo từng cú bấm xếp hạng. */
let buoiCuaClb = {};
let currentRanking = [];
let fallbackStudentPage = 1;
const FALLBACK_PAGE_SIZE = 8;

function loadFallbackTab() {
  fallbackStudentPage = 1;
  loadFallbackStudentList();
}

function initFallbackHandlers() {
  el("btnStudentSearch").addEventListener("click", () => {
    fallbackStudentPage = 1;
    loadFallbackStudentList();
  });
  el("studentSearchInput").addEventListener(
    "input",
    debounce(() => {
      fallbackStudentPage = 1;
      loadFallbackStudentList();
    }, 250)
  );
  el("btnFallbackPrevPage").addEventListener("click", () => {
    if (fallbackStudentPage > 1) {
      fallbackStudentPage -= 1;
      loadFallbackStudentList();
    }
  });
  el("btnFallbackNextPage").addEventListener("click", () => {
    fallbackStudentPage += 1;
    loadFallbackStudentList();
  });
  el("btnCreateStudent").addEventListener("click", () => {
    const id = el("newStudentId").value.trim();
    const name = el("newStudentName").value.trim();
    if (!id || !name) {
      showToast(t("toast_need_id_and_name"), "error");
      return;
    }
    khiBan(el("btnCreateStudent"), () => callApi("create_student_if_missing", id, name)).then((res) => {
      if (!res.ok) {
        showToast(cauLoi(res.errors), "error");
        return;
      }
      showToast(res.data.created ? t("toast_student_created") : t("toast_student_exists"), "success");
      el("newStudentId").value = "";
      el("newStudentName").value = "";
      loadFallbackStudentList();
      selectFallbackStudent(id);
    });
  });

  el("btnSubmitTestSelection").addEventListener("click", () => {
    if (!currentFallbackStudent) return;
    const checked = Array.from(document.querySelectorAll("#testSelectionGrid .option-row.is-checked")).map(
      (row) => row.dataset.clubId
    );
    khiBan(el("btnSubmitTestSelection"), () => callApi("submit_test_selection", currentFallbackStudent, checked)).then((res) => {
      if (res.ok) feedback(el("testSelectionFeedback"), t("feedback_test_selection_saved", { n: res.data.n_selected }), false);
      else feedback(el("testSelectionFeedback"), cauLoi(res.errors), true);
    });
  });

  el("btnClearRanking").addEventListener("click", () => {
    currentRanking = [];
    renderRankingList();
  });

  el("btnSubmitPreferences").addEventListener("click", () => {
    if (!currentFallbackStudent) return;
    if (!currentRanking.length) {
      feedback(el("preferencesFeedback"), trErr({ code: "must_rank_at_least_one", params: {} }), true);
      return;
    }
    khiBan(el("btnSubmitPreferences"), () => callApi("submit_preferences", currentFallbackStudent, currentRanking)).then((res) => {
      if (res.ok) feedback(el("preferencesFeedback"), t("feedback_preferences_saved", { n: res.data.n_ranked }), false);
      else feedback(el("preferencesFeedback"), cauLoi(res.errors), true);
    });
  });

  armTwoStepConfirm(el("btnResetStudentEntry"), () => t("confirm_reset_entry"), () => {
    if (!currentFallbackStudent) return;
    callApi("reset_student_entry", currentFallbackStudent).then((res) => {
      if (res.ok) {
        showToast(t("toast_reset_done"), "success");
        selectFallbackStudent(currentFallbackStudent);
      } else {
        showToast(cauLoi(res.errors), "error");
      }
    });
  });

  armTwoStepConfirm(el("btnDeleteStudent"), () => t("confirm_delete_student"), () => {
    if (!currentFallbackStudent) return;
    const studentId = currentFallbackStudent;
    callApi("delete_student", studentId).then((res) => {
      if (res.ok) {
        showToast(t("toast_student_deleted", { student_id: studentId }), "success");
        currentFallbackStudent = null;
        el("fallbackWorkArea").hidden = true;
        el("studentSearchInput").value = "";
        loadFallbackStudentList();
      } else {
        showToast(cauLoi(res.errors, "toast_delete_failed_prefix"), "error");
      }
    });
  });
}

function loadFallbackStudentList() {
  const q = el("studentSearchInput").value.trim();
  callApiMoiNhat("ds_hs_tai_cho", "list_students_admin", q, fallbackStudentPage, FALLBACK_PAGE_SIZE).then((res) => {
    const box = el("studentSearchResults");
    const pagination = el("fallbackStudentPagination");
    clear(box);
    if (!res.ok || !res.data.rows.length) {
      box.innerHTML = '<div class="empty-state"></div>';
      box.firstChild.textContent = t("search_no_students_found");
      pagination.hidden = true;
      return;
    }
    res.data.rows.forEach((s) => {
      const row = document.createElement("div");
      row.className = "search-result-item";
      const testedTag = `<span class="club-tag${s.n_tested ? "" : " is-empty"}">${esc(t("fallback_tag_tested", { n: s.n_tested }))}</span>`;
      const rankedTag = `<span class="club-tag${s.n_ranked ? "" : " is-empty"}">${esc(t("fallback_tag_ranked", { n: s.n_ranked }))}</span>`;
      row.innerHTML =
        `<span>${esc(s.name)}</span>` +
        `<span class="search-result-meta">${testedTag}${rankedTag}<span class="search-result-id">${esc(s.student_id)}</span></span>`;
      row.addEventListener("click", () => selectFallbackStudent(s.student_id));
      choBamDuoc(row, false);
      box.appendChild(row);
    });
    pagination.hidden = false;
    el("fallbackPaginationLabel").textContent = t("pagination_label", {
      page: res.data.page, total_pages: res.data.total_pages, total: res.data.total,
    });
    el("btnFallbackPrevPage").disabled = res.data.page <= 1;
    el("btnFallbackNextPage").disabled = res.data.page >= res.data.total_pages;
  });
}

function selectFallbackStudent(studentId) {
  const luotChon = (luotGoiMoiNhat.chon_hs = (luotGoiMoiNhat.chon_hs || 0) + 1);
  buoiTaiCho = null;
  Promise.all([callApi("get_student_entry_state", studentId), callApi("list_clubs")]).then(([stateRes, clubsRes]) => {
    /* Bam nhanh hai em: chi lan bam CUOI duoc ve, xem callApiMoiNhat. */
    if (luotChon !== luotGoiMoiNhat.chon_hs) return;
    if (!stateRes.ok) {
      showToast(cauLoi(stateRes.errors), "error");
      return;
    }
    currentFallbackStudent = studentId;
    currentClubs = clubsRes.ok ? clubsRes.data : [];
    buoiCuaClb = {};
    currentClubs.forEach((c) => { buoiCuaClb[c.club_id] = c.buoi; });
    currentRanking = stateRes.data.ranked_clubs.slice();

    el("fallbackWorkArea").hidden = false;
    el("currentStudentLabel").textContent = `${stateRes.data.name} (${stateRes.data.student_id})`;

    renderTestSelectionGrid(stateRes.data.tested_clubs);
    renderRankingSourceGrid();
    renderRankingList();
  });
}

function renderTestSelectionGrid(testedClubIds) {
  const grid = el("testSelectionGrid");
  clear(grid);
  currentClubs.forEach((c) => {
    const row = document.createElement("div");
    row.className = "option-row" + (testedClubIds.includes(c.club_id) ? " is-checked" : "");
    row.dataset.clubId = c.club_id;
    row.innerHTML = `<span>${esc(c.name)}</span><span class="cb-club-id">${esc(c.club_id)}</span>`;
    row.addEventListener("click", () => {
      /* Bo tick thi luon cho; chi CHAN khi dang bat them. */
      if (!row.classList.contains("is-checked")) {
        const buoiNay = c.buoi || BUOI_MAC_DINH;
        const daCo = Array.from(
          document.querySelectorAll("#testSelectionGrid .option-row.is-checked")
        ).filter(
          (r) => (clubBuoi(r.dataset.clubId) || BUOI_MAC_DINH) === buoiNay
        ).length;
        if (daCo >= TRAN_CLB_THI_MOI_BUOI) {
          showToast(
            trErr({
              code: "max_thi_moi_buoi",
              params: { buoi: nhanBuoi(buoiNay), tran: TRAN_CLB_THI_MOI_BUOI },
            }),
            "error"
          );
          return;
        }
      }
      row.classList.toggle("is-checked");
    });
    choBamDuoc(row, true);
    grid.appendChild(row);
  });
}

function renderRankingSourceGrid() {
  const grid = el("rankingSourceGrid");
  clear(grid);
  currentClubs.forEach((c) => {
    const row = document.createElement("div");
    row.className = "option-row";
    row.dataset.clubId = c.club_id;
    /* Hien BUOI thay vi ma CLB khi truong dung nhieu buoi: o buoc nay
       hoc sinh dang quyet dinh "tuan minh kin chua", va buoi la thong
       tin giup quyet dinh — ma CLB thi khong. */
    const phu = c.buoi && c.buoi !== BUOI_MAC_DINH ? nhanBuoi(c.buoi) : c.club_id;
    row.innerHTML = `<span>${esc(c.name)}</span><span class="cb-club-id">${esc(phu)}</span>`;
    row.addEventListener("click", () => {
      if (currentRanking.includes(c.club_id)) {
        showToast(trErr({ code: "duplicate_preference_in_list", params: {} }), "error");
        return;
      }
      /* Dem theo BUOI cua chinh CLB dang bam, khong dem tong ca tuan.
         Tong 10 la tran cua truong MOT buoi; voi sau buoi thi em nao chon
         2 CLB moi buoi da cham tran o CLB thu 11 va khong hieu vi sao. */
      const buoiNay = c.buoi || BUOI_MAC_DINH;
      const daCo = currentRanking.filter(
        (id) => (clubBuoi(id) || BUOI_MAC_DINH) === buoiNay
      ).length;
      if (daCo >= TRAN_NGUYEN_VONG_MOI_BUOI) {
        showToast(
          trErr({
            code: "max_pref_moi_buoi",
            params: { buoi: nhanBuoi(buoiNay), tran: TRAN_NGUYEN_VONG_MOI_BUOI },
          }),
          "error"
        );
        return;
      }
      currentRanking.push(c.club_id);
      renderRankingList();
    });
    choBamDuoc(row, false);
    grid.appendChild(row);
  });
}

function renderRankingList() {
  const list = el("rankingList");
  clear(list);
  veChiBaoPhuBuoi(currentRanking);
  currentRanking.forEach((cid, idx) => {
    const club = currentClubs.find((c) => c.club_id === cid);
    const li = document.createElement("li");
    const label = document.createElement("span");
    label.textContent = `${club ? club.name : cid} (${cid})`;
    const removeBtn = document.createElement("button");
    removeBtn.textContent = t("btn_remove_ranked");
    removeBtn.addEventListener("click", () => {
      currentRanking.splice(idx, 1);
      renderRankingList();
    });
    li.appendChild(label);
    li.appendChild(removeBtn);
    list.appendChild(li);
  });
}
