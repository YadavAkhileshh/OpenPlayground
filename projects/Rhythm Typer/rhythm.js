// Rhythm Typer - musical typing game
const KEYS = ["a", "s", "d", "f"];
const LANE_COLORS = ["l0", "l1", "l2", "l3"];
const NOTE_NAMES = ["A", "S", "D", "F"];
const FREQS = [261.63, 329.63, 392.0, 523.25]; // C4 E4 G4 C5
const BPM = 120;
const BEAT_MS = 60000 / BPM;
const HIT_WINDOW = 100; // ms perfect
const GOOD_WINDOW = 200; // ms good
const OK_WINDOW = 320; // ms ok

let score = 0,
  combo = 0,
  maxCombo = 0,
  totalNotes = 0,
  hitNotes = 0;
let notes = [],
  running = false,
  gameStarted = false;
let beatCount = 0,
  lastBeat = 0;
let audioCtx = null;
let animFrame;
let endTimer = null;
let gameDuration = 60000; // 60 seconds
let gameStartTime = 0;

const $ = (id) => document.getElementById(id);

function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playNote(lane, type = "hit") {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.frequency.value = FREQS[lane];
  osc.type = type === "hit" ? "triangle" : "sawtooth";
  const now = audioCtx.currentTime;
  gain.gain.setValueAtTime(type === "miss" ? 0.05 : 0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
  osc.start(now);
  osc.stop(now + 0.3);
}

function playBeat() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.frequency.value = beatCount % 4 === 0 ? 120 : 80;
  osc.type = "sine";
  const now = audioCtx.currentTime;
  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
  osc.start(now);
  osc.stop(now + 0.1);
}

const stageEl = $("stage");
const notesContainer = $("notes-container");
const feedbackArea = $("feedback-area");
const hitZoneEl = $("hit-zone");

function getHitY() {
  return (
    hitZoneEl.getBoundingClientRect().top - stageEl.getBoundingClientRect().top
  );
}

function getLaneCenterX(lane) {
  const lanes = stageEl.querySelectorAll(".lane");
  const laneEl = lanes[lane];
  const rect = laneEl.getBoundingClientRect();
  const stageRect = stageEl.getBoundingClientRect();
  return rect.left - stageRect.left + rect.width / 2 - 28;
}

function spawnNote(lane, beatDelay = 0) {
  const el = document.createElement("div");
  el.className = `note ${LANE_COLORS[lane]}`;
  el.textContent = NOTE_NAMES[lane];
  el.style.left = getLaneCenterX(lane) + "px";
  el.style.top = "-60px";
  notesContainer.appendChild(el);

  const hitY = getHitY();
  const speed = hitY / (BEAT_MS * 2.5); // pixels per ms, arrive in 2.5 beats
  const spawnTime = performance.now() + beatDelay;
  const targetTime = spawnTime + BEAT_MS * 2.5;

  notes.push({ lane, el, spawnTime, targetTime, hit: false, missed: false });
}

function buildPattern(beatTime) {
  // Spawn note on each beat for a random lane, sometimes double
  const lane = Math.floor(Math.random() * 4);
  spawnNote(lane);
  // Sometimes spawn second note offset by 1 lane
  if (Math.random() < 0.3 && combo > 3) {
    const lane2 = (lane + 1 + Math.floor(Math.random() * 2)) % 4;
    setTimeout(() => {
      if (running) spawnNote(lane2);
    }, BEAT_MS * 0.5);
  }
}

let beatInterval;

function startBeat() {
  lastBeat = performance.now();
  beatCount = 0;
  buildPattern(lastBeat);
  beatInterval = setInterval(() => {
    if (!running) return;
    beatCount++;
    lastBeat = performance.now();
    playBeat();
    updateBeatDots();
    buildPattern(lastBeat);
  }, BEAT_MS);
}

function updateBeatDots() {
  const dots = document.querySelectorAll(".beat-dot");
  const beat = beatCount % 4;
  dots.forEach((d, i) => d.classList.toggle("active", i === beat));
}

function loop(time) {
  animFrame = requestAnimationFrame(loop);
  if (!running) return;

  const hitY = getHitY();

  for (let i = notes.length - 1; i >= 0; i--) {
    const n = notes[i];
    if (n.hit || n.missed) {
      if (parseFloat(n.el.style.top) > window.innerHeight + 100) {
        n.el.remove();
        notes.splice(i, 1);
      }
      continue;
    }

    const elapsed = time - n.spawnTime;
    const totalTime = n.targetTime - n.spawnTime;
    const progress = elapsed / totalTime;
    const y = -60 + (hitY + 60) * progress;
    n.el.style.top = y + "px";

    // Auto-miss if past window
    if (time > n.targetTime + OK_WINDOW && !n.hit) {
      missNote(n, i);
    }
  }

  // End game timer
  if (gameStarted && time - gameStartTime > gameDuration && !endTimer) {
    endTimer = setTimeout(endGame, 2000);
    running = false;
  }
}

