const state = loadState();

const goalForm = document.getElementById("goalForm");
const sessionForm = document.getElementById("sessionForm");
const goalList = document.getElementById("goalList");
const sessionList = document.getElementById("sessionList");
const subjectOptions = document.getElementById("subjectOptions");

const totalHoursEl = document.getElementById("totalHours");
const streakEl = document.getElementById("streakCount");
const sessionCountEl = document.getElementById("sessionCount");
const subjectCountEl = document.getElementById("subjectCount");

const subjectCanvas = document.getElementById("subjectChart");
const dateCanvas = document.getElementById("dateChart");

document.getElementById("sessionDate").valueAsDate = new Date();
goalForm.addEventListener("submit", onGoalSubmit);
sessionForm.addEventListener("submit", onSessionSubmit);

goalList.addEventListener("click", (e) => {
  const id = e.target.dataset.goalId;
  if (!id) return;
  state.goals = state.goals.filter((g) => g.id !== id);
  saveAndRender();
});

sessionList.addEventListener("click", (e) => {
  const id = e.target.dataset.sessionId;
  if (!id) return;
  state.sessions = state.sessions.filter((s) => s.id !== id);
  saveAndRender();
});

render();

function onGoalSubmit(e) {
  e.preventDefault();
  const subject = document.getElementById("goalSubject").value.trim();
  const hours = Number(document.getElementById("goalHours").value);
  const deadline = document.getElementById("goalDeadline").value;
  if (!subject || !hours || !deadline) return;

  state.goals.push({
    id: crypto.randomUUID(),
    subject,
    hours,
    deadline,
    createdAt: new Date().toISOString()
  });

  goalForm.reset();
  saveAndRender();
}

function onSessionSubmit(e) {
  e.preventDefault();
  const subject = document.getElementById("sessionSubject").value.trim();
  const topic = document.getElementById("sessionTopic").value.trim();
  const duration = Number(document.getElementById("sessionDuration").value);
  const date = document.getElementById("sessionDate").value;
  if (!subject || !topic || !duration || !date) return;

  state.sessions.push({
    id: crypto.randomUUID(),
    subject,
    topic,
    duration,
    date,
    createdAt: new Date().toISOString()
  });

  sessionForm.reset();
  document.getElementById("sessionDate").valueAsDate = new Date();
  saveAndRender();
}

function saveAndRender() {
  localStorage.setItem("studysprint-state", JSON.stringify(state));
  render();
}

function render() {
  const minutesBySubject = summarizeBySubject(state.sessions);
  renderStats(minutesBySubject);
  renderGoalList(minutesBySubject);
  renderSessionList();
  renderSubjectOptions(minutesBySubject);
  drawSubjectChart(minutesBySubject);
  drawDateChart(summarizeByDate(state.sessions));
}

function renderStats(minutesBySubject) {
  const totalMinutes = Object.values(minutesBySubject).reduce((sum, v) => sum + v, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  totalHoursEl.textContent = `${totalHours}h`;

  sessionCountEl.textContent = String(state.sessions.length);
  subjectCountEl.textContent = String(Object.keys(minutesBySubject).length);
  streakEl.textContent = String(getStreakDays(state.sessions));
}

function renderGoalList(minutesBySubject) {
  if (!state.goals.length) {
    goalList.innerHTML = '<p class="empty">No goals yet. Add your first subject goal.</p>';
    return;
  }

  goalList.innerHTML = state.goals
    .slice()
    .sort((a, b) => a.deadline.localeCompare(b.deadline))
    .map((goal) => {
      const studied = minutesBySubject[goal.subject] || 0;
      const target = goal.hours * 60;
      const pct = Math.min(100, Math.round((studied / target) * 100));
      const daysLeft = daysUntil(goal.deadline);
      const deadlineLabel = daysLeft >= 0 ? `${daysLeft} day${daysLeft === 1 ? "" : "s"} left` : `${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? "" : "s"} overdue`;

      return `
      <div class="item">
        <div class="item-head">
          <div>
            <strong>${escapeHtml(goal.subject)}</strong>
            <p class="meta">Target: ${goal.hours}h | Deadline: ${goal.deadline} (${deadlineLabel})</p>
          </div>
          <button class="delete-btn" data-goal-id="${goal.id}" aria-label="Delete goal">Delete</button>
        </div>
        <p class="meta">Progress: ${(studied / 60).toFixed(1)}h / ${goal.hours}h (${pct}%)</p>
        <div class="progress-wrap"><div class="progress-bar" style="width:${pct}%"></div></div>
      </div>`;
    })
    .join("");
}

function renderSessionList() {
  if (!state.sessions.length) {
    sessionList.innerHTML = '<p class="empty">No sessions logged yet.</p>';
    return;
  }

  sessionList.innerHTML = state.sessions
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((session) => `
      <div class="item">
        <div class="item-head">
          <div>
            <strong>${escapeHtml(session.subject)}: ${escapeHtml(session.topic)}</strong>
            <p class="meta">${session.date} | ${session.duration} min</p>
          </div>
          <button class="delete-btn" data-session-id="${session.id}" aria-label="Delete session">Delete</button>
        </div>
      </div>
    `)
    .join("");
}

function renderSubjectOptions(minutesBySubject) {
  const subjectSet = new Set([
    ...state.goals.map((g) => g.subject),
    ...Object.keys(minutesBySubject)
  ]);

  subjectOptions.innerHTML = [...subjectSet]
    .sort((a, b) => a.localeCompare(b))
    .map((s) => `<option value="${escapeHtml(s)}"></option>`)
    .join("");
}

function summarizeBySubject(sessions) {
  return sessions.reduce((acc, s) => {
    acc[s.subject] = (acc[s.subject] || 0) + s.duration;
    return acc;
  }, {});
}

function summarizeByDate(sessions) {
  const totals = sessions.reduce((acc, s) => {
    acc[s.date] = (acc[s.date] || 0) + s.duration;
    return acc;
  }, {});
  return Object.entries(totals).sort(([a], [b]) => a.localeCompare(b));
}

function getStreakDays(sessions) {
  if (!sessions.length) return 0;

  const daySet = new Set(sessions.map((s) => s.date));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayISO = today.toISOString().slice(0, 10);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayISO = yesterday.toISOString().slice(0, 10);

  if (!daySet.has(todayISO) && !daySet.has(yesterdayISO)) return 0;

  let cursor = daySet.has(todayISO) ? today : yesterday;
  let streak = 0;

  while (true) {
    const iso = cursor.toISOString().slice(0, 10);
    if (!daySet.has(iso)) break;
    streak += 1;
    cursor = new Date(cursor);
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function daysUntil(dateISO) {
  const target = new Date(dateISO);
  target.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((target - now) / 86400000);
}

function drawSubjectChart(map) {
  const labels = Object.keys(map).sort((a, b) => map[b] - map[a]);
  const values = labels.map((k) => map[k]);
  const ctx = subjectCanvas.getContext("2d");
  drawBarChart(ctx, labels, values, "#1d8ef0");
}

function drawDateChart(entries) {
  const labels = entries.map(([date]) => date.slice(5));
  const values = entries.map(([, mins]) => mins);
  const ctx = dateCanvas.getContext("2d");
  drawLineChart(ctx, labels, values, "#ff6b3d");
}

function drawBarChart(ctx, labels, values, color) {
  const { width, height } = ctx.canvas;
  ctx.clearRect(0, 0, width, height);
  if (!labels.length) {
    drawEmpty(ctx, width, height, "Log sessions to view subject insights");
    return;
  }

  const pad = { top: 24, right: 18, bottom: 52, left: 42 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;
  const maxValue = Math.max(...values, 1);
  const barW = Math.max(20, chartW / (values.length * 1.35));

  ctx.strokeStyle = "#d7dded";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad.left, pad.top);
  ctx.lineTo(pad.left, pad.top + chartH);
  ctx.lineTo(pad.left + chartW, pad.top + chartH);
  ctx.stroke();

  values.forEach((v, i) => {
    const x = pad.left + i * (barW * 1.35) + 8;
    const h = (v / maxValue) * (chartH - 6);
    const y = pad.top + chartH - h;

    ctx.fillStyle = color;
    ctx.fillRect(x, y, barW, h);

    ctx.fillStyle = "#4a5565";
    ctx.font = "12px Manrope";
    ctx.fillText(String(Math.round(v)), x, y - 6);

    const text = labels[i].length > 9 ? `${labels[i].slice(0, 9)}..` : labels[i];
    ctx.fillText(text, x - 2, pad.top + chartH + 16);
  });
}

function drawLineChart(ctx, labels, values, color) {
  const { width, height } = ctx.canvas;
  ctx.clearRect(0, 0, width, height);
  if (!labels.length) {
    drawEmpty(ctx, width, height, "Log sessions to view date trend");
    return;
  }

  const pad = { top: 20, right: 20, bottom: 38, left: 42 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;
  const maxValue = Math.max(...values, 1);

  ctx.strokeStyle = "#d7dded";
  ctx.beginPath();
  ctx.moveTo(pad.left, pad.top + chartH);
  ctx.lineTo(pad.left + chartW, pad.top + chartH);
  ctx.lineTo(pad.left + chartW, pad.top);
  ctx.stroke();

  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();

  values.forEach((v, i) => {
    const x = pad.left + (i / Math.max(values.length - 1, 1)) * chartW;
    const y = pad.top + chartH - (v / maxValue) * (chartH - 10);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  values.forEach((v, i) => {
    const x = pad.left + (i / Math.max(values.length - 1, 1)) * chartW;
    const y = pad.top + chartH - (v / maxValue) * (chartH - 10);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#4a5565";
    ctx.font = "11px Manrope";
    if (i % Math.ceil(values.length / 7) === 0 || i === values.length - 1) {
      ctx.fillText(labels[i], x - 10, pad.top + chartH + 15);
    }
  });
}

function drawEmpty(ctx, width, height, message) {
  ctx.fillStyle = "#718096";
  ctx.font = "14px Manrope";
  ctx.fillText(message, width / 2 - 120, height / 2);
}

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem("studysprint-state"));
    if (parsed && Array.isArray(parsed.goals) && Array.isArray(parsed.sessions)) {
      return parsed;
    }
  } catch (err) {
    console.warn("Failed to parse state", err);
  }
  return { goals: [], sessions: [] };
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

