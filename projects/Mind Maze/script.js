const game = new MindMaze(document.getElementById("mazeCanvas"));
const energyFill = document.getElementById("energyFill");
const levelDisplay = document.getElementById("level");
const memoriesDisplay = document.getElementById("memories");
const memoryGallery = document.getElementById("memoryGallery");
const memoryNotif = document.getElementById("memoryNotif");
const teleportBtn = document.getElementById("teleportBtn");
const revealBtn = document.getElementById("revealBtn");
game.onMemoryCollect = (memory) => {
  memoryNotif.classList.remove("hidden");
  setTimeout(() => memoryNotif.classList.add("hidden"), 2000);
  updateMemoryGallery();
};
game.onLevelComplete = () => {
  levelDisplay.textContent = game.level;
};
game.onEnergyDepleted = () => {
  alert("Mental energy depleted! Restarting level...");
  game.player = { x: 0, y: 0 };
  game.energy = 100;
};
teleportBtn.addEventListener("click", () => {
  if (game.teleport()) {
    teleportBtn.disabled = true;
    setTimeout(() => (teleportBtn.disabled = false), 3000);
  }
});
revealBtn.addEventListener("click", () => {
  if (game.revealPath()) {
    revealBtn.disabled = true;
    setTimeout(() => (revealBtn.disabled = false), 5000);
  }
});
function updateMemoryGallery() {
  memoryGallery.innerHTML = "";
  if (game.collectedMemories.length === 0) {
    memoryGallery.innerHTML = '<p class="empty-state">No memories yet...</p>';
  } else {
    game.collectedMemories.forEach((m) => {
      const item = document.createElement("div");
      item.className = "memory-item";
      item.textContent = m.icon;
      memoryGallery.appendChild(item);
    });
  }
}
function gameLoop() {
  game.update();
  game.render();
  energyFill.style.width = game.energy + "%";
  levelDisplay.textContent = game.level;
  memoriesDisplay.textContent = game.collectedMemories.length;
  requestAnimationFrame(gameLoop);
}
updateMemoryGallery();
gameLoop();
