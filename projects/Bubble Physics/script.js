const game = new BubblePhysics(document.getElementById("bubbleCanvas"));

const bubbleCount = document.getElementById("bubbleCount");
const poppedDisplay = document.getElementById("popped");
const chainDisplay = document.getElementById("chain");
const scoreDisplay = document.getElementById("score");

const sizeSlider = document.getElementById("sizeSlider");
const gravitySlider = document.getElementById("gravitySlider");
const bounceSlider = document.getElementById("bounceSlider");
const floatSlider = document.getElementById("floatSlider");

const colorBtns = document.querySelectorAll(".color-btn");
const modeBtns = document.querySelectorAll(".mode-btn");

const clearBtn = document.getElementById("clearBtn");
const gravityBtn = document.getElementById("gravityBtn");

let gravityOn = true;

sizeSlider.addEventListener(
  "input",
  (e) => (game.bubbleSize = parseInt(e.target.value)),
);
gravitySlider.addEventListener(
  "input",
  (e) => (game.gravity = parseFloat(e.target.value)),
);
bounceSlider.addEventListener(
  "input",
  (e) => (game.bounce = parseFloat(e.target.value)),
);
floatSlider.addEventListener(
  "input",
  (e) => (game.floatForce = parseFloat(e.target.value)),
);

colorBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    game.bubbleColor = btn.dataset.color;
  });
});

modeBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    modeBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    game.mode = btn.dataset.mode;
  });
});

clearBtn.addEventListener("click", () => game.clear());

gravityBtn.addEventListener("click", () => {
  gravityOn = !gravityOn;
  game.gravity = gravityOn ? 0.5 : 0;
  gravityBtn.textContent = gravityOn ? "🌍 Gravity ON" : "🚀 Zero Gravity";
});

game.onPop = () => {
  setTimeout(() => (game.chain = 0), 1000);
};

function gameLoop() {
  game.update();
  game.render();
  bubbleCount.textContent = game.bubbles.length;
  poppedDisplay.textContent = game.popped;
  chainDisplay.textContent = game.chain;
  scoreDisplay.textContent = game.score;
  requestAnimationFrame(gameLoop);
}

window.addEventListener("resize", () => {
  game.canvas.width = game.canvas.offsetWidth;
  game.canvas.height = game.canvas.offsetHeight;
});

gameLoop();
