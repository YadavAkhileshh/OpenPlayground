





























// ── CONSTANTS ────────────────────────────────────────────────
const PADDLE_H      = 12;
const PADDLE_W_BASE = 120;
const BALL_R        = 9;
const BRICK_ROWS    = 5;
const BRICK_COLS    = 10;
const BRICK_PAD     = 6;
const BRICK_TOP     = 60;
const MAX_LIVES     = 3;
const BALL_SPEED    = 6;

// Neon colours per brick row
const ROW_COLORS = [
  { fill: "#FF3366", glow: "#FF3366" },  // row 0 — hot pink
  { fill: "#FF6600", glow: "#FF6600" },  // row 1 — orange
  { fill: "#FFE600", glow: "#FFE600" },  // row 2 — yellow
  { fill: "#00FF88", glow: "#00FF88" },  // row 3 — green
  { fill: "#00FFFF", glow: "#00FFFF" },  // row 4 — cyan
];

// Power-up types
const POWERUP_TYPES = ["wide", "multi", "fast", "slow", "laser"];

// ── STATE ────────────────────────────────────────────────────
let canvas, ctx;
let W, H;
let gameRunning  = false;
let balls        = [];
let paddle       = {};
let bricks       = [];
let particles    = [];
let powerUps     = [];
let lasers       = [];
let score        = 0;
let hiScore      = 0;
let lives        = MAX_LIVES;
let level        = 1;
let launched     = false;
let paddleW      = PADDLE_W_BASE;
let laserActive  = false;
let laserTimer   = 0;
let keys         = {};
let mouseX       = null;
let animId       = null;
let flashTimer   = 0;

// ── BG CANVAS (start screen particles) ───────────────────────
const bgCanvas  = document.getElementById("bg-canvas");
const bgCtx     = bgCanvas.getContext("2d");
let bgParticles = [];

function initBgParticles() {
  bgCanvas.width  = window.innerWidth;
  bgCanvas.height = window.innerHeight;
  bgParticles = Array.from({ length: 60 }, () => ({
    x: Math.random() * bgCanvas.width,
    y: Math.random() * bgCanvas.height,
    r: Math.random() * 2 + 0.5,
    dx: (Math.random() - 0.5) * 0.6,
    dy: (Math.random() - 0.5) * 0.6,
    color: ["#00FFFF","#FF00FF","#00FF88","#FFE600","#FF3366"][Math.floor(Math.random()*5)],
    alpha: Math.random() * 0.6 + 0.2
  }));
}

function drawBg() {
  if (document.getElementById("screen-start").classList.contains("hidden")) return;
  bgCanvas.width = window.innerWidth;
  bgCanvas.height = window.innerHeight;
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
  bgParticles.forEach(p => {
    p.x += p.dx; p.y += p.dy;
    if (p.x < 0) p.x = bgCanvas.width;
    if (p.x > bgCanvas.width)  p.x = 0;
    if (p.y < 0) p.y = bgCanvas.height;
    if (p.y > bgCanvas.height) p.y = 0;
    bgCtx.beginPath();
    bgCtx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    bgCtx.fillStyle = p.color + Math.floor(p.alpha*255).toString(16).padStart(2,"0");
    bgCtx.shadowColor = p.color;
    bgCtx.shadowBlur  = 8;
    bgCtx.fill();
    bgCtx.shadowBlur = 0;
  });
  requestAnimationFrame(drawBg);
}

// ── SCREEN MANAGEMENT ────────────────────────────────────────
function showScreen(id) {
  ["screen-start","screen-game","screen-over"].forEach(s => {
    document.getElementById(s).classList.toggle("hidden", s !== id);
  });
}

// ── INIT GAME ────────────────────────────────────────────────
function initGame() {
  canvas = document.getElementById("game-canvas");
  ctx    = canvas.getContext("2d");
  resizeCanvas();

  score       = 0;
  lives       = MAX_LIVES;
  level       = 1;
  paddleW     = PADDLE_W_BASE;
  laserActive = false;
  laserTimer  = 0;
  particles   = [];
  powerUps    = [];
  lasers      = [];

  resetPaddle();
  resetBall();
  buildBricks();
  updateHUD();

  showScreen("screen-game");
  gameRunning = true;

  if (animId) cancelAnimationFrame(animId);
  gameLoop();
}

function resizeCanvas() {
  const container = document.getElementById("screen-game");
  W = canvas.width  = container.offsetWidth;
  H = canvas.height = container.offsetHeight - 52; // minus HUD
}

