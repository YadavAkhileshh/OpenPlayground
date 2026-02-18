
// VOID WEAVER — Cosmic Beam Puzzle Engine


const CELL = 72;

const LEVELS = [
  {
    cols: 8, rows: 6,
    emitters: [{ x: 0, y: 2, dir: 'R', colorIdx: 0 }],
    crystals: [{ x: 7, y: 2 }],
    walls: [], splitters: [], fixedMirrors: [],
    maxMirrors: 3, hint: 'Guide the beam straight to the crystal. Left-click to place a mirror.'
  },
  {
    cols: 8, rows: 7,
    emitters: [
      { x: 0, y: 1, dir: 'R', colorIdx: 0 },
      { x: 0, y: 5, dir: 'R', colorIdx: 1 }
    ],
    crystals: [{ x: 7, y: 5 }, { x: 7, y: 1 }],
    walls: [{ x: 4, y: 3 }], splitters: [], fixedMirrors: [],
    maxMirrors: 4, hint: 'Two beams, two crystals. Click again to toggle mirror angle.'
  },
  {
    cols: 9, rows: 7,
    emitters: [{ x: 0, y: 3, dir: 'R', colorIdx: 2 }],
    crystals: [{ x: 8, y: 3 }, { x: 4, y: 0 }, { x: 4, y: 6 }],
    walls: [],
    splitters: [{ x: 4, y: 3, axis: 'H' }],
    fixedMirrors: [],
    maxMirrors: 4, hint: 'The splitter divides the beam into two. Energize all crystals.'
  },
  {
    cols: 9, rows: 8,
    emitters: [
      { x: 0, y: 0, dir: 'R', colorIdx: 3 },
      { x: 0, y: 7, dir: 'R', colorIdx: 0 }
    ],
    crystals: [{ x: 8, y: 7 }, { x: 8, y: 0 }, { x: 4, y: 4 }],
    walls: [
      { x: 2, y: 3 }, { x: 2, y: 4 }, { x: 2, y: 5 },
      { x: 6, y: 2 }, { x: 6, y: 3 }, { x: 6, y: 4 }
    ],
    splitters: [{ x: 4, y: 0, axis: 'V' }],
    fixedMirrors: [],
    maxMirrors: 5, hint: 'Walls block beams — find the corridors.'
  },
  {
    cols: 10, rows: 9,
    emitters: [
      { x: 0, y: 0, dir: 'R', colorIdx: 0 },
      { x: 0, y: 8, dir: 'R', colorIdx: 1 },
      { x: 9, y: 4, dir: 'L', colorIdx: 2 }
    ],
    crystals: [
      { x: 9, y: 0 }, { x: 9, y: 8 },
      { x: 0, y: 4 }, { x: 5, y: 2 }, { x: 5, y: 6 }
    ],
    walls: [
      { x: 3, y: 3 }, { x: 3, y: 5 },
      { x: 7, y: 3 }, { x: 7, y: 5 }, { x: 5, y: 4 }
    ],
    splitters: [{ x: 2, y: 4, axis: 'H' }, { x: 7, y: 4, axis: 'V' }],
    fixedMirrors: [],
    maxMirrors: 6, hint: 'Three sources, five targets. The void tests your mastery.'
  }
];

const BEAM_COLORS = ['#00d4ff', '#bf00ff', '#00ff88', '#ff8800', '#ff3355', '#ffcc00'];

let currentLevel = 0;
let level = null;
let grid = [];
let beamSegments = [];
let activeCrystals = new Set();
let won = false;
let canvas, ctx;
let animFrame = 0;

function init() {
  canvas = document.getElementById('game-canvas');
  ctx = canvas.getContext('2d');

  canvas.addEventListener('click', onLeftClick);
  canvas.addEventListener('contextmenu', onRightClick);
  document.addEventListener('keydown', onKey);
  document.getElementById('reset-btn').addEventListener('click', resetLevel);
  document.getElementById('next-btn').addEventListener('click', nextLevel);

  loadLevel(0);
  requestAnimationFrame(gameLoop);
}

