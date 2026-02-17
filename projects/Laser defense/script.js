const game = new LaserDefense(document.getElementById("defenseCanvas"));

const energyBar = document.getElementById("energyBar");
const waveDisplay = document.getElementById("wave");
const destroyedDisplay = document.getElementById("destroyed");
const scoreDisplay = document.getElementById("score");
const waveProgress = document.getElementById("waveProgress");
const enemiesLeft = document.getElementById("enemiesLeft");

const towerBtns = document.querySelectorAll(".tower-btn");
const startWaveBtn = document.getElementById("startWave");

const upgradeRange = document.getElementById("upgradeRange");
const upgradeDamage = document.getElementById("upgradeDamage");
const upgradeSpeed = document.getElementById("upgradeSpeed");

towerBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    towerBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    game.selectedTower = btn.dataset.type;
  });
});

startWaveBtn.addEventListener("click", () => {
  game.startWave();
  startWaveBtn.disabled = true;
  startWaveBtn.textContent = "⚔ WAVE ACTIVE";
});

game.onWaveComplete = () => {
  startWaveBtn.disabled = false;
  startWaveBtn.textContent = "▶ NEXT WAVE";
  game.energy += 50;
};

upgradeRange.addEventListener("click", () => {
  if (game.energy >= 50) {
    game.towers.forEach((t) => (t.range += 20));
    game.energy -= 50;
  }
});

upgradeDamage.addEventListener("click", () => {
  if (game.energy >= 75) {
    game.towers.forEach((t) => (t.damage += 5));
    game.energy -= 75;
  }
});

upgradeSpeed.addEventListener("click", () => {
  if (game.energy >= 60) {
    game.towers.forEach(
      (t) => (t.maxCooldown = Math.max(10, t.maxCooldown - 5)),
    );
    game.energy -= 60;
  }
});

function gameLoop() {
  game.update();
  game.render();
  energyBar.style.width = Math.min(100, (game.energy / 500) * 100) + "%";
  waveDisplay.textContent = game.wave;
  destroyedDisplay.textContent = game.destroyed;
  scoreDisplay.textContent = game.score;

  const progress =
    game.enemiesInWave > 0
      ? ((game.enemiesInWave - game.enemies.length) / game.enemiesInWave) * 100
      : 0;

  waveProgress.style.width = progress + "%";
  enemiesLeft.textContent = "Enemies: " + game.enemies.length;

  requestAnimationFrame(gameLoop);
}

window.addEventListener("resize", () => {
  game.canvas.width = game.canvas.offsetWidth;
  game.canvas.height = game.canvas.offsetHeight;
});

gameLoop();
