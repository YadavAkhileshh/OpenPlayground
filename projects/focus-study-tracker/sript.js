const timerDisplay = document.getElementById("timer");
const focusBtn = document.getElementById("focusBtn");
const breakBtn = document.getElementById("breakBtn");
const resetBtn = document.getElementById("resetBtn");
const sessionCountEl = document.getElementById("sessionCount");

let timer = null;
let timeLeft = 25 * 60;
let isFocus = true;

// Load session count from localStorage
let sessionsToday = localStorage.getItem("focusSessions")
  ? parseInt(localStorage.getItem("focusSessions"))
  : 0;

sessionCountEl.textContent = sessionsToday;

function updateDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timerDisplay.textContent =
    `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
}

function startTimer(duration, focusMode) {
  clearInterval(timer);
  timeLeft = duration;
  isFocus = focusMode;
  updateDisplay();

  timer = setInterval(() => {
    timeLeft--;
    updateDisplay();

    if (timeLeft <= 0) {
      clearInterval(timer);

      if (isFocus) {
        sessionsToday++;
        localStorage.setItem("focusSessions", sessionsToday);
        sessionCountEl.textContent = sessionsToday;
        alert("✅ Focus session completed! Take a break.");
      } else {
        alert("☕ Break over! Ready to focus again?");
      }
    }
  }, 1000);
}

focusBtn.addEventListener("click", () => {
  startTimer(25 * 60, true);
});

breakBtn.addEventListener("click", () => {
  startTimer(5 * 60, false);
});

resetBtn.addEventListener("click", () => {
  clearInterval(timer);
  timeLeft = 25 * 60;
  updateDisplay();
});

updateDisplay();
