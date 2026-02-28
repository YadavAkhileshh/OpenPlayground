/* Interview Scheduler UI
   - Frontend-only
   - Local storage persistence: form values + schedules + last updated timestamp
   - Custom confirm modal for destructive actions
   - Inline validation (no alerts)
*/

(() => {
  "use strict";

  const LS_KEY = "interviewSchedulerUI.v1";

  const el = {
    form: document.getElementById("scheduleForm"),

    candidateName: document.getElementById("candidateName"),
    candidateEmail: document.getElementById("candidateEmail"),
    roleTitle: document.getElementById("roleTitle"),
    interviewer: document.getElementById("interviewer"),
    mode: document.getElementById("mode"),
    round: document.getElementById("round"),
    date: document.getElementById("date"),
    time: document.getElementById("time"),
    duration: document.getElementById("duration"),
    timezone: document.getElementById("timezone"),
    location: document.getElementById("location"),
    locationHint: document.getElementById("locationHint"),
    status: document.getElementById("status"),
    notes: document.getElementById("notes"),

    errCandidateName: document.getElementById("errCandidateName"),
    errCandidateEmail: document.getElementById("errCandidateEmail"),
    errRoleTitle: document.getElementById("errRoleTitle"),
    errInterviewer: document.getElementById("errInterviewer"),
    errDate: document.getElementById("errDate"),
    errTime: document.getElementById("errTime"),
    errDuration: document.getElementById("errDuration"),
    errLocation: document.getElementById("errLocation"),

    rows: document.getElementById("rows"),
    emptyState: document.getElementById("emptyState"),
    countText: document.getElementById("countText"),

    search: document.getElementById("search"),
    filterStatus: document.getElementById("filterStatus"),

    btnDemo: document.getElementById("btnDemo"),
    btnResetInputs: document.getElementById("btnResetInputs"),
    btnClearSaved: document.getElementById("btnClearSaved"),
    btnPrint: document.getElementById("btnPrint"),

    lastSavedText: document.getElementById("lastSavedText"),

    modal: document.getElementById("confirmModal"),
    modalClose: document.getElementById("confirmClose"),
    modalCancel: document.getElementById("confirmCancel"),
    modalOk: document.getElementById("confirmOk"),
    modalDesc: document.getElementById("confirmDesc"),
    modalMeta: document.getElementById("confirmMeta")
  };

  const state = {
    form: defaultForm(),
    schedules: [],
    lastSaved: "",
    search: "",
    filterStatus: "all"
  };

  let confirmResolver = null;

  function defaultForm() {
    return {
      candidateName: "",
      candidateEmail: "",
      roleTitle: "",
      interviewer: "",
      mode: "video",
      round: "screening",
      date: "",
      time: "",
      duration: "60",
      timezone: "IST",
      location: "",
      status: "scheduled",
      notes: ""
    };
  }

  function uid() {
    // Simple, stable enough for local-only IDs
    return "sch_" + Math.random().toString(16).slice(2) + "_" + Date.now().toString(16);
  }

  function formatTimestamp(d) {
    // Format exactly: Month D, Yr
    const months = [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December"
    ];
    const month = months[d.getMonth()];
    const day = d.getDate();
    const year = d.getFullYear();
    return `${month} ${day}, ${year}`;
  }

  function readStorage() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return null;
      return parsed;
    } catch {
      return null;
    }
  }

  function writeStorage() {
    state.lastSaved = formatTimestamp(new Date());

    const payload = {
      form: { ...state.form },
      schedules: [...state.schedules],
      lastSaved: state.lastSaved,
      table: {
        search: state.search,
        filterStatus: state.filterStatus
      }
    };

    localStorage.setItem(LS_KEY, JSON.stringify(payload));
    renderLastSaved();
  }

  function clearStorage() {
    localStorage.removeItem(LS_KEY);
  }

  function renderLastSaved() {
    el.lastSavedText.textContent = `Last saved: ${state.lastSaved || "-"}`;
  }

  function syncFormToUI() {
    el.candidateName.value = state.form.candidateName;
    el.candidateEmail.value = state.form.candidateEmail;
    el.roleTitle.value = state.form.roleTitle;
    el.interviewer.value = state.form.interviewer;
    el.mode.value = state.form.mode;
    el.round.value = state.form.round;
    el.date.value = state.form.date;
    el.time.value = state.form.time;
    el.duration.value = state.form.duration;
    el.timezone.value = state.form.timezone;
    el.location.value = state.form.location;
    el.status.value = state.form.status;
    el.notes.value = state.form.notes;

    el.search.value = state.search;
    el.filterStatus.value = state.filterStatus;

    updateLocationRequirementUI();
  }

  function syncUIToForm() {
    state.form.candidateName = el.candidateName.value.trim();
    state.form.candidateEmail = el.candidateEmail.value.trim();
    state.form.roleTitle = el.roleTitle.value.trim();
    state.form.interviewer = el.interviewer.value.trim();
    state.form.mode = el.mode.value;
    state.form.round = el.round.value;
    state.form.date = el.date.value;
    state.form.time = el.time.value;
    state.form.duration = el.duration.value;
    state.form.timezone = el.timezone.value;
    state.form.location = el.location.value.trim();
    state.form.status = el.status.value;
    state.form.notes = el.notes.value.trim();
  }

  function setFieldError(fieldEl, errEl, msg) {
    const wrap = fieldEl.closest(".field");
    if (!wrap) return;
    if (msg) {
      wrap.classList.add("isInvalid");
      errEl.textContent = msg;
    } else {
      wrap.classList.remove("isInvalid");
      errEl.textContent = "";
    }
  }

  function isValidEmail(email) {
    // Basic validation; strict RFC is not needed here.
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function parseDuration(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return null;
    return n;
  }

  function needsLocation(mode) {
    // Video + onsite require a link or address
    return mode === "video" || mode === "onsite";
  }

  function updateLocationRequirementUI() {
    const mode = el.mode.value;
    if (needsLocation(mode)) {
      el.locationHint.textContent = "Required for video and onsite.";
    } else {
      el.locationHint.textContent = "Optional for phone screen.";
    }
  }

  function validateForm() {
    syncUIToForm();

    let ok = true;

    // Candidate name
    if (!state.form.candidateName) {
      setFieldError(el.candidateName, el.errCandidateName, "Enter a candidate name.");
      ok = false;
    } else {
      setFieldError(el.candidateName, el.errCandidateName, "");
    }

    // Email (optional, but validate if provided)
    if (state.form.candidateEmail && !isValidEmail(state.form.candidateEmail)) {
      setFieldError(el.candidateEmail, el.errCandidateEmail, "Enter a valid email format.");
      ok = false;
    } else {
      setFieldError(el.candidateEmail, el.errCandidateEmail, "");
    }

    // Role
    if (!state.form.roleTitle) {
      setFieldError(el.roleTitle, el.errRoleTitle, "Enter the role title.");
      ok = false;
    } else {
      setFieldError(el.roleTitle, el.errRoleTitle, "");
    }

    // Interviewer
    if (!state.form.interviewer) {
      setFieldError(el.interviewer, el.errInterviewer, "Enter an interviewer name.");
      ok = false;
    } else {
      setFieldError(el.interviewer, el.errInterviewer, "");
    }

    // Date
    if (!state.form.date) {
      setFieldError(el.date, el.errDate, "Select an interview date.");
      ok = false;
    } else {
      setFieldError(el.date, el.errDate, "");
    }

    // Time
    if (!state.form.time) {
      setFieldError(el.time, el.errTime, "Select an interview time.");
      ok = false;
    } else {
      setFieldError(el.time, el.errTime, "");
    }

    // Duration
    const dur = parseDuration(state.form.duration);
    if (dur === null) {
      setFieldError(el.duration, el.errDuration, "Enter a number in minutes.");
      ok = false;
    } else if (dur < 15 || dur > 240) {
      setFieldError(el.duration, el.errDuration, "Use a value between 15 and 240.");
      ok = false;
    } else {
      setFieldError(el.duration, el.errDuration, "");
    }

    // Location conditionally required
    if (needsLocation(state.form.mode) && !state.form.location) {
      setFieldError(el.location, el.errLocation, "Add a meeting link or location.");
      ok = false;
    } else {
      setFieldError(el.location, el.errLocation, "");
    }

    return ok;
  }

  function modeLabel(mode) {
    if (mode === "video") return "Video";
    if (mode === "onsite") return "Onsite";
    return "Phone";
  }

  function roundLabel(round) {
    const map = {
      screening: "Screening",
      technical: "Technical",
      systemDesign: "System design",
      managerial: "Managerial",
      hr: "HR"
    };
    return map[round] || round;
  }

  function statusLabel(s) {
    const map = {
      scheduled: "Scheduled",
      confirmed: "Confirmed",
      reschedule: "Reschedule",
      completed: "Completed",
      cancelled: "Cancelled"
    };
    return map[s] || s;
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function filteredSchedules() {
    const q = state.search.trim().toLowerCase();
    const fs = state.filterStatus;

    return state.schedules.filter((item) => {
      if (fs !== "all" && item.status !== fs) return false;

      if (!q) return true;
      const hay = [
        item.candidateName,
        item.roleTitle,
        item.interviewer,
        item.candidateEmail || ""
      ].join(" ").toLowerCase();

      return hay.includes(q);
    });
  }

  function renderTable() {
    const items = filteredSchedules();

    el.rows.innerHTML = items.map((item) => {
      const candidate = escapeHtml(item.candidateName);
      const role = escapeHtml(item.roleTitle);
      const interviewer = escapeHtml(item.interviewer);
      const date = escapeHtml(item.date);
      const time = escapeHtml(item.time);
      const type = escapeHtml(modeLabel(item.mode));
      const round = escapeHtml(roundLabel(item.round));
      const duration = escapeHtml(String(item.duration));
      const status = escapeHtml(item.status);

      return `
        <tr data-id="${escapeHtml(item.id)}">
          <td>
            <div style="display:flex; flex-direction:column; gap:2px;">
              <div style="font-weight:800; letter-spacing:0.1px;">${candidate}</div>
              <div style="font-size:11px; color:rgba(255,255,255,0.62);">${escapeHtml(item.candidateEmail || "")}</div>
            </div>
          </td>
          <td>${role}</td>
          <td>${interviewer}</td>
          <td style="font-family: var(--mono); font-size:11px;">${date}</td>
          <td style="font-family: var(--mono); font-size:11px;">${time}</td>
          <td>${type}</td>
          <td>${round}</td>
          <td style="font-family: var(--mono); font-size:11px;">${duration} min</td>
          <td>
            <span class="chip" data-s="${status}">
              <span class="dot" aria-hidden="true"></span>
              ${escapeHtml(statusLabel(item.status))}
            </span>
          </td>
          <td class="colActions">
            <div class="rowActions">
              <button class="smallBtn" type="button" data-act="edit" title="Load into form">
                <i class="fa-regular fa-pen-to-square" aria-hidden="true"></i>
                Edit
              </button>
              <button class="smallBtn danger" type="button" data-act="delete" title="Delete schedule">
                <i class="fa-regular fa-trash-can" aria-hidden="true"></i>
                Delete
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");

    const count = items.length;
    el.countText.textContent = `${count} item${count === 1 ? "" : "s"}`;

    el.emptyState.hidden = state.schedules.length !== 0;
  }

  function openConfirm({ desc, meta }) {
    el.modalDesc.textContent = desc || "Are you sure?";
    el.modalMeta.textContent = meta || "This cannot be undone.";

    el.modal.classList.add("isOpen");
    el.modal.setAttribute("aria-hidden", "false");

    // Focus the safest default
    el.modalCancel.focus();

    return new Promise((resolve) => {
      confirmResolver = resolve;
    });
  }

  function closeConfirm(result) {
    el.modal.classList.remove("isOpen");
    el.modal.setAttribute("aria-hidden", "true");

    if (typeof confirmResolver === "function") {
      confirmResolver(result);
      confirmResolver = null;
    }
  }

  function bindConfirmModal() {
    el.modal.addEventListener("click", (e) => {
      const t = e.target;
      if (t && t.getAttribute && t.getAttribute("data-close") === "1") {
        closeConfirm(false);
      }
    });

    el.modalClose.addEventListener("click", () => closeConfirm(false));
    el.modalCancel.addEventListener("click", () => closeConfirm(false));
    el.modalOk.addEventListener("click", () => closeConfirm(true));

    document.addEventListener("keydown", (e) => {
      if (!el.modal.classList.contains("isOpen")) return;
      if (e.key === "Escape") closeConfirm(false);
    });
  }

  function loadFromStorage() {
    const stored = readStorage();
    if (!stored) {
      state.form = defaultForm();
      state.schedules = [];
      state.lastSaved = "";
      state.search = "";
      state.filterStatus = "all";
      return;
    }

    state.form = { ...defaultForm(), ...(stored.form || {}) };
    state.schedules = Array.isArray(stored.schedules) ? stored.schedules : [];
    state.lastSaved = typeof stored.lastSaved === "string" ? stored.lastSaved : "";

    if (stored.table && typeof stored.table === "object") {
      state.search = typeof stored.table.search === "string" ? stored.table.search : "";
      state.filterStatus = typeof stored.table.filterStatus === "string" ? stored.table.filterStatus : "all";
    }
  }

  function resetInputsOnly() {
    state.form = defaultForm();
    syncFormToUI();
    clearInlineErrors();
    writeStorage();
  }

  function clearInlineErrors() {
    setFieldError(el.candidateName, el.errCandidateName, "");
    setFieldError(el.candidateEmail, el.errCandidateEmail, "");
    setFieldError(el.roleTitle, el.errRoleTitle, "");
    setFieldError(el.interviewer, el.errInterviewer, "");
    setFieldError(el.date, el.errDate, "");
    setFieldError(el.time, el.errTime, "");
    setFieldError(el.duration, el.errDuration, "");
    setFieldError(el.location, el.errLocation, "");
  }

  function addSchedule() {
    const dur = Number(state.form.duration);

    const entry = {
      id: uid(),
      candidateName: state.form.candidateName,
      candidateEmail: state.form.candidateEmail,
      roleTitle: state.form.roleTitle,
      interviewer: state.form.interviewer,
      mode: state.form.mode,
      round: state.form.round,
      date: state.form.date,
      time: state.form.time,
      duration: dur,
      timezone: state.form.timezone,
      location: state.form.location,
      status: state.form.status,
      notes: state.form.notes,
      createdAt: Date.now()
    };

    // Newest on top
    state.schedules.unshift(entry);
    writeStorage();
    renderTable();
  }

  function deleteScheduleById(id) {
    state.schedules = state.schedules.filter((x) => x.id !== id);
    writeStorage();
    renderTable();
  }

  function loadScheduleIntoForm(id) {
    const item = state.schedules.find((x) => x.id === id);
    if (!item) return;

    state.form = {
      candidateName: item.candidateName || "",
      candidateEmail: item.candidateEmail || "",
      roleTitle: item.roleTitle || "",
      interviewer: item.interviewer || "",
      mode: item.mode || "video",
      round: item.round || "screening",
      date: item.date || "",
      time: item.time || "",
      duration: String(item.duration || "60"),
      timezone: item.timezone || "IST",
      location: item.location || "",
      status: item.status || "scheduled",
      notes: item.notes || ""
    };

    syncFormToUI();
    clearInlineErrors();
    writeStorage();
  }

  function demoData() {
    // Realistic sample values for the current mode
    const mode = el.mode.value;

    const base = {
      candidateName: "Riya Sharma",
      candidateEmail: "riya.sharma@email.com",
      roleTitle: "Frontend Developer",
      interviewer: "Neha Verma",
      round: "technical",
      duration: "60",
      timezone: "IST",
      status: "scheduled",
      notes: "Focus on React patterns, state management, and accessibility."
    };

    const today = new Date();
    const dd = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const yyyy = dd.getFullYear();
    const mm = String(dd.getMonth() + 1).padStart(2, "0");
    const day = String(dd.getDate()).padStart(2, "0");

    // Set date tomorrow and a clean time
    base.date = `${yyyy}-${mm}-${day}`;
    base.time = "11:30";

    if (mode === "video") {
      base.mode = "video";
      base.location = "https://meet.google.com/abc-defg-hij";
    } else if (mode === "onsite") {
      base.mode = "onsite";
      base.location = "Office - 2nd floor, Meeting Room B";
    } else {
      base.mode = "phone";
      base.location = "";
      base.round = "screening";
      base.duration = "30";
      base.notes = "Quick screening: availability, role alignment, and salary expectations.";
    }

    state.form = { ...state.form, ...base };
    syncFormToUI();
    clearInlineErrors();
    writeStorage();
  }

  function bindEvents() {
    // Autosave on input changes (with light debouncing)
    let t = null;
    const scheduleSave = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        syncUIToForm();
        writeStorage();
      }, 150);
    };

    [
      el.candidateName, el.candidateEmail, el.roleTitle, el.interviewer,
      el.mode, el.round, el.date, el.time, el.duration,
      el.timezone, el.location, el.status, el.notes
    ].forEach((node) => node.addEventListener("input", scheduleSave));

    el.mode.addEventListener("change", () => {
      updateLocationRequirementUI();
      scheduleSave();
      // Re-validate location when type changes
      validateForm();
    });

    // Search and filter
    el.search.addEventListener("input", () => {
      state.search = el.search.value;
      writeStorage();
      renderTable();
    });

    el.filterStatus.addEventListener("change", () => {
      state.filterStatus = el.filterStatus.value;
      writeStorage();
      renderTable();
    });

    // Add schedule
    el.form.addEventListener("submit", (e) => {
      e.preventDefault();
      const ok = validateForm();
      if (!ok) return;
      addSchedule();
      // Keep inputs for rapid entry, but nudge time forward a bit
      // No heavy logic: just clear notes to reduce repetition
      state.form.notes = "";
      syncFormToUI();
      writeStorage();
    });

    // Table actions (event delegation)
    el.rows.addEventListener("click", async (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;

      const tr = btn.closest("tr");
      if (!tr) return;

      const id = tr.getAttribute("data-id");
      const act = btn.getAttribute("data-act");

      if (act === "edit") {
        loadScheduleIntoForm(id);
        // Bring user attention to the form on smaller screens
        document.querySelector(".formCard").scrollIntoView({ behavior: "smooth", block: "start" });
      }

      if (act === "delete") {
        const sure = await openConfirm({
          desc: "Delete this schedule entry?",
          meta: "This will remove it from the list and saved data."
        });
        if (sure) deleteScheduleById(id);
        closeConfirm(false);
      }
    });

    // Buttons
    el.btnDemo.addEventListener("click", () => demoData());

    el.btnResetInputs.addEventListener("click", async () => {
      const sure = await openConfirm({
        desc: "Reset current inputs?",
        meta: "This resets only the form fields. Saved schedules remain."
      });
      if (sure) resetInputsOnly();
      closeConfirm(false);
    });

    el.btnClearSaved.addEventListener("click", async () => {
      const sure = await openConfirm({
        desc: "Clear saved data?",
        meta: "This clears all saved schedules and form values."
      });
      if (sure) {
        clearStorage();
        state.form = defaultForm();
        state.schedules = [];
        state.lastSaved = "";
        state.search = "";
        state.filterStatus = "all";
        syncFormToUI();
        renderLastSaved();
        renderTable();
      }
      closeConfirm(false);
    });

    el.btnPrint.addEventListener("click", () => {
      // Print only schedule content via @media print rules
      window.print();
    });

    // Live validation (friendly, no alerts)
    [
      el.candidateName, el.candidateEmail, el.roleTitle, el.interviewer,
      el.date, el.time, el.duration, el.location
    ].forEach((node) => {
      node.addEventListener("blur", () => {
        validateForm();
      });
    });
  }

  function init() {
    bindConfirmModal();
    loadFromStorage();

    // Ensure defaults for duration on fresh start
    if (!state.form.duration) state.form.duration = "60";

    syncFormToUI();
    renderLastSaved();
    renderTable();

    bindEvents();

    // Persist immediately if storage was empty (so Last saved is available after first interaction)
    if (!readStorage()) writeStorage();
  }

  init();
})();
