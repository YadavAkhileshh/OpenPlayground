const eng = new PongEngine(document.getElementById("gc"));
const $ = (id) => document.getElementById(id);
const show = (id) => {
  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.remove("active"));
  $(id).classList.add("active");
};
const winsKey = (k) => +localStorage.getItem("pw_" + k) || 0;
const addWin = (k) => localStorage.setItem("pw_" + k, winsKey(k) + 1);
let totalMatches = +localStorage.getItem("pw_matches") || 0;

function refreshStartStats() {
  $("sWinsR").textContent = winsKey("R");
  $("sWinsB").textContent = winsKey("B");
}
refreshStartStats();

document.querySelectorAll(".mode-btn").forEach((b) =>
  b.addEventListener("click", () => {
    document
      .querySelectorAll(".mode-btn")
      .forEach((x) => x.classList.remove("active"));
    b.classList.add("active");
    eng.mode = b.dataset.mode;
    $("diffRow").style.display = eng.mode === "1p" ? "flex" : "none";
  }),
);
document.querySelectorAll(".diff-btn").forEach((b) =>
  b.addEventListener("click", () => {
    document
      .querySelectorAll(".diff-btn")
      .forEach((x) => x.classList.remove("active"));
    b.classList.add("active");
    eng.diff = b.dataset.diff;
  }),
);

function startGame() {
  show("gameScreen");
  eng.init();
  eng.running = true;
  $("setDisplay").textContent = "FIRST TO 7";
  countdown(3, () => eng.launchBall());
}

function countdown(n, cb) {
  const ov = $("countdownOverlay");
  const num = $("countdownNum");
  ov.classList.remove("hidden");
  num.textContent = n;
  if (n <= 0) {
    ov.classList.add("hidden");
    cb();
    return;
  }
  setTimeout(() => countdown(n - 1, cb), 900);
}

eng.onScore = (side) => {
  $("scoreR").textContent = eng.scoreR;
  $("scoreB").textContent = eng.scoreB;
  [$("scoreR"), $("scoreB")][side === "R" ? 0 : 1].classList.add("score-flash");
  setTimeout(() => {
    $("scoreR").classList.remove("score-flash");
    $("scoreB").classList.remove("score-flash");
  }, 400);
  setTimeout(() => {
    if (eng.running) countdown(2, () => eng.launchBall());
  }, 800);
};

eng.onGameOver = () => {
  const winner = eng.scoreR >= eng.maxScore ? "R" : "B";
  addWin(winner);
  totalMatches++;
  localStorage.setItem("pw_matches", totalMatches);
  $("winnerName").textContent = (winner === "R" ? "RED" : "BLUE") + " WINS!";
  $("winnerName").style.color = winner === "R" ? "#FF4060" : "#4080FF";
  $("ovFinal").textContent = eng.scoreR + " — " + eng.scoreB;
  $("ovRally").textContent = eng.maxRally + " hits";
  $("ovMatches").textContent = totalMatches;
  setTimeout(() => show("overScreen"), 800);
};

$("btnLaunch").onclick = startGame;
$("btnRematch").onclick = startGame;
$("btnMenuBack").onclick = () => {
  refreshStartStats();
  show("startScreen");
};
document.addEventListener("keydown", (e) => {
  eng.keys[e.key] = true;
  if (["ArrowUp", "ArrowDown", " "].includes(e.key)) e.preventDefault();
});
document.addEventListener("keyup", (e) => (eng.keys[e.key] = false));

function loop() {
  eng.update();
  eng.draw();
  requestAnimationFrame(loop);
}
loop();
