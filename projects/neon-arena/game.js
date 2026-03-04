// ==========================
// NEON RIFT: ARENA OVERDRIVE
// Fixed Movement Version
// ==========================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ==========================
// GAME STATE
// ==========================

const STATE = {
  MENU: "menu",
  PLAYING: "playing",
  GAME_OVER: "game_over"
};

let gameState = STATE.MENU;

// ==========================
// VARIABLES
// ==========================

let keys = {};
let bullets = [];
let enemies = [];

let wave = 1;
let enemiesToSpawn = 0;
let spawnTimer = 0;

let score = 0;
let currency = 0;
let dashCooldown = 0;
let weaponType = 1;
let screenShake = 0;

// ==========================
// PLAYER
// ==========================

const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 15,
  speed: 4,
  health: 100,
  maxHealth: 100
};

// ==========================
// INPUT
// ==========================

window.addEventListener("keydown", e => {
  keys[e.key] = true;

  if (gameState === STATE.MENU && e.key === "Enter") {
    startGame();
  }

  if (e.key === "1") weaponType = 1;
  if (e.key === "2") weaponType = 2;
  if (e.key === "3") weaponType = 3;
});

window.addEventListener("keyup", e => keys[e.key] = false);

let mouse = { x: 0, y: 0 };

canvas.addEventListener("mousemove", e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

canvas.addEventListener("click", () => {
  if (gameState !== STATE.PLAYING) return;
  shoot();
});

// ==========================
// GAME START
// ==========================

function startGame() {
  gameState = STATE.PLAYING;
  wave = 1;
  score = 0;
  currency = 0;
  player.health = player.maxHealth;
  enemies = [];
  bullets = [];
  nextWave();
}

// ==========================
// WAVE SYSTEM
// ==========================

function nextWave() {
  enemiesToSpawn = wave * 5;
  spawnTimer = 60;
}

function spawnEnemy() {
  const edge = Math.floor(Math.random() * 4);
  let x, y;

  if (edge === 0) { x = 0; y = Math.random() * canvas.height; }
  if (edge === 1) { x = canvas.width; y = Math.random() * canvas.height; }
  if (edge === 2) { x = Math.random() * canvas.width; y = 0; }
  if (edge === 3) { x = Math.random() * canvas.width; y = canvas.height; }

  let type = "normal";
  if (wave > 2 && Math.random() < 0.3) type = "fast";
  if (wave > 3 && Math.random() < 0.2) type = "tank";
  if (wave % 5 === 0 && enemies.length === 0) type = "boss";

  let enemy = {
    x,
    y,
    type,
    radius: 15,
    speed: 1.5,
    health: 20
  };

  if (type === "fast") {
    enemy.speed = 3;
    enemy.radius = 10;
  }

  if (type === "tank") {
    enemy.health = 60;
    enemy.radius = 20;
  }

  if (type === "boss") {
    enemy.health = 300;
    enemy.radius = 40;
    enemy.speed = 1;
  }

  enemies.push(enemy);
}

// ==========================
// SHOOTING
// ==========================

function shoot() {
  const angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);

  if (weaponType === 1) {
    createBullet(angle);
  }

  if (weaponType === 2) {
    createBullet(angle - 0.2);
    createBullet(angle);
    createBullet(angle + 0.2);
  }

  if (weaponType === 3 && dashCooldown <= 0) {
    for (let i = -2; i <= 2; i++) {
      createBullet(angle + i * 0.1);
    }
    dashCooldown = 120;
  }
}

function createBullet(angle) {
  bullets.push({
    x: player.x,
    y: player.y,
    dx: Math.cos(angle) * 8,
    dy: Math.sin(angle) * 8,
    life: 60
  });
}

// ==========================
// UPDATE LOOP
// ==========================

