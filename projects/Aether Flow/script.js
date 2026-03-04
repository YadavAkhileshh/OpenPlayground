const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const startBtn = document.getElementById("start-btn");
const overlay = document.getElementById("overlay");

let game = {
  active: false,
  score: 0,
  gravity: 0.4,
  velocity: 0,
  particles: [],
  obstacles: [],
  frame: 0,
};

let player = { x: 120, y: 0, targetY: 0, size: 24, trail: [] };

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  player.y = canvas.height / 2;
}

window.addEventListener("resize", resize);
resize();

// Advanced Particle System
class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.size = Math.random() * 3 + 1;
    this.speedX = (Math.random() - 0.5) * 8;
    this.speedY = (Math.random() - 0.5) * 8;
    this.life = 1;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.life -= 0.02;
  }
}

function spawnObstacle() {
  if (!game.active) return;
  const gap = 280 - Math.min(game.score * 2, 100);
  const pos = Math.random() * (canvas.height - gap - 100) + 50;
  game.obstacles.push({
    x: canvas.width,
    top: pos,
    bottom: pos + gap,
    passed: false,
  });
  setTimeout(spawnObstacle, 1800 - Math.min(game.score * 20, 800));
}

function draw() {
  ctx.fillStyle = "#050507";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (game.active) {
    game.velocity += game.gravity;
    player.y += game.velocity;

    // Player Trail Logic
    player.trail.unshift({ x: player.x, y: player.y });
    if (player.trail.length > 15) player.trail.pop();

    // Check boundaries
    if (player.y < 0 || player.y > canvas.height) endGame();
  }

  // Draw Trail with Gradients
  player.trail.forEach((p, i) => {
    ctx.fillStyle = `rgba(255, 204, 0, ${1 - i / 15})`;
    const s = player.size * (1 - i / 15);
    ctx.fillRect(
      p.x + (player.size - s) / 2,
      p.y + (player.size - s) / 2,
      s,
      s,
    );
  });

  // Draw Obstacles with inner glow
  game.obstacles.forEach((o, i) => {
    o.x -= 6 + game.score * 0.1;
    ctx.fillStyle = "#121216";
    ctx.fillRect(o.x, 0, 60, o.top);
    ctx.fillRect(o.x, o.bottom, 60, canvas.height);

    // Collision
    if (player.x < o.x + 60 && player.x + player.size > o.x) {
      if (player.y < o.top || player.y + player.size > o.bottom) endGame();
      else if (!o.passed) {
        o.passed = true;
        game.score++;
        scoreEl.innerText = game.score.toString().padStart(2, "0");
      }
    }
  });

  // Draw Particles
  game.particles.forEach((p, i) => {
    p.update();
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.size, p.size);
    if (p.life <= 0) game.particles.splice(i, 1);
  });
  ctx.globalAlpha = 1;

  requestAnimationFrame(draw);
}

function endGame() {
  game.active = false;
  overlay.classList.remove("hidden");
  for (let i = 0; i < 30; i++)
    game.particles.push(new Particle(player.x, player.y, "#ffcc00"));
}

startBtn.addEventListener("click", () => {
  game.active = true;
  game.score = 0;
  game.obstacles = [];
  game.velocity = 0;
  player.y = canvas.height / 2;
  scoreEl.innerText = "00";
  overlay.classList.add("hidden");
  spawnObstacle();
});

window.addEventListener("mousedown", () => {
  if (game.active) game.gravity *= -1;
});

draw();
