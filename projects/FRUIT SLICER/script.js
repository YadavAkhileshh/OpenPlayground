const eng = new FruitEngine(document.getElementById("gc"));
const $ = (id) => document.getElementById(id);
const show = (id) => {
  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.remove("active"));
  $(id).classList.add("active");
};
const getHi = () => +localStorage.getItem("fsHi") || 0;
const setHi = (v) => {
  if (v > getHi()) localStorage.setItem("fsHi", v);
};
const getStreak = () => +localStorage.getItem("fsStreak") || 0;
const setStreak = (v) => {
  if (v > getStreak()) localStorage.setItem("fsStreak", v);
};
$("sBest").textContent = getHi();
$("sStreak").textContent = getStreak();
function startGame() {
  show("gameScreen");
  eng.reset();
  eng.running = true;
}
eng.onSlice = (x, y, pts) => {
  $("gScore").textContent = eng.score;
  const combo = eng.combo > 2 ? ` x${eng.combo}` : "";
  $("gCombo").textContent = combo;
  setTimeout(() => ($("gCombo").textContent = ""), 600);
};
eng.onBomb = () => {
  $("gLives").textContent =
    "❤️".repeat(Math.max(0, eng.lives)) +
    "🖤".repeat(Math.max(0, 3 - eng.lives));
  document.getElementById("gc").classList.add("bomb-shake");
  setTimeout(
    () => document.getElementById("gc").classList.remove("bomb-shake"),
    400,
  );
};
eng.onDead = () => {
  setHi(eng.score);
  setStreak(eng.maxCombo);
  $("ovScore").textContent = eng.score.toLocaleString();
  $("ovSliced").textContent = eng.sliced;
  $("ovCombo").textContent = eng.maxCombo;
  $("ovBest").textContent = getHi().toLocaleString();
  $("ovEmoji").textContent = ["🍉", "🍊", "🍋", "🍇", "🍓"][
    Math.floor(Math.random() * 5)
  ];
  setTimeout(() => show("overScreen"), 600);
};
$("btnSlice").onclick = startGame;
$("btnAgain").onclick = startGame;
$("btnBack").onclick = () => {
  $("sBest").textContent = getHi();
  $("sStreak").textContent = getStreak();
  show("startScreen");
};
document.addEventListener("mousemove", (e) => {
  eng.mouse.x = e.clientX;
  eng.mouse.y = e.clientY;
});
document.addEventListener(
  "touchmove",
  (e) => {
    e.preventDefault();
    const t = e.touches[0];
    eng.mouse.x = t.clientX;
    eng.mouse.y = t.clientY;
  },
  { passive: false },
);
function loop() {
  eng.update();
  eng.draw();
  $("gScore").textContent = eng.score;
  $("gLives").textContent =
    "❤️".repeat(Math.max(0, eng.lives)) +
    "🖤".repeat(Math.max(0, 3 - eng.lives));
  requestAnimationFrame(loop);
}
loop();
