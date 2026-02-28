const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "It's not about having time. It's about making time.", author: "Unknown" },
  { text: "Your future is created by what you do today, not tomorrow.", author: "Robert Kiyosaki" },
  { text: "Done is better than perfect.", author: "Sheryl Sandberg" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Small daily improvements are the key to staggering long-term results.", author: "Robin Sharma" },
  { text: "Productivity is never an accident. It is always the result of commitment to excellence.", author: "Paul J. Meyer" },
  { text: "One day or day one. You decide.", author: "Unknown" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
];


function updateDate() {
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById("dateDisplay").textContent = now.toLocaleDateString('en-US', options);
}
updateDate();
function loadQuote() {
  const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  document.getElementById("quoteText").textContent = `"${q.text}"`;
  document.getElementById("quoteAuthor").textContent = `— ${q.author}`;
}
loadQuote();

// ── MOOD ─────────────────────────────────────────────────
const moodBtns = document.querySelectorAll(".mood-btn");
let selectedMood = localStorage.getItem("df_mood") || "—";

document.getElementById("statMood").textContent = selectedMood;

moodBtns.forEach(btn => {
  if (btn.dataset.mood === selectedMood) btn.classList.add("active");
  btn.addEventListener("click", () => {
    moodBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedMood = btn.dataset.mood;
    localStorage.setItem("df_mood", selectedMood);
    document.getElementById("statMood").textContent = selectedMood;
  });
});


const taskInputs  = document.querySelectorAll(".task-input");
const taskChecks  = document.querySelectorAll(".task-check");
const taskItems   = document.querySelectorAll(".task-item");
const progressFill  = document.getElementById("progressFill");
const progressLabel = document.getElementById("progressLabel");

// Load saved tasks
let taskData = JSON.parse(localStorage.getItem("df_tasks") || '[{"text":"","done":false},{"text":"","done":false},{"text":"","done":false}]');

function renderTasks() {
  let done = 0;
  taskData.forEach((t, i) => {
    taskInputs[i].value = t.text;
    if (t.done) {
      taskItems[i].classList.add("done");
      taskChecks[i].classList.add("checked");
      taskChecks[i].textContent = "✓";
      done++;
    } else {
      taskItems[i].classList.remove("done");
      taskChecks[i].classList.remove("checked");
      taskChecks[i].textContent = "○";
    }
  });
  const pct = (done / 3) * 100;
  progressFill.style.width = pct + "%";
  progressLabel.textContent = `${done} / 3 done`;
  document.getElementById("statTasks").textContent = `${done}/3`;
  saveTasks();
}

function saveTasks() {
  localStorage.setItem("df_tasks", JSON.stringify(taskData));
}

taskInputs.forEach((input, i) => {
  input.addEventListener("input", () => {
    taskData[i].text = input.value;
    saveTasks();
  });
});

taskChecks.forEach((btn, i) => {
  btn.addEventListener("click", () => {
    taskData[i].done = !taskData[i].done;
    renderTasks();
  });
});

document.getElementById("resetTasks").addEventListener("click", () => {
  if (confirm("Reset all tasks?")) {
    taskData = [{ text: "", done: false }, { text: "", done: false }, { text: "", done: false }];
    renderTasks();
  }
});

renderTasks();

// ── POMODORO ─────────────────────────────────────────────
const CIRCUMFERENCE = 2 * Math.PI * 88; // r=88
const ringFill    = document.getElementById("ringFill");
const timerTime   = document.getElementById("timerTime");
const timerLabel  = document.getElementById("timerLabel");
const startBtn    = document.getElementById("startBtn");
const resetBtn    = document.getElementById("resetBtn");
const modeTabs    = document.querySelectorAll(".mode-tab");
const timerPanel  = document.querySelector(".timer-panel");

ringFill.style.strokeDasharray = CIRCUMFERENCE;
ringFill.style.strokeDashoffset = 0;

let totalTime    = 1500;
let timeLeft     = 1500;
let timerRunning = false;
let timerInterval = null;
let pomodoroCount = parseInt(localStorage.getItem("df_pomodoros") || "0");
let focusMinutes  = parseInt(localStorage.getItem("df_focusMin") || "0");
let currentMode   = "focus";

document.getElementById("pomodoroCount").textContent = pomodoroCount;
document.getElementById("statPomodoros").textContent = pomodoroCount;
document.getElementById("statFocus").textContent     = focusMinutes + " min";

function formatTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function updateRing() {
  const progress = timeLeft / totalTime;
  ringFill.style.strokeDashoffset = CIRCUMFERENCE * (1 - progress);
}

function updateTimerDisplay() {
  timerTime.textContent = formatTime(timeLeft);
  updateRing();
}

modeTabs.forEach(tab => {
  tab.addEventListener("click", () => {
    if (timerRunning) return;
    modeTabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    currentMode = tab.dataset.mode;
    totalTime   = parseInt(tab.dataset.time);
    timeLeft    = totalTime;
    timerLabel.textContent = currentMode === "focus" ? "FOCUS" : currentMode === "short" ? "SHORT BREAK" : "LONG BREAK";
    timerPanel.className   = "panel timer-panel";
    updateTimerDisplay();
  });
});

startBtn.addEventListener("click", () => {
  if (timerRunning) {
    // Pause
    clearInterval(timerInterval);
    timerRunning = false;
    startBtn.textContent = "▶ Resume";
    timerPanel.className = "panel timer-panel";
  } else {
    // Start
    timerRunning = true;
    startBtn.textContent = "⏸ Pause";
    timerPanel.className = currentMode === "focus" ? "panel timer-panel timer-running" : "panel timer-panel timer-break";

    timerInterval = setInterval(() => {
      timeLeft--;
      updateTimerDisplay();

      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        timerRunning = false;
        startBtn.textContent = "▶ Start";
        timerPanel.className = "panel timer-panel";

        if (currentMode === "focus") {
          pomodoroCount++;
          focusMinutes += Math.floor(totalTime / 60);
          localStorage.setItem("df_pomodoros", pomodoroCount);
          localStorage.setItem("df_focusMin", focusMinutes);
          document.getElementById("pomodoroCount").textContent = pomodoroCount;
          document.getElementById("statPomodoros").textContent = pomodoroCount;
          document.getElementById("statFocus").textContent     = focusMinutes + " min";

          // Notify
          if (Notification.permission === "granted") {
            new Notification("🍅 Pomodoro done! Take a break.");
          } else {
            alert("🍅 Pomodoro done! Time for a break.");
          }
        } else {
          alert("⏱ Break over! Back to work.");
        }

        timeLeft = totalTime;
        updateTimerDisplay();
      }
    }, 1000);
  }
});

resetBtn.addEventListener("click", () => {
  clearInterval(timerInterval);
  timerRunning = false;
  startBtn.textContent = "▶ Start";
  timeLeft = totalTime;
  timerPanel.className = "panel timer-panel";
  updateTimerDisplay();
});

// Request notification permission
if ("Notification" in window && Notification.permission === "default") {
  Notification.requestPermission();
}

updateTimerDisplay();

// ── NOTES ─────────────────────────────────────────────────
const notesArea = document.getElementById("notesArea");
const noteChars = document.getElementById("noteChars");

notesArea.value = localStorage.getItem("df_notes") || "";
noteChars.textContent = notesArea.value.length + " chars";

notesArea.addEventListener("input", () => {
  localStorage.setItem("df_notes", notesArea.value);
  noteChars.textContent = notesArea.value.length + " chars";
});

document.getElementById("clearNote").addEventListener("click", () => {
  if (confirm("Clear notes?")) {
    notesArea.value = "";
    localStorage.removeItem("df_notes");
    noteChars.textContent = "0 chars";
  }
});
