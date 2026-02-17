const EMOJIS = [
  "🦊",
  "🐬",
  "🦋",
  "🌙",
  "⚡",
  "🍄",
  "🦜",
  "🐙",
  "🌺",
  "🦁",
  "🎸",
  "🍕",
  "🚀",
  "🐉",
  "🎭",
  "🌈",
  "🦚",
  "🍦",
];
let selectedGrid = 4,
  timer,
  timeLeft,
  moves,
  pairsLeft,
  flipped = [],
  locked = false,
  startTime;

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getGridDims() {
  if (selectedGrid === 4) return [4, 4];
  if (selectedGrid === 5) return [5, 4];
  return [6, 4];
}

function buildBoard() {
  const [cols, rows] = getGridDims();
  const count = (cols * rows) / 2;
  const pool = EMOJIS.slice(0, count);
  const deck = shuffle([...pool, ...pool]);
  const board = document.getElementById("board");
  board.innerHTML = "";
  board.style.gridTemplateColumns = `repeat(${cols},1fr)`;
  pairsLeft = count;
  document.getElementById("gPairs").textContent = pairsLeft;
  deck.forEach((emoji, i) => {
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.dataset.val = emoji;
    tile.dataset.idx = i;
    tile.innerHTML = `<div class="tile-face tile-back"></div><div class="tile-face tile-front">${emoji}</div>`;
    tile.addEventListener("click", () => onTileClick(tile));
    board.appendChild(tile);
  });
}

function onTileClick(tile) {
  if (
    locked ||
    tile.classList.contains("flipped") ||
    tile.classList.contains("matched")
  )
    return;
  tile.classList.add("flipped");
  flipped.push(tile);
  if (flipped.length === 2) {
    moves++;
    document.getElementById("gMoves").textContent = moves;
    locked = true;
    const [a, b] = flipped;
    if (a.dataset.val === b.dataset.val) {
      setTimeout(() => {
        a.classList.add("matched");
        b.classList.add("matched");
        flipped = [];
        locked = false;
        pairsLeft--;
        document.getElementById("gPairs").textContent = pairsLeft;
        showCombo("✓ MATCH!");
        if (pairsLeft === 0) endGame(true);
      }, 400);
    } else {
      setTimeout(() => {
        a.classList.remove("flipped");
        b.classList.remove("flipped");
        flipped = [];
        locked = false;
      }, 900);
    }
  }
}

function showCombo(msg) {
  const el = document.getElementById("comboMsg");
  el.textContent = msg;
  el.style.animation = "none";
  void el.offsetWidth;
  el.style.animation = "fadeUp .5s forwards";
}

function startGameFlow() {
  const [cols, rows] = getGridDims();
  const totalTime = selectedGrid === 4 ? 60 : selectedGrid === 5 ? 90 : 120;
  timeLeft = totalTime;
  moves = 0;
  flipped = [];
  locked = false;
  document.getElementById("gTime").textContent = timeLeft;
  document.getElementById("gMoves").textContent = 0;
  buildBoard();
  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft--;
    document.getElementById("gTime").textContent = timeLeft;
    if (timeLeft <= 10)
      document.getElementById("gTime").style.color = "#C1440E";
    else document.getElementById("gTime").style.color = "";
    if (timeLeft <= 0) {
      clearInterval(timer);
      endGame(false);
    }
  }, 1000);
  startTime = Date.now();
}

function endGame(won) {
  clearInterval(timer);
  const timeUsed = Math.round((Date.now() - startTime) / 1000);
  const [cols, rows] = getGridDims();
  const totalPairs = (cols * rows) / 2;
  const score = won
    ? Math.round((10000 / Math.max(moves, 1)) * (timeLeft + 1))
    : Math.round((totalPairs - pairsLeft) * 100);
  const key = "tf_" + selectedGrid;
  const prev = +localStorage.getItem(key) || 0;
  if (score > prev) localStorage.setItem(key, score);
  document.getElementById("resultBadge").textContent = won ? "🏆" : "😵";
  document.getElementById("resultTitle").textContent = won
    ? "CLEARED!"
    : "TIME UP!";
  document.getElementById("rTime").textContent = timeUsed + "s";
  document.getElementById("rMoves").textContent = moves;
  document.getElementById("rScore").textContent = score.toLocaleString();
  document.getElementById("rBest").textContent = Math.max(
    score,
    prev,
  ).toLocaleString();
  document.getElementById("bEasy").textContent =
    +localStorage.getItem("tf_4") || "—";
  document.getElementById("bMed").textContent =
    +localStorage.getItem("tf_5") || "—";
  document.getElementById("bHard").textContent =
    +localStorage.getItem("tf_6") || "—";
  setTimeout(
    () => {
      document
        .querySelectorAll(".screen")
        .forEach((s) => s.classList.remove("active"));
      document.getElementById("overScreen").classList.add("active");
    },
    won ? 600 : 300,
  );
}