function tryHit(lane) {
  if (!running) return;
  const now = performance.now();
  const hitY = getHitY();

  // Find best matching note for this lane in hit window
  let best = null,
    bestDiff = Infinity;
  for (const n of notes) {
    if (n.lane !== lane || n.hit || n.missed) continue;
    const diff = Math.abs(now - n.targetTime);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = n;
    }
  }

  if (best && bestDiff <= OK_WINDOW) {
    hitNote(best, bestDiff);
  } else {
    // Bad hit
    combo = 0;
    updateComboDisplay();
    playNote(lane, "miss");
    pressKey(lane);
  }
}

function hitNote(n, diff) {
  n.hit = true;
  n.el.classList.add("hit-flash");
  setTimeout(() => n.el.classList.remove("hit-flash"), 150);

  let pts, label, cls;
  if (diff <= HIT_WINDOW) {
    pts = 300;
    label = "PERFECT!";
    cls = "fb-perfect";
  } else if (diff <= GOOD_WINDOW) {
    pts = 150;
    label = "GOOD";
    cls = "fb-good";
  } else {
    pts = 50;
    label = "OK";
    cls = "fb-ok";
  }

  combo++;
  maxCombo = Math.max(maxCombo, combo);
  hitNotes++;
  totalNotes++;
  score += pts * Math.max(1, Math.floor(combo / 3));
  $("score").textContent = score;
  updateComboDisplay();
  updateAccuracy();
  playNote(n.lane, "hit");
  pressKey(n.lane);

  const fbEl = document.createElement("div");
  fbEl.className = `feedback-text ${cls}`;
  fbEl.textContent = label;
  const x = getLaneCenterX(n.lane) + 8;
  const hitY = getHitY();
  fbEl.style.left = x + "px";
  fbEl.style.top = hitY - 30 + "px";
  feedbackArea.appendChild(fbEl);
  setTimeout(() => fbEl.remove(), 700);
}

function missNote(n, i) {
  n.missed = true;
  n.el.classList.add("missed");
  combo = 0;
  totalNotes++;
  updateComboDisplay();
  updateAccuracy();

  const fbEl = document.createElement("div");
  fbEl.className = "feedback-text fb-miss";
  fbEl.textContent = "MISS";
  fbEl.style.left = getLaneCenterX(n.lane) + "px";
  fbEl.style.top = getHitY() + "px";
  feedbackArea.appendChild(fbEl);
  setTimeout(() => fbEl.remove(), 700);
}

function updateComboDisplay() {
  const num = $("combo-num");
  num.textContent = `x${combo}`;
  if (combo >= 20) num.style.color = "#ffd700";
  else if (combo >= 10) num.style.color = "#34c759";
  else if (combo >= 5) num.style.color = "#ff9500";
  else num.style.color = "white";
}

function updateAccuracy() {
  if (totalNotes === 0) {
    $("accuracy").textContent = "—";
    return;
  }
  const pct = Math.round((hitNotes / totalNotes) * 100);
  $("accuracy").textContent = pct + "%";
}

function pressKey(lane) {
  const keys = document.querySelectorAll(".kb-key");
  if (!keys[lane]) return;
  keys[lane].classList.add("pressed");
  setTimeout(() => keys[lane].classList.remove("pressed"), 120);
}

function startGame() {
  initAudio();
  if (audioCtx.state === "suspended") audioCtx.resume();
  notes.forEach((n) => n.el.remove());
  notes = [];
  score = 0;
  combo = 0;
  maxCombo = 0;
  totalNotes = 0;
  hitNotes = 0;
  $("score").textContent = 0;
  $("accuracy").textContent = "—";
  $("combo-num").textContent = "x1";
  $("overlay").classList.remove("active");
  $("end-overlay").classList.remove("active");
  running = true;
  gameStarted = true;
  endTimer = null;
  gameStartTime = performance.now();
  clearInterval(beatInterval);
  startBeat();
  if (!animFrame) animFrame = requestAnimationFrame(loop);
  buildBeatDots();
}

function buildBeatDots() {
  const bi = $("beat-indicator");
  bi.innerHTML = "";
  for (let i = 0; i < 4; i++) {
    const d = document.createElement("div");
    d.className = "beat-dot";
    bi.appendChild(d);
  }
}

function buildKeyboard() {
  const kd = $("keyboard-display");
  KEYS.forEach((key, i) => {
    const el = document.createElement("div");
    el.className = `kb-key k${i}`;
    el.textContent = key.toUpperCase();
    kd.insertBefore(el, $("beat-indicator"));
  });
}

function endGame() {
  running = false;
  clearInterval(beatInterval);
  $("end-score").textContent = score;
  $("end-acc").textContent = totalNotes
    ? Math.round((hitNotes / totalNotes) * 100) + "%"
    : "0%";
  $("end-combo").textContent = "x" + maxCombo;
  setTimeout(() => $("end-overlay").classList.add("active"), 500);
}

// Controls
document.addEventListener("keydown", (e) => {
  if (e.repeat) return;
  if (e.code === "Space") {
    if (
      !gameStarted ||
      $("overlay").classList.contains("active") ||
      $("end-overlay").classList.contains("active")
    ) {
      startGame();
      return;
    }
  }
  const lane = KEYS.indexOf(e.key.toLowerCase());
  if (lane !== -1 && running) tryHit(lane);
});

$("start-btn").addEventListener("click", startGame);
$("retry-btn").addEventListener("click", startGame);

buildKeyboard();
buildBeatDots();
requestAnimationFrame(loop);
