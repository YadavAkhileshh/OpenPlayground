/* ============================================================
   INVISIBLE MAZE - CORE GAME ENGINE
   Author: Vijay (yes, your name belongs here)
   Description:
   A memory-based maze game where players navigate
   an invisible maze using keyboard-only controls.
   ============================================================ */

/* =======================
   GLOBAL CONSTANTS
   ======================= */

const PREVIEW_TIMES = {
  easy: 4000,
  normal: 2500,
  hard: 1500
};

const COLLISION_MODES = {
  BLOCK: "block",
  RESET: "reset"
};

const GAME_STATES = {
  PREVIEW: "preview",
  PLAYING: "playing",
  WON: "won",
  PAUSED: "paused"
};

const DIRECTIONS = {
  ArrowUp: { r: -1, c: 0 },
  ArrowDown: { r: 1, c: 0 },
  ArrowLeft: { r: 0, c: -1 },
  ArrowRight: { r: 0, c: 1 },
  w: { r: -1, c: 0 },
  s: { r: 1, c: 0 },
  a: { r: 0, c: -1 },
  d: { r: 0, c: 1 }
};

/* =======================
   DOM REFERENCES
   ======================= */

const mazeContainer = document.getElementById("maze");
const timerLabel = document.getElementById("timer");
const restartBtn = document.getElementById("restartBtn");

/* =======================
   MAZE DEFINITIONS
   ======================= */

const MAZES = [
  [
    ["S", 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1],
    [0, 0, 0, 0, 1, 0, 0],
    [0, 1, 1, 0, 0, 1, 0],
    [0, 0, 0, 1, 0, 0, 0],
    [1, 1, 0, 0, 0, 1, 0],
    [1, 0, 0, 1, 0, 0, "E"]
  ],
  [
    ["S", 0, 0, 1, 0, 0, 0],
    [1, 1, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 1, 0],
    [0, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 0],
    [1, 0, 1, 0, 0, 0, 0],
    [1, 0, 0, 0, 1, 0, "E"]
  ]
];

/* =======================
   GAME STATE
   ======================= */

let mazeData = [];
let player = { row: 0, col: 0 };
let gameState = GAME_STATES.PREVIEW;
let difficulty = "normal";
let collisionMode = COLLISION_MODES.RESET;
let fogOfWar = false;

/* =======================
   ANALYTICS
   ======================= */

let stats = {
  moves: 0,
  wallHits: 0,
  startTime: null,
  endTime: null
};

/* =======================
   UTILITY FUNCTIONS
   ======================= */

function cloneMaze(maze) {
  return maze.map(row => [...row]);
}

function randomMaze() {
  const index = Math.floor(Math.random() * MAZES.length);
  return cloneMaze(MAZES[index]);
}

function resetStats() {
  stats.moves = 0;
  stats.wallHits = 0;
  stats.startTime = Date.now();
  stats.endTime = null;
}

function elapsedTime() {
  if (!stats.startTime) return 0;
  const end = stats.endTime || Date.now();
  return Math.floor((end - stats.startTime) / 1000);
}

/* =======================
   MAZE INITIALIZATION
   ======================= */

function findStartPosition() {
  mazeData.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (cell === "S") {
        player.row = r;
        player.col = c;
      }
    });
  });
}

function initializeGame() {
  mazeData = randomMaze();
  findStartPosition();
  resetStats();
  gameState = GAME_STATES.PREVIEW;
  renderMaze(false);
  startPreviewTimer();
}

/* =======================
   RENDERING LOGIC
   ======================= */

function renderMaze(hidden) {
  mazeContainer.innerHTML = "";
  mazeContainer.style.gridTemplateColumns = `repeat(${mazeData[0].length}, 50px)`;

  mazeData.forEach((row, r) => {
    row.forEach((cell, c) => {
      const div = document.createElement("div");
      div.classList.add("cell");

      if (cell === 1) div.classList.add("wall");
      else div.classList.add("path");

      if (hidden && cell === 1) div.classList.add("hidden");

      if (fogOfWar && hidden) {
        const dist =
          Math.abs(player.row - r) + Math.abs(player.col - c);
        if (dist > 1 && cell === 1) div.classList.add("hidden");
      }

      if (r === player.row && c === player.col) {
        div.classList.add("player");
      }

      if (cell === "E") {
        div.classList.add("goal");
      }

      mazeContainer.appendChild(div);
    });
  });
}

/* =======================
   GAME FLOW
   ======================= */

function startPreviewTimer() {
  timerLabel.textContent = "Memorize the maze...";
  setTimeout(() => {
    gameState = GAME_STATES.PLAYING;
    timerLabel.textContent = "Maze hidden. Navigate.";
    renderMaze(true);
  }, PREVIEW_TIMES[difficulty]);
}

function winGame() {
  gameState = GAME_STATES.WON;
  stats.endTime = Date.now();
  timerLabel.textContent =
    `Escaped in ${elapsedTime()}s | Moves: ${stats.moves} | Errors: ${stats.wallHits}`;
}

/* =======================
   MOVEMENT & COLLISION
   ======================= */

function attemptMove(dr, dc) {
  if (gameState !== GAME_STATES.PLAYING) return;

  const newRow = player.row + dr;
  const newCol = player.col + dc;

  if (
    newRow < 0 ||
    newCol < 0 ||
    newRow >= mazeData.length ||
    newCol >= mazeData[0].length ||
    mazeData[newRow][newCol] === 1
  ) {
    stats.wallHits++;
    if (collisionMode === COLLISION_MODES.RESET) {
      findStartPosition();
    }
    renderMaze(true);
    return;
  }

  player.row = newRow;
  player.col = newCol;
  stats.moves++;

  if (mazeData[newRow][newCol] === "E") {
    winGame();
    renderMaze(true);
    return;
  }

  renderMaze(true);
}

/* =======================
   INPUT HANDLING
   ======================= */

document.addEventListener("keydown", e => {
  if (!DIRECTIONS[e.key]) return;
  const { r, c } = DIRECTIONS[e.key];
  attemptMove(r, c);
});

/* =======================
   SETTINGS (LOCAL STORAGE)
   ======================= */

function saveSettings() {
  const data = {
    difficulty,
    collisionMode,
    fogOfWar
  };
  localStorage.setItem("invisibleMazeSettings", JSON.stringify(data));
}

function loadSettings() {
  const data = JSON.parse(
    localStorage.getItem("invisibleMazeSettings")
  );
  if (!data) return;

  difficulty = data.difficulty || difficulty;
  collisionMode = data.collisionMode || collisionMode;
  fogOfWar = data.fogOfWar || fogOfWar;
}

/* =======================
   UI CONTROLS
   ======================= */

restartBtn.addEventListener("click", () => {
  initializeGame();
});

/* =======================
   BOOTSTRAP
   ======================= */

loadSettings();
initializeGame();

/* ============================================================
   END OF SCRIPT
   ============================================================ */
