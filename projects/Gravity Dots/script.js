const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

let W, H;
function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

let mouse = { x: W / 2, y: H / 2 };
let attraction = 0.6;
let friction = 0.95;
let mode = "attract";
let pulses = [];

canvas.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});
canvas.addEventListener(
  "touchmove",
  (e) => {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
  },
  { passive: true },
);

canvas.addEventListener("click", (e) => {
  pulses.push({ x: e.clientX, y: e.clientY, r: 0, max: 200, strength: 5 });
});

// Controls
document.getElementById("attSlider").addEventListener("input", function () {
  attraction = parseFloat(this.value);
  document.getElementById("attVal").textContent = attraction.toFixed(2);
});
document.getElementById("frictSlider").addEventListener("input", function () {
  friction = parseFloat(this.value);
  document.getElementById("frictVal").textContent = friction.toFixed(3);
});
document.getElementById("dotSlider").addEventListener("input", function () {
  const n = parseInt(this.value);
  document.getElementById("dotCountVal").textContent = n;
  while (dots.length < n) dots.push(makeDot());
  while (dots.length > n) dots.pop();
});
document.querySelectorAll(".mode-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".mode-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    mode = btn.dataset.mode;
  });
});

const HUE_SHIFT = 0.002;
let hueBase = 0;

function makeDot() {
  return {
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
    size: Math.random() * 2.5 + 1,
    hue: Math.random() * 360,
  };
}

let dots = Array.from({ length: 200 }, makeDot);

function loop() {
  requestAnimationFrame(loop);
  hueBase = (hueBase + 0.3) % 360;

  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(0, 0, W, H);

  // Update and draw pulses
  for (let i = pulses.length - 1; i >= 0; i--) {
    const p = pulses[i];
    p.r += 8;
    const alpha = 1 - p.r / p.max;
    if (alpha <= 0) {
      pulses.splice(i, 1);
      continue;
    }
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.6})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  dots.forEach((d) => {
    const dx = mouse.x - d.x;
    const dy = mouse.y - d.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const force = attraction / (dist * 0.05 + 1);

    if (mode === "attract") {
      d.vx += (dx / dist) * force;
      d.vy += (dy / dist) * force;
    } else if (mode === "repel") {
      d.vx -= (dx / dist) * force;
      d.vy -= (dy / dist) * force;
    } else if (mode === "orbit") {
      // Perpendicular component
      d.vx += (-dy / dist) * force * 0.6 + (dx / dist) * force * 0.1;
      d.vy += (dx / dist) * force * 0.6 + (dy / dist) * force * 0.1;
    }

    // Pulse interactions
    pulses.forEach((p) => {
      const pdx = d.x - p.x,
        pdy = d.y - p.y;
      const pd = Math.sqrt(pdx * pdx + pdy * pdy) || 1;
      const ring = Math.abs(pd - p.r);
      if (ring < 30) {
        const fac = (1 - ring / 30) * p.strength;
        d.vx += (pdx / pd) * fac;
        d.vy += (pdy / pd) * fac;
      }
    });

    d.vx *= friction;
    d.vy *= friction;
    d.x += d.vx;
    d.y += d.vy;

    // Wrap
    if (d.x < 0) d.x = W;
    if (d.x > W) d.x = 0;
    if (d.y < 0) d.y = H;
    if (d.y > H) d.y = 0;

    const speed = Math.sqrt(d.vx * d.vx + d.vy * d.vy);
    const hue = (d.hue + hueBase + speed * 8) % 360;
    const light = Math.min(50 + speed * 8, 85);

    ctx.beginPath();
    ctx.arc(d.x, d.y, d.size + speed * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${hue}, 90%, ${light}%)`;
    ctx.shadowColor = `hsl(${hue}, 100%, 70%)`;
    ctx.shadowBlur = speed > 3 ? 8 : 0;
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  // Draw cursor
  ctx.beginPath();
  ctx.arc(mouse.x, mouse.y, 6, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,255,255,0.7)";
  ctx.lineWidth = 1;
  ctx.stroke();
}

loop();
