
const DATA = {
  carbonRatePerTx: 0.26,   // kg CO₂ per transaction (avg Bitcoin)

  plantTypes: [
    { id: "seedling", name: "Seedling", emoji: "🌱", minTx: 1  },
    { id: "sprout",   name: "Sprout",   emoji: "🌿", minTx: 4  },
    { id: "flower",   name: "Flower",   emoji: "🌸", minTx: 10 },
    { id: "tree",     name: "Tree",     emoji: "🌳", minTx: 20 },
    { id: "wilting",  name: "Wilting",  emoji: "🍂", minTx: 40 },
    { id: "dead",     name: "Dead",     emoji: "🪨", minTx: 70 }
  ],

  facts: [
    "A single Bitcoin transaction uses ~2,264 kWh — enough to power a home for 78 days.",
    "Ethereum's switch to Proof-of-Stake in 2022 reduced its energy use by ~99.95%.",
    "Bitcoin mining consumes more electricity annually than the entire country of Argentina.",
    "Minting one NFT can emit as much CO₂ as an EU resident's 2-month electricity use.",
    "The Chia Network uses hard drives instead of GPUs — consuming 500× less energy than Bitcoin.",
    "El Salvador partially powers its Bitcoin mining using volcanic geothermal energy."
  ],

  offsetOptions: [
    { name: "Plant a Real Tree",  co2: 22,  emoji: "🌲" },
    { name: "Solar Panel Credit", co2: 150, emoji: "☀️" },
    { name: "Wind Energy Token",  co2: 90,  emoji: "🌬️" }
  ]
};

// ── STATE ────────────────────────────────────────────────────
let totalTx     = 0;
let totalCarbon = 0;
let totalOffset = 0;
let activityLog = [];
let factIndex   = 0;

// ── INIT UI ──────────────────────────────────────────────────
function init() {
  buildLegend();
  buildOffsets();
  showFact();
  renderGarden();
  renderLog();

  // Fact nav
  document.getElementById("fact-next").addEventListener("click", () => {
    factIndex = (factIndex + 1) % DATA.facts.length;
    showFact();
  });
  document.getElementById("fact-prev").addEventListener("click", () => {
    factIndex = (factIndex - 1 + DATA.facts.length) % DATA.facts.length;
    showFact();
  });

  // Plant button
  document.getElementById("btn-plant").addEventListener("click", plantTx);

  // Reset button
  document.getElementById("btn-reset").addEventListener("click", () => {
    totalTx = 0; totalCarbon = 0; totalOffset = 0; activityLog = [];
    updateStats(); renderGarden(); renderLog();
  });
}

// ── PLANT LEGEND ─────────────────────────────────────────────
function buildLegend() {
  const container = document.getElementById("legend-items");
  DATA.plantTypes.forEach(p => {
    const el = document.createElement("div");
    el.className = "legend-item";
    el.innerHTML = `<span class="le">${p.emoji}</span><span>${p.name} (${p.minTx}+ tx)</span>`;
    container.appendChild(el);
  });
}

// ── OFFSETS ──────────────────────────────────────────────────
function buildOffsets() {
  const container = document.getElementById("offsets-list");
  DATA.offsetOptions.forEach(opt => {
    const el = document.createElement("div");
    el.className = "offset-option";
    el.innerHTML = `
      <span class="oe">${opt.emoji}</span>
      <div class="info">
        <div class="oname">${opt.name}</div>
        <div class="oco2">Offsets ${opt.co2} kg CO₂</div>
      </div>
      <button class="btn-offset">+ Apply</button>
    `;
    el.querySelector(".btn-offset").addEventListener("click", () => {
      totalOffset += opt.co2;
      addLog(opt.name, null, opt.co2);
      updateStats();
    });
    container.appendChild(el);
  });
}

// ── ECO FACT ─────────────────────────────────────────────────
function showFact() {
  const el = document.getElementById("fact-text");
  el.style.opacity = 0;
  setTimeout(() => {
    el.textContent = DATA.facts[factIndex];
    el.style.opacity = 1;
    document.getElementById("fact-index").textContent =
      `${factIndex + 1} / ${DATA.facts.length}`;
  }, 300);
}

// ── PLANT TRANSACTIONS ───────────────────────────────────────
function plantTx() {
  const count = parseInt(document.getElementById("tx-count").value) || 1;
  if (count < 1 || count > 100) return;

  totalTx     += count;
  const carbon = parseFloat((count * DATA.carbonRatePerTx).toFixed(2));
  totalCarbon += carbon;

  addLog(`+${count} transactions`, carbon, null);
  updateStats();
  renderGarden();
}

// ── UPDATE STATS ─────────────────────────────────────────────
function updateStats() {
  const net = Math.max(0, totalCarbon - totalOffset);

  document.getElementById("stat-tx").textContent     = totalTx;
  document.getElementById("stat-carbon").textContent = net.toFixed(1) + " kg";
  document.getElementById("stat-offset").textContent = totalOffset + " kg";
  document.getElementById("carbon-label-val").textContent = net.toFixed(2) + " kg CO₂ net";

  const pct = Math.min(100, (net / 30) * 100);
  document.getElementById("carbon-fill").style.width = pct + "%";
}

// ── RENDER GARDEN ────────────────────────────────────────────
function renderGarden() {
  const bed   = document.getElementById("garden-bed");
  const empty = document.getElementById("garden-empty");

  // Remove old plants (keep empty message element)
  bed.querySelectorAll(".plant-item").forEach(el => el.remove());

  if (totalTx === 0) {
    empty.style.display = "flex";
    return;
  }
  empty.style.display = "none";

  // Work out which plants to show
  const toShow = [];
  let remaining = totalTx;

  // Sort stages from biggest down
  const sorted = [...DATA.plantTypes].sort((a, b) => b.minTx - a.minTx);

  sorted.forEach(stage => {
    if (stage.minTx === 0 || stage.minTx === 1) return;
    const count = Math.floor(remaining / stage.minTx);
    for (let i = 0; i < count; i++) toShow.push(stage);
    remaining = remaining % stage.minTx;
  });

  // Remaining become seedlings
  const seedling = DATA.plantTypes.find(p => p.id === "seedling");
  for (let i = 0; i < Math.min(remaining, 16); i++) toShow.push(seedling);

  // Cap display at 32 plants
  toShow.slice(0, 32).forEach((stage, i) => {
    const el = document.createElement("div");
    el.className = "plant-item";
    el.style.animationDelay = (i * 0.04) + "s";
    el.innerHTML = `
      <div class="plant-emoji" title="${stage.name}">${stage.emoji}</div>
      <div class="plant-name">${stage.name}</div>
    `;
    bed.appendChild(el);
  });
}

// ── ACTIVITY LOG ─────────────────────────────────────────────
function addLog(action, co2, offset) {
  activityLog.unshift({ action, co2, offset, time: new Date().toLocaleTimeString() });
  if (activityLog.length > 20) activityLog.pop();
  renderLog();
}

function renderLog() {
  const list = document.getElementById("log-list");

  if (!activityLog.length) {
    list.innerHTML = `<div class="log-empty">No activity yet</div>`;
    return;
  }

  list.innerHTML = activityLog.map(item => `
    <div class="log-item">
      <span class="la">${item.action}</span>
      ${item.co2   ? `<span class="lc">+${item.co2} kg CO₂</span>` : ""}
      ${item.offset ? `<span class="lo">-${item.offset} kg offset</span>` : ""}
    </div>
  `).join("");
}

// ── START ────────────────────────────────────────────────────
init();
