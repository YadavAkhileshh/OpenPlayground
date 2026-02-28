// Power-up System for Neon Dodge
class PowerUp {
  constructor(x, y, type = "health") {
    this.x = x;
    this.y = y;
    this.type = type;
    this.radius = 15;
    this.speed = 100;
    this.collected = false;
    this.pulse = 0;
    this.pulseSpeed = 5;

    // Type-specific properties
    this.setupType();
  }

  setupType() {
    switch (this.type) {
      case "health":
        this.color = "#50fa7b";
        this.value = 25;
        break;
      case "shield":
        this.color = "#00f3ff";
        this.value = 50;
        break;
      case "speed":
        this.color = "#ffb86c";
        this.value = 200; // duration in ms
        break;
      case "multiplier":
        this.color = "#ff79c6";
        this.value = 2; // score multiplier
        break;
    }
  }

  update(deltaTime, canvasWidth, canvasHeight) {
    this.y += this.speed * deltaTime;
    this.pulse += this.pulseSpeed * deltaTime;

    // Remove if off screen
    return this.y > canvasHeight + 50;
  }

  draw(ctx) {
    // Pulsing effect
    const pulseRadius = this.radius + Math.sin(this.pulse) * 3;

    // Outer glow
    ctx.beginPath();
    ctx.arc(this.x, this.y, pulseRadius, 0, Math.PI * 2);
    ctx.fillStyle = this.color + "40";
    ctx.fill();

    // Main circle
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();

    // Inner symbol
    ctx.fillStyle = "#0a0a1a";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    let symbol = "?";
    switch (this.type) {
      case "health":
        symbol = "♥";
        break;
      case "shield":
        symbol = "⛊";
        break;
      case "speed":
        symbol = "⚡";
        break;
      case "multiplier":
        symbol = "×";
        break;
    }

    ctx.fillText(symbol, this.x, this.y);
  }

  checkCollision(player) {
    const dx = this.x - player.x;
    const dy = this.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < this.radius + player.radius;
  }
}

// Add to config.js:
const POWERUP_CONFIG = {
  SPAWN_CHANCE: 0.01, // Chance per frame
  TYPES: ["health", "shield", "speed", "multiplier"],
  DURATIONS: {
    speed: 5, // seconds
    multiplier: 10,
    shield: 8,
  },
};

// Add to GameEngine in script.js:
class GameEngine {
  constructor() {
    // Add to this.entities initialization:
    this.entities.powerups = [];
    this.activePowerups = new Map();
  }

  spawnPowerup(x, y) {
    const type =
      POWERUP_CONFIG.TYPES[
        Math.floor(Math.random() * POWERUP_CONFIG.TYPES.length)
      ];
    this.entities.powerups.push(new PowerUp(x, y, type));
  }

  updatePowerups(deltaTime) {
    // Update existing powerups
    for (let i = this.entities.powerups.length - 1; i >= 0; i--) {
      const powerup = this.entities.powerups[i];
      if (powerup.update(deltaTime, this.canvas.width, this.canvas.height)) {
        this.entities.powerups.splice(i, 1);
      }
    }

    // Update active powerup timers
    for (const [type, timer] of this.activePowerups.entries()) {
      this.activePowerups.set(type, timer - deltaTime);
      if (timer <= 0) {
        this.activePowerups.delete(type);
        this.deactivatePowerup(type);
      }
    }

    // Random spawn
    if (Math.random() < POWERUP_CONFIG.SPAWN_CHANCE * deltaTime * 60) {
      const x = 50 + Math.random() * (this.canvas.width - 100);
      this.spawnPowerup(x, -20);
    }
  }

  checkPowerupCollisions() {
    for (let i = this.entities.powerups.length - 1; i >= 0; i--) {
      const powerup = this.entities.powerups[i];

      if (powerup.checkCollision(this.entities.player)) {
        this.applyPowerup(powerup);
        this.entities.powerups.splice(i, 1);

        // Visual feedback
        for (let j = 0; j < 10; j++) {
          this.entities.particles.push(
            new Particle(
              powerup.x,
              powerup.y,
              Math.random() * 360,
              Math.random() * 4 + 2,
              0.7,
              powerup.color,
              20,
            ),
          );
        }
      }
    }
  }

  applyPowerup(powerup) {
    switch (powerup.type) {
      case "health":
        this.entities.player.health = Math.min(
          100,
          this.entities.player.health + powerup.value,
        );
        break;

      case "shield":
        this.activePowerups.set("shield", POWERUP_CONFIG.DURATIONS.shield);
        this.entities.player.hasShield = true;
        break;

      case "speed":
        this.activePowerups.set("speed", POWERUP_CONFIG.DURATIONS.speed);
        CONFIG.PLAYER.SPEED *= 1.5;
        break;

      case "multiplier":
        this.activePowerups.set(
          "multiplier",
          POWERUP_CONFIG.DURATIONS.multiplier,
        );
        CONFIG.SCORE_MULTIPLIER = powerup.value;
        break;
    }
  }

  deactivatePowerup(type) {
    switch (type) {
      case "shield":
        this.entities.player.hasShield = false;
        break;

      case "speed":
        CONFIG.PLAYER.SPEED = CONFIG.PLAYER.BASE_SPEED;
        break;

      case "multiplier":
        CONFIG.SCORE_MULTIPLIER = 1;
        break;
    }
  }
}
