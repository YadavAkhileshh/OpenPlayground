























const DATA = {
  tips: [
    "Click anywhere on the canvas to add a new thought node",
    "Drag nodes to rearrange your neural map",
    "Double-click a node to rename it",
    "Watch the particles travel along neural connections!",
    "The human brain makes ~1 million new connections every second",
    "Clear the board and start fresh with the CLEAR button"
  ],
  defaultNodes: [
    { id: 1, label: "IDEAS",  xPct: 50, yPct: 50, color: "#00FFB2" },
    { id: 2, label: "FOCUS",  xPct: 72, yPct: 27, color: "#FF6B35" },
    { id: 3, label: "GOALS",  xPct: 28, yPct: 27, color: "#A855F7" },
    { id: 4, label: "MEMORY", xPct: 70, yPct: 73, color: "#00FFB2" },
    { id: 5, label: "LEARN",  xPct: 30, yPct: 73, color: "#FF6B35" }
  ],
  connections: [
    [1, 2], [1, 3], [1, 4], [1, 5], [2, 4], [3, 5]
  ]
};

const COLORS = ["#00FFB2", "#FF6B35", "#A855F7", "#00D4FF", "#FFD700"];

// ── STATE ────────────────────────────────────────────────────
let nodes       = [];
let connections = [];
let dragging    = null;
let dragOffset  = { x: 0, y: 0 };
let nextId      = 100;
let tipIndex    = 0;
let animTick    = 0;
let renameTarget = null;

// ── DOM REFS ─────────────────────────────────────────────────
const canvas      = document.getElementById("main-canvas");
const ctx         = canvas.getContext("2d");
const renameInput = document.getElementById("rename-input");
const nodeCountEl = document.getElementById("node-count");
const connCountEl = document.getElementById("conn-count");
const tipTextEl   = document.getElementById("tip-text");

// ── RESIZE ───────────────────────────────────────────────────
function resize() {
  const container = document.getElementById("canvas-container");
  canvas.width  = container.offsetWidth;
  canvas.height = container.offsetHeight;
}

// ── INIT NODES FROM DATA ─────────────────────────────────────
function initNodes() {
  nodes = DATA.defaultNodes.map(n => ({
    id:         n.id,
    label:      n.label,
    x:          (n.xPct / 100) * canvas.width,
    y:          (n.yPct / 100) * canvas.height,
    color:      n.color,
    radius:     38,
    pulsePhase: Math.random() * Math.PI * 2
  }));
  connections = DATA.connections.map(c => [...c]);
  updateStats();
}

// ── STATS ────────────────────────────────────────────────────
function updateStats() {
  nodeCountEl.textContent = nodes.length;
  connCountEl.textContent = connections.length;
}

// ── TIPS ROTATION ────────────────────────────────────────────
function rotateTip() {
  tipTextEl.style.opacity = 0;
  setTimeout(() => {
    tipTextEl.textContent = DATA.tips[tipIndex % DATA.tips.length];
    tipTextEl.style.opacity = 1;
    tipIndex++;
  }, 500);
}

// ── DRAW LOOP ────────────────────────────────────────────────
function draw() {
  animTick++;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw connections
  connections.forEach(([aId, bId]) => {
    const A = nodes.find(n => n.id === aId);
    const B = nodes.find(n => n.id === bId);
    if (!A || !B) return;

    const pulse = (Math.sin(animTick * 0.03 + A.pulsePhase) + 1) / 2;

    // Line
    const grad = ctx.createLinearGradient(A.x, A.y, B.x, B.y);
    grad.addColorStop(0, A.color + "70");
    grad.addColorStop(1, B.color + "70");
    ctx.beginPath();
    ctx.moveTo(A.x, A.y);
    ctx.lineTo(B.x, B.y);
    ctx.strokeStyle = grad;
    ctx.lineWidth   = 1 + pulse;
    ctx.shadowColor = A.color;
    ctx.shadowBlur  = 5 * pulse;
    ctx.stroke();
    ctx.shadowBlur  = 0;

    // Traveling particle
    const t  = ((animTick * 0.007 + A.pulsePhase) % 1);
    const px = A.x + (B.x - A.x) * t;
    const py = A.y + (B.y - A.y) * t;
    ctx.beginPath();
    ctx.arc(px, py, 2.5, 0, Math.PI * 2);
    ctx.fillStyle  = "#ffffff";
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur  = 10;
    ctx.fill();
    ctx.shadowBlur  = 0;
  });

  // Draw nodes
  nodes.forEach(node => {
    const pulse = (Math.sin(animTick * 0.04 + node.pulsePhase) + 1) / 2;
    const r     = node.radius + pulse * 5;

    // Glow ring
    ctx.beginPath();
    ctx.arc(node.x, node.y, r + 10, 0, Math.PI * 2);
    ctx.strokeStyle = node.color + "25";
    ctx.lineWidth   = 2;
    ctx.stroke();

    // Fill
    const fill = ctx.createRadialGradient(
      node.x - r * 0.3, node.y - r * 0.3, 0,
      node.x, node.y, r
    );
    fill.addColorStop(0, node.color + "bb");
    fill.addColorStop(1, node.color + "18");
    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
    ctx.fillStyle   = fill;
    ctx.shadowColor = node.color;
    ctx.shadowBlur  = 22 + pulse * 12;
    ctx.fill();
    ctx.shadowBlur  = 0;

    // Border
    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
    ctx.strokeStyle = node.color;
    ctx.lineWidth   = 1.5;
    ctx.stroke();

    // Label
    ctx.fillStyle    = "#ffffff";
    ctx.font         = "bold 11px 'Share Tech Mono', monospace";
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor  = node.color;
    ctx.shadowBlur   = 6;
    ctx.fillText(node.label, node.x, node.y);
    ctx.shadowBlur   = 0;
  });

  requestAnimationFrame(draw);
}

