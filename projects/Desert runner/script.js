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
  x: 100,
  y: 0,
  width: 40,
  height: 50,
  velocityY: 0,
  jumping: false,
  ducking: false,
  gravity: 1.2,
  jumpPower: -18,
};

const groundY = canvas.height - 100;
player.y = groundY - player.height;

// Game state
let obstacles = [];
let score = 0;
let bestScore = localStorage.getItem("desertRunnerBest") || 0;
let gameSpeed = 6;
let gameRunning = false;
let animationId;
let frameCount = 0;

bestScoreElement.textContent = bestScore + "m";

function createObstacle() {
  const types = ["cactus", "rock", "bird"];
  const type = types[Math.floor(Math.random() * types.length)];

  if (type === "bird") {
    return {
      x: canvas.width,
      y: groundY - 120,
      width: 40,
      height: 30,
      type: "bird",
    };
  } else if (type === "rock") {
    return {
      x: canvas.width,
      y: groundY - 40,
      width: 50,
      height: 40,
      type: "rock",
    };
  } else {
    const height = 40 + Math.random() * 20;
    return {
      x: canvas.width,
      y: groundY - height,
      width: 30,
      height: height,
      type: "cactus",
    };
  }
}

function drawPlayer() {
  const drawY = player.ducking ? player.y + 20 : player.y;
  const drawHeight = player.ducking ? player.height - 20 : player.height;

  // Body
  ctx.fillStyle = "#ff6b6b";
  ctx.fillRect(player.x, drawY, player.width, drawHeight);

  // Head
  if (!player.ducking) {
    ctx.fillStyle = "#feca57";
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, drawY + 10, 12, 0, Math.PI * 2);
    ctx.fill();

    // Eye
    ctx.fillStyle = "#000";
    ctx.fillRect(player.x + player.width / 2 + 3, drawY + 8, 4, 4);
  }

  // Legs (animated)
  ctx.fillStyle = "#333";
  const legAnimation = Math.floor(frameCount / 5) % 2;
  if (legAnimation === 0) {
    ctx.fillRect(player.x + 8, drawY + drawHeight, 8, 10);
    ctx.fillRect(player.x + 24, drawY + drawHeight, 8, 10);
  } else {
    ctx.fillRect(player.x + 12, drawY + drawHeight, 8, 10);
    ctx.fillRect(player.x + 20, drawY + drawHeight, 8, 10);
  }
}

