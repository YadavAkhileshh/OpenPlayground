/**
 * ENTITIES.JS - Game Entity Classes
 * Contains OOP classes for all game objects and collision detection logic
 */

/**
 * Base Entity Class
 * Parent class for all game entities
 */
class Entity {
  constructor(x, y, size, color) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;
    this.active = true;
  }

  /**
   * Check collision with another entity using circle collision
   */
  checkCollision(other) {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = (this.size + other.size) / 2;
    return distance < minDistance;
  }

  /**
   * Check if entity is out of bounds
   */
  isOutOfBounds(width, height) {
    return (
      this.x < -this.size ||
      this.x > width + this.size ||
      this.y < -this.size ||
      this.y > height + this.size
    );
  }

  /**
   * Basic draw method (to be overridden)
   */
  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Player Class
 * Controlled by user input
 */
class Player extends Entity {
  constructor(x, y) {
    super(x, y, CONFIG.PLAYER.SIZE, CONFIG.PLAYER.COLOR);
    this.speed = CONFIG.PLAYER.SPEED;
    this.vx = 0;
    this.vy = 0;
    this.trail = [];
  }

  /**
   * Update player position based on input
   */
  update(keys, canvasWidth, canvasHeight) {
    // Reset velocity
    this.vx = 0;
    this.vy = 0;

    // Apply movement based on keys
    if (keys.left) this.vx -= this.speed;
    if (keys.right) this.vx += this.speed;
    if (keys.up) this.vy -= this.speed;
    if (keys.down) this.vy += this.speed;

    // Normalize diagonal movement
    if (this.vx !== 0 && this.vy !== 0) {
      this.vx *= Math.SQRT1_2;
      this.vy *= Math.SQRT1_2;
    }

    // Update position
    this.x += this.vx;
    this.y += this.vy;

    // Keep player within bounds
    this.x = Math.max(
      this.size / 2,
      Math.min(canvasWidth - this.size / 2, this.x),
    );
    this.y = Math.max(
      this.size / 2,
      Math.min(canvasHeight - this.size / 2, this.y),
    );

    // Update trail
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > CONFIG.EFFECTS.TRAIL_LENGTH) {
      this.trail.shift();
    }
  }

  /**
   * Draw player with glow effect and trail
   */
  draw(ctx) {
    // Draw trail
    for (let i = 0; i < this.trail.length; i++) {
      const alpha = (i + 1) / this.trail.length;
      ctx.fillStyle = `rgba(0, 255, 255, ${alpha * 0.3})`;
      ctx.beginPath();
      ctx.arc(
        this.trail[i].x,
        this.trail[i].y,
        (this.size / 2) * alpha,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    // Draw glow
    ctx.shadowBlur = CONFIG.EFFECTS.GLOW_INTENSITY;
    ctx.shadowColor = CONFIG.PLAYER.GLOW_COLOR;

    // Draw player body
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw inner core
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size / 4, 0, Math.PI * 2);
    ctx.fill();

    // Reset shadow
    ctx.shadowBlur = 0;
  }

  /**
   * Reset player to starting position
   */
  reset() {
    this.x = CONFIG.PLAYER.START_X;
    this.y = CONFIG.PLAYER.START_Y;
    this.vx = 0;
    this.vy = 0;
    this.trail = [];
  }
}

/**
 * Obstacle Class
 * Falls from top of screen
 */
class Obstacle extends Entity {
  constructor(x, y, size, speed, color) {
    super(x, y, size, color);
    this.speed = speed;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.1;
  }

  /**
   * Update obstacle position
   */
  update() {
    this.y += this.speed;
    this.rotation += this.rotationSpeed;
  }

  /**
   * Draw obstacle with glow and rotation
   */
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    // Draw glow
    ctx.shadowBlur = CONFIG.EFFECTS.GLOW_INTENSITY;
    ctx.shadowColor = this.color;

