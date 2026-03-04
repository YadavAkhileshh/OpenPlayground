// Pixel Ecosystem - cellular automaton life simulation
const EMPTY = 0,
  GRASS = 1,
  PLANT = 2,
  HERB = 3,
  PRED = 4;
const COLORS = {
  [EMPTY]: "#0d1117",
  [GRASS]: "#2d6a2d",
  [PLANT]: "#b54fc1",
  [HERB]: "#d4a017",
  [PRED]: "#c0392b",
};
const CELL = 8;
let cols, rows, grid, nextGrid, ages;
let running = true,
  ticks = 0,
  speed = 5;
let selectedType = GRASS;
let painting = false;
let animFrame;

const canvas = document.getElementById("eco-canvas");
const ctx = canvas.getContext("2d");

function resize() {
  const wrap = document.getElementById("canvas-wrap");
  const maxW = wrap.offsetWidth - 40;
  const maxH = wrap.offsetHeight - 60;
  cols = Math.floor(maxW / CELL);
  rows = Math.floor(maxH / CELL);
  canvas.width = cols * CELL;
  canvas.height = rows * CELL;
  initGrid();
}

function initGrid() {
  grid = new Uint8Array(cols * rows);
  nextGrid = new Uint8Array(cols * rows);
  ages = new Uint16Array(cols * rows);
}

function idx(x, y) {
  return y * cols + x;
}

function seedWorld() {
  initGrid();
  for (let i = 0; i < cols * rows; i++) {
    const r = Math.random();
    if (r < 0.3) grid[i] = GRASS;
    else if (r < 0.4) grid[i] = PLANT;
    else if (r < 0.46) grid[i] = HERB;
    else if (r < 0.48) grid[i] = PRED;
  }
  ticks = 0;
}

function neighbors(x, y, type) {
  let count = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const nx = (x + dx + cols) % cols;
      const ny = (y + dy + rows) % rows;
      if (grid[idx(nx, ny)] === type) count++;
    }
  }
  return count;
}

function step() {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = idx(x, y);
      const cell = grid[i];
      const age = ages[i];
      let next = cell;

      if (cell === EMPTY) {
        const ng = neighbors(x, y, GRASS);
        const np = neighbors(x, y, PLANT);
        if (ng >= 2 && Math.random() < 0.05) next = GRASS;
        else if (np >= 2 && Math.random() < 0.03) next = PLANT;
      } else if (cell === GRASS) {
        const nh = neighbors(x, y, HERB);
        const np = neighbors(x, y, PRED);
        if (nh >= 2 && Math.random() < 0.4) next = EMPTY;
        else if (np >= 1 && Math.random() < 0.1) next = EMPTY;
        else if (age > 80 && Math.random() < 0.01) next = PLANT;
      } else if (cell === PLANT) {
        const nh = neighbors(x, y, HERB);
        if (nh >= 1 && Math.random() < 0.5) next = EMPTY;
        else if (age > 60 && Math.random() < 0.005) next = GRASS;
      } else if (cell === HERB) {
        const food = neighbors(x, y, GRASS) + neighbors(x, y, PLANT);
        const pred = neighbors(x, y, PRED);
        if (pred >= 1 && Math.random() < 0.45) next = EMPTY;
        else if (food === 0 && age > 20) {
          if (Math.random() < 0.12) next = EMPTY;
        } else if (food >= 2 && Math.random() < 0.08) {
          // reproduce into empty neighbor
          const empties = getEmptyNeighbors(x, y);
          if (empties.length) {
            const [ex, ey] =
              empties[Math.floor(Math.random() * empties.length)];
            nextGrid[idx(ex, ey)] = HERB;
          }
        }
      } else if (cell === PRED) {
        const prey = neighbors(x, y, HERB);
        if (prey === 0 && age > 30) {
          if (Math.random() < 0.08) next = EMPTY;
        } else if (prey >= 1 && Math.random() < 0.04) {
          const empties = getEmptyNeighbors(x, y);
          if (empties.length) {
            const [ex, ey] =
              empties[Math.floor(Math.random() * empties.length)];
            nextGrid[idx(ex, ey)] = PRED;
          }
        }
      }

      nextGrid[i] = next;
      ages[i] = next === cell ? age + 1 : 0;
    }
  }
  [grid, nextGrid] = [nextGrid, grid];
  nextGrid.fill(0);
  ticks++;
}

