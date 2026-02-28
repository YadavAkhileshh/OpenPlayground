const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");
let W = (canvas.width = window.innerWidth);
let H = (canvas.height = window.innerHeight);

window.addEventListener("resize", () => {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
  rebuildStars();
});

// Camera state
let camX = 0,
  camY = 0,
  zoom = 1;
let isDragging = false,
  lastMX = 0,
  lastMY = 0;
let mode = "drift";

// Scene data
const STAR_COUNT = 600;
const NEBULA_COUNT = 8;
let stars = [];
let nebulae = [];
let constellations = [];
let selectedStar = null;
let hoveredStar = null;

const STAR_NAMES = [
  "Aldebaran",
  "Vega",
  "Rigel",
  "Sirius",
  "Capella",
  "Procyon",
  "Betelgeuse",
  "Altair",
  "Deneb",
  "Spica",
  "Antares",
  "Pollux",
  "Formalhaut",
  "Regulus",
  "Castor",
  "Alcor",
  "Mizar",
  "Alioth",
  "Dubhe",
  "Merak",
  "Phecda",
  "Megrez",
  "Alkaid",
];

const STAR_TYPES = [
  { color: "#ffe8d0", size: 1.2, freq: 0.3 }, // Orange dwarf
  { color: "#fff0f0", size: 1.0, freq: 0.4 }, // White
  { color: "#d0e8ff", size: 1.4, freq: 0.1 }, // Blue giant
  { color: "#ffffe0", size: 1.1, freq: 0.15 }, // Yellow
  { color: "#ffddaa", size: 2.2, freq: 0.05 }, // Red giant
];

function pickType() {
  let r = Math.random(),
    cum = 0;
  for (const t of STAR_TYPES) {
    cum += t.freq;
    if (r < cum) return t;
  }
  return STAR_TYPES[0];
}

function rebuildStars() {
  stars = [];
  const usedNames = new Set();
  for (let i = 0; i < STAR_COUNT; i++) {
    const t = pickType();
    const brightness = 0.3 + Math.random() * 0.7;
    let name = null;
    if (Math.random() < 0.04) {
      const remaining = STAR_NAMES.filter((n) => !usedNames.has(n));
      if (remaining.length) {
        name = remaining[Math.floor(Math.random() * remaining.length)];
        usedNames.add(name);
      }
    }
    stars.push({
      x: Math.random() * W * 3 - W,
      y: Math.random() * H * 3 - H,
      r: t.size * (0.5 + brightness),
      color: t.color,
      brightness,
      twinklePhase: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.5 + Math.random() * 1.5,
      name,
    });
  }
  nebulae = [];
  for (let i = 0; i < NEBULA_COUNT; i++) {
    nebulae.push({
      x: Math.random() * W * 3 - W,
      y: Math.random() * H * 3 - H,
      rx: 100 + Math.random() * 200,
      ry: 80 + Math.random() * 150,
      rotation: Math.random() * Math.PI,
      hue: [220, 280, 180, 30, 200][Math.floor(Math.random() * 5)],
      opacity: 0.03 + Math.random() * 0.06,
    });
  }
}

rebuildStars();

// Input handlers
window.addEventListener("wheel", (e) => {
  const factor = e.deltaY > 0 ? 0.9 : 1.1;
  zoom = Math.max(0.3, Math.min(4, zoom * factor));
});

