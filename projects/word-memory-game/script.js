let level = 1;
let currentWord = "";
let displayTime = 3000;

const wordBox = document.getElementById("word-box");
const userInput = document.getElementById("user-input");
const levelSpan = document.getElementById("level");
const message = document.getElementById("message");

const startBtn = document.getElementById("start-btn");
const submitBtn = document.getElementById("submit-btn");
const restartBtn = document.getElementById("restart-btn");
const quitBtn = document.getElementById("quit-btn");

/* Generate random word */
function generateWord() {
  let length;

  if (level <= 3) length = 3;
  else if (level <= 6) length = 5;
  else if (level <= 9) length = 7;
  else length = 9;

  const letters = "abcdefghijklmnopqrstuvwxyz";
  let word = "";

  for (let i = 0; i < length; i++) {
    word += letters[Math.floor(Math.random() * letters.length)];
  }

  if (level > 6 && Math.random() > 0.5) {
    const idx = Math.floor(Math.random() * word.length);
    word =
      word.slice(0, idx) +
      word[idx].toUpperCase() +
      word.slice(idx + 1);
  }

  return word;
}

function updateDifficulty() {
  displayTime = Math.max(1500, 3000 - level * 150);
}

/* Start / Start Again handler */
function startGame() {
  level = 1;
  levelSpan.textContent = level;

  startBtn.textContent = "Start"; // Reset text
  message.textContent = "";

  userInput.classList.remove("hidden");
  levelSpan.parentElement.classList.remove("hidden");

  submitBtn.classList.remove("hidden");
  restartBtn.classList.add("hidden");
  quitBtn.classList.add("hidden");

  showWord();
}

function showWord() {
  updateDifficulty();
  currentWord = generateWord();

  wordBox.textContent = currentWord;
  userInput.value = "";
  userInput.disabled = true;
  submitBtn.disabled = true;

  setTimeout(() => {
    wordBox.textContent = "❓❓❓";
    userInput.disabled = false;
    submitBtn.disabled = false;
    userInput.focus();
  }, displayTime);
}

startBtn.addEventListener("click", startGame);

/* Submit answer */
submitBtn.addEventListener("click", handleSubmit);

/* ✅ Enter key submission */
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !submitBtn.disabled) handleSubmit();
});

/* Handle submit logic */
function handleSubmit() {
  if (userInput.value.trim() === currentWord) {
    message.textContent = "Correct! 🎉";
    message.style.color = "green";

    /* ✅ Level transition feedback */
    wordBox.style.background = "#c8e6c9"; // light green flash
    setTimeout(() => (wordBox.style.background = "#f2f2f2"), 300);

    level++;
    levelSpan.textContent = level;

    setTimeout(showWord, 800);
  } else {
    gameOver();
  }
}

/* Game Over */
function gameOver() {
  const finalScore = level - 1;

  message.textContent = `Game Over ❌ | Final Score: ${finalScore}`;
  message.style.color = "red";

  userInput.disabled = true;
  submitBtn.disabled = true;

  startBtn.classList.add("hidden");
  submitBtn.classList.add("hidden");

  restartBtn.classList.remove("hidden");
  quitBtn.classList.remove("hidden");
}

/* Restart button */
restartBtn.addEventListener("click", startGame);

/* Quit → Thank you + Start Again */
quitBtn.addEventListener("click", () => {
  restartBtn.classList.add("hidden");
  quitBtn.classList.add("hidden");
  submitBtn.classList.add("hidden");

  userInput.classList.add("hidden");
  levelSpan.parentElement.classList.add("hidden");

  message.textContent = "";
  wordBox.textContent = "Thanks for playing 👋";

  startBtn.textContent = "Start";
  startBtn.classList.remove("hidden");
});
