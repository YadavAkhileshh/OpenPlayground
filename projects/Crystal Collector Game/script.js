const game = new CrystalCollector(document.getElementById("caveCanvas"));

const crystalCount = document.getElementById("crystalCount");
const energyFill = document.getElementById("energyFill");
const levelNum = document.getElementById("levelNum");
const totalValue = document.getElementById("totalValue");
const collection = document.getElementById("collection");

const speedUpgrade = document.getElementById("speedUpgrade");
const visionUpgrade = document.getElementById("visionUpgrade");

game.onCollect = () => updateCollection();

game.onGameOver = () => {
  alert("Energy depleted! Game Over. Final Score: " + game.value);
  game.energy = 100;
  game.level = 1;
  game.value = 0;
  game.collected = [];
  game.spawnCrystals();
};

speedUpgrade.addEventListener("click", () => {
  if (game.value >= 100) {
    game.value -= 100;
    game.player.speed += 0.5;
    alert("Speed upgraded!");
  }
});

visionUpgrade.addEventListener("click", () => {
  if (game.value >= 150) {
    game.value -= 150;
    alert("Vision upgraded!");
  }
});

function updateCollection() {
  collection.innerHTML = "";
  game.collected.forEach((c) => {
    const crystal = document.createElement("div");
    crystal.className = "collected-crystal";
    crystal.textContent = c;
    collection.appendChild(crystal);
  });
}

function gameLoop() {
  game.update();
  game.render();

  crystalCount.textContent = game.collected.length;
  energyFill.style.width = game.energy + "%";
  levelNum.textContent = game.level;
  totalValue.textContent = game.value;

  requestAnimationFrame(gameLoop);
}

gameLoop();
