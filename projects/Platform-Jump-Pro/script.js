const player = document.getElementById("player");
const game = document.getElementById("game");
const scoreDisplay = document.getElementById("score");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const gameOverScreen = document.getElementById("gameOver");

let x, y, velocityY, gravity, jumpPower, speed, score, isJumping;
let gameRunning = false;
const keys = {};
let platforms = [];
let coins = [];

startBtn.onclick = startGame;
restartBtn.onclick = restartGame;

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

function initGame() {
  x = 100;
  y = 0;
  velocityY = 0;
  gravity = 0.6;
  jumpPower = -12;
  speed = 5;
  score = 0;
  isJumping = true;
  scoreDisplay.textContent = score;

  platforms.forEach(p => p.remove());
  coins.forEach(c => c.remove());
  platforms = [];
  coins = [];

  createPlatform(0, 380, 800);
  createPlatform(200, 300, 150);
  createPlatform(450, 250, 150);
  createPlatform(650, 200, 120);

  createCoin(240, 260);
  createCoin(500, 210);
  createCoin(680, 160);

  player.style.left = x + "px";
  player.style.top = y + "px";
}

function createPlatform(px, py, width) {
  const platform = document.createElement("div");
  platform.className = "platform";
  platform.style.left = px + "px";
  platform.style.top = py + "px";
  platform.style.width = width + "px";
  game.appendChild(platform);
  platforms.push(platform);
}

function createCoin(cx, cy) {
  const coin = document.createElement("div");
  coin.className = "coin";
  coin.style.left = cx + "px";
  coin.style.top = cy + "px";
  game.appendChild(coin);
  coins.push(coin);
}

function detectCollision(a, b) {
  return !(
    a.top > b.bottom ||
    a.bottom < b.top ||
    a.right < b.left ||
    a.left > b.right
  );
}

function startGame() {
  startBtn.style.display = "none";
  gameOverScreen.style.display = "none";
  initGame();
  gameRunning = true;
  requestAnimationFrame(gameLoop);
}

function restartGame() {
  gameOverScreen.style.display = "none";
  initGame();
  gameRunning = true;
  requestAnimationFrame(gameLoop);
}

function gameLoop() {
  if (!gameRunning) return;

  if (keys["ArrowLeft"]) x -= speed;
  if (keys["ArrowRight"]) x += speed;

  if (keys[" "] && !isJumping) {
    velocityY = jumpPower;
    isJumping = true;
  }

  velocityY += gravity;
  y += velocityY;

  player.style.left = x + "px";
  player.style.top = y + "px";

  const playerRect = player.getBoundingClientRect();

  platforms.forEach(platform => {
    const pRect = platform.getBoundingClientRect();

    if (
      playerRect.bottom >= pRect.top &&
      playerRect.bottom <= pRect.top + 20 &&
      playerRect.right > pRect.left &&
      playerRect.left < pRect.right &&
      velocityY >= 0
    ) {
      y = platform.offsetTop - 40;
      velocityY = 0;
      isJumping = false;
    }
  });

  coins.forEach((coin, index) => {
    if (detectCollision(player.getBoundingClientRect(), coin.getBoundingClientRect())) {
      coin.remove();
      coins.splice(index, 1);
      score++;
      scoreDisplay.textContent = score;
    }
  });

  if (y > 450) {
    gameRunning = false;
    gameOverScreen.style.display = "block";
  }

  requestAnimationFrame(gameLoop);
}