const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let keys = {};
let bullets = [];
let enemies = [];
let score = 0;

const player = {
  x: 50,
  y: 330,
  width: 40,
  height: 60,
  color: "#22d3ee",
  speed: 5,
  health: 100,
};

class Enemy {
  constructor() {
    this.width = 40;
    this.height = 60;
    this.x = canvas.width - 60;
    this.y = 330;
    this.speed = Math.random() * 2 + 1;
    this.health = 40;
    this.color = "#f43f5e";
  }

  update() {
    this.x -= this.speed;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

function shoot() {
  bullets.push({
    x: player.x + player.width,
    y: player.y + player.height / 2,
    width: 10,
    height: 4,
    speed: 7,
  });
}

function spawnEnemy() {
  enemies.push(new Enemy());
}

function drawPlayer() {
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

function updateBullets() {
  bullets.forEach((b, index) => {
    b.x += b.speed;
    ctx.fillStyle = "#facc15";
    ctx.fillRect(b.x, b.y, b.width, b.height);

    if (b.x > canvas.width) bullets.splice(index, 1);
  });
}

function checkCollisions() {
  enemies.forEach((enemy, eIndex) => {
    bullets.forEach((b, bIndex) => {
      if (
        b.x < enemy.x + enemy.width &&
        b.x + b.width > enemy.x &&
        b.y < enemy.y + enemy.height &&
        b.y + b.height > enemy.y
      ) {
        enemy.health -= 20;
        bullets.splice(bIndex, 1);

        if (enemy.health <= 0) {
          enemies.splice(eIndex, 1);
          score += 10;
        }
      }
    });

    if (
      enemy.x < player.x + player.width &&
      enemy.x + enemy.width > player.x
    ) {
      player.health -= 1;
    }
  });
}

function updateHUD() {
  document.getElementById("health").innerText =
    "Health: " + player.health;
  document.getElementById("score").innerText =
    "Score: " + score;
}

function gameOver() {
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ctx.font = "40px Arial";
  ctx.fillText("GAME OVER", 280, 220);
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (player.health <= 0) {
    gameOver();
    return;
  }

  if (keys["ArrowRight"] && player.x < canvas.width - player.width)
    player.x += player.speed;
  if (keys["ArrowLeft"] && player.x > 0)
    player.x -= player.speed;

  drawPlayer();
  updateBullets();

  enemies.forEach((enemy, index) => {
    enemy.update();
    enemy.draw();

    if (enemy.x + enemy.width < 0) enemies.splice(index, 1);
  });

  checkCollisions();
  updateHUD();

  requestAnimationFrame(gameLoop);
}

setInterval(spawnEnemy, 2000);

window.addEventListener("keydown", (e) => {
  keys[e.key] = true;
  if (e.key === " ") shoot();
});

window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

gameLoop();
