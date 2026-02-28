const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = 900;
canvas.height = 420;

let gameOver = false;
let score = 0;

// ---------- PLAYER ----------
const player = {
  x: 120, y: 300, w: 40, h: 50,
  speed: 5, dy: 0, grounded: false,
  dir: 1, // 1 right, -1 left
  health: 5
};

const GRAVITY = 0.6;

// ---------- INPUT ----------
const keys = {};
document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

// ---------- BULLETS ----------
const bullets = [];
let lastShot = 0;
const fireRate = 200;

function shoot(time) {
  if (time - lastShot < fireRate) return;
  bullets.push({
    x: player.dir === 1 ? player.x + player.w : player.x - 10,
    y: player.y + player.h / 2,
    w: 10, h: 4,
    speed: 8 * player.dir
  });
  lastShot = time;
}

// ---------- ENEMIES ----------
const enemies = [];
let enemyConfig;
let lastSpawn = 0;

function spawnEnemy() {
  const t = enemyConfig.enemyTypes[Math.floor(Math.random() * enemyConfig.enemyTypes.length)];
  const fromLeft = Math.random() < 0.5;

  enemies.push({
    ...t,
    x: fromLeft ? -t.width : canvas.width + t.width,
    y: t.fly ? 120 + Math.random() * 120 : canvas.height - 30 - t.height,
    dir: fromLeft ? 1 : -1,
    angle: t.fly ? Math.random() * Math.PI * 2 : 0
  });
}

// ---------- COLLISION ----------
function hit(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.w > b.x &&
    a.y < b.y + b.height &&
    a.y + a.h > b.y
  );
}

// ---------- UPDATE ----------
function updatePlayer() {
  if (keys.ArrowRight) {
    player.x += player.speed;
    player.dir = 1;
  }
  if (keys.ArrowLeft) {
    player.x -= player.speed;
    player.dir = -1;
  }

  if (keys.Space && player.grounded) {
    player.dy = -12;
    player.grounded = false;
  }

  player.dy += GRAVITY;
  player.y += player.dy;

  if (player.y + player.h >= canvas.height - 30) {
    player.y = canvas.height - 30 - player.h;
    player.dy = 0;
    player.grounded = true;
  }
}

function updateBullets() {
  bullets.forEach(b => b.x += b.speed);
}

function updateEnemies() {
  enemies.forEach(e => {
    e.x += e.speed * e.dir;
    if (e.fly) {
      e.angle += 0.05;
      e.y += Math.sin(e.angle) * 2;
    }
  });
}

function handleCollisions() {
  bullets.forEach(b => {
    enemies.forEach(e => {
      if (hit({ ...b, width: b.w, height: b.h }, e)) {
        e.health--;
        b.x = 9999;
        if (e.health <= 0) {
          score += 10;
        }
      }
    });
  });

  enemies.forEach(e => {
    if (hit(player, e)) {
      player.health--;
      e.x = -9999;
      if (player.health <= 0) gameOver = true;
    }
  });

  for (let i = enemies.length - 1; i >= 0; i--) {
    if (enemies[i].health <= 0) enemies.splice(i, 1);
  }
}

// ---------- DRAW ----------
function drawHealthBar(e) {
  const barWidth = e.width;
  const ratio = e.health / (e.type === "ground" ? 2 : 1);
  ctx.fillStyle = "red";
  ctx.fillRect(e.x, e.y - 6, barWidth * ratio, 4);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "green";
  ctx.fillRect(0, canvas.height - 30, canvas.width, 30);

  ctx.fillStyle = "red";
  ctx.fillRect(player.x, player.y, player.w, player.h);

  ctx.fillStyle = "yellow";
  bullets.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));

  ctx.fillStyle = "cyan";
  enemies.forEach(e => {
    ctx.fillRect(e.x, e.y, e.width, e.height);
    drawHealthBar(e);
  });

  document.getElementById("health").textContent = "❤️".repeat(player.health);
  document.getElementById("score").textContent = "Score: " + score;

  if (gameOver) {
    ctx.fillStyle = "white";
    ctx.font = "40px monospace";
    ctx.fillText("GAME OVER", 320, 210);
  }
}

// ---------- LOOP ----------
function loop(time) {
  if (!gameOver) {
    if (time - lastSpawn > enemyConfig.spawn.interval) {
      spawnEnemy();
      lastSpawn = time;
    }

    if (keys.KeyZ) shoot(time);
    updatePlayer();
    updateBullets();
    updateEnemies();
    handleCollisions();
  }

  draw();
  requestAnimationFrame(loop);
}

// ---------- START ----------
fetch("enemies.json")
  .then(res => res.json())
  .then(cfg => {
    enemyConfig = cfg;
    requestAnimationFrame(loop);
  });
