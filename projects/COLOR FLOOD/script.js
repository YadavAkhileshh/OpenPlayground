const eng = new FloodEngine();
const $ = (id) => document.getElementById(id);
const show = (id) => {
  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.remove("active"));
  $(id).classList.add("active");
};
const hiKey = () => "cf_" + eng.size;
const getHi = () => +localStorage.getItem(hiKey()) || 0;
const setHi = (v) => {
  if (v < getHi() || !getHi()) localStorage.setItem(hiKey(), v);
};
let selSize = 10;
document.querySelectorAll(".cp-btn").forEach((b) =>
  b.addEventListener("click", () => {
    document
      .querySelectorAll(".cp-btn")
      .forEach((x) => x.classList.remove("active"));
    b.classList.add("active");
    selSize = +b.dataset.size;
    const hi = localStorage.getItem("cf_" + selSize);
    $("cfHi").textContent = hi || "—";
  }),
);
$("cfHi").textContent = localStorage.getItem("cf_10") || "—";
function renderBoard() {
  const board = $("cfBoard");
  board.innerHTML = "";
  board.style.gridTemplateColumns = `repeat(${eng.size},1fr)`;
  for (let r = 0; r < eng.size; r++) {
    for (let c = 0; c < eng.size; c++) {
      const cell = document.createElement("div");
      cell.className =
        "cf-cell" + (eng.flooded.has(r + "," + c) ? " flooded" : "");
      cell.style.background = eng.grid[r][c];
      cell.dataset.r = r;
      cell.dataset.c = c;
      board.appendChild(cell);
    }
  }
}
function renderColors() {
  const cc = $("cfColors");
  cc.innerHTML = "";
  COLORS.forEach((col) => {
    const btn = document.createElement("button");
    btn.className = "cf-color-btn";
    btn.style.background = col;
    btn.addEventListener("click", () => doFlood(col));
    cc.appendChild(btn);
  });
}
function doFlood(color) {
  eng.flood(color);
  renderBoard();
  $("cfMoves").textContent = eng.moves;
  $("cfLeft").textContent = eng.maxMoves - eng.moves;
  $("cfProgFill").style.width = eng.getPct() * 100 + "%";
}
function startGame() {
  show("gameScreen");
  eng.init(selSize);
  renderBoard();
  renderColors();
  $("cfMoves").textContent = "0";
  $("cfLeft").textContent = eng.maxMoves;
  $("cfProgFill").style.width = "0%";
}
eng.onWin = () => {
  setHi(eng.moves);
  $("cfOverIcon").textContent = "🎉";
  $("cfOverTitle").textContent = "FLOODED!";
  $("ovMoves").textContent = eng.moves;
  $("ovBudget").textContent = eng.maxMoves;
  $("ovBest").textContent = getHi() + " moves";
  $("cfHi").textContent = getHi();
  document.getElementById("cfBoard").classList.add("win-bounce");
  setTimeout(() => show("overScreen"), 700);
};
eng.onLose = () => {
  $("cfOverIcon").textContent = "💧";
  $("cfOverTitle").textContent = "DRIED UP!";
  $("ovMoves").textContent = eng.moves;
  $("ovBudget").textContent = eng.maxMoves;
  $("ovBest").textContent = localStorage.getItem(hiKey())
    ? getHi() + " moves"
    : "—";
  document.getElementById("cfBoard").classList.add("lose-shake");
  setTimeout(() => show("overScreen"), 500);
};
$("btnCfPlay").onclick = startGame;
$("btnCfAgain").onclick = startGame;
$("btnCfMenu").onclick = () => {
  $("cfHi").textContent = localStorage.getItem("cf_" + selSize) || "—";
  show("startScreen");
};
