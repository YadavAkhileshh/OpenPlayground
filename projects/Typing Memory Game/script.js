const words = ["apple", "code", "music", "brain", "logic", "speed", "focus"];

const wordBox = document.getElementById("wordBox");
const input = document.getElementById("userInput");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const message = document.getElementById("message");
const levelText = document.getElementById("level");
const timerText = document.getElementById("timer");
const scoreText = document.getElementById("score");

let level = 1;
let score = 0;
let currentWords = [];
let timeLeft = 0;
let timer;

function generateWords(level) {
  let result = [];
  for (let i = 0; i < level; i++) {
    result.push(words[Math.floor(Math.random() * words.length)]);
  }
  return result;
}

function startGame() {
  clearInterval(timer);
  startBtn.style.display = "none";
  resetBtn.style.display = "inline-block";

  input.value = "";
  input.disabled = true;

  currentWords = generateWords(level);
  wordBox.textContent = currentWords.join(" ");
  message.textContent = "Memorize the words...";

  setTimeout(() => {
    wordBox.textContent = "";
    input.disabled = false;
    input.focus();
    message.textContent = "Type before time runs out!";
    startTimer();
  }, 2000 + level * 500);
}

function startTimer() {
  timeLeft = 5 + level * 2;
  timerText.textContent = `Time: ${timeLeft}s`;

  timer = setInterval(() => {
    timeLeft--;
    timerText.textContent = `Time: ${timeLeft}s`;

    if (timeLeft <= 0) {
      clearInterval(timer);
      gameOver();
    }
  }, 1000);
}

function gameOver() {
  input.disabled = true;
  message.textContent = "❌ Time's up! Game Over!";
  wordBox.textContent = "Correct words: " + currentWords.join(" ");

  startBtn.style.display = "inline-block";
  resetBtn.style.display = "none";
}

input.addEventListener("keyup", () => {
  if (input.value.trim() === currentWords.join(" ")) {
    clearInterval(timer);
    level++;
    score += 10;

    levelText.textContent = `Level: ${level}`;
    scoreText.textContent = `Score: ${score}`;
    message.textContent = "✅ Correct! Next level...";

    input.value = "";
    setTimeout(startGame, 1000);
  }
});

resetBtn.addEventListener("click", () => {
  clearInterval(timer);
  level = 1;
  score = 0;

  levelText.textContent = "Level: 1";
  scoreText.textContent = "Score: 0";
  message.textContent = "Game Reset. Click Start.";
  wordBox.textContent = "";
  input.value = "";
  input.disabled = true;

  resetBtn.style.display = "none";
  startBtn.style.display = "inline-block";
});

startBtn.addEventListener("click", startGame);