function update() {

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameState === STATE.MENU) {
    drawMenu();
    requestAnimationFrame(update);
    return;
  }

  // Screen Shake
  if (screenShake > 0) {
    ctx.save();
    ctx.translate(
      Math.random() * screenShake - screenShake/2,
      Math.random() * screenShake - screenShake/2
    );
    screenShake--;
  }

  // Movement
  if (keys["w"] || keys["ArrowUp"]) player.y -= player.speed;
  if (keys["s"] || keys["ArrowDown"]) player.y += player.speed;
  if (keys["a"] || keys["ArrowLeft"]) player.x -= player.speed;
  if (keys["d"] || keys["ArrowRight"]) player.x += player.speed;

  // Dash
  if (keys["Shift"] && dashCooldown <= 0) {
    player.speed = 12;
    dashCooldown = 180;
    setTimeout(() => player.speed = 4, 200);
  }

  if (dashCooldown > 0) dashCooldown--;

  // Spawn Enemies
  if (enemiesToSpawn > 0) {
    spawnTimer--;
    if (spawnTimer <= 0) {
      spawnEnemy();
      enemiesToSpawn--;
      spawnTimer = 30;
    }
  }

  // Update Enemies
  enemies.forEach((e, i) => {
    const angle = Math.atan2(player.y - e.y, player.x - e.x);
    e.x += Math.cos(angle) * e.speed;
    e.y += Math.sin(angle) * e.speed;

    if (Math.hypot(player.x - e.x, player.y - e.y) < e.radius + player.radius) {
      player.health -= 0.3;
      screenShake = 5;
    }

    ctx.beginPath();
    ctx.arc(e.x, e.y, e.radius, 0, Math.PI*2);
    ctx.fillStyle = e.type === "boss" ? "#ff00ff" : "#ff0033";
    ctx.fill();
  });

  // Update Bullets
  bullets.forEach((b, bi) => {
    b.x += b.dx;
    b.y += b.dy;
    b.life--;

    enemies.forEach((e, ei) => {
      if (Math.hypot(b.x - e.x, b.y - e.y) < e.radius) {
        e.health -= 10;
        bullets.splice(bi, 1);
        screenShake = 8;

        if (e.health <= 0) {
          currency += 5;
          score += 10;
          enemies.splice(ei, 1);
        }
      }
    });

    if (b.life <= 0) bullets.splice(bi, 1);

    ctx.beginPath();
    ctx.arc(b.x, b.y, 4, 0, Math.PI*2);
    ctx.fillStyle = "#00ffff";
    ctx.fill();
  });

  // Draw Player
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI*2);
  ctx.fillStyle = "#00ffff";
  ctx.fill();

  // Health Check
  if (player.health <= 0) {
    gameState = STATE.GAME_OVER;
  }

  // Wave Clear
  if (enemies.length === 0 && enemiesToSpawn === 0) {
    wave++;
    nextWave();
  }

  drawUI();

  if (screenShake > 0) ctx.restore();

  requestAnimationFrame(update);
}

// ==========================
// UI
// ==========================

function drawUI() {
  ctx.fillStyle = "white";
  ctx.fillText("Wave: " + wave, 20, 30);
  ctx.fillText("Score: " + score, 20, 50);
  ctx.fillText("Coins: " + currency, 20, 70);
  ctx.fillText("Weapon: " + weaponType, 20, 90);

  ctx.fillStyle = "red";
  ctx.fillRect(canvas.width/2 - 100, 20, 200, 10);
  ctx.fillStyle = "lime";
  ctx.fillRect(canvas.width/2 - 100, 20, (player.health/player.maxHealth) * 200, 10);
}

function drawMenu() {
  ctx.fillStyle = "white";
  ctx.font = "40px Arial";
  ctx.fillText("NEON RIFT", canvas.width/2 - 120, canvas.height/2 - 40);
  ctx.font = "20px Arial";
  ctx.fillText("Press ENTER to Start", canvas.width/2 - 100, canvas.height/2);
}

update();