let ROWS = 6,
  COLS = 7,
  grid = [],
  score = 0,
  turn = 0,
  maxChain = 0,
  curChain = 0,
  processing = false,
  gameOver = false;

function getNeighbors(r, c) {
  const n = [];
  if (r > 0) n.push([r - 1, c]);
  if (r < ROWS - 1) n.push([r + 1, c]);
  if (c > 0) n.push([r, c - 1]);
  if (c < COLS - 1) n.push([r, c + 1]);
  return n;
}

function getCritical(r, c) {
  return getNeighbors(r, c).length;
}

function initGrid() {
  grid = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({ atoms: 0, owner: -1 })),
  );
}

function renderGrid() {
  const container = document.getElementById("chainGrid");
  container.style.gridTemplateColumns = `repeat(${COLS},1fr)`;
  container.innerHTML = "";
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.r = r;
      cell.dataset.c = c;
      const d = grid[r][c];
      if (d.atoms > 0) {
        const atom = document.createElement("div");
        const colorIdx = Math.min(d.atoms, 4);
        atom.className = `atom atom-${colorIdx}`;
        const cnt = document.createElement("span");
        cnt.className = "atom-count";
        cnt.textContent = d.atoms;
        atom.appendChild(cnt);
        cell.appendChild(atom);
      }
      cell.addEventListener("click", () => handleClick(r, c));
      container.appendChild(cell);
    }
  }
}

async function handleClick(r, c) {
  if (processing || gameOver) return;
  processing = true;
  turn++;
  document.getElementById("gTurn").textContent = turn;
  addAtom(r, c);
  renderGrid();
  await processExplosions();
  processing = false;
  checkGameOver();
}

function addAtom(r, c) {
  grid[r][c].atoms++;
}

function checkExplosions() {
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (grid[r][c].atoms >= getCritical(r, c)) return true;
  return false;
}

async function processExplosions() {
  while (checkExplosions()) {
    curChain++;
    if (curChain > maxChain) maxChain = curChain;
    document.getElementById("gChain").textContent = "x" + curChain;
    const toExplode = [];
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        if (grid[r][c].atoms >= getCritical(r, c)) toExplode.push([r, c]);
    toExplode.forEach(([r, c]) => {
      const crit = getCritical(r, c);
      grid[r][c].atoms -= crit;
      score += curChain * 10;
      getNeighbors(r, c).forEach(([nr, nc]) => grid[nr][nc].atoms++);
      // flash cell
      const cells = document.querySelectorAll(".cell");
      const idx = r * COLS + c;
      if (cells[idx]) {
        cells[idx].classList.add("exploding");
        setTimeout(() => cells[idx].classList.remove("exploding"), 300);
      }
    });
    renderGrid();
    document.getElementById("gScore").textContent = score.toLocaleString();
    if (curChain > 2) {
      showChainMsg("CHAIN x" + curChain + "!");
    }
    await sleep(220);
  }
  curChain = 0;
}

function showChainMsg(msg) {
  const el = document.getElementById("chainMsg");
  el.textContent = msg;
  el.classList.remove("hidden");
  setTimeout(() => el.classList.add("hidden"), 700);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function checkGameOver() {
  const filled = grid.flat().filter((c) => c.atoms > 0).length;
  if (filled >= ROWS * COLS * 0.9) {
    endChainGame(true);
  }
}

function endChainGame(won) {
  gameOver = true;
  const key = "cr_best";
  const prev = +localStorage.getItem(key) || 0;
  if (score > prev) localStorage.setItem(key, score);
  document.getElementById("obHeader").textContent = won
    ? "⚡ VICTORY ⚡"
    : "💀 OVERLOADED 💀";
  document.getElementById("obScore").textContent = score.toLocaleString();
  document.getElementById("obTurns").textContent = turn;
  document.getElementById("obChain").textContent = maxChain;
  document.getElementById("obBest").textContent = Math.max(
    score,
    prev,
  ).toLocaleString();
  setTimeout(() => {
    document
      .querySelectorAll(".screen")
      .forEach((s) => s.classList.remove("active"));
    document.getElementById("overScreen").classList.add("active");
  }, 600);
}

function startChain(r, c) {
  ROWS = r;
  COLS = c;
  score = 0;
  turn = 0;
  maxChain = 0;
  curChain = 0;
  gameOver = false;
  processing = false;
  initGrid();
  renderGrid();
  document.getElementById("gScore").textContent = "0";
  document.getElementById("gTurn").textContent = "0";
  document.getElementById("gChain").textContent = "x1";
}
