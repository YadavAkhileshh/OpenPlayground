const gameBoard = document.getElementById("gameBoard");
const minesLeftElement = document.getElementById("minesLeft");
const timerElement = document.getElementById("timer");
const resetBtn = document.getElementById("resetBtn");
const difficultyBtns = document.querySelectorAll(".difficulty-btn");

const difficulties = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard: { rows: 16, cols: 30, mines: 99 },
};

let currentDifficulty = "easy";
let board = [];
let gameOver = false;
let gameStarted = false;
let timerInterval = null;
let seconds = 0;
let minesLeft = 0;
let cellsToReveal = 0;

class Cell {
  constructor(row, col) {
    this.row = row;
    this.col = col;
    this.isMine = false;
    this.isRevealed = false;
    this.isFlagged = false;
    this.adjacentMines = 0;
    this.element = null;
  }

  createElement() {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.row = this.row;
    cell.dataset.col = this.col;

    cell.addEventListener("click", () => this.reveal());
    cell.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      this.toggleFlag();
    });

    this.element = cell;
    return cell;
  }

  reveal() {
    if (gameOver || this.isRevealed || this.isFlagged) return;

    if (!gameStarted) {
      gameStarted = true;
      startTimer();
    }

    this.isRevealed = true;
    this.element.classList.add("revealed");

    if (this.isMine) {
      this.element.textContent = "💣";
      this.element.classList.add("mine");
      endGame(false);
      return;
    }

    cellsToReveal--;

    if (this.adjacentMines > 0) {
      this.element.textContent = this.adjacentMines;
      this.element.classList.add(`number-${this.adjacentMines}`);
    } else {
      // Reveal adjacent cells if no adjacent mines
      this.revealAdjacent();
    }

    checkWin();
  }

  revealAdjacent() {
    const neighbors = this.getNeighbors();
    neighbors.forEach((neighbor) => {
      if (!neighbor.isRevealed && !neighbor.isFlagged) {
        neighbor.reveal();
      }
    });
  }

  toggleFlag() {
    if (gameOver || this.isRevealed) return;

    if (!gameStarted) {
      gameStarted = true;
      startTimer();
    }

    this.isFlagged = !this.isFlagged;

    if (this.isFlagged) {
      this.element.classList.add("flagged");
      this.element.textContent = "🚩";
      minesLeft--;
    } else {
      this.element.classList.remove("flagged");
      this.element.textContent = "";
      minesLeft++;
    }

    minesLeftElement.textContent = minesLeft;
  }

  getNeighbors() {
    const neighbors = [];
    const { rows, cols } = difficulties[currentDifficulty];

    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;

        const newRow = this.row + dr;
        const newCol = this.col + dc;

        if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
          neighbors.push(board[newRow][newCol]);
        }
      }
    }

    return neighbors;
  }

  calculateAdjacentMines() {
    const neighbors = this.getNeighbors();
    this.adjacentMines = neighbors.filter((n) => n.isMine).length;
  }
}

function initGame() {
  gameOver = false;
  gameStarted = false;
  seconds = 0;
  clearInterval(timerInterval);
  timerElement.textContent = "000";
  resetBtn.textContent = "😊";

  const { rows, cols, mines } = difficulties[currentDifficulty];
  minesLeft = mines;
  cellsToReveal = rows * cols - mines;
  minesLeftElement.textContent = minesLeft;

  // Create board
  board = [];
  for (let row = 0; row < rows; row++) {
    board[row] = [];
    for (let col = 0; col < cols; col++) {
      board[row][col] = new Cell(row, col);
    }
  }

  // Place mines
  let minesPlaced = 0;
  while (minesPlaced < mines) {
    const row = Math.floor(Math.random() * rows);
    const col = Math.floor(Math.random() * cols);

    if (!board[row][col].isMine) {
      board[row][col].isMine = true;
      minesPlaced++;
    }
  }

  // Calculate adjacent mines
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (!board[row][col].isMine) {
        board[row][col].calculateAdjacentMines();
      }
    }
  }

  // Render board
  gameBoard.innerHTML = "";
  gameBoard.style.gridTemplateColumns = `repeat(${cols}, 35px)`;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      gameBoard.appendChild(board[row][col].createElement());
    }
  }
}

function startTimer() {
  timerInterval = setInterval(() => {
    seconds++;
    timerElement.textContent = seconds.toString().padStart(3, "0");
  }, 1000);
}

function endGame(won) {
  gameOver = true;
  clearInterval(timerInterval);
  resetBtn.textContent = won ? "😎" : "😵";

  // Reveal all mines
  for (let row of board) {
    for (let cell of row) {
      if (cell.isMine && !cell.isRevealed) {
        cell.element.textContent = "💣";
        cell.element.classList.add("revealed");
        if (!won) {
          cell.element.classList.add("mine");
        }
      }
    }
  }

  setTimeout(() => {
    alert(won ? `You Win! Time: ${seconds}s` : "Game Over!");
  }, 100);
}

function checkWin() {
  if (cellsToReveal === 0) {
    endGame(true);
  }
}

// Event listeners
resetBtn.addEventListener("click", initGame);

difficultyBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    difficultyBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentDifficulty = btn.dataset.difficulty;
    initGame();
  });
});

// Prevent context menu on game board
gameBoard.addEventListener("contextmenu", (e) => e.preventDefault());

// Initialize game
initGame();
