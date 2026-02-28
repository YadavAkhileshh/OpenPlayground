// script.js — Pomodoro Station Main Logic

let mode = CONFIG.DEFAULT_MODE;
let timeLeft = CONFIG.MODES[mode].duration;
let running = false;
let interval = null;
let sessionCount = 0;
let tasks = [];
let history = {}; // { 'YYYY-MM-DD': count }
let streak = 0;
let audioCtx = null;

const CIRCUMFERENCE = 2 * Math.PI * 88; // r=88

function getAudio() {
  if (!audioCtx)
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function init() {
  const saved = Utils.load();
  if (saved) {
    tasks = saved.tasks || [];
    history = saved.history || {};
    streak = saved.streak || 0;
  }
  document.getElementById("quote").textContent = `"${Utils.randomQuote()}"`;
  renderAll();
}

function save() {
  Utils.save({ tasks, history, streak });
}

// ── Timer ────────────────────────────────────────────

function start() {
  if (running) {
    pause();
    return;
  }
  getAudio().resume?.();
  running = true;
  document.getElementById("startBtn").textContent = "⏸ PAUSE";
  interval = setInterval(tick, 1000);
}

function pause() {
  running = false;
  clearInterval(interval);
  document.getElementById("startBtn").textContent = "▶ START";
}

function reset() {
  pause();
  timeLeft = CONFIG.MODES[mode].duration;
  renderTimer();
}

function tick() {
  if (timeLeft <= 0) {
    onComplete();
    return;
  }
  timeLeft--;
  if (timeLeft % 60 === 0) Utils.playTick(audioCtx);
  renderTimer();
}

function onComplete() {
  pause();
  Utils.playBell(audioCtx);
  document.getElementById("quote").textContent = `"${Utils.randomQuote()}"`;

  if (mode === "focus") {
    sessionCount++;
    const today = Utils.todayKey();
    history[today] = (history[today] || 0) + 1;
    updateStreak();
    save();
    renderHistory();
    renderDots();
    // Auto switch
    const nextMode =
      sessionCount % CONFIG.SESSIONS_BEFORE_LONG_BREAK === 0
        ? "longBreak"
        : "shortBreak";
    switchMode(nextMode);
  } else {
    switchMode("focus");
  }
}

function skip() {
  pause();
  if (mode !== "focus") switchMode("focus");
  else
    switchMode(
      sessionCount % CONFIG.SESSIONS_BEFORE_LONG_BREAK === 0
        ? "longBreak"
        : "shortBreak",
    );
}

function switchMode(newMode) {
  mode = newMode;
  timeLeft = CONFIG.MODES[mode].duration;
  document
    .querySelectorAll(".mode-tab")
    .forEach((t) => t.classList.toggle("active", t.dataset.mode === mode));
  const color = CONFIG.MODES[mode].color;
  document.documentElement.style.setProperty("--accent", color);
  document.getElementById("startBtn").textContent = "▶ START";
  renderTimer();
}

function updateStreak() {
  const today = Utils.todayKey();
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (history[yesterday] || history[today] > 1) {
    if (!history[yesterday] && history[today] === 1) streak = 1;
    else if (history[yesterday] && history[today] === 1) streak++;
  } else {
    streak = history[today] ? 1 : 0;
  }
  document.getElementById("streakCount").textContent = streak;
}

// ── Render ────────────────────────────────────────────

function renderTimer() {
  const total = CONFIG.MODES[mode].duration;
  const pct = timeLeft / total;
  const offset = CIRCUMFERENCE * (1 - pct);
  document.getElementById("ringFill").style.strokeDashoffset = offset;
  document.getElementById("ringFill").style.strokeDasharray = CIRCUMFERENCE;
  const timeStr = Utils.formatTime(timeLeft);
  document.getElementById("timeDisplay").textContent = timeStr;
  document.getElementById("modeLabel").textContent = CONFIG.MODES[mode].label;
  Utils.updateTitle(timeStr, mode);
}

function renderDots() {
  const container = document.getElementById("sessionDots");
  container.innerHTML = "";
  for (let i = 0; i < CONFIG.SESSIONS_BEFORE_LONG_BREAK; i++) {
    const dot = document.createElement("div");
    dot.className =
      "session-dot" +
      (i < sessionCount % CONFIG.SESSIONS_BEFORE_LONG_BREAK ||
      (sessionCount % CONFIG.SESSIONS_BEFORE_LONG_BREAK === 0 &&
        sessionCount > 0 &&
        i < CONFIG.SESSIONS_BEFORE_LONG_BREAK)
        ? " done"
        : "");
    container.appendChild(dot);
  }
}

function renderHistory() {
  const barsEl = document.getElementById("historyBars");
  const labelsEl = document.getElementById("historyLabels");
  const today = Utils.todayKey();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000);
    return d.toISOString().slice(0, 10);
  });
  const counts = days.map((d) => history[d] || 0);
  const max = Math.max(...counts, 1);

  barsEl.innerHTML = "";
  labelsEl.innerHTML = "";
  days.forEach((d, i) => {
    const bar = document.createElement("div");
    bar.className = "h-bar" + (d === today ? " today" : "");
    bar.style.height = `${(counts[i] / max) * 100}%`;
    bar.title = `${d}: ${counts[i]} sessions`;
    barsEl.appendChild(bar);

    const label = document.createElement("div");
    label.className = "h-label";
    label.textContent = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][
      new Date(d + "T12:00").getDay()
    ];
    labelsEl.appendChild(label);
  });
  document.getElementById("totalDisplay").textContent =
    `${history[today] || 0} sessions today · ${sessionCount} this run`;
}

function renderTasks() {
  const list = document.getElementById("taskList");
  list.innerHTML = "";
  tasks.forEach((task, i) => {
    const div = document.createElement("div");
    div.className = "task-item" + (task.done ? " done" : "");
    div.innerHTML = `<div class="task-check"></div><span>${task.text}</span><button class="task-del" data-i="${i}">✕</button>`;
    div.querySelector(".task-check").addEventListener("click", () => {
      tasks[i].done = !tasks[i].done;
      save();
      renderTasks();
    });
    div.querySelector(".task-del").addEventListener("click", (e) => {
      e.stopPropagation();
      tasks.splice(i, 1);
      save();
      renderTasks();
    });
    list.appendChild(div);
  });
}

function renderAll() {
  renderTimer();
  renderDots();
  renderHistory();
  renderTasks();
  document.getElementById("streakCount").textContent = streak;
}

// ── Events ────────────────────────────────────────────

document.getElementById("startBtn").addEventListener("click", start);
document.getElementById("resetBtn").addEventListener("click", reset);
document.getElementById("skipBtn").addEventListener("click", skip);

document.querySelectorAll(".mode-tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    pause();
    switchMode(btn.dataset.mode);
  });
});

document.getElementById("addTaskBtn").addEventListener("click", () => {
  const inp = document.getElementById("taskInput");
  const text = inp.value.trim();
  if (!text) return;
  tasks.push({ text, done: false });
  inp.value = "";
  save();
  renderTasks();
});
document.getElementById("taskInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("addTaskBtn").click();
});

init();