canvas.addEventListener("mousedown", (e) => {
  if (mode === "drift") {
    isDragging = true;
    lastMX = e.clientX;
    lastMY = e.clientY;
  } else {
    const star = getStarAt(e.clientX, e.clientY);
    if (star !== null) {
      if (selectedStar === null) {
        selectedStar = star;
      } else if (selectedStar !== star) {
        const exists = constellations.some(
          (c) =>
            (c.from === selectedStar && c.to === star) ||
            (c.from === star && c.to === selectedStar),
        );
        if (!exists) constellations.push({ from: selectedStar, to: star });
        selectedStar = star;
      }
    } else {
      selectedStar = null;
    }
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (isDragging && mode === "drift") {
    camX += (e.clientX - lastMX) / zoom;
    camY += (e.clientY - lastMY) / zoom;
    lastMX = e.clientX;
    lastMY = e.clientY;
  }
  hoveredStar = getStarAt(e.clientX, e.clientY);
  const tip = document.getElementById("tooltip");
  if (hoveredStar !== null && stars[hoveredStar].name) {
    tip.style.display = "block";
    tip.style.left = e.clientX + 16 + "px";
    tip.style.top = e.clientY - 10 + "px";
    tip.textContent = stars[hoveredStar].name;
  } else {
    tip.style.display = "none";
  }
});

canvas.addEventListener("mouseup", () => (isDragging = false));

// Coordinate helpers
function worldToScreen(wx, wy) {
  return [(wx + camX) * zoom + W / 2, (wy + camY) * zoom + H / 2];
}
function screenToWorld(sx, sy) {
  return [(sx - W / 2) / zoom - camX, (sy - H / 2) / zoom - camY];
}

function getStarAt(sx, sy) {
  const [wx, wy] = screenToWorld(sx, sy);
  let closest = null,
    minDist = 20 / zoom;
  stars.forEach((s, i) => {
    const d = Math.hypot(s.x - wx, s.y - wy);
    if (d < minDist) {
      minDist = d;
      closest = i;
    }
  });
  return closest;
}

// Controls
function setMode(m) {
  mode = m;
  selectedStar = null;
  document
    .querySelectorAll(".ui-btn")
    .forEach((b) => b.classList.remove("active"));
  document.getElementById("btn-" + m).classList.add("active");
  document.getElementById("mode-label").textContent =
    m === "drift" ? "Navigating" : "Drawing";
  canvas.style.cursor = m === "drift" ? "grab" : "crosshair";
}

function clearConstellations() {
  constellations = [];
  selectedStar = null;
}

let t = 0;

function draw() {
  t += 0.016;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);

  // Nebulae
  nebulae.forEach((n) => {
    const [sx, sy] = worldToScreen(n.x, n.y);
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(n.rotation);
    ctx.scale(1, n.ry / n.rx);
    const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, n.rx * zoom);
    grd.addColorStop(0, `hsla(${n.hue}, 80%, 50%, ${n.opacity * 2})`);
    grd.addColorStop(0.5, `hsla(${n.hue + 20}, 60%, 40%, ${n.opacity})`);
    grd.addColorStop(1, "transparent");
    ctx.beginPath();
    ctx.arc(0, 0, n.rx * zoom, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();
    ctx.restore();
  });

  // Constellation lines
  ctx.strokeStyle = "rgba(150, 200, 255, 0.3)";
  ctx.lineWidth = 1;
  ctx.setLineDash([]);
  constellations.forEach((c) => {
    const [ax, ay] = worldToScreen(stars[c.from].x, stars[c.from].y);
    const [bx, by] = worldToScreen(stars[c.to].x, stars[c.to].y);
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();
  });

  // Preview line in draw mode
  if (
    mode === "draw" &&
    selectedStar !== null &&
    hoveredStar !== null &&
    hoveredStar !== selectedStar
  ) {
    const [ax, ay] = worldToScreen(
      stars[selectedStar].x,
      stars[selectedStar].y,
    );
    const [bx, by] = worldToScreen(stars[hoveredStar].x, stars[hoveredStar].y);
    ctx.strokeStyle = "rgba(150, 200, 255, 0.15)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Stars
  stars.forEach((s, i) => {
    const [sx, sy] = worldToScreen(s.x, s.y);
    if (sx < -10 || sx > W + 10 || sy < -10 || sy > H + 10) return;

    const twinkle = 1 + Math.sin(t * s.twinkleSpeed + s.twinklePhase) * 0.2;
    const r = s.r * zoom * twinkle;
    if (r < 0.3) return;

    const isSelected = i === selectedStar;
    const isHovered = i === hoveredStar;

    // Glow
    if (r > 0.8 || isHovered || isSelected) {
      const glowR = r * (isSelected ? 8 : isHovered ? 5 : 3);
      const alpha = isSelected ? 0.5 : isHovered ? 0.35 : s.brightness * 0.3;
      const grd = ctx.createRadialGradient(sx, sy, 0, sx, sy, glowR);
      grd.addColorStop(0, s.color);
      grd.addColorStop(1, "transparent");
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(sx, sy, glowR, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Core dot
    ctx.fillStyle = s.color;
    ctx.beginPath();
    ctx.arc(sx, sy, Math.max(0.5, r), 0, Math.PI * 2);
    ctx.fill();

    // Star name label
    if (s.name && zoom > 0.8) {
      ctx.fillStyle = `rgba(255,255,255,${Math.min(1, (zoom - 0.8) * 1.5) * 0.5})`;
      ctx.font = `${9 * zoom}px "Exo 2", sans-serif`;
      ctx.fillText(s.name, sx + r + 4, sy + 3);
    }
  });

  // Auto-drift
  if (mode === "drift" && !isDragging) {
    camX += Math.sin(t * 0.1) * 0.1;
    camY += Math.cos(t * 0.07) * 0.08;
  }

  requestAnimationFrame(draw);
}

draw();
