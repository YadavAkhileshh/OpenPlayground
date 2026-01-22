const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const TAU = Math.PI * 2;

// ================= GAME STATE =================
let score = 0;
let lives = 3;
let wave = 1;
let state = "play"; // play | gameover

// ================= INPUT =================
const keys = {};
document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);
document.addEventListener("keydown", () => {
  if (state === "gameover") resetGame();
});

// ================= UTIL =================
function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function wrap(o) {
  if (o.x < 0) o.x = canvas.width;
  if (o.x > canvas.width) o.x = 0;
  if (o.y < 0) o.y = canvas.height;
  if (o.y > canvas.height) o.y = 0;
}

// ================= SHIP =================
const ship = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  r: 14,
  angle: 0,
  velX: 0,
  velY: 0,
  thrust: 0.15,
  friction: 0.99,
  cooldown: 0,
  invincible: 0
};

// ================= BULLETS =================
const bullets = [];

// ================= PARTICLES =================
const particles = [];

// ================= ASTEROIDS =================
let asteroids = [];

function createAsteroid(x, y, size = 3) {
  const points = [];
  const verts = rand(8, 12);
  for (let i = 0; i < verts; i++) {
    points.push(rand(0.6, 1.2));
  }

  asteroids.push({
    x, y,
    size,
    r: size * 22,
    angle: rand(0, TAU),
    spin: rand(-0.02, 0.02),
    speed: rand(0.5, 1.8),
    velX: Math.cos(rand(0, TAU)),
    velY: Math.sin(rand(0, TAU)),
    points
  });
}

function initAsteroids() {
  asteroids = [];
  for (let i = 0; i < wave + 3; i++) {
    createAsteroid(rand(0, canvas.width), rand(0, canvas.height));
  }
}

initAsteroids();

// ================= DRAW =================
function drawShip() {
  if (ship.invincible > 0 && Math.floor(ship.invincible / 5) % 2) return;

  ctx.save();
  ctx.translate(ship.x, ship.y);
  ctx.rotate(ship.angle);

  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(16, 0);
  ctx.lineTo(-12, -10);
  ctx.lineTo(-6, 0);
  ctx.lineTo(-12, 10);
  ctx.closePath();
  ctx.stroke();

  ctx.restore();
}

function drawAsteroids() {
  ctx.strokeStyle = "#9ca3af";
  ctx.lineWidth = 2;

  asteroids.forEach(a => {
    ctx.save();
    ctx.translate(a.x, a.y);
    ctx.rotate(a.angle);
    ctx.beginPath();

    a.points.forEach((p, i) => {
      const ang = (i / a.points.length) * TAU;
      const r = a.r * p;
      const x = Math.cos(ang) * r;
      const y = Math.sin(ang) * r;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });

    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  });
}

function drawBullets() {
  ctx.fillStyle = "#38bdf8";
  bullets.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, 2, 0, TAU);
    ctx.fill();
  });
}

function drawParticles() {
  particles.forEach(p => {
    ctx.fillStyle = `rgba(255,255,255,${p.life / 30})`;
    ctx.fillRect(p.x, p.y, 2, 2);
  });
}

function drawHUD() {
  ctx.fillStyle = "#fff";
  ctx.font = "16px Arial";
  ctx.fillText(`Score: ${score}`, 20, 30);
  ctx.fillText(`Lives: ${lives}`, 820, 30);
  ctx.fillText(`Wave: ${wave}`, 420, 30);
}

// ================= UPDATE =================
function updateShip() {
  if (keys["ArrowLeft"]) ship.angle -= 0.07;
  if (keys["ArrowRight"]) ship.angle += 0.07;

  if (keys["ArrowUp"]) {
    ship.velX += Math.cos(ship.angle) * ship.thrust;
    ship.velY += Math.sin(ship.angle) * ship.thrust;
  }

  ship.x += ship.velX;
  ship.y += ship.velY;
  ship.velX *= ship.friction;
  ship.velY *= ship.friction;
  wrap(ship);

  if (keys["Space"] && ship.cooldown <= 0) {
    bullets.push({
      x: ship.x + Math.cos(ship.angle) * ship.r,
      y: ship.y + Math.sin(ship.angle) * ship.r,
      velX: Math.cos(ship.angle) * 7,
      velY: Math.sin(ship.angle) * 7,
      life: 60
    });
    ship.cooldown = 12;
  }

  ship.cooldown--;
  if (ship.invincible > 0) ship.invincible--;
}

function updateBullets() {
  bullets.forEach(b => {
    b.x += b.velX;
    b.y += b.velY;
    b.life--;
    wrap(b);
  });
  bullets.splice(0, bullets.filter(b => b.life <= 0).length);
}

function updateAsteroids() {
  asteroids.forEach(a => {
    a.x += a.velX * a.speed;
    a.y += a.velY * a.speed;
    a.angle += a.spin;
    wrap(a);

    const dx = ship.x - a.x;
    const dy = ship.y - a.y;
    if (
      ship.invincible <= 0 &&
      Math.hypot(dx, dy) < a.r + ship.r
    ) {
      lives--;
      ship.invincible = 120;
      ship.x = canvas.width / 2;
      ship.y = canvas.height / 2;
      ship.velX = ship.velY = 0;
      if (lives <= 0) state = "gameover";
    }
  });
}

function explode(x, y) {
  for (let i = 0; i < 30; i++) {
    particles.push({
      x, y,
      velX: rand(-2, 2),
      velY: rand(-2, 2),
      life: 30
    });
  }
}

function updateParticles() {
  particles.forEach(p => {
    p.x += p.velX;
    p.y += p.velY;
    p.life--;
  });
  particles.splice(0, particles.filter(p => p.life <= 0).length);
}

function collisions() {
  bullets.forEach(b => {
    asteroids.forEach(a => {
      if (Math.hypot(b.x - a.x, b.y - a.y) < a.r) {
        b.life = 0;
        score += 20;
        explode(a.x, a.y);

        if (a.size > 1) {
          createAsteroid(a.x, a.y, a.size - 1);
          createAsteroid(a.x, a.y, a.size - 1);
        }
        asteroids.splice(asteroids.indexOf(a), 1);
      }
    });
  });

  if (asteroids.length === 0) {
    wave++;
    initAsteroids();
  }
}

// ================= LOOP =================
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (state === "play") {
    updateShip();
    updateBullets();
    updateAsteroids();
    updateParticles();
    collisions();
  }

  drawParticles();
  drawShip();
  drawBullets();
  drawAsteroids();
  drawHUD();

  if (state === "gameover") {
    ctx.fillStyle = "red";
    ctx.font = "42px Arial Black";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
    ctx.font = "18px Arial";
    ctx.fillText("Press any key to restart", canvas.width / 2, canvas.height / 2 + 40);
  }

  requestAnimationFrame(loop);
}

// ================= RESET =================
function resetGame() {
  score = 0;
  lives = 3;
  wave = 1;
  state = "play";
  ship.invincible = 120;
  initAsteroids();
}

loop();
