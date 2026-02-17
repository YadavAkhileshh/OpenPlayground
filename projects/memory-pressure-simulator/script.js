/* =========================================================
   Frontend Memory Pressure Simulator
   ========================================================= */

/* ================= STATE ================= */

let allocations = [];
let retained = [];

let allocationCount = 0;
let estimatedMemoryMB = 0;

/* ================= DOM ================= */

const allocCountEl = document.getElementById("allocCount");
const retainedCountEl = document.getElementById("retainedCount");
const memoryUsageEl = document.getElementById("memoryUsage");
const pressureLevelEl = document.getElementById("pressureLevel");

const memoryBar = document.getElementById("memoryBar");
const logContainer = document.getElementById("logContainer");

/* ================= BUTTONS ================= */

document.getElementById("allocateSmall").onclick = () =>
  allocateObjects(50, 0.1);

document.getElementById("allocateLarge").onclick = () =>
  allocateObjects(20, 1.5);

document.getElementById("retainRefs").onclick = retainReferences;
document.getElementById("releaseRefs").onclick = releaseReferences;
document.getElementById("resetAll").onclick = resetSimulator;

/* ================= CORE LOGIC ================= */

function allocateObjects(count, sizeMB) {
  for (let i = 0; i < count; i++) {
    const obj = {
      data: new Array(1000).fill(Math.random()),
      size: sizeMB
    };
    allocations.push(obj);
    allocationCount++;
    estimatedMemoryMB += sizeMB;
  }

  log(
    `Allocated ${count} objects (~${(count * sizeMB).toFixed(1)} MB)`
  );

  updateUI();
}

function retainReferences() {
  allocations.forEach(obj => retained.push(obj));
  allocations = [];

  log(
    `Retained ${retained.length} objects (simulated memory leak)`
  );

  updateUI();
}

function releaseReferences() {
  retained = [];
  log("Released retained references (cleanup performed)");
  updateUI();
}

/* ================= UI ================= */

function updateUI() {
  allocCountEl.innerText = allocationCount;
  retainedCountEl.innerText = retained.length;
  memoryUsageEl.innerText = estimatedMemoryMB.toFixed(1) + " MB";

  updatePressure();
  updateBar();
}

function updatePressure() {
  let level = "Low";
  let color = "#4ade80";

  if (estimatedMemoryMB > 40) {
    level = "High";
    color = "#fb7185";
  } else if (estimatedMemoryMB > 20) {
    level = "Medium";
    color = "#facc15";
  }

  pressureLevelEl.innerText = level;
  memoryBar.style.background = color;
}

function updateBar() {
  const percent = Math.min((estimatedMemoryMB / 60) * 100, 100);
  memoryBar.style.width = percent + "%";
}

/* ================= LOG ================= */

function log(message) {
  const div = document.createElement("div");
  div.className = "log-entry";
  div.innerText = message;
  logContainer.appendChild(div);
  logContainer.scrollTop = logContainer.scrollHeight;
}

/* ================= RESET ================= */

function resetSimulator() {
  allocations = [];
  retained = [];
  allocationCount = 0;
  estimatedMemoryMB = 0;

  logContainer.innerHTML = "";
  updateUI();

  log("Simulator reset");
}