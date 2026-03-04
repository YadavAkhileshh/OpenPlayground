

const canvas = document.getElementById('space');
const ctx = canvas.getContext('2d');

// ---- PLANET DATA ----
const PLANETS = [
  {
    name: 'Mercury', type: 'Terrestrial Planet',
    color: '#b5b5b5', glowColor: '#d0d0d0',
    radius: 4, orbitRadius: 80, speed: 4.787, period: 88,
    tilt: 0.03,
    diameter: '4,879 km', mass: '3.30 × 10²³ kg',
    distance: '57.9 million km', temp: '167°C avg', moons: '0',
    rings: false,
    desc: 'The smallest planet and closest to the Sun. A year on Mercury lasts just 88 Earth days, but a day is 59 Earth days. Its surface is heavily cratered and has extreme temperature swings.'
  },
  {
    name: 'Venus', type: 'Terrestrial Planet',
    color: '#e8c97d', glowColor: '#f0d890',
    radius: 7, orbitRadius: 130, speed: 3.502, period: 225,
    tilt: 177.4,
    diameter: '12,104 km', mass: '4.87 × 10²⁴ kg',
    distance: '108.2 million km', temp: '464°C avg', moons: '0',
    rings: false,
    desc: 'The hottest planet in our solar system due to its thick CO₂ atmosphere causing a runaway greenhouse effect. Rotates backwards compared to most planets — the Sun rises in the west on Venus.'
  },
  {
    name: 'Earth', type: 'Terrestrial Planet',
    color: '#4fa3e0', glowColor: '#6ec6ff',
    radius: 8, orbitRadius: 185, speed: 2.978, period: 365,
    tilt: 23.5,
    diameter: '12,742 km', mass: '5.97 × 10²⁴ kg',
    distance: '149.6 million km', temp: '15°C avg', moons: '1',
    rings: false,
    desc: 'Our home planet — the only known world harboring life. Its liquid water, protective magnetic field, and oxygen-rich atmosphere make it uniquely habitable. Earth has one natural satellite: the Moon.'
  },
  {
    name: 'Mars', type: 'Terrestrial Planet',
    color: '#c1440e', glowColor: '#e05520',
    radius: 5.5, orbitRadius: 240, speed: 2.413, period: 687,
    tilt: 25.2,
    diameter: '6,779 km', mass: '6.39 × 10²³ kg',
    distance: '227.9 million km', temp: '-60°C avg', moons: '2',
    rings: false,
    desc: 'The Red Planet — named for its iron oxide surface. Home to Olympus Mons, the tallest volcano in the solar system (21 km). Mars has thin atmosphere and is a prime target for human exploration.'
  },
  {
    name: 'Jupiter', type: 'Gas Giant',
    color: '#c88b3a', glowColor: '#e8a050',
    radius: 24, orbitRadius: 340, speed: 1.307, period: 4333,
    tilt: 3.1,
    diameter: '139,820 km', mass: '1.90 × 10²⁷ kg',
    distance: '778.5 million km', temp: '-110°C avg', moons: '95',
    rings: true, ringColor: 'rgba(180,140,80,0.3)',
    desc: 'The largest planet — so massive it could fit all other planets inside it twice over. The Great Red Spot is a storm larger than Earth that has raged for over 350 years. Jupiter acts as a cosmic shield deflecting comets.'
  },
  {
    name: 'Saturn', type: 'Gas Giant',
    color: '#e4d191', glowColor: '#f0e0a0',
    radius: 20, orbitRadius: 430, speed: 0.969, period: 10759,
    tilt: 26.7,
    diameter: '116,460 km', mass: '5.68 × 10²⁶ kg',
    distance: '1.43 billion km', temp: '-140°C avg', moons: '146',
    rings: true, ringColor: 'rgba(210,185,120,0.5)',
    desc: 'The jewel of the solar system — its iconic rings are made of ice and rock, spanning 282,000 km but only ~1 km thick. Saturn is the least dense planet; it would float in water. Has 146 confirmed moons.'
  },
  {
    name: 'Uranus', type: 'Ice Giant',
    color: '#7de8e8', glowColor: '#90ffff',
    radius: 14, orbitRadius: 515, speed: 0.681, period: 30687,
    tilt: 97.8,
    diameter: '50,724 km', mass: '8.68 × 10²⁵ kg',
    distance: '2.87 billion km', temp: '-195°C avg', moons: '28',
    rings: true, ringColor: 'rgba(100,220,220,0.25)',
    desc: 'The sideways planet — Uranus rotates on its side with an axial tilt of 98°. An ice giant composed mainly of water, methane, and ammonia ices. Its methane atmosphere gives it the distinctive blue-green color.'
  },
  {
    name: 'Neptune', type: 'Ice Giant',
    color: '#4169e1', glowColor: '#5580ff',
    radius: 13, orbitRadius: 590, speed: 0.543, period: 60190,
    tilt: 28.3,
    diameter: '49,244 km', mass: '1.02 × 10²⁶ kg',
    distance: '4.50 billion km', temp: '-200°C avg', moons: '16',
    rings: true, ringColor: 'rgba(65,100,220,0.2)',
    desc: 'The windiest planet — winds on Neptune reach 2,100 km/h, the fastest in the solar system. Despite being the farthest planet, it radiates more heat than it receives from the Sun. Orbits so slowly that one year = 165 Earth years.'
  }
];

