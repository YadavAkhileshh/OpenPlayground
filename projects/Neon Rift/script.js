const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("start-btn");
const overlay = document.getElementById("overlay");

let gameActive = false;
let score = 0;
let health = 100;
let player = { x: 0, y: 0, targetX: 0, targetY: 0, radius: 15 };
let entities = [];

// Initialize Canvas
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

// Mouse tracking
window.addEventListener("mousemove", (e) => {
  player.targetX = e.clientX;
  player.targetY = e.clientY;
});

function spawnEntity() {
  if (!gameActive) return;
  const isEnemy = Math.random() > 0.3;
  entities.push({
    x: Math.random() * canvas.width,
    y: -20,
    speed: 2 + Math.random() * 4,
    type: isEnemy ? "void" : "harmonic",
    size: isEnemy ? 10 + Math.random() * 20 : 10,
  });
  setTimeout(spawnEntity, 800 - Math.min(score, 500));
}

function update() {
  if (!gameActive) return;

  // Smooth player movement
  player.x += (player.targetX - player.x) * 0.15;
  player.y += (player.targetY - player.y) * 0.15;

  entities.forEach((ent, index) => {
    ent.y += ent.speed;

    // Collision
    const dist = Math.hypot(ent.x - player.x, ent.y - player.y);
    if (dist < ent.size + player.radius) {
      if (ent.type === "void") {
        health -= 20;
        createExplosion(ent.x, ent.y, "#ff007b");
      } else {
        score += 10;
        createExplosion(ent.x, ent.y, "#00f2ff");
      }
      entities.splice(index, 1);
    }
    if (ent.y > canvas.height) entities.splice(index, 1);
  });

  if (health <= 0) gameOver();

  document.getElementById("score").innerText = `SCORE: ${score}`;
  document.getElementById("health-fill").style.width = `${health}%`;
}

function draw() {
  ctx.fillStyle = "rgba(10, 10, 12, 0.2)"; // Motion blur effect
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw Player with "Animation.js" helper
  drawPlayerCore(ctx, player.x, player.y);

  entities.forEach((ent) => {
    drawEntity(ctx, ent);
  });

  updateParticles(ctx);
  update();
  requestAnimationFrame(draw);
}

function gameOver() {
  gameActive = false;
  overlay.classList.remove("hidden");
  overlay.querySelector("h1").innerText = "RIFT COLLAPSED";
}

startBtn.addEventListener("click", () => {
  score = 0;
  health = 100;
  entities = [];
  gameActive = true;
  overlay.classList.add("hidden");
  spawnEntity();
  draw();
});
