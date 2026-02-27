const grid = document.getElementById("grid");
const levelDisplay = document.getElementById("level");
const scoreDisplay = document.getElementById("score");
const comboDisplay = document.getElementById("combo");
const timerDisplay = document.getElementById("timer");
const message = document.getElementById("message");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

let level = 1;
let score = 0;
let combo = 0;
let gridSize = 4;
let pattern = [];
let playerInput = [];
let inputEnabled = false;
let timer;
let timeLeft = 0;

startBtn.onclick = startGame;
restartBtn.onclick = restartGame;

function startGame() {
  resetState();
  nextLevel();
}

function restartGame() {
  resetState();
  message.textContent = "Press Start";
}

function resetState() {
  level = 1;
  score = 0;
  combo = 0;
  gridSize = 4;
  updateUI();
  clearInterval(timer);
  grid.innerHTML = "";
}

function updateUI() {
  levelDisplay.textContent = level;
  scoreDisplay.textContent = score;
  comboDisplay.textContent = combo;
}

function createGrid() {
  grid.innerHTML = "";
  grid.style.gridTemplateColumns = `repeat(${gridSize}, 70px)`;
  for (let i = 0; i < gridSize * gridSize; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;
    cell.onclick = handleCellClick;
    grid.appendChild(cell);
  }
}

function generatePattern() {
  pattern = [];
  const totalCells = gridSize * gridSize;
  const patternLength = level + 2;

  while (pattern.length < patternLength) {
    const random = Math.floor(Math.random() * totalCells);
    if (!pattern.includes(random)) {
      pattern.push(random);
    }
  }
}

function flashPattern() {
  message.textContent = "Memorize!";
  let i = 0;
  const cells = document.querySelectorAll(".cell");

  const interval = setInterval(() => {
    if (i > 0) {
      cells[pattern[i - 1]].classList.remove("active");
    }

    if (i < pattern.length) {
      cells[pattern[i]].classList.add("active");
      i++;
    } else {
      clearInterval(interval);
      enableInput();
    }
  }, 600);
}

function enableInput() {
  message.textContent = "Your Turn!";
  inputEnabled = true;
  playerInput = [];
  startTimer();
}

function handleCellClick(e) {
  if (!inputEnabled) return;

  const index = parseInt(e.target.dataset.index);
  playerInput.push(index);

  if (!pattern.includes(index)) {
    e.target.classList.add("wrong");
    endGame();
    return;
  } else {
    e.target.classList.add("correct");
  }

  if (playerInput.length === pattern.length) {
    completeLevel();
  }
}

function startTimer() {
  timeLeft = pattern.length + 3;
  timerDisplay.textContent = timeLeft;

  timer = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timer);
      endGame();
    }
  }, 1000);
}

function completeLevel() {
  clearInterval(timer);
  inputEnabled = false;

  combo++;
  score += level * 10 + combo * 5;

  if (combo > 1) {
    message.textContent = "Combo x" + combo + "!";
  }

  level++;

  if (level % 3 === 0 && gridSize < 6) {
    gridSize++;
  }

  updateUI();
  setTimeout(nextLevel, 1000);
}

function nextLevel() {
  createGrid();
  generatePattern();
  flashPattern();
}

function endGame() {
  inputEnabled = false;
  message.textContent = "Game Over!";
  combo = 0;
  updateUI();
}