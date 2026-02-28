const playground = document.getElementById("playground");
const logList = document.getElementById("logList");

const totalCountEl = document.getElementById("totalCount");
const rateCountEl = document.getElementById("rateCount");
const childCountEl = document.getElementById("childCount");
const attrCountEl = document.getElementById("attrCount");
const charCountEl = document.getElementById("charCount");
const costScoreEl = document.getElementById("costScore");
const lastSourceEl = document.getElementById("lastSource");
const dangerBar = document.getElementById("dangerBar");
const subtreeCountEl = document.getElementById("subtreeCount");
const directCountEl = document.getElementById("directCount");

const rateCanvas = document.getElementById("rateChart");
const ctx = rateCanvas.getContext("2d");

let total = 0;
let child = 0;
let attr = 0;
let charData = 0;
let costScore = 0;
let mutationsThisSecond = 0;
let subtreeMutations = 0;
let directMutations = 0;

let mutationRates = [];
let mutationHistory = []; // For export
let observerActive = true;
let observerFrozen = false;
let frozenMutations = [];
let throttle = false;
let debounce = false;
let currentSource = "system";

const MAX_LOG = 120;
const RATE_WINDOW = 60;

// Cost weights
const COST_WEIGHTS = {
  childList: 3,
  attributes: 2,
  characterData: 1
};

// Throttle/Debounce helpers
let throttleTimeout = null;
let debounceTimeout = null;
const THROTTLE_DELAY = 100;
const DEBOUNCE_DELAY = 300;

function updateStats(type) {
  total++;
  mutationsThisSecond++;
  
  if (type === "childList") child++;
  if (type === "attributes") attr++;
  if (type === "characterData") charData++;

  // Update cost score
  costScore += COST_WEIGHTS[type] || 1;

  totalCountEl.textContent = total;
  childCountEl.textContent = child;
  attrCountEl.textContent = attr;
  charCountEl.textContent = charData;
  costScoreEl.textContent = costScore;
  
  // Update danger meter (scale to 1000 max)
  const dangerPercent = Math.min((costScore / 1000) * 100, 100);
  dangerBar.style.width = dangerPercent + "%";
}

function getDepth(element) {
  let depth = 0;
  let current = element;
  while (current && current !== playground) {
    depth++;
    current = current.parentElement;
  }
  return depth;
}

function applyDepthColor(element) {
  if (element.nodeType === 1 && element.classList && element.classList.contains('node')) {
    const depth = getDepth(element);
    element.setAttribute('data-depth', depth);
  }
}

function logMutation(type, target) {
  const timestamp = new Date();
  const depth = getDepth(target);
  
  const li = document.createElement("li");
  li.textContent = `${timestamp.toLocaleTimeString()} | ${type} | ${target.nodeName} | Depth:${depth} | Source:${currentSource}`;
  logList.prepend(li);

  // Store for export
  mutationHistory.push({
    timestamp: timestamp.toISOString(),
    type: type,
    nodeName: target.nodeName,
    depth: depth,
    source: currentSource,
    cost: COST_WEIGHTS[type] || 1
  });

  if (logList.children.length > MAX_LOG) {
    logList.removeChild(logList.lastChild);
  }
  
  lastSourceEl.textContent = currentSource;
}

