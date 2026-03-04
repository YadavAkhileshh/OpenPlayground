const game = new TimeParadox();
const timelineProgress = document.getElementById("timelineProgress");
const integrity = document.getElementById("integrity");
const levelNum = document.getElementById("levelNum");
const powerBtns = {
  rewind: document.getElementById("rewindBtn"),
  pause: document.getElementById("pauseBtn"),
  forward: document.getElementById("forwardBtn"),
};
const cooldownDisplays = {
  rewind: document.getElementById("rewindCooldown"),
  pause: document.getElementById("pauseCooldown"),
  forward: document.getElementById("forwardCooldown"),
};
game.onPowerUse = (power) => {
  powerBtns[power].classList.add("active");
  setTimeout(() => powerBtns[power].classList.remove("active"), 500);
};
game.onLevelComplete = () => {
  levelNum.textContent = game.level;
};
Object.keys(powerBtns).forEach((power) => {
  powerBtns[power].addEventListener("click", () => game.usePower(power));
});
function gameLoop() {
  game.update();
  game.render();
  timelineProgress.style.width = game.timeline + "%";
  Object.keys(game.powers).forEach((key) => {
    const cd = game.powers[key].cooldown;
    cooldownDisplays[key].textContent = cd > 0 ? Math.ceil(cd) + "s" : "";
    powerBtns[key].disabled = cd > 0;
  });
  levelNum.textContent = game.level;
  requestAnimationFrame(gameLoop);
}
gameLoop();
