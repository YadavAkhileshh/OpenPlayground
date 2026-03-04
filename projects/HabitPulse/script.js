const STORAGE_KEY = "habitpulse-state";
const state = loadState();

const habitForm = document.getElementById("habitForm");
const habitList = document.getElementById("habitList");
const enableNotifyBtn = document.getElementById("enableNotifyBtn");
const notifyStatus = document.getElementById("notifyStatus");
const reportBox = document.getElementById("reportBox");
const copyReportBtn = document.getElementById("copyReportBtn");

const totalHabitsEl = document.getElementById("totalHabits");
const doneTodayEl = document.getElementById("doneToday");
const missedCountEl = document.getElementById("missedCount");
const avgRateEl = document.getElementById("avgRate");

habitForm.addEventListener("submit", onCreateHabit);
habitList.addEventListener("click", onHabitAction);
enableNotifyBtn.addEventListener("click", enableNotifications);
copyReportBtn.addEventListener("click", copyReport);

initReminderLoop();
render();

function onCreateHabit(e) {
  e.preventDefault();
  const name = document.getElementById("habitName").value.trim();
  const frequency = document.getElementById("habitFrequency").value;
  const reminderTime = document.getElementById("habitReminderTime").value;
  const email = document.getElementById("habitEmail").value.trim();

  if (!name || !frequency || !reminderTime) return;

  state.habits.push({
    id: crypto.randomUUID(),
    name,
    frequency,
    reminderTime,
    email,
    createdAt: todayISO(),
    completions: []
  });

  habitForm.reset();
  persistAndRender();
}

function onHabitAction(e) {
  const id = e.target.dataset.id;
  const action = e.target.dataset.action;
  if (!id || !action) return;

  const habit = state.habits.find((h) => h.id === id);
  if (!habit) return;

  if (action === "complete") {
    markComplete(habit);
  }

  if (action === "email") {
    openEmailReminder(habit);
  }

  if (action === "delete") {
    state.habits = state.habits.filter((h) => h.id !== id);
  }

  persistAndRender();
}

function markComplete(habit) {
  const key = habit.frequency === "daily" ? todayISO() : weekKey(new Date());
  if (!habit.completions.includes(key)) {
    habit.completions.push(key);
  }
}

function openEmailReminder(habit) {
  if (!habit.email) {
    alert("Add an email to this habit first.");
    return;
  }
  const subject = encodeURIComponent(`HabitPulse Reminder: ${habit.name}`);
  const body = encodeURIComponent(`This is your reminder for "${habit.name}" (${habit.frequency}).\n\nYou can do it.`);
  window.location.href = `mailto:${encodeURIComponent(habit.email)}?subject=${subject}&body=${body}`;
}

function enableNotifications() {
  if (!("Notification" in window)) {
    notifyStatus.textContent = "Notifications: unsupported in this browser";
    return;
  }

  Notification.requestPermission().then((permission) => {
    state.notificationsEnabled = permission === "granted";
    persist();
    renderNotifyStatus();
  });
}

function initReminderLoop() {
  renderNotifyStatus();
  maybeNotifyHabits();
  setInterval(maybeNotifyHabits, 30000);
}

function maybeNotifyHabits() {
  if (!state.notificationsEnabled) return;
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const currentTime = `${hh}:${mm}`;

  state.habits.forEach((habit) => {
    if (habit.reminderTime !== currentTime) return;

    const dueKey = habit.frequency === "daily" ? todayISO() : weekKey(now);
    const logKey = `${habit.id}::${dueKey}`;
    if (state.notified[logKey]) return;
    if (habit.completions.includes(dueKey)) return;

    new Notification("HabitPulse Reminder", {
      body: `${habit.name} is still pending (${habit.frequency}).`,
      icon: "../../logo.jpg"
    });

    state.notified[logKey] = Date.now();
    persist();
  });
}

function render() {
  if (!state.habits.length) {
    habitList.innerHTML = '<p class="empty">No habits yet. Create one to start tracking.</p>';
  } else {
    habitList.innerHTML = state.habits
      .map((habit) => {
        const streak = getStreak(habit);
        const missed = getMissed(habit);
        const completionRate = getCompletionRate(habit);
        const actionLabel = habit.frequency === "daily" ? "Mark Today Done" : "Mark Week Done";

        return `
          <div class="habit-item">
            <div class="item-top">
              <strong>${escapeHtml(habit.name)}</strong>
              <span class="tag">${habit.frequency}</span>
            </div>
            <p class="meta">Reminder: ${habit.reminderTime}${habit.email ? ` | Email: ${escapeHtml(habit.email)}` : ""}</p>
            <p class="meta">Streak: ${streak} | Missed: ${missed} | Completion: ${completionRate}%</p>
            <div class="actions">
              <button data-id="${habit.id}" data-action="complete">${actionLabel}</button>
              <button data-id="${habit.id}" data-action="email" class="secondary">Email Reminder</button>
              <button data-id="${habit.id}" data-action="delete" class="danger">Delete</button>
            </div>
          </div>
        `;
      })
      .join("");
  }

  renderStats();
  reportBox.textContent = buildReport();
  renderNotifyStatus();
}

