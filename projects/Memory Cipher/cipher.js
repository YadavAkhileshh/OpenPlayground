// Memory Cipher - pattern memory game
const $ = (id) => document.getElementById(id);

let gridSize = 3,
  level = 1,
  score = 0,
  lives = 3;
let pattern = [],
  playerPicks = [],
  phase = "idle";
let timerInterval, timeLeft;
let difficulty = "easy";

const DIFFICULTY = {
  easy: { grid: 3, startLen: 3, increment: 1, showTime: 2000, recallTime: 12 },
  medium: {
    grid: 4,
    startLen: 4,
    increment: 1,
    showTime: 1800,
    recallTime: 10,
  },
  hard: { grid: 5, startLen: 5, increment: 2, showTime: 1500, recallTime: 8 },
};

function buildGrid() {
  const grid = $("grid");
  grid.innerHTML = "";
  grid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
  for (let i = 0; i < gridSize * gridSize; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.idx = i;
    cell.addEventListener("click", onCellClick);
    grid.appendChild(cell);
  }
  // Responsive cell size
  const maxDim = Math.min(window.innerWidth - 280, window.innerHeight - 250);
  const cellSize = Math.floor(maxDim / gridSize) - 8;
  document.querySelectorAll(".cell").forEach((c) => {
    c.style.width = cellSize + "px";
    c.style.height = cellSize + "px";
  });
  $("grid").style.gap = "6px";
}

function updateLivesDisplay() {
  const lv = $("lives");
  lv.innerHTML = "";
  for (let i = 0; i < 3; i++) {
    const d = document.createElement("div");
    d.className = "life" + (i >= lives ? " lost" : "");
    lv.appendChild(d);
  }
}

function setStatus(text) {
  $("status-text").textContent = text;
}

function generatePattern() {
  const cfg = DIFFICULTY[difficulty];
  const len = cfg.startLen + (level - 1) * cfg.increment;
  const total = gridSize * gridSize;
  const picks = new Set();
  while (picks.size < Math.min(len, total)) {
    picks.add(Math.floor(Math.random() * total));
  }
  return [...picks];
}

function showPattern() {
  phase = "showing";
  setStatus("MEMORIZE THE PATTERN");
  $("action-hint").textContent = "";
  clearTimer();
  const cfg = DIFFICULTY[difficulty];
  const cells = document.querySelectorAll(".cell");
  cells.forEach((c) =>
    c.classList.remove("show", "selected", "correct", "wrong"),
  );

  let i = 0;
  const interval = setInterval(() => {
    if (i > 0) cells[pattern[i - 1]].classList.remove("show");
    if (i < pattern.length) {
      cells[pattern[i]].classList.add("show");
      i++;
    } else {
      clearInterval(interval);
      setTimeout(() => {
        cells.forEach((c) => c.classList.remove("show"));
        startRecall();
      }, 600);
    }
  }, cfg.showTime / pattern.length);
}

function startRecall() {
  phase = "recall";
  playerPicks = [];
  setStatus(`SELECT ${pattern.length} CELLS`);
  $("action-hint").textContent = `0 / ${pattern.length} selected`;
  const cfg = DIFFICULTY[difficulty];
  timeLeft = cfg.recallTime;
  updateTimerRing(timeLeft, cfg.recallTime);
  $("timer-num").textContent = timeLeft;
  timerInterval = setInterval(() => {
    timeLeft--;
    $("timer-num").textContent = timeLeft;
    updateTimerRing(timeLeft, cfg.recallTime);
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      revealResult(false);
    }
  }, 1000);
}

function updateTimerRing(current, max) {
  const circle = $("timer-circle");
  const pct = current / max;
  const circ = 100.5;
  circle.style.strokeDashoffset = circ - circ * pct;
  if (pct < 0.3) circle.style.stroke = "#ff3355";
  else if (pct < 0.6) circle.style.stroke = "#ffd700";
  else circle.style.stroke = "var(--accent)";
}

