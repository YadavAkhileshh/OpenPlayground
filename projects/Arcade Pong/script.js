const game = new PongGame(document.getElementById("pongCanvas"));
const player1Score = document.getElementById("player1Score");
const player2Score = document.getElementById("player2Score");
const startMessage = document.getElementById("startMessage");
const winMessage = document.getElementById("winMessage");
const winnerText = document.getElementById("winnerText");
const resetBtn = document.getElementById("resetBtn");
const pauseBtn = document.getElementById("pauseBtn");
game.onScoreUpdate = () => {
  player1Score.textContent = game.player1.score;
  player2Score.textContent = game.player2.score;
};
game.onWin = (winner) => {
  winnerText.textContent = winner + " WINS!";
  winMessage.classList.remove("hidden");
};
resetBtn.addEventListener("click", () => {
  game.reset();
  winMessage.classList.add("hidden");
  startMessage.classList.remove("hidden");
  updateUI();
});
pauseBtn.addEventListener("click", () => {
  game.gameRunning = !game.gameRunning;
});
document.addEventListener("keydown", (e) => {
  if (e.key === " " && !startMessage.classList.contains("hidden")) {
    startMessage.classList.add("hidden");
  }
  if (e.key === " " && !winMessage.classList.contains("hidden")) {
    game.reset();
    winMessage.classList.add("hidden");
    startMessage.classList.remove("hidden");
  }
});
function gameLoop() {
  game.update();
  game.render();
  requestAnimationFrame(gameLoop);
}
function updateUI() {
  player1Score.textContent = game.player1.score;
  player2Score.textContent = game.player2.score;
}
updateUI();
gameLoop();
