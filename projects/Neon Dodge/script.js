class GameEngine {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.gameOverScreen = document.getElementById("gameOver");
    this.finalScoreElement = document.getElementById("finalScore");
    this.finalCreditsElement = document.getElementById("finalCredits");

    this.setCanvasSize();
    window.addEventListener("resize", () => this.setCanvasSize());

    this.gameState = "menu"; // menu, playing, paused, gameOver
    this.score = 0;
    this.credits = 0;
    this.wave = 1;
    this.lastTime = 0;
    this.difficulty = "medium";

    this.entities = {
      player: null,
      enemies: [],
      projectiles: [],
      gold: [],
      particles: [],
    };

    this.keys = {};
    this.setupEventListeners();
    this.setupUIListeners();

    this.lastSpawnTime = 0;
    this.lastWaveIncrease = 0;
    this.dashCooldown = 0;
    this.dashActive = false;
    this.dashDirection = { x: 0, y: 0 };
    this.dashTime = 0;

    this.startGameLoop();
  }

  setCanvasSize() {
    const container = this.canvas.parentElement;
    this.canvas.width = container.clientWidth;
    this.canvas.height = container.clientHeight;

    CONFIG.GAME_WIDTH = this.canvas.width;
    CONFIG.GAME_HEIGHT = this.canvas.height;
    CONFIG.PLAYER.START_X = this.canvas.width / 2;
    CONFIG.PLAYER.START_Y = this.canvas.height - 100;
  }

  setupEventListeners() {
    window.addEventListener("keydown", (e) => {
      this.keys[e.key.toLowerCase()] = true;

      if (e.key === "Escape") {
        this.togglePause();
      }

      if (
        e.key === " " &&
        this.gameState === "playing" &&
        this.dashCooldown <= 0
      ) {
        this.activateDash();
      }
    });

    window.addEventListener("keyup", (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });

    // Touch/Mobile support
    this.canvas.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        this.handleTouch(touch.clientX, touch.clientY);
      },
      { passive: false },
    );

    this.canvas.addEventListener(
      "touchmove",
      (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        this.handleTouch(touch.clientX, touch.clientY);
      },
      { passive: false },
    );
  }

  setupUIListeners() {
    document.getElementById("startBtn").addEventListener("click", () => {
      if (this.gameState === "menu" || this.gameState === "gameOver") {
        this.startGame();
      }
    });

    document.getElementById("pauseBtn").addEventListener("click", () => {
      this.togglePause();
    });

    document.getElementById("restartBtn").addEventListener("click", () => {
      this.startGame();
    });

    document.getElementById("difficulty").addEventListener("change", (e) => {
      this.difficulty = e.target.value;
      if (this.gameState === "playing") {
        this.updateDifficulty();
      }
    });
  }

  handleTouch(x, y) {
    const rect = this.canvas.getBoundingClientRect();
    const touchX = x - rect.left;
    const touchY = y - rect.top;

    if (this.entities.player) {
      // Move player towards touch point
      const dx = touchX - this.entities.player.x;
      const dy = touchY - this.entities.player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 5) {
        this.entities.player.x += (dx / distance) * CONFIG.PLAYER.SPEED;
        this.entities.player.y += (dy / distance) * CONFIG.PLAYER.SPEED;
      }
    }
  }

  startGame() {
    this.gameState = "playing";
    this.score = 0;
    this.credits = 0;
    this.wave = 1;

    this.entities = {
      player: new Player(),
      enemies: [],
      projectiles: [],
      gold: [],
      particles: [],
    };

    this.lastSpawnTime = 0;
    this.lastWaveIncrease = 0;
    this.dashCooldown = 0;
    this.dashActive = false;
    this.dashTime = 0;

    this.updateDifficulty();
    this.gameOverScreen.style.display = "none";
    this.updateUI();
  }

  togglePause() {
    if (this.gameState === "playing") {
      this.gameState = "paused";
      document.getElementById("pauseBtn").textContent = "RESUME";
    } else if (this.gameState === "paused") {
      this.gameState = "playing";
      document.getElementById("pauseBtn").textContent = "PAUSE";
    }
  }

  updateDifficulty() {
    const difficultyMultipliers = {
      easy: 0.7,
      medium: 1.0,
      hard: 1.5,
    };

    const multiplier = difficultyMultipliers[this.difficulty];
    CONFIG.ENEMY.SPEED_MULTIPLIER = multiplier;
    CONFIG.ENEMY.SPAWN_RATE_MULTIPLIER = multiplier;
    CONFIG.WAVE.ENEMY_INCREASE_PER_WAVE = Math.floor(2 * multiplier);
  }

  activateDash() {
    if (this.dashCooldown <= 0 && !this.dashActive) {
      this.dashActive = true;
      this.dashTime = CONFIG.PLAYER.DASH_DURATION;
      this.dashCooldown = CONFIG.PLAYER.DASH_COOLDOWN;

      // Calculate dash direction based on current movement
      let dx = 0,
        dy = 0;
      if (this.keys["w"] || this.keys["arrowup"]) dy -= 1;
      if (this.keys["s"] || this.keys["arrowdown"]) dy += 1;
      if (this.keys["a"] || this.keys["arrowleft"]) dx -= 1;
      if (this.keys["d"] || this.keys["arrowright"]) dx += 1;

      // If no direction keys pressed, dash forward
      if (dx === 0 && dy === 0) {
        dy = -1;
      }

      const length = Math.sqrt(dx * dx + dy * dy);
      this.dashDirection = {
        x: dx / length,
        y: dy / length,
      };

      // Create dash particles
      for (let i = 0; i < 20; i++) {
        this.entities.particles.push(
          new Particle(
            this.entities.player.x,
            this.entities.player.y,
            Math.random() * 360,
            Math.random() * 5 + 3,
            0.8,
            `hsl(${Math.random() * 60 + 180}, 100%, 60%)`,
            20,
          ),
        );
      }
    }
  }

  update(deltaTime) {
    if (this.gameState !== "playing") return;

    this.handleInput(deltaTime);
    this.updatePlayer(deltaTime);
    this.updateEnemies(deltaTime);
    this.updateProjectiles(deltaTime);
    this.updateGold(deltaTime);
    this.updateParticles(deltaTime);
    this.spawnEntities(deltaTime);
    this.checkCollisions();
    this.updateWave(deltaTime);
    this.updateCooldowns(deltaTime);

    this.score += Math.floor(deltaTime * 10); // Score increases over time
    this.updateUI();
  }

  handleInput(deltaTime) {
    if (!this.entities.player) return;

    let dx = 0,
      dy = 0;
    const speed = CONFIG.PLAYER.SPEED * deltaTime;

    if (this.keys["w"] || this.keys["arrowup"]) dy -= speed;
    if (this.keys["s"] || this.keys["arrowdown"]) dy += speed;
    if (this.keys["a"] || this.keys["arrowleft"]) dx -= speed;
    if (this.keys["d"] || this.keys["arrowright"]) dx += speed;

    this.entities.player.move(dx, dy, this.canvas.width, this.canvas.height);
  }

  updatePlayer(deltaTime) {
    if (this.dashActive && this.entities.player) {
      this.dashTime -= deltaTime;
      if (this.dashTime > 0) {
        const dashSpeed = CONFIG.PLAYER.DASH_SPEED * deltaTime;
        this.entities.player.x += this.dashDirection.x * dashSpeed;
        this.entities.player.y += this.dashDirection.y * dashSpeed;

        // Keep player in bounds during dash
        this.entities.player.x = Math.max(
          20,
          Math.min(this.canvas.width - 20, this.entities.player.x),
        );
        this.entities.player.y = Math.max(
          20,
          Math.min(this.canvas.height - 20, this.entities.player.y),
        );

        // Create trail particles
        if (Math.random() < 0.3) {
          this.entities.particles.push(
            new Particle(
              this.entities.player.x,
              this.entities.player.y,
              Math.random() * 360,
              Math.random() * 3 + 1,
              0.5,
              "#00f3ff",
              15,
            ),
          );
        }
      } else {
        this.dashActive = false;
      }
    }
  }

  updateEnemies(deltaTime) {
    for (let i = this.entities.enemies.length - 1; i >= 0; i--) {
      const enemy = this.entities.enemies[i];
      enemy.update(deltaTime, this.canvas.width, this.canvas.height);

      // Remove off-screen enemies
      if (enemy.y > this.canvas.height + 50) {
        this.entities.enemies.splice(i, 1);
      }
    }
  }

  updateProjectiles(deltaTime) {
    for (let i = this.entities.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.entities.projectiles[i];
      projectile.update(deltaTime);

      // Remove off-screen projectiles
      if (
        projectile.y < -50 ||
        projectile.y > this.canvas.height + 50 ||
        projectile.x < -50 ||
        projectile.x > this.canvas.width + 50
      ) {
        this.entities.projectiles.splice(i, 1);
      }
    }
  }

  updateGold(deltaTime) {
    for (let i = this.entities.gold.length - 1; i >= 0; i--) {
      const gold = this.entities.gold[i];
      gold.update(deltaTime, this.canvas.width, this.canvas.height);

      // Remove off-screen gold
      if (gold.y > this.canvas.height + 50) {
        this.entities.gold.splice(i, 1);
      }
    }
  }

  updateParticles(deltaTime) {
    for (let i = this.entities.particles.length - 1; i >= 0; i--) {
      const particle = this.entities.particles[i];
      particle.update(deltaTime);

      if (particle.life <= 0) {
        this.entities.particles.splice(i, 1);
      }
    }
  }

  spawnEntities(deltaTime) {
    this.lastSpawnTime += deltaTime;

    const spawnInterval =
      CONFIG.SPAWN_RATES.ENEMY / CONFIG.ENEMY.SPAWN_RATE_MULTIPLIER;
    const goldInterval = CONFIG.SPAWN_RATES.GOLD;

    // Spawn enemies
    if (this.lastSpawnTime >= spawnInterval) {
      const enemyType = Math.random();
      let enemy;

      if (enemyType < 0.3) {
        enemy = new SeekerEnemy();
      } else if (enemyType < 0.6) {
        enemy = new ShooterEnemy();
      } else {
        enemy = new BasicEnemy();
      }

      this.entities.enemies.push(enemy);
      this.lastSpawnTime = 0;
    }

    // Spawn gold occasionally
    if (Math.random() < deltaTime * CONFIG.SPAWN_RATES.GOLD_CHANCE) {
      this.entities.gold.push(new Gold());
    }
  }

  updateWave(deltaTime) {
    this.lastWaveIncrease += deltaTime;

    if (this.lastWaveIncrease >= CONFIG.WAVE.DURATION) {
      this.wave++;
      this.lastWaveIncrease = 0;

      // Increase difficulty
      CONFIG.ENEMY.SPEED_MULTIPLIER *= CONFIG.WAVE.SPEED_INCREASE_PER_WAVE;
      CONFIG.ENEMY.SPAWN_RATE_MULTIPLIER *=
        CONFIG.WAVE.SPAWN_RATE_INCREASE_PER_WAVE;

      // Spawn wave announcement particles
      for (let i = 0; i < 50; i++) {
        this.entities.particles.push(
          new Particle(
            this.canvas.width / 2,
            this.canvas.height / 2,
            Math.random() * 360,
            Math.random() * 8 + 2,
            1.5,
            `hsl(${Math.random() * 60 + 300}, 100%, 60%)`,
            30,
          ),
        );
      }
    }
  }

  updateCooldowns(deltaTime) {
    if (this.dashCooldown > 0) {
      this.dashCooldown -= deltaTime;
    }
  }

  checkCollisions() {
    if (!this.entities.player) return;

    // Player vs Enemies
    for (let i = this.entities.enemies.length - 1; i >= 0; i--) {
      const enemy = this.entities.enemies[i];

      if (this.entities.player.checkCollision(enemy)) {
        this.entities.enemies.splice(i, 1);

        if (!this.dashActive) {
          // Only take damage if not dashing
          this.entities.player.health -= CONFIG.ENEMY.DAMAGE;

          // Create hit particles
          for (let j = 0; j < 10; j++) {
            this.entities.particles.push(
              new Particle(
                this.entities.player.x,
                this.entities.player.y,
                Math.random() * 360,
                Math.random() * 4 + 2,
                0.5,
                "#ff5555",
                15,
              ),
            );
          }

          if (this.entities.player.health <= 0) {
            this.gameOver();
            return;
          }
        }
      }
    }

    // Player vs Gold
    for (let i = this.entities.gold.length - 1; i >= 0; i--) {
      const gold = this.entities.gold[i];

      if (this.entities.player.checkCollision(gold)) {
        this.credits += gold.value;
        this.entities.gold.splice(i, 1);

        // Create collection particles
        for (let j = 0; j < 8; j++) {
          this.entities.particles.push(
            new Particle(
              this.entities.player.x,
              this.entities.player.y,
              Math.random() * 360,
              Math.random() * 3 + 1,
              0.8,
              "#ffb86c",
              20,
            ),
          );
        }
      }
    }

    // Projectiles vs Enemies
    for (let i = this.entities.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.entities.projectiles[i];

      for (let j = this.entities.enemies.length - 1; j >= 0; j--) {
        const enemy = this.entities.enemies[j];

        if (projectile.checkCollision(enemy)) {
          this.entities.projectiles.splice(i, 1);
          this.entities.enemies.splice(j, 1);
          this.score += 100; // Bonus for shooting enemies

          // Create explosion particles
          for (let k = 0; k < 15; k++) {
            this.entities.particles.push(
              new Particle(
                enemy.x,
                enemy.y,
                Math.random() * 360,
                Math.random() * 6 + 2,
                0.7,
                "#ff79c6",
                25,
              ),
            );
          }
          break;
        }
      }
    }
  }

  gameOver() {
    this.gameState = "gameOver";
    this.finalScoreElement.textContent = `SCORE: ${this.score}`;
    this.finalCreditsElement.textContent = `CREDITS: ${this.credits}`;
    this.gameOverScreen.style.display = "flex";
  }

  updateUI() {
    document.getElementById("score").textContent = this.score;
    document.getElementById("credits").textContent = this.credits;
    document.getElementById("health").textContent = Math.max(
      0,
      this.entities.player?.health || 0,
    );
    document.getElementById("wave").textContent = this.wave;
  }

  render() {
    // Clear canvas with gradient
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, "#0f0f23");
    gradient.addColorStop(1, "#1a1a2e");
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid
    this.drawGrid();

    // Draw all entities
    this.entities.gold.forEach((gold) => gold.draw(this.ctx));
    this.entities.enemies.forEach((enemy) => enemy.draw(this.ctx));
    this.entities.projectiles.forEach((projectile) =>
      projectile.draw(this.ctx),
    );
    this.entities.particles.forEach((particle) => particle.draw(this.ctx));

    if (this.entities.player) {
      this.entities.player.draw(this.ctx);

      // Draw dash cooldown indicator
      if (this.dashCooldown > 0) {
        const radius = 25;
        const centerX = 30;
        const centerY = this.canvas.height - 30;

        // Background circle
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = "rgba(0, 243, 255, 0.3)";
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        // Cooldown arc
        const progress = 1 - this.dashCooldown / CONFIG.PLAYER.DASH_COOLDOWN;
        this.ctx.beginPath();
        this.ctx.arc(
          centerX,
          centerY,
          radius,
          -Math.PI / 2,
          -Math.PI / 2 + Math.PI * 2 * progress,
        );
        this.ctx.strokeStyle = "#00f3ff";
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        // Dash icon
        this.ctx.fillStyle = "#00f3ff";
        this.ctx.font = "bold 16px Orbitron";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText("DASH", centerX, centerY);
      }
    }

    // Draw wave indicator
    this.ctx.fillStyle = "rgba(0, 243, 255, 0.1)";
    this.ctx.font = "bold 20px Orbitron";
    this.ctx.textAlign = "center";
    this.ctx.fillText(`WAVE ${this.wave}`, this.canvas.width / 2, 30);

    // Draw pause overlay
    if (this.gameState === "paused") {
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.fillStyle = "#00f3ff";
      this.ctx.font = "bold 48px Orbitron";
      this.ctx.textAlign = "center";
      this.ctx.fillText(
        "PAUSED",
        this.canvas.width / 2,
        this.canvas.height / 2,
      );
    }
  }

  drawGrid() {
    this.ctx.strokeStyle = "rgba(0, 243, 255, 0.05)";
    this.ctx.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x < this.canvas.width; x += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y < this.canvas.height; y += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
  }

  gameLoop(currentTime) {
    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1); // Cap delta time
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.render();

    requestAnimationFrame((time) => this.gameLoop(time));
  }

  startGameLoop() {
    this.lastTime = performance.now();
    requestAnimationFrame((time) => this.gameLoop(time));
  }
}

// Initialize game when DOM is loaded
window.addEventListener("DOMContentLoaded", () => {
  const game = new GameEngine();
});
