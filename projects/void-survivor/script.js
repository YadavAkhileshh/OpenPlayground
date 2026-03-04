const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

const hpBar = document.getElementById("hpBar");
const scoreEl = document.getElementById("score");
const gameOverEl = document.getElementById("gameover");

const keys = {};
let mouse = { x: 0, y: 0, down: false };

addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);
addEventListener("mousemove", e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});
addEventListener("mousedown", () => mouse.down = true);
addEventListener("mouseup", () => mouse.down = false);
addEventListener("resize", () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
});

const player = {
  x: 0, y: 0,
  vx: 0, vy: 0,
  speed: 0.7,
  maxSpeed: 6,
  hp: 100,
  fireCooldown: 0
};

let bullets = [];
let enemies = [];
let score = 0;
let running = true;

// -------- ENEMY SPAWN --------
function spawnEnemy() {
  const angle = Math.random() * Math.PI * 2;
  const dist = 500;
  enemies.push({
    x: player.x + Math.cos(angle) * dist,
    y: player.y + Math.sin(angle) * dist,
    r: 16
  });
}
setInterval(() => running && spawnEnemy(), 900);

// -------- SHOOT --------
function shoot() {
  if (player.fireCooldown > 0) return;

  const angle = Math.atan2(
    mouse.y - canvas.height / 2,
    mouse.x - canvas.width / 2
  );

  bullets.push({
    x: player.x,
    y: player.y,
    vx: Math.cos(angle) * 12,
    vy: Math.sin(angle) * 12,
    life: 60
  });

  player.fireCooldown = 10;
}

// -------- UPDATE --------
function update() {
  if (!running) return;

  if (keys["w"]) player.vy -= player.speed;
  if (keys["s"]) player.vy += player.speed;
  if (keys["a"]) player.vx -= player.speed;
  if (keys["d"]) player.vx += player.speed;

  player.vx *= 0.88;
  player.vy *= 0.88;

  player.vx = Math.max(-player.maxSpeed, Math.min(player.maxSpeed, player.vx));
  player.vy = Math.max(-player.maxSpeed, Math.min(player.maxSpeed, player.vy));

  player.x += player.vx;
  player.y += player.vy;

  if (mouse.down) shoot();
  player.fireCooldown--;

  bullets.forEach((b, i) => {
    b.x += b.vx;
    b.y += b.vy;
    if (--b.life <= 0) bullets.splice(i, 1);
  });

  enemies.forEach((e, ei) => {
    const dx = player.x - e.x;
    const dy = player.y - e.y;
    const d = Math.hypot(dx, dy) || 1;

    e.x += dx / d * 1.4;
    e.y += dy / d * 1.4;

    if (d < 20) {
      player.hp -= 0.5;
      if (player.hp <= 0) {
        running = false;
        gameOverEl.style.display = "flex";
      }
    }
  });

  bullets.forEach((b, bi) => {
    enemies.forEach((e, ei) => {
      if (Math.hypot(b.x - e.x, b.y - e.y) < e.r) {
        enemies.splice(ei, 1);
        bullets.splice(bi, 1);
        score += 10;
      }
    });
  });

  hpBar.style.width = Math.max(0, player.hp) * 2.2 + "px";
  scoreEl.textContent = "Score: " + score;
}

// -------- DRAW --------
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(
    canvas.width / 2 - player.x,
    canvas.height / 2 - player.y
  );

  // Player
  const a = Math.atan2(
    mouse.y - canvas.height / 2,
    mouse.x - canvas.width / 2
  );
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.rotate(a);
  ctx.fillStyle = "#00ffff";
  ctx.fillRect(-16, -6, 32, 12);
  ctx.restore();

  // Bullets
  ctx.fillStyle = "#ffd700";
  bullets.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  // Enemies
  ctx.fillStyle = "#ff3355";
  enemies.forEach(e => {
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();

  requestAnimationFrame(draw);
}

// -------- LOOP --------
function loop() {
  update();
  requestAnimationFrame(loop);
}

loop();
draw();