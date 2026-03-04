// Game Engine for Neon Space Invaders
class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.canvas.width = canvas.offsetWidth;
    this.canvas.height = canvas.offsetHeight;

    // Game state
    this.gameRunning = false;
    this.score = 0;
    this.lives = 3;
    this.wave = 1;
    this.weaponCooldown = 0;
    this.weaponCooldownMax = 20;

    // Player
    this.player = {
      x: this.canvas.width / 2 - 25,
      y: this.canvas.height - 80,
      width: 50,
      height: 40,
      speed: 5,
      color: "#00ffff",
    };

    // Arrays
    this.bullets = [];
    this.enemies = [];
    this.enemyBullets = [];
    this.particles = [];

    // Input
    this.keys = {};

    // Enemy settings
    this.enemySpeed = 1;
    this.enemyDirection = 1;
    this.enemyDropDistance = 30;

    this.setupEventListeners();
    this.createStarField();
  }

  setupEventListeners() {
    document.addEventListener("keydown", (e) => {
      this.keys[e.key] = true;
      if (e.key === " ") {
        e.preventDefault();
        this.shoot();
      }
    });

    document.addEventListener("keyup", (e) => {
      this.keys[e.key] = false;
    });
  }

  createStarField() {
    this.stars = [];
    for (let i = 0; i < 100; i++) {
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 2,
        speed: Math.random() * 0.5 + 0.1,
      });
    }
  }

  createEnemies() {
    this.enemies = [];
    const rows = 4;
    const cols = 8;
    const enemyWidth = 40;
    const enemyHeight = 35;
    const spacing = 60;
    const offsetX = (this.canvas.width - cols * spacing) / 2;
    const offsetY = 60;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        this.enemies.push({
          x: offsetX + col * spacing,
          y: offsetY + row * spacing,
          width: enemyWidth,
          height: enemyHeight,
          alive: true,
          type: row % 3,
        });
      }
    }
  }

  shoot() {
    if (this.weaponCooldown <= 0 && this.gameRunning) {
      this.bullets.push({
        x: this.player.x + this.player.width / 2 - 2,
        y: this.player.y,
        width: 4,
        height: 20,
        speed: 8,
        color: "#ffff00",
      });
      this.weaponCooldown = this.weaponCooldownMax;
    }
  }

  update() {
    if (!this.gameRunning) return;

    // Update cooldown
    if (this.weaponCooldown > 0) {
      this.weaponCooldown--;
    }

    // Update stars
    this.stars.forEach((star) => {
      star.y += star.speed;
      if (star.y > this.canvas.height) {
        star.y = 0;
        star.x = Math.random() * this.canvas.width;
      }
    });

    // Move player
    if (this.keys["ArrowLeft"] && this.player.x > 0) {
      this.player.x -= this.player.speed;
    }
    if (
      this.keys["ArrowRight"] &&
      this.player.x < this.canvas.width - this.player.width
    ) {
      this.player.x += this.player.speed;
    }

    // Update bullets
    this.bullets = this.bullets.filter((bullet) => {
      bullet.y -= bullet.speed;
      return bullet.y > 0;
    });

    // Update enemy bullets
    this.enemyBullets = this.enemyBullets.filter((bullet) => {
      bullet.y += bullet.speed;
      return bullet.y < this.canvas.height;
    });

    // Enemy shooting
    if (Math.random() < 0.01 && this.enemies.length > 0) {
      const aliveEnemies = this.enemies.filter((e) => e.alive);
      if (aliveEnemies.length > 0) {
        const shooter =
          aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
        this.enemyBullets.push({
          x: shooter.x + shooter.width / 2 - 2,
          y: shooter.y + shooter.height,
          width: 4,
          height: 15,
          speed: 4,
          color: "#ff00ff",
        });
      }
    }

    // Update enemies
    let hitEdge = false;
    this.enemies.forEach((enemy) => {
      if (!enemy.alive) return;

      enemy.x += this.enemySpeed * this.enemyDirection;

      if (enemy.x <= 0 || enemy.x >= this.canvas.width - enemy.width) {
        hitEdge = true;
      }
    });

    if (hitEdge) {
      this.enemyDirection *= -1;
      this.enemies.forEach((enemy) => {
        enemy.y += this.enemyDropDistance;
      });
    }

    // Check collisions
    this.checkCollisions();

    // Update particles
    this.particles = this.particles.filter((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      p.alpha -= 0.02;
      return p.life > 0 && p.alpha > 0;
    });

    // Check win condition
    const aliveEnemies = this.enemies.filter((e) => e.alive);
    if (aliveEnemies.length === 0) {
      this.nextWave();
    }

    // Check lose condition
    const enemyReachedBottom = this.enemies.some(
      (e) => e.alive && e.y + e.height >= this.player.y,
    );
    if (enemyReachedBottom) {
      this.gameOver();
    }
  }

  checkCollisions() {
    // Bullet hits enemy
    this.bullets.forEach((bullet, bIndex) => {
      this.enemies.forEach((enemy, eIndex) => {
        if (enemy.alive && this.collision(bullet, enemy)) {
          enemy.alive = false;
          this.bullets.splice(bIndex, 1);
          this.score += 10 * (enemy.type + 1);
          this.createExplosion(
            enemy.x + enemy.width / 2,
            enemy.y + enemy.height / 2,
            "#00ffff",
          );
        }
      });
    });

    // Enemy bullet hits player
    this.enemyBullets.forEach((bullet, index) => {
      if (this.collision(bullet, this.player)) {
        this.enemyBullets.splice(index, 1);
        this.lives--;
        this.createExplosion(
          this.player.x + this.player.width / 2,
          this.player.y + this.player.height / 2,
          "#ff00ff",
        );

        if (this.lives <= 0) {
          this.gameOver();
        }
      }
    });
  }

  collision(rect1, rect2) {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }

  createExplosion(x, y, color) {
    for (let i = 0; i < 20; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        size: Math.random() * 4 + 2,
        color: color,
        life: 30,
        alpha: 1,
      });
    }
  }

  nextWave() {
    this.wave++;
    this.enemySpeed += 0.3;
    this.createEnemies();
  }

  draw() {
    // Clear canvas
    this.ctx.fillStyle = "rgba(5, 5, 16, 0.2)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw stars
    this.ctx.fillStyle = "#ffffff";
    this.stars.forEach((star) => {
      this.ctx.globalAlpha = Math.random() * 0.5 + 0.5;
      this.ctx.fillRect(star.x, star.y, star.size, star.size);
    });
    this.ctx.globalAlpha = 1;

    // Draw player
    this.drawPlayer();

    // Draw bullets
    this.bullets.forEach((bullet) => {
      this.ctx.fillStyle = bullet.color;
      this.ctx.shadowBlur = 20;
      this.ctx.shadowColor = bullet.color;
      this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      this.ctx.shadowBlur = 0;
    });

    // Draw enemy bullets
    this.enemyBullets.forEach((bullet) => {
      this.ctx.fillStyle = bullet.color;
      this.ctx.shadowBlur = 20;
      this.ctx.shadowColor = bullet.color;
      this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      this.ctx.shadowBlur = 0;
    });

    // Draw enemies
    this.enemies.forEach((enemy) => {
      if (enemy.alive) {
        this.drawEnemy(enemy);
      }
    });

    // Draw particles
    this.particles.forEach((p) => {
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(p.x, p.y, p.size, p.size);
    });
    this.ctx.globalAlpha = 1;
  }

  drawPlayer() {
    const p = this.player;
    this.ctx.fillStyle = p.color;
    this.ctx.shadowBlur = 20;
    this.ctx.shadowColor = p.color;

    // Ship body
    this.ctx.beginPath();
    this.ctx.moveTo(p.x + p.width / 2, p.y);
    this.ctx.lineTo(p.x, p.y + p.height);
    this.ctx.lineTo(p.x + p.width, p.y + p.height);
    this.ctx.closePath();
    this.ctx.fill();

    // Cockpit
    this.ctx.fillStyle = "#ffff00";
    this.ctx.fillRect(p.x + p.width / 2 - 5, p.y + 10, 10, 10);

    this.ctx.shadowBlur = 0;
  }

  drawEnemy(enemy) {
    const colors = ["#ff00ff", "#00ffff", "#ffff00"];
    this.ctx.fillStyle = colors[enemy.type];
    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = colors[enemy.type];

    // Enemy body
    this.ctx.fillRect(
      enemy.x + 5,
      enemy.y,
      enemy.width - 10,
      enemy.height - 10,
    );
    this.ctx.fillRect(enemy.x, enemy.y + 10, enemy.width, enemy.height - 20);

    // Eyes
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillRect(enemy.x + 10, enemy.y + 15, 8, 8);
    this.ctx.fillRect(enemy.x + enemy.width - 18, enemy.y + 15, 8, 8);

    this.ctx.shadowBlur = 0;
  }

  start() {
    this.gameRunning = true;
    this.createEnemies();
  }

  gameOver() {
    this.gameRunning = false;
  }

  reset() {
    this.score = 0;
    this.lives = 3;
    this.wave = 1;
    this.enemySpeed = 1;
    this.bullets = [];
    this.enemyBullets = [];
    this.particles = [];
    this.player.x = this.canvas.width / 2 - 25;
    this.weaponCooldown = 0;
    this.createEnemies();
  }
}
