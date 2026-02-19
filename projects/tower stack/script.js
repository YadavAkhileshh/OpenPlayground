const eng = new StackEngine(document.getElementById("gc"));
const $ = (id) => document.getElementById(id);
const show = (id) => {
  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.remove("active"));
  $(id).classList.add("active");
};
const getHi = () => +localStorage.getItem("tsHi") || 0;
const getPerf = () => +localStorage.getItem("tsPf") || 0;
const saveHi = (h, p) => {
  if (h > getHi()) localStorage.setItem("tsHi", h);
  if (p > getPerf()) localStorage.setItem("tsPf", p);
};
$("tsHi").textContent = getHi();
$("tsPerfect").textContent = getPerf();
function startGame() {
  show("gameScreen");
  eng.reset();
  eng.running = true;
}
let msgTimer;
function showMsg(txt) {
  $("tsMsg").textContent = txt;
  clearTimeout(msgTimer);
  msgTimer = setTimeout(() => ($("tsMsg").textContent = ""), 700);
}
eng.onDrop = (perfect) => {
  $("tsHeight").textContent = eng.height;
  $("tsPerfects").textContent = eng.perfects;
  if (perfect) showMsg("PERFECT! ✓");
};
eng.onPerfect = () => {
  const app = document.getElementById("app");
  app.classList.add("perfect-flash");
  setTimeout(() => app.classList.remove("perfect-flash"), 300);
};
eng.onGameOver = () => {
  saveHi(eng.height, eng.perfects);
  $("ovHeight").textContent = eng.height;
  $("ovPerfects").textContent = eng.perfects;
  $("ovRecord").textContent = Math.max(getHi(), eng.height);
  document.getElementById("gc").classList.add("tower-shake");
  setTimeout(() => {
    document.getElementById("gc").classList.remove("tower-shake");
    show("overScreen");
  }, 600);
};
$("btnTsStart").onclick = startGame;
$("btnTsRetry").onclick = startGame;
$("btnTsMenu").onclick = () => {
  $("tsHi").textContent = getHi();
  $("tsPerfect").textContent = getPerf();
  show("startScreen");
};
document.addEventListener("keydown", (e) => {
  if (e.key === " ") {
    e.preventDefault();
    eng.drop();
  }
});
document.addEventListener("click", (e) => {
  if (
    document.getElementById("gameScreen").classList.contains("active") &&
    !e.target.closest("button")
  )
    eng.drop();
});
function loop() {
  eng.update();
  eng.draw();
  requestAnimationFrame(loop);
}
loop();
