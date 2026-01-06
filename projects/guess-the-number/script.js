let secretNumber;
let attempts = 0;
const MAX_ATTEMPTS = 10;
const MAX_NUMBER = 100;
const MIN_NUMBER = 1;

const startBtn = document.getElementById("startBtn");
const guessBtn = document.getElementById("guessBtn");
const quitBtn = document.getElementById("quitBtn");
const restartBtn = document.getElementById("restartBtn");

const guessInput = document.getElementById("guessInput");

const message = document.getElementById("message");
const attemptsText = document.getElementById("attempts");
const feedbackText = document.getElementById("feedback");

const setupSection = document.querySelector(".setup");
const gameSection = document.querySelector(".game");

startBtn.addEventListener("click", () => {
  // Generate random number between 1 and 100
  secretNumber = Math.floor(Math.random() * MAX_NUMBER) + MIN_NUMBER;
  attempts = 0;

  setupSection.classList.add("hidden");
  gameSection.classList.remove("hidden");

  message.textContent = "Game started! Make your guess.";
  message.className = "message warning";
  attemptsText.textContent = `Attempts: 0 / ${MAX_ATTEMPTS}`;
  feedbackText.textContent = "";
  restartBtn.classList.add("hidden");

  guessBtn.disabled = false;
  guessInput.value = "";
  guessInput.focus();
});

guessBtn.addEventListener("click", handleGuess);
guessInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !guessBtn.disabled) handleGuess();
});
restartBtn.addEventListener("click", () => {
  setupSection.classList.remove("hidden");
  gameSection.classList.add("hidden");
  guessBtn.disabled = false;
  message.textContent = "";
  message.className = "message";
  attemptsText.textContent = "";
  feedbackText.textContent = "";
});

function handleGuess() {
  const guess = Number(guessInput.value);

  if (!guess || guess < MIN_NUMBER || guess > MAX_NUMBER) {
    message.textContent = `Please enter a valid number between ${MIN_NUMBER} and ${MAX_NUMBER}.`;
    message.className = "message warning";
    return;
  }

  attempts++;

  if (guess === secretNumber) {
    message.textContent = `Correct! 🎉 You found the number ${secretNumber}!`;
    message.className = "message success";
    attemptsText.textContent = `You guessed it in ${attempts} attempt${attempts !== 1 ? 's' : ''}.`;
    feedbackText.textContent = attempts <= 5 ? "Outstanding! 🌟" : "Well done! 👍";
    guessBtn.disabled = true;
    restartBtn.classList.remove("hidden");
    return;
  }

  if (attempts >= MAX_ATTEMPTS) {
    message.textContent = `Game Over ❌ The number was ${secretNumber}.`;
    message.className = "message error";
    attemptsText.textContent = `Attempts used: ${attempts}/${MAX_ATTEMPTS}`;
    feedbackText.textContent = "Better luck next time!";
    guessBtn.disabled = true;
    restartBtn.classList.remove("hidden");
    return;
  }

  if (guess > secretNumber) {
    message.textContent = "Too high! ⬆️ Try a lower number.";
  } else {
    message.textContent = "Too low! ⬇️ Try a higher number.";
  }

  message.className = "message warning";
  attemptsText.textContent = `Attempts: ${attempts}/${MAX_ATTEMPTS}`;
  feedbackText.textContent = `Remaining: ${MAX_ATTEMPTS - attempts} guess${MAX_ATTEMPTS - attempts !== 1 ? 'es' : ''}`;
  guessInput.value = "";
  guessInput.focus();
}

quitBtn.addEventListener("click", () => {
  setupSection.classList.remove("hidden");
  gameSection.classList.add("hidden");
  guessBtn.disabled = false;
  message.textContent = "";
  message.className = "message";
  attemptsText.textContent = "";
  feedbackText.textContent = "";
  restartBtn.classList.add("hidden");
});

