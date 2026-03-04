const g = new HelixGame(document.getElementById("gc"));

const show = (id) => {
  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
};

const hi = () => parseInt(localStorage.getItem("hjBest") || 0);
const saveHi = (s) => {
  if (s > hi()) localStorage.setItem("hjBest", s);
};

document.getElementById("sBest").textContent = hi();

function startGame() {
  show("gameScreen");
  g.reset();
  g.gameRunning = true;
}

g.onGameOver = () => {
  saveHi(g.score);
  document.getElementById("ovSc").textContent = g.score;
  document.getElementById("ovBest").textContent = Math.max(hi(), g.score);
  document.getElementById("ovEmoji").textContent = g.score > 10 ? "🏆" : "💀";
  setTimeout(() => show("overScreen"), 600);
};

document.getElementById("btnS").onclick = startGame;
document.getElementById("btnR").onclick = startGame;
document.getElementById("btnM2").onclick = () => {
  document.getElementById("sBest").textContent = hi();
  show("startScreen");
};

let touching = false;

document.addEventListener("click", (e) => {
  if (e.clientX < window.innerWidth / 2) g.rotate(-1);
  else g.rotate(1);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") g.rotate(-1);
  if (e.key === "ArrowRight") g.rotate(1);
});

function loop() {
  g.update();
  g.draw();
  document.getElementById("sc").textContent = g.score;
  document.getElementById("lvlFill").style.width =
    ((g.score % 10) / 10) * 100 + "%";
  requestAnimationFrame(loop);
}

loop();
