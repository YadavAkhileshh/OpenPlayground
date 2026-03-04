const game = new BreakoutGame(document.getElementById("gameCanvas"));
const scoreDisplay = document.getElementById("score");
const hiscoreDisplay = document.getElementById("hiscore");
const livesDisplay = document.getElementById("lives");
const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const finalScore = document.getElementById("finalScore");
const levelDisplay = document.getElementById("levelDisplay");
const powerupElements = {
  multiball: document.getElementById("multiball"),
  widepaddle: document.getElementById("widepaddle"),
  fastball: document.getElementById("fastball"),
};
game.powerupCallback = (type) => {
  if (powerupElements[type]) {
    powerupElements[type].classList.add("active");
    setTimeout(() => powerupElements[type].classList.remove("active"), 5000);
  }
  if (type === "widepaddle") {
    game.paddle.width = 150;
    setTimeout(() => (game.paddle.width = 100), 5000);
  }
};
game.gameOverCallback = () => {
  finalScore.textContent = game.score.toString().padStart(6, "0");
  gameOverScreen.classList.remove("hidden");
};
function gameLoop() {
  game.update();
  game.render();
  updateUI();
  requestAnimationFrame(gameLoop);
}
function updateUI() {
  scoreDisplay.textContent = game.score.toString().padStart(6, "0");
  hiscoreDisplay.textContent = game.hiscore.toString().padStart(6, "0");
  livesDisplay.innerHTML = "■".repeat(game.lives);
  levelDisplay.querySelector("h2").textContent = `LEVEL ${game.level}`;
}
document.addEventListener("keydown", (e) => {
  if (
    e.key === " " &&
    !game.gameRunning &&
    startScreen.classList.contains("hidden")
  ) {
    startScreen.classList.remove("hidden");
    gameOverScreen.classList.add("hidden");
    game.score = 0;
    game.lives = 3;
    game.level = 1;
    game.createBricks();
    game.resetBall();
  }
  if (e.key === " " && !startScreen.classList.contains("hidden")) {
    startScreen.classList.add("hidden");
  }
});
updateUI();
gameLoop();
