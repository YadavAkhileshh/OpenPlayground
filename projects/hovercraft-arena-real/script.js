const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const hpEl = document.getElementById("hp");
const enemiesEl = document.getElementById("enemies");
const boostEl = document.getElementById("boost");

// ================= INPUT =================
const keys = {};
addEventListener("keydown", e => keys[e.code] = true);
addEventListener("keyup", e => keys[e.code] = false);

// ================= CAMERA =================
let camShake = 0;

// ================= CONSTANTS =================
const THRUST = 0.25;
const TURN = 0.05;
const DRAG = 0.96;
const BOOST = 3.2;

// ================= PLAYER =================
let player, enemies, boostCooldown, gameOver;

function reset() {
  player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    vx: 0,
    vy: 0,
    angle: 0,
    hp: 100
  };

  enemies = Array.from({ length: 4 }, spawnEnemy);
  boostCooldown = 0;
  gameOver = false;
}
reset();

// ================= ENEMY =================
function spawnEnemy() {
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: 0,
    vy: 0,
    angle: Math.random() * Math.PI * 2,
    hp: 60
  };
}

// ================= UPDATE =================
function updatePlayer() {
  if (keys["KeyA"]) player.angle -= TURN;
  if (keys["KeyD"]) player.angle += TURN;

  if (keys["KeyW"]) {
    player.vx += Math.cos(player.angle) * THRUST;
    player.vy += Math.sin(player.angle) * THRUST;
  }

  if (keys["Space"] && boostCooldown <= 0) {
    player.vx += Math.cos(player.angle) * BOOST;
    player.vy += Math.sin(player.angle) * BOOST;
    boostCooldown = 120;
    camShake = 14;
  }

  player.x += player.vx;
  player.y += player.vy;

  player.vx *= DRAG;
  player.vy *= DRAG;

  boostCooldown--;

  player.x = Math.max(40, Math.min(canvas.width - 40, player.x));
  player.y = Math.max(40, Math.min(canvas.height - 40, player.y));
}

function updateEnemies() {
  enemies.forEach(e => {
    const dx = player.x - e.x;
    const dy = player.y - e.y;
    const desiredAngle = Math.atan2(dy, dx);

    e.angle += (desiredAngle - e.angle) * 0.05;

    e.vx += Math.cos(e.angle) * 0.18;
    e.vy += Math.sin(e.angle) * 0.18;

    e.x += e.vx;
    e.y += e.vy;

    e.vx *= 0.97;
    e.vy *= 0.97;

    if (Math.hypot(player.x - e.x, player.y - e.y) < 36) {
      player.hp -= 1;
      e.hp -= 1;
      camShake = 8;
    }
  });

  enemies = enemies.filter(e => e.hp > 0);
}

// ================= DRAW =================
function drawHovercraft(x, y, angle, color, glow) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  ctx.shadowColor = glow;
  ctx.shadowBlur = 30;

  // Hull
  ctx.fillStyle = "#020617";
  ctx.beginPath();
  ctx.moveTo(28, 0);
  ctx.lineTo(-22, -16);
  ctx.lineTo(-10, 0);
  ctx.lineTo(-22, 16);
  ctx.closePath();
  ctx.fill();

  // Outline
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Engines
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(-18, -8, 4, 0, Math.PI * 2);
  ctx.arc(-18, 8, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
  ctx.shadowBlur = 0;
}

function drawCamera(fn) {
  ctx.save();
  if (camShake > 0) {
    ctx.translate(
      (Math.random() - 0.5) * camShake,
      (Math.random() - 0.5) * camShake
    );
    camShake *= 0.85;
  }
  fn();
  ctx.restore();
}

// ================= LOOP =================
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!gameOver) {
    updatePlayer();
    updateEnemies();
  }

  drawCamera(() => {
    drawHovercraft(player.x, player.y, player.angle, "#38bdf8", "#38bdf8");
    enemies.forEach(e =>
      drawHovercraft(e.x, e.y, e.angle, "#ef4444", "#ef4444")
    );
  });

  hpEl.textContent = player.hp;
  enemiesEl.textContent = enemies.length;
  boostEl.textContent = boostCooldown > 0 ? "Cooldown" : "Ready";

  if (player.hp <= 0) {
    gameOver = true;
    ctx.fillStyle = "#ef4444";
    ctx.font = "56px Inter";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
  }

  if (enemies.length === 0) {
    gameOver = true;
    ctx.fillStyle = "#22c55e";
    ctx.font = "56px Inter";
    ctx.textAlign = "center";
    ctx.fillText("VICTORY", canvas.width / 2, canvas.height / 2);
  }

  if (keys["KeyR"]) reset();

  requestAnimationFrame(loop);
}

loop();