function loadLevel(idx) {
  if (idx >= LEVELS.length) idx = 0;
  currentLevel = idx;
  level = LEVELS[idx];
  won = false;

  canvas.width = level.cols * CELL;
  canvas.height = level.rows * CELL;

  grid = Array.from({ length: level.rows }, () => new Array(level.cols).fill(null));
  for (const fm of level.fixedMirrors) grid[fm.y][fm.x] = { type: fm.type, fixed: true };

  document.getElementById('win-overlay').classList.remove('visible');
  document.getElementById('level-info').textContent = `LEVEL ${idx + 1} / ${LEVELS.length}`;
  document.getElementById('hint-text').textContent = level.hint;

  computeBeams();
  updateStatus();
}

function resetLevel() { loadLevel(currentLevel); }
function nextLevel() { loadLevel(currentLevel + 1); }

// ---- Input ----
function cellFromEvent(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: Math.floor((e.clientX - rect.left) * scaleX / CELL),
    y: Math.floor((e.clientY - rect.top) * scaleY / CELL)
  };
}

function isOccupied(x, y) {
  if (level.emitters.some(e => e.x === x && e.y === y)) return true;
  if (level.crystals.some(c => c.x === x && c.y === y)) return true;
  if (level.walls.some(w => w.x === x && w.y === y)) return true;
  if (level.splitters.some(s => s.x === x && s.y === y)) return true;
  return false;
}

function countPlacedMirrors() {
  let count = 0;
  for (let r = 0; r < level.rows; r++)
    for (let c = 0; c < level.cols; c++)
      if (grid[r][c] && !grid[r][c].fixed) count++;
  return count;
}

function onLeftClick(e) {
  e.preventDefault();
  if (won) return;
  const { x, y } = cellFromEvent(e);
  if (x < 0 || y < 0 || x >= level.cols || y >= level.rows) return;
  if (isOccupied(x, y)) return;

  const cell = grid[y][x];
  if (cell && cell.fixed) return;

  if (!cell) {
    if (countPlacedMirrors() >= level.maxMirrors) {
      showTooltip('NO MIRRORS REMAINING');
      return;
    }
    grid[y][x] = { type: '/', fixed: false };
  } else if (cell.type === '/') {
    grid[y][x] = { type: '\\', fixed: false };
  } else {
    grid[y][x] = null;
  }

  computeBeams();
  updateStatus();
}

function onRightClick(e) {
  e.preventDefault();
  if (won) return;
  const { x, y } = cellFromEvent(e);
  if (x < 0 || y < 0 || x >= level.cols || y >= level.rows) return;
  const cell = grid[y][x];
  if (cell && !cell.fixed) {
    grid[y][x] = null;
    computeBeams();
    updateStatus();
  }
}

function onKey(e) {
  if (e.key === 'r' || e.key === 'R') resetLevel();
  if ((e.key === 'n' || e.key === 'N') && won) nextLevel();
}

// ---- Beam Simulation ----
const DIRS = {
  R: { dx: 1, dy: 0 },
  L: { dx: -1, dy: 0 },
  U: { dx: 0, dy: -1 },
  D: { dx: 0, dy: 1 }
};

function reflectMirror(dir, mirrorType) {
  const reflections = {
    '/': { R: 'U', L: 'D', U: 'R', D: 'L' },
    '\\': { R: 'D', L: 'U', U: 'L', D: 'R' }
  };
  return reflections[mirrorType][dir];
}

function computeBeams() {
  beamSegments = [];
  activeCrystals = new Set();

  for (const emitter of level.emitters) {
    const color = BEAM_COLORS[emitter.colorIdx];
    traceBeam(emitter.x, emitter.y, emitter.dir, color, new Set());
  }

  // Check win
  if (level.crystals.length > 0 && activeCrystals.size === level.crystals.length) {
    if (!won) triggerWin();
  }
}

