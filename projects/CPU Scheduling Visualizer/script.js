/* =========================================================
   CPU Scheduling Visualizer (Vanilla JS)
   - Pure scheduling functions return unified schedule format:
     [{ pid: "P1", start: 0, end: 4 }, ...]
   - DOM/animation consumes schedule
   ========================================================= */

const state = {
  processes: [],
  pidCounter: 1,
  running: false,
  stopRequested: false,
  colorMap: new Map()
};

// UI refs
const el = {
  form: document.getElementById("processForm"),
  pid: document.getElementById("pid"),
  arrival: document.getElementById("arrival"),
  burst: document.getElementById("burst"),
  priority: document.getElementById("priority"),
  inputError: document.getElementById("inputError"),

  tbody: document.getElementById("processTbody"),
  emptyHint: document.getElementById("emptyHint"),

  algorithm: document.getElementById("algorithm"),
  quantumWrap: document.getElementById("quantumWrap"),
  quantum: document.getElementById("quantum"),

  btnStart: document.getElementById("btnStart"),
  btnStop: document.getElementById("btnStop"),
  btnReset: document.getElementById("btnReset"),
  btnClear: document.getElementById("btnClear"),
  btnDemo: document.getElementById("btnDemo"),

  ganttTrack: document.getElementById("ganttTrack"),
  timeline: document.getElementById("timeline"),
  statusText: document.getElementById("statusText"),
  algoDesc: document.getElementById("algoDesc"),

  metricsTbody: document.getElementById("metricsTbody"),
  metricsHint: document.getElementById("metricsHint"),
  avgWaiting: document.getElementById("avgWaiting"),
  avgTurnaround: document.getElementById("avgTurnaround"),
  totalTime: document.getElementById("totalTime")
};

/* -------------------------
   Helpers (pure-ish)
------------------------- */

function deepCopyProcesses(list) {
  return list.map(p => ({ ...p }));
}

function normalizePid(pid, fallback) {
  const cleaned = (pid || "").trim();
  return cleaned.length ? cleaned : fallback;
}

function clampInt(n, min, fallback) {
  if (!Number.isFinite(n)) return fallback;
  const v = Math.floor(n);
  return v < min ? fallback : v;
}

function sortByArrivalThenPid(a, b) {
  if (a.arrival !== b.arrival) return a.arrival - b.arrival;
  return String(a.pid).localeCompare(String(b.pid));
}

function stablePickReadyBy(list, time, cmp) {
  const ready = list.filter(p => !p.done && p.arrival <= time);
  ready.sort(cmp);
  return ready[0] || null;
}

function buildIdleIfNeeded(schedule, start, end) {
  if (end > start) schedule.push({ pid: "IDLE", start, end });
}

/* -------------------------
   Scheduling Algorithms (PURE)
   Input: processes [{pid, arrival, burst, priority}]
   Output:
     {
       schedule: [{pid,start,end},...],
       metrics: { [pid]: {arrival, burst, completion, waiting, turnaround} },
       totalTime: number
     }
------------------------- */

/**
 * FCFS (Non-preemptive)
 */
function scheduleFCFS(processes) {
  const procs = deepCopyProcesses(processes).sort(sortByArrivalThenPid);
  const schedule = [];
  let time = 0;

  for (const p of procs) {
    if (time < p.arrival) {
      buildIdleIfNeeded(schedule, time, p.arrival);
      time = p.arrival;
    }
    const start = time;
    const end = time + p.burst;
    schedule.push({ pid: p.pid, start, end });
    time = end;
  }

  return finalizeMetrics(processes, schedule);
}

/**
 * SJF (Non-preemptive)
 */
