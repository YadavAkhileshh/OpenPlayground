const game = document.getElementById("game");
const scoreDisplay = document.getElementById("score");
const accuracyDisplay = document.getElementById("accuracy");
const timeDisplay = document.getElementById("time");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const gameOverScreen = document.getElementById("gameOver");
const finalScore = document.getElementById("finalScore");
const finalAccuracy = document.getElementById("finalAccuracy");
const crosshair = document.querySelector(".crosshair");

let score = 0;
let shots = 0;
let hits = 0;
let time = 30;
let gameRunning = false;
let target;
let moveInterval;

startBtn.onclick = startGame;
restartBtn.onclick = restartGame;

game.addEventListener("mousemove", e => {
  crosshair.style.left = e.offsetX + "px";
  crosshair.style.top = e.offsetY + "px";
});

game.addEventListener("click", shoot);

function startGame() {
  startBtn.style.display = "none";
  gameOverScreen.style.display = "none";
  score = 0;
  shots = 0;
  hits = 0;
  time = 30;
  gameRunning = true;
  updateUI();
  spawnTarget();
  countdown();
}

function restartGame() {
  gameOverScreen.style.display = "none";
  startGame();
}

function spawnTarget() {
  if (!gameRunning) return;

  if (target) target.remove();

  target = document.createElement("div");
  target.className = "target";
  game.appendChild(target);

  moveTarget();
  moveInterval = setInterval(moveTarget, 1000);
}

function moveTarget() {
  target.style.left = Math.random() * (game.offsetWidth - 60) + "px";
  target.style.top = Math.random() * (game.offsetHeight - 60) + "px";
}

function shoot(e) {
  if (!gameRunning) return;

  shots++;

  const rect = target.getBoundingClientRect();
  const clickX = e.clientX;
  const clickY = e.clientY;

  if (
    clickX >= rect.left &&
    clickX <= rect.right &&
    clickY >= rect.top &&
    clickY <= rect.bottom
  ) {
    hits++;
    score++;
    spawnTarget();
  }

  updateUI();
}

function countdown() {
  const timer = setInterval(() => {
    time--;
    updateUI();

    if (time <= 0) {
      clearInterval(timer);
      endGame();
    }
  }, 1000);
}

function updateUI() {
  scoreDisplay.textContent = score;
  accuracyDisplay.textContent = shots === 0 ? 100 : Math.round((hits / shots) * 100);
  timeDisplay.textContent = time;
}

function endGame() {
  gameRunning = false;
  clearInterval(moveInterval);
  target.remove();
  finalScore.textContent = score;
  finalAccuracy.textContent = accuracyDisplay.textContent;
  gameOverScreen.style.display = "block";
}