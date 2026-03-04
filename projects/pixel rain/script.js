const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const PIXEL = 4;
let gravity = 1.0;
let spawnRate = 5;
let autoMode = false;
let autoTimer = null;
let frame = 0;

const PALETTES = [
  "#ff4757",
  "#ff6b81",
  "#ffa502",
  "#ffdd59",
  "#7bed9f",
  "#2ed573",
  "#1e90ff",
  "#5352ed",
  "#a29bfe",
  "#fd79a8",
  "#ffffff",
  "#00cec9",
];
let currentColor = PALETTES[0];

const drops = [];
const splats = [];

function resize() {
  const maxW = Math.min(window.innerWidth - 4, 800);
  const maxH = Math.min(window.innerHeight - 100, 560);
  canvas.width = Math.floor(maxW / PIXEL) * PIXEL;
  canvas.height = Math.floor(maxH / PIXEL) * PIXEL;
}
resize();
window.addEventListener("resize", resize);

// Build palette
const palette = document.getElementById("palette");
PALETTES.forEach((c) => {
  const sw = document.createElement("div");
  sw.className = "swatch" + (c === currentColor ? " selected" : "");
  sw.style.background = c;
  sw.addEventListener("click", () => {
    document
      .querySelectorAll(".swatch")
      .forEach((s) => s.classList.remove("selected"));
    sw.classList.add("selected");
    currentColor = c;
  });
  palette.appendChild(sw);
});

function spawnAt(x, px) {
  const gridX = Math.floor(x / PIXEL) * PIXEL;
  for (let i = 0; i < spawnRate; i++) {
    drops.push({
      x: gridX + Math.floor(Math.random() * 6 - 3) * PIXEL,
      y: 0,
      vy: Math.random() * 2 + 1,
      color: currentColor,
    });
  }
}

let mouseDown = false;
let lastX = -1;

canvas.addEventListener("mousedown", (e) => {
  mouseDown = true;
  const r = canvas.getBoundingClientRect();
  spawnAt(e.clientX - r.left);
});
canvas.addEventListener("mousemove", (e) => {
  if (!mouseDown) return;
  const r = canvas.getBoundingClientRect();
  const x = e.clientX - r.left;
  if (Math.abs(x - lastX) > PIXEL * 2) {
    spawnAt(x);
    lastX = x;
  }
});
canvas.addEventListener("mouseup", () => {
  mouseDown = false;
  lastX = -1;
});
canvas.addEventListener(
  "touchstart",
  (e) => {
    e.preventDefault();
    const r = canvas.getBoundingClientRect();
    spawnAt(e.touches[0].clientX - r.left);
  },
  { passive: false },
);

document.getElementById("gravSlider").addEventListener("input", function () {
  gravity = parseFloat(this.value);
  document.getElementById("gravVal").textContent = gravity.toFixed(1);
});
document.getElementById("rateSlider").addEventListener("input", function () {
  spawnRate = parseInt(this.value);
  document.getElementById("rateVal").textContent = spawnRate;
});
document.getElementById("clearBtn").addEventListener("click", () => {
  drops.length = 0;
  splats.length = 0;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});
document.getElementById("autoBtn").addEventListener("click", function () {
  autoMode = !autoMode;
  this.textContent = "AUTO: " + (autoMode ? "ON" : "OFF");
  this.classList.toggle("active", autoMode);
});

function splat(x, y, color) {
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [1, 1],
    [-1, 1],
  ];
  dirs.forEach(([dx, dy]) => {
    if (Math.random() > 0.5) {
      splats.push({ x: x + dx * PIXEL, y: y + dy * PIXEL, color, life: 1 });
    }
  });
}

function loop() {
  requestAnimationFrame(loop);
  frame++;

  // Auto spawn
  if (autoMode && frame % 8 === 0) {
    const x = Math.random() * canvas.width;
    const savedColor = currentColor;
    currentColor = PALETTES[Math.floor(Math.random() * PALETTES.length)];
    spawnAt(x);
    currentColor = savedColor;
  }

  // Update drops
  for (let i = drops.length - 1; i >= 0; i--) {
    const d = drops[i];
    d.vy += gravity * 0.15;
    d.y += d.vy * gravity * 0.5;
    if (d.y + PIXEL >= canvas.height) {
      d.y = canvas.height - PIXEL;
      splat(d.x, d.y, d.color);
      drops.splice(i, 1);
    }
  }

  // Draw
  ctx.fillStyle = "rgba(17,17,17,0.06)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drops.forEach((d) => {
    ctx.fillStyle = d.color;
    ctx.fillRect(d.x, d.y, PIXEL, PIXEL);
  });

  for (let i = splats.length - 1; i >= 0; i--) {
    const s = splats[i];
    ctx.fillStyle = s.color;
    ctx.globalAlpha = s.life;
    ctx.fillRect(s.x, s.y, PIXEL, PIXEL);
    s.life -= 0.04;
    if (s.life <= 0) splats.splice(i, 1);
  }
  ctx.globalAlpha = 1;
}

loop();
