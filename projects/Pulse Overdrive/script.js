const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;

let running = false;
let bpm = 90;
let beatInterval;
let score = 0;
let health = 100;
let beatTime = 0;

const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  r: 12,
  step: 40,
};

const enemies = [];

function spawnEnemy() {
  enemies.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: 8,
  });
}

document.getElementById("startBtn").onclick = () => {
  document.getElementById("start").classList.remove("active");
  running = true;
  startBeat();
};

function startBeat() {
  beatInterval = setInterval(() => {
    beatTime = performance.now();
    AudioEngine.beat();
    Effects.beat();
    score++;
    bpm += 0.25;
    spawnEnemy();
    updateHUD();
  }, 60000 / bpm);
}

const keys = {};
addEventListener("keydown", (e) => (keys[e.key] = true));
addEventListener("keyup", (e) => (keys[e.key] = false));

function tryMove(dx, dy) {
  const now = performance.now();
  if (Math.abs(now - beatTime) < 160) {
    player.x += dx * player.step;
    player.y += dy * player.step;
  } else {
    health -= 10;
    AudioEngine.hit();
    Effects.damage();
  }
}

function updateHUD() {
  document.getElementById("health").innerText = `HP: ${health}`;
  document.getElementById("bpm").innerText = `BPM: ${Math.floor(bpm)}`;
  document.getElementById("score").innerText = `Score: ${score}`;
}

function collide(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy) < a.r + b.r;
}

function loop() {
  if (!running) return;

  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  Effects.update(ctx);

  if (keys["w"] || keys["ArrowUp"]) tryMove(0, -1);
  if (keys["s"] || keys["ArrowDown"]) tryMove(0, 1);
  if (keys["a"] || keys["ArrowLeft"]) tryMove(-1, 0);
  if (keys["d"] || keys["ArrowRight"]) tryMove(1, 0);

  enemies.forEach((e) => {
    ctx.fillStyle = "#ff2d55";
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
    ctx.fill();

    if (collide(player, e)) {
      health -= 1;
    }
  });

  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  if (health <= 0) endGame();
  requestAnimationFrame(loop);
}

loop();

function endGame() {
  running = false;
  clearInterval(beatInterval);
  document.getElementById("end").classList.add("active");
  document.getElementById("finalScore").innerText = `Beats Survived: ${score}`;
}

function restart() {
  location.reload();
}
