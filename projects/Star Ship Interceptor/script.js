import { Vector2, Entity } from "./any.js";

const canvas = document.getElementById("mainCanvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("start-btn");
const overlay = document.getElementById("overlay");

let config,
  player,
  enemies = [],
  bullets = [],
  particles = [],
  stars = [];
let keys = {},
  score = 0,
  energy = 100,
  frame = 0,
  isRunning = false;

async function boot() {
  const res = await fetch("./project.json");
  config = await res.json();
  resize();
  initStars();
  renderLoop();
}

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function initStars() {
  for (let i = 0; i < config.vfx.starCount; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      s: Math.random() * 2,
    });
  }
}

class Player extends Entity {
  constructor() {
    super(canvas.width / 2, canvas.height / 2, 15, "#fff");
  }
  update() {
    if (keys["KeyW"] && this.pos.y > 0) this.pos.y -= config.player.speed;
    if (keys["KeyS"] && this.pos.y < canvas.height)
      this.pos.y += config.player.speed;
    if (keys["KeyA"] && this.pos.x > 0) this.pos.x -= config.player.speed;
    if (keys["KeyD"] && this.pos.x < canvas.width)
      this.pos.x += config.player.speed;
  }
  draw(ctx) {
    // Advanced Ship Shape
    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#0ff";
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(20, 0);
    ctx.lineTo(-15, -15);
    ctx.lineTo(-10, 0);
    ctx.lineTo(-15, 15);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

function spawnEnemy() {
  if (frame % 60 === 0) {
    enemies.push({
      pos: new Vector2(canvas.width + 50, Math.random() * canvas.height),
      hp: 2,
      speed: config.enemies.baseSpeed + score / 10,
    });
  }
}

function renderLoop() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Starfield Parallax
  ctx.fillStyle = "#fff";
  stars.forEach((s) => {
    s.x -= 0.5;
    if (s.x < 0) s.x = canvas.width;
    ctx.fillRect(s.x, s.y, s.s, s.s);
  });

  if (isRunning) {
    player.update();
    player.draw(ctx);
    spawnEnemy();

    // Bullet Logic
    bullets.forEach((b, bi) => {
      b.pos.x += 12;
      ctx.fillStyle = "#f2d011";
      ctx.fillRect(b.pos.x, b.pos.y, 10, 2);
      if (b.pos.x > canvas.width) bullets.splice(bi, 1);
    });

    // Enemy Logic
    enemies.forEach((en, ei) => {
      en.pos.x -= en.speed;
      ctx.fillStyle = "#ff003c";
      ctx.fillRect(en.pos.x, en.pos.y, 30, 30);

      // Collision Enemy-Player
      if (Vector2.dist(player.pos, en.pos) < 30) {
        energy -= 10;
        enemies.splice(ei, 1);
        document.body.classList.add("shake");
        setTimeout(() => document.body.classList.remove("shake"), 200);
      }

      // Bullet-Enemy
      bullets.forEach((b, bi) => {
        if (Vector2.dist(b.pos, en.pos) < 20) {
          enemies.splice(ei, 1);
          bullets.splice(bi, 1);
          score++;
          document.getElementById("kill-count").innerText = score;
        }
      });
    });

    document.getElementById("energy-fill").style.width = energy + "%";
    if (energy <= 0) {
      isRunning = false;
      overlay.style.display = "flex";
    }
    frame++;
  }
  requestAnimationFrame(renderLoop);
}

window.addEventListener("keydown", (e) => (keys[e.code] = true));
window.addEventListener("keyup", (e) => (keys[e.code] = false));
window.addEventListener("mousedown", () => {
  if (isRunning) bullets.push({ pos: new Vector2(player.pos.x, player.pos.y) });
});

startBtn.onclick = () => {
  isRunning = true;
  energy = 100;
  score = 0;
  player = new Player();
  overlay.style.display = "none";
};

boot();