function resetPaddle() {
  paddle = {
    x: W / 2 - paddleW / 2,
    y: H - 40,
    w: paddleW,
    h: PADDLE_H
  };
}

function resetBall(fromPaddle = true) {
  launched = false;
  balls = [{
    x:  paddle.x + paddle.w / 2,
    y:  paddle.y - BALL_R - 2,
    dx: (Math.random() > 0.5 ? 1 : -1) * BALL_SPEED * 0.7,
    dy: -BALL_SPEED,
    r:  BALL_R,
    trail: []
  }];
}

// ── BUILD BRICKS ─────────────────────────────────────────────
function buildBricks() {
  bricks = [];
  const brickW = (W - BRICK_PAD * (BRICK_COLS + 1)) / BRICK_COLS;
  const brickH = 28;

  for (let r = 0; r < BRICK_ROWS; r++) {
    for (let c = 0; c < BRICK_COLS; c++) {
      const hp = (level >= 3 && r === 0) ? 3
               : (level >= 2 && r <= 1)  ? 2
               : 1;
      bricks.push({
        x:       BRICK_PAD + c * (brickW + BRICK_PAD),
        y:       BRICK_TOP + r * (brickH + BRICK_PAD),
        w:       brickW,
        h:       brickH,
        hp:      hp,
        maxHp:   hp,
        color:   ROW_COLORS[r].fill,
        glow:    ROW_COLORS[r].glow,
        alive:   true,
        shake:   0
      });
    }
  }
}

// ── PARTICLES ────────────────────────────────────────────────
function spawnParticles(x, y, color, count = 14) {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
    const speed = Math.random() * 5 + 2;
    particles.push({
      x, y,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
      r:  Math.random() * 4 + 2,
      life: 1,
      decay: Math.random() * 0.04 + 0.02,
      color
    });
  }
}

function spawnScoreFloat(x, y, text, color) {
  particles.push({
    x, y, dx: 0, dy: -1.5,
    r: 0, life: 1, decay: 0.018,
    color, text,
    isText: true
  });
}

// ── POWER-UPS ────────────────────────────────────────────────
function spawnPowerUp(x, y) {
  if (Math.random() > 0.25) return; // 25% chance
  const type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
  const colors = { wide:"#00FF88", multi:"#FF00FF", fast:"#FF6600", slow:"#00FFFF", laser:"#FFE600" };
  const labels = { wide:"WIDE", multi:"x3", fast:"FAST", slow:"SLOW", laser:"⚡" };
  powerUps.push({ x: x - 18, y, w: 36, h: 20, dy: 2, type, color: colors[type], label: labels[type] });
}

function applyPowerUp(type) {
  if (type === "wide") {
    paddleW = Math.min(220, paddleW + 50);
    paddle.w = paddleW;
    setTimeout(() => { paddleW = PADDLE_W_BASE; if (paddle) paddle.w = paddleW; }, 8000);
  } else if (type === "multi") {
    const extra = balls[0];
    for (let i = 0; i < 2; i++) {
      balls.push({
        x: extra.x, y: extra.y,
        dx: (Math.random()-0.5) * BALL_SPEED * 1.5,
        dy: -BALL_SPEED,
        r:  BALL_R, trail: []
      });
    }
  } else if (type === "fast") {
    balls.forEach(b => { b.dx *= 1.4; b.dy *= 1.4; });
    setTimeout(() => balls.forEach(b => {
      const spd = Math.sqrt(b.dx*b.dx+b.dy*b.dy);
      b.dx = b.dx/spd*BALL_SPEED; b.dy = b.dy/spd*BALL_SPEED;
    }), 5000);
  } else if (type === "slow") {
    balls.forEach(b => { b.dx *= 0.6; b.dy *= 0.6; });
    setTimeout(() => balls.forEach(b => {
      const spd = Math.sqrt(b.dx*b.dx+b.dy*b.dy);
      b.dx = b.dx/spd*BALL_SPEED; b.dy = b.dy/spd*BALL_SPEED;
    }), 5000);
  } else if (type === "laser") {
    laserActive = true;
    laserTimer  = 300;
  }
}

// ── HUD ──────────────────────────────────────────────────────
function updateHUD() {
  document.getElementById("hud-score").textContent = score;
  document.getElementById("hud-level").textContent = level;
  document.getElementById("hud-lives").textContent = "❤️".repeat(lives);
}

