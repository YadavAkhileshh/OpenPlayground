const grid = document.getElementById("grid");
const message = document.getElementById("message");
const restartBtn = document.getElementById("restart");
const levelEl = document.getElementById("level");
const timerEl = document.getElementById("timer");
const scoreEl = document.getElementById("score");
const toast = document.getElementById("toast");

const wordPairs = [
  ["blue", "blur"],
  ["read", "road"],
  ["green", "grean"],
  ["shape", "shpae"],
  ["focus", "foucs"],
  ["logic", "logci"],
  ["smart", "smrat"]
];

const colors = ["#ef4444", "#22c55e", "#3b82f6", "#eab308", "#8b5cf6"];

let level = 1;
let score = 0;
let timeLeft = 10;
let timer;
let correctIndex;

function showToast(text, type = "success") {
  toast.textContent = text;
  toast.className = `show ${type}`;
  setTimeout(() => (toast.className = ""), 2500);
}

function startLevel() {
  clearInterval(timer);
  grid.innerHTML = "";
  message.textContent = "";
  levelEl.textContent = `Level ${level}`;

  const gridSize = Math.min(4 + level - 1, 6);
  grid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;

  timeLeft = Math.max(10 - level, 4);
  timerEl.textContent = `⏱️ ${timeLeft}s`;

  document.documentElement.style.setProperty(
    "--tile-color",
    colors[Math.floor(Math.random() * colors.length)]
  );

  const pair = wordPairs[Math.floor(Math.random() * wordPairs.length)];
  correctIndex = Math.floor(Math.random() * gridSize * gridSize);

  for (let i = 0; i < gridSize * gridSize; i++) {
    const tile = document.createElement("div");
    tile.className = "word fade-in";
    tile.textContent = i === correctIndex ? pair[1] : pair[0];

    tile.onclick = () => handleClick(tile, i === correctIndex);
    grid.appendChild(tile);
  }

  startTimer();
}

function startTimer() {
  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = `⏱️ ${timeLeft}s`;

    if (timeLeft === 0) {
      clearInterval(timer);
      showToast("Time's up! Restarting level", "error");
      startLevel();
    }
  }, 1000);
}

function handleClick(tile, correct) {
  if (correct) {
    clearInterval(timer);
    tile.classList.add("correct");
    score += timeLeft * 10;
    scoreEl.textContent = `Score: ${score}`;
    showToast("Level cleared!", "success");
    confetti();
    level++;
    setTimeout(startLevel, 1200);
  } else {
    tile.classList.add("wrong");
    showToast("Wrong choice", "error");
  }
}

function confetti() {
  for (let i = 0; i < 25; i++) {
    const c = document.createElement("span");
    c.className = "confetti";
    c.style.left = Math.random() * 100 + "vw";
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 1200);
  }
}

restartBtn.onclick = () => {
  level = 1;
  score = 0;
  scoreEl.textContent = "Score: 0";
  showToast("Game restarted", "info");
  startLevel();
};

startLevel();
