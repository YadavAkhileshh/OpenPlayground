const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const coinsElement = document.getElementById("coins");
const livesElement = document.getElementById("lives");
const levelElement = document.getElementById("level");
const startBtn = document.getElementById("startBtn");

// Player
const player = {
  x: 50,
  y: 350,
  width: 30,
  height: 40,
  velocityX: 0,
  velocityY: 0,
  speed: 5,
  jumpPower: -12,
  gravity: 0.5,
  isJumping: false,
  onGround: false,
};

// Game state
let platforms = [];
let coins = [];
let enemies = [];
let flag = null;
let cameraX = 0;
let coinsCollected = 0;
let totalCoins = 10;
let lives = 3;
let level = 1;
let gameRunning = false;
let animationId;
let keys = {};

function createLevel(levelNum) {
  platforms = [];
  coins = [];
  enemies = [];

  // Ground
  platforms.push({ x: 0, y: 420, width: 2000, height: 80, type: "ground" });

  if (levelNum === 1) {
    // Level 1 platforms
    platforms.push({
      x: 200,
      y: 350,
      width: 100,
      height: 20,
      type: "platform",
    });
    platforms.push({
      x: 400,
      y: 300,
      width: 100,
      height: 20,
      type: "platform",
    });
    platforms.push({
      x: 600,
      y: 250,
      width: 100,
      height: 20,
      type: "platform",
    });
    platforms.push({
      x: 800,
      y: 300,
      width: 150,
      height: 20,
      type: "platform",
    });
    platforms.push({
      x: 1050,
      y: 350,
      width: 100,
      height: 20,
      type: "platform",
    });
    platforms.push({
      x: 1250,
      y: 300,
      width: 200,
      height: 20,
      type: "platform",
    });

    // Coins
    for (let i = 0; i < 10; i++) {
      coins.push({
        x: 250 + i * 130,
        y: i % 2 === 0 ? 200 : 250,
        width: 20,
        height: 20,
        collected: false,
      });
    }

    // Enemies
    enemies.push({
      x: 500,
      y: 390,
      width: 30,
      height: 30,
      direction: 1,
      speed: 2,
      range: 150,
      startX: 500,
    });
    enemies.push({
      x: 900,
      y: 390,
      width: 30,
      height: 30,
      direction: 1,
      speed: 2,
      range: 200,
      startX: 900,
    });

    // Flag at end
    flag = { x: 1400, y: 250, width: 40, height: 60 };
  }
}

function drawPlayer() {
  const screenX = player.x - cameraX;

  // Body
  ctx.fillStyle = "#ff6b6b";
  ctx.fillRect(screenX, player.y, player.width, player.height);

  // Head
  ctx.fillStyle = "#feca57";
  ctx.fillRect(screenX + 5, player.y - 10, 20, 20);

  // Eyes
  ctx.fillStyle = "#000";
  ctx.fillRect(screenX + 8, player.y - 5, 4, 4);
  ctx.fillRect(screenX + 18, player.y - 5, 4, 4);

  // Legs
  ctx.fillStyle = "#333";
  ctx.fillRect(screenX + 5, player.y + player.height, 8, 10);
  ctx.fillRect(screenX + 17, player.y + player.height, 8, 10);
}

function drawPlatform(platform) {
  const screenX = platform.x - cameraX;

  if (platform.type === "ground") {
    ctx.fillStyle = "#2d5016";
    ctx.fillRect(screenX, platform.y, platform.width, platform.height);

    // Grass top
    ctx.fillStyle = "#4ade80";
    ctx.fillRect(screenX, platform.y, platform.width, 10);
  } else {
    ctx.fillStyle = "#8b4513";
    ctx.fillRect(screenX, platform.y, platform.width, platform.height);

    // Wood grain
    ctx.fillStyle = "#654321";
    for (let i = 0; i < platform.width; i += 30) {
      ctx.fillRect(screenX + i, platform.y + 5, 2, 10);
    }
  }
}

