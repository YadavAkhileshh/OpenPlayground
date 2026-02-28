const game = new TetrisGame(
  document.getElementById("tetrisCanvas"),
  document.getElementById("nextCanvas"),
);
const scoreDisplay = document.getElementById("score");
const linesDisplay = document.getElementById("lines");
const levelDisplay = document.getElementById("level");
const gameOverOverlay = document.getElementById("gameOverOverlay");
const finalScore = document.getElementById("finalScore");
game.onScoreUpdate = () => {
  scoreDisplay.textContent = game.score.toString().padStart(4, "0");
  linesDisplay.textContent = game.lines.toString().padStart(3, "0");
  levelDisplay.textContent = game.level;
};
game.onGameOver = () => {
  finalScore.textContent = game.score;
  gameOverOverlay.classList.remove("hidden");
};
function gameLoop() {
  game.update();
  game.render();
  requestAnimationFrame(gameLoop);
}
gameLoop();