function scheduleSJF(processes) {
  const procs = deepCopyProcesses(processes).map(p => ({ ...p, done: false }));
  const schedule = [];
  let completed = 0;
  let time = 0;

  while (completed < procs.length) {
    const next = stablePickReadyBy(
      procs,
      time,
      (a, b) => (a.burst !== b.burst ? a.burst - b.burst : sortByArrivalThenPid(a, b))
    );

    if (!next) {
      // jump to next arrival
      const future = procs.filter(p => !p.done).sort(sortByArrivalThenPid)[0];
      buildIdleIfNeeded(schedule, time, future.arrival);
      time = future.arrival;
      continue;
    }

    const start = time;
    const end = time + next.burst;
    schedule.push({ pid: next.pid, start, end });

    next.done = true;
    completed += 1;
    time = end;
  }

  return finalizeMetrics(processes, schedule);
}

/**
 * Priority (Non-preemptive) - lower number => higher priority
 */
function schedulePriority(processes) {
  const procs = deepCopyProcesses(processes).map(p => ({ ...p, done: false }));
  const schedule = [];
  let completed = 0;
  let time = 0;

  while (completed < procs.length) {
    const next = stablePickReadyBy(
      procs,
      time,
      (a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
        // tie-breaker: arrival, then PID
        return sortByArrivalThenPid(a, b);
      }
    );

    if (!next) {
      const future = procs.filter(p => !p.done).sort(sortByArrivalThenPid)[0];
      buildIdleIfNeeded(schedule, time, future.arrival);
      time = future.arrival;
      continue;
    }

    const start = time;
    const end = time + next.burst;
    schedule.push({ pid: next.pid, start, end });

    next.done = true;
    completed += 1;
    time = end;
  }

  return finalizeMetrics(processes, schedule);
}

/**
 * Round Robin (time-sliced with quantum)
 * Note: RR is inherently time-sliced; we implement standard RR queue behavior.
 */
function scheduleRoundRobin(processes, quantum) {
  const q = clampInt(quantum, 1, 1);
  const incoming = deepCopyProcesses(processes)
    .map(p => ({ ...p, remaining: p.burst, completion: null }))
    .sort(sortByArrivalThenPid);

  const schedule = [];
  const ready = [];
  let time = 0;
  let i = 0; // pointer over incoming

  const pushArrivalsUpTo = (t) => {
    while (i < incoming.length && incoming[i].arrival <= t) {
      ready.push(incoming[i]);
      i += 1;
    }
  };

  // start at earliest arrival if needed
  if (incoming.length > 0 && incoming[0].arrival > 0) {
    buildIdleIfNeeded(schedule, 0, incoming[0].arrival);
    time = incoming[0].arrival;
  }

  pushArrivalsUpTo(time);

  while (ready.length > 0 || i < incoming.length) {
    if (ready.length === 0) {
      // CPU idle until next arrival
      const nextArr = incoming[i].arrival;
      buildIdleIfNeeded(schedule, time, nextArr);
      time = nextArr;
      pushArrivalsUpTo(time);
      continue;
    }

    const p = ready.shift();
    const run = Math.min(q, p.remaining);
    const start = time;
    const end = time + run;

    schedule.push({ pid: p.pid, start, end });
    time = end;
    p.remaining -= run;

    // add any arrivals that happened during this slice
    pushArrivalsUpTo(time);

    if (p.remaining > 0) {
      ready.push(p);
    } else {
      p.completion = time;
    }
  }

  return finalizeMetrics(processes, schedule);
}

/**
 * Build completion times from schedule, then per-process metrics.
 */
