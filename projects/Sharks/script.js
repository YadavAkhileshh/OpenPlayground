const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let config;
let player;
let foods = [];
let sharks = [];
let gameOver = false;

// Load config.json
fetch("config.json")
  .then(res => res.json())
  .then(data => {
    config = data;
    initGame();
  });

function initGame() {
  player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: config.player.initialSize,
    speed: config.player.speed
  };

  // Create food
  for (let i = 0; i < config.food.count; i++) {
    foods.push(createFood());
  }

  // Create sharks
  for (let i = 0; i < config.sharks.count; i++) {
    sharks.push(createShark());
  }

  requestAnimationFrame(gameLoop);
}

// Create food
function createFood() {
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: config.food.size
  };
}

// Create shark
function createShark() {
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: random(config.sharks.minSize, config.sharks.maxSize),
    dx: random(-config.sharks.speed, config.sharks.speed),
    dy: random(-config.sharks.speed, config.sharks.speed)
  };
}

// Utility
function random(min, max) {
  return Math.random() * (max - min) + min;
}

// Controls
document.addEventListener("mousemove", e => {
  const rect = canvas.getBoundingClientRect();
  player.x = e.clientX - rect.left;
  player.y = e.clientY - rect.top;
});

// Main loop
function gameLoop() {
  if (gameOver) {
    drawGameOver();
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawPlayer();
  drawFoods();
  drawSharks();
  checkCollisions();

  requestAnimationFrame(gameLoop);
}

// Draw player
function drawPlayer() {
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
  ctx.fillStyle = "#feca57";
  ctx.fill();
}

// Draw food
function drawFoods() {
  foods.forEach(food => {
    ctx.beginPath();
    ctx.arc(food.x, food.y, food.size, 0, Math.PI * 2);
    ctx.fillStyle = "#1dd1a1";
    ctx.fill();
  });
}

// Draw sharks
function drawSharks() {
  sharks.forEach(shark => {
    shark.x += shark.dx;
    shark.y += shark.dy;

    if (shark.x < 0 || shark.x > canvas.width) shark.dx *= -1;
    if (shark.y < 0 || shark.y > canvas.height) shark.dy *= -1;

    ctx.beginPath();
    ctx.arc(shark.x, shark.y, shark.size, 0, Math.PI * 2);
    ctx.fillStyle = "#222f3e";
    ctx.fill();
  });
}

// Collision detection
function checkCollisions() {
  // Food collision
  foods = foods.filter(food => {
    const dist = distance(player, food);
    if (dist < player.size + food.size) {
      player.size += config.player.growthRate;
      return false;
    }
    return true;
  });

  if (foods.length < config.food.count) {
    foods.push(createFood());
  }

  // Shark collision
  sharks = sharks.filter(shark => {
    const dist = distance(player, shark);
    if (dist < player.size + shark.size) {
      if (player.size > shark.size) {
        player.size += shark.size * 0.1;
        return false; // eat shark
      } else {
        gameOver = true;
        return true;
      }
    }
    return true;
  });
}

// Distance helper
function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// Game Over
function drawGameOver() {
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#fff";
  ctx.font = "40px Arial";
  ctx.fillText("Game Over!", canvas.width / 2 - 110, canvas.height / 2);
}
