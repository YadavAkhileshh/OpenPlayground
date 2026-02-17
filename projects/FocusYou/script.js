let totalTime = 0;
let focusTime = 0;
let distractionTime = 0;
let tabSwitches = 0;

let sessionActive = false;
let lastActivityTime = null;
let interval;

const totalTimeEl = document.getElementById("totalTime");
const focusTimeEl = document.getElementById("focusTime");
const distractionTimeEl = document.getElementById("distractionTime");
const tabSwitchesEl = document.getElementById("tabSwitches");
const focusScoreEl = document.getElementById("focusScore");

const startBtn = document.getElementById("startBtn");
const endBtn = document.getElementById("endBtn");

function startSession() {
  sessionActive = true;
  startBtn.disabled = true;
  endBtn.disabled = false;

  totalTime = focusTime = distractionTime = tabSwitches = 0;
  lastActivityTime = Date.now();

  interval = setInterval(trackTime, 1000);
}

function endSession() {
  sessionActive = false;
  clearInterval(interval);
  startBtn.disabled = false;
  endBtn.disabled = true;

  alert("📊 Session Completed!");
}

function trackTime() {
  if (!sessionActive) return;

  totalTime++;

  const now = Date.now();
  const idleTime = (now - lastActivityTime) / 1000;

  if (idleTime < 5) {
    focusTime++;
  } else {
    distractionTime++;
  }

  updateUI();
}

function updateUI() {
  totalTimeEl.textContent = totalTime;
  focusTimeEl.textContent = focusTime;
  distractionTimeEl.textContent = distractionTime;
  tabSwitchesEl.textContent = tabSwitches;

  const focusScore = totalTime === 0
    ? 0
    : Math.round((focusTime / totalTime) * 100);

  focusScoreEl.textContent = focusScore;
}

document.addEventListener("mousemove", () => {
  lastActivityTime = Date.now();
});

document.addEventListener("keydown", () => {
  lastActivityTime = Date.now();
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden && sessionActive) {
    tabSwitches++;
  }
});

startBtn.addEventListener("click", startSession);
endBtn.addEventListener("click", endSession);
