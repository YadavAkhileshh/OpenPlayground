const gameArea = document.getElementById("gameArea");
const player = document.getElementById("player");
const scoreDisplay = document.getElementById("score");

let playerX = 150;
let speed = 4;
let score = 0;
let enemies = [];
let gameRunning = false;

const keys = {};

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

function startGame() {
  if (gameRunning) return;

  score = 0;
  speed = 4;
  enemies = [];
  gameRunning = true;
  scoreDisplay.textContent = score;

  setInterval(createEnemy, 1500);
  requestAnimationFrame(gameLoop);
}

function createEnemy() {
  if (!gameRunning) return;

  const enemy = document.createElement("div");
  enemy.classList.add("enemy");
  enemy.style.top = "-100px";
  enemy.style.left = Math.floor(Math.random() * 6) * 55 + "px";
  gameArea.appendChild(enemy);
  enemies.push(enemy);
}

function detectCollision(rect1, rect2) {
  return !(
    rect1.top > rect2.bottom ||
    rect1.bottom < rect2.top ||
    rect1.right < rect2.left ||
    rect1.left > rect2.right
  );
}

function gameLoop() {
  if (!gameRunning) return;

  // Move Player
  if (keys["ArrowLeft"] && playerX > 0) playerX -= 5;
  if (keys["ArrowRight"] && playerX < 300) playerX += 5;
  player.style.left = playerX + "px";

  // Move Enemies
  enemies.forEach((enemy, index) => {
    let top = parseInt(enemy.style.top);
    top += speed;
    enemy.style.top = top + "px";

    // Collision
    if (detectCollision(player.getBoundingClientRect(), enemy.getBoundingClientRect())) {
      gameRunning = false;
      alert("Game Over! Score: " + score);
      window.location.reload();
    }

    // Remove off-screen enemies
    if (top > 600) {
      enemy.remove();
      enemies.splice(index, 1);
      score++;
      scoreDisplay.textContent = score;

      // Increase difficulty
      if (score % 5 === 0) speed++;
    }
  });

  requestAnimationFrame(gameLoop);
}