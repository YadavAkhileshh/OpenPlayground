// Main Game Controller
let game;
let animationId;

// DOM Elements
const canvas = document.getElementById("gameCanvas");
const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const scoreDisplay = document.getElementById("score");
const livesDisplay = document.getElementById("lives");
const waveDisplay = document.getElementById("wave");
const finalScoreDisplay = document.getElementById("finalScore");
const powerFill = document.getElementById("powerFill");
const restartBtn = document.getElementById("restartBtn");

// Initialize game
function init() {
  game = new GameEngine(canvas);
  updateUI();
}

// Game loop
function gameLoop() {
  game.update();
  game.draw();
  updateUI();
  animationId = requestAnimationFrame(gameLoop);
}

// Update UI elements
function updateUI() {
  scoreDisplay.textContent = String(game.score).padStart(4, "0");
  livesDisplay.textContent = "♥".repeat(game.lives);
  waveDisplay.textContent = String(game.wave).padStart(2, "0");

  // Update power bar
  const powerPercent =
    ((game.weaponCooldownMax - game.weaponCooldown) / game.weaponCooldownMax) *
    100;
  powerFill.style.width = powerPercent + "%";
}

// Start game
function startGame() {
  startScreen.classList.add("hidden");
  gameOverScreen.classList.add("hidden");
  game.reset();
  game.start();
  gameLoop();
}

// Show game over
function showGameOver() {
  cancelAnimationFrame(animationId);
  finalScoreDisplay.textContent = game.score;
  gameOverScreen.classList.remove("hidden");
}

// Event listeners
document.addEventListener("keydown", (e) => {
  if (
    e.key === " " &&
    !game.gameRunning &&
    startScreen.classList.contains("hidden") === false
  ) {
    e.preventDefault();
    startGame();
  }
});

restartBtn.addEventListener("click", () => {
  startGame();
});

// Watch for game over
setInterval(() => {
  if (
    game &&
    !game.gameRunning &&
    !gameOverScreen.classList.contains("hidden") === false &&
    !startScreen.classList.contains("hidden") === false
  ) {
    showGameOver();
  }
}, 100);

// Initialize on load
window.addEventListener("load", () => {
  init();
  // Draw initial frame
  game.draw();
});

// Handle window resize
window.addEventListener("resize", () => {
  const oldWidth = canvas.width;
  const oldHeight = canvas.height;

  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  // Adjust player position
  game.player.x = (game.player.x / oldWidth) * canvas.width;
  game.player.y = canvas.height - 80;

  // Recreate starfield
  game.createStarField();
});
