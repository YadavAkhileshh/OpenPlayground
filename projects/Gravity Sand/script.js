const CELL = 4;
const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

const W = Math.min(window.innerWidth - 40, 600);
const H = Math.min(window.innerHeight - 180, 500);
const COLS = Math.floor(W / CELL);
const ROWS = Math.floor(H / CELL);
canvas.width = COLS * CELL;
canvas.height = ROWS * CELL;

const EMPTY = 0,
  SAND = 1,
  WATER = 2,
  STONE = 3,
  FIRE = 4,
  SMOKE = 5;

const COLORS = {
  [SAND]: () =>
    `hsl(${35 + Math.random() * 15}, ${60 + Math.random() * 20}%, ${55 + Math.random() * 15}%)`,
  [WATER]: () =>
    `hsl(${200 + Math.random() * 20}, ${70 + Math.random() * 20}%, ${45 + Math.random() * 15}%)`,
  [STONE]: () => `hsl(0, 0%, ${35 + Math.random() * 20}%)`,
  [FIRE]: () => `hsl(${Math.random() * 40}, 100%, ${50 + Math.random() * 20}%)`,
  [SMOKE]: () => `hsl(0, 0%, ${50 + Math.random() * 20}%)`,
};

let grid = new Array(COLS * ROWS).fill(null);

function idx(x, y) {
  return y * COLS + x;
}
function get(x, y) {
  if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return null;
  return grid[idx(x, y)];
}
function set(x, y, v) {
  if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return;
  grid[idx(x, y)] = v;
}

function hue2rgb(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

function hslToRgb(hslStr) {
  const m = hslStr.match(/hsl\((\d+\.?\d*),(\d+\.?\d*)%,(\d+\.?\d*)%\)/);
  if (!m) return [200, 180, 100];
  const h = parseFloat(m[1]) / 360,
    s = parseFloat(m[2]) / 100,
    l = parseFloat(m[3]) / 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s,
      p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function makeParticle(type) {
  const cs = COLORS[type]();
  const [r, g, b] = hslToRgb(cs);
  return {
    type,
    r,
    g,
    b,
    life: type === FIRE ? 20 + Math.floor(Math.random() * 40) : Infinity,
    moved: false,
  };
}

function step() {
  for (let i = 0; i < grid.length; i++) if (grid[i]) grid[i].moved = false;
  for (let y = ROWS - 1; y >= 0; y--) {
    const leftFirst = Math.random() > 0.5;
    for (let xi = 0; xi < COLS; xi++) {
      const x = leftFirst ? xi : COLS - 1 - xi;
      const p = get(x, y);
      if (!p || p.moved) continue;

      if (p.type === SAND) {
        if (!get(x, y + 1)) move(x, y, x, y + 1);
        else if (!get(x - 1, y + 1)) move(x, y, x - 1, y + 1);
        else if (!get(x + 1, y + 1)) move(x, y, x + 1, y + 1);
      } else if (p.type === WATER) {
        if (!get(x, y + 1)) {
          move(x, y, x, y + 1);
        } else {
          const d = Math.random() > 0.5 ? 1 : -1;
          if (!get(x + d, y)) move(x, y, x + d, y);
          else if (!get(x - d, y)) move(x, y, x - d, y);
        }
      } else if (p.type === FIRE) {
        p.life--;
        if (p.life <= 0) {
          set(x, y, Math.random() > 0.7 ? makeParticle(SMOKE) : null);
        } else {
          if (!get(x, y - 1) && Math.random() > 0.4) {
            const np = makeParticle(FIRE);
            np.life = p.life - 1;
            set(x, y - 1, np);
            set(x, y, null);
          } else {
            p.r = 200 + Math.floor(Math.random() * 55);
            p.g = Math.floor(Math.random() * 150);
            p.b = 0;
          }
        }
      } else if (p.type === SMOKE) {
        p.life = (p.life || 30) - 1;
        if (p.life <= 0) {
          set(x, y, null);
        } else if (!get(x, y - 1) && Math.random() > 0.3) {
          move(x, y, x + (Math.random() > 0.5 ? 1 : -1), y - 1);
        }
      }
    }
  }
}

function move(x1, y1, x2, y2) {
  const p = get(x1, y1);
  if (!p) return;
  set(x2, y2, p);
  set(x1, y1, null);
  p.moved = true;
}

// Pixel canvas rendering
const pixCanvas = document.createElement("canvas");
pixCanvas.width = COLS;
pixCanvas.height = ROWS;
const pctx = pixCanvas.getContext("2d");
const pImgData = pctx.createImageData(COLS, ROWS);

let currentMaterial = "sand";
let brushSize = 3;
let isDrawing = false;
let pcount = 0;

document.querySelectorAll("[data-material]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll("[data-material]")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentMaterial = btn.dataset.material;
  });
});

document
  .getElementById("brush-size")
  .addEventListener("input", (e) => (brushSize = parseInt(e.value)));

function spawnAt(ex, ey) {
  const rect = canvas.getBoundingClientRect();
  const cx = Math.floor((ex - rect.left) / CELL);
  const cy = Math.floor((ey - rect.top) / CELL);
  for (let dy = -brushSize; dy <= brushSize; dy++) {
    for (let dx = -brushSize; dx <= brushSize; dx++) {
      if (dx * dx + dy * dy <= brushSize * brushSize && Math.random() > 0.3) {
        const t = { sand: SAND, water: WATER, stone: STONE, fire: FIRE }[
          currentMaterial
        ];
        if (!get(cx + dx, cy + dy)) set(cx + dx, cy + dy, makeParticle(t));
      }
    }
  }
}

canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  spawnAt(e.clientX, e.clientY);
});
canvas.addEventListener("mousemove", (e) => {
  if (isDrawing) spawnAt(e.clientX, e.clientY);
});
window.addEventListener("mouseup", () => (isDrawing = false));
canvas.addEventListener(
  "touchstart",
  (e) => {
    isDrawing = true;
    spawnAt(e.touches[0].clientX, e.touches[0].clientY);
    e.preventDefault();
  },
  { passive: false },
);
canvas.addEventListener(
  "touchmove",
  (e) => {
    if (isDrawing) spawnAt(e.touches[0].clientX, e.touches[0].clientY);
    e.preventDefault();
  },
  { passive: false },
);
window.addEventListener("touchend", () => (isDrawing = false));

function clearGrid() {
  grid = new Array(COLS * ROWS).fill(null);
}

function render() {
  step();
  const d = pImgData.data;
  for (let i = 0; i < COLS * ROWS; i++) {
    const p = grid[i],
      o = i * 4;
    if (p) {
      d[o] = p.r;
      d[o + 1] = p.g;
      d[o + 2] = p.b;
      d[o + 3] = 255;
    } else {
      d[o] = 26;
      d[o + 1] = 18;
      d[o + 2] = 8;
      d[o + 3] = 255;
    }
  }
  pctx.putImageData(pImgData, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(pixCanvas, 0, 0, COLS, ROWS, 0, 0, canvas.width, canvas.height);

  pcount = (pcount + 1) % 30;
  if (pcount === 0) {
    let c = 0;
    for (const p of grid) if (p) c++;
    document.getElementById("count").textContent = `${c} particles`;
  }
  requestAnimationFrame(render);
}

render();