function clearTimer() {
  clearInterval(timerInterval);
  $("timer-num").textContent = "—";
  const circle = $("timer-circle");
  circle.style.strokeDashoffset = 0;
  circle.style.stroke = "var(--accent)";
}

function onCellClick(e) {
  if (phase !== "recall") return;
  const idx = parseInt(e.currentTarget.dataset.idx);
  if (playerPicks.includes(idx)) {
    playerPicks = playerPicks.filter((p) => p !== idx);
    e.currentTarget.classList.remove("selected");
  } else {
    playerPicks.push(idx);
    e.currentTarget.classList.add("selected");
  }
  $("action-hint").textContent =
    `${playerPicks.length} / ${pattern.length} selected`;

  if (playerPicks.length === pattern.length) {
    clearTimer();
    setTimeout(() => revealResult(true), 200);
  }
}

function revealResult(submitted) {
  phase = "reveal";
  clearTimer();
  const cells = document.querySelectorAll(".cell");

  if (!submitted) {
    // Show missed pattern
    pattern.forEach((idx) => cells[idx].classList.add("show"));
    setStatus("TIME'S UP!");
    setTimeout(() => handleFail(), 1500);
    return;
  }

  const patternSet = new Set(pattern);
  const userSet = new Set(playerPicks);

  let correct = 0;
  playerPicks.forEach((idx) => {
    if (patternSet.has(idx)) {
      cells[idx].classList.remove("selected");
      cells[idx].classList.add("correct");
      correct++;
    } else {
      cells[idx].classList.remove("selected");
      cells[idx].classList.add("wrong");
    }
  });

  pattern.forEach((idx) => {
    if (!userSet.has(idx)) {
      cells[idx].classList.add("show"); // show missed
    }
  });

  const allCorrect =
    correct === pattern.length && playerPicks.length === pattern.length;
  if (allCorrect) {
    setTimeout(() => handleSuccess(), 800);
  } else {
    setTimeout(() => handleFail(), 1200);
  }
}

function handleSuccess() {
  const pts = pattern.length * 100 * level;
  score += pts;
  $("score").textContent = score;
  $("pts-gained").textContent = pts;
  const progress = Math.min((level / 10) * 100, 100);
  $("progress-fill").style.width = progress + "%";
  setStatus("DECRYPTED!");
  $("win-overlay").classList.add("active");
}

function handleFail() {
  lives--;
  updateLivesDisplay();
  if (lives <= 0) {
    $("fail-level").textContent = level;
    $("fail-score").textContent = score;
    setStatus("MISSION FAILED");
    setTimeout(() => $("fail-overlay").classList.add("active"), 400);
  } else {
    setStatus("INCORRECT — TRY AGAIN");
    setTimeout(() => {
      document.querySelectorAll(".cell").forEach((c) => (c.className = "cell"));
      showPattern();
    }, 1000);
  }
}

function startGame() {
  const cfg = DIFFICULTY[difficulty];
  gridSize = cfg.grid;
  level = 1;
  score = 0;
  lives = 3;
  $("level").textContent = level;
  $("score").textContent = 0;
  $("progress-fill").style.width = "0%";
  updateLivesDisplay();
  $("overlay").classList.remove("active");
  $("fail-overlay").classList.remove("active");
  $("win-overlay").classList.remove("active");
  buildGrid();
  pattern = generatePattern();
  setTimeout(() => showPattern(), 800);
}

function nextLevel() {
  level++;
  $("level").textContent = level;
  $("win-overlay").classList.remove("active");
  document.querySelectorAll(".cell").forEach((c) => (c.className = "cell"));
  pattern = generatePattern();
  setTimeout(() => showPattern(), 600);
}

// UI Events
document.querySelectorAll(".diff-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".diff-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    difficulty = btn.dataset.diff;
  });
});

$("start-btn").addEventListener("click", startGame);
$("retry-btn").addEventListener("click", startGame);
$("next-btn").addEventListener("click", nextLevel);

updateLivesDisplay();
