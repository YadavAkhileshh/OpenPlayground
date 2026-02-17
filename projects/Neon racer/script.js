const game = new NeonRacer(document.getElementById("raceCanvas"));
const speedDisplay = document.getElementById("speedDisplay");
const lapDisplay = document.getElementById("lapDisplay");
const timeDisplay = document.getElementById("timeDisplay");
const scoreDisplay = document.getElementById("scoreDisplay");
const boostFill = document.getElementById("boostFill");
const startScreen = document.getElementById("startScreen");
const finishScreen = document.getElementById("finishScreen");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const finalTime = document.getElementById("finalTime");
const finalScore = document.getElementById("finalScore");

startBtn.addEventListener("click", () => {
  startScreen.classList.add("hidden");
  game.start();
});
restartBtn.addEventListener("click", () => {
  finishScreen.classList.add("hidden");
  game.player = {
    x: 500,
    y: 500,
    width: 40,
    height: 60,
    speed: 0,
    maxSpeed: 15,
    angle: 0,
  };
  game.lap = 1;
  game.score = 0;
  game.time = 0;
  game.start();
});
game.onFinish = () => {
  finalTime.textContent = formatTime(game.time);
  finalScore.textContent = game.score;
  finishScreen.classList.remove("hidden");
};
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return mins + ":" + (secs < 10 ? "0" : "") + secs;
}
function gameLoop() {
  game.update();
  game.render();
  speedDisplay.textContent = Math.round(game.player.speed * 10);
  lapDisplay.textContent = game.lap + "/" + game.maxLaps;
  timeDisplay.textContent = formatTime(game.time);
  scoreDisplay.textContent = game.score;
  boostFill.style.width = game.boost + "%";
  requestAnimationFrame(gameLoop);
}
gameLoop();
