const game = new MagicGarden(document.getElementById("gardenCanvas"));
const magicBar = document.getElementById("magicBar");
const growthBar = document.getElementById("growthBar");
const bloomCount = document.getElementById("bloomCount");
const spellBtns = document.querySelectorAll(".spell-btn");
const brewBtn = document.getElementById("brewBtn");

let selectedSpell = null;

spellBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    selectedSpell = btn.dataset.spell;
    spellBtns.forEach((b) => (b.style.transform = "scale(1)"));
    btn.style.transform = "scale(1.1)";
  });
});

game.canvas.addEventListener("click", (e) => {
  if (!selectedSpell) return;
  const rect = game.canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  game.castSpell(selectedSpell, x, y);
});

brewBtn.addEventListener("click", () => {
  alert("Brewing magical potions! (Feature coming soon)");
});

function gameLoop() {
  game.update();
  game.render();
  magicBar.style.width = game.magic + "%";
  growthBar.style.width = game.growth + "%";
  bloomCount.textContent = game.blooms;
  requestAnimationFrame(gameLoop);
}

gameLoop();
