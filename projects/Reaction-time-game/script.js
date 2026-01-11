const gameArea = document.getElementById("gameArea");
const message = document.getElementById("message");
const startBtn = document.getElementById("startBtn");
const lastTimeEl = document.getElementById("lastTime");
const bestTimeEl = document.getElementById("bestTime");

let startTime = null;
let timeoutId = null;
let waitingForClick = false;

let bestTime = null;
let attempts = 0;
let totalTime = 0;
const MAX_ATTEMPTS = 5;

startBtn.addEventListener("click", startGame);
gameArea.addEventListener("click", handleClick);

function startGame() {
  if (attempts >= MAX_ATTEMPTS) return;

  resetRound();
  message.textContent = "Wait...";
  gameArea.className = "game-area waiting";

  const delay = Math.floor(Math.random() * 4000) + 1000;

  timeoutId = setTimeout(() => {
    gameArea.className = "game-area ready";
    message.textContent = "CLICK!";
    startTime = Date.now();
    waitingForClick = true;
  }, delay);
}

function handleClick() {
  if (!timeoutId && !waitingForClick) return;

  if (!waitingForClick) {
    clearTimeout(timeoutId);
    message.textContent = "Too soon!";
    gameArea.className = "game-area too-soon";
    return;
  }

  const reactionTime = Date.now() - startTime;
  attempts++;
  totalTime += reactionTime;

  lastTimeEl.textContent = reactionTime;

  if (bestTime === null || reactionTime < bestTime) {
    bestTime = reactionTime;
    bestTimeEl.textContent = bestTime;
  }

  waitingForClick = false;
  timeoutId = null;
  gameArea.className = "game-area waiting";

  if (attempts === MAX_ATTEMPTS) {
    const avg = Math.round(totalTime / MAX_ATTEMPTS);
    message.textContent = `Done! Avg: ${avg} ms`;
    startBtn.textContent = "Restart";
    startBtn.onclick = resetGame;
  } else {
    message.textContent = `Attempt ${attempts}/${MAX_ATTEMPTS} – Click Start`;
  }
}

function resetRound() {
  clearTimeout(timeoutId);
  timeoutId = null;
  waitingForClick = false;
  startTime = null;
}

function resetGame() {
  attempts = 0;
  totalTime = 0;
  bestTime = null;
  lastTimeEl.textContent = "—";
  bestTimeEl.textContent = "—";
  startBtn.textContent = "Start";
  startBtn.onclick = startGame;
  message.textContent = "Press Start";
}
