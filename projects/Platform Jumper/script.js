const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const bestScoreElement = document.getElementById("bestScore");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const finalScoreElement = document.getElementById("finalScore");
const finalBestElement = document.getElementById("finalBest");

// Player
const player = {
  x: canvas.width / 2,
  y: canvas.height - 100,
  width: 40,
  height: 40,
  velocityX: 0,
  velocityY: 0,
  speed: 5,
  jumpPower: -15,
  gravity: 0.6,
  isJumping: false,
};

// Platforms
let platforms = [];
const platformWidth = 80;
const platformHeight = 15;
let cameraY = 0;
let score = 0;
let maxHeight = 0;
let bestScore = localStorage.getItem("skyJumperBest") || 0;
let gameRunning = false;
let animationId;

bestScoreElement.textContent = bestScore;

const platformTypes = [
  { color: "#4ade80", solid: true, break: false },
  { color: "#60a5fa", solid: true, break: false },
  { color: "#a78bfa", solid: true, break: false },
  { color: "#f87171", solid: false, break: true },
  { color: "#fbbf24", solid: true, break: false, moving: true },
];

function createPlatform(y, type = null) {
  const selectedType =
    type || platformTypes[Math.floor(Math.random() * platformTypes.length)];
  return {
    x: Math.random() * (canvas.width - platformWidth),
    y: y,
    width: platformWidth,
    height: platformHeight,
    ...selectedType,
    moveDirection: 1,
    moveSpeed: 2,
    broken: false,
  };
}

function initPlatforms() {
  platforms = [];

  // Starting platform
  platforms.push({
    x: canvas.width / 2 - platformWidth / 2,
    y: canvas.height - 50,
    width: platformWidth,
    height: platformHeight,
    color: "#4ade80",
    solid: true,
    break: false,
  });

  // Generate platforms
  for (let i = 1; i < 15; i++) {
    platforms.push(createPlatform(canvas.height - 50 - i * 80));
  }
}

