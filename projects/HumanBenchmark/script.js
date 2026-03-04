let scores = JSON.parse(localStorage.getItem("hb_scores") || "{}");

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  window.scrollTo(0, 0);
}

function saveScores() {
  localStorage.setItem("hb_scores", JSON.stringify(scores));
  updateHomeScores();
}

function updateHomeScores() {
  const tests = ["reaction","memory","number","chimp","aim"];
  let anyScore = false;
  tests.forEach(t => {
    const el = document.getElementById("score-" + t);
    if (scores[t] !== undefined) {
      el.classList.remove("hidden");
      el.textContent = formatScore(t, scores[t]);
      anyScore = true;
    }
  });
  if (anyScore) buildProfile();
}

function formatScore(test, val) {
  if (test === "reaction") return val + "ms";
  if (test === "aim") return val + "ms avg";
  if (test === "number") return val + " digits";
  return "Level " + val;
}

function getGrade(test, val) {
  const grades = {
    reaction: [{v:200,g:"S"},{v:250,g:"A"},{v:300,g:"B"},{v:400,g:"C"},{v:9999,g:"D"}],
    memory:   [{v:12,g:"S"},{v:9,g:"A"},{v:7,g:"B"},{v:5,g:"C"},{v:0,g:"D"}],
    number:   [{v:10,g:"S"},{v:8,g:"A"},{v:7,g:"B"},{v:5,g:"C"},{v:0,g:"D"}],
    chimp:    [{v:10,g:"S"},{v:7,g:"A"},{v:5,g:"B"},{v:3,g:"C"},{v:0,g:"D"}],
    aim:      [{v:200,g:"S"},{v:300,g:"A"},{v:380,g:"B"},{v:500,g:"C"},{v:9999,g:"D"}],
  };
  const scale = grades[test];
  if (test === "reaction" || test === "aim") {
    for (const g of scale) { if (val <= g.v) return g.g; }
  } else {
    for (const g of scale) { if (val >= g.v) return g.g; }
  }
  return "D";
}

function buildProfile() {
  const card = document.getElementById("profileCard");
  const grid = document.getElementById("profileGrid");
  card.classList.remove("hidden");
  grid.innerHTML = "";
  const tests = [
    { key:"reaction", icon:"⚡", name:"Reaction" },
    { key:"memory",   icon:"🧠", name:"Memory" },
    { key:"number",   icon:"🔢", name:"Numbers" },
    { key:"chimp",    icon:"🐒", name:"Chimp" },
    { key:"aim",      icon:"🎯", name:"Aim" },
  ];
  tests.forEach(t => {
    if (scores[t.key] === undefined) return;
    const grade = getGrade(t.key, scores[t.key]);
    const item = document.createElement("div");
    item.className = "profile-item";
    item.innerHTML = `
      <div class="profile-item-icon">${t.icon}</div>
      <div class="profile-item-name">${t.name.toUpperCase()}</div>
      <div class="profile-item-val">${formatScore(t.key, scores[t.key])}</div>
      <div class="profile-item-grade grade-${grade.toLowerCase()}">Grade ${grade}</div>
    `;
    grid.appendChild(item);
  });
}

document.getElementById("resetScoresBtn").addEventListener("click", () => {
  if (confirm("Reset all scores?")) {
    scores = {};
    saveScores();
    document.getElementById("profileCard").classList.add("hidden");
    document.querySelectorAll(".test-score").forEach(el => el.classList.add("hidden"));
  }
});

document.querySelectorAll(".test-card").forEach(card => {
  card.addEventListener("click", () => {
    const test = card.dataset.test;
    showScreen(test + "Screen");
    if (test === "memory") initMemory();
    if (test === "chimp") initChimp();
  });
});

document.querySelectorAll(".back-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    showScreen(btn.dataset.back);
    updateHomeScores();
  });
});

// ── REACTION TEST ────────────────────────────────────────
let reactionState = "idle";
let reactionTimer = null;
let reactionStart = 0;

