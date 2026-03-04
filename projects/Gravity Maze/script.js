const game = new GravityMaze(document.getElementById("mazeCanvas"));
let animationFrame;
const gravityButtons = {
  up: document.getElementById("gravityUp"),
  down: document.getElementById("gravityDown"),
  left: document.getElementById("gravityLeft"),
  right: document.getElementById("gravityRight"),
};
const levelDisplay = document.getElementById("levelDisplay");
const movesDisplay = document.getElementById("movesDisplay");
const timeDisplay = document.getElementById("timeDisplay");
const resetBtn = document.getElementById("resetBtn");
const nextBtn = document.getElementById("nextBtn");
const victoryScreen = document.getElementById("victoryScreen");
const continueBtn = document.getElementById("continueBtn");
function init() {
  Object.keys(gravityButtons).forEach((dir) => {
    gravityButtons[dir].addEventListener("click", () => setGravity(dir));
  });
  resetBtn.addEventListener("click", () => game.loadLevel(game.currentLevel));
  nextBtn.addEventListener("click", nextLevel);
  continueBtn.addEventListener("click", () => {
    victoryScreen.classList.add("hidden");
    nextLevel();
  });
  document.addEventListener("keydown", (e) => {
    const keyMap = {
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right",
    };
    if (keyMap[e.key]) setGravity(keyMap[e.key]);
    if (e.key === "r") game.loadLevel(game.currentLevel);
  });
  gameLoop();
}
function setGravity(direction) {
  game.setGravity(direction);
  Object.values(gravityButtons).forEach((btn) =>
    btn.classList.remove("active"),
  );
  gravityButtons[direction].classList.add("active");
}
function gameLoop() {
  game.update();
  game.render();
  updateUI();
  if (game.isComplete) {
    showVictory();
  }
  animationFrame = requestAnimationFrame(gameLoop);
}
function updateUI() {
  levelDisplay.textContent = game.currentLevel;
  movesDisplay.textContent = game.moves;
  const mins = Math.floor(game.time / 60);
  const secs = game.time % 60;
  timeDisplay.textContent = `${mins}:${secs.toString().padStart(2, "0")}`;
}
function showVictory() {
  cancelAnimationFrame(animationFrame);
  document.getElementById("finalMoves").textContent = game.moves;
  document.getElementById("finalTime").textContent = timeDisplay.textContent;
  victoryScreen.classList.remove("hidden");
  if (game.currentLevel < game.levels.length) {
    nextBtn.classList.remove("hidden");
  }
}
function nextLevel() {
  if (game.currentLevel < game.levels.length) {
    game.loadLevel(game.currentLevel + 1);
    gameLoop();
  }
}
setInterval(() => {
  if (!game.isComplete) game.time++;
}, 1000);
window.addEventListener("load", init);
