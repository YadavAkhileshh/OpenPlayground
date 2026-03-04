const eng = new MeteorEngine(document.getElementById("gc"));
const $ = (id) => document.getElementById(id);
const show = (id) => {
  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.remove("active"));
  $(id).classList.add("active");
};
const getHi = () => +localStorage.getItem("mbHi") || 0;
const getKills = () => +localStorage.getItem("mbKills") || 0;
const saveHi = (s, k) => {
  if (s > getHi()) localStorage.setItem("mbHi", s);
  if (k > getKills()) localStorage.setItem("mbKills", k);
};
$("sHi").textContent = getHi().toString().padStart(6, "0");
$("sKills").textContent = getKills().toString().padStart(3, "0");
let lastShot = 0;
function startGame() {
  show("gameScreen");
  eng.reset();
  eng.running = true;
  function loop() {
    eng.update();
    eng.draw();
    if (eng.keys[" "]) {
      const n = Date.now();
      if (n - lastShot > 160) {
        eng.bullets.push({
          x: eng.ship.x,
          y: eng.ship.y - eng.ship.h / 2,
          vy: -15,
        });
        lastShot = n;
      }
    }
    $("hScore").textContent = eng.score.toString().padStart(6, "0");
    $("hWave").textContent = eng.wave.toString().padStart(2, "0");
    $("hKills").textContent = eng.kills.toString().padStart(3, "0");
    $("hMulti").textContent = "x" + Math.floor(eng.multi);
    $("hpFill").style.width = Math.max(0, eng.ship.hp) + "%";
    $("bombsRow").textContent =
      "💣".repeat(eng.bombs) + "  ".repeat(Math.max(0, 3 - eng.bombs));
    if (eng.running) requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}
eng.onDead = () => {
  saveHi(eng.score, eng.kills);
  $("ovBig").textContent = eng.score.toLocaleString();
  $("ovWave").textContent = eng.wave;
  $("ovKills").textContent = eng.kills;
  $("ovHi").textContent = Math.max(getHi(), eng.score).toLocaleString();
  setTimeout(() => show("overScreen"), 700);
};
document.addEventListener("keydown", (e) => {
  eng.keys[e.key] = true;
  if (e.key === "Shift") {
    eng.bomb();
    document.getElementById("gc").classList.add("bomb-flash");
    setTimeout(
      () => document.getElementById("gc").classList.remove("bomb-flash"),
      400,
    );
  }
  if (e.key === " ") e.preventDefault();
});
document.addEventListener("keyup", (e) => {
  eng.keys[e.key] = false;
});
$("btnFire").onclick = startGame;
$("btnAgain").onclick = startGame;
$("btnBack").onclick = () => {
  $("sHi").textContent = getHi().toString().padStart(6, "0");
  $("sKills").textContent = getKills().toString().padStart(3, "0");
  show("startScreen");
};
