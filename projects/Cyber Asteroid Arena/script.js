const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;

let bullets = [],
  enemies = [];
let score = 0,
  wave = 1,
  running = false;
let keys = {};

const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  r: CONFIG.player.radius,
};

addEventListener("keydown", (e) => (keys[e.key.toLowerCase()] = true));
addEventListener("keyup", (e) => (keys[e.key.toLowerCase()] = false));

canvas.addEventListener("click", (e) => {
  bullets.push({
    x: player.x,
    y: player.y,
    dx: (e.clientX - player.x) * 0.05,
    dy: (e.clientY - player.y) * 0.05,
  });
});

function spawnEnemies() {
  for (let i = 0; i < wave * CONFIG.waves.increment; i++) {
    enemies.push({
      x: Math.random() * canvas.width,
      y: -50,
      r:
        Math.random() * (CONFIG.enemy.maxRadius - CONFIG.enemy.minRadius) +
        CONFIG.enemy.minRadius,
      s: CONFIG.enemy.baseSpeed + Math.random(),
    });
  }
}

function startGame() {
  score = 0;
  wave = 1;
  bullets = [];
  enemies = [];
  running = true;
  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.remove("active"));
  spawnEnemies();
  loop();
}

function endGame() {
  running = false;
  document.getElementById("final").innerText = `Final Score: ${score}`;
  document.getElementById("gameover").classList.add("active");
}

function loop() {
  if (!running) return;
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (keys["w"] || keys["arrowup"]) player.y -= CONFIG.player.speed;
  if (keys["s"] || keys["arrowdown"]) player.y += CONFIG.player.speed;
  if (keys["a"] || keys["arrowleft"]) player.x -= CONFIG.player.speed;
  if (keys["d"] || keys["arrowright"]) player.x += CONFIG.player.speed;

  ctx.fillStyle = "cyan";
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
  ctx.fill();

  bullets.forEach((b) => {
    b.x += b.dx;
    b.y += b.dy;
    ctx.fillRect(b.x, b.y, 4, 4);
  });

  enemies.forEach((e, i) => {
    e.y += e.s;
    ctx.fillStyle = "magenta";
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
    ctx.fill();

    bullets.forEach((b, j) => {
      if (Math.hypot(b.x - e.x, b.y - e.y) < e.r) {
        explode(e.x, e.y, "magenta");
        enemies.splice(i, 1);
        bullets.splice(j, 1);
        score += 10;
      }
    });

    if (Math.hypot(player.x - e.x, player.y - e.y) < player.r + e.r) endGame();
  });

  if (enemies.length === 0) {
    wave++;
    spawnEnemies();
  }

  updateParticles(ctx);
  document.getElementById("score").innerText = `Score: ${score}`;
  document.getElementById("wave").innerText = `Wave: ${wave}`;
  requestAnimationFrame(loop);
}

document.getElementById("play").onclick = startGame;
