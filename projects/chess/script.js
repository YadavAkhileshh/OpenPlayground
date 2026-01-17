
/* ===== PIECES ===== */
const pieces = {
  r: "♜", n: "♞", b: "♝", q: "♛", k: "♚", p: "♟",
  R: "♖", N: "♘", B: "♗", Q: "♕", K: "♔", P: "♙"
};

/* ===== INITIAL BOARD ===== */
let boardState = [
  "rnbqkbnr",
  "pppppppp",
  "........",
  "........",
  "........",
  "........",
  "PPPPPPPP",
  "RNBQKBNR"
];

const board = document.getElementById("board");
const turnText = document.getElementById("turn");

let selected = null;
let currentTurn = "white";

/* ===== CREATE BOARD ===== */
function createBoard() {
  board.innerHTML = "";
  boardState.forEach((row, r) => {
    [...row].forEach((cell, c) => {
      const square = document.createElement("div");
      square.className = `square ${(r + c) % 2 === 0 ? "light" : "dark"}`;
      square.dataset.row = r;
      square.dataset.col = c;

      if (cell !== ".") {
        const piece = document.createElement("div");
        piece.className = "piece";
        piece.textContent = pieces[cell];
        square.appendChild(piece);
      }

      square.addEventListener("click", () => handleClick(r, c));
      board.appendChild(square);
    });
  });
}

/* ===== CLICK HANDLER ===== */
function handleClick(r, c) {
  const piece = boardState[r][c];

  if (selected) {
    if (isValidMove(selected.r, selected.c, r, c)) {
      movePiece(selected.r, selected.c, r, c);
      switchTurn();
    }
    clearSelection();
  } else {
    if (piece !== "." && isCurrentTurnPiece(piece)) {
      selectSquare(r, c);
    }
  }
}

/* ===== SELECT ===== */
function selectSquare(r, c) {
  clearSelection();
  selected = { r, c };
  getSquare(r, c).classList.add("selected");
  showMoves(r, c);
}

/* ===== CLEAR ===== */
function clearSelection() {
  document.querySelectorAll(".square").forEach(sq => {
    sq.classList.remove("selected", "move");
  });
  selected = null;
}

/* ===== MOVE ===== */
function movePiece(sr, sc, tr, tc) {
  let row = boardState[sr].split("");
  let piece = row[sc];
  row[sc] = ".";
  boardState[sr] = row.join("");

  let targetRow = boardState[tr].split("");
  targetRow[tc] = piece;
  boardState[tr] = targetRow.join("");

  createBoard();
}

/* ===== TURN ===== */
function switchTurn() {
  currentTurn = currentTurn === "white" ? "black" : "white";
  turnText.textContent = `Turn: ${currentTurn.charAt(0).toUpperCase() + currentTurn.slice(1)}`;
}

/* ===== HELPERS ===== */
function getSquare(r, c) {
  return document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
}

function isCurrentTurnPiece(piece) {
  return currentTurn === "white" ? piece === piece.toUpperCase() : piece === piece.toLowerCase();
}

/* ===== BASIC MOVE LOGIC ===== */
function isValidMove(sr, sc, tr, tc) {
  if (sr === tr && sc === tc) return false;

  const piece = boardState[sr][sc];
  const target = boardState[tr][tc];

  if (target !== "." && isCurrentTurnPiece(target)) return false;

  const dr = tr - sr;
  const dc = tc - sc;

  switch (piece.toLowerCase()) {
    case "p":
      return currentTurn === "white"
        ? dr === -1 && dc === 0 && target === "."
        : dr === 1 && dc === 0 && target === ".";
    case "r":
      return dr === 0 || dc === 0;
    case "b":
      return Math.abs(dr) === Math.abs(dc);
    case "q":
      return dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc);
    case "n":
      return Math.abs(dr) * Math.abs(dc) === 2;
    case "k":
      return Math.abs(dr) <= 1 && Math.abs(dc) <= 1;
  }
  return false;
}

/* ===== SHOW MOVES ===== */
function showMoves(r, c) {
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (isValidMove(r, c, i, j)) {
        getSquare(i, j).classList.add("move");
      }
    }
  }
}

/* ===== INIT ===== */
createBoard();