// ── GAME LOOP ────────────────────────────────────────────────
function gameLoop() {
  if (!gameRunning) return;
  update();
  render();
  animId = requestAnimationFrame(gameLoop);
}

// ── UPDATE ───────────────────────────────────────────────────
function update() {

  // Paddle movement
  const speed = 9;
  if (keys["ArrowLeft"]  || keys["a"]) paddle.x -= speed;
  if (keys["ArrowRight"] || keys["d"]) paddle.x += speed;
  if (mouseX !== null) paddle.x = mouseX - paddle.w / 2;
  paddle.x = Math.max(0, Math.min(W - paddle.w, paddle.x));

  // Laser
  if (laserActive) {
    laserTimer--;
    if (laserTimer <= 0) laserActive = false;
    // Fire laser
    if (laserTimer % 20 === 0) {
      lasers.push({ x: paddle.x + paddle.w * 0.3, y: paddle.y - 4, dy: -14 });
      lasers.push({ x: paddle.x + paddle.w * 0.7, y: paddle.y - 4, dy: -14 });
    }
  }

  // Laser movement & brick hit
  lasers = lasers.filter(l => {
    l.y += l.dy;
    for (let b of bricks) {
      if (!b.alive) continue;
      if (l.x > b.x && l.x < b.x+b.w && l.y > b.y && l.y < b.y+b.h) {
        hitBrick(b, l.x, l.y);
        return false;
      }
    }
    return l.y > 0;
  });

  // Balls
  if (!launched) {
    balls[0].x = paddle.x + paddle.w / 2;
    balls[0].y = paddle.y - BALL_R - 2;
  }

  balls = balls.filter(ball => {
    if (!launched) return true;

    // Trail
    ball.trail.push({ x: ball.x, y: ball.y });
    if (ball.trail.length > 10) ball.trail.shift();

    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall bounce
    if (ball.x - ball.r < 0)  { ball.x = ball.r;    ball.dx = Math.abs(ball.dx); }
    if (ball.x + ball.r > W)  { ball.x = W-ball.r;  ball.dx = -Math.abs(ball.dx); }
    if (ball.y - ball.r < 0)  { ball.y = ball.r;    ball.dy = Math.abs(ball.dy); flashTimer = 5; }

    // Paddle collision
    if (
      ball.dy > 0 &&
      ball.x > paddle.x && ball.x < paddle.x + paddle.w &&
      ball.y + ball.r >= paddle.y && ball.y - ball.r <= paddle.y + paddle.h
    ) {
      ball.y = paddle.y - ball.r;
      // Angle based on hit position
      const hitPos = (ball.x - paddle.x) / paddle.w; // 0–1
      const angle  = (hitPos - 0.5) * Math.PI * 0.7;
      const spd    = Math.sqrt(ball.dx*ball.dx + ball.dy*ball.dy);
      ball.dx = Math.sin(angle) * spd;
      ball.dy = -Math.abs(Math.cos(angle) * spd);
    }

    // Brick collision
    for (let b of bricks) {
      if (!b.alive) continue;
      if (
        ball.x + ball.r > b.x && ball.x - ball.r < b.x + b.w &&
        ball.y + ball.r > b.y && ball.y - ball.r < b.y + b.h
      ) {
        // Which side?
        const overlapL = (ball.x + ball.r) - b.x;
        const overlapR = (b.x + b.w) - (ball.x - ball.r);
        const overlapT = (ball.y + ball.r) - b.y;
        const overlapB = (b.y + b.h) - (ball.y - ball.r);
        const minH = Math.min(overlapL, overlapR);
        const minV = Math.min(overlapT, overlapB);
        if (minH < minV) ball.dx = -ball.dx;
        else             ball.dy = -ball.dy;

        hitBrick(b, ball.x, ball.y);
        break;
      }
    }

    // Ball lost
    if (ball.y > H + 40) return false;
    return true;
  });

  // All balls lost
  if (balls.length === 0) {
    lives--;
    updateHUD();
    if (lives <= 0) {
      endGame(false);
    } else {
      resetBall();
      spawnParticles(W/2, H/2, "#FF3366", 20);
    }
  }

  // Power-ups
  powerUps = powerUps.filter(p => {
    p.y += p.dy;
    // Catch
    if (p.y + p.h >= paddle.y && p.y <= paddle.y + paddle.h &&
        p.x + p.w >= paddle.x && p.x <= paddle.x + paddle.w) {
      applyPowerUp(p.type);
      spawnParticles(p.x + p.w/2, p.y, p.color, 10);
      spawnScoreFloat(p.x, p.y, p.label.toUpperCase()+"!", p.color);
      return false;
    }
    return p.y < H + 30;
  });

  // Particles
  particles.forEach(p => {
    p.x += p.dx; p.y += p.dy;
    p.life -= p.decay;
    if (!p.isText) { p.dx *= 0.95; p.dy *= 0.95; }
  });
  particles = particles.filter(p => p.life > 0);

  // Brick shakes
  bricks.forEach(b => { if (b.shake > 0) b.shake--; });

  // Flash timer
  if (flashTimer > 0) flashTimer--;

  // Check win
  if (bricks.every(b => !b.alive)) {
    level++;
    if (level > 5) {
      endGame(true);
    } else {
      paddleW = PADDLE_W_BASE;
      resetPaddle();
      resetBall();
      buildBricks();
      updateHUD();
    }
  }
}

