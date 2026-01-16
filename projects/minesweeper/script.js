// Dark mode toggle logic
window.addEventListener('DOMContentLoaded', () => {
  const toggleDarkBtn = document.getElementById("toggle-dark");
  const toggleDarkIcon = document.getElementById("toggle-dark-icon");
  function setTheme(isDark) {
    if (isDark) {
      document.body.classList.add("dark-mode");
      toggleDarkIcon.textContent = "light_mode";
      console.log("Dark mode enabled");
    } else {
      document.body.classList.remove("dark-mode");
      toggleDarkIcon.textContent = "dark_mode";
      console.log("Light mode enabled");
    }
  }
  const darkModePref = localStorage.getItem("minesweeperDarkMode") === "true";
  setTheme(darkModePref);
  toggleDarkBtn.addEventListener("click", () => {
    const isDark = !document.body.classList.contains("dark-mode");
    console.log("Toggle button clicked. Setting dark mode:", isDark);
    setTheme(isDark);
    localStorage.setItem("minesweeperDarkMode", isDark);
  });
});
const ROWS = 8;
const COLS = 8;
const MINES = 10;


const boardElement = document.getElementById("board");
const statusText = document.getElementById("status");
const gameModal = document.getElementById("game-modal");
const gameModalIcon = document.getElementById("game-modal-icon");
const gameModalMessage = document.getElementById("game-modal-message");
const gameModalRestart = document.getElementById("game-modal-restart");
const restartBtn = document.getElementById("restart");
const timerEl = document.getElementById("timer");
const mineCounterEl = document.getElementById("mine-counter");

let timer = 0;
let timerInterval = null;
let timerRunning = false;
let flagsPlaced = 0;

let board = [];
let gameOver = false;