document.getElementById("reactionStart").addEventListener("click", startReaction);
document.getElementById("reactionRetry").addEventListener("click", () => {
  document.getElementById("reactionResults").classList.add("hidden");
  startReaction();
});
document.getElementById("reactionDone").addEventListener("click", () => showScreen("homeScreen"));

function startReaction() {
  const box = document.getElementById("reactionBox");
  const state = document.getElementById("reactionState");
  state.innerHTML = `<div class="wait-text">⏳ Wait for green...</div>`;
  box.className = "reaction-box waiting";
  reactionState = "waiting";
  clearTimeout(reactionTimer);
  const delay = 2000 + Math.random() * 4000;
  reactionTimer = setTimeout(() => {
    box.className = "reaction-box go";
    state.innerHTML = `<div class="go-text">CLICK!</div>`;
    reactionState = "go";
    reactionStart = Date.now();
  }, delay);

  box.onclick = handleReactionClick;
}

function handleReactionClick() {
  if (reactionState === "waiting") {
    clearTimeout(reactionTimer);
    const box = document.getElementById("reactionBox");
    const state = document.getElementById("reactionState");
    box.className = "reaction-box too-early";
    state.innerHTML = `<div class="early-text">Too early! 😅<br><small>Click to try again</small></div>`;
    reactionState = "early";
  } else if (reactionState === "go") {
    const ms = Date.now() - reactionStart;
    reactionState = "done";
    showReactionResult(ms);
  } else if (reactionState === "early" || reactionState === "done") {
    startReaction();
  }
}

function showReactionResult(ms) {
  document.getElementById("reactionBox").classList.add("hidden");
  const results = document.getElementById("reactionResults");
  results.classList.remove("hidden");
  document.getElementById("reactionValue").textContent = ms;

  let compare = "";
  if (ms < 200) compare = `<strong>Incredible!</strong> Top 1% reaction time. You're superhuman.`;
  else if (ms < 250) compare = `<strong>Excellent!</strong> Faster than ${Math.round((284-ms)/284*100)}% of people.`;
  else if (ms < 300) compare = `<strong>Above average!</strong> Human average is ~284ms.`;
  else if (ms < 400) compare = `Average reaction time. Human average is ~284ms.`;
  else compare = `Slower than average. Human average is ~284ms. Keep practicing!`;

  document.getElementById("reactionCompare").innerHTML = compare;

  if (!scores.reaction || ms < scores.reaction) {
    scores.reaction = ms;
    saveScores();
  }

  document.getElementById("reactionBox").onclick = null;
  document.getElementById("reactionBox").classList.remove("hidden");
  document.getElementById("reactionBox").className = "reaction-box";
  document.getElementById("reactionBox").onclick = null;
}

// ── MEMORY SEQUENCE ──────────────────────────────────────
let memLevel = 1;
let memSequence = [];
let memPlayerSeq = [];
let memLives = 3;
let memCells = [];
let memPlaying = false;

function initMemory() {
  memLevel = 1; memLives = 3; memSequence = []; memPlayerSeq = [];
  document.getElementById("memoryLevel").textContent = 1;
  document.getElementById("memoryLives").textContent = "❤️❤️❤️";
  document.getElementById("memoryResult").classList.add("hidden");
  buildMemoryGrid();
  setTimeout(() => nextMemoryRound(), 500);
}

function buildMemoryGrid() {
  const grid = document.getElementById("memoryGrid");
  grid.innerHTML = "";
  memCells = [];
  for (let i = 0; i < 16; i++) {
    const cell = document.createElement("div");
    cell.className = "memory-cell";
    cell.dataset.i = i;
    cell.addEventListener("click", () => memCellClick(i));
    grid.appendChild(cell);
    memCells.push(cell);
  }
}

function nextMemoryRound() {
  memPlayerSeq = [];
  memPlaying = true;
  document.getElementById("memoryInstruction").textContent = "Watch carefully...";
  memCells.forEach(c => c.classList.add("disabled"));
  memSequence.push(Math.floor(Math.random() * 16));
  playMemSequence(0);
}

