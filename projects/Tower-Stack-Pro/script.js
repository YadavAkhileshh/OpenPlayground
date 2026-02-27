const game = document.getElementById("game");
const scoreDisplay = document.getElementById("score");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const gameOverScreen = document.getElementById("gameOver");

let stack = [];
let movingBlock;
let direction = 1;
let speed = 2;
let score = 0;
let gameRunning = false;

startBtn.onclick = startGame;
restartBtn.onclick = restartGame;
document.addEventListener("keydown", e => {
  if (e.code === "Space" && gameRunning) dropBlock();
});

function startGame() {
  startBtn.style.display = "none";
  gameOverScreen.style.display = "none";
  game.innerHTML = "";
  stack = [];
  score = 0;
  speed = 2;
  scoreDisplay.textContent = score;
  gameRunning = true;

  createBaseBlock();
  createMovingBlock();
  requestAnimationFrame(update);
}

function restartGame() {
  gameOverScreen.style.display = "none";
  startGame();
}

function createBaseBlock() {
  const base = document.createElement("div");
  base.className = "block";
  base.style.width = "200px";
  base.style.left = "100px";
  base.style.bottom = "0px";
  base.style.background = randomColor();
  game.appendChild(base);
  stack.push(base);
}

function createMovingBlock() {
  const lastBlock = stack[stack.length - 1];
  const block = document.createElement("div");
  block.className = "block";
  block.style.width = lastBlock.offsetWidth + "px";
  block.style.bottom = stack.length * 30 + "px";
  block.style.left = "0px";
  block.style.background = randomColor();
  game.appendChild(block);
  movingBlock = block;
  direction = 1;
}

function update() {
  if (!gameRunning) return;

  let left = parseFloat(movingBlock.style.left);
  left += speed * direction;

  if (left <= 0 || left + movingBlock.offsetWidth >= game.offsetWidth) {
    direction *= -1;
  }

  movingBlock.style.left = left + "px";

  requestAnimationFrame(update);
}

function dropBlock() {
  const lastBlock = stack[stack.length - 1];

  const movingLeft = movingBlock.offsetLeft;
  const movingRight = movingLeft + movingBlock.offsetWidth;
  const lastLeft = lastBlock.offsetLeft;
  const lastRight = lastLeft + lastBlock.offsetWidth;

  const overlap = Math.min(movingRight, lastRight) - Math.max(movingLeft, lastLeft);

  if (overlap <= 0) {
    gameRunning = false;
    gameOverScreen.style.display = "block";
    return;
  }

  movingBlock.style.width = overlap + "px";
  movingBlock.style.left = Math.max(movingLeft, lastLeft) + "px";

  stack.push(movingBlock);
  score++;
  scoreDisplay.textContent = score;

  if (score % 5 === 0) speed += 0.5;

  createMovingBlock();

  // Camera effect
  game.scrollTop = game.scrollHeight;
}

function randomColor() {
  return `hsl(${Math.random() * 360}, 70%, 60%)`;
}