    // Draw obstacle as rotated square
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);

    // Draw inner square
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.fillRect(-this.size / 4, -this.size / 4, this.size / 2, this.size / 2);

    ctx.shadowBlur = 0;
    ctx.restore();
  }

  /**
   * Static method to create random obstacle
   */
  static createRandom(canvasWidth, difficulty = 1) {
    const size = CONFIG.randomInRange(
      CONFIG.OBSTACLES.MIN_SIZE,
      CONFIG.OBSTACLES.MAX_SIZE,
    );
    const x = Math.random() * canvasWidth;
    const y = -size;
    const baseSpeed = CONFIG.randomInRange(
      CONFIG.OBSTACLES.MIN_SPEED,
      CONFIG.OBSTACLES.MAX_SPEED,
    );
    const speed = baseSpeed * difficulty;
    const color = CONFIG.randomColor(CONFIG.OBSTACLES.COLORS);

    return new Obstacle(x, y, size, speed, color);
  }
}

/**
 * Gold Coin Class
 * Collectible item for bonus points
 */
class Gold extends Entity {
  constructor(x, y) {
    super(x, y, CONFIG.GOLD.SIZE, CONFIG.GOLD.COLOR);
    this.speed = CONFIG.GOLD.SPEED;
    this.pulse = 0;
    this.points = CONFIG.GOLD.POINTS;
  }

  /**
   * Update gold position and animation
   */
  update() {
    this.y += this.speed;
    this.pulse += 0.1;
  }

  /**
   * Draw gold coin with pulsing glow
   */
  draw(ctx) {
    const pulseSize = Math.sin(this.pulse) * 3;

    // Draw outer glow
    ctx.shadowBlur = CONFIG.EFFECTS.GLOW_INTENSITY + pulseSize;
    ctx.shadowColor = CONFIG.GOLD.GLOW_COLOR;

    // Draw coin
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size / 2 + pulseSize, 0, Math.PI * 2);
    ctx.fill();

    // Draw inner shine
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(
      this.x - this.size / 6,
      this.y - this.size / 6,
      this.size / 6,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    ctx.shadowBlur = 0;
  }

  /**
   * Static method to create random gold coin
   */
  static createRandom(canvasWidth) {
    const x = Math.random() * canvasWidth;
    const y = -CONFIG.GOLD.SIZE;
    return new Gold(x, y);
  }
}

/**
 * Particle Class
 * Used for visual effects
 */
class Particle extends Entity {
  constructor(x, y, color, angle, speed) {
    super(x, y, CONFIG.PARTICLES.SIZE, color);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.lifetime = CONFIG.PARTICLES.LIFETIME;
    this.maxLifetime = CONFIG.PARTICLES.LIFETIME;
  }

  /**
   * Update particle position and lifetime
   */
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.lifetime--;
    this.active = this.lifetime > 0;
  }

  /**
   * Draw particle with fading effect
   */
  draw(ctx) {
    const alpha = this.lifetime / this.maxLifetime;
    ctx.fillStyle = this.color
      .replace(")", `, ${alpha})`)
      .replace("rgb", "rgba");
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Static method to create particle explosion
   */
  static createExplosion(x, y, color, count) {
    const particles = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = CONFIG.randomInRange(2, CONFIG.PARTICLES.SPEED);
      particles.push(new Particle(x, y, color, angle, speed));
    }
    return particles;
  }
}

/**
 * Collision Detection Manager
 * Handles all collision logic between entities
 */
class CollisionManager {
  /**
   * Check player collision with obstacles
   */
  static checkPlayerObstacles(player, obstacles) {
    for (const obstacle of obstacles) {
      if (obstacle.active && player.checkCollision(obstacle)) {
        return obstacle;
      }
    }
    return null;
  }

  /**
   * Check player collection of gold
   */
  static checkPlayerGold(player, goldCoins) {
    const collected = [];
    for (const gold of goldCoins) {
      if (gold.active && player.checkCollision(gold)) {
        gold.active = false;
        collected.push(gold);
      }
    }
    return collected;
  }

  /**
   * Remove inactive entities
   */
  static cleanupEntities(entities) {
    return entities.filter((entity) => entity.active);
  }

  /**
   * Remove out of bounds entities
   */
  static removeOutOfBounds(entities, width, height) {
    entities.forEach((entity) => {
      if (entity.isOutOfBounds(width, height)) {
        entity.active = false;
      }
    });
  }
}

// Export classes for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    Entity,
    Player,
    Obstacle,
    Gold,
    Particle,
    CollisionManager,
  };
}