function playMemSequence(i) {
  if (i >= memSequence.length) {
    setTimeout(() => {
      document.getElementById("memoryInstruction").textContent = "Now repeat the sequence!";
      memCells.forEach(c => c.classList.remove("disabled"));
      memPlaying = false;
    }, 400);
    return;
  }
  setTimeout(() => {
    const idx = memSequence[i];
    memCells[idx].classList.add("active");
    setTimeout(() => {
      memCells[idx].classList.remove("active");
      playMemSequence(i + 1);
    }, 400);
  }, i === 0 ? 400 : 200);
}

function memCellClick(i) {
  if (memPlaying) return;
  memCells[i].classList.add("active");
  setTimeout(() => memCells[i].classList.remove("active"), 200);
  memPlayerSeq.push(i);
  const pos = memPlayerSeq.length - 1;

  if (memPlayerSeq[pos] !== memSequence[pos]) {
    memCells[i].classList.add("wrong");
    setTimeout(() => memCells[i].classList.remove("wrong"), 400);
    memLives--;
    const hearts = ["","❤️","❤️❤️","❤️❤️❤️"][memLives] || "";
    document.getElementById("memoryLives").textContent = hearts;
    memPlayerSeq = [];
    if (memLives <= 0) {
      endMemory();
    } else {
      document.getElementById("memoryInstruction").textContent = "Wrong! Watch again...";
      setTimeout(() => nextMemoryRound(), 800);
    }
    return;
  }

  if (memPlayerSeq.length === memSequence.length) {
    memLevel++;
    document.getElementById("memoryLevel").textContent = memLevel;
    document.getElementById("memoryInstruction").textContent = `Level ${memLevel}! Great memory!`;
    setTimeout(() => nextMemoryRound(), 800);
  }
}

function endMemory() {
  const level = memLevel;
  document.getElementById("memoryResult").classList.remove("hidden");
  document.getElementById("memoryScore").textContent = level;
  let compare = "";
  if (level >= 12) compare = `<strong>Extraordinary!</strong> Most people max out at level 7-9.`;
  else if (level >= 9) compare = `<strong>Excellent!</strong> Well above average memory.`;
  else if (level >= 7) compare = `<strong>Average!</strong> Most people reach level 7.`;
  else compare = `Keep practicing! Average is level 7.`;
  document.getElementById("memoryCompare").innerHTML = compare;
  if (!scores.memory || level > scores.memory) { scores.memory = level; saveScores(); }
}

document.getElementById("memoryRetry").addEventListener("click", initMemory);
document.getElementById("memoryDone").addEventListener("click", () => showScreen("homeScreen"));

// ── NUMBER MEMORY ────────────────────────────────────────
let numLevel = 1;
let numCurrent = "";

document.getElementById("numberStart").addEventListener("click", startNumberTest);
document.getElementById("numberRetry").addEventListener("click", () => {
  document.getElementById("numberResult").classList.add("hidden");
  document.getElementById("numberState").style.display = "";
  numLevel = 1;
  startNumberTest();
});
document.getElementById("numberDone").addEventListener("click", () => showScreen("homeScreen"));

function startNumberTest() {
  numCurrent = "";
  for (let i = 0; i < numLevel; i++) numCurrent += Math.floor(Math.random() * 10);
  document.getElementById("numberState").style.display = "none";
  document.getElementById("numberResult").classList.add("hidden");

  const wrap = document.getElementById("numberWrap");
  wrap.innerHTML = `
    <div class="number-progress">Level ${numLevel} — ${numLevel} digit${numLevel > 1 ? "s" : ""}</div>
    <div class="number-display">${numCurrent}</div>
    <p style="color:var(--muted);font-size:14px;margin-bottom:12px">Memorize it...</p>
  `;

  const hideTime = 1000 + numLevel * 400;
  setTimeout(() => {
    wrap.innerHTML = `
      <div class="number-progress">Type the number you saw:</div>
      <div class="number-input-wrap">
        <input class="number-input" id="numInput" type="number" placeholder="Type here..." autofocus/>
        <button class="btn-primary" id="numSubmit">Submit</button>
      </div>
    `;
    document.getElementById("numInput").focus();
    document.getElementById("numSubmit").addEventListener("click", checkNumber);
    document.getElementById("numInput").addEventListener("keydown", e => { if (e.key === "Enter") checkNumber(); });
  }, hideTime);
}

