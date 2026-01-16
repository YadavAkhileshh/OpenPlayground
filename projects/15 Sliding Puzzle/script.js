
const puzzleElement = document.getElementById('puzzle');
const message = document.getElementById('message');
const restartBtn = document.getElementById('restart');
const moveCounterEl = document.getElementById('move-counter');
const timerEl = document.getElementById('timer');

let moveCount = 0;
let timer = 0;
let timerInterval = null;
let timerRunning = false;

let tiles = [];
const SIZE = 4; // 4x4 grid
let emptyIndex = 15; // empty tile index

// Shuffle tiles using Fisher-Yates algorithm
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Initialize puzzle
function initPuzzle() {
  puzzleElement.innerHTML = '';
  message.textContent = '';

  tiles = Array.from({ length: 15 }, (_, i) => i + 1);
  tiles.push(null); // empty space
  tiles = shuffle(tiles);

  // Make sure puzzle is solvable
  while (!isSolvable(tiles)) {
    tiles = shuffle(tiles);
  }

  emptyIndex = tiles.indexOf(null);

  moveCount = 0;
  updateMoveCounter();
  stopTimer();
  timer = 0;
  updateTimerDisplay();
  timerRunning = false;

  renderTiles();
}

// Render tiles
function renderTiles() {
  puzzleElement.innerHTML = '';
  tiles.forEach((num, idx) => {
    const tileEl = document.createElement('div');
    tileEl.classList.add('tile');
    if (num === null) {
      tileEl.classList.add('empty');
    } else {
      tileEl.textContent = num;
      tileEl.addEventListener('click', () => moveTile(idx));
    }
    puzzleElement.appendChild(tileEl);
  });
}

// Move tile if adjacent to empty
function moveTile(index) {
  const emptyRow = Math.floor(emptyIndex / SIZE);
  const emptyCol = emptyIndex % SIZE;
  const tileRow = Math.floor(index / SIZE);
  const tileCol = index % SIZE;

  const isAdjacent = (Math.abs(emptyRow - tileRow) + Math.abs(emptyCol - tileCol)) === 1;
  if (!isAdjacent) return;

  [tiles[emptyIndex], tiles[index]] = [tiles[index], tiles[emptyIndex]];
  emptyIndex = index;

  // Start timer on first move
  if (!timerRunning) {
    startTimer();
    timerRunning = true;
  }

  moveCount++;
  updateMoveCounter();

  renderTiles();
  checkWin();
}

// Check if puzzle is solved
function checkWin() {
  for (let i = 0; i < 15; i++) {
    if (tiles[i] !== i + 1) return;
  }
  message.textContent = '🎉 Puzzle Solved! 🎉';
  stopTimer();
}

function updateMoveCounter() {
  if (moveCounterEl) {
    moveCounterEl.innerHTML = '<span class="material-icons" style="font-size:1.1em;vertical-align:middle;">swap_horiz</span> Moves: ' + moveCount;
  }
}

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

// Check solvable puzzle
function isSolvable(arr) {
  let inversions = 0;
  const temp = arr.filter(n => n !== null);
  for (let i = 0; i < temp.length; i++) {
    for (let j = i + 1; j < temp.length; j++) {
      if (temp[i] > temp[j]) inversions++;
    }
  }

  const emptyRow = Math.floor(arr.indexOf(null) / SIZE);
  if (SIZE % 2 === 0) {
    return (emptyRow % 2 === 0) ? inversions % 2 !== 0 : inversions % 2 === 0;
  } else {
    return inversions % 2 === 0;
  }
}

// Restart button
restartBtn.addEventListener('click', initPuzzle);

// Initialize puzzle
initPuzzle();