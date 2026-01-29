const gameArea = document.getElementById("gameArea");
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const gameOverBox = document.getElementById("gameOver");
const finalScoreEl = document.getElementById("finalScore");

let score = 0;
let time = 30;
let gameInterval;
let timerInterval;

function createBubble() {
  const bubble = document.createElement("div");
  bubble.classList.add("bubble");

  const size = Math.random() * 40 + 30;
  bubble.style.width = size + "px";
  bubble.style.height = size + "px";

  bubble.style.left = Math.random() * (gameArea.clientWidth - size) + "px";

  bubble.style.background = `hsl(${Math.random() * 360}, 100%, 60%)`;

  const duration = Math.random() * 3 + 3;
  bubble.style.animationDuration = duration + "s";

  bubble.addEventListener("click", () => {
    bubble.classList.add("pop");
    score++;
    scoreEl.textContent = score;
    setTimeout(() => bubble.remove(), 300);
  });

  gameArea.appendChild(bubble);

  setTimeout(() => {
    if (bubble.parentElement) bubble.remove();
  }, duration * 1000);
}

function startGame() {
  score = 0;
  time = 30;
  scoreEl.textContent = score;
  timeEl.textContent = time;
  gameOverBox.classList.remove("show");

  gameInterval = setInterval(createBubble, 700);

  timerInterval = setInterval(() => {
    time--;
    timeEl.textContent = time;

    if (time <= 0) {
      endGame();
    }
  }, 2000);
}

function endGame() {
  clearInterval(gameInterval);
  clearInterval(timerInterval);

  document.querySelectorAll(".bubble").forEach(b => b.remove());

  finalScoreEl.textContent = score;
  gameOverBox.classList.add("show");
}

function restartGame() {
  startGame();
}

startGame();
