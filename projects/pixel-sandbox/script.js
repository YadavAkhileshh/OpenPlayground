const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const CELL_SIZE = 4;
const WIDTH = Math.floor(window.innerWidth / CELL_SIZE);
const HEIGHT = Math.floor((window.innerHeight - 80) / CELL_SIZE);

canvas.width = WIDTH * CELL_SIZE;
canvas.height = HEIGHT * CELL_SIZE;

const EMPTY = 0;
const SAND = 1;
const WATER = 2;
const STONE = 3;
const ACID = 4;

let currentElement = SAND;
let mouseDown = false;

// Grid
const grid = new Uint8Array(WIDTH * HEIGHT);

// Colors
const COLORS = {
  [SAND]: "#facc15",
  [WATER]: "#38bdf8",
  [STONE]: "#94a3b8",
  [ACID]: "#4ade80",
};

// UI
document.querySelectorAll("button").forEach(btn => {
  btn.addEventListener("click", () => {
    currentElement = {
      sand: SAND,
      water: WATER,
      stone: STONE,
      acid: ACID
    }[btn.dataset.element];
  });
});

// Mouse painting
canvas.addEventListener("mousedown", () => mouseDown = true);
canvas.addEventListener("mouseup", () => mouseDown = false);
canvas.addEventListener("mouseleave", () => mouseDown = false);

canvas.addEventListener("mousemove", e => {
  if (!mouseDown) return;

  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
  const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < WIDTH && ny >= 0 && ny < HEIGHT) {
        grid[nx + ny * WIDTH] = currentElement;
      }
    }
  }
});

// Simulation step
function update() {
  for (let y = HEIGHT - 2; y >= 0; y--) {
    for (let x = 0; x < WIDTH; x++) {
      const i = x + y * WIDTH;
      const cell = grid[i];

      if (cell === SAND) {
        fall(i, x, y);
      } else if (cell === WATER) {
        flow(i, x, y);
      } else if (cell === ACID) {
        acid(i, x, y);
      }
    }
  }
}

// Physics helpers
function fall(i, x, y) {
  const below = i + WIDTH;
  if (grid[below] === EMPTY || grid[below] === WATER) {
    swap(i, below);
  } else {
    diagonal(i, x, y);
  }
}

function diagonal(i, x, y) {
  const left = x > 0 ? i + WIDTH - 1 : -1;
  const right = x < WIDTH - 1 ? i + WIDTH + 1 : -1;

  if (left !== -1 && grid[left] === EMPTY) swap(i, left);
  else if (right !== -1 && grid[right] === EMPTY) swap(i, right);
}

function flow(i, x, y) {
  const below = i + WIDTH;
  if (grid[below] === EMPTY) {
    swap(i, below);
  } else {
    const dir = Math.random() < 0.5 ? -1 : 1;
    const side = x + dir;
    if (side >= 0 && side < WIDTH) {
      const idx = i + dir;
      if (grid[idx] === EMPTY) swap(i, idx);
    }
  }
}

function acid(i, x, y) {
  const targets = [
    i + WIDTH,
    i - WIDTH,
    i + 1,
    i - 1
  ];

  for (const t of targets) {
    if (grid[t] === SAND || grid[t] === STONE) {
      if (Math.random() < 0.05) {
        grid[t] = EMPTY;
      }
    }
  }

  flow(i, x, y);
}

function swap(a, b) {
  const temp = grid[a];
  grid[a] = grid[b];
  grid[b] = temp;
}

// Render
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < grid.length; i++) {
    const cell = grid[i];
    if (cell !== EMPTY) {
      const x = (i % WIDTH) * CELL_SIZE;
      const y = Math.floor(i / WIDTH) * CELL_SIZE;
      ctx.fillStyle = COLORS[cell];
      ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
    }
  }
}

// Loop
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
