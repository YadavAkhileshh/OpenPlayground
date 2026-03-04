const WORD_POOLS = {
  7: [
    "STREAMS",
    "PLANETS",
    "KITCHEN",
    "GARDENS",
    "RAINBOW",
    "THUNDER",
    "FLOWERS",
    "JOURNEY",
    "VILLAGE",
    "DRAGONS",
  ],
  8: [
    "CLIMBING",
    "GRATEFUL",
    "MONSTERS",
    "WANDERER",
    "NORTHERN",
    "PATHWAYS",
    "SUNSHINE",
    "BROTHERS",
    "STARFISH",
    "MIDNIGHT",
  ],
  6: [
    "PLANET",
    "GARDEN",
    "STREAM",
    "CLOUDS",
    "BREEZE",
    "FLAMES",
    "GOLDEN",
    "FOREST",
    "BRIDGE",
    "CASTLE",
  ],
};
const MIN_VALID_WORDS = [
  "the",
  "and",
  "are",
  "for",
  "you",
  "his",
  "her",
  "him",
  "was",
  "all",
  "can",
  "had",
  "but",
  "not",
  "who",
  "did",
  "get",
  "has",
  "its",
  "may",
  "now",
  "one",
  "our",
  "own",
  "say",
  "too",
  "two",
  "day",
  "any",
  "how",
  "old",
  "use",
  "way",
  "see",
  "him",
  "how",
  "man",
  "new",
  "out",
  "put",
  "big",
  "few",
  "far",
  "run",
  "set",
  "sun",
  "top",
  "run",
  "red",
  "yet",
  "war",
  "eat",
  "met",
  "arm",
  "art",
  "bar",
  "bat",
  "bed",
  "bit",
  "bus",
  "cap",
  "car",
  "cat",
  "cup",
  "cut",
  "dog",
  "ear",
  "egg",
  "end",
  "eye",
  "fan",
  "fat",
  "fly",
  "fun",
  "gun",
  "hat",
  "hit",
  "ice",
  "jar",
  "key",
  "kid",
  "law",
  "leg",
  "lie",
  "lip",
  "map",
  "mud",
  "net",
  "oil",
  "pan",
  "pay",
  "pen",
  "pit",
  "pot",
  "ray",
  "sea",
  "sky",
  "tea",
  "tip",
  "toe",
  "ton",
  "toy",
  "try",
  "tub",
  "van",
  "vow",
  "web",
  "win",
  "zoo",
];

let letters = [],
  usedIdxs = [],
  foundWords = [],
  score = 0,
  streak = 0,
  bestStreak = 0,
  timeLeft = 60,
  timer,
  wordSet,
  currentWord = "",
  selectedBtns = [];

function pickLetters() {
  const pool = Object.values(WORD_POOLS).flat();
  const word = pool[Math.floor(Math.random() * pool.length)].toUpperCase();
  letters = word.split("").sort(() => Math.random() - 0.5);
  wordSet = new Set();
  // pre-compute valid combos (simplified: accept known words + any 3+ combo found in pool)
  const allWords = [
    ...Object.values(WORD_POOLS)
      .flat()
      .map((w) => w.toUpperCase()),
    ...MIN_VALID_WORDS.map((w) => w.toUpperCase()),
  ];
  allWords.forEach((w) => {
    if (w.length >= 3 && isFormable(w.toUpperCase(), letters))
      wordSet.add(w.toUpperCase());
  });
  // always allow the source word
  wordSet.add(word);
}

function isFormable(word, avail) {
  const pool = [...avail];
  for (const ch of word) {
    const i = pool.indexOf(ch);
    if (i === -1) return false;
    pool.splice(i, 1);
  }
  return true;
}

function renderLetters() {
  const ring = document.getElementById("lettersRing");
  ring.innerHTML = "";
  letters.forEach((l, i) => {
    const btn = document.createElement("button");
    btn.className = "letter-btn";
    btn.textContent = l;
    btn.dataset.idx = i;
    btn.addEventListener("click", () => selectLetter(btn, i));
    ring.appendChild(btn);
  });
}