function checkNumber() {
  const input = document.getElementById("numInput");
  if (!input) return;
  const val = input.value.trim();
  if (val === numCurrent) {
    numLevel++;
    startNumberTest();
  } else {
    const finalLevel = numLevel;
    document.getElementById("numberResult").classList.remove("hidden");
    document.getElementById("numberScore").textContent = finalLevel;
    let compare = "";
    if (finalLevel >= 10) compare = `<strong>Exceptional!</strong> Far above average (7 digits).`;
    else if (finalLevel >= 8) compare = `<strong>Above average!</strong> Most people remember 7 digits.`;
    else if (finalLevel >= 7) compare = `<strong>Average!</strong> Average is 7 digits.`;
    else compare = `Below average. Average is 7 digits. Keep practicing!`;
    document.getElementById("numberCompare").innerHTML = compare;
    if (!scores.number || finalLevel > scores.number) { scores.number = finalLevel; saveScores(); }
    document.getElementById("numberWrap").innerHTML = "";
  }
}

// ── CHIMP TEST ───────────────────────────────────────────
let chimpLevel = 1;
let chimpNumbers = [];
let chimpNextNum = 1;
let chimpShowing = true;
let chimpCount = 4;

function initChimp() {
  chimpLevel = 1; chimpCount = 4; chimpNextNum = 1; chimpShowing = true;
  document.getElementById("chimpLevel").textContent = 1;
  document.getElementById("chimpCount").textContent = chimpCount;
  document.getElementById("chimpResult").classList.add("hidden");
  document.getElementById("chimpInstruction").textContent = "Memorize the positions, then click in order!";
  buildChimpGrid();
}

function buildChimpGrid() {
  const grid = document.getElementById("chimpGrid");
  const cols = Math.ceil(Math.sqrt(chimpCount + 2));
  grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  grid.style.maxWidth = (cols * 70 + (cols - 1) * 8) + "px";
  grid.innerHTML = "";
  chimpNumbers = [];
  chimpNextNum = 1;

  const totalCells = cols * cols;
  const positions = [];
  while (positions.length < chimpCount) {
    const p = Math.floor(Math.random() * totalCells);
    if (!positions.includes(p)) positions.push(p);
  }

  for (let i = 0; i < totalCells; i++) {
    const cell = document.createElement("div");
    cell.className = "memory-cell";
    const numIdx = positions.indexOf(i);
    if (numIdx !== -1) {
      const num = numIdx + 1;
      cell.dataset.num = num;
      cell.textContent = num;
      cell.style.background = "var(--surface2)";
      chimpNumbers.push({ cell, num });
      cell.addEventListener("click", () => chimpClick(cell, num));
    }
    grid.appendChild(cell);
  }
}

let chimpHidden = false;
function chimpClick(cell, num) {
  if (!chimpHidden && num === 1) {
    chimpNumbers.forEach(n => {
      if (n.num !== 1) {
        n.cell.textContent = "";
        n.cell.classList.add("hidden-num");
      }
    });
    chimpHidden = true;
  }

  if (num !== chimpNextNum) {
    cell.classList.add("wrong");
    setTimeout(() => {
      cell.classList.remove("wrong");
      endChimp();
    }, 400);
    return;
  }

  cell.classList.add("correct");
  cell.style.pointerEvents = "none";
  chimpNextNum++;

  if (chimpNextNum > chimpCount) {
    chimpLevel++;
    chimpCount++;
    chimpHidden = false;
    document.getElementById("chimpLevel").textContent = chimpLevel;
    document.getElementById("chimpCount").textContent = chimpCount;
    document.getElementById("chimpInstruction").textContent = `Level ${chimpLevel}! More numbers now...`;
    setTimeout(() => buildChimpGrid(), 600);
  }
}