function finalizeMetrics(originalProcesses, schedule) {
  const byPid = new Map();
  for (const p of originalProcesses) {
    byPid.set(p.pid, { arrival: p.arrival, burst: p.burst, priority: p.priority });
  }

  const completion = new Map();
  for (const block of schedule) {
    if (block.pid === "IDLE") continue;
    completion.set(block.pid, block.end);
  }

  const metrics = {};
  let totalWaiting = 0;
  let totalTurnaround = 0;
  let count = 0;

  for (const p of originalProcesses) {
    const comp = completion.get(p.pid);
    const tat = comp - p.arrival;
    const wt = tat - p.burst;

    metrics[p.pid] = {
      arrival: p.arrival,
      burst: p.burst,
      completion: comp,
      waiting: wt,
      turnaround: tat
    };

    totalWaiting += wt;
    totalTurnaround += tat;
    count += 1;
  }

  const totalTime = schedule.length ? schedule[schedule.length - 1].end : 0;

  return {
    schedule,
    metrics,
    totalTime,
    averages: {
      waiting: count ? totalWaiting / count : 0,
      turnaround: count ? totalTurnaround / count : 0
    }
  };
}

/* -------------------------
   UI Rendering
------------------------- */

function setStatus(text) {
  el.statusText.textContent = text;
}

function showError(msg) {
  el.inputError.textContent = msg || "";
}

function renderProcessTable() {
  el.tbody.innerHTML = "";

  if (state.processes.length === 0) {
    el.emptyHint.classList.remove("hidden");
  } else {
    el.emptyHint.classList.add("hidden");
  }

  const sorted = [...state.processes].sort(sortByArrivalThenPid);
  for (const p of sorted) {
    const tr = document.createElement("tr");

    const tdPid = document.createElement("td");
    const colorDot = document.createElement("span");
    colorDot.style.cssText = `
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 2px;
      background: ${ensureColorForPid(p.pid)};
      border: 1px solid var(--border);
      margin-right: 8px;
      vertical-align: middle;
    `;
    tdPid.appendChild(colorDot);
    const pidText = document.createElement("span");
    pidText.textContent = p.pid;
    tdPid.appendChild(pidText);

    const tdA = document.createElement("td");
    tdA.className = "num";
    tdA.textContent = p.arrival;

    const tdB = document.createElement("td");
    tdB.className = "num";
    tdB.textContent = p.burst;

    const tdPr = document.createElement("td");
    tdPr.className = "num";
    tdPr.textContent = Number.isFinite(p.priority) ? p.priority : 0;

    const tdAct = document.createElement("td");
    tdAct.className = "actionsCol";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "rowBtn";
    btn.textContent = "✕";
    btn.title = `Remove ${p.pid}`;
    btn.addEventListener("click", () => {
      if (state.running) return;
      state.processes = state.processes.filter(x => x.pid !== p.pid);
      renderProcessTable();
      resetSimulationUIOnly();
    });
    tdAct.appendChild(btn);

    tr.appendChild(tdPid);
    tr.appendChild(tdA);
    tr.appendChild(tdB);
    tr.appendChild(tdPr);
    tr.appendChild(tdAct);

    el.tbody.appendChild(tr);
  }
}

function resetSimulationUIOnly() {
  // clear viz + metrics only (keep processes)
  el.ganttTrack.innerHTML = "";
  el.timeline.innerHTML = "";
  el.metricsTbody.innerHTML = "";
  el.metricsHint.classList.remove("hidden");
  el.avgWaiting.textContent = "—";
  el.avgTurnaround.textContent = "—";
  el.totalTime.textContent = "—";
  setStatus("Ready.");
}

function hardResetAll() {
  if (state.running) return;
  state.processes = [];
  state.pidCounter = 1;
  state.colorMap.clear();
  renderProcessTable();
  resetSimulationUIOnly();
  showError("");
}

function ensureColorForPid(pid) {
  if (pid === "IDLE") return "var(--bg-subtle)";
  if (state.colorMap.has(pid)) return state.colorMap.get(pid);

  // Professional color palette (avoiding garish colors)
  const palette = [
    'hsla(210, 100%, 66%, 0.25)',  // blue
    'hsla(168, 76%, 42%, 0.25)',   // teal
    'hsla(291, 64%, 42%, 0.25)',   // purple
    'hsla(338, 100%, 67%, 0.25)',  // pink
    'hsla(45, 100%, 51%, 0.25)',   // yellow
    'hsla(15, 100%, 62%, 0.25)',   // orange
    'hsla(130, 61%, 40%, 0.25)',   // green
    'hsla(230, 100%, 69%, 0.25)',  // indigo
  ];
  
  // Deterministic selection based on pid
  let hash = 0;
  for (let i = 0; i < pid.length; i++) {
    hash = (hash * 31 + pid.charCodeAt(i)) >>> 0;
  }
  const color = palette[hash % palette.length];
  state.colorMap.set(pid, color);
  return color;
}

