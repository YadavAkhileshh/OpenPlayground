const ROWS = 8;
const COLS = 8;
const MINES = 10;

const boardElement = document.getElementById("board");
const statusText = document.getElementById("status");
const restartBtn = document.getElementById("restart");

let board = [];
let gameOver = false;

function createBoard() {
  board = [];
  boardElement.innerHTML = "";
  statusText.textContent = "";
  gameOver = false;

  // Create cells
  for (let r = 0; r < ROWS; r++) {
    board[r] = [];
    for (let c = 0; c < COLS; c++) {
      const cell = {
        row: r,
        col: c,
        mine: false,
        revealed: false,
        flagged: false,
        count: 0,
        element: document.createElement("div"),
      };

      cell.element.className = "cell";
      cell.element.addEventListener("click", () => revealCell(cell));
      cell.element.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        toggleFlag(cell);
      });

      boardElement.appendChild(cell.element);
      board[r][c] = cell;
    }
  }

  placeMines();
  calculateNumbers();
}

function placeMines() {
  let placed = 0;
  while (placed < MINES) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    if (!board[r][c].mine) {
      board[r][c].mine = true;
      placed++;
    }
  }
}

function calculateNumbers() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c].mine) continue;
      board[r][c].count = getNeighbors(board[r][c])
        .filter(n => n.mine).length;
    }
  }
}

function getNeighbors(cell) {
  const neighbors = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const nr = cell.row + dr;
      const nc = cell.col + dc;
      if (
        nr >= 0 &&
        nr < ROWS &&
        nc >= 0 &&
        nc < COLS &&
        !(dr === 0 && dc === 0)
      ) {
        neighbors.push(board[nr][nc]);
      }
    }
  }
  return neighbors;
}

function revealCell(cell) {
  if (gameOver || cell.revealed || cell.flagged) return;

  cell.revealed = true;
  cell.element.classList.add("revealed");

  if (cell.mine) {
    cell.element.classList.add("mine");
    cell.element.textContent = "💣";
    endGame(false);
    return;
  }

  if (cell.count > 0) {
    cell.element.textContent = cell.count;
  } else {
    getNeighbors(cell).forEach(revealCell);
  }

  checkWin();
}

function toggleFlag(cell) {
  if (gameOver || cell.revealed) return;
  cell.flagged = !cell.flagged;
  cell.element.classList.toggle("flagged");
  cell.element.textContent = cell.flagged ? "🚩" : "";
}

function endGame(won) {
  gameOver = true;
  statusText.textContent = won ? "🎉 You Win!" : "💥 Game Over!";
  board.flat().forEach(cell => {
    if (cell.mine) {
      cell.element.textContent = "💣";
      cell.element.classList.add("revealed");
    }
  });
}

function checkWin() {
  const unrevealed = board.flat().filter(c => !c.revealed && !c.mine);
  if (unrevealed.length === 0) {
    endGame(true);
  }
}

restartBtn.addEventListener("click", createBoard);

createBoard();
