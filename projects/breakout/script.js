const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// ================= GAME STATE =================
let state = "play"; // play | gameover
let score = 0;
let lives = 3;
let level = 1;

// ================= PADDLE =================
const paddle = {
  w: 90,
  h: 14,
  x: canvas.width / 2 - 45,
  y: canvas.height - 40
};

// ================= BALLS =================
let balls = [];

// ================= BRICKS =================
let bricks = [];
const rows = 5;
const cols = 8;

// ================= INPUT =================
let mouseX = canvas.width / 2;
document.addEventListener("mousemove", e => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
});

document.addEventListener("keydown", restartIfNeeded);
document.addEventListener("click", restartIfNeeded);

function restartIfNeeded() {
  if (state === "gameover") resetGame();
}

// ================= INIT =================
function initBall() {
  balls = [{
    x: canvas.width / 2,
    y: paddle.y - 10,
    r: 8,
    dx: 4,
    dy: -4
  }];
}

function createBricks() {
  bricks = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      bricks.push({
        x: 50 + c * 48,
        y: 60 + r * 30,
        w: 44,
        h: 20,
        hp: 1 + Math.floor(Math.random() * 3)
      });
    }
  }
}

function resetGame() {
  score = 0;
  lives = 3;
  level = 1;
  state = "play";
  paddle.x = canvas.width / 2 - paddle.w / 2;
  createBricks();
  initBall();
}

// ================= DRAW =================
function drawPaddle() {
  ctx.fillStyle = "#00e5ff";
  ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
}

function drawBalls() {
  balls.forEach(b => {
    ctx.beginPath();
    ctx.fillStyle = "#fff";
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawBricks() {
  bricks.forEach(brick => {
    const colors = ["#ff5252", "#ffb300", "#00e676"];
    ctx.fillStyle = colors[brick.hp - 1];
    ctx.fillRect(brick.x, brick.y, brick.w, brick.h);
  });
}

function drawHUD() {
  ctx.fillStyle = "#fff";
  ctx.font = "16px Arial";
  ctx.fillText(`Score: ${score}`, 10, 20);
  ctx.fillText(`Lives: ${lives}`, 380, 20);
  ctx.fillText(`Level: ${level}`, 210, 20);
}

function drawGameOver() {
  ctx.fillStyle = "red";
  ctx.font = "36px Arial Black";
  ctx.textAlign = "center";
  ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
  ctx.font = "18px Arial";
  ctx.fillText("Click or Press Any Key to Restart",
               canvas.width / 2, canvas.height / 2 + 40);
}

// ================= UPDATE =================
function updatePaddle() {
  const target = mouseX - paddle.w / 2;
  paddle.x += (target - paddle.x) * 0.25;
  paddle.x = Math.max(0, Math.min(canvas.width - paddle.w, paddle.x));
}

function updateBalls() {
  balls.forEach((ball, index) => {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Walls
    if (ball.x < ball.r || ball.x > canvas.width - ball.r) ball.dx *= -1;
    if (ball.y < ball.r) ball.dy *= -1;

    // Paddle
    if (
      ball.x > paddle.x &&
      ball.x < paddle.x + paddle.w &&
      ball.y + ball.r > paddle.y &&
      ball.y - ball.r < paddle.y + paddle.h
    ) {
      const hit = (ball.x - paddle.x) / paddle.w - 0.5;
      ball.dx = hit * 10;
      ball.dy = -Math.abs(ball.dy);
    }

    // Bottom
    if (ball.y - ball.r > canvas.height) {
      balls.splice(index, 1);
      if (balls.length === 0) {
        lives--;
        if (lives <= 0) {
          state = "gameover";
        } else {
          initBall();
        }
      }
    }
  });
}

// ================= COLLISIONS =================
function brickCollisions() {
  balls.forEach(ball => {
    bricks.forEach(brick => {
      if (
        ball.x > brick.x &&
        ball.x < brick.x + brick.w &&
        ball.y > brick.y &&
        ball.y < brick.y + brick.h
      ) {
        brick.hp--;
        ball.dy *= -1;
        score += 10;

        if (brick.hp <= 0) {
          bricks.splice(bricks.indexOf(brick), 1);
        }
      }
    });
  });

  // Next level
  if (bricks.length === 0 && state === "play") {
    level++;
    createBricks();
    initBall();
  }
}

// ================= LOOP =================
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawPaddle();
  drawBalls();
  drawBricks();
  drawHUD();

  if (state === "play") {
    updatePaddle();
    updateBalls();
    brickCollisions();
  }

  if (state === "gameover") {
    drawGameOver();
  }

  requestAnimationFrame(loop);
}

// ================= START =================
resetGame();
loop();
