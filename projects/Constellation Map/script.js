// script.js — Constellation Map Main Logic

const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

let W, H;
let stars = []; // { x, y, size, color }
let lines = []; // [idxA, idxB]
let labels = []; // { x, y, text }
let bgStars = [];
let tool = CONFIG.DEFAULT_TOOL;
let starSize = CONFIG.DEFAULT_STAR_SIZE;
let starColor = CONFIG.STAR_COLORS[0];
let lineStart = null;
let pendingLabel = null;
let frame = 0;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
  bgStars = Array.from({ length: CONFIG.BACKGROUND_STARS }, () =>
    Utils.randomBgStar(W, H),
  );
}
resize();
window.addEventListener("resize", resize);

function init() {
  const saved = Utils.load();
  if (saved) {
    stars = saved.stars || [];
    lines = saved.lines || [];
    labels = saved.labels || [];
  }
  buildColorSwatches();
  loop();
}

function buildColorSwatches() {
  const el = document.getElementById("colorSwatches");
  CONFIG.STAR_COLORS.forEach((c) => {
    const sw = document.createElement("div");
    sw.className = "color-swatch" + (c === starColor ? " selected" : "");
    sw.style.background = c;
    sw.addEventListener("click", () => {
      starColor = c;
      document
        .querySelectorAll(".color-swatch")
        .forEach((s) => s.classList.remove("selected"));
      sw.classList.add("selected");
    });
    el.appendChild(sw);
  });
}

// ── Draw ─────────────────────────────────────────────

function loop() {
  requestAnimationFrame(loop);
  frame++;
  ctx.fillStyle = "#020510";
  ctx.fillRect(0, 0, W, H);

  // Background stars
  bgStars.forEach((s) => {
    const alpha = s.alpha + Math.sin(frame * s.speed + s.phase) * 0.15;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${Math.max(0, alpha)})`;
    ctx.fill();
  });

  // User lines
  ctx.strokeStyle = CONFIG.LINE_COLOR;
  ctx.lineWidth = CONFIG.LINE_WIDTH;
  lines.forEach(([a, b]) => {
    const sa = stars[a],
      sb = stars[b];
    if (!sa || !sb) return;
    ctx.beginPath();
    ctx.moveTo(sa.x, sa.y);
    ctx.lineTo(sb.x, sb.y);
    ctx.stroke();
  });

  // User stars
  stars.forEach((s, i) => {
    const pulse = s.size + Math.sin(frame * 0.04 + i) * 0.4;
    ctx.beginPath();
    ctx.arc(s.x, s.y, pulse, 0, Math.PI * 2);
    ctx.fillStyle = s.color;
    ctx.shadowColor = s.color;
    ctx.shadowBlur = pulse * 4;
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  // Labels
  ctx.font = 'italic 11px "Cormorant Garamond", serif';
  ctx.fillStyle = "rgba(200,220,255,0.75)";
  labels.forEach((lb) => {
    ctx.fillText(lb.text, lb.x, lb.y);
  });

  // Line-in-progress
  if (tool === "line" && lineStart !== null && mousePos) {
    const s = stars[lineStart];
    ctx.strokeStyle = "rgba(180,210,255,0.3)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(mousePos.x, mousePos.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

// ── Interaction ───────────────────────────────────────

let mousePos = null;
canvas.addEventListener("mousemove", (e) => {
  mousePos = { x: e.clientX, y: e.clientY };
});

canvas.addEventListener("click", (e) => {
  const x = e.clientX,
    y = e.clientY;
  if (tool === "star") {
    stars.push({ x, y, size: CONFIG.STAR_SIZES[starSize], color: starColor });
    Utils.save(stars, lines, labels);
  } else if (tool === "line") {
    const idx = Utils.nearestStar(stars, x, y, 25);
    if (idx === null) return;
    if (lineStart === null) {
      lineStart = idx;
      setHint("Click another star to connect");
    } else {
      if (idx !== lineStart) {
        lines.push([lineStart, idx]);
        Utils.save(stars, lines, labels);
      }
      lineStart = null;
      setHint("Click a star to start a line");
    }
  } else if (tool === "label") {
    pendingLabel = { x, y: y - 10 };
    const popup = document.getElementById("labelPopup");
    popup.hidden = false;
    popup.style.left = x + 20 + "px";
    popup.style.top = y - 20 + "px";
    popup.style.transform = "none";
    document.getElementById("labelInput").focus();
  } else if (tool === "erase") {
    // Remove nearest star
    const idx = Utils.nearestStar(stars, x, y, 20);
    if (idx !== null) {
      stars.splice(idx, 1);
      lines = lines
        .filter(([a, b]) => a !== idx && b !== idx)
        .map(([a, b]) => [a > idx ? a - 1 : a, b > idx ? b - 1 : b]);
      Utils.save(stars, lines, labels);
    }
  }
});

document.getElementById("labelConfirm").addEventListener("click", () => {
  const text = document.getElementById("labelInput").value.trim();
  if (text && pendingLabel) {
    labels.push({ ...pendingLabel, text });
    Utils.save(stars, lines, labels);
  }
  document.getElementById("labelPopup").hidden = true;
  document.getElementById("labelInput").value = "";
  pendingLabel = null;
});
document.getElementById("labelInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("labelConfirm").click();
  if (e.key === "Escape") {
    document.getElementById("labelPopup").hidden = true;
    pendingLabel = null;
  }
});

// Tool buttons
document.querySelectorAll(".tool-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    tool = btn.dataset.tool;
    lineStart = null;
    document
      .querySelectorAll(".tool-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const hints = {
      star: "Click to place a star",
      line: "Click a star to start a line",
      label: "Click to place a label",
      erase: "Click a star to erase it",
    };
    setHint(hints[tool]);
    document.getElementById("starOptions").style.display =
      tool === "star" ? "flex" : "none";
  });
});

document.querySelectorAll(".size-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    starSize = btn.dataset.size;
    document
      .querySelectorAll(".size-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

document.getElementById("clearBtn").addEventListener("click", () => {
  if (confirm("Clear entire star map?")) {
    stars = [];
    lines = [];
    labels = [];
    Utils.save(stars, lines, labels);
  }
});

document.getElementById("exportBtn").addEventListener("click", () => {
  Utils.exportSVG(canvas, stars, lines, labels, bgStars);
});

document.getElementById("presetBtn").addEventListener("click", () => {
  const p = CONFIG.CONSTELLATIONS_PRESET[0];
  const offset = stars.length;
  p.stars.forEach((s) =>
    stars.push({
      x: s.x * W,
      y: s.y * H,
      size: CONFIG.STAR_SIZES.medium,
      color: "#ffffff",
    }),
  );
  p.lines.forEach(([a, b]) => lines.push([a + offset, b + offset]));
  labels.push({ x: p.labelPos.x * W, y: p.labelPos.y * H, text: p.name });
  Utils.save(stars, lines, labels);
});

function setHint(text) {
  document.getElementById("hint").textContent = text;
}

init();