function traceBeam(startX, startY, dir, color, visited, depth = 0) {
  if (depth > 500) return;

  let x = startX;
  let y = startY;
  const { dx, dy } = DIRS[dir];
  let segStart = { x: x + 0.5, y: y + 0.5 };

  // Move off emitter first
  x += dx; y += dy;

  while (x >= 0 && y >= 0 && x < level.cols && y < level.rows) {
    const key = `${x},${y},${dir}`;
    if (visited.has(key)) break;
    visited.add(key);

    // Check wall
    if (level.walls.some(w => w.x === x && w.y === y)) {
      // End segment at wall face
      beamSegments.push({ x1: segStart.x, y1: segStart.y, x2: x + 0.5 - dx * 0.5, y2: y + 0.5 - dy * 0.5, color });
      return;
    }

    // Check crystal
    const crystalIdx = level.crystals.findIndex(c => c.x === x && c.y === y);
    if (crystalIdx >= 0) {
      activeCrystals.add(crystalIdx);
    }

    // Check splitter
    const splitter = level.splitters.find(s => s.x === x && s.y === y);
    if (splitter) {
      beamSegments.push({ x1: segStart.x, y1: segStart.y, x2: x + 0.5, y2: y + 0.5, color });
      // Split into two perpendicular directions
      let dirs = splitter.axis === 'H' ? ['U', 'D'] : ['L', 'R'];
      // Only split if beam is perpendicular to the axis
      const horizontal = dir === 'L' || dir === 'R';
      const splitNeeded = (splitter.axis === 'H' && horizontal) || (splitter.axis === 'V' && !horizontal);
      if (splitNeeded) {
        for (const d of dirs) traceBeam(x, y, d, color, new Set(visited), depth + 1);
      } else {
        // Pass through
        x += dx; y += dy;
        continue;
      }
      return;
    }

    // Check mirror
    const cell = grid[y][x];
    if (cell) {
      beamSegments.push({ x1: segStart.x, y1: segStart.y, x2: x + 0.5, y2: y + 0.5, color });
      dir = reflectMirror(dir, cell.type);
      segStart = { x: x + 0.5, y: y + 0.5 };
      const d = DIRS[dir];
      x += d.dx; y += d.dy;
      continue;
    }

    x += dx; y += dy;
  }

  // Beam exited grid
  const exitX = x - dx;
  const exitY = y - dy;
  beamSegments.push({ x1: segStart.x, y1: segStart.y, x2: exitX + 0.5 + dx * 0.5, y2: exitY + 0.5 + dy * 0.5, color });
}

// ---- Trigger Win ----
function triggerWin() {
  won = true;
  setTimeout(() => {
    document.getElementById('win-overlay').classList.add('visible');
  }, 600);
}

// ---- Status UI ----
function updateStatus() {
  const pipsContainer = document.getElementById('crystal-pips');
  pipsContainer.innerHTML = '';
  level.crystals.forEach((_, i) => {
    const pip = document.createElement('div');
    pip.className = 'crystal-pip' + (activeCrystals.has(i) ? ' active' : '');
    pipsContainer.appendChild(pip);
  });

  const used = countPlacedMirrors();
  document.getElementById('mirror-count').textContent = `MIRRORS: ${used} / ${level.maxMirrors}`;
}

// ---- Rendering ----
let tick = 0;

function gameLoop() {
  tick++;
  draw();
  requestAnimationFrame(gameLoop);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawGrid();
  drawBeams();
  drawWalls();
  drawSplitters();
  drawCrystals();
  drawEmitters();
  drawMirrors();
}

