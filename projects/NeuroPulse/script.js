const arena = document.getElementById("arena");
const orb = document.getElementById("orb");
const scoreEl = document.getElementById("score");
const comboEl = document.getElementById("combo");
const feedbackEl = document.getElementById("feedback");
const overlay = document.getElementById("overlay");
const startBtn = document.getElementById("startBtn");
const bg = document.getElementById("bg");
const ctx = bg.getContext("2d");

let score = 0;
let combo = 1;
let activeWave = null;
let playing = false;

bg.width = innerWidth;
bg.height = innerHeight;

const particles = Array.from({ length: 80 }, () => ({
  x: Math.random() * bg.width,
  y: Math.random() * bg.height,
  r: Math.random() * 2 + 0.5,
  v: Math.random() * 0.3 + 0.1,
}));

function drawBackground() {
  ctx.clearRect(0, 0, bg.width, bg.height);
  ctx.fillStyle = "rgba(125,249,255,0.4)";
  particles.forEach((p) => {
    p.y += p.v;
    if (p.y > bg.height) p.y = 0;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  });
  requestAnimationFrame(drawBackground);
}

drawBackground();

function spawnWave() {
  const wave = document.createElement("div");
  wave.className = "wave";
  arena.appendChild(wave);
  activeWave = { el: wave, time: performance.now() };

  setTimeout(() => {
    if (activeWave?.el === wave) miss();
    wave.remove();
    activeWave = null;
  }, 2000);
}

function hit() {
  const delta = performance.now() - activeWave.time;
  let quality = delta < 250 ? "Perfect" : "Good";

  score += quality === "Perfect" ? 20 * combo : 10 * combo;
  combo++;

  feedbackEl.textContent = quality;
  scoreEl.textContent = score;
  comboEl.textContent = "x" + combo;

  orb.style.boxShadow = `0 0 ${40 + combo * 4}px rgba(125,249,255,0.9)`;
}

function miss() {
  combo = 1;
  comboEl.textContent = "x1";
  feedbackEl.textContent = "Miss";
  document.body.classList.add("shake");
  setTimeout(() => document.body.classList.remove("shake"), 250);
}

window.addEventListener("click", () => {
  if (!playing || !activeWave) return;
  hit();
  activeWave.el.remove();
  activeWave = null;
});

function gameLoop() {
  if (!playing) return;
  spawnWave();
  setTimeout(gameLoop, Math.max(650, 1900 - score));
}

startBtn.onclick = () => {
  overlay.classList.add("hide");
  playing = true;
  score = 0;
  combo = 1;
  scoreEl.textContent = "0";
  comboEl.textContent = "x1";
  feedbackEl.textContent = "";
  gameLoop();
};