function createBoard() {
  board = [];
  boardElement.innerHTML = "";
  statusText.textContent = "";
  gameOver = false;

  timer = 0;
  timerRunning = false;
  stopTimer();
  updateTimerDisplay();
  flagsPlaced = 0;
  updateMineCounter();

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
      cell.element.addEventListener("click", () => revealCell(cell, true));
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

function revealCell(cell, triggered = false) {
  if (gameOver || cell.revealed || cell.flagged) return;

  // Start timer on first click
  if (!timerRunning) {
    startTimer();
    timerRunning = true;
  }

  cell.revealed = true;
  cell.element.classList.add("revealed");

  if (cell.mine) {
    cell.element.classList.add("mine");
    cell.element.innerHTML = `<svg viewBox="0 0 24 24" width="22" height="22" style="vertical-align:middle;"><circle cx="12" cy="14" r="6" fill="#222"/><circle cx="12" cy="14" r="5" fill="#444"/><rect x="16.5" y="3" width="2" height="6" rx="1" fill="#d32f2f" transform="rotate(45 16.5 3)"/><circle cx="18.5" cy="5.5" r="1.2" fill="#fbc02d"/></svg>`;
    if (triggered) {
      cell.element.classList.add("triggered");
    }
    endGame(false);
    return;
  }

  if (cell.count > 0) {
    cell.element.textContent = cell.count;
    cell.element.setAttribute('data-num', cell.count);
  } else {
    getNeighbors(cell).forEach(n => revealCell(n));
  }

  checkWin();
}

function toggleFlag(cell) {
  if (gameOver || cell.revealed) return;
  cell.flagged = !cell.flagged;
  cell.element.classList.toggle("flagged");
  cell.element.textContent = cell.flagged ? "🚩" : "";
  flagsPlaced += cell.flagged ? 1 : -1;
  updateMineCounter();
}

function endGame(won) {
  gameOver = true;
  stopTimer();
  statusText.style.display = 'none';
  if (won) {
    // Reveal all mines instantly if won
    board.flat().forEach(cell => {
      if (cell.mine) {
        cell.element.innerHTML = `<svg viewBox="0 0 24 24" width="22" height="22" style="vertical-align:middle;"><circle cx="12" cy="14" r="6" fill="#222"/><circle cx="12" cy="14" r="5" fill="#444"/><rect x="16.5" y="3" width="2" height="6" rx="1" fill="#d32f2f" transform="rotate(45 16.5 3)"/><circle cx="18.5" cy="5.5" r="1.2" fill="#fbc02d"/></svg>`;
        cell.element.classList.add("revealed");
      }
    });
    if (gameModal && gameModalIcon && gameModalMessage) {
      gameModal.style.display = 'flex';
      gameModalIcon.innerHTML = '<span class="material-icons" style="color:#43a047;font-size:2.2em;">sentiment_very_satisfied</span>';
      gameModalMessage.innerHTML = '<b>You Win!</b>';
    }
  } else {
    // Animate mines one by one
    const mineCells = board.flat().filter(cell => cell.mine);
    let i = 0;
    function revealNextMine() {
      if (i < mineCells.length) {
        mineCells[i].element.innerHTML = `<svg viewBox="0 0 24 24" width="22" height="22" style="vertical-align:middle;"><circle cx="12" cy="14" r="6" fill="#222"/><circle cx="12" cy="14" r="5" fill="#444"/><rect x="16.5" y="3" width="2" height="6" rx="1" fill="#d32f2f" transform="rotate(45 16.5 3)"/><circle cx="18.5" cy="5.5" r="1.2" fill="#fbc02d"/></svg>`;
        mineCells[i].element.classList.add("revealed");
        i++;
        setTimeout(revealNextMine, 120); // 120ms between each mine
      }
    }
    revealNextMine();
    // Show modal after all mines are revealed + extra delay
    const totalDelay = mineCells.length * 120 + 700; // 700ms after last mine
    setTimeout(() => {
      if (gameModal && gameModalIcon && gameModalMessage) {
        gameModal.style.display = 'flex';
        // Bomb SVG for game over
        gameModalIcon.innerHTML = `
          <svg viewBox="0 0 48 48" width="48" height="48" style="vertical-align:middle;">
            <circle cx="24" cy="28" r="14" fill="#222"/>
            <circle cx="24" cy="28" r="12" fill="#d32f2f"/>
            <rect x="34" y="6" width="4" height="12" rx="2" fill="#fbc02d" transform="rotate(-20 34 6)"/>
            <rect x="10" y="6" width="4" height="12" rx="2" fill="#fbc02d" transform="rotate(20 10 6)"/>
            <circle cx="24" cy="12" r="4" fill="#fbc02d"/>
          </svg>`;
        gameModalMessage.innerHTML = `
          <div style="font-size:2em;font-weight:800;color:#d32f2f;line-height:1.1;margin-bottom:0.2em;">Game Over!</div>
          <div style="font-size:1.15em;color:#d32f2f;font-weight:500;">You hit a mine!<br>Better luck next time.</div>
        `;
      }
    }, totalDelay);
  }
}
// Timer and mine counter helpers
function updateTimerDisplay() {
  if (timerEl) {
    const min = String(Math.floor(timer / 60)).padStart(2, '0');
    const sec = String(timer % 60).padStart(2, '0');
    timerEl.innerHTML = '<span class="material-icons" style="font-size:1.1em;vertical-align:middle;">timer</span> ' + min + ':' + sec;
  }
}
function startTimer() {
  stopTimer();
  timerInterval = setInterval(() => {
    timer++;
    updateTimerDisplay();
  }, 1000);
}
function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}
function updateMineCounter() {
  if (mineCounterEl) {
    mineCounterEl.innerHTML = '<span class="material-icons" style="font-size:1.1em;vertical-align:middle;">flag</span> Mines: ' + (MINES - flagsPlaced);
  }
}

function checkWin() {
  const unrevealed = board.flat().filter(c => !c.revealed && !c.mine);
  if (unrevealed.length === 0) {
    endGame(true);
  }
}


function hideGameModal() {
  if (gameModal) gameModal.style.display = 'none';
}

restartBtn.addEventListener("click", () => {
  hideGameModal();
  createBoard();
});

if (gameModalRestart) {
  gameModalRestart.addEventListener('click', () => {
    hideGameModal();
    createBoard();
  });
}

createBoard();