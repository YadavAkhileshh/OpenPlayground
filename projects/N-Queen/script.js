let size = 0;
let board = [];
let queens = [];
let gameActive = false;

function startGame() {
  size = parseInt(document.getElementById("boardSize").value);
  board = [];
  queens = [];
  gameActive = true;
  document.getElementById("winOverlay").style.display = "none";
  createBoard();
  setStatus("Place queens safely!");
}

function resetGame() {
  document.getElementById("board").innerHTML = "";
  document.getElementById("winOverlay").style.display = "none";
  setStatus("Click \"Start Game\" to begin");
  gameActive = false;
}

function createBoard() {
  const boardDiv = document.getElementById("board");
  boardDiv.innerHTML = "";
  boardDiv.style.gridTemplateColumns = `repeat(${size}, 60px)`;

  for (let r = 0; r < size; r++) {
    board[r] = [];
    for (let c = 0; c < size; c++) {
      const cell = document.createElement("div");
      cell.className = `cell ${(r + c) % 2 === 0 ? "white" : "black"}`;
      cell.onclick = () => placeQueen(r, c, cell);
      board[r][c] = cell;
      boardDiv.appendChild(cell);
    }
  }
}

function placeQueen(row, col, cell) {
  if (!gameActive || cell.textContent === "♛") return;

  if (isSafe(row, col)) {
    cell.textContent = "♛";
    cell.classList.add("queen");
    queens.push({ row, col });
    highlightAttacks();

    if (queens.length === size) {
      gameActive = false;
      document.getElementById("winOverlay").style.display = "flex";
    }
  } else {
    cell.classList.add("attack");
    setTimeout(() => cell.classList.remove("attack"), 400);
  }
}

function isSafe(r, c) {
  return !queens.some(q =>
    q.row === r ||
    q.col === c ||
    Math.abs(q.row - r) === Math.abs(q.col - c)
  );
}

function highlightAttacks() {
  document.querySelectorAll(".attack").forEach(c => c.classList.remove("attack"));

  queens.forEach(q => {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (
          r === q.row ||
          c === q.col ||
          Math.abs(q.row - r) === Math.abs(q.col - c)
        ) {
          if (board[r][c].textContent !== "♛") {
            board[r][c].classList.add("attack");
          }
        }
      }
    }
  });
}

function setStatus(msg) {
  document.getElementById("status").textContent = msg;
}