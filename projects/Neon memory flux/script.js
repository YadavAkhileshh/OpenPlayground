const colors = ["red", "blue", "green", "yellow"];
const grid = document.getElementById("grid");
const info = document.getElementById("info");
const levelEl = document.getElementById("level");
const mistakesEl = document.getElementById("mistakes");
const startBtn = document.getElementById("startBtn");

let sequence = [];
let userStep = 0;
let level = 1;
let mistakes = 0;
let locked = true;

colors.forEach((color) => {
  const d = document.createElement("div");
  d.className = `tile ${color}`;
  d.dataset.color = color;
  d.onclick = () => handleClick(color, d);
  grid.appendChild(d);
});

function startGame() {
  sequence = [];
  level = 1;
  mistakes = 0;
  updateHUD();
  startBtn.style.display = "none";
  nextRound();
}

function nextRound() {
  locked = true;
  info.textContent = "Watch carefully";
  sequence.push(randomColor());
  userStep = 0;

  let i = 0;
  const interval = setInterval(() => {
    flash(sequence[i]);
    playBeep();
    i++;
    if (i >= sequence.length) {
      clearInterval(interval);
      locked = false;
      info.textContent = "Your turn";
    }
  }, 600);
}

function handleClick(color, el) {
  if (locked) return;
  flash(color);
  playBeep();

  if (color === sequence[userStep]) {
    userStep++;
    if (userStep === sequence.length) {
      level++;
      updateHUD();
      setTimeout(nextRound, 700);
    }
  } else {
    mistakes++;
    mistakesEl.textContent = mistakes;
    document.getElementById("panel").classList.add("shake");
    setTimeout(
      () => document.getElementById("panel").classList.remove("shake"),
      400,
    );

    if (mistakes >= 3) endGame();
  }
}

function endGame() {
  locked = true;
  info.textContent = "GAME OVER";
  info.classList.add("game-over");
  startBtn.textContent = "RESTART";
  startBtn.style.display = "inline-block";
}

function flash(color) {
  const el = document.querySelector(`.${color}`);
  el.classList.add("flash");
  setTimeout(() => el.classList.remove("flash"), 400);
}

function randomColor() {
  return colors[Math.floor(Math.random() * colors.length)];
}

function updateHUD() {
  levelEl.textContent = level;
  mistakesEl.textContent = mistakes;
}

startBtn.onclick = startGame;
