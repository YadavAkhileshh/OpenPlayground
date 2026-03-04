const gameArea = document.getElementById("gameArea");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");

const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const highScoreEl = document.getElementById("highScore");

let score = 0;
let timeLeft = 30;
let bugInterval;
let timerInterval;
let bugSpeed = 1500;
let miniBugSpeed = 700;
let difficultyStep = 80;

let highScore = localStorage.getItem("bugHighScore") || 0;
highScoreEl.textContent = highScore;

function createBug() {
  const bug = document.createElement("div");
  bug.classList.add("bug");

  const x = Math.random() * (gameArea.clientWidth - 50);
  const y = Math.random() * (gameArea.clientHeight - 50);

  bug.style.left = x + "px";
  bug.style.top = y + "px";

  bug.addEventListener("click", () => {
    score++;
    scoreEl.textContent = score;
    bug.remove();
  });

  gameArea.appendChild(bug);

  setTimeout(() => {
    if (bug.parentNode) {
      bug.remove();
    }
  }, bugSpeed);
}

function startGame() {
  resetGame();

  bugInterval = setInterval(spawnBugWithDifficulty, bugSpeed);

  timerInterval = setInterval(() => {
    timeLeft--;
    timeEl.textContent = timeLeft;

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function endGame() {
  clearInterval(bugInterval);
  clearInterval(timerInterval);
  gameArea.innerHTML = "";

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("bugHighScore", highScore);
    highScoreEl.textContent = highScore;
    alert("🎉 New High Score!");
  } else {
    alert("Game Over! Your score: " + score);
  }
}

function spawnBugWithDifficulty() {
  createBug();

  // increase difficulty slowly
  if (bugSpeed > minBugSpeed) {
    bugSpeed -= difficultyStep;

    clearInterval(bugInterval);
    bugInterval = setInterval(spawnBugWithDifficulty, bugSpeed);
  }
}

function resetGame() {
  clearInterval(bugInterval);
  clearInterval(timerInterval);

  score = 0;
  timeLeft = 30;
  bugSpeed = 1500;

  scoreEl.textContent = score;
  timeEl.textContent = timeLeft;

  gameArea.innerHTML = "";
}

startBtn.addEventListener("click", startGame);
resetBtn.addEventListener("click", resetGame);