function getEmptyNeighbors(x, y) {
  const result = [];
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const nx = (x + dx + cols) % cols;
      const ny = (y + dy + rows) % rows;
      if (grid[idx(nx, ny)] === EMPTY) result.push([nx, ny]);
    }
  }
  return result;
}

function draw() {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const cell = grid[idx(x, y)];
      ctx.fillStyle = COLORS[cell];
      ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
    }
  }
}

function updateStats() {
  let g = 0,
    p = 0,
    h = 0,
    pr = 0;
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] === GRASS) g++;
    else if (grid[i] === PLANT) p++;
    else if (grid[i] === HERB) h++;
    else if (grid[i] === PRED) pr++;
  }
  document.getElementById("stat-grass").textContent = g;
  document.getElementById("stat-plant").textContent = p;
  document.getElementById("stat-herb").textContent = h;
  document.getElementById("stat-pred").textContent = pr;
  document.getElementById("stat-ticks").textContent = ticks;
}

let lastTime = 0,
  stepAcc = 0;
function loop(time) {
  animFrame = requestAnimationFrame(loop);
  const dt = time - lastTime;
  lastTime = time;
  if (running) {
    stepAcc += dt;
    const interval = 1000 / (speed * 5);
    while (stepAcc >= interval) {
      step();
      stepAcc -= interval;
    }
  }
  draw();
  updateStats();
}

// Input
function canvasPos(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = cols / rect.width;
  const scaleY = rows / rect.height;
  return [
    Math.floor((e.clientX - rect.left) * scaleX),
    Math.floor((e.clientY - rect.top) * scaleY),
  ];
}

function placeCells(e) {
  const [x, y] = canvasPos(e);
  if (x >= 0 && x < cols && y >= 0 && y < rows) {
    const type = selectedType === "erase" ? EMPTY : selectedType;
    grid[idx(x, y)] = type;
    ages[idx(x, y)] = 0;
  }
}

canvas.addEventListener("mousedown", (e) => {
  painting = true;
  placeCells(e);
});
canvas.addEventListener("mousemove", (e) => {
  if (painting) placeCells(e);
});
window.addEventListener("mouseup", () => (painting = false));

document.querySelectorAll(".tool-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".tool-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const type = btn.dataset.type;
    if (type === "grass") selectedType = GRASS;
    else if (type === "plant") selectedType = PLANT;
    else if (type === "herbivore") selectedType = HERB;
    else if (type === "predator") selectedType = PRED;
    else selectedType = "erase";
  });
});

document.getElementById("run-btn").addEventListener("click", function () {
  running = !running;
  this.textContent = running ? "⏸ Pause" : "▶ Resume";
});

document.getElementById("clear-btn").addEventListener("click", () => {
  initGrid();
  ticks = 0;
});

document.getElementById("seed-btn").addEventListener("click", seedWorld);

document.getElementById("speed-slider").addEventListener("input", (e) => {
  speed = parseInt(e.target.value);
});

window.addEventListener("resize", () => {
  const oldGrid = new Uint8Array(grid);
  const oldCols = cols,
    oldRows = rows;
  resize();
  // Restore what fits
  for (let y = 0; y < Math.min(rows, oldRows); y++) {
    for (let x = 0; x < Math.min(cols, oldCols); x++) {
      grid[idx(x, y)] = oldGrid[y * oldCols + x];
    }
  }
});

resize();
seedWorld();
requestAnimationFrame(loop);
