const codeDisplay = document.getElementById("codeDisplay");
const codeInput = document.getElementById("codeInput");

const startBtn = document.getElementById("startBtn");
const difficultySelect = document.getElementById("difficulty");
const timeSelect = document.getElementById("timeLimit");

const timeEl = document.getElementById("time");
const wpmEl = document.getElementById("wpm");
const accuracyEl = document.getElementById("accuracy");
const errorEl = document.getElementById("errors");
const bestWpmEl = document.getElementById("bestWpm");

let timer;
let timeLeft;
let totalTyped = 0;
let errors = 0;
let started = false;
let currentSnippet = "";

const snippets = {
  easy: [
`<div class="container">
  <h1>Hello World</h1>
  <p>This is HTML</p>
</div>`
  ],
  medium: [
`.card {
  padding: 16px;
  border-radius: 8px;
  background-color: #fff;
}`
  ],
  hard: [
`function calculateSum(a, b) {
  if (a < 0 || b < 0) {
    return null;
  }
  return a + b;
}`
  ]
};

let bestWpm = localStorage.getItem("bestWpm") || 0;
bestWpmEl.textContent = bestWpm;

function startTest() {
  resetTest();

  const level = difficultySelect.value;
  const list = snippets[level];
  currentSnippet = list[Math.floor(Math.random() * list.length)];

  codeDisplay.innerHTML = "";
  currentSnippet.split("").forEach(char => {
    const span = document.createElement("span");
    span.textContent = char;
    codeDisplay.appendChild(span);
  });

  codeInput.disabled = false;
  codeInput.focus();
  started = true;

  timeLeft = parseInt(timeSelect.value);
  timeEl.textContent = timeLeft;

  timer = setInterval(() => {
    timeLeft--;
    timeEl.textContent = timeLeft;

    if (timeLeft <= 0) endTest();
  }, 1000);
}

function endTest() {
  clearInterval(timer);
  codeInput.disabled = true;
  started = false;

  const minutes = (parseInt(timeSelect.value) - timeLeft) / 60;
  const wpm = Math.round((totalTyped / 5) / minutes) || 0;

  if (wpm > bestWpm) {
    bestWpm = wpm;
    localStorage.setItem("bestWpm", bestWpm);
    bestWpmEl.textContent = bestWpm;
  }
}

function resetTest() {
  clearInterval(timer);
  totalTyped = 0;
  errors = 0;

  wpmEl.textContent = 0;
  accuracyEl.textContent = "100%";
  errorEl.textContent = 0;

  codeInput.value = "";
  codeInput.disabled = true;
}

codeInput.addEventListener("input", () => {
  if (!started) return;

  const input = codeInput.value.split("");
  const spans = codeDisplay.querySelectorAll("span");

  errors = 0;
  totalTyped = input.length;

  spans.forEach((span, index) => {
    const char = input[index];

    if (char == null) {
      span.className = "";
    } else if (char === span.textContent) {
      span.className = "correct";
    } else {
      span.className = "incorrect";
      errors++;
    }
  });

  errorEl.textContent = errors;
  const accuracy = Math.max(0, Math.round(((totalTyped - errors) / totalTyped) * 100));
  accuracyEl.textContent = accuracy + "%";

  const elapsed = (parseInt(timeSelect.value) - timeLeft) / 60;
  const wpm = Math.round((totalTyped / 5) / elapsed) || 0;
  wpmEl.textContent = wpm;
});

startBtn.addEventListener("click", startTest);