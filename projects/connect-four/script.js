const ROWS = 6;
const COLS = 7;

let board = [];
let currentPlayer = "red";
let gameOver = false;
let gameMode = null; // "player" | "computer"

const humanPlayer = "red";
const aiPlayer = "yellow";

// DOM Elements
const boardDiv = document.getElementById("board");
const statusText = document.getElementById("status");
const restartBtn = document.getElementById("restart");

const overlay = document.getElementById("overlay");
const welcomeModal = document.getElementById("welcomeModal");
const modeModal = document.getElementById("modeModal");
const gameContainer = document.getElementById("gameContainer");

/* =========================
   START FLOW
========================= */
function startGame() {
  welcomeModal.classList.add("hidden");
  modeModal.classList.remove("hidden");
}

/* =========================
   MODE SELECTION
========================= */
function setMode(mode) {
  gameMode = mode;

  overlay.classList.add("hidden");
  welcomeModal.classList.add("hidden");
  modeModal.classList.add("hidden");

  gameContainer.classList.remove("hidden");
  boardDiv.style.display = "grid";
  statusText.style.display = "block";
  restartBtn.style.display = "inline-block";

  initBoard();
}

/* =========================
   INIT BOARD
========================= */
function initBoard() {
  board = [];
  boardDiv.innerHTML = "";
  gameOver = false;
  currentPlayer = humanPlayer;

  statusText.textContent = "Player 🔴 Red's Turn";

  for (let r = 0; r < ROWS; r++) {
    board[r] = [];
    for (let c = 0; c < COLS; c++) {
      board[r][c] = null;
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.col = c;
      cell.addEventListener("click", handleMove);
      boardDiv.appendChild(cell);
    }
  }
}

/* =========================
   HANDLE MOVE
========================= */
function handleMove(e) {
  if (gameOver) return;
  if (gameMode === "computer" && currentPlayer === aiPlayer) return;

  const col = parseInt(e.target.dataset.col);
  makeMove(col, currentPlayer);
}

/* =========================
   MAKE MOVE
========================= */
function makeMove(col, player) {
  if (gameOver) return;

  const row = getAvailableRow(col);
  if (row === -1) return;

  board[row][col] = player;
  const index = row * COLS + col;
  boardDiv.children[index].classList.add(player);

  if (checkWin(row, col, player)) {
    statusText.textContent = `🎉 ${player === "red" ? "Red" : "Yellow"} Wins!`;
    gameOver = true;
    return;
  }

  if (board.flat().every(cell => cell !== null)) {
    statusText.textContent = "😐 It's a Draw!";
    gameOver = true;
    return;
  }

  currentPlayer = currentPlayer === "red" ? "yellow" : "red";
  statusText.textContent =
    `Player ${currentPlayer === "red" ? "🔴 Red" : "🟡 Yellow"}'s Turn`;

  if (gameMode === "computer" && currentPlayer === aiPlayer) {
    setTimeout(() => {
      makeMove(getRandomMove(), aiPlayer);
    }, 400);
  }
}

/* =========================
   HELPERS
========================= */
function getAvailableRow(col) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (!board[r][col]) return r;
  }
  return -1;
}

/* =========================
   WIN CHECK
========================= */
function checkWin(row, col, player) {
  return (
    checkDirection(row, col, player, 1, 0) ||
    checkDirection(row, col, player, 0, 1) ||
    checkDirection(row, col, player, 1, 1) ||
    checkDirection(row, col, player, 1, -1)
  );
}

function checkDirection(row, col, player, dr, dc) {
  let count = 1;
  count += countCells(row, col, player, dr, dc);
  count += countCells(row, col, player, -dr, -dc);
  return count >= 4;
}

function countCells(row, col, player, dr, dc) {
  let r = row + dr;
  let c = col + dc;
  let count = 0;

  while (
    r >= 0 && r < ROWS &&
    c >= 0 && c < COLS &&
    board[r][c] === player
  ) {
    count++;
    r += dr;
    c += dc;
  }
  return count;
}

/* =========================
   AI (RANDOM)
========================= */
function getRandomMove() {
  const cols = [];
  for (let c = 0; c < COLS; c++) {
    if (getAvailableRow(c) !== -1) cols.push(c);
  }
  return cols[Math.floor(Math.random() * cols.length)];
}

/* =========================
   RESTART GAME (FIXED)
========================= */
restartBtn.addEventListener("click", () => {
  board = [];
  gameOver = false;
  currentPlayer = humanPlayer;
  gameMode = null;

  boardDiv.innerHTML = "";
  boardDiv.style.display = "none";
  statusText.style.display = "none";
  restartBtn.style.display = "none";
  gameContainer.classList.add("hidden");

  overlay.classList.remove("hidden");
  welcomeModal.classList.remove("hidden");
  modeModal.classList.add("hidden");
});

/* =========================
   BUTTON WIRING
========================= */
document.getElementById("startBtn").addEventListener("click", startGame);
document.getElementById("twoPlayerBtn")
  .addEventListener("click", () => setMode("player"));
document.getElementById("aiBtn")
  .addEventListener("click", () => setMode("computer"));
