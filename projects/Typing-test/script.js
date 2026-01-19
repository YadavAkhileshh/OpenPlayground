const quotes = [
  "Practice makes perfect.",
  "Typing fast can save time.",
  "Code is like humor.",
  "Simplicity is the ultimate sophistication."
];

let quote = "";
let startTime = null;
let timerInterval = null;

const quoteDisplay = document.getElementById("quote");
const inputField = document.getElementById("input");
const wpmDisplay = document.getElementById("wpm");
const timeDisplay = document.getElementById("time");

function newQuote() {
  quote = quotes[Math.floor(Math.random() * quotes.length)];
  quoteDisplay.textContent = quote;
  inputField.value = "";
  startTime = null;
  clearInterval(timerInterval);
  timeDisplay.textContent = "Time: 0s";
  wpmDisplay.textContent = "WPM: 0";
}

inputField.addEventListener("input", () => {
  if (!startTime) {
    startTime = new Date();
    timerInterval = setInterval(updateStats, 1000);
  }

  if (inputField.value === quote) {
    clearInterval(timerInterval);
  }
});

function updateStats() {
  const timePassed = Math.floor((new Date() - startTime) / 1000);
  const wordsTyped = inputField.value.trim().split(" ").length;
  const wpm = Math.floor((wordsTyped / timePassed) * 60) || 0;

  timeDisplay.textContent = `Time: ${timePassed}s`;
  wpmDisplay.textContent = `WPM: ${wpm}`;
}

document.getElementById("restart").onclick = newQuote;

newQuote();