function drawPlayer() {
  const screenY = player.y - cameraY;

  // Body
  ctx.fillStyle = "#ff6b6b";
  ctx.beginPath();
  ctx.arc(
    player.x + player.width / 2,
    screenY + player.height / 3,
    player.width / 2.5,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Head
  ctx.fillStyle = "#feca57";
  ctx.beginPath();
  ctx.arc(
    player.x + player.width / 2,
    screenY + 10,
    player.width / 3,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Eyes
  ctx.fillStyle = "#000";
  ctx.fillRect(player.x + player.width / 2 - 6, screenY + 8, 3, 3);
  ctx.fillRect(player.x + player.width / 2 + 3, screenY + 8, 3, 3);

  // Smile
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(player.x + player.width / 2, screenY + 12, 5, 0, Math.PI);
  ctx.stroke();
}

function drawPlatform(platform) {
  if (platform.broken) return;

  const screenY = platform.y - cameraY;

  // Platform
  ctx.fillStyle = platform.color;
  ctx.fillRect(platform.x, screenY, platform.width, platform.height);

  // Highlight
  ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
  ctx.fillRect(platform.x, screenY, platform.width, platform.height / 3);

  // Border
  ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
  ctx.lineWidth = 2;
  ctx.strokeRect(platform.x, screenY, platform.width, platform.height);
}

function drawClouds() {
  const cloudY = (Date.now() * 0.01) % canvas.height;

  for (let i = 0; i < 5; i++) {
    const x = (i * 150 + Date.now() * 0.02) % (canvas.width + 100);
    const y = (cloudY + i * 120) % canvas.height;

    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.arc(x + 20, y - 5, 25, 0, Math.PI * 2);
    ctx.arc(x + 40, y, 20, 0, Math.PI * 2);
    ctx.fill();
  }
}

function updatePlayer() {
  // Horizontal movement
  player.x += player.velocityX;

  // Wrap around screen
  if (player.x < -player.width) {
    player.x = canvas.width;
  }
  if (player.x > canvas.width) {
    player.x = -player.width;
  }

  // Vertical movement
  player.velocityY += player.gravity;
  player.y += player.velocityY;

  // Check if falling below screen
  if (player.y - cameraY > canvas.height) {
    gameOver();
  }
}

function updateCamera() {
  if (player.y < canvas.height / 2 + cameraY) {
    cameraY = player.y - canvas.height / 2;

    const newHeight = Math.floor(Math.abs(cameraY) / 10);
    if (newHeight > maxHeight) {
      maxHeight = newHeight;
      score = maxHeight;
      scoreElement.textContent = score + "m";

      if (score > bestScore) {
        bestScore = score;
        bestScoreElement.textContent = bestScore + "m";
        localStorage.setItem("skyJumperBest", bestScore);
      }
    }
  }
}

function updatePlatforms() {
  platforms.forEach((platform) => {
    // Moving platforms
    if (platform.moving) {
      platform.x += platform.moveSpeed * platform.moveDirection;

      if (platform.x <= 0 || platform.x + platform.width >= canvas.width) {
        platform.moveDirection *= -1;
      }
    }

    // Remove platforms that are too far below
    if (platform.y - cameraY > canvas.height + 100) {
      const index = platforms.indexOf(platform);
      platforms.splice(index, 1);

      // Add new platform at top
      const highestPlatform = platforms.reduce((highest, p) =>
        p.y < highest.y ? p : highest,
      );
      platforms.push(createPlatform(highestPlatform.y - 80));
    }
  });
}

function checkPlatformCollision() {
  if (player.velocityY <= 0) return;

  platforms.forEach((platform) => {
    if (platform.broken) return;

    if (
      player.x + player.width > platform.x &&
      player.x < platform.x + platform.width &&
      player.y + player.height > platform.y &&
      player.y + player.height < platform.y + platform.height + 15 &&
      player.velocityY > 0
    ) {
      if (platform.solid) {
        player.velocityY = player.jumpPower;
        player.isJumping = true;

        if (platform.break) {
          platform.broken = true;
        }
      }
    }
  });
}

function gameOver() {
  gameRunning = false;
  cancelAnimationFrame(animationId);

  finalScoreElement.textContent = score;
  finalBestElement.textContent = bestScore;
  gameOverScreen.classList.remove("hidden");
}

function draw() {
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#87CEEB");
  gradient.addColorStop(0.5, "#B0E0E6");
  gradient.addColorStop(1, "#FFE5B4");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawClouds();

  platforms.forEach(drawPlatform);
  drawPlayer();

  // Score display on canvas
  ctx.fillStyle = "#fff";
  ctx.font = "bold 20px Arial";
  ctx.textAlign = "left";
  ctx.fillText(`${score}m`, 10, 30);
}

function gameLoop() {
  if (!gameRunning) return;

  updatePlayer();
  updateCamera();
  updatePlatforms();
  checkPlatformCollision();
  draw();

  animationId = requestAnimationFrame(gameLoop);
}

function startGame() {
  player.x = canvas.width / 2;
  player.y = canvas.height - 100;
  player.velocityX = 0;
  player.velocityY = 0;
  player.isJumping = false;

  cameraY = 0;
  score = 0;
  maxHeight = 0;

  scoreElement.textContent = "0m";
  startScreen.classList.add("hidden");
  gameOverScreen.classList.add("hidden");

  initPlatforms();
  gameRunning = true;

  gameLoop();
}

// Keyboard controls
let keys = {};

document.addEventListener("keydown", (e) => {
  keys[e.key] = true;

  if (keys["ArrowLeft"] || keys["a"] || keys["A"]) {
    player.velocityX = -player.speed;
  }
  if (keys["ArrowRight"] || keys["d"] || keys["D"]) {
    player.velocityX = player.speed;
  }
});

document.addEventListener("keyup", (e) => {
  keys[e.key] = false;

  if (
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
restartBtn.addEventListener("click", startGame);

// Initial draw
draw();
