const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

let gameRunning = false;
let score = 0;
let timeAlive = 0;
let enemies = [];
let keys = {};

const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  size: GAME_CONFIG.player.size,
  speed: GAME_CONFIG.player.speed,
};

window.addEventListener("keydown", (e) => (keys[e.key.toLowerCase()] = true));
window.addEventListener("keyup", (e) => (keys[e.key.toLowerCase()] = false));

function spawnEnemy() {
  const size =
    Math.random() * (GAME_CONFIG.enemy.maxSize - GAME_CONFIG.enemy.minSize) +
    GAME_CONFIG.enemy.minSize;

  enemies.push({
    x: Math.random() * canvas.width,
    y: -size,
    size,
    speed: GAME_CONFIG.enemy.baseSpeed + Math.random() * 2,
  });
}

function updatePlayer() {
  if (keys["arrowleft"] || keys["a"]) player.x -= player.speed;
  if (keys["arrowright"] || keys["d"]) player.x += player.speed;
  if (keys["arrowup"] || keys["w"]) player.y -= player.speed;
  if (keys["arrowdown"] || keys["s"]) player.y += player.speed;

  player.x = Math.max(0, Math.min(canvas.width, player.x));
  player.y = Math.max(0, Math.min(canvas.height, player.y));
}

function drawPlayer() {
  ctx.shadowBlur = 20;
  ctx.shadowColor = GAME_CONFIG.player.color;
  ctx.fillStyle = GAME_CONFIG.player.color;
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
  ctx.fill();
}

function updateEnemies() {
  enemies.forEach((e, i) => {
    e.y += e.speed + timeAlive * GAME_CONFIG.difficulty.speedRamp;

    ctx.fillStyle = "#ff006a";
    ctx.shadowColor = "#ff006a";
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
    ctx.fill();

    const dist = Math.hypot(player.x - e.x, player.y - e.y);
    if (dist < player.size + e.size) {
      spawnParticles(player.x, player.y, "#ff006a");
      screenShake();
      endGame();
    }

    if (e.y > canvas.height + e.size) enemies.splice(i, 1);
  });
}

function updateUI() {
  document.getElementById("score").textContent = `Score: ${score}`;
  document.getElementById("time").textContent =
    `Time: ${Math.floor(timeAlive)}`;
}

function gameLoop() {
  if (!gameRunning) return;

  ctx.save();
  if (shakeTime > 0) {
    ctx.translate((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10);
    shakeTime--;
  }

  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  updatePlayer();
  drawPlayer();
  updateEnemies();
  updateParticles(ctx);

  ctx.restore();

  if (
    Math.random() <
    GAME_CONFIG.enemy.spawnRate + timeAlive * GAME_CONFIG.difficulty.spawnRamp
  ) {
    spawnEnemy();
  }

  score++;
  timeAlive += 0.016;
  updateUI();

  requestAnimationFrame(gameLoop);
}

function startGame() {
  enemies = [];
  particles = [];
  score = 0;
  timeAlive = 0;
  gameRunning = true;
  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.remove("active"));
  gameLoop();
}

function endGame() {
  gameRunning = false;
  document.getElementById("finalScore").textContent = `Final Score: ${score}`;
  document.getElementById("gameOverScreen").classList.add("active");
}

document.getElementById("startGame").onclick = startGame;
document.getElementById("restartGame").onclick = startGame;
