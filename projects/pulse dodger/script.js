const arena = document.getElementById("arena");
const player = document.getElementById("player");
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const overlay = document.getElementById("overlay");

let score = 0;
let time = 30;
let running = false;

document.getElementById("startBtn").onclick = () => {
  overlay.style.display = "none";
  running = true;
  startGame();
};

document.addEventListener("mousemove", (e) => {
  if (!running) return;
  const rect = arena.getBoundingClientRect();
  if (e.clientY > rect.top && e.clientY < rect.bottom) {
    player.style.top = e.clientY - rect.top - 9 + "px";
  }
});

function startGame() {
  spawnLoop();
  timerLoop();
}

function spawnPulse() {
  if (!running) return;

  const pulse = document.createElement("div");
  pulse.className = "pulse";
  arena.appendChild(pulse);

  const check = setInterval(() => {
    const p = player.getBoundingClientRect();
    const w = pulse.getBoundingClientRect();
    if (w.left < p.right && w.right > p.left) {
      gameOver();
    }
  }, 30);

  pulse.addEventListener("animationend", () => {
    pulse.remove();
    clearInterval(check);
    score += 10;
    scoreEl.textContent = score;
  });
}

function spawnLoop() {
  const interval = setInterval(() => {
    if (!running) return clearInterval(interval);
    spawnPulse();
  }, 900);
}

function timerLoop() {
  const timer = setInterval(() => {
    if (!running) return clearInterval(timer);
    time--;
    timeEl.textContent = time;
    if (time <= 0) winGame();
  }, 1000);
}

function gameOver() {
  running = false;
  endScreen("GAME OVER", score);
}

function winGame() {
  running = false;
  endScreen("YOU SURVIVED", score);
}

function endScreen(title, finalScore) {
  overlay.innerHTML = `
    <div class="card">
      <h1>${title}</h1>
      <p>Score: ${finalScore}</p>
      <button onclick="location.reload()">RESTART</button>
    </div>
  `;
  overlay.style.display = "flex";
}
