const game = new RhythmBoxer();

const comboDisplay = document.getElementById("combo");
const scoreDisplay = document.getElementById("score");
const healthFill = document.getElementById("healthFill");
const roundDisplay = document.getElementById("round");
const boxer = document.getElementById("boxer");
const startBtn = document.getElementById("startBtn");
const lanesContainer = document.getElementById("lanes");

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
lanesContainer.appendChild(canvas);

canvas.width = lanesContainer.offsetWidth;
canvas.height = lanesContainer.offsetHeight;
canvas.style.position = "absolute";
canvas.style.top = "0";
canvas.style.left = "0";

game.onHit = (type) => {
  boxer.style.animation = "punch-flash 0.3s";
  setTimeout(() => (boxer.style.animation = "boxer-idle 1s infinite"), 300);
  if (type === "perfect") {
    boxer.textContent = "💥";
  } else {
    boxer.textContent = "👊";
  }
  setTimeout(() => (boxer.textContent = "🥊"), 200);
};

game.onMiss = () => {
  boxer.textContent = "😵";
  setTimeout(() => (boxer.textContent = "🥊"), 300);
};

game.onGameOver = () => {
  alert("Knockout! Final Score: " + game.score);
  game.gameRunning = false;
};

startBtn.addEventListener("click", () => {
  game.start();
  startBtn.textContent = "FIGHTING!";
  startBtn.disabled = true;
});

function gameLoop() {
  game.update();
  game.render(ctx, canvas.width, canvas.height);
  comboDisplay.textContent = game.combo;
  scoreDisplay.textContent = game.score;
  healthFill.style.width = game.health + "%";
  roundDisplay.textContent = game.round;
  requestAnimationFrame(gameLoop);
}

gameLoop();
