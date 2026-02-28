let N;
let board = [];
let solving = false;

function start() {
  if (solving) return;
  solving = true;

  N = parseInt(document.getElementById("nValue").value);
  board = Array.from({ length: N }, () => Array(N).fill(0));

  createBoard();
  solve(0);
}

function createBoard() {
  const boardDiv = document.getElementById("board");
  boardDiv.innerHTML = "";
  boardDiv.style.gridTemplateColumns = `repeat(${N}, 50px)`;

  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const cell = document.createElement("div");
      cell.className = "cell " + ((i + j) % 2 === 0 ? "light" : "dark");
      cell.id = `cell-${i}-${j}`;
      boardDiv.appendChild(cell);
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function solve(row) {
  if (row === N) {
    document.getElementById("status").textContent = "Solution Found!";
    solving = false;
    return true;
  }

  for (let col = 0; col < N; col++) {
    if (isSafe(row, col)) {
      board[row][col] = 1;
      updateCell(row, col, true);

      await sleep(400);

      if (await solve(row + 1)) return true;

      board[row][col] = 0;
      updateCell(row, col, false);

      await sleep(400);
    }
  }

  return false;
}

function isSafe(row, col) {
  for (let i = 0; i < row; i++)
    if (board[i][col]) return false;

  for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--)
    if (board[i][j]) return false;

  for (let i = row - 1, j = col + 1; i >= 0 && j < N; i--, j++)
    if (board[i][j]) return false;

  return true;
}

function updateCell(row, col, place) {
  const cell = document.getElementById(`cell-${row}-${col}`);
  if (place) {
    cell.textContent = "♛";
    cell.classList.add("queen");
  } else {
    cell.textContent = "";
    cell.classList.remove("queen");
  }
}

function resetBoard() {
  solving = false;
  document.getElementById("board").innerHTML = "";
  document.getElementById("status").textContent = "";
}