// ── HELPERS ──────────────────────────────────────────────────
function getNodeAt(x, y) {
  return nodes.find(n => Math.hypot(n.x - x, n.y - y) < n.radius + 12);
}

function nearestNode(x, y, exclude) {
  let nearest = null, minDist = Infinity;
  nodes.forEach(n => {
    if (n === exclude) return;
    const d = Math.hypot(n.x - x, n.y - y);
    if (d < minDist) { minDist = d; nearest = n; }
  });
  return nearest;
}

// ── MOUSE EVENTS ─────────────────────────────────────────────
canvas.addEventListener("mousedown", e => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const hit = getNodeAt(x, y);
  if (hit) {
    dragging   = hit;
    dragOffset = { x: x - hit.x, y: y - hit.y };
  }
});

canvas.addEventListener("mousemove", e => {
  if (!dragging) return;
  const rect = canvas.getBoundingClientRect();
  dragging.x = e.clientX - rect.left - dragOffset.x;
  dragging.y = e.clientY - rect.top  - dragOffset.y;
});

canvas.addEventListener("mouseup", () => { dragging = null; });

canvas.addEventListener("click", e => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  if (getNodeAt(x, y)) return;           // clicked existing node — skip

  const color   = COLORS[Math.floor(Math.random() * COLORS.length)];
  const newNode = {
    id: nextId++, label: "NODE",
    x, y, color, radius: 38,
    pulsePhase: Math.random() * Math.PI * 2
  };

  // Auto-connect to nearest
  const nearest = nearestNode(x, y, null);
  if (nearest) connections.push([nearest.id, newNode.id]);

  nodes.push(newNode);
  updateStats();
});

canvas.addEventListener("dblclick", e => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const hit = getNodeAt(x, y);
  if (!hit) return;

  renameTarget = hit;
  renameInput.style.display = "block";
  renameInput.style.left    = (e.clientX - 60) + "px";
  renameInput.style.top     = (e.clientY - 18) + "px";
  renameInput.value         = hit.label;
  renameInput.focus();
  renameInput.select();
});

renameInput.addEventListener("keydown", e => {
  if (e.key === "Enter" || e.key === "Escape") {
    if (e.key === "Enter" && renameTarget && renameInput.value.trim()) {
      renameTarget.label = renameInput.value.trim().toUpperCase();
    }
    renameInput.style.display = "none";
    renameTarget = null;
  }
});

// ── CLEAR BUTTON ─────────────────────────────────────────────
document.getElementById("btn-clear").addEventListener("click", () => {
  nodes       = [];
  connections = [];
  nextId      = 100;
  updateStats();
});

// ── TOUCH SUPPORT ────────────────────────────────────────────
canvas.addEventListener("touchstart", e => {
  e.preventDefault();
  const t    = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const x    = t.clientX - rect.left;
  const y    = t.clientY - rect.top;
  const hit  = getNodeAt(x, y);
  if (hit) { dragging = hit; dragOffset = { x: x - hit.x, y: y - hit.y }; }
}, { passive: false });

canvas.addEventListener("touchmove", e => {
  e.preventDefault();
  if (!dragging) return;
  const t    = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  dragging.x = t.clientX - rect.left - dragOffset.x;
  dragging.y = t.clientY - rect.top  - dragOffset.y;
}, { passive: false });

canvas.addEventListener("touchend", () => { dragging = null; });

// ── START ────────────────────────────────────────────────────
window.addEventListener("resize", () => {
  resize();
  // Re-scale node positions proportionally on resize
  nodes.forEach(n => {
    n.x = Math.max(50, Math.min(canvas.width  - 50, n.x));
    n.y = Math.max(50, Math.min(canvas.height - 50, n.y));
  });
});




































resize();
initNodes();
rotateTip();
setInterval(rotateTip, 4500);
draw();
