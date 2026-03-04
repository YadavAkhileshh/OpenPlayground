const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let running = false;
let score = 0;
let energy = 100;

const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  r: 8,
  vx: 0,
  vy: 0,
};

function startGame() {
  if (running) return;
  running = true;
  document.getElementById("overlay").style.display = "none";
  requestAnimationFrame(loop);
}

window.addEventListener("click", startGame, { once: true });
window.addEventListener("keydown", startGame, { once: true });

window.addEventListener("mousemove", (e) => {
  if (!running) return;
  player.vx = (e.clientX - player.x) * 0.01;
  player.vy = (e.clientY - player.y) * 0.01;
});

function loop() {
  if (!running) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  player.x += player.vx;
  player.y += player.vy;

  energy -= 0.03;
  score += 1;

  drawPlayer();

  document.getElementById("energy").textContent =
    `Energy: ${Math.max(0, energy).toFixed(0)}%`;
  document.getElementById("score").textContent = `Score: ${score}`;

  if (energy <= 0) return gameOver();

  requestAnimationFrame(loop);
}

function drawPlayer() {
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
  ctx.fillStyle = "#00ffcc";
  ctx.shadowBlur = 20;
  ctx.shadowColor = "#00ffcc";
  ctx.fill();
  ctx.shadowBlur = 0;
}

function gameOver() {
  running = false;
  ctx.fillStyle = "#ff0033";
  ctx.font = "40px Orbitron";
  ctx.fillText("GAME OVER", canvas.width / 2 - 120, canvas.height / 2);
}
