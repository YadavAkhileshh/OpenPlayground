const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const statusEl = document.getElementById("status");
const gameOverBox = document.getElementById("gameOver");
const finalScore = document.getElementById("finalScore");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const aiBtn = document.getElementById("aiBtn");
const speedInput = document.getElementById("speed");

const GRID = 24;
const CELL = canvas.width / GRID;

let snake = [];
let food = {};
let dir = { x: 1, y: 0 };
let running = false;
let aiEnabled = false;
let lastTime = 0;

/* ---------------- RESET GAME ---------------- */

function resetGame() {
  snake = [{ x: 12, y: 12 }];
  dir = { x: 1, y: 0 };
  placeFood();
  running = true;
  aiEnabled = false;

  scoreEl.textContent = "Score: 0";
  statusEl.textContent = "Running";
  aiBtn.textContent = "AI: Off";
  gameOverBox.style.display = "none";
  lastTime = 0;
}

/* ---------------- FOOD ---------------- */

function placeFood() {
  while (true) {
    const p = {
      x: Math.floor(Math.random() * GRID),
      y: Math.floor(Math.random() * GRID),
    };
    if (!snake.some(s => s.x === p.x && s.y === p.y)) {
      food = p;
      break;
    }
  }
}

/* ---------------- DRAW ---------------- */

function drawCell(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * CELL + 2, y * CELL + 2, CELL - 4, CELL - 4);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawCell(food.x, food.y, "#ef4444");

  snake.forEach((s, i) => {
    drawCell(s.x, s.y, i === 0 ? "#60a5fa" : "#1e3a8a");
  });
}

/* ---------------- AI LOGIC ---------------- */

function aiMove() {
  const head = snake[0];

  if (food.x > head.x) dir = { x: 1, y: 0 };
  else if (food.x < head.x) dir = { x: -1, y: 0 };
  else if (food.y > head.y) dir = { x: 0, y: 1 };
  else if (food.y < head.y) dir = { x: 0, y: -1 };
}

/* ---------------- GAME STEP ---------------- */

function step() {
  if (aiEnabled) {
    aiMove();
  }

  const head = {
    x: snake[0].x + dir.x,
    y: snake[0].y + dir.y,
  };

  if (
    head.x < 0 ||
    head.y < 0 ||
    head.x >= GRID ||
    head.y >= GRID ||
    snake.some(s => s.x === head.x && s.y === head.y)
  ) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    scoreEl.textContent = `Score: ${snake.length - 1}`;
    placeFood();
  } else {
    snake.pop();
  }
}

/* ---------------- GAME OVER ---------------- */

function endGame() {
  running = false;
  finalScore.textContent = `Score: ${snake.length - 1}`;
  gameOverBox.style.display = "flex";
  statusEl.textContent = "Game Over";
}

/* ---------------- LOOP ---------------- */

function loop(time) {
  if (!running) return;

  const speed = 1000 / speedInput.value;

  if (time - lastTime > speed) {
    step();
    lastTime = time;
  }

  draw();
  requestAnimationFrame(loop);
}

/* ---------------- CONTROLS ---------------- */

window.addEventListener("keydown", e => {
  if (aiEnabled) return; // disable manual control in AI mode

  const map = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
    w: { x: 0, y: -1 },
    s: { x: 0, y: 1 },
    a: { x: -1, y: 0 },
    d: { x: 1, y: 0 },
  };

  if (map[e.key]) {
    const nd = map[e.key];
    if (nd.x !== -dir.x || nd.y !== -dir.y) {
      dir = nd;
    }
  }
});

/* ---------------- BUTTONS ---------------- */

startBtn.onclick = () => {
  resetGame();
  requestAnimationFrame(loop);
};

restartBtn.onclick = () => {
  resetGame();
  requestAnimationFrame(loop);
};

aiBtn.onclick = () => {
  aiEnabled = !aiEnabled;
  aiBtn.textContent = `AI: ${aiEnabled ? "On" : "Off"}`;

  if (aiEnabled && !running) {
    resetGame();
    aiEnabled = true;
    aiBtn.textContent = "AI: On";
    requestAnimationFrame(loop);
  }
};