function renderStats() {
  const total = state.habits.length;
  let doneToday = 0;
  let missedTotal = 0;
  let rateSum = 0;

  state.habits.forEach((habit) => {
    const dueKey = habit.frequency === "daily" ? todayISO() : weekKey(new Date());
    if (habit.completions.includes(dueKey)) doneToday += 1;
    missedTotal += getMissed(habit);
    rateSum += getCompletionRate(habit);
  });

  totalHabitsEl.textContent = String(total);
  doneTodayEl.textContent = String(doneToday);
  missedCountEl.textContent = String(missedTotal);
  avgRateEl.textContent = `${total ? Math.round(rateSum / total) : 0}%`;
}

function buildReport() {
  if (!state.habits.length) return "No habits yet.";

  const lines = [];
  const date = new Date().toISOString().slice(0, 10);
  lines.push(`HabitPulse Accountability Report (${date})`);
  lines.push("" );

  let totalMissed = 0;
  let totalRate = 0;

  state.habits.forEach((habit, idx) => {
    const streak = getStreak(habit);
    const missed = getMissed(habit);
    const rate = getCompletionRate(habit);
    totalMissed += missed;
    totalRate += rate;

    lines.push(`${idx + 1}. ${habit.name} [${habit.frequency}]`);
    lines.push(`   streak=${streak}, missed=${missed}, completion=${rate}%`);
  });

  const avg = Math.round(totalRate / state.habits.length);
  lines.push("");
  lines.push(`Summary: habits=${state.habits.length}, missed=${totalMissed}, avgCompletion=${avg}%`);
  lines.push(`Risk: ${avg < 50 || totalMissed > state.habits.length * 2 ? "High" : avg < 75 ? "Moderate" : "Low"}`);

  return lines.join("\n");
}

function copyReport() {
  navigator.clipboard.writeText(reportBox.textContent)
    .then(() => {
      copyReportBtn.textContent = "Copied";
      setTimeout(() => {
        copyReportBtn.textContent = "Copy";
      }, 900);
    })
    .catch(() => {
      alert("Could not copy report.");
    });
}

function getStreak(habit) {
  if (habit.frequency === "daily") {
    return getDailyStreak(habit);
  }
  return getWeeklyStreak(habit);
}

function getDailyStreak(habit) {
  const set = new Set(habit.completions);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let cursor = new Date(today);
  let streak = 0;

  if (!set.has(toISO(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (set.has(toISO(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function getWeeklyStreak(habit) {
  const set = new Set(habit.completions);
  let cursor = new Date();
  let streak = 0;

  let wk = weekKey(cursor);
  if (!set.has(wk)) {
    cursor.setDate(cursor.getDate() - 7);
    wk = weekKey(cursor);
  }

  while (set.has(weekKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 7);
  }

  return streak;
}

function getMissed(habit) {
  if (habit.frequency === "daily") {
    const expected = daySpan(habit.createdAt, todayISO());
    return Math.max(0, expected - uniqueCount(habit.completions));
  }

  const expectedWeeks = weekSpan(habit.createdAt, todayISO());
  const completedWeeks = uniqueCount(habit.completions);
  return Math.max(0, expectedWeeks - completedWeeks);
}

function getCompletionRate(habit) {
  const expected = habit.frequency === "daily"
    ? daySpan(habit.createdAt, todayISO())
    : weekSpan(habit.createdAt, todayISO());

  if (expected <= 0) return 0;
  const done = uniqueCount(habit.completions);
  return Math.min(100, Math.round((done / expected) * 100));
}

function daySpan(startISO, endISO) {
  const a = new Date(startISO);
  const b = new Date(endISO);
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  return Math.floor((b - a) / 86400000) + 1;
}

function weekSpan(startISO, endISO) {
  const start = weekIndex(new Date(startISO));
  const end = weekIndex(new Date(endISO));
  return Math.max(1, end - start + 1);
}

function weekIndex(date) {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  return Math.ceil((((target - yearStart) / 86400000) + 1) / 7) + target.getUTCFullYear() * 100;
}

function weekKey(date) {
  return String(weekIndex(date));
}

function uniqueCount(arr) {
  return new Set(arr).size;
}

function todayISO() {
  return toISO(new Date());
}

function toISO(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function renderNotifyStatus() {
  if (!("Notification" in window)) {
    notifyStatus.textContent = "Notifications: unsupported";
    return;
  }
  const permission = Notification.permission;
  if (state.notificationsEnabled && permission === "granted") {
    notifyStatus.textContent = "Notifications: enabled";
  } else {
    notifyStatus.textContent = `Notifications: ${permission === "denied" ? "blocked" : "not enabled"}`;
  }
}

function persistAndRender() {
  persist();
  render();
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (parsed && typeof parsed === "object" && Array.isArray(parsed.habits)) {
      return {
        notificationsEnabled: Boolean(parsed.notificationsEnabled),
        notified: parsed.notified && typeof parsed.notified === "object" ? parsed.notified : {},
        habits: parsed.habits.map((h) => ({
          id: String(h.id || crypto.randomUUID()),
          name: String(h.name || "Untitled Habit"),
          frequency: h.frequency === "weekly" ? "weekly" : "daily",
          reminderTime: String(h.reminderTime || "20:00"),
          email: String(h.email || ""),
          createdAt: String(h.createdAt || todayISO()),
          completions: Array.isArray(h.completions) ? h.completions.map(String) : []
        }))
      };
    }
  } catch (_err) {
    // fallback below
  }

  return {
    notificationsEnabled: false,
    notified: {},
    habits: []
  };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