function selectLetter(btn, idx) {
  if (btn.classList.contains("used")) return;
  btn.classList.add("used", "selected");
  selectedBtns.push(btn);
  usedIdxs.push(idx);
  currentWord += letters[idx];
  document.getElementById("currentWord").textContent = currentWord || "_";
}

function submitWord() {
  if (currentWord.length < 3) {
    clearWord();
    return;
  }
  if (foundWords.includes(currentWord)) {
    showFeedback("Already found!", "bad");
    clearWord();
    return;
  }
  if (wordSet.has(currentWord)) {
    const pts = (currentWord.length - 2) * 50 * (1 + streak * 0.5);
    score += Math.round(pts);
    streak++;
    if (streak > bestStreak) bestStreak = streak;
    foundWords.push(currentWord);
    addFoundWord(currentWord);
    showFeedback("+" + Math.round(pts), "good");
    document.getElementById("wsScore").textContent = score.toLocaleString();
    document.getElementById("wsStreak").textContent = streak;
  } else {
    showFeedback("Not a word", "bad");
    streak = 0;
    document.getElementById("wsStreak").textContent = 0;
  }
  clearWord();
}

function clearWord() {
  currentWord = "";
  usedIdxs = [];
  selectedBtns.forEach((b) => {
    b.classList.remove("used", "selected");
  });
  selectedBtns = [];
  document.getElementById("currentWord").textContent = "_";
}

function addFoundWord(w) {
  const grid = document.getElementById("wordGrid");
  const el = document.createElement("div");
  el.className = "found-word";
  el.textContent = w;
  grid.appendChild(el);
}

function showFeedback(msg, type) {
  const el = document.getElementById("ws-feedback");
  el.textContent = msg;
  el.className = "ws-feedback " + type;
  el.style.animation = "none";
  void el.offsetWidth;
  el.style.animation = "feedPop .6s forwards";
}

function startWordGame() {
  pickLetters();
  renderLetters();
  score = 0;
  streak = 0;
  bestStreak = 0;
  timeLeft = 60;
  foundWords = [];
  currentWord = "";
  document.getElementById("wsScore").textContent = "0";
  document.getElementById("wsStreak").textContent = "0";
  document.getElementById("wordGrid").innerHTML = "";
  document.getElementById("currentWord").textContent = "_";
  clearInterval(timer);
  const arc = document.getElementById("timerArc");
  const num = document.getElementById("timerNum");
  timer = setInterval(() => {
    timeLeft--;
    const pct = timeLeft / 60;
    arc.setAttribute("stroke-dashoffset", 163 * (1 - pct));
    arc.setAttribute("stroke", timeLeft > 15 ? "#1A1A2E" : "#C0392B");
    num.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timer);
      endWordGame();
    }
  }, 1000);
}

function endWordGame() {
  const key = "ws_hi";
  const key2 = "ws_streak";
  const prev = +localStorage.getItem(key) || 0;
  const prev2 = +localStorage.getItem(key2) || 0;
  if (score > prev) localStorage.setItem(key, score);
  if (bestStreak > prev2) localStorage.setItem(key2, bestStreak);
  document.getElementById("oeScore").textContent = score.toLocaleString();
  document.getElementById("oeWords").textContent = foundWords.length;
  document.getElementById("oeStreak").textContent = bestStreak;
  document.getElementById("oeHi").textContent = Math.max(
    score,
    prev,
  ).toLocaleString();
  const el = document.getElementById("oeFounds");
  el.innerHTML = foundWords
    .slice(-12)
    .map((w) => `<span>${w}</span>`)
    .join("");
  setTimeout(() => {
    document
      .querySelectorAll(".screen")
      .forEach((s) => s.classList.remove("active"));
    document.getElementById("overScreen").classList.add("active");
  }, 400);
}