function hitBrick(b, bx, by) {
  b.hp--;
  b.shake = 6;
  spawnParticles(bx, by, b.color, 8);

  if (b.hp <= 0) {
    b.alive = false;
    const pts = 10 * level;
    score += pts;
    updateHUD();
    spawnParticles(b.x + b.w/2, b.y + b.h/2, b.color, 16);
    spawnScoreFloat(b.x + b.w/2, b.y, "+" + pts, b.color);
    spawnPowerUp(b.x + b.w/2, b.y + b.h/2);
    if (score > hiScore) {
      hiScore = score;
      document.getElementById("hi-score-display").textContent = hiScore;
    }
  }
}

// ── RENDER ───────────────────────────────────────────────────
function render() {
  // Background
  ctx.fillStyle = flashTimer > 0 ? "rgba(0,100,120,0.95)" : "#04040F";
  ctx.fillRect(0, 0, W, H);

  // Grid lines (subtle)
  ctx.strokeStyle = "rgba(0,255,255,0.04)";
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
  for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

  // Bricks
  bricks.forEach(b => {
    if (!b.alive) return;
    const sx = b.shake > 0 ? (Math.random()-0.5)*4 : 0;
    const sy = b.shake > 0 ? (Math.random()-0.5)*4 : 0;
    const x = b.x + sx, y = b.y + sy;

    // Dim based on hp
    const alpha = 0.4 + (b.hp / b.maxHp) * 0.6;

    ctx.save();
    ctx.shadowColor = b.glow;
    ctx.shadowBlur  = 18;
    ctx.fillStyle   = b.color + Math.floor(alpha * 255).toString(16).padStart(2,"0");
    ctx.beginPath();
    ctx.roundRect(x + 1, y + 1, b.w - 2, b.h - 2, 4);
    ctx.fill();
    ctx.strokeStyle = b.color;
    ctx.lineWidth   = 1;
    ctx.stroke();
    ctx.restore();

    // HP dots
    if (b.maxHp > 1) {
      for (let i = 0; i < b.hp; i++) {
        ctx.beginPath();
        ctx.arc(x + b.w/2 - (b.hp-1)*5 + i*10, y + b.h/2, 3, 0, Math.PI*2);
        ctx.fillStyle = "#fff";
        ctx.shadowBlur = 4; ctx.shadowColor = "#fff";
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
  });

  // Power-ups
  powerUps.forEach(p => {
    ctx.save();
    ctx.shadowColor = p.color;
    ctx.shadowBlur  = 16;
    ctx.fillStyle   = "rgba(0,0,0,0.8)";
    ctx.strokeStyle = p.color;
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.roundRect(p.x, p.y, p.w, p.h, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = p.color;
    ctx.font = "bold 11px 'Orbitron', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(p.label, p.x + p.w/2, p.y + p.h/2);
    ctx.restore();
  });

  // Lasers
  lasers.forEach(l => {
    ctx.save();
    ctx.strokeStyle = "#FFE600";
    ctx.lineWidth   = 3;
    ctx.shadowColor = "#FFE600";
    ctx.shadowBlur  = 16;
    ctx.beginPath();
    ctx.moveTo(l.x, l.y);
    ctx.lineTo(l.x, l.y + 16);
    ctx.stroke();
    ctx.restore();
  });

  // Ball trails + balls
  balls.forEach(ball => {
    // Trail
    ball.trail.forEach((t, i) => {
      const alpha = i / ball.trail.length;
      ctx.beginPath();
      ctx.arc(t.x, t.y, ball.r * alpha * 0.7, 0, Math.PI*2);
      ctx.fillStyle = `rgba(0,255,255,${alpha * 0.3})`;
      ctx.fill();
    });

    // Ball
    ctx.save();
    const ballGrad = ctx.createRadialGradient(ball.x-3, ball.y-3, 1, ball.x, ball.y, ball.r);
    ballGrad.addColorStop(0, "#ffffff");
    ballGrad.addColorStop(0.4, "#00FFFF");
    ballGrad.addColorStop(1, "#0080FF");
    ctx.shadowColor = "#00FFFF";
    ctx.shadowBlur  = 30;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2);
    ctx.fillStyle = ballGrad;
    ctx.fill();
    ctx.restore();
  });

  // Paddle
  ctx.save();
  const pGrad = ctx.createLinearGradient(paddle.x, paddle.y, paddle.x, paddle.y + paddle.h);
  pGrad.addColorStop(0, "#00FFFF");
  pGrad.addColorStop(1, "#0044AA");
  ctx.shadowColor = "#00FFFF";
  ctx.shadowBlur  = laserActive ? 40 : 20;
  ctx.fillStyle   = pGrad;
  ctx.beginPath();
  ctx.roundRect(paddle.x, paddle.y, paddle.w, paddle.h, 6);
  ctx.fill();
  // Highlight
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.beginPath();
  ctx.roundRect(paddle.x + 4, paddle.y + 2, paddle.w - 8, 3, 2);
  ctx.fill();
  ctx.restore();

  // Particles
  particles.forEach(p => {
    if (p.isText) {
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle   = p.color;
      ctx.font        = "bold 14px 'Orbitron', monospace";
      ctx.textAlign   = "center";
      ctx.shadowColor = p.color;
      ctx.shadowBlur  = 10;
      ctx.fillText(p.text, p.x, p.y);
      ctx.restore();
    } else {
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.shadowColor = p.color;
      ctx.shadowBlur  = 10;
      ctx.fillStyle   = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
    }
  });

  // Launch hint
  if (!launched && balls.length > 0) {
    ctx.save();
    ctx.globalAlpha = 0.5 + Math.sin(Date.now()*0.006)*0.5;
    ctx.fillStyle   = "#00FFFF";
    ctx.font        = "11px 'Share Tech Mono', monospace";
    ctx.textAlign   = "center";
    ctx.letterSpacing = "3px";
    ctx.fillText("PRESS SPACE OR TAP TO LAUNCH", W/2, balls[0].y - 28);
    ctx.restore();
  }
}

// ── END GAME ─────────────────────────────────────────────────
function endGame(won) {
  gameRunning = false;
  cancelAnimationFrame(animId);

  const title = document.getElementById("over-title");
  title.textContent = won ? "YOU WIN!" : "GAME OVER";
  title.className   = "over-title" + (won ? " win" : "");

  document.getElementById("over-score").textContent = score;
  document.getElementById("over-hi").textContent    = hiScore;
  showScreen("screen-over");
}

// ── INPUT ────────────────────────────────────────────────────
window.addEventListener("keydown", e => {
  keys[e.key] = true;
  if (e.key === " " || e.key === "ArrowUp") {
    e.preventDefault();
    if (!launched) launched = true;
  }
});
window.addEventListener("keyup", e => { keys[e.key] = false; });

window.addEventListener("mousemove", e => {
  const rect = canvas ? canvas.getBoundingClientRect() : null;
  if (rect) mouseX = e.clientX - rect.left;
});

// Touch support
window.addEventListener("touchmove", e => {
  e.preventDefault();
  const rect = canvas ? canvas.getBoundingClientRect() : null;
  if (rect) mouseX = e.touches[0].clientX - rect.left;
}, { passive: false });

window.addEventListener("touchstart", e => {
  if (!launched) launched = true;
}, { passive: true });

window.addEventListener("resize", () => {
  if (gameRunning) {
    resizeCanvas();
    resetPaddle();
  }
});

// ── BUTTONS ──────────────────────────────────────────────────
document.getElementById("btn-start").addEventListener("click", () => {
  mouseX = null;
  initGame();
});

document.getElementById("btn-restart").addEventListener("click", () => {
  mouseX = null;
  initGame();
});

document.getElementById("btn-menu").addEventListener("click", () => {
  gameRunning = false;
  cancelAnimationFrame(animId);
  document.getElementById("hi-score-display").textContent = hiScore;
  showScreen("screen-start");
});

// ── BOOT ─────────────────────────────────────────────────────
initBgParticles();
drawBg();
