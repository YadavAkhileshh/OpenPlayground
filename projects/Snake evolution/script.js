const game = new SnakeGame(document.getElementById("snakeCanvas"));
const bootSequence = document.getElementById("bootSequence");
const gameInterface = document.getElementById("gameInterface");
const startPrompt = document.getElementById("startPrompt");
const gameOverPrompt = document.getElementById("gameOverPrompt");
const scoreDisplay = document.getElementById("score");
const lengthDisplay = document.getElementById("length");
const speedDisplay = document.getElementById("speed");
const hiscoreDisplay = document.getElementById("hiscore");
const finalScore = document.getElementById("finalScore");
setTimeout(() => {
  bootSequence.classList.add("hidden");
  gameInterface.classList.remove("hidden");
}, 2500);
game.onScoreUpdate = () => {
  updateUI();
};
game.onGameOver = () => {
  finalScore.textContent = game.score;
  startPrompt.classList.add("hidden");
  gameOverPrompt.classList.remove("hidden");
};
function gameLoop(timestamp) {
  game.update(timestamp);
  game.render();
  updateUI();
  requestAnimationFrame(gameLoop);
}
function updateUI() {
  scoreDisplay.textContent = game.score.toString().padStart(4, "0");
  lengthDisplay.textContent = game.snake.length.toString().padStart(3, "0");
  speedDisplay.textContent = `LVL ${game.speed}`;
  hiscoreDisplay.textContent = game.hiscore.toString().padStart(4, "0");
}
document.addEventListener("keydown", (e) => {
  if (e.key === " " && game.gameOver) {
    gameOverPrompt.classList.add("hidden");
    startPrompt.classList.remove("hidden");
  }
});
updateUI();
requestAnimationFrame(gameLoop);