function drawRateGraph() {
  ctx.clearRect(0, 0, rateCanvas.width, rateCanvas.height);
  ctx.strokeStyle = "#7c3aed";
  ctx.beginPath();

  mutationRates.forEach((v, i) => {
    const x = (i / RATE_WINDOW) * rateCanvas.width;
    const y = rateCanvas.height - v * 3;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();
}

setInterval(() => {
  // Track mutations per second (delta, not total)
  mutationRates.push(mutationsThisSecond);
  rateCountEl.textContent = mutationsThisSecond;
  mutationsThisSecond = 0; // Reset for next second
  
  if (mutationRates.length > RATE_WINDOW) mutationRates.shift();
  drawRateGraph();
}, 1000);

const observer = new MutationObserver(mutations => {
  if (!observerActive) return;
  
  // Freeze-frame mode
  if (observerFrozen) {
    frozenMutations.push(...mutations);
    return;
  }

  subtreeMutations += mutations.length;
  subtreeCountEl.textContent = subtreeMutations;

  const processMutations = () => {
    mutations.forEach(mutation => {
      updateStats(mutation.type);
      logMutation(mutation.type, mutation.target);

      if (mutation.target.classList) {
        mutation.target.classList.add("hot");
        setTimeout(() => mutation.target.classList.remove("hot"), 200);
      }
      
      // Apply depth coloring to added nodes
      if (mutation.type === "childList" && mutation.addedNodes.length) {
        mutation.addedNodes.forEach(node => applyDepthColor(node));
      }
    });
  };

  // Apply throttle or debounce if enabled
  if (throttle) {
    if (!throttleTimeout) {
      processMutations();
      throttleTimeout = setTimeout(() => {
        throttleTimeout = null;
      }, THROTTLE_DELAY);
    }
  } else if (debounce) {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(processMutations, DEBOUNCE_DELAY);
  } else {
    processMutations();
  }
});

observer.observe(playground, {
  childList: true,
  attributes: true,
  characterData: true,
  subtree: true
});

// Direct children observer (comparison)
const directObserver = new MutationObserver(mutations => {
  if (!observerActive || observerFrozen) return;
  directMutations += mutations.length;
  directCountEl.textContent = directMutations;
});

directObserver.observe(playground, {
  childList: true,
  attributes: true,
  characterData: true,
  subtree: false // Only direct children
});

document.getElementById("toggleObserver").onchange = e => {
  observerActive = e.target.checked;
};

document.getElementById("toggleThrottle").onchange = e => {
  throttle = e.target.checked;
};

document.getElementById("toggleDebounce").onchange = e => {
  debounce = e.target.checked;
};

// Export functions
function exportJSON() {
  const data = {
    summary: {
      totalMutations: total,
      childList: child,
      attributes: attr,
      characterData: charData,
      costScore: costScore,
      subtreeMutations: subtreeMutations,
      directMutations: directMutations
    },
    mutations: mutationHistory
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mutation-report-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportCSV() {
  const headers = ['Timestamp', 'Type', 'NodeName', 'Depth', 'Source', 'Cost'];
  const rows = mutationHistory.map(m => [
    m.timestamp,
    m.type,
    m.nodeName,
    m.depth,
    m.source,
    m.cost
  ]);
  
  const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mutation-report-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

document.getElementById("btnExportJSON").onclick = exportJSON;
document.getElementById("btnExportCSV").onclick = exportCSV;

// Freeze-frame mode
const freezeBtn = document.getElementById("btnFreeze");
freezeBtn.onclick = () => {
  observerFrozen = !observerFrozen;
  
  if (observerFrozen) {
    freezeBtn.textContent = "▶️ Resume & Dump";
    freezeBtn.classList.add("frozen");
    frozenMutations = [];
  } else {
    freezeBtn.textContent = "⏸️ Freeze Observer";
    freezeBtn.classList.remove("frozen");
    
    // Process all frozen mutations at once
    if (frozenMutations.length > 0) {
      subtreeMutations += frozenMutations.length;
      subtreeCountEl.textContent = subtreeMutations;
      
      frozenMutations.forEach(mutation => {
        updateStats(mutation.type);
        logMutation(mutation.type, mutation.target);
        
        if (mutation.target.classList) {
          mutation.target.classList.add("hot");
          setTimeout(() => mutation.target.classList.remove("hot"), 200);
        }
      });
      
      frozenMutations = [];
    }
  }
};

document.getElementById("btnAdd").onclick = () => {
  currentSource = "user-click:add-nodes";
  for (let i = 0; i < 20; i++) {
    const div = document.createElement("div");
    div.className = "node";
    div.textContent = "Node";
    playground.appendChild(div);
  }
};

document.getElementById("btnRemove").onclick = () => {
  currentSource = "user-click:remove-nodes";
  for (let i = 0; i < 10 && playground.children.length; i++) {
    playground.removeChild(playground.lastChild);
  }
};

document.getElementById("btnUpdate").onclick = () => {
  currentSource = "user-click:update-text";
  Array.from(playground.children).forEach((el, i) => {
    el.textContent = "Node " + i;
  });
};

document.getElementById("btnAttributes").onclick = () => {
  currentSource = "user-click:attribute-randomizer";
  Array.from(playground.children).forEach(el => {
    el.setAttribute("data-rand", Math.random());
  });
};

document.getElementById("btnBatch").onclick = () => {
  currentSource = "user-click:batch-update";
  playground.style.display = "none";
  for (let i = 0; i < 50; i++) {
    const div = document.createElement("div");
    div.className = "node";
    div.textContent = "Batch";
    playground.appendChild(div);
  }
  playground.style.display = "grid";
};

document.getElementById("btnClear").onclick = () => {
  currentSource = "user-click:clear";
  playground.innerHTML = "";
  total = child = attr = charData = costScore = 0;
  subtreeMutations = directMutations = 0;
  mutationRates = [];
  mutationHistory = [];
  logList.innerHTML = "";
  totalCountEl.textContent = "0";
  childCountEl.textContent = "0";
  attrCountEl.textContent = "0";
  charCountEl.textContent = "0";
  costScoreEl.textContent = "0";
  rateCountEl.textContent = "0";
  lastSourceEl.textContent = "None";
  subtreeCountEl.textContent = "0";
  directCountEl.textContent = "0";
  dangerBar.style.width = "0%";
  ctx.clearRect(0, 0, rateCanvas.width, rateCanvas.height);
};
