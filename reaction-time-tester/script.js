const card = document.getElementById("card");
const statusText = document.getElementById("status");
const startBtn = document.getElementById("startBtn");
const bestEl = document.getElementById("best");
const avgEl = document.getElementById("avg");

let startTime = null;
let waiting = false;
let ready = false;
let times = JSON.parse(localStorage.getItem("reactionTimes")) || [];

updateStats();

startBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  startTest();
});

card.addEventListener("click", () => {
  if (waiting) {
    earlyClick();
  } else if (ready) {
    recordReaction();
  }
});

function startTest() {
  statusText.textContent = "Wait for green…";
  card.style.backgroundColor = "#dc2626"; // red
  startBtn.style.display = "none";
  ready = false;
  waiting = true;

  const delay = Math.floor(Math.random() * 3000) + 2000;

  setTimeout(() => {
    card.style.backgroundColor = "#16a34a"; // green
    statusText.textContent = "CLICK!";
    startTime = Date.now();
    ready = true;
    waiting = false;
  }, delay);
}

function earlyClick() {
  statusText.textContent = "❌ Too soon! Try again";
  shakeCard();
  reset();
}

function recordReaction() {
  const reaction = Date.now() - startTime;
  times.push(reaction);
  localStorage.setItem("reactionTimes", JSON.stringify(times));

  statusText.textContent = `⚡ ${reaction} ms`;
  updateStats();
  reset();
}

function reset() {
  ready = false;
  waiting = false;
  startBtn.style.display = "inline-block";
}

function updateStats() {
  if (times.length === 0) return;

  const best = Math.min(...times);
  const avg =
    Math.round(times.reduce((a, b) => a + b, 0) / times.length);

  bestEl.textContent = `🏆 Best: ${best} ms`;
  avgEl.textContent = `📊 Avg: ${avg} ms`;
}

function shakeCard() {
  card.classList.add("shake");
  setTimeout(() => card.classList.remove("shake"), 300);
}