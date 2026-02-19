const quotes = [
  "Practice makes a man perfect",
  "JavaScript is the language of the web",
  "Typing fast requires focus and accuracy",
  "Consistency is the key to success",
  "Learning to code opens new opportunities"
];

const quoteEl = document.getElementById("quote");
const inputEl = document.getElementById("input");
const timeEl = document.getElementById("time");
const wpmEl = document.getElementById("wpm");
const accuracyEl = document.getElementById("accuracy");
const startBtn = document.getElementById("startBtn");

let startTime, timer;
let totalTyped = 0;
let correctTyped = 0;

function startTest() {
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  quoteEl.textContent = randomQuote;

  inputEl.value = "";
  inputEl.disabled = false;
  inputEl.focus();

  timeEl.textContent = 0;
  wpmEl.textContent = 0;
  accuracyEl.textContent = 0;

  totalTyped = 0;
  correctTyped = 0;

  startTime = new Date();
  clearInterval(timer);

  timer = setInterval(updateTime, 1000);
}

function updateTime() {
  const currentTime = Math.floor((new Date() - startTime) / 1000);
  timeEl.textContent = currentTime;
}

inputEl.addEventListener("input", () => {
  const typedText = inputEl.value;
  const originalText = quoteEl.textContent;

  totalTyped = typedText.length;
  correctTyped = 0;

  for (let i = 0; i < typedText.length; i++) {
    if (typedText[i] === originalText[i]) {
      correctTyped++;
    }
  }

  const elapsedTime = (new Date() - startTime) / 60000;
  const words = typedText.trim().split(/\s+/).length;
  const wpm = Math.round(words / elapsedTime);

  const accuracy = totalTyped === 0
    ? 0
    : Math.round((correctTyped / totalTyped) * 100);

  wpmEl.textContent = isFinite(wpm) ? wpm : 0;
  accuracyEl.textContent = accuracy;

  if (typedText === originalText) {
    clearInterval(timer);
    inputEl.disabled = true;
    alert("🎉 Test Completed!");
  }
});

startBtn.addEventListener("click", startTest);
