const AREAS = [
  { key:"health",    label:"Health",      emoji:"💪", color:"#43d98c", tip:"Exercise, sleep, and nutrition define your physical foundation." },
  { key:"career",    label:"Career",      emoji:"💼", color:"#5c6ef8", tip:"Growth, satisfaction, and impact in your professional life." },
  { key:"finance",   label:"Finance",     emoji:"💰", color:"#f9c74f", tip:"Financial security, savings, and smart money habits." },
  { key:"family",    label:"Family",      emoji:"🏠", color:"#f85c8a", tip:"Quality time and deep bonds with your loved ones." },
  { key:"social",    label:"Social",      emoji:"🤝", color:"#4cc9f0", tip:"Friendships, community, and meaningful connections." },
  { key:"growth",    label:"Growth",      emoji:"🌱", color:"#a8ff78", tip:"Learning, skills, and becoming a better version of yourself." },
  { key:"fun",       label:"Fun",         emoji:"🎉", color:"#ff9f43", tip:"Joy, hobbies, and activities that light you up." },
  { key:"mindful",   label:"Mindfulness", emoji:"🧘", color:"#c77dff", tip:"Inner peace, stress management, and self-awareness." },
];

const TIPS = {
  health:   ["Start with 10 min walks daily","Sleep 7-8 hours consistently","Drink 2L of water every day"],
  career:   ["Set one clear goal for this week","Learn one new skill this month","Ask for feedback from a mentor"],
  finance:  ["Track every expense for 30 days","Build a 3-month emergency fund","Automate at least one saving"],
  family:   ["Schedule a weekly family dinner","Put your phone away during quality time","Write a message to someone you miss"],
  social:   ["Reach out to one old friend this week","Join a club or community","Be the first to check in on someone"],
  growth:   ["Read 10 pages a day","Take one free online course","Journal your progress weekly"],
  fun:      ["Block 1 hour per week just for yourself","Try one new hobby this month","Plan a fun outing, even solo"],
  mindful:  ["Try 5 min of morning meditation","Write 3 gratitudes each night","Take 3 deep breaths before reacting"],
};

let scores = JSON.parse(localStorage.getItem("lw_scores") || "{}");
let history = JSON.parse(localStorage.getItem("lw_history") || "[]");

AREAS.forEach(a => { if (!scores[a.key]) scores[a.key] = 5; });

const canvas = document.getElementById("wheelCanvas");
const ctx = canvas.getContext("2d");
const cx = canvas.width / 2;
const cy = canvas.height / 2;
const maxR = 170;
const minR = 20;

