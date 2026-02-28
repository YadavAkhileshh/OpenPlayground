const game = new PlanetDefender(document.getElementById("defenseCanvas"));

const healthBar = document.getElementById("healthBar");
const scoreDisplay = document.getElementById("score");
const waveDisplay = document.getElementById("wave");
const shieldsDisplay = document.getElementById("shields");

document.querySelectorAll(".weapon-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".weapon-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    game.weapon = btn.dataset.weapon;
  });
});

game.onGameOver = () => {
  alert("Planet destroyed! Final Score: " + game.score);
  game.health = 100;
  game.wave = 1;
  game.score = 0;
  game.enemies = [];
  game.spawnEnemies();
};

function loop() {
  game.update();
  game.render();

  healthBar.style.width = game.health + "%";
  scoreDisplay.textContent = game.score;
  waveDisplay.textContent = game.wave;
  shieldsDisplay.textContent = game.shields;

  requestAnimationFrame(loop);
}

loop();