// ---- STATE ----
let W, H, cx, cy;
let paused = false;
let simSpeed = 1.0;
let simTime = 0; // days
let startDate = new Date('2026-01-01');
let angles = PLANETS.map(() => Math.random() * Math.PI * 2);
let stars = [];
let shootingStars = [];
let hoveredPlanet = null;
let selectedPlanet = null;
let animId;

// ---- INIT ----
function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
  cx = W / 2;
  cy = H / 2;
  generateStars();
}

function generateStars() {
  stars = [];
  const count = Math.floor((W * H) / 1200);
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.4,
      alpha: 0.2 + Math.random() * 0.8,
      twinkleSpeed: 0.005 + Math.random() * 0.02,
      twinkleOffset: Math.random() * Math.PI * 2
    });
  }
}

// ---- SHOOTING STARS ----
function spawnShootingStar() {
  if (Math.random() > 0.008) return;
  const angle = Math.random() * Math.PI * 2;
  const speed = 8 + Math.random() * 12;
  shootingStars.push({
    x: Math.random() * W,
    y: Math.random() * H * 0.5,
    vx: Math.cos(angle) * speed * 0.6,
    vy: Math.sin(angle) * speed * 0.3 + speed * 0.5,
    life: 1.0,
    decay: 0.02 + Math.random() * 0.03,
    length: 60 + Math.random() * 80
  });
}

// ---- DRAW FUNCTIONS ----

function drawStars(t) {
  stars.forEach(s => {
    const tw = Math.sin(t * s.twinkleSpeed + s.twinkleOffset);
    const alpha = s.alpha * (0.7 + 0.3 * tw);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function drawShootingStars() {
  shootingStars = shootingStars.filter(s => s.life > 0);
  shootingStars.forEach(s => {
    ctx.save();
    ctx.globalAlpha = s.life * 0.9;
    const grad = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 5, s.y - s.vy * 5);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(1, 'transparent');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x - s.vx * 6, s.y - s.vy * 6);
    ctx.stroke();
    ctx.restore();
    s.x += s.vx;
    s.y += s.vy;
    s.life -= s.decay;
  });
}

function drawSun() {
  // Outer corona
  const corona = ctx.createRadialGradient(cx, cy, 10, cx, cy, 90);
  corona.addColorStop(0, 'rgba(255,200,50,0.15)');
  corona.addColorStop(0.5, 'rgba(255,120,20,0.06)');
  corona.addColorStop(1, 'transparent');
  ctx.fillStyle = corona;
  ctx.beginPath();
  ctx.arc(cx, cy, 90, 0, Math.PI * 2);
  ctx.fill();

  // Glow
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 48);
  glow.addColorStop(0, '#fff8d0');
  glow.addColorStop(0.3, '#ffcc00');
  glow.addColorStop(0.7, '#ff8800');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, 48, 0, Math.PI * 2);
  ctx.fill();

  // Core
  ctx.fillStyle = '#fff5c0';
  ctx.beginPath();
  ctx.arc(cx, cy, 22, 0, Math.PI * 2);
  ctx.fill();
}

