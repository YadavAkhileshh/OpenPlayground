const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const bestScoreElement = document.getElementById("bestScore");
const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const finalScoreElement = document.getElementById("finalScore");
const finalBestElement = document.getElementById("finalBest");

// Bird
const bird = {
  x: 80,
  y: canvas.height / 2,
  width: 34,
  height: 24,
  velocity: 0,
  gravity: 0.5,
  jump: -8,
};

// Pipes
const pipeWidth = 60;
const pipeGap = 150;
const pipeSpeed = 2;
let pipes = [];
let frameCount = 0;

let score = 0;
let bestScore = localStorage.getItem("flappyBestScore") || 0;
let gameRunning = false;
let gameStarted = false;

bestScoreElement.textContent = bestScore;

function initGame() {
  bird.y = canvas.height / 2;
  bird.velocity = 0;
  pipes = [];
  score = 0;
  frameCount = 0;
  scoreElement.textContent = score;
  gameStarted = false;
}

function drawBird() {
  ctx.save();

  // Rotate bird based on velocity
  ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
  const rotation = Math.min(Math.max(bird.velocity * 0.05, -0.5), 0.5);
  ctx.rotate(rotation);

  // Draw bird body
  ctx.fillStyle = "#ffd700";
  ctx.beginPath();
  ctx.arc(0, 0, bird.width / 2, 0, Math.PI * 2);
  ctx.fill();

  // Draw bird wing
  ctx.fillStyle = "#ffed4e";
  ctx.beginPath();
  ctx.ellipse(-5, 0, 8, 12, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Draw bird eye
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(8, -5, 3, 0, Math.PI * 2);
  ctx.fill();

  // Draw bird beak
  ctx.fillStyle = "#ff6347";
  ctx.beginPath();
  ctx.moveTo(12, 0);
  ctx.lineTo(20, -2);
  ctx.lineTo(20, 2);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawPipes() {
  ctx.fillStyle = "#4ade80";
  ctx.strokeStyle = "#22c55e";
  ctx.lineWidth = 3;

  pipes.forEach((pipe) => {
    // Top pipe
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
    ctx.strokeRect(pipe.x, 0, pipeWidth, pipe.top);

    // Bottom pipe
    ctx.fillRect(pipe.x, pipe.bottom, pipeWidth, canvas.height - pipe.bottom);
    ctx.strokeRect(pipe.x, pipe.bottom, pipeWidth, canvas.height - pipe.bottom);

    // Pipe caps
    ctx.fillRect(pipe.x - 5, pipe.top - 25, pipeWidth + 10, 25);
    ctx.strokeRect(pipe.x - 5, pipe.top - 25, pipeWidth + 10, 25);
    ctx.fillRect(pipe.x - 5, pipe.bottom, pipeWidth + 10, 25);
    ctx.strokeRect(pipe.x - 5, pipe.bottom, pipeWidth + 10, 25);
  });
}

function drawBackground() {
  // Sky gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#87ceeb");
  gradient.addColorStop(1, "#e0f6ff");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Clouds
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.beginPath();
  ctx.arc(100, 80, 30, 0, Math.PI * 2);
  ctx.arc(120, 70, 35, 0, Math.PI * 2);
  ctx.arc(140, 80, 30, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(280, 120, 25, 0, Math.PI * 2);
  ctx.arc(300, 115, 30, 0, Math.PI * 2);
  ctx.arc(320, 120, 25, 0, Math.PI * 2);
  ctx.fill();
}

function updateBird() {
  bird.velocity += bird.gravity;
  bird.y += bird.velocity;

  // Prevent bird from going off screen
  if (bird.y + bird.height > canvas.height) {
    bird.y = canvas.height - bird.height;
    gameOver();
  }

  if (bird.y < 0) {
    bird.y = 0;
    bird.velocity = 0;
  }
}

function updatePipes() {
  if (frameCount % 90 === 0) {
    const topHeight = Math.random() * (canvas.height - pipeGap - 100) + 50;
    pipes.push({
      x: canvas.width,
      top: topHeight,
      bottom: topHeight + pipeGap,
      scored: false,
    });
  }

  pipes.forEach((pipe) => {
    pipe.x -= pipeSpeed;

    // Score when bird passes pipe
    if (!pipe.scored && pipe.x + pipeWidth < bird.x) {
      pipe.scored = true;
      score++;
      scoreElement.textContent = score;

      if (score > bestScore) {
        bestScore = score;
        bestScoreElement.textContent = bestScore;
        localStorage.setItem("flappyBestScore", bestScore);
      }
    }
  });

  // Remove off-screen pipes
  pipes = pipes.filter((pipe) => pipe.x + pipeWidth > 0);
}

function checkCollision() {
  for (let pipe of pipes) {
    // Check if bird is within pipe x range
    if (bird.x + bird.width > pipe.x && bird.x < pipe.x + pipeWidth) {
      // Check if bird hits top or bottom pipe
      if (bird.y < pipe.top || bird.y + bird.height > pipe.bottom) {
        gameOver();
        return;
      }
    }
  }
}

function flap() {
  if (!gameRunning) return;
  bird.velocity = bird.jump;
}

function gameOver() {
  gameRunning = false;
  finalScoreElement.textContent = score;
  finalBestElement.textContent = bestScore;
  gameOverScreen.classList.remove("hidden");
}

function draw() {
  drawBackground();
  drawPipes();
  drawBird();
}

function update() {
  if (!gameRunning) return;

  updateBird();
  updatePipes();
  checkCollision();
  frameCount++;
}

function gameLoop() {
  update();
  draw();

  if (gameRunning) {
    requestAnimationFrame(gameLoop);
  }
}

function startGame() {
  initGame();
  startScreen.classList.add("hidden");
  gameOverScreen.classList.add("hidden");
  gameRunning = true;
  gameStarted = true;
  gameLoop();
}

// Event listeners
startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);

canvas.addEventListener("click", flap);

document.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.code === "ArrowUp") {
    e.preventDefault();
    if (!gameStarted) {
      startGame();
    } else {
      flap();
    }
  }
});

// Draw initial state
drawBackground();
drawBird();
