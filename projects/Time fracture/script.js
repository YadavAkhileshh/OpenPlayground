const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;

let lastX = 0,
  lastY = 0;
let timeSpeed = 0;
let shards = [];
let score = 0;
let running = false;

document.getElementById("startBtn").onclick = () => {
  document.getElementById("startScreen").classList.remove("active");
  running = true;
  AudioEngine.playBeep(220, 0.3);
};

document.addEventListener("mousemove", (e) => {
  const dx = e.clientX - lastX;
  const dy = e.clientY - lastY;
  timeSpeed = Math.min(Math.sqrt(dx * dx + dy * dy) / 10, 3);
  lastX = e.clientX;
  lastY = e.clientY;
});

function spawnShard() {
  shards.push({
    x: Math.random() * canvas.width,
    y: -50,
    r: 20 + Math.random() * 20,
    v: 2 + Math.random() * 3,
  });
}

function update() {
  if (!running) return;
  ctx.save();
  Effects.screenShake(ctx);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (Math.random() < 0.02 * timeSpeed) spawnShard();

  shards.forEach((s) => {
    s.y += s.v * timeSpeed;
    Effects.glow(ctx, s.x, s.y, s.r, "#0ff");
    if (s.y > canvas.height) {
      running = false;
      document.getElementById("gameOver").classList.add("active");
      document.getElementById("finalScore").innerText =
        `Time Survived: ${Math.floor(score)}`;
      Effects.triggerShake(40);
      AudioEngine.playBeep(90, 0.5);
    }
  });

  score += timeSpeed;
  ctx.restore();
  requestAnimationFrame(update);
}

update();

function restart() {
  location.reload();
}
