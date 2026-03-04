// ---------- Game Switching ----------
function showGame(id) {
  document.querySelectorAll(".game").forEach(g =>
    g.classList.add("hidden")
  );
  document.getElementById(id).classList.remove("hidden");
}

// ---------- Number Guess ----------
let secret = Math.floor(Math.random() * 100) + 1;

function checkGuess() {
  const val = Number(document.getElementById("guessInput").value);
  const msg = document.getElementById("guessMsg");

  if (val === secret) {
    msg.textContent = "🎉 Correct!";
    secret = Math.floor(Math.random() * 100) + 1;
  } else if (val < secret) {
    msg.textContent = "Too low!";
  } else {
    msg.textContent = "Too high!";
  }
}

// ---------- Memory Match ----------
const memoryBoard = document.getElementById("memoryBoard");
let cards = ["🍎","🍌","🍇","🍉","🍎","🍌","🍇","🍉"];
cards.sort(() => Math.random() - 0.5);

let first = null;
let second = null;

cards.forEach(symbol => {
  const card = document.createElement("div");
  card.className = "card";
  card.textContent = "?";

  card.onclick = () => {
    if (card.textContent !== "?") return;

    card.textContent = symbol;

    if (!first) {
      first = card;
    } else {
      second = card;

      setTimeout(() => {
        if (first.textContent !== second.textContent) {
          first.textContent = "?";
          second.textContent = "?";
        }
        first = null;
        second = null;
      }, 700);
    }
  };

  memoryBoard.appendChild(card);
});

// ---------- Tic Tac Toe ----------
const ticBoard = document.getElementById("ticBoard");
const ticStatus = document.getElementById("ticStatus");

let currentPlayer = "X";
let board = Array(9).fill("");

function checkWinner() {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  for (let w of wins) {
    const [a,b,c] = w;
    if (board[a] && board[a]===board[b] && board[a]===board[c]) {
      return board[a];
    }
  }
  return board.includes("") ? null : "Draw";
}

board.forEach((_, i) => {
  const cell = document.createElement("div");
  cell.className = "cell";

  cell.onclick = () => {
    if (board[i]) return;

    board[i] = currentPlayer;
    cell.textContent = currentPlayer;

    const result = checkWinner();
    if (result) {
      ticStatus.textContent =
        result === "Draw" ? "Draw!" : result + " Wins!";
      return;
    }

    currentPlayer = currentPlayer === "X" ? "O" : "X";
  };

  ticBoard.appendChild(cell);
});