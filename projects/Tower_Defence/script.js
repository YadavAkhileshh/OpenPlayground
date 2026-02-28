const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let coins = 100;
let lives = 10;

document.getElementById("coins").innerText = coins;
document.getElementById("lives").innerText = lives;

// -------- GAME OBJECTS --------
const enemies = [];
const towers = [];
const bullets = [];

// Path
const pathY = 200;

// -------- ENEMY --------
class Enemy {
  constructor() {
    this.x = 0;
    this.y = pathY;
    this.health = 100;
    this.speed = 1;
  }

  move() {
    this.x += this.speed;
    if (this.x > canvas.width) {
      lives--;
      updateUI();
      return true;
    }
    return false;
  }

  draw() {
    ctx.fillStyle = "red";
    ctx.fillRect(this.x, this.y - 10, 20, 20);
  }
}

// -------- TOWER --------
class Tower {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.range = 100;
    this.cooldown = 0;
  }

  attack() {
    if (this.cooldown > 0) {
      this.cooldown--;
      return;
    }

    for (let enemy of enemies) {
      const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
      if (dist < this.range) {
        bullets.push(new Bullet(this.x, this.y, enemy));
        this.cooldown = 30;
        break;
      }
    }
  }

  draw() {
    ctx.fillStyle = "cyan";
    ctx.beginPath();
    ctx.arc(this.x, this.y, 10, 0, Math.PI * 2);
    ctx.fill();
  }
}

// -------- BULLET --------
class Bullet {
  constructor(x, y, enemy) {
    this.x = x;
    this.y = y;
    this.enemy = enemy;
    this.speed = 4;
  }

  move() {
    const dx = this.enemy.x - this.x;
    const dy = this.enemy.y - this.y;
    const dist = Math.hypot(dx, dy);

    this.x += (dx / dist) * this.speed;
    this.y += (dy / dist) * this.speed;

    if (dist < 5) {
      this.enemy.health -= 20;
      return true;
    }
    return false;
  }

  draw() {
    ctx.fillStyle = "yellow";
    ctx.fillRect(this.x, this.y, 4, 4);
  }
}

// -------- GAME LOOP --------
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Path
  ctx.strokeStyle = "#475569";
  ctx.beginPath();
  ctx.moveTo(0, pathY);
  ctx.lineTo(canvas.width, pathY);
  ctx.stroke();

  // Enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].draw();
    if (enemies[i].move()) enemies.splice(i, 1);
    else if (enemies[i].health <= 0) {
      coins += 20;
      enemies.splice(i, 1);
      updateUI();
    }
  }

  // Towers
  towers.forEach(t => {
    t.draw();
    t.attack();
  });

  // Bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].draw();
    if (bullets[i].move()) bullets.splice(i, 1);
  }

  if (lives <= 0) {
    alert("Game Over!");
    return;
  }

  requestAnimationFrame(update);
}

// -------- SPAWN ENEMIES --------
setInterval(() => {
  enemies.push(new Enemy());
}, 1500);

// -------- PLACE TOWER --------
canvas.addEventListener("click", e => {
  if (coins < 50) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  towers.push(new Tower(x, y));
  coins -= 50;
  updateUI();
});

// -------- UI --------
function updateUI() {
  document.getElementById("coins").innerText = coins;
  document.getElementById("lives").innerText = lives;
}

update();