function endChimp() {
  const level = chimpLevel;
  document.getElementById("chimpResult").classList.remove("hidden");
  document.getElementById("chimpScore").textContent = level;
  let compare = "";
  if (level >= 10) compare = `<strong>Genius level!</strong> Chimps typically beat humans here.`;
  else if (level >= 7) compare = `<strong>Above average!</strong> Most people reach level 5.`;
  else if (level >= 5) compare = `<strong>Average!</strong> Most people reach level 5.`;
  else compare = `Chimps beat you! Average human reaches level 5.`;
  document.getElementById("chimpCompare").innerHTML = compare;
  if (!scores.chimp || level > scores.chimp) { scores.chimp = level; saveScores(); }
}

document.getElementById("chimpRetry").addEventListener("click", initChimp);
document.getElementById("chimpDone").addEventListener("click", () => showScreen("homeScreen"));

// ── AIM TRAINER ──────────────────────────────────────────
let aimHits = 0;
let aimTimes = [];
let aimLastClick = 0;
let aimTarget = null;

document.getElementById("aimStart").addEventListener("click", startAim);
document.getElementById("aimRetry").addEventListener("click", () => {
  document.getElementById("aimResult").classList.add("hidden");
  startAim();
});
document.getElementById("aimDone").addEventListener("click", () => showScreen("homeScreen"));

function startAim() {
  aimHits = 0; aimTimes = []; aimLastClick = 0;
  document.getElementById("aimHits").textContent = 0;
  document.getElementById("aimAvg").textContent = "—";
  document.getElementById("aimResult").classList.add("hidden");
  const area = document.getElementById("aimArea");
  area.innerHTML = "";
  spawnTarget();
}

function spawnTarget() {
  const area = document.getElementById("aimArea");
  const size = 40 + Math.random() * 30;
  const x = size/2 + Math.random() * (area.offsetWidth - size);
  const y = size/2 + Math.random() * (area.offsetHeight - size);

  if (aimTarget) aimTarget.remove();
  aimTarget = document.createElement("div");
  aimTarget.className = "aim-target";
  aimTarget.style.cssText = `left:${x}px;top:${y}px;width:${size}px;height:${size}px`;
  aimTarget.addEventListener("click", hitTarget);
  area.appendChild(aimTarget);
  aimLastClick = Date.now();
}

function hitTarget() {
  const now = Date.now();
  if (aimLastClick > 0) {
    const ms = now - aimLastClick;
    aimTimes.push(ms);
  }
  aimHits++;
  document.getElementById("aimHits").textContent = aimHits;
  const avg = Math.round(aimTimes.reduce((a,b) => a+b, 0) / aimTimes.length);
  document.getElementById("aimAvg").textContent = avg || "—";

  if (aimHits >= 30) {
    endAim(avg);
    return;
  }
  spawnTarget();
}

function endAim(avg) {
  if (aimTarget) aimTarget.remove();
  document.getElementById("aimResult").classList.remove("hidden");
  document.getElementById("aimScore").textContent = avg;
  let compare = "";
  if (avg < 250) compare = `<strong>Professional level!</strong> Top tier aim.`;
  else if (avg < 320) compare = `<strong>Excellent!</strong> Above average aim.`;
  else if (avg < 400) compare = `<strong>Average!</strong> Average is ~380ms.`;
  else compare = `Below average. Average is ~380ms. Keep practicing!`;
  document.getElementById("aimCompare").innerHTML = compare;
  if (!scores.aim || avg < scores.aim) { scores.aim = avg; saveScores(); }
}

updateHomeScores();