function drawCoin(coin) {
  if (coin.collected) return;

  const screenX = coin.x - cameraX;
  const time = Date.now() * 0.005;
  const bounce = Math.sin(time + coin.x) * 3;

  ctx.fillStyle = "#ffd700";
  ctx.beginPath();
  ctx.arc(
    screenX + coin.width / 2,
    coin.y + bounce,
    coin.width / 2,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  ctx.fillStyle = "#ffed4e";
  ctx.beginPath();
  ctx.arc(screenX + coin.width / 2 - 3, coin.y + bounce - 3, 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawEnemy(enemy) {
  const screenX = enemy.x - cameraX;

  ctx.fillStyle = "#8b00ff";
  ctx.fillRect(screenX, enemy.y, enemy.width, enemy.height);

  // Eyes
  ctx.fillStyle = "#ff0000";
  ctx.fillRect(screenX + 5, enemy.y + 8, 6, 6);
  ctx.fillRect(screenX + 19, enemy.y + 8, 6, 6);
}

function drawFlag(flag) {
  const screenX = flag.x - cameraX;

  // Pole
  ctx.fillStyle = "#654321";
  ctx.fillRect(screenX + flag.width / 2 - 2, flag.y, 4, flag.height);

  // Flag
  ctx.fillStyle = "#22c55e";
  ctx.beginPath();
  ctx.moveTo(screenX + flag.width / 2 + 2, flag.y);
  ctx.lineTo(screenX + flag.width, flag.y + 15);
  ctx.lineTo(screenX + flag.width / 2 + 2, flag.y + 30);
  ctx.closePath();
  ctx.fill();
}

function updatePlayer() {
  // Horizontal movement
  player.x += player.velocityX;

  // Vertical movement
  player.velocityY += player.gravity;
  player.y += player.velocityY;

  player.onGround = false;

  // Platform collision
  for (let platform of platforms) {
    if (
      player.x + player.width > platform.x &&
      player.x < platform.x + platform.width &&
      player.y + player.height > platform.y &&
      player.y + player.height < platform.y + platform.height &&
      player.velocityY >= 0
    ) {
      player.y = platform.y - player.height;
      player.velocityY = 0;
      player.isJumping = false;
      player.onGround = true;
    }
  }

  // Prevent falling below ground
  if (player.y > canvas.height) {
    loseLife();
  }
}

function updateCamera() {
  cameraX = player.x - canvas.width / 3;
  cameraX = Math.max(0, Math.min(cameraX, 2000 - canvas.width));
}

function updateEnemies() {
  enemies.forEach((enemy) => {
    enemy.x += enemy.speed * enemy.direction;

    if (
      enemy.x > enemy.startX + enemy.range ||
      enemy.x < enemy.startX - enemy.range
    ) {
      enemy.direction *= -1;
    }

    // Check collision with player
    if (
      player.x + player.width > enemy.x &&
      player.x < enemy.x + enemy.width &&
      player.y + player.height > enemy.y &&
      player.y < enemy.y + enemy.height
    ) {
      loseLife();
    }
  });
}

function checkCoinCollection() {
  coins.forEach((coin) => {
    if (
      !coin.collected &&
      player.x + player.width > coin.x &&
      player.x < coin.x + coin.width &&
      player.y + player.height > coin.y &&
      player.y < coin.y + coin.height
    ) {
      coin.collected = true;
      coinsCollected++;
      coinsElement.textContent = `${coinsCollected} / ${totalCoins}`;
    }
  });
}

function checkFlagReached() {
  if (
    flag &&
    player.x + player.width > flag.x &&
    player.x < flag.x + flag.width &&
    player.y + player.height > flag.y &&
    player.y < flag.y + flag.height
  ) {
    if (coinsCollected >= totalCoins) {
      nextLevel();
    }
  }
}

function loseLife() {
  lives--;
  livesElement.textContent = "❤️".repeat(lives);

  if (lives <= 0) {
    gameOver();
  } else {
    resetPlayerPosition();
  }
}

function resetPlayerPosition() {
  player.x = 50;
  player.y = 350;
  player.velocityX = 0;
  player.velocityY = 0;
}

function nextLevel() {
  level++;
  levelElement.textContent = level;
  alert(`Level ${level - 1} Complete! Starting Level ${level}...`);

  if (level > 1) {
    alert("Congratulations! You completed all levels!");
    level = 1;
    lives = 3;
    livesElement.textContent = "❤️❤️❤️";
  }

  coinsCollected = 0;
  coinsElement.textContent = `0 / ${totalCoins}`;
  resetPlayerPosition();
  createLevel(level);
}

function gameOver() {
  gameRunning = false;
  cancelAnimationFrame(animationId);
  alert(`Game Over! You reached Level ${level}`);
  startBtn.textContent = "Restart Game";
}

function draw() {
  // Sky
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#87CEEB");
  gradient.addColorStop(1, "#E0F6FF");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Clouds
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  for (let i = 0; i < 3; i++) {
    const cloudX = (i * 300 - cameraX * 0.5) % 900;
    ctx.beginPath();
    ctx.arc(cloudX, 80 + i * 40, 25, 0, Math.PI * 2);
    ctx.arc(cloudX + 30, 75 + i * 40, 30, 0, Math.PI * 2);
    ctx.arc(cloudX + 60, 80 + i * 40, 25, 0, Math.PI * 2);
    ctx.fill();
  }

  platforms.forEach(drawPlatform);
  coins.forEach(drawCoin);
  enemies.forEach(drawEnemy);
  if (flag) drawFlag(flag);
  drawPlayer();
}

function gameLoop() {
  if (!gameRunning) return;

  updatePlayer();
  updateCamera();
  updateEnemies();
  checkCoinCollection();
  checkFlagReached();
  draw();

  animationId = requestAnimationFrame(gameLoop);
}

function startGame() {
  level = 1;
  lives = 3;
  coinsCollected = 0;

  levelElement.textContent = level;
  livesElement.textContent = "❤️❤️❤️";
  coinsElement.textContent = `0 / ${totalCoins}`;

  resetPlayerPosition();
  createLevel(level);

  gameRunning = true;
  startBtn.textContent = "Restart";
  gameLoop();
}

// Keyboard controls
document.addEventListener("keydown", (e) => {
  keys[e.key] = true;

  if (!gameRunning) return;

  if (
    (e.key === " " || e.key === "w" || e.key === "W" || e.key === "ArrowUp") &&
    player.onGround
  ) {
    player.velocityY = player.jumpPower;
    player.isJumping = true;
    e.preventDefault();
  }

  if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
    player.velocityX = -player.speed;
  }
  if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
    player.velocityX = player.speed;
  }
});

document.addEventListener("keyup", (e) => {
  keys[e.key] = false;

  if (
    (e.key === "ArrowLeft" ||
      e.key === "a" ||
      e.key === "A" ||
      e.key === "ArrowRight" ||
      e.key === "d" ||
      e.key === "D") &&
    !keys["ArrowLeft"] &&
    !keys["a"] &&
    !keys["A"] &&
    !keys["ArrowRight"] &&
    !keys["d"] &&
    !keys["D"]
  ) {
    player.velocityX = 0;
  }
});

startBtn.addEventListener("click", startGame);

// Initial draw
createLevel(1);
draw();
