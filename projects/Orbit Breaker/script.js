const arena = document.getElementById("arena");
const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
const energyEl = document.getElementById("energy");

const overlay = document.getElementById("overlay");
const startBtn = document.getElementById("startBtn");

let state = {
  running: false,
  score: 0,
  level: 1,
  energy: 100,
  orbits: [],
};

startBtn.onclick = start;
arena.onclick = pulse;

function start() {
  overlay.style.display = "none";
  reset();
  spawnOrbits();
}

function reset() {
  arena.querySelectorAll(".orbit").forEach((o) => o.remove());
  state.score = 0;
  state.level = 1;
  state.energy = 100;
  updateHUD();
}

function spawnOrbits() {
  for (let i = 0; i < state.level + 2; i++) {
    const o = document.createElement("div");
    o.className = "orbit";
    o.style.setProperty("--r", `${80 + i * 28}px`);
    o.style.animationDuration = `${6 - i * 0.5}s`;
    arena.appendChild(o);
    state.orbits.push(o);
  }
}

function pulse(e) {
  if (state.energy <= 0) return;

  state.energy -= 5;
  energyEl.textContent = state.energy;

  const p = document.createElement("div");
  p.className = "pulse";
  p.style.left = e.clientX - arena.offsetLeft - 20 + "px";
  p.style.top = e.clientY - arena.offsetTop - 20 + "px";
  arena.appendChild(p);

  setTimeout(() => p.remove(), 600);

  checkHits();
}

function checkHits() {
  state.orbits.forEach((o, i) => {
    const r = o.getBoundingClientRect();
    const a = arena.getBoundingClientRect();

    if (Math.abs(r.left - a.left - a.width / 2) < 20) {
      o.remove();
      state.orbits.splice(i, 1);
      state.score += 50;
    }
  });

  if (state.orbits.length === 0) nextLevel();
  updateHUD();
}

function nextLevel() {
  state.level++;
  state.energy = Math.min(100, state.energy + 30);
  spawnOrbits();
}

function updateHUD() {
  scoreEl.textContent = state.score;
  levelEl.textContent = state.level;
  energyEl.textContent = state.energy;
}
