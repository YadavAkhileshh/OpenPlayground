const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const fuelEl = document.getElementById("fuel");
const velocityEl = document.getElementById("velocity");
const angleEl = document.getElementById("angle");
const restartBtn = document.getElementById("restartBtn");

// ================= INPUT =================
const keys = {};
document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

// ================= STATE =================
let state = "play"; // play | success | crash
const gravity = 0.05;
const thrustPower = 0.15;

// ================= SHIP =================
let ship;

// ================= STARS =================
const stars = Array.from({ length: 120 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  size: Math.random() * 2,
  speed: Math.random() * 0.6 + 0.2
}));

// ================= PARTICLES =================
const particles = [];

function spawnParticles(x, y, color) {
  for (let i = 0; i < 30; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      life: 30,
      color
    });
  }
}

// ================= RESET =================
function resetGame() {
  ship = {
    x: canvas.width / 2,
    y: 80,
    vx: 0,
    vy: 0,
    angle: 0,
    fuel: 100
  };
  particles.length = 0;
  state = "play";
}

restartBtn.onclick = resetGame;
document.addEventListener("keydown", e => {
  if (state !== "play" && e.code === "Space") resetGame();
});

// ================= DRAW =================
function drawStars() {
  ctx.fillStyle = "#9ca3af";
  stars.forEach(s => {
    ctx.fillRect(s.x, s.y, s.size, s.size);
    s.y += s.speed;
    if (s.y > canvas.height) {
      s.y = 0;
      s.x = Math.random() * canvas.width;
    }
  });
}

function drawGround() {
  ctx.strokeStyle = "#22c55e";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, canvas.height - 40);
  ctx.lineTo(canvas.width, canvas.height - 40);
  ctx.stroke();
}

function drawShip() {
  ctx.save();
  ctx.translate(ship.x, ship.y);
  ctx.rotate(ship.angle);

  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -14);
  ctx.lineTo(-10, 12);
  ctx.lineTo(10, 12);
  ctx.closePath();
  ctx.stroke();

  if (keys["ArrowUp"] && ship.fuel > 0 && state === "play") {
    const flicker = Math.random() * 6 + 14;
    ctx.strokeStyle = "#facc15";
    ctx.beginPath();
    ctx.moveTo(-4, 12);
    ctx.lineTo(0, flicker);
    ctx.lineTo(4, 12);
    ctx.stroke();
  }

  ctx.restore();
}

function drawParticles() {
  particles.forEach(p => {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.life / 30;
    ctx.fillRect(p.x, p.y, 2, 2);
    ctx.globalAlpha = 1;
  });
}

function drawMessage(text, color) {
  ctx.fillStyle = color;
  ctx.font = "42px Inter";
  ctx.textAlign = "center";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  ctx.font = "18px Inter";
  ctx.fillText("Press SPACE or Restart", canvas.width / 2, canvas.height / 2 + 40);
}

// ================= UPDATE =================
function update() {
  if (state !== "play") return;

  if (keys["ArrowLeft"]) ship.angle -= 0.04;
  if (keys["ArrowRight"]) ship.angle += 0.04;

  if (keys["ArrowUp"] && ship.fuel > 0) {
    ship.vx += Math.sin(ship.angle) * thrustPower;
    ship.vy -= Math.cos(ship.angle) * thrustPower;
    ship.fuel -= 0.25;
  }

  ship.vy += gravity;
  ship.x += ship.vx;
  ship.y += ship.vy;

  if (ship.y >= canvas.height - 52) {
    if (Math.abs(ship.vy) < 1 && Math.abs(ship.angle) < 0.2) {
      state = "success";
      spawnParticles(ship.x, ship.y, "#22c55e");
    } else {
      state = "crash";
      spawnParticles(ship.x, ship.y, "#ef4444");
    }
  }

  fuelEl.textContent = `${Math.max(0, ship.fuel.toFixed(0))}%`;
  velocityEl.textContent = ship.vy.toFixed(2);
  angleEl.textContent = `${Math.abs((ship.angle * 57.3).toFixed(0))}°`;
}

function updateParticles() {
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
  });
  particles.splice(0, particles.filter(p => p.life <= 0).length);
}

// ================= LOOP =================
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawStars();
  drawGround();
  drawShip();
  drawParticles();

  update();
  updateParticles();

  if (state === "success") drawMessage("SUCCESSFUL LANDING", "#22c55e");
  if (state === "crash") drawMessage("CRASHED", "#ef4444");

  requestAnimationFrame(loop);
}

resetGame();
loop();
