const eng = new VoidEngine(document.getElementById("gc"));
const show = (id) => {
  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
};
const hi = () => parseInt(localStorage.getItem("vbHi") || 0);
const saveHi = (s) => {
  if (s > hi()) localStorage.setItem("vbHi", s);
};
document.getElementById("ssHi").textContent = hi();
function startGame() {
  show("gameScreen");
  eng.reset();
  eng.spawnWave();
  eng.gameRunning = true;
}
eng.onGameOver = () => {
  saveHi(eng.score);
  document.getElementById("oScore").textContent = eng.score.toLocaleString();
  document.getElementById("oWave").textContent = eng.wave;
  document.getElementById("oKills").textContent = eng.kills;
  document.getElementById("oHi").textContent = Math.max(
    hi(),
    eng.score,
  ).toLocaleString();
  setTimeout(() => show("overScreen"), 800);
};
document.getElementById("btnStart").onclick = startGame;
document.getElementById("btnRestart").onclick = startGame;
document.getElementById("btnMenu").onclick = () => {
  document.getElementById("ssHi").textContent = hi();
  show("startScreen");
};
document.addEventListener("mousemove", (e) => {
  eng.mouse.x = e.clientX;
  eng.mouse.y = e.clientY;
});
document.addEventListener("mousedown", (e) => {
  if (e.button === 0) eng.shooting = true;
});
document.addEventListener("mouseup", (e) => {
  if (e.button === 0) eng.shooting = false;
});
document.addEventListener("keydown", (e) => {
  eng.keys[e.key] = true;
  if (e.key === " ") e.preventDefault();
});
document.addEventListener("keyup", (e) => {
  eng.keys[e.key] = false;
});
function loop() {
  eng.update();
  eng.draw();
  document.getElementById("hudScore").textContent = eng.score
    .toString()
    .padStart(6, "0");
  document.getElementById("hudCombo").textContent = "x" + eng.combo;
  document.getElementById("hudWave").textContent = eng.wave
    .toString()
    .padStart(2, "0");
  document.getElementById("hudKills").textContent = eng.kills
    .toString()
    .padStart(3, "0");
  document.getElementById("healthBar").style.width =
    (eng.player.hp / eng.player.maxHp) * 100 + "%";
  const dc = Math.max(0, 1 - eng.player.dashCd / 90);
  document.getElementById("dashFill").style.width = dc * 120 + "px";
  requestAnimationFrame(loop);
}
loop();
