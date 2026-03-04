const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let W, H;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

let fields = []; // {x, y, strength, type: 'attractor'|'repulsor', radius}
let particles = []; // {x, y, vx, vy, trail[], color}
let tool = "attractor",
  brushSize = 30,
  strength = 80,
  trailLength = 30;
let painting = false,
  paintButton = 0;
const MAX_PARTICLES = 1200;

function randomColor() {
  const hue = Math.random() * 360;
  return `hsl(${hue},80%,65%)`;
}

function addField(x, y, type) {
  const existing = fields.find(
    (f) => f.type === type && Math.hypot(f.x - x, f.y - y) < brushSize * 0.7,
  );
  if (existing) return;
  fields.push({ x, y, type, strength, radius: brushSize });
}

function addParticles(x, y, count = 8) {
  for (let i = 0; i < count && particles.length < MAX_PARTICLES; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * brushSize;
    particles.push({
      x: x + Math.cos(angle) * r,
      y: y + Math.sin(angle) * r,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      trail: [],
      color: randomColor(),
      age: 0,
    });
  }
}

function eraseAt(x, y) {
  fields = fields.filter((f) => Math.hypot(f.x - x, f.y - y) > brushSize);
}

function updateParticles() {
  for (let p of particles) {
    p.trail.push({ x: p.x, y: p.y });
    if (p.trail.length > trailLength) p.trail.shift();

    let ax = 0,
      ay = 0;
    for (const f of fields) {
      const dx = f.x - p.x;
      const dy = f.y - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 2) continue;
      const force = f.strength / (dist * dist + 100);
      const dir = f.type === "attractor" ? 1 : -1;
      ax += (dir * force * dx) / dist;
      ay += (dir * force * dy) / dist;
    }

    p.vx += ax * 0.4;
    p.vy += ay * 0.4;

    // Damping
    p.vx *= 0.998;
    p.vy *= 0.998;

    // Speed cap
    const spd = Math.hypot(p.vx, p.vy);
    if (spd > 8) {
      p.vx = (p.vx / spd) * 8;
      p.vy = (p.vy / spd) * 8;
    }

    p.x += p.vx;
    p.y += p.vy;
    p.age++;

    // Wrap
    if (p.x < 0) p.x += W;
    if (p.x > W) p.x -= W;
    if (p.y < 0) p.y += H;
    if (p.y > H) p.y -= H;
  }
}

function draw() {
  // Fade background for trails effect
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(0, 0, W, H);

  // Draw fields
  for (const f of fields) {
    const color = f.type === "attractor" ? "#64c8ff" : "#ff6464";
    const grd = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.radius * 2);
    grd.addColorStop(0, color + "33");
    grd.addColorStop(1, "transparent");
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.radius * 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = color + "80";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.radius * 0.4, 0, Math.PI * 2);
    ctx.stroke();

    // Icon
    ctx.fillStyle = color;
    ctx.font = "bold 16px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(f.type === "attractor" ? "+" : "−", f.x, f.y);
  }

  // Draw particle trails
  for (const p of particles) {
    if (p.trail.length < 2) continue;
    ctx.beginPath();
    ctx.moveTo(p.trail[0].x, p.trail[0].y);
    for (let i = 1; i < p.trail.length; i++) {
      ctx.lineTo(p.trail[i].x, p.trail[i].y);
    }
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = 0.6;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Head
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function updateStats() {
  const attractors = fields.filter((f) => f.type === "attractor").length;
  const repulsors = fields.filter((f) => f.type === "repulsor").length;
  document.getElementById("c-attract").textContent = attractors;
  document.getElementById("c-repulse").textContent = repulsors;
  document.getElementById("c-particles").textContent = particles.length;
}

let lastTime = 0;
function loop(time) {
  requestAnimationFrame(loop);
  const dt = time - lastTime;
  lastTime = time;
  updateParticles();
  draw();
  updateStats();
}
requestAnimationFrame(loop);

// Input handling
function handleAction(x, y, btn) {
  if (btn === 0) {
    // left
    if (tool === "attractor") addField(x, y, "attractor");
    else if (tool === "repulsor") addField(x, y, "repulsor");
    else if (tool === "particles") addParticles(x, y);
    else if (tool === "erase") eraseAt(x, y);
  } else if (btn === 1) {
    // middle
    addParticles(x, y, 12);
  } else if (btn === 2) {
    // right
    addField(x, y, "repulsor");
  }
}

canvas.addEventListener("mousedown", (e) => {
  painting = true;
  paintButton = e.button;
  handleAction(e.clientX, e.clientY, e.button);
  if (e.button === 1) e.preventDefault();
});
canvas.addEventListener("mousemove", (e) => {
  if (!painting) return;
  handleAction(e.clientX, e.clientY, paintButton);
});
window.addEventListener("mouseup", () => (painting = false));
canvas.addEventListener("contextmenu", (e) => e.preventDefault());

// UI
document.querySelectorAll(".tool").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".tool")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    tool = btn.dataset.tool;
  });
});

function setupSlider(id, valId, setter) {
  const el = document.getElementById(id);
  const vEl = document.getElementById(valId);
  el.addEventListener("input", () => {
    setter(parseInt(el.value));
    vEl.textContent = el.value;
  });
}

setupSlider("strength", "strength-val", (v) => (strength = v));
setupSlider("brush-size", "brush-val", (v) => (brushSize = v));
setupSlider("trail-length", "trail-val", (v) => (trailLength = v));

document
  .getElementById("clear-fields")
  .addEventListener("click", () => (fields = []));
document
  .getElementById("clear-particles")
  .addEventListener("click", () => (particles = []));
document.getElementById("clear-all").addEventListener("click", () => {
  fields = [];
  particles = [];
});
document.getElementById("add-burst").addEventListener("click", () => {
  for (let i = 0; i < 80; i++) {
    addParticles(Math.random() * W, Math.random() * H, 1);
  }
});

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  const map = { a: "attractor", s: "repulsor", d: "particles", e: "erase" };
  if (map[e.key]) {
    tool = map[e.key];
    document.querySelectorAll(".tool").forEach((b) => {
      b.classList.toggle("active", b.dataset.tool === tool);
    });
  }
});