function drawGrid() {
  ctx.strokeStyle = 'rgba(13, 32, 64, 0.6)';
  ctx.lineWidth = 1;
  for (let r = 0; r <= level.rows; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * CELL);
    ctx.lineTo(level.cols * CELL, r * CELL);
    ctx.stroke();
  }
  for (let c = 0; c <= level.cols; c++) {
    ctx.beginPath();
    ctx.moveTo(c * CELL, 0);
    ctx.lineTo(c * CELL, level.rows * CELL);
    ctx.stroke();
  }
  // Subtle cell dots
  ctx.fillStyle = 'rgba(0,80,120,0.3)';
  for (let r = 0; r < level.rows; r++) {
    for (let c = 0; c < level.cols; c++) {
      ctx.beginPath();
      ctx.arc(c * CELL + CELL / 2, r * CELL + CELL / 2, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawBeams() {
  const pulse = 0.7 + 0.3 * Math.sin(tick * 0.08);
  for (const seg of beamSegments) {
    const x1 = seg.x1 * CELL;
    const y1 = seg.y1 * CELL;
    const x2 = seg.x2 * CELL;
    const y2 = seg.y2 * CELL;

    // Outer glow
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = seg.color;
    ctx.lineWidth = 14;
    ctx.globalAlpha = 0.06 * pulse;
    ctx.stroke();

    // Mid glow
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = 6;
    ctx.globalAlpha = 0.18 * pulse;
    ctx.stroke();

    // Core
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.95;
    ctx.stroke();

    ctx.globalAlpha = 1;
  }
}

function drawWalls() {
  for (const w of level.walls) {
    const x = w.x * CELL;
    const y = w.y * CELL;
    ctx.fillStyle = '#0a1628';
    ctx.fillRect(x + 2, y + 2, CELL - 4, CELL - 4);
    ctx.strokeStyle = '#0d2040';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 2, y + 2, CELL - 4, CELL - 4);
    // Inner pattern
    ctx.strokeStyle = 'rgba(13,32,64,0.8)';
    ctx.lineWidth = 0.5;
    for (let i = 12; i < CELL - 4; i += 12) {
      ctx.beginPath();
      ctx.moveTo(x + 2, y + 2 + i);
      ctx.lineTo(x + CELL - 2, y + 2 + i);
      ctx.stroke();
    }
  }
}

function drawSplitters() {
  for (const s of level.splitters) {
    const cx = s.x * CELL + CELL / 2;
    const cy = s.y * CELL + CELL / 2;
    const r = CELL * 0.3;

    ctx.strokeStyle = '#ffcc00';
    ctx.lineWidth = 2;

    // Draw split symbol
    if (s.axis === 'H') {
      // vertical beam passes through, horizontal beam splits to U/D
      ctx.beginPath();
      ctx.moveTo(cx - r, cy);
      ctx.lineTo(cx + r, cy);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx, cy + r);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(cx - r, cy);
      ctx.lineTo(cx + r, cy);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx, cy + r);
      ctx.stroke();
    }

    // Diamond
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + r, cy);
    ctx.lineTo(cx, cy + r);
    ctx.lineTo(cx - r, cy);
    ctx.closePath();
    ctx.strokeStyle = 'rgba(255,204,0,0.6)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,204,0,0.05)';
    ctx.fill();

    // Label
    ctx.fillStyle = 'rgba(255,204,0,0.5)';
    ctx.font = `${CELL * 0.15}px Orbitron, monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SPLIT', cx, cy);
  }
}

function drawCrystals() {
  const pulse = 0.6 + 0.4 * Math.sin(tick * 0.06);
  level.crystals.forEach((c, i) => {
    const cx = c.x * CELL + CELL / 2;
    const cy = c.y * CELL + CELL / 2;
    const active = activeCrystals.has(i);
    const r = CELL * 0.28;

    if (active) {
      // Glow
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 2.5);
      grad.addColorStop(0, 'rgba(0,255,204,0.4)');
      grad.addColorStop(1, 'rgba(0,255,204,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, r * 2.5 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }

    // Crystal hexagon
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 6;
      const px = cx + r * Math.cos(angle);
      const py = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();

    if (active) {
      ctx.fillStyle = 'rgba(0,255,204,0.2)';
      ctx.strokeStyle = '#00ffcc';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#00ffcc';
      ctx.shadowBlur = 20;
    } else {
      ctx.fillStyle = 'rgba(0,80,60,0.1)';
      ctx.strokeStyle = 'rgba(0,180,140,0.4)';
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 0;
    }
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Inner gem lines
    ctx.strokeStyle = active ? 'rgba(0,255,204,0.5)' : 'rgba(0,180,140,0.15)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx, cy + r);
    ctx.moveTo(cx - r * 0.86, cy - r * 0.5);
    ctx.lineTo(cx + r * 0.86, cy + r * 0.5);
    ctx.moveTo(cx - r * 0.86, cy + r * 0.5);
    ctx.lineTo(cx + r * 0.86, cy - r * 0.5);
    ctx.stroke();
  });
}

function drawEmitters() {
  for (const e of level.emitters) {
    const cx = e.x * CELL + CELL / 2;
    const cy = e.y * CELL + CELL / 2;
    const color = BEAM_COLORS[e.colorIdx];
    const pulse = 0.7 + 0.3 * Math.sin(tick * 0.1 + e.colorIdx);

    // Glow
    ctx.beginPath();
    ctx.arc(cx, cy, CELL * 0.3 * pulse, 0, Math.PI * 2);
    ctx.fillStyle = color.replace(')', ', 0.08)').replace('rgb', 'rgba');
    ctx.fill();

    // Body
    ctx.beginPath();
    ctx.arc(cx, cy, CELL * 0.22, 0, Math.PI * 2);
    ctx.fillStyle = '#050d15';
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Direction arrow
    const arrowLen = CELL * 0.14;
    const { dx, dy } = { R: { dx: 1, dy: 0 }, L: { dx: -1, dy: 0 }, U: { dx: 0, dy: -1 }, D: { dx: 0, dy: 1 } }[e.dir];
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx + dx * arrowLen, cy + dy * arrowLen);
    ctx.lineTo(cx + dx * arrowLen - dy * 5 - dx * 8, cy + dy * arrowLen - dx * 5 - dy * 8);
    ctx.lineTo(cx + dx * arrowLen + dy * 5 - dx * 8, cy + dy * arrowLen + dx * 5 - dy * 8);
    ctx.closePath();
    ctx.fill();

    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }
}

function drawMirrors() {
  for (let r = 0; r < level.rows; r++) {
    for (let c = 0; c < level.cols; c++) {
      const cell = grid[r][c];
      if (!cell) continue;
      const x = c * CELL;
      const y = r * CELL;
      const pad = CELL * 0.15;

      ctx.strokeStyle = cell.fixed ? '#5599bb' : '#c8e8ff';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#c8e8ff';
      ctx.shadowBlur = 8;

      ctx.beginPath();
      if (cell.type === '/') {
        ctx.moveTo(x + CELL - pad, y + pad);
        ctx.lineTo(x + pad, y + CELL - pad);
      } else {
        ctx.moveTo(x + pad, y + pad);
        ctx.lineTo(x + CELL - pad, y + CELL - pad);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // End caps
      ctx.fillStyle = cell.fixed ? '#5599bb' : '#c8e8ff';
      if (cell.type === '/') {
        ctx.beginPath();
        ctx.arc(x + CELL - pad, y + pad, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + pad, y + CELL - pad, 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(x + pad, y + pad, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + CELL - pad, y + CELL - pad, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      if (cell.fixed) {
        ctx.fillStyle = 'rgba(100,150,180,0.3)';
        ctx.font = '9px Share Tech Mono, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('FIXED', x + CELL / 2, y + CELL / 2 + 14);
      }
    }
  }
}

// ---- Tooltip ----
let tooltipTimer = null;
function showTooltip(msg, duration = 1800) {
  const el = document.getElementById('tooltip');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(tooltipTimer);
  tooltipTimer = setTimeout(() => el.classList.remove('show'), duration);
}

// ---- Boot ----
window.addEventListener('DOMContentLoaded', init);
