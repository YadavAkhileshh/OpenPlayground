const numberBox = document.getElementById("number-box");
const countdownEl = document.getElementById("countdown");
const userInput = document.getElementById("user-input");
const submitBtn = document.getElementById("submit-btn");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const levelEl = document.getElementById("level");
const messageEl = document.getElementById("message");

let level = 1;
let generatedNumber = "";
let countdownInterval;

// Hide restart initially
restartBtn.style.display = "none";

function generateNumber(length) {
  let num = "";
  for (let i = 0; i < length; i++) {
    num += Math.floor(Math.random() * 10);
  }
  return num;
}

function startGame() {
  userInput.value = "";
  userInput.disabled = true;
  submitBtn.disabled = true;
  messageEl.textContent = "";

  generatedNumber = generateNumber(level);
  numberBox.textContent = generatedNumber;

  let timeLeft = 3;
  countdownEl.textContent = `Memorize: ${timeLeft}s`;

  countdownInterval = setInterval(() => {
    timeLeft--;
    countdownEl.textContent = `Memorize: ${timeLeft}s`;

    if (timeLeft === 0) {
      clearInterval(countdownInterval);
      hideNumber();
    }
  }, 1000);
}

function hideNumber() {
  numberBox.textContent = "❓❓❓";
  countdownEl.textContent = "Enter the number!";
  userInput.disabled = false;
  submitBtn.disabled = false;
  userInput.focus();
}

function checkAnswer() {
  if (userInput.value === generatedNumber) {
    messageEl.textContent = "✅ Correct! Level Up!";
    messageEl.style.color = "#00e676";

    level++;
    levelEl.textContent = level;

    setTimeout(startGame, 1200);
  } else {
    messageEl.textContent = `❌ Wrong! Correct number was ${generatedNumber}`;
    messageEl.style.color = "#ff5252";

    userInput.disabled = true;
    submitBtn.disabled = true;

    // Hide Start & Submit
    startBtn.style.display = "none";
    submitBtn.style.display = "none";

    // Show only Restart
    restartBtn.style.display = "block";
  }
}

function restartGame() {
  level = 1;
  levelEl.textContent = level;

  numberBox.textContent = "Ready?";
  countdownEl.textContent = "";
  userInput.value = "";
  userInput.disabled = true;

  messageEl.textContent = "";

  // Reset buttons
  startBtn.style.display = "block";
  submitBtn.style.display = "block";
  restartBtn.style.display = "none";

  submitBtn.disabled = true;
}

startBtn.addEventListener("click", startGame);
submitBtn.addEventListener("click", checkAnswer);
restartBtn.addEventListener("click", restartGame);
