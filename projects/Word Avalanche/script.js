const WORDS = [
  "frost",
  "glacier",
  "blizzard",
  "peak",
  "alpine",
  "snow",
  "ice",
  "cold",
  "wind",
  "storm",
  "crystal",
  "frozen",
  "polar",
  "tundra",
  "flurry",
  "drift",
  "sleet",
  "hail",
  "freeze",
  "chill",
  "summit",
  "ridge",
  "slope",
  "avalanche",
  "powder",
  "cabin",
  "nordic",
  "yukon",
  "arctic",
  "fjord",
  "mountain",
  "thunder",
  "lightning",
  "tempest",
  "gale",
  "squall",
  "whiteout",
  "frostbite",
  "snowdrift",
  "hypothermia",
  "permafrost",
  "crevasse",
  "iceberg",
  "glacier",
  "expedition",
  "altitude",
  "frostwork",
  "cascade",
  "torrent",
  "rapids",
  "current",
  "vortex",
  "cyclone",
  "maelstrom",
  "deluge",
  "torrent",
];

let words = [],
  score = 0,
  level = 1,
  lives = 3,
  gameRunning = false;
let spawnTimer, fallInterval, wordInput, wordsArea;
let targeted = null;
let spawnRate = 3000,
  fallSpeed = 0.3;
const LEVEL_UP_SCORE = 150;

const $ = (id) => document.getElementById(id);

function init() {
  wordInput = $("word-input");
  wordsArea = $("words-area");
  $("start-btn").addEventListener("click", startGame);
  $("restart-btn").addEventListener("click", startGame);
  wordInput.addEventListener("input", onType);
  wordInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      submitWord();
    }
  });
  updateBest();
}

function updateBest() {
  const best = localStorage.getItem("wa-best") || 0;
  $("best").textContent = best;
  $("overlay-best").textContent = best;
  $("go-best").textContent = best;
}

function startGame() {
  words.forEach((w) => w.el.remove());
  words = [];
  score = 0;
  level = 1;
  lives = 3;
  targeted = null;
  spawnRate = 3000;
  fallSpeed = 0.3;
  $("score").textContent = 0;
  $("level").textContent = 1;
  updateLives();
  $("overlay").classList.remove("active");
  $("gameover-overlay").classList.remove("active");
  wordInput.value = "";
  wordInput.focus();
  gameRunning = true;
  clearInterval(spawnTimer);
  clearInterval(fallInterval);
  spawnWord();
  spawnTimer = setInterval(spawnWord, spawnRate);
  fallInterval = setInterval(updateFall, 30);
}

function spawnWord() {
  const areaW = wordsArea.offsetWidth;
  const word = WORDS[Math.floor(Math.random() * WORDS.length)].toUpperCase();
  const el = document.createElement("div");
  el.className = "falling-word";
  el.textContent = word;
  const x = 20 + Math.random() * (areaW - 160);
  el.style.left = x + "px";
  el.style.top = "0px";
  wordsArea.appendChild(el);
  words.push({ word, el, y: 0, x });
}

function updateFall() {
  if (!gameRunning) return;
  const areaH = wordsArea.offsetHeight;
  for (let i = words.length - 1; i >= 0; i--) {
    const w = words[i];
    w.y += fallSpeed * (1 + level * 0.15);
    w.el.style.top = w.y + "px";
    const danger = w.y > areaH * 0.75;
    if (danger && !w.el.classList.contains("targeted")) {
      w.el.classList.add("danger");
    }
    if (w.y + 40 >= areaH) {
      hitGround(w, i);
    }
  }
}

function hitGround(w, i) {
  loseLife();
  w.el.remove();
  words.splice(i, 1);
  if (targeted === w) {
    targeted = null;
    wordInput.value = "";
    retarget();
  }
  shakeGame();
}

function loseLife() {
  if (lives <= 0) return;
  lives--;
  updateLives();
  if (lives <= 0) endGame();
}

function updateLives() {
  const hearts = document.querySelectorAll(".heart");
  hearts.forEach((h, i) => {
    h.classList.toggle("lost", i >= lives);
  });
}

function onType() {
  const val = wordInput.value.trim().toUpperCase();
  if (!val) {
    clearTarget();
    return;
  }
  if (!targeted) {
    retarget(val);
    return;
  }
  if (!targeted.word.startsWith(val)) {
    retarget(val);
  } else {
    highlightTarget(val);
  }
}

function retarget(prefix = "") {
  clearTarget();
  if (!prefix) return;
  let best = null,
    bestY = -Infinity;
  for (const w of words) {
    if (w.word.startsWith(prefix) && w.y > bestY) {
      bestY = w.y;
      best = w;
    }
  }
  if (best) {
    targeted = best;
    best.el.classList.remove("danger");
    best.el.classList.add("targeted");
    highlightTarget(prefix);
  }
}

function highlightTarget(prefix) {
  if (!targeted) return;
  const word = targeted.word;
  targeted.el.innerHTML = `<span class="matched-chars">${word.slice(0, prefix.length)}</span>${word.slice(prefix.length)}`;
}

function clearTarget() {
  if (targeted) {
    targeted.el.classList.remove("targeted");
    targeted.el.innerHTML = targeted.word;
    targeted = null;
  }
}

function submitWord() {
  const val = wordInput.value.trim().toUpperCase();
  if (!val) return;
  const match = words.find((w) => w.word === val);
  if (match) {
    destroyWord(match);
  }
  wordInput.value = "";
  targeted = null;
}

function destroyWord(w) {
  const idx = words.indexOf(w);
  if (idx === -1) return;
  const pts = Math.max(10, Math.ceil(w.y / 5)) + level * 5;
  score += pts;
  $("score").textContent = score;
  spawnParticle(w.el, "+" + pts);
  w.el.remove();
  words.splice(idx, 1);
  targeted = null;
  checkLevelUp();
}

function spawnParticle(el, text) {
  const rect = el.getBoundingClientRect();
  const gameRect = document
    .getElementById("game-container")
    .getBoundingClientRect();
  const p = document.createElement("div");
  p.className = "particle";
  p.textContent = text;
  p.style.left = rect.left - gameRect.left + rect.width / 2 + "px";
  p.style.top = rect.top - gameRect.top + "px";
  p.style.color = "#ffd700";
  document.getElementById("particles").appendChild(p);
  setTimeout(() => p.remove(), 800);
}

function checkLevelUp() {
  const newLevel = Math.floor(score / LEVEL_UP_SCORE) + 1;
  if (newLevel > level) {
    level = newLevel;
    $("level").textContent = level;
    clearInterval(spawnTimer);
    spawnRate = Math.max(800, 3000 - (level - 1) * 300);
    fallSpeed = 0.3 + (level - 1) * 0.08;
    spawnTimer = setInterval(spawnWord, spawnRate);
  }
}

function endGame() {
  gameRunning = false;
  clearInterval(spawnTimer);
  clearInterval(fallInterval);
  const best = Math.max(score, parseInt(localStorage.getItem("wa-best") || 0));
  localStorage.setItem("wa-best", best);
  $("go-score").textContent = score;
  $("go-best").textContent = best;
  $("best").textContent = best;
  setTimeout(() => $("gameover-overlay").classList.add("active"), 600);
}

function shakeGame() {
  const gc = document.getElementById("game-container");
  gc.style.transform = "translateX(-5px)";
  setTimeout(() => (gc.style.transform = "translateX(5px)"), 80);
  setTimeout(() => (gc.style.transform = ""), 160);
}

document.addEventListener("DOMContentLoaded", init);
document.addEventListener("keydown", () => {
  if (gameRunning) wordInput.focus();
});