function buildTimeline(totalTime) {
  el.timeline.innerHTML = "";
  for (let t = 0; t <= totalTime; t++) {
    const tick = document.createElement("div");
    tick.className = "tick";
    tick.textContent = String(t);
    el.timeline.appendChild(tick);
  }
}

function renderMetricsTable(processes, result) {
  el.metricsTbody.innerHTML = "";

  const sorted = [...processes].sort(sortByArrivalThenPid);
  for (const p of sorted) {
    const m = result.metrics[p.pid];
    const tr = document.createElement("tr");

    const tdPid = document.createElement("td");
    const colorDot = document.createElement("span");
    colorDot.style.cssText = `
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 2px;
      background: ${ensureColorForPid(p.pid)};
      border: 1px solid var(--border);
      margin-right: 8px;
      vertical-align: middle;
    `;
    tdPid.appendChild(colorDot);
    const pidText = document.createElement("span");
    pidText.textContent = p.pid;
    tdPid.appendChild(pidText);

    const tdA = document.createElement("td");
    tdA.className = "num";
    tdA.textContent = m.arrival;

    const tdB = document.createElement("td");
    tdB.className = "num";
    tdB.textContent = m.burst;

    const tdC = document.createElement("td");
    tdC.className = "num";
    tdC.textContent = m.completion;

    const tdW = document.createElement("td");
    tdW.className = "num";
    tdW.textContent = m.waiting;

    const tdT = document.createElement("td");
    tdT.className = "num";
    tdT.textContent = m.turnaround;

    tr.appendChild(tdPid);
    tr.appendChild(tdA);
    tr.appendChild(tdB);
    tr.appendChild(tdC);
    tr.appendChild(tdW);
    tr.appendChild(tdT);

    el.metricsTbody.appendChild(tr);
  }

  el.metricsHint.classList.add("hidden");
  el.avgWaiting.textContent = result.averages.waiting.toFixed(2);
  el.avgTurnaround.textContent = result.averages.turnaround.toFixed(2);
  el.totalTime.textContent = String(result.totalTime);
}

/* -------------------------
   Animation
------------------------- */

function timeToWidthUnits(duration) {
  // duration in time units -> px width
  const unit = getCssNumber("--unit", 34);
  return Math.max(1, duration) * unit;
}

function getCssNumber(varName, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  const n = Number.parseFloat(v);
  return Number.isFinite(n) ? n : fallback;
}

function blockDurationMs(durationUnits) {
  // Smoother, more professional timing
  const base = 200;
  const per = 120;
  const max = 800;
  return Math.min(max, base + (durationUnits * per));
}

