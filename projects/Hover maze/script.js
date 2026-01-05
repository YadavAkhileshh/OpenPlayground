const canvas = document.getElementById("maze");
const ctx = canvas.getContext("2d");
const statusText = document.getElementById("status");

const START = { x: 15, y: 15, w: 70, h: 30 };
const FINISH = { x: 215, y: 255, w: 70, h: 30 };

let drawing = false;
let gameOver = false;
let lastX, lastY;

let walls = [];
const WALL_COUNT = 7;

generateWalls();
drawMaze();

/* ================= WALL GENERATION ================= */

function generateWalls() {
  walls = [];

  for (let i = 0; i < WALL_COUNT; i++) {
    let wall;
    let tries = 0;

    do {
      const horizontal = Math.random() > 0.5;

      wall = {
        x: rand(30, 220),
        y: rand(50, 220),
        w: horizontal ? rand(80, 160) : 12,
        h: horizontal ? 12 : rand(80, 160)
      };

      tries++;
    } while (
      intersects(wall, START) ||
      intersects(wall, FINISH) ||
      intersectsSafePath(wall) ||
      tries < 10 && overlapsAny(wall)
    );

    walls.push(wall);
  }
}

/* ================= DRAW ================= */

function drawMaze() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // START
  ctx.fillStyle = "#00ff99";
  ctx.fillRect(START.x, START.y, START.w, START.h);
  ctx.fillStyle = "#000";
  ctx.fillText("START", START.x + 12, START.y + 20);

  // FINISH
  ctx.fillStyle = "#ff0066";
  ctx.fillRect(FINISH.x, FINISH.y, FINISH.w, FINISH.h);
  ctx.fillStyle = "#fff";
  ctx.fillText("FINISH", FINISH.x + 10, FINISH.y + 20);

  // WALLS
  ctx.fillStyle = "#ff4b2b";
  walls.forEach(w => ctx.fillRect(w.x, w.y, w.w, w.h));
}

/* ================= GAME LOGIC ================= */

canvas.addEventListener("mousedown", (e) => {
  const { x, y } = getMousePos(e);

  if (inside(x, y, START)) {
    drawing = true;
    gameOver = false;
    statusText.textContent = "Drawing...";
    statusText.style.color = "#00f7ff";
    lastX = x;
    lastY = y;
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (!drawing || gameOver) return;

  const { x, y } = getMousePos(e);

  for (let wall of walls) {
    if (inside(x, y, wall)) {
      failGame("❌ You hit a wall!");
      return;
    }
  }

  ctx.strokeStyle = "#00f7ff";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(x, y);
  ctx.stroke();

  lastX = x;
  lastY = y;

  if (inside(x, y, FINISH)) {
    winGame();
  }
});

canvas.addEventListener("mouseleave", () => failGame("❌ You left the maze!"));
document.addEventListener("mouseup", () => failGame("❌ Mouse released!"));

function winGame() {
  drawing = false;
  gameOver = true;
  statusText.textContent = "🏆 Level Completed!";
  statusText.style.color = "#00ff99";
}

function failGame(msg) {
  if (!drawing || gameOver) return;
  drawing = false;
  gameOver = true;
  statusText.textContent = msg;
  statusText.style.color = "#ff4b2b";
}

function resetGame() {
  drawing = false;
  gameOver = false;
  statusText.textContent = "";
  generateWalls();
  drawMaze();
}

/* ================= HELPERS ================= */

function getMousePos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

function inside(x, y, box) {
  return x >= box.x && x <= box.x + box.w &&
         y >= box.y && y <= box.y + box.h;
}

function intersects(a, b) {
  return !(
    a.x + a.w < b.x ||
    a.x > b.x + b.w ||
    a.y + a.h < b.y ||
    a.y > b.y + b.h
  );
}

function overlapsAny(wall) {
  return walls.some(w => intersects(w, wall));
}

/* Safe diagonal corridor from START → FINISH */
function intersectsSafePath(wall) {
  return (
    wall.x < 200 &&
    wall.y < 200 &&
    wall.x + wall.w > 40 &&
    wall.y + wall.h > 40
  );
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


