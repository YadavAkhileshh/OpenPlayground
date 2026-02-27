const eng = new BrickEngine(document.getElementById("gc"));
const $ = (id) => document.getElementById(id);
const show = (id) => {
  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.remove("active"));
  $(id).classList.add("active");
};
const getHi = () => +localStorage.getItem("bbHi") || 0;
const getHiLvl = () => +localStorage.getItem("bbLv") || 1;
const setHi = (s, l) => {
  if (s > getHi()) localStorage.setItem("bbHi", s);
  if (l > getHiLvl()) localStorage.setItem("bbLv", l);
};
$("bbHiScore").textContent = getHi().toString().padStart(6, "0");
$("bbHiLevel").textContent = getHiLvl().toString().padStart(2, "0");
function startGame() {
  show("gameScreen");
  eng.reset();
  eng.running = true;
}
eng.onPower = (type) => {
  const msg = $("bbPowerMsg");
  msg.textContent = {
    WIDE: "WIDE PADDLE!",
    MULTI: "MULTI-BALL!",
    FAST: "SPEED UP!",
    SLOW: "SLOW DOWN!",
    EXTRA: "EXTRA LIFE!",
  }[type];
  msg.classList.remove("show");
  void msg.offsetWidth;
  msg.classList.add("show");
};
eng.onLevelUp = () => {
  $("bbLevel").textContent = eng.level.toString().padStart(2, "0");
  document.getElementById("gc").classList.add("level-flash");
  setTimeout(
    () => document.getElementById("gc").classList.remove("level-flash"),
    500,
  );
};
eng.onDead = () => {
  setHi(eng.score, eng.level);
  $("bbOvScore").textContent = eng.score.toLocaleString();
  $("bbOvLevel").textContent = eng.level;
  $("bbOvHi").textContent = getHi().toLocaleString();
  $("bbOverH").textContent = eng.level > 5 ? "LEGENDARY!" : "GAME OVER";
  setTimeout(() => show("overScreen"), 700);
};
$("btnBbStart").onclick = startGame;
$("btnBbRetry").onclick = startGame;
$("btnBbMenu").onclick = () => {
  $("bbHiScore").textContent = getHi().toString().padStart(6, "0");
  $("bbHiLevel").textContent = getHiLvl().toString().padStart(2, "0");
  show("startScreen");
};
document.addEventListener("mousemove", (e) => (eng.mouse.x = e.clientX));
document.addEventListener("keydown", (e) => {
  if (e.key === " ") {
    e.preventDefault();
    eng.launch();
  }
});
document.addEventListener("click", (e) => {
  if (
    document.getElementById("gameScreen").classList.contains("active") &&
    !e.target.closest("button")
  )
    eng.launch();
});
function loop() {
  eng.update();
  eng.draw();
  $("bbScore").textContent = eng.score.toString().padStart(6, "0");
  $("bbLevel").textContent = eng.level.toString().padStart(2, "0");
  $("ballsRow").textContent =
    "●".repeat(Math.max(0, eng.lives)) + "○".repeat(Math.max(0, 3 - eng.lives));
  requestAnimationFrame(loop);
}
loop();
