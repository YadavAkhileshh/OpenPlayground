let time = 25 * 60;
let timerInterval;
let sessions = 0;
let isRunning = false;

const timerDisplay = document.getElementById("timer");
const sessionText = document.getElementById("sessionText");

function updateDisplay() {
  let minutes = Math.floor(time / 60);
  let seconds = time % 60;
  timerDisplay.innerText =
    `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

function startTimer() {
  if(isRunning) return;
  isRunning = true;

  timerInterval = setInterval(() => {
    time--;

    if(time <= 0) {
      clearInterval(timerInterval);
      sessions++;
      sessionText.innerText = "Sessions Completed: " + sessions;
      time = 5 * 60; // break time
      alert("Break Time! ☕");
      isRunning = false;
    }

    updateDisplay();
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerInterval);
  isRunning = false;
}

function resetTimer() {
  clearInterval(timerInterval);
  time = 25 * 60;
  isRunning = false;
  updateDisplay();
}