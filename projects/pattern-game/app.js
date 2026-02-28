const dirs = ["up", "down", "left", "right"];

let pattern = [];
let inputIndex = 0;
let locked = true;

const screen = document.getElementById("screen");
const keys = document.querySelectorAll("kbd");

screen.addEventListener("click", () => {
  if (!locked && pattern.length) return;
  startGame();
});

function startGame() {
  pattern = [];
  inputIndex = 0;
  locked = true;
  screen.textContent = "WATCH";
  setTimeout(nextRound, 400);
}

function nextRound() {
  locked = true;
  inputIndex = 0;

  pattern.push(dirs[Math.floor(Math.random() * dirs.length)]);
  showPattern();
}

function showPattern() {
  let i = 0;
  screen.textContent = "WATCH";

  const interval = setInterval(() => {
    flash(pattern[i]);
    i++;

    if (i >= pattern.length) {
      clearInterval(interval);
      locked = false;
      screen.textContent = "YOUR TURN";
    }
  }, 600);
}

function flash(dir) {
  const key = document.querySelector(`kbd[data-dir="${dir}"]`);
  if (!key) return;

  key.classList.add("active");
  setTimeout(() => key.classList.remove("active"), 300);
}

keys.forEach(k => {
  k.addEventListener("click", () => {
    if (locked) return;

    const dir = k.dataset.dir;
    flash(dir);

    if (dir !== pattern[inputIndex]) {
      gameOver();
      return;
    }

    inputIndex++;

    if (inputIndex === pattern.length) {
      locked = true;
      screen.textContent = "GOOD";
      setTimeout(nextRound, 700);
    }
  });
});

function gameOver() {
  locked = true;
  screen.textContent = "GAME OVER PRESS SCREEN";
}
