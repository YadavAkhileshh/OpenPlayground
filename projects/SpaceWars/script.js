const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 500;

// Player
const player = {
  x: canvas.width / 2 - 20,
  y: canvas.height - 60,
  width: 40,
  height: 40,
  speed: 6,
  health: 100
};

// Game data
let bullets = [];
let enemies = [];
let score = 0;
let keys = {};

// Controls
document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

// Shoot bullet
function shoot() {
  bullets.push({
    x: player.x + player.width / 2 - 3,
    y: player.y,
    width: 6,
    height: 12,
    speed: 8
  });
}

// Create enemy
function spawnEnemy() {
  enemies.push({
    x: Math.random() * (canvas.width - 40),
    y: -40,
    width: 40,
    height: 40,
    speed: 2 + Math.random() * 2
  });
}

// Collision check
function collide(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// Game Loop
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Move player
  if (keys["ArrowLeft"] && player.x > 0) player.x -= player.speed;
  if (keys["ArrowRight"] && player.x < canvas.width - player.width) player.x += player.speed;
  if (keys["Space"]) {
    if (!keys.shooting) {
      shoot();
      keys.shooting = true;
    }
  } else {
    keys.shooting = false;
  }

  // Draw player
  ctx.fillStyle = "#00ffff";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Bullets
  bullets.forEach((b, i) => {
    b.y -= b.speed;
    ctx.fillStyle = "yellow";
    ctx.fillRect(b.x, b.y, b.width, b.height);
    if (b.y < 0) bullets.splice(i, 1);
  });

  // Enemies
  enemies.forEach((e, i) => {
    e.y += e.speed;
    ctx.fillStyle = "red";
    ctx.fillRect(e.x, e.y, e.width, e.height);

    // Enemy hits player
    if (collide(player, e)) {
      player.health -= 20;
      enemies.splice(i, 1);
    }

    // Bullet hits enemy
    bullets.forEach((b, bi) => {
      if (collide(b, e)) {
        score += 10;
        enemies.splice(i, 1);
        bullets.splice(bi, 1);
      }
    });
  });

  document.getElementById("info").innerText =
    `Score: ${score} | Health: ${player.health}`;

  // Game Over
  if (player.health <= 0) {
    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.fillText("GAME OVER", 280, 250);
    return;
  }

  requestAnimationFrame(update);
}

// Spawn enemies every second
setInterval(spawnEnemy, 1000);
update();
