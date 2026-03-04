const game = new Ecosystem(document.getElementById("ecoCanvas"));
const floraBar = document.getElementById("floraBar");
const faunaBar = document.getElementById("faunaBar");
const waterBar = document.getElementById("waterBar");
const balanceDisplay = document.getElementById("balance");
const speciesDisplay = document.getElementById("species");
const foodChain = document.getElementById("foodChain");
const organismBtns = document.querySelectorAll(".organism-btn");
const clearBtn = document.getElementById("clearBtn");
const rainBtn = document.getElementById("rainBtn");
const sunBtn = document.getElementById("sunBtn");
let selectedType = null;
organismBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    selectedType = btn.dataset.type;
    organismBtns.forEach(
      (b) => (b.style.background = "linear-gradient(135deg,#E8F5E9,#C8E6C9)"),
    );
    btn.style.background = "linear-gradient(135deg,#A5D6A7,#81C784)";
  });
});
game.canvas.addEventListener("click", (e) => {
  if (!selectedType) return;
  const rect = game.canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  game.addOrganism(selectedType, x, y);
});
clearBtn.addEventListener("click", () => game.clear());
rainBtn.addEventListener("click", () => {
  game.rain();
  for (let i = 0; i < 20; i++) {
    const rain = document.createElement("div");
    rain.className = "rain-particle";
    rain.style.left = Math.random() * 100 + "%";
    rain.style.top = "0";
    document.querySelector(".ecosystem-canvas").appendChild(rain);
    setTimeout(() => rain.remove(), 1000);
  }
});
sunBtn.addEventListener("click", () => game.sunshine());
game.onBalanceUpdate = () => {
  floraBar.style.width = game.flora + "%";
  faunaBar.style.width = game.fauna + "%";
  waterBar.style.width = game.water + "%";
  balanceDisplay.textContent = game.balance + "%";
  speciesDisplay.textContent = game.organisms.length;
  const chains = [];
  if (game.organisms.some((o) => ["plant", "grass"].includes(o.type)))
    chains.push("Plants 🌱");
  if (game.organisms.some((o) => ["rabbit", "deer"].includes(o.type)))
    chains.push("→ Herbivores 🐰");
  if (game.organisms.some((o) => ["fox", "bird"].includes(o.type)))
    chains.push("→ Predators 🦊");
  foodChain.innerHTML =
    chains.length > 0
      ? chains.join(" ")
      : "Add organisms to build food chain...";
};
function gameLoop() {
  game.update();
  game.render();
  requestAnimationFrame(gameLoop);
}
gameLoop();
