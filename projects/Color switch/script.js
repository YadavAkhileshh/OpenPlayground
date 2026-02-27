const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const bestScoreElement = document.getElementById("bestScore");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const gameOverScreen = document.getElementById("gameOverScreen");
const finalScoreElement = document.getElementById("finalScore");
const finalBestElement = document.getElementById("finalBest");

const colors = ["#ff0080", "#ff8c00", "#40e0d0", "#9b59b6"];

// Ball
const ball = {
  x: canvas.width / 2,
  y: canvas.height - 150,
  radius: 12,
  color: colors[0],
  velocity: 0,
  gravity: 0.6,
  jumpStrength: -12,
};

// Obstacles
let obstacles = [];
let colorSwitchers = [];
let cameraY = 0;
let score = 0;
let bestScore = localStorage.getItem("colorSwitchBest") || 0;
let gameRunning = false;
let animationId;

bestScoreElement.textContent = bestScore;

function createCircleObstacle(y) {
  return {
    type: "circle",
    x: canvas.width / 2,
    y: y,
    radius: 80,
    thickness: 15,
    rotation: 0,
    rotationSpeed: 0.02,
    segments: [
      { color: colors[0], start: 0, end: Math.PI / 2 },
      { color: colors[1], start: Math.PI / 2, end: Math.PI },
      { color: colors[2], start: Math.PI, end: (3 * Math.PI) / 2 },
      { color: colors[3], start: (3 * Math.PI) / 2, end: 2 * Math.PI },
    ],
  };
}

function createSquareObstacle(y) {
  return {
    type: "square",
    x: canvas.width / 2,
    y: y,
    size: 120,
    thickness: 15,
    rotation: 0,
    rotationSpeed: -0.015,
    segments: [
      { color: colors[0], index: 0 },
      { color: colors[1], index: 1 },
      { color: colors[2], index: 2 },
      { color: colors[3], index: 3 },
    ],
  };
}

function createColorSwitcher(y) {
  return {
    x: canvas.width / 2,
    y: y,
    radius: 10,
    collected: false,
  };
}

function initObstacles() {
  obstacles = [];
  colorSwitchers = [];
  let y = canvas.height - 400;

  for (let i = 0; i < 8; i++) {
    if (i % 2 === 0) {
      obstacles.push(createCircleObstacle(y));
    } else {
      obstacles.push(createSquareObstacle(y));
    }

    colorSwitchers.push(createColorSwitcher(y - 100));
    y -= 250;
  }
}