function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function animateSchedule(schedule) {
  el.ganttTrack.innerHTML = "";
  state.stopRequested = false;

  // compute total time from schedule end
  const totalTime = schedule.length ? schedule[schedule.length - 1].end : 0;
  buildTimeline(totalTime);

  const outer = el.ganttTrack.closest(".ganttOuter");
  const ensureScrollToEnd = () => {
    if (!outer) return;
    outer.scrollLeft = outer.scrollWidth;
  };

  for (let i = 0; i < schedule.length; i++) {
    if (state.stopRequested) break;
    
    const block = schedule[i];
    const duration = block.end - block.start;
    const w = timeToWidthUnits(duration);

    const node = document.createElement("div");
    node.className = "block" + (block.pid === "IDLE" ? " idle" : "");
    node.style.background = ensureColorForPid(block.pid);
    node.style.width = "0px";

    const label = document.createElement("span");
    label.textContent = block.pid === "IDLE" ? "IDLE" : block.pid;
    node.appendChild(label);

    // Add timing info tooltip
    node.title = `${block.pid}: Time ${block.start}-${block.end} (${duration} units)`;

    el.ganttTrack.appendChild(node);
    ensureScrollToEnd();

    // Update status with current execution
    if (block.pid !== "IDLE") {
      setStatus(`Running ${block.pid} (${block.start}-${block.end})...`);
    }

    // Let it mount before animating width
    await sleep(20);

    node.classList.add("show");
    // animate width
    node.style.transitionDuration = `${Math.min(700, blockDurationMs(duration))}ms`;
    node.style.width = `${w}px`;

    // Wait for animation to be readable
    await sleep(blockDurationMs(duration));
  }
}

/* -------------------------
   Simulation Flow
------------------------- */

function validateProcessesForStart() {
  if (state.processes.length === 0) return "Add at least one process.";
  // No duplicate PID
  const seen = new Set();
  for (const p of state.processes) {
    if (seen.has(p.pid)) return `Duplicate PID found: ${p.pid}`;
    seen.add(p.pid);
  }
  return "";
}

function runScheduling(processes, algo, quantum) {
  if (algo === "FCFS") return scheduleFCFS(processes);
  if (algo === "SJF") return scheduleSJF(processes);
  if (algo === "PRIORITY") return schedulePriority(processes);
  if (algo === "RR") return scheduleRoundRobin(processes, quantum);
  // fallback
  return scheduleFCFS(processes);
}

async function startSimulation() {
  if (state.running) return;
  showError("");

  const err = validateProcessesForStart();
  if (err) {
    showError(err);
    return;
  }

  const algo = el.algorithm.value;
  const quantum = clampInt(Number(el.quantum.value), 1, 1);

  const processes = deepCopyProcesses(state.processes).map(p => ({
    pid: p.pid,
    arrival: p.arrival,
    burst: p.burst,
    priority: Number.isFinite(p.priority) ? p.priority : 0
  }));

  const result = runScheduling(processes, algo, quantum);

  // UI state
  state.running = true;
  state.stopRequested = false;
  el.btnStart.disabled = true;
  el.btnStop.disabled = false;
  el.btnReset.disabled = true;
  el.btnClear.disabled = true;
  el.btnDemo.disabled = true;
  el.algorithm.disabled = true;
  el.quantum.disabled = true;
  el.statusText.classList.add('running');
  setStatus(`Running ${algo}${algo === "RR" ? ` (q=${quantum})` : ""}...`);

  // clear previous outputs
  resetSimulationUIOnly();

  // animate
  await animateSchedule(result.schedule);

  if (!state.stopRequested) {
    renderMetricsTable(processes, result);
    
    // Add insight about the algorithm's performance
    const insight = getAlgorithmInsight(algo, result.averages);
    setStatus(`Completed. ${insight}`);
  } else {
    setStatus("Stopped.");
  }

  // restore UI
  state.running = false;
  el.statusText.classList.remove('running');
  el.btnStart.disabled = false;
  el.btnStop.disabled = true;
  el.btnReset.disabled = false;
  el.btnClear.disabled = false;
  el.btnDemo.disabled = false;
  el.algorithm.disabled = false;
  el.quantum.disabled = false;
}

function stopSimulation() {
  if (!state.running) return;
  state.stopRequested = true;
  el.btnStop.disabled = true;
}

/* -------------------------
   Algorithm Insights
------------------------- */