function drawOrbit(planet) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 8]);
  ctx.beginPath();
  ctx.arc(cx, cy, planet.orbitRadius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function drawRings(p, px, py, angle) {
  if (!p.rings) return;
  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(angle * 0.3);
  ctx.scale(1, 0.3);
  ctx.strokeStyle = p.ringColor || 'rgba(200,180,120,0.4)';
  ctx.lineWidth = p === PLANETS[5] ? 8 : 4; // Saturn bigger rings
  ctx.beginPath();
  ctx.arc(0, 0, p.radius * 2.2, 0, Math.PI * 2);
  ctx.stroke();
  if (p === PLANETS[5]) { // Saturn extra ring
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'rgba(210,185,120,0.3)';
    ctx.beginPath();
    ctx.arc(0, 0, p.radius * 2.8, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPlanet(p, angle, isHovered) {
  const px = cx + Math.cos(angle) * p.orbitRadius;
  const py = cy + Math.sin(angle) * p.orbitRadius;

  // Rings behind planet
  drawRings(p, px, py, angle);

  // Glow
  const glowSize = isHovered ? p.radius * 3.5 : p.radius * 2.2;
  const glow = ctx.createRadialGradient(px, py, 0, px, py, glowSize);
  glow.addColorStop(0, p.glowColor + '60');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(px, py, glowSize, 0, Math.PI * 2);
  ctx.fill();

  // Planet body gradient
  const grad = ctx.createRadialGradient(px - p.radius * 0.3, py - p.radius * 0.3, 0, px, py, p.radius);
  grad.addColorStop(0, lighten(p.color, 60));
  grad.addColorStop(0.6, p.color);
  grad.addColorStop(1, darken(p.color, 50));
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(px, py, p.radius, 0, Math.PI * 2);
  ctx.fill();

  // Highlight
  if (isHovered) {
    ctx.strokeStyle = p.glowColor;
    ctx.lineWidth = 2;
    ctx.shadowColor = p.glowColor;
    ctx.shadowBlur = 16;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // Earth blue/green details
  if (p.name === 'Earth') {
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#2d8a44';
    ctx.beginPath();
    ctx.ellipse(px + 2, py - 2, p.radius * 0.5, p.radius * 0.3, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Jupiter bands
  if (p.name === 'Jupiter') {
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.strokeStyle = '#8b5e2a';
    ctx.lineWidth = 3;
    for (let b = -1; b <= 1; b++) {
      ctx.beginPath();
      ctx.ellipse(px, py + b * 7, p.radius, 3, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  return { px, py };
}

// ---- COLOR HELPERS ----
function lighten(hex, amount) {
  return adjustColor(hex, amount);
}
function darken(hex, amount) {
  return adjustColor(hex, -amount);
}
function adjustColor(hex, amount) {
  const n = parseInt(hex.replace('#',''), 16);
  const r = Math.min(255, Math.max(0, (n >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((n >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (n & 0xff) + amount));
  return `rgb(${r},${g},${b})`;
}

// ---- MAIN LOOP ----
let lastTime = 0;
function loop(ts) {
  const dt = Math.min((ts - lastTime) / 1000, 0.05);
  lastTime = ts;

  ctx.clearRect(0, 0, W, H);

  // Deep space gradient bg
  const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H));
  bgGrad.addColorStop(0, '#00001a');
  bgGrad.addColorStop(0.5, '#00000f');
  bgGrad.addColorStop(1, '#000005');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  drawStars(ts * 0.001);
  spawnShootingStar();
  drawShootingStars();
  drawSun();

  if (!paused) {
    simTime += dt * simSpeed;
  }

  // Update date display
  const displayDate = new Date(startDate.getTime() + simTime * 86400000);
  document.getElementById('sim-date').textContent =
    displayDate.toISOString().split('T')[0];

  // Draw orbits
  PLANETS.forEach(p => drawOrbit(p));

  // Update angles & draw planets
  const positions = [];
  PLANETS.forEach((p, i) => {
    if (!paused) {
      angles[i] += (p.speed / p.orbitRadius) * simSpeed * dt * 0.5;
    }
    const isHovered = hoveredPlanet === p;
    const { px, py } = drawPlanet(p, angles[i], isHovered);
    positions.push({ px, py, p });
  });

  animId = requestAnimationFrame(loop);
}

// ---- MOUSE INTERACTION ----
const tooltip = document.getElementById('tooltip');

canvas.addEventListener('mousemove', (e) => {
  const mx = e.clientX, my = e.clientY;
  let found = null;

  PLANETS.forEach((p, i) => {
    const px = cx + Math.cos(angles[i]) * p.orbitRadius;
    const py = cy + Math.sin(angles[i]) * p.orbitRadius;
    const dist = Math.hypot(mx - px, my - py);
    if (dist < p.radius + 10) found = p;
  });

  hoveredPlanet = found;
  canvas.style.cursor = found ? 'pointer' : 'crosshair';

  if (found) {
    tooltip.style.display = 'block';
    tooltip.style.left = (mx + 16) + 'px';
    tooltip.style.top = (my - 10) + 'px';
    tooltip.textContent = found.name;
  } else {
    tooltip.style.display = 'none';
  }
});

canvas.addEventListener('click', (e) => {
  if (hoveredPlanet) {
    e.stopPropagation();
    openPanel(hoveredPlanet);
  } else {
    closePanel();
  }
});

// ---- INFO PANEL ----
function openPanel(p) {
  selectedPlanet = p;
  const panel = document.getElementById('info-panel');

  document.getElementById('pi-name').textContent = p.name;
  document.getElementById('pi-type').textContent = p.type;
  document.getElementById('pi-diameter').textContent = p.diameter;
  document.getElementById('pi-mass').textContent = p.mass;
  document.getElementById('pi-period').textContent = p.period + ' Earth days';
  document.getElementById('pi-dist').textContent = p.distance;
  document.getElementById('pi-temp').textContent = p.temp;
  document.getElementById('pi-moons').textContent = p.moons;
  document.getElementById('pi-desc').textContent = p.desc;

  // Glow color
  document.getElementById('panel-glow').style.background = p.glowColor;

  // Mini planet canvas
  const mini = document.getElementById('planet-mini');
  const mctx = mini.getContext('2d');
  mctx.clearRect(0, 0, 80, 80);
  const grad = mctx.createRadialGradient(30, 28, 0, 40, 40, 36);
  grad.addColorStop(0, lighten(p.color, 60));
  grad.addColorStop(0.6, p.color);
  grad.addColorStop(1, darken(p.color, 50));
  mctx.fillStyle = grad;
  mctx.beginPath();
  mctx.arc(40, 40, 34, 0, Math.PI * 2);
  mctx.fill();

  // Rings on mini
  if (p.rings) {
    mctx.save();
    mctx.translate(40, 40);
    mctx.scale(1, 0.3);
    mctx.strokeStyle = p.ringColor || 'rgba(200,180,120,0.5)';
    mctx.lineWidth = 6;
    mctx.beginPath();
    mctx.arc(0, 0, 44, 0, Math.PI * 2);
    mctx.stroke();
    mctx.restore();
  }

  panel.classList.remove('hidden');
}

function closePanel() {
  document.getElementById('info-panel').classList.add('hidden');
  selectedPlanet = null;
}

document.getElementById('close-info').addEventListener('click', (e) => {
  e.stopPropagation();
  closePanel();
});

// ---- CONTROLS ----
const speedSlider = document.getElementById('speed');
const speedVal = document.getElementById('speed-val');

speedSlider.addEventListener('input', () => {
  simSpeed = Math.pow(speedSlider.value / 20, 2) * 1 + 0.1;
  speedVal.textContent = simSpeed.toFixed(1) + '×';
});

document.getElementById('btn-pause').addEventListener('click', (e) => {
  e.stopPropagation();
  paused = !paused;
  document.getElementById('pause-icon').textContent = paused ? '▶' : '⏸';
});

document.getElementById('btn-reset').addEventListener('click', (e) => {
  e.stopPropagation();
  simTime = 0;
  angles = PLANETS.map(() => Math.random() * Math.PI * 2);
  speedSlider.value = 20;
  simSpeed = 1.0;
  speedVal.textContent = '1.0×';
  paused = false;
  document.getElementById('pause-icon').textContent = '⏸';
});

// ---- LEGEND ----
const legendItems = document.getElementById('legend-items');
PLANETS.forEach((p, i) => {
  const item = document.createElement('div');
  item.className = 'legend-item';
  item.innerHTML = `<div class="legend-dot" style="background:${p.color};box-shadow:0 0 6px ${p.glowColor}"></div><span class="legend-label">${p.name}</span>`;
  item.addEventListener('click', (e) => { e.stopPropagation(); openPanel(p); });
  legendItems.appendChild(item);
});

// ---- START ----
window.addEventListener('resize', resize);
resize();
requestAnimationFrame(loop);

console.log('%c☀ COSMOSIM loaded — 8 planets in orbit', 'color:#f5c518;font-family:monospace;font-size:14px');
