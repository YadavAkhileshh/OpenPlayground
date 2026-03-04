const game = new ShadowPuppet(document.getElementById("puppetCanvas"));
const actNum = document.getElementById("actNum");
const audience = document.getElementById("audience");
const scoreDisplay = document.getElementById("score");
const storyText = document.getElementById("storyText");
const performBtn = document.getElementById("performBtn");
const clearBtn = document.getElementById("clearBtn");
const lightSlider = document.getElementById("lightSlider");
const puppetBtns = document.querySelectorAll(".puppet-btn");

let selectedShape = null;
let draggedPuppet = null;

puppetBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    selectedShape = btn.dataset.shape;
    puppetBtns.forEach((b) => {
      b.style.background = "linear-gradient(135deg,#3a3a3a,#2a2a2a)";
    });
    btn.style.background = "linear-gradient(135deg,#5a5a5a,#4a4a4a)";
  });
});

game.canvas.addEventListener("click", (e) => {
  if (!selectedShape) return;
  const rect = game.canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  game.addPuppet(selectedShape, x, y);
  updateStory();
});

game.canvas.addEventListener("mousedown", (e) => {
  const rect = game.canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  game.puppets.forEach((p, i) => {
    if (Math.abs(p.x - x) < 30 && Math.abs(p.y - y) < 30) {
      draggedPuppet = i;
    }
  });
});

game.canvas.addEventListener("mousemove", (e) => {
  if (draggedPuppet !== null) {
    const rect = game.canvas.getBoundingClientRect();
    game.puppets[draggedPuppet].x = e.clientX - rect.left;
    game.puppets[draggedPuppet].y = e.clientY - rect.top;
  }
});

game.canvas.addEventListener("mouseup", () => {
  draggedPuppet = null;
});

lightSlider.addEventListener("input", (e) => {
  game.updateLight(parseInt(e.target.value));
});

performBtn.addEventListener("click", () => {
  if (game.puppets.length > 0) {
    game.score += game.puppets.length * 10;
    game.act++;
    game.audienceMood = Math.min(5, game.audienceMood + 1);
    alert("Great performance! The audience loved it!");
  }
});

clearBtn.addEventListener("click", () => {
  game.clear();
  storyText.textContent = "Create a shadow story...";
});

function updateStory() {
  const shapes = game.puppets.map((p) => p.shape);
  const story = ["Once upon a time"];
  if (shapes.includes("person")) story.push("a person appeared");
  if (shapes.includes("bird")) story.push("with a bird flying");
  if (shapes.includes("dog")) story.push("and a loyal dog");
  if (shapes.includes("tree")) story.push("near a tall tree");
  if (shapes.includes("house")) story.push("beside a house");
  if (shapes.includes("sun")) story.push("under the sun");
  storyText.textContent = story.join(" ") + "...";
}

function gameLoop() {
  game.render();
  actNum.textContent = game.act;
  scoreDisplay.textContent = game.score;
  audience.textContent = "😊".repeat(game.audienceMood);
  requestAnimationFrame(gameLoop);
}

gameLoop();
