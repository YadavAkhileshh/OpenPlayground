const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// ================= GAME STATE =================
let state = "start"; // start | play | gameover
let score = 0;
let frame = 0;

// ================= BIRD =================
const bird = {
  x: 90,
  y: 300,
  r: 14,
  velocity: 0,
  gravity: 0.38,
  lift: -8,
  rotation: 0
};

// ================= PIPES =================
const pipes = [];
const pipeWidth = 60;
const gap = 150;
const speed = 2.5;

// ================= INPUT =================
function flap() {
  if (state === "start") state = "play";
  if (state === "play") bird.velocity = bird.lift;
  if (state === "gameover") resetGame();
}

document.addEventListener("keydown", flap);
document.addEventListener("click", flap);

// ================= RESET =================
function resetGame() {
  pipes.length = 0;
  score = 0;
  frame = 0;
  bird.y = 300;
  bird.velocity = 0;
  state = "start";
}

// ================= DRAW =================
function drawBird() {
  ctx.save();
  ctx.translate(bird.x, bird.y);
  ctx.rotate(bird.rotation);

  // Body
  ctx.fillStyle = "#ffd400";
  ctx.beginPath();
  ctx.arc(0, 0, bird.r, 0, Math.PI * 2);
  ctx.fill();

  // Eye
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(5, -4, 3, 0, Math.PI * 2);
  ctx.fill();

  // Beak
  ctx.fillStyle = "#ff6f00";
  ctx.beginPath();
  ctx.moveTo(bird.r, 0);
  ctx.lineTo(bird.r + 8, -4);
  ctx.lineTo(bird.r + 8, 4);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawPipes() {
  pipes.forEach(p => {
    ctx.fillStyle = "#4caf50";
    ctx.fillRect(p.x, 0, pipeWidth, p.top);
    ctx.fillRect(p.x, p.bottom, pipeWidth, canvas.height);

    ctx.strokeStyle = "#1b5e20";
    ctx.lineWidth = 4;
    ctx.strokeRect(p.x, 0, pipeWidth, p.top);
    ctx.strokeRect(p.x, p.bottom, pipeWidth, canvas.height);
  });
}

function drawScore() {
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 4;
  ctx.font = "42px Arial Black";
  ctx.textAlign = "center";
  ctx.strokeText(score, canvas.width / 2, 70);
  ctx.fillText(score, canvas.width / 2, 70);
}

function drawText(title, subtitle) {
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 4;
  ctx.textAlign = "center";

  ctx.font = "36px Arial Black";
  ctx.strokeText(title, canvas.width / 2, 260);
  ctx.fillText(title, canvas.width / 2, 260);

  ctx.font = "18px Arial";
  ctx.strokeText(subtitle, canvas.width / 2, 300);
  ctx.fillText(subtitle, canvas.width / 2, 300);
}

// ================= UPDATE =================
function updateBird() {
  bird.velocity += bird.gravity;
  bird.y += bird.velocity;

  bird.rotation = Math.min(Math.PI / 4, bird.velocity / 10);

  if (bird.y + bird.r >= canvas.height) state = "gameover";
  if (bird.y - bird.r <= 0) bird.y = bird.r;
}

function updatePipes() {
  if (frame % 90 === 0) {
    const top = Math.random() * 200 + 80;
    pipes.push({
      x: canvas.width,
      top,
      bottom: top + gap,
      passed: false
    });
  }

  pipes.forEach(p => {
    p.x -= speed;

    if (!p.passed && p.x + pipeWidth < bird.x) {
      score++;
      p.passed = true;
    }

    if (
      bird.x + bird.r > p.x &&
      bird.x - bird.r < p.x + pipeWidth &&
      (bird.y - bird.r < p.top ||
       bird.y + bird.r > p.bottom)
    ) {
      state = "gameover";
    }
  });

  while (pipes.length && pipes[0].x + pipeWidth < 0) {
    pipes.shift();
  }
}

// ================= LOOP =================
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawPipes();
  drawBird();
  drawScore();

  if (state === "start") {
    drawText("FLAPPY BIRD", "Click or Press Any Key");
  }

  if (state === "play") {
    updateBird();
    updatePipes();
    frame++;
  }

  if (state === "gameover") {
    drawText("GAME OVER", "Click or Press Any Key");
  }

  requestAnimationFrame(loop);
}

loop();