function drawObstacle(obstacle) {
  if (obstacle.type === "cactus") {
    // Cactus
    ctx.fillStyle = "#2d8659";
    ctx.fillRect(obstacle.x + 10, obstacle.y, 10, obstacle.height);

    // Arms
    ctx.fillRect(obstacle.x, obstacle.y + obstacle.height * 0.3, 10, 3);
    ctx.fillRect(obstacle.x, obstacle.y + obstacle.height * 0.3, 3, 15);
    ctx.fillRect(obstacle.x + 20, obstacle.y + obstacle.height * 0.5, 10, 3);
    ctx.fillRect(obstacle.x + 27, obstacle.y + obstacle.height * 0.5, 3, 12);
  } else if (obstacle.type === "rock") {
    // Rock
    ctx.fillStyle = "#8b7355";
    ctx.beginPath();
    ctx.ellipse(
      obstacle.x + obstacle.width / 2,
      obstacle.y + obstacle.height / 2,
      obstacle.width / 2,
      obstacle.height / 2,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Rock details
    ctx.fillStyle = "#6b5545";
    ctx.beginPath();
    ctx.ellipse(
      obstacle.x + obstacle.width * 0.3,
      obstacle.y + obstacle.height * 0.4,
      8,
      6,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  } else if (obstacle.type === "bird") {
    // Bird body
    ctx.fillStyle = "#8b4513";
    ctx.beginPath();
    ctx.ellipse(
      obstacle.x + obstacle.width / 2,
      obstacle.y + obstacle.height / 2,
      obstacle.width / 2,
      obstacle.height / 2,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Wings (animated)
    const wingAnimation = Math.floor(frameCount / 3) % 2;
    const wingY = wingAnimation === 0 ? -8 : -4;
    ctx.fillStyle = "#654321";
    ctx.beginPath();
    ctx.ellipse(
      obstacle.x + 10,
      obstacle.y + obstacle.height / 2 + wingY,
      15,
      5,
      -0.3,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(
      obstacle.x + 30,
      obstacle.y + obstacle.height / 2 + wingY,
      15,
      5,
      0.3,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
}

function drawGround() {
  // Sand
  ctx.fillStyle = "#daa520";
  ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

  // Ground line
  ctx.strokeStyle = "#b8860b";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(canvas.width, groundY);
  ctx.stroke();

  // Ground details (animated)
  ctx.fillStyle = "#b8860b";
  for (let i = 0; i < 10; i++) {
    const x = i * 100 - (((frameCount * gameSpeed) / 2) % 100);
    ctx.fillRect(x, groundY + 10, 30, 3);
    ctx.fillRect(x + 50, groundY + 20, 20, 2);
  }
}

function drawClouds() {
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  for (let i = 0; i < 3; i++) {
    const x = i * 300 - ((frameCount * 0.5) % 300);
    const y = 50 + i * 40;

    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.arc(x + 25, y - 5, 25, 0, Math.PI * 2);
    ctx.arc(x + 50, y, 20, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSun() {
  ctx.fillStyle = "#ffeb3b";
  ctx.shadowBlur = 30;
  ctx.shadowColor = "#ffeb3b";
  ctx.beginPath();
  ctx.arc(canvas.width - 100, 80, 40, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function updatePlayer() {
  if (player.jumping) {
    player.velocityY += player.gravity;
    player.y += player.velocityY;

    if (player.y >= groundY - player.height) {
      player.y = groundY - player.height;
      player.jumping = false;
      player.velocityY = 0;
    }
  }
}

function updateObstacles() {
  // Move obstacles
  obstacles.forEach((obstacle, index) => {
    obstacle.x -= gameSpeed;

    if (obstacle.x + obstacle.width < 0) {
      obstacles.splice(index, 1);
      score++;
      scoreElement.textContent = score + "m";

      if (score > bestScore) {
        bestScore = score;
        bestScoreElement.textContent = bestScore + "m";
        localStorage.setItem("desertRunnerBest", bestScore);
      }

      // Increase difficulty
      if (score % 10 === 0) {
        gameSpeed += 0.5;
      }
    }
  });

  // Spawn new obstacles
  if (frameCount % 90 === 0) {
    obstacles.push(createObstacle());
  }
}

function checkCollision() {
  const playerDrawY = player.ducking ? player.y + 20 : player.y;
  const playerDrawHeight = player.ducking ? player.height - 20 : player.height;

  for (let obstacle of obstacles) {
    if (
      player.x < obstacle.x + obstacle.width &&
      player.x + player.width > obstacle.x &&
      playerDrawY < obstacle.y + obstacle.height &&
      playerDrawY + playerDrawHeight > obstacle.y
    ) {
      gameOver();
      return;
    }
  }
}

function jump() {
  if (!player.jumping && !player.ducking && gameRunning) {
    player.jumping = true;
    player.velocityY = player.jumpPower;
  }
}

function duck(isDucking) {
  if (!player.jumping && gameRunning) {
    player.ducking = isDucking;
  }
}

function gameOver() {
  gameRunning = false;
  cancelAnimationFrame(animationId);

  finalScoreElement.textContent = score;
  finalBestElement.textContent = bestScore;
  gameOverScreen.classList.remove("hidden");
}

function draw() {
  // Sky gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, groundY);
  gradient.addColorStop(0, "#87ceeb");
  gradient.addColorStop(1, "#e0c097");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, groundY);

  drawSun();
  drawClouds();
  drawGround();
  obstacles.forEach(drawObstacle);
  drawPlayer();

  // Score on canvas
  ctx.fillStyle = "#333";
  ctx.font = "bold 24px Arial";
  ctx.textAlign = "right";
  ctx.fillText(`${score}m`, canvas.width - 20, 40);
}

function gameLoop() {
  if (!gameRunning) return;

  frameCount++;
  updatePlayer();
  updateObstacles();
  checkCollision();
  draw();

  animationId = requestAnimationFrame(gameLoop);
}

function startGame() {
  player.y = groundY - player.height;
  player.velocityY = 0;
  player.jumping = false;
  player.ducking = false;

  obstacles = [];
  score = 0;
  gameSpeed = 6;
  frameCount = 0;

  scoreElement.textContent = "0m";
  startScreen.classList.add("hidden");
  gameOverScreen.classList.add("hidden");

  gameRunning = true;
  gameLoop();
}

// Event listeners
startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);
canvas.addEventListener("click", jump);

document.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.code === "ArrowUp") {
    e.preventDefault();
    jump();
  }
  if (e.code === "ArrowDown") {
    e.preventDefault();
    duck(true);
  }
});

document.addEventListener("keyup", (e) => {
  if (e.code === "ArrowDown") {
    duck(false);
  }
});

// Initial draw
draw();
