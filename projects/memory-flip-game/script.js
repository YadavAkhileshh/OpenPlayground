// =====================
// DOM ELEMENTS
// =====================
const board = document.getElementById("board");
const statusText = document.getElementById("status");
const levelEl = document.getElementById("level");
const timeEl = document.getElementById("time");
const movesEl = document.getElementById("moves");
const startBtn = document.getElementById("startBtn");

const modal = document.getElementById("levelModal");
const modalText = document.getElementById("modalText");
const nextLevelBtn = document.getElementById("nextLevelBtn");
const restartLevelBtn = document.getElementById("restartLevelBtn");
const stopGameBtn = document.getElementById("stopGameBtn");

const app = document.getElementById("app");

// =====================
// GAME DATA
// =====================
const symbols = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("");

const levels = [
  { r: 2, c: 2, show: 5, moves: 6 },
  { r: 2, c: 3, show: 6, moves: 8 },
  { r: 3, c: 3, show: 7, moves: 12 },
  { r: 3, c: 4, show: 8, moves: 14 },
  { r: 4, c: 4, show: 10, moves: 18 },
  { r: 4, c: 5, show: 12, moves: 22 },
  { r: 5, c: 5, show: 14, moves: 26 },
  { r: 5, c: 6, show: 16, moves: 30 },
  { r: 6, c: 6, show: 18, moves: 36 },
  { r: 6, c: 7, show: 20, moves: 42 }
];

// =====================
// GAME STATE
// =====================
let level = 0;
let first = null;
let second = null;
let matched = 0;
let moves = 0;
let timer = null;
let lock = true;
let gameStarted = false;
let popupType = ""; // "success" | "fail"

// =====================
// UTIL
// =====================
function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

// =====================
// START LEVEL
// =====================
function startLevel() {
  clearInterval(timer);
  board.innerHTML = "";

  first = null;
  second = null;
  matched = 0;
  moves = 0;
  lock = true;
  gameStarted = true;

  const cfg = levels[level];
  levelEl.textContent = level + 1;
  movesEl.textContent = moves;
  timeEl.textContent = cfg.show;

  board.style.gridTemplateColumns = `repeat(${cfg.c}, 90px)`;

  let cards = [];
  for (let i = 0; i < (cfg.r * cfg.c) / 2; i++) {
    cards.push(symbols[i], symbols[i]);
  }

  shuffle(cards);

  cards.forEach(sym => {
    const card = document.createElement("div");
    card.className = "card";
    card.textContent = sym;
    card.dataset.sym = sym;
    card.addEventListener("click", () => flipCard(card));
    board.appendChild(card);
  });

  statusText.textContent = "Memorize the cards!";

  timer = setInterval(() => {
    timeEl.textContent--;
    if (timeEl.textContent === "0") {
      clearInterval(timer);
      hideCards();
      lock = false;
      statusText.textContent = "Match all pairs!";
    }
  }, 1000);
}

// =====================
// HIDE CARDS
// =====================
function hideCards() {
  document.querySelectorAll(".card").forEach(card => {
    card.classList.add("hidden");
  });
}

// =====================
// FLIP CARD
// =====================
function flipCard(card) {
  if (!gameStarted || lock) return;
  if (!card.classList.contains("hidden")) return;

  card.classList.remove("hidden");

  if (!first) {
    first = card;
    return;
  }

  second = card;
  lock = true;
  moves++;
  movesEl.textContent = moves;

  // ❌ OUT OF MOVES
  if (moves > levels[level].moves) {
    showOutOfMovesPopup();
    return;
  }

  // ✅ MATCH
  if (first.dataset.sym === second.dataset.sym) {
    first.classList.add("matched");
    second.classList.add("matched");
    matched += 2;
    resetTurn();

    if (matched === board.children.length) {
      showSuccessPopup();
    }
  }
  // ❌ NOT MATCH
  else {
    setTimeout(() => {
      first.classList.add("hidden");
      second.classList.add("hidden");
      resetTurn();
    }, 700);
  }
}

// =====================
// RESET TURN
// =====================
function resetTurn() {
  first = null;
  second = null;
  lock = false;
}

// =====================
// SUCCESS POPUP
// =====================
function showSuccessPopup() {
  gameStarted = false;
  lock = true;
  popupType = "success";

  modalText.textContent = `🎉 Congratulations! You completed Level ${level + 1}`;

  nextLevelBtn.style.display = "inline-block";
  restartLevelBtn.style.display = "inline-block";
  stopGameBtn.style.display = "inline-block";

  app.classList.add("hidden");
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
}

// =====================
// OUT OF MOVES POPUP
// =====================
function showOutOfMovesPopup() {
  gameStarted = false;
  lock = true;
  popupType = "fail";

  modalText.textContent = "❌ You are out of moves!";

  nextLevelBtn.style.display = "none";
  restartLevelBtn.style.display = "inline-block";
  stopGameBtn.style.display = "inline-block";

  app.classList.add("hidden");
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
}

// =====================
// MODAL BUTTON ACTIONS
// =====================
nextLevelBtn.onclick = () => {
  modal.style.display = "none";
  document.body.style.overflow = "auto";
  app.classList.remove("hidden");

  if (popupType === "success") {
    level++;
    if (level < levels.length) {
      startLevel();
    } else {
      statusText.textContent = "🎉 All Levels Completed!";
    }
  }
};

restartLevelBtn.onclick = () => {
  modal.style.display = "none";
  document.body.style.overflow = "auto";
  app.classList.remove("hidden");
  startLevel();
};

stopGameBtn.onclick = () => {
  modal.style.display = "none";
  document.body.style.overflow = "auto";
  app.classList.remove("hidden");

  board.innerHTML = "";
  statusText.textContent = "Game stopped. Click Start to play again.";
  gameStarted = false;
};

// =====================
// START GAME BUTTON
// =====================
startBtn.onclick = () => {
  modal.style.display = "none";
  document.body.style.overflow = "auto";
  app.classList.remove("hidden");

  level = 0;
  startLevel();
};