function drawWheel() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const n = AREAS.length;
  const angleStep = (Math.PI * 2) / n;

  for (let ring = 1; ring <= 10; ring++) {
    const r = minR + ((maxR - minR) / 10) * ring;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = ring % 2 === 0 ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  AREAS.forEach((area, i) => {
    const startAngle = -Math.PI / 2 + i * angleStep;
    const endAngle = startAngle + angleStep;
    const val = scores[area.key] || 1;
    const r = minR + ((maxR - minR) / 10) * val;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = area.color + "33";
    ctx.fill();
    ctx.strokeStyle = area.color;
    ctx.lineWidth = 2;
    ctx.stroke();

    const midAngle = startAngle + angleStep / 2;
    const labelR = maxR + 22;
    const lx = cx + Math.cos(midAngle) * labelR;
    const ly = cy + Math.sin(midAngle) * labelR;

    ctx.save();
    ctx.translate(lx, ly);
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(area.emoji, 0, 0);
    ctx.restore();

    const divAngle = -Math.PI / 2 + i * angleStep;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(divAngle) * maxR, cy + Math.sin(divAngle) * maxR);
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  const points = AREAS.map((area, i) => {
    const angle = -Math.PI / 2 + i * (Math.PI * 2 / n) + (Math.PI * 2 / n) / 2;
    const val = scores[area.key] || 1;
    const r = minR + ((maxR - minR) / 10) * val;
    return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r];
  });

  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  points.forEach(p => ctx.lineTo(p[0], p[1]));
  ctx.closePath();
  ctx.strokeStyle = "rgba(255,255,255,0.5)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  ctx.fill();

  points.forEach(p => {
    ctx.beginPath();
    ctx.arc(p[0], p[1], 4, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
  });

  const avg = getAvg();
  document.getElementById("centerScore").textContent = avg.toFixed(1);
  document.getElementById("overallScore").textContent = avg.toFixed(1);

  positionCenter();
}

function positionCenter() {
  const wrap = document.querySelector(".wheel-section");
  const centerEl = document.getElementById("wheelCenter");
  const rect = canvas.getBoundingClientRect();
  const wrapRect = wrap.getBoundingClientRect();
  centerEl.style.position = "absolute";
  centerEl.style.top = (canvas.offsetTop + cx) + "px";
  centerEl.style.left = cx + "px";
  centerEl.style.transform = "translate(-50%, -50%)";
}

function getAvg() {
  const vals = AREAS.map(a => scores[a.key] || 1);
  return vals.reduce((s, v) => s + v, 0) / vals.length;
}

function buildSliders() {
  const list = document.getElementById("slidersList");
  list.innerHTML = "";
  AREAS.forEach(area => {
    const val = scores[area.key] || 5;
    const row = document.createElement("div");
    row.className = "slider-row";
    row.innerHTML = `
      <div class="slider-top">
        <div class="slider-label">
          <span class="slider-emoji">${area.emoji}</span>
          <span>${area.label}</span>
        </div>
        <span class="slider-value" id="val-${area.key}" style="color:${area.color}">${val}</span>
      </div>
      <input type="range" min="1" max="10" value="${val}" id="range-${area.key}"
        style="background: linear-gradient(to right, ${area.color} 0%, ${area.color} ${(val-1)/9*100}%, rgba(255,255,255,0.1) ${(val-1)/9*100}%, rgba(255,255,255,0.1) 100%);"
      />
    `;
    const input = row.querySelector("input");
    input.style.setProperty("--thumb-color", area.color);
    input.addEventListener("input", e => {
      const v = parseInt(e.target.value);
      scores[area.key] = v;
      document.getElementById("val-" + area.key).textContent = v;
      const pct = (v - 1) / 9 * 100;
      e.target.style.background = `linear-gradient(to right, ${area.color} 0%, ${area.color} ${pct}%, rgba(255,255,255,0.1) ${pct}%, rgba(255,255,255,0.1) 100%)`;
      drawWheel();
      buildInsights();
    });
    list.appendChild(row);
  });

  AREAS.forEach(area => {
    const thumb = document.querySelector(`#range-${area.key}::-webkit-slider-thumb`);
    const style = document.createElement("style");
    style.textContent = `#range-${area.key}::-webkit-slider-thumb { background: ${area.color}; }`;
    document.head.appendChild(style);
  });
}

function buildInsights() {
  const grid = document.getElementById("insightsGrid");
  grid.innerHTML = "";

  const sorted = [...AREAS].sort((a, b) => scores[b.key] - scores[a.key]);
  const top = sorted.slice(0, 2);
  const bottom = sorted.slice(-2).reverse();
  const avg = getAvg();

  top.forEach(area => {
    const card = document.createElement("div");
    card.className = "insight-card strength";
    card.innerHTML = `
      <div class="insight-tag">✦ STRENGTH</div>
      <div class="insight-title">${area.emoji} ${area.label} — ${scores[area.key]}/10</div>
      <div class="insight-text">${area.tip}</div>
    `;
    grid.appendChild(card);
  });

  bottom.forEach(area => {
    const tips = TIPS[area.key];
    const tip = tips[Math.floor(Math.random() * tips.length)];
    const card = document.createElement("div");
    card.className = "insight-card weakness";
    card.innerHTML = `
      <div class="insight-tag">▲ NEEDS ATTENTION</div>
      <div class="insight-title">${area.emoji} ${area.label} — ${scores[area.key]}/10</div>
      <div class="insight-text">Tip: ${tip}</div>
    `;
    grid.appendChild(card);
  });

  const neutral = document.createElement("div");
  neutral.className = "insight-card neutral";
  neutral.innerHTML = `
    <div class="insight-tag">◉ OVERALL BALANCE</div>
    <div class="insight-title">Average Score: ${avg.toFixed(1)} / 10</div>
    <div class="insight-text">${avg >= 7 ? "You're living a well-balanced life. Keep it up!" : avg >= 5 ? "Your life is fairly balanced with room for improvement." : "Several areas need your attention. Start with one small change."}</div>
  `;
  grid.appendChild(neutral);
}

document.getElementById("saveWeekBtn").addEventListener("click", () => {
  const entry = {
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    scores: { ...scores },
    avg: getAvg()
  };
  history.unshift(entry);
  if (history.length > 12) history.pop();
  localStorage.setItem("lw_history", JSON.stringify(history));
  localStorage.setItem("lw_scores", JSON.stringify(scores));

  const btn = document.getElementById("saveWeekBtn");
  btn.textContent = "✓ Saved!";
  setTimeout(() => btn.textContent = "💾 Save Week", 1500);
});

document.getElementById("resetBtn").addEventListener("click", () => {
  if (confirm("Reset all scores to 5?")) {
    AREAS.forEach(a => scores[a.key] = 5);
    buildSliders();
    drawWheel();
    buildInsights();
  }
});

document.getElementById("historyBtn").addEventListener("click", () => {
  const panel = document.getElementById("historyPanel");
  panel.classList.toggle("hidden");
  if (!panel.classList.contains("hidden")) renderHistory();
});

document.getElementById("closeHistory").addEventListener("click", () => {
  document.getElementById("historyPanel").classList.add("hidden");
});

function renderHistory() {
  const list = document.getElementById("historyList");
  list.innerHTML = "";
  if (history.length === 0) {
    list.innerHTML = `<div class="no-history">No history yet. Save your first week!</div>`;
    return;
  }
  history.forEach(entry => {
    const item = document.createElement("div");
    item.className = "history-item";
    const bars = AREAS.map(a => {
      const h = Math.max(4, ((entry.scores[a.key] || 1) / 10) * 48);
      return `<div class="history-bar-wrap">
        <div class="history-bar" style="height:${h}px;background:${a.color};opacity:.8"></div>
        <span class="history-bar-label">${a.emoji}</span>
      </div>`;
    }).join("");
    item.innerHTML = `
      <div class="history-date">${entry.date}</div>
      <div class="history-bars" style="align-items:flex-end">${bars}</div>
      <div class="history-avg">${entry.avg.toFixed(1)}</div>
    `;
    list.appendChild(item);
  });
}

document.getElementById("dateLabel").textContent = new Date().toLocaleDateString("en-US", { weekday:"long", year:"numeric", month:"long", day:"numeric" });

buildSliders();
drawWheel();
buildInsights();
window.addEventListener("resize", drawWheel);