function drawBall() {
  const screenY = ball.y - cameraY;

  ctx.fillStyle = ball.color;
  ctx.beginPath();
  ctx.arc(ball.x, screenY, ball.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawCircleObstacle(obstacle) {
  const screenY = obstacle.y - cameraY;

  obstacle.segments.forEach((segment) => {
    ctx.strokeStyle = segment.color;
    ctx.lineWidth = obstacle.thickness;
    ctx.beginPath();
    ctx.arc(
      obstacle.x,
      screenY,
      obstacle.radius,
      segment.start + obstacle.rotation,
      segment.end + obstacle.rotation,
    );
    ctx.stroke();
  });
}

function drawSquareObstacle(obstacle) {
  const screenY = obstacle.y - cameraY;
  const halfSize = obstacle.size / 2;

  ctx.save();
  ctx.translate(obstacle.x, screenY);
  ctx.rotate(obstacle.rotation);

  const corners = [
    [-halfSize, -halfSize, halfSize, -halfSize],
    [halfSize, -halfSize, halfSize, halfSize],
    [halfSize, halfSize, -halfSize, halfSize],
    [-halfSize, halfSize, -halfSize, -halfSize],
  ];

  corners.forEach((corner, index) => {
    ctx.strokeStyle = obstacle.segments[index].color;
    ctx.lineWidth = obstacle.thickness;
    ctx.beginPath();
    ctx.moveTo(corner[0], corner[1]);
    ctx.lineTo(corner[2], corner[3]);
    ctx.stroke();
  });

  ctx.restore();
}

function drawColorSwitcher(switcher) {
  if (switcher.collected) return;

  const screenY = switcher.y - cameraY;
  const time = Date.now() * 0.003;

  colors.forEach((color, index) => {
    const angle = (Math.PI * 2 * index) / colors.length + time;
    const x = switcher.x + Math.cos(angle) * 15;
    const y = screenY + Math.sin(angle) * 15;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  });
}

function updateBall() {
  ball.velocity += ball.gravity;
  ball.y += ball.velocity;

  // Keep ball on screen
  if (ball.y > canvas.height - ball.radius) {
    ball.y = canvas.height - ball.radius;
    ball.velocity = 0;
  }
}

function updateCamera() {
  const targetY = ball.y - canvas.height / 2;
  if (targetY > cameraY) {
    cameraY = targetY;
  }
}

function updateObstacles() {
  obstacles.forEach((obstacle) => {
    obstacle.rotation += obstacle.rotationSpeed;

    // Add new obstacles as we go up
    if (obstacle.y - cameraY > canvas.height + 200) {
      const lowestObstacle = obstacles.reduce((min, obs) =>
        obs.y < min.y ? obs : min,
      );

      obstacle.y = lowestObstacle.y - 250;
      obstacle.rotation = 0;

      if (Math.random() > 0.5) {
        obstacle.type = "circle";
        obstacle.segments = createCircleObstacle(0).segments;
      } else {
        obstacle.type = "square";
        obstacle.segments = createSquareObstacle(0).segments;
      }
    }
  });

  colorSwitchers.forEach((switcher) => {
    if (switcher.y - cameraY > canvas.height + 100) {
      const lowestSwitcher = colorSwitchers.reduce((min, sw) =>
        sw.y < min.y ? sw : min,
      );

      switcher.y = lowestSwitcher.y - 250;
      switcher.collected = false;
    }
  });
}

function checkCollisions() {
  obstacles.forEach((obstacle) => {
    const screenY = obstacle.y - cameraY;

    if (Math.abs(ball.y - obstacle.y) < 50) {
      if (obstacle.type === "circle") {
        const dx = ball.x - obstacle.x;
        const dy = ball.y - obstacle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (
          distance > obstacle.radius - obstacle.thickness - ball.radius &&
          distance < obstacle.radius + ball.radius
        ) {
          const angle = Math.atan2(dy, dx) - obstacle.rotation;
          const normalizedAngle = (angle + Math.PI * 2) % (Math.PI * 2);

          let hitColor = null;
          obstacle.segments.forEach((segment) => {
            if (
              normalizedAngle >= segment.start &&
              normalizedAngle < segment.end
            ) {
              hitColor = segment.color;
            }
          });

          if (hitColor !== ball.color) {
            gameOver();
          }
        }
      } else if (obstacle.type === "square") {
        // Simplified square collision
        const dx = ball.x - obstacle.x;
        const dy = ball.y - obstacle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (
          distance > obstacle.size / 2 - obstacle.thickness - ball.radius &&
          distance < obstacle.size / 2 + ball.radius + obstacle.thickness
        ) {
          gameOver();
        }
      }
    }
  });

  // Check color switcher collection
  colorSwitchers.forEach((switcher) => {
    if (!switcher.collected) {
      const dx = ball.x - switcher.x;
      const dy = ball.y - switcher.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < ball.radius + switcher.radius) {
        switcher.collected = true;
        ball.color = colors[Math.floor(Math.random() * colors.length)];
        score++;
        scoreElement.textContent = score;

        if (score > bestScore) {
          bestScore = score;
          bestScoreElement.textContent = bestScore;
          localStorage.setItem("colorSwitchBest", bestScore);
        }
      }
    }
  });
}

function jump() {
  if (!gameRunning) return;
  ball.velocity = ball.jumpStrength;
}

function gameOver() {
  gameRunning = false;
  cancelAnimationFrame(animationId);

  finalScoreElement.textContent = score;
  finalBestElement.textContent = bestScore;
  gameOverScreen.classList.remove("hidden");
}

function draw() {
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  obstacles.forEach((obstacle) => {
    if (obstacle.type === "circle") {
      drawCircleObstacle(obstacle);
    } else {
      drawSquareObstacle(obstacle);
    }
  });

  colorSwitchers.forEach(drawColorSwitcher);
  drawBall();
}

function gameLoop() {
  if (!gameRunning) return;

  updateBall();
  updateCamera();
  updateObstacles();
  checkCollisions();
  draw();

  animationId = requestAnimationFrame(gameLoop);
}

function startGame() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height - 150;
  ball.velocity = 0;
  ball.color = colors[0];
  cameraY = 0;
  score = 0;

  scoreElement.textContent = score;
  gameOverScreen.classList.add("hidden");

  initObstacles();
  gameRunning = true;
  startBtn.textContent = "Restart";

  gameLoop();
}

// Event listeners
startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);
canvas.addEventListener("click", jump);

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    jump();
  }
});

// Initial draw
draw();
