let secretNumber;
let max;
let attempts = 0;
const MAX_ATTEMPTS = 7;

const startBtn = document.getElementById("startBtn");
const guessBtn = document.getElementById("guessBtn");
const quitBtn = document.getElementById("quitBtn");

const maxInput = document.getElementById("maxNumber");
const guessInput = document.getElementById("guessInput");

const message = document.getElementById("message");
const attemptsText = document.getElementById("attempts");

const setupSection = document.querySelector(".setup");
const gameSection = document.querySelector(".game");

startBtn.addEventListener("click", () => {
  max = Number(maxInput.value);

  if (!max || max <= 0) {
    alert("Please enter a valid maximum number.");
    return;
  }

  secretNumber = Math.floor(Math.random() * max) + 1;
  attempts = 0;

  setupSection.classList.add("hidden");
  gameSection.classList.remove("hidden");

  message.textContent = "Game started! Make your guess.";
  message.className = "message warning";
  attemptsText.textContent = `Attempts: 0 / ${MAX_ATTEMPTS}`;

  guessBtn.disabled = false;
  guessInput.value = "";
  guessInput.focus();
});

guessBtn.addEventListener("click", handleGuess);
guessInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleGuess();
});

function handleGuess() {
  const guess = Number(guessInput.value);

  if (!guess) {
    message.textContent = "Please enter a valid number.";
    message.className = "message warning";
    return;
  }

  attempts++;

  if (guess === secretNumber) {
    message.textContent = `Correct! 🎉 The number was ${secretNumber}.`;
    message.className = "message success";
    attemptsText.textContent = `You guessed it in ${attempts} attempts.`;
    guessBtn.disabled = true;
    return;
  }

  if (attempts >= MAX_ATTEMPTS) {
    message.textContent = `Game Over ❌ The number was ${secretNumber}.`;
    message.className = "message error";
    attemptsText.textContent = `Attempts used: ${attempts}/${MAX_ATTEMPTS}`;
    guessBtn.disabled = true;
    return;
  }

  if (guess > secretNumber) {
    message.textContent = "Too high ⬆️ Try again.";
  } else {
    message.textContent = "Too low ⬇️ Try again.";
  }

  message.className = "message warning";
  attemptsText.textContent = `Attempts: ${attempts}/${MAX_ATTEMPTS}`;
  guessInput.value = "";
}

quitBtn.addEventListener("click", () => {
  setupSection.classList.remove("hidden");
  gameSection.classList.add("hidden");
  guessBtn.disabled = false;
  maxInput.value = "";
  message.textContent = "";
  message.className = "message";
  attemptsText.textContent = "";
});

