const state = {
  tasks: [],
  activeTaskId: null,
  sessionTarget: 6,
  completedToday: 0,
  timeLeft: 25 * 60,
  timerRef: null,
  isRunning: false,
};

const el = {
  form: document.getElementById("task-form"),
  titleInput: document.getElementById("task-title"),
  minutesInput: document.getElementById("task-minutes"),
  taskList: document.getElementById("task-list"),
  activeTask: document.getElementById("active-task"),
  countdown: document.getElementById("countdown"),
  startBtn: document.getElementById("start-btn"),
  pauseBtn: document.getElementById("pause-btn"),
  resetBtn: document.getElementById("reset-btn"),
  summary: document.getElementById("summary"),
  progressBar: document.getElementById("progress-bar"),
  sessionLog: document.getElementById("session-log"),
};

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function saveState() {
  localStorage.setItem("focusflow-state", JSON.stringify({
    tasks: state.tasks,
    completedToday: state.completedToday,
    sessionTarget: state.sessionTarget,
  }));
}

function loadState() {
  const raw = localStorage.getItem("focusflow-state");
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    state.tasks = Array.isArray(data.tasks) ? data.tasks : [];
    state.completedToday = Number.isFinite(data.completedToday) ? data.completedToday : 0;
    state.sessionTarget = Number.isFinite(data.sessionTarget) ? data.sessionTarget : 6;
  } catch {
    localStorage.removeItem("focusflow-state");
  }
}

function renderTasks() {
  el.taskList.innerHTML = "";
  if (state.tasks.length === 0) {
    const empty = document.createElement("li");
    empty.className = "task-item";
    empty.textContent = "No tasks yet. Add one to begin.";
    el.taskList.appendChild(empty);
    return;
  }

  state.tasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task-item";

    const left = document.createElement("div");
    left.innerHTML = `
      <strong>${task.title}</strong>
      <span class="task-meta">${task.minutes} min focus block</span>
    `;

    const controls = document.createElement("div");
    const pickBtn = document.createElement("button");
    pickBtn.type = "button";
    pickBtn.textContent = state.activeTaskId === task.id ? "Selected" : "Pick";
    pickBtn.disabled = state.activeTaskId === task.id;
    pickBtn.addEventListener("click", () => selectTask(task.id));

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "remove-btn";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => removeTask(task.id));

    controls.append(pickBtn, removeBtn);
    li.append(left, controls);
    el.taskList.appendChild(li);
  });
}

function renderProgress() {
  const pct = Math.min((state.completedToday / state.sessionTarget) * 100, 100);
  el.progressBar.style.width = `${pct}%`;
  el.summary.textContent = `${state.completedToday} sessions completed today`;
}

function addSessionLog(taskTitle, minutes) {
  const li = document.createElement("li");
  li.className = "session-item";
  const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  li.textContent = `${now} - Completed "${taskTitle}" (${minutes} min)`;
  el.sessionLog.prepend(li);
}

function selectTask(taskId) {
  const task = state.tasks.find((t) => t.id === taskId);
  if (!task) return;
  state.activeTaskId = taskId;
  state.timeLeft = task.minutes * 60;
  stopTimer();
  updateTimerDisplay();
  el.activeTask.textContent = `Active: ${task.title}`;
  renderTasks();
}

function removeTask(taskId) {
  if (state.activeTaskId === taskId) {
    state.activeTaskId = null;
    state.timeLeft = 25 * 60;
    stopTimer();
    el.activeTask.textContent = "No task running";
    updateTimerDisplay();
  }
  state.tasks = state.tasks.filter((t) => t.id !== taskId);
  renderTasks();
  saveState();
}

function updateTimerDisplay() {
  el.countdown.textContent = formatTime(state.timeLeft);
}

function stopTimer() {
  if (state.timerRef) {
    clearInterval(state.timerRef);
    state.timerRef = null;
  }
  state.isRunning = false;
  el.startBtn.disabled = false;
  el.pauseBtn.disabled = true;
}

function onSessionComplete() {
  stopTimer();
  const current = state.tasks.find((t) => t.id === state.activeTaskId);
  if (current) {
    state.completedToday += 1;
    addSessionLog(current.title, current.minutes);
    renderProgress();
    saveState();
    state.timeLeft = current.minutes * 60;
  } else {
    state.timeLeft = 25 * 60;
  }
  updateTimerDisplay();
}

function startTimer() {
  if (!state.activeTaskId || state.isRunning) return;
  state.isRunning = true;
  el.startBtn.disabled = true;
  el.pauseBtn.disabled = false;

  state.timerRef = setInterval(() => {
    state.timeLeft -= 1;
    if (state.timeLeft <= 0) {
      onSessionComplete();
      return;
    }
    updateTimerDisplay();
  }, 1000);
}

el.form.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = el.titleInput.value.trim();
  const minutes = Number(el.minutesInput.value);
  if (!title || !Number.isFinite(minutes)) return;

  const task = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title,
    minutes,
  };
  state.tasks.push(task);
  saveState();
  renderTasks();

  if (!state.activeTaskId) {
    selectTask(task.id);
  }

  el.form.reset();
  el.minutesInput.value = "25";
});

el.startBtn.addEventListener("click", startTimer);
el.pauseBtn.addEventListener("click", stopTimer);
el.resetBtn.addEventListener("click", () => {
  const task = state.tasks.find((t) => t.id === state.activeTaskId);
  state.timeLeft = (task ? task.minutes : 25) * 60;
  stopTimer();
  updateTimerDisplay();
});

loadState();
renderTasks();
renderProgress();
updateTimerDisplay();