function getAlgorithmInsight(algo, averages) {
  const avgWait = averages.waiting.toFixed(2);
  const avgTAT = averages.turnaround.toFixed(2);
  
  const insights = {
    'FCFS': `Simple and fair. Try SJF to potentially reduce waiting time.`,
    'SJF': `Optimizes average waiting time. Compare with FCFS to see the improvement.`,
    'PRIORITY': `Prioritizes important processes. Try with different priority values to see effects.`,
    'RR': `Time-sharing ensures fairness. Adjust quantum to balance responsiveness vs overhead.`
  };
  
  return insights[algo] || 'Compare with other algorithms to see differences.';
}

/* -------------------------
   Events
------------------------- */

el.algorithm.addEventListener("change", () => {
  const isRR = el.algorithm.value === "RR";
  el.quantumWrap.classList.toggle("hidden", !isRR);
  
  // Update description
  const selected = el.algorithm.options[el.algorithm.selectedIndex];
  const desc = selected.getAttribute('data-desc');
  if (desc && el.algoDesc) {
    el.algoDesc.textContent = desc;
  }
  
  resetSimulationUIOnly();
});

el.form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (state.running) return;

  showError("");

  const pidInput = el.pid.value;
  const arrival = clampInt(Number(el.arrival.value), 0, null);
  const burst = clampInt(Number(el.burst.value), 1, null);
  const priority = clampInt(Number(el.priority.value), 0, 0);

  if (arrival === null || burst === null) {
    showError("Arrival must be ≥ 0 and Burst must be ≥ 1.");
    return;
  }

  const autoPid = `P${state.pidCounter}`;
  const pid = normalizePid(pidInput, autoPid);

  // If user typed a PID that already exists, block it
  if (state.processes.some(p => p.pid === pid)) {
    showError(`PID "${pid}" already exists. Use a unique PID.`);
    return;
  }

  // Add
  state.processes.push({ pid, arrival, burst, priority });
  if (!pidInput.trim()) state.pidCounter += 1;
  ensureColorForPid(pid);

  // Clear inputs (keep priority for convenience)
  el.pid.value = "";
  el.arrival.value = "";
  el.burst.value = "";
  el.arrival.focus();

  renderProcessTable();
  resetSimulationUIOnly();
});

el.btnStart.addEventListener("click", startSimulation);
el.btnStop.addEventListener("click", stopSimulation);

el.btnReset.addEventListener("click", () => {
  if (state.running) return;
  resetSimulationUIOnly();
  showError("");
});

el.btnClear.addEventListener("click", () => {
  hardResetAll();
});

el.btnDemo.addEventListener("click", () => {
  if (state.running) return;
  hardResetAll();

  // A demo set with interesting scheduling characteristics
  const demo = [
    { pid: "P1", arrival: 0, burst: 5, priority: 2 },
    { pid: "P2", arrival: 1, burst: 3, priority: 1 },
    { pid: "P3", arrival: 2, burst: 8, priority: 4 },
    { pid: "P4", arrival: 3, burst: 6, priority: 3 },
    { pid: "P5", arrival: 10, burst: 2, priority: 0 }
  ];

  state.processes = demo.map(p => ({ ...p }));
  state.pidCounter = 6;
  for (const p of state.processes) ensureColorForPid(p.pid);

  renderProcessTable();
  resetSimulationUIOnly();
  setStatus("Demo loaded. Pick an algorithm and press Start to compare their behavior.");
});

/* -------------------------
   Initial UI
------------------------- */
(function init() {
  el.quantumWrap.classList.add("hidden");
  renderProcessTable();
  resetSimulationUIOnly();
  
  // Set initial algorithm description
  const selected = el.algorithm.options[el.algorithm.selectedIndex];
  const desc = selected.getAttribute('data-desc');
  if (desc && el.algoDesc) {
    el.algoDesc.textContent = desc;
  }
  
  // Add keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter: Start simulation
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!el.btnStart.disabled) startSimulation();
    }
    // Escape: Stop simulation
    if (e.key === 'Escape' && state.running) {
      e.preventDefault();
      stopSimulation();
    }
  });
})();
