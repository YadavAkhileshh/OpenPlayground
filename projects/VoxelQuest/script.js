"use strict";

/**
 * VOXELQUEST - PROFESSIONAL EDITION
 * ===================================
 * Complete 3D FPS with advanced features:
 * - Procedural texture generation
 * - Enemy AI with pathfinding
 * - Particle system
 * - Audio system
 * - Level progression
 * - Pickup system
 * - Professional UI/UX
 */

// ============== CONFIGURATION ==============
const CONFIG = {
  // Rendering
  RES_W: 960,
  RES_H: 540,
  TEX_SIZE: 64,
  FOV: 0.66,

  // World
  MAP_SIZE: 24,

  // Player
  MOVE_SPEED: 0.08,
  SPRINT_MULTIPLIER: 1.5,
  ROT_SPEED: 0.003,
  MAX_HEALTH: 100,

  // Weapons
  MAX_AMMO: 30,
  RESERVE_AMMO: 90,
  FIRE_RATE: 150,
  RELOAD_TIME: 1200,
  PROJECTILE_SPEED: 0.6,
  PROJECTILE_DAMAGE: 25,

  // Enemies
  ENEMY_SPEED: 0.025,
  ENEMY_HEALTH: 60,
  ENEMY_DAMAGE: 12,
  ENEMY_ATTACK_RANGE: 1.8,
  ENEMY_ATTACK_COOLDOWN: 1200,
  ENEMY_SIGHT_RANGE: 12,

  // Pickups
  PICKUP_RANGE: 0.8,
  HEALTH_RESTORE: 35,
  AMMO_RESTORE: 25,

  // Scoring
  KILL_POINTS: 100,
  LEVEL_BONUS_MULTIPLIER: 500,

  // Quality
  QUALITY: "high", // 'low', 'medium', 'high'
};

// ============== UTILITIES ==============
class Vec2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  add(v) {
    return new Vec2(this.x + v.x, this.y + v.y);
  }

  sub(v) {
    return new Vec2(this.x - v.x, this.y - v.y);
  }

  mul(s) {
    return new Vec2(this.x * s, this.y * s);
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize() {
    const len = this.length();
    return len > 0 ? new Vec2(this.x / len, this.y / len) : new Vec2(0, 0);
  }

  distance(v) {
    return Math.sqrt((this.x - v.x) ** 2 + (this.y - v.y) ** 2);
  }

  rotate(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Vec2(this.x * cos - this.y * sin, this.x * sin + this.y * cos);
  }

  clone() {
    return new Vec2(this.x, this.y);
  }
}

// ============== AUDIO SYSTEM ==============
class AudioSystem {
  constructor() {
    this.context = null;
    this.enabled = false;
    this.masterGain = null;
    this.init();
  }

  init() {
    try {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.context.createGain();
      this.masterGain.connect(this.context.destination);
      this.masterGain.gain.value = 0.3;
      this.enabled = true;
    } catch (e) {
      console.warn("Audio not available");
    }
  }

  playShoot() {
    if (!this.enabled) return;

    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    const filter = this.context.createBiquadFilter();

    osc.type = "square";
    osc.frequency.setValueAtTime(400, this.context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      50,
      this.context.currentTime + 0.08
    );

    filter.type = "lowpass";
    filter.frequency.value = 1200;

    gain.gain.setValueAtTime(0.4, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.01,
      this.context.currentTime + 0.08
    );

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.context.currentTime + 0.08);
  }

  playHit() {
    if (!this.enabled) return;

    const noise = this.context.createBufferSource();
    const buffer = this.context.createBuffer(
      1,
      this.context.sampleRate * 0.15,
      this.context.sampleRate
    );
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    noise.buffer = buffer;

    const filter = this.context.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 300;

    const gain = this.context.createGain();
    gain.gain.setValueAtTime(0.3, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.01,
      this.context.currentTime + 0.15
    );

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
    noise.stop(this.context.currentTime + 0.15);
  }

  playDamage() {
    if (!this.enabled) return;

    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(180, this.context.currentTime);
    osc.frequency.linearRampToValueAtTime(160, this.context.currentTime + 0.25);

    gain.gain.setValueAtTime(0.5, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.01,
      this.context.currentTime + 0.25
    );

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.context.currentTime + 0.25);
  }

  playPickup() {
    if (!this.enabled) return;

    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.frequency.setValueAtTime(600, this.context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      1200,
      this.context.currentTime + 0.1
    );

    gain.gain.setValueAtTime(0.3, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.01,
      this.context.currentTime + 0.1
    );

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.context.currentTime + 0.1);
  }

  playDeath() {
    if (!this.enabled) return;

    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(220, this.context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      55,
      this.context.currentTime + 0.4
    );

    gain.gain.setValueAtTime(0.4, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.01,
      this.context.currentTime + 0.4
    );

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.context.currentTime + 0.4);
  }
}

// ============== PARTICLE SYSTEM ==============
class Particle {
  constructor(x, y, z, vx, vy, vz, color, life, size = 0.08) {
    this.pos = new Vec2(x, y);
    this.z = z;
    this.vel = new Vec2(vx, vy);
    this.vz = vz;
    this.color = color;
    this.life = life;
    this.maxLife = life;
    this.size = size;
    this.gravity = 0.0003;
  }

  update(dt) {
    this.pos = this.pos.add(this.vel.mul(dt * 0.001));
    this.z += this.vz * dt * 0.001;
    this.vz -= this.gravity * dt;
    this.life -= dt;
    return this.life > 0 && this.z > 0;
  }
}

class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  emit(x, y, z, count, color, spread = 1) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 2 + 1) * spread;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const vz = Math.random() * 2 + 1;

      this.particles.push(
        new Particle(
          x,
          y,
          z,
          vx,
          vy,
          vz,
          color,
          400 + Math.random() * 300,
          0.05 + Math.random() * 0.1
        )
      );
    }
  }

  update(dt) {
    this.particles = this.particles.filter((p) => p.update(dt));
  }

  clear() {
    this.particles = [];
  }
}

// ============== TEXTURE GENERATOR ==============
class TextureGenerator {
  constructor() {
    this.textures = [];
    this.generate();
  }

  generate() {
    const generators = [
      this.genStoneWall.bind(this),
      this.genTechWall.bind(this),
      this.genMetalWall.bind(this),
      this.genBrickWall.bind(this),
      this.genConcrete.bind(this),
      this.genFloor.bind(this),
      this.genEnemy.bind(this),
      this.genPickup.bind(this),
      this.genProjectile.bind(this),
    ];

    generators.forEach((gen) => {
      const canvas = document.createElement("canvas");
      canvas.width = CONFIG.TEX_SIZE;
      canvas.height = CONFIG.TEX_SIZE;
      const ctx = canvas.getContext("2d");
      const imgData = ctx.createImageData(CONFIG.TEX_SIZE, CONFIG.TEX_SIZE);
      gen(imgData.data);
      ctx.putImageData(imgData, 0, 0);
      this.textures.push(imgData);
    });
  }

  genStoneWall(data) {
    for (let i = 0; i < data.length; i += 4) {
      const x = (i / 4) % CONFIG.TEX_SIZE;
      const y = Math.floor(i / 4 / CONFIG.TEX_SIZE);

      const noise = Math.random() * 40 - 20;
      const base = 80 + noise;

      data[i] = base;
      data[i + 1] = base;
      data[i + 2] = base + 10;
      data[i + 3] = 255;
    }
  }

  genTechWall(data) {
    for (let i = 0; i < data.length; i += 4) {
      const x = (i / 4) % CONFIG.TEX_SIZE;
      const y = Math.floor(i / 4 / CONFIG.TEX_SIZE);

      const isGrid = x % 8 === 0 || y % 8 === 0;
      const base = isGrid ? 0 : 100;

      data[i] = 0;
      data[i + 1] = base + ((x ^ y) % 50);
      data[i + 2] = base + 50;
      data[i + 3] = 255;
    }
  }

  genMetalWall(data) {
    for (let i = 0; i < data.length; i += 4) {
      const x = (i / 4) % CONFIG.TEX_SIZE;
      const y = Math.floor(i / 4 / CONFIG.TEX_SIZE);

      const panel = Math.floor(y / 16);
      const isRivet = x % 16 === 8 && y % 16 === 8;
      const base = 120 + panel * 10 + Math.random() * 20;

      data[i] = isRivet ? 60 : base;
      data[i + 1] = isRivet ? 60 : base;
      data[i + 2] = isRivet ? 60 : base + 20;
      data[i + 3] = 255;
    }
  }

  genBrickWall(data) {
    for (let i = 0; i < data.length; i += 4) {
      const x = (i / 4) % CONFIG.TEX_SIZE;
      const y = Math.floor(i / 4 / CONFIG.TEX_SIZE);

      const brickY = Math.floor(y / 8);
      const offset = (brickY % 2) * 16;
      const isMortar = (x + offset) % 32 < 2 || y % 8 < 1;

      data[i] = isMortar ? 60 : 140 + Math.random() * 30;
      data[i + 1] = isMortar ? 55 : 70 + Math.random() * 20;
      data[i + 2] = isMortar ? 50 : 50 + Math.random() * 15;
      data[i + 3] = 255;
    }
  }

  genConcrete(data) {
    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 30 - 15;
      const base = 70 + noise;

      data[i] = base;
      data[i + 1] = base;
      data[i + 2] = base + 5;
      data[i + 3] = 255;
    }
  }

  genFloor(data) {
    for (let i = 0; i < data.length; i += 4) {
      const x = (i / 4) % CONFIG.TEX_SIZE;
      const y = Math.floor(i / 4 / CONFIG.TEX_SIZE);

      const isTile = (Math.floor(x / 16) + Math.floor(y / 16)) % 2 === 0;
      const base = isTile ? 25 : 35;

      data[i] = base;
      data[i + 1] = base;
      data[i + 2] = base;
      data[i + 3] = 255;
    }
  }

  genEnemy(data) {
    const cx = CONFIG.TEX_SIZE / 2;
    const cy = CONFIG.TEX_SIZE / 2;

    for (let i = 0; i < data.length; i += 4) {
      const x = (i / 4) % CONFIG.TEX_SIZE;
      const y = Math.floor(i / 4 / CONFIG.TEX_SIZE);
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 22) {
        data[i] = 255;
        data[i + 1] = 0;
        data[i + 2] = dist < 18 ? 100 : 0;
        data[i + 3] = 255;
      } else if (dist < 26) {
        data[i] = 180;
        data[i + 1] = 0;
        data[i + 2] = 0;
        data[i + 3] = 255;
      } else {
        data[i + 3] = 0;
      }
    }
  }

  genPickup(data) {
    const cx = CONFIG.TEX_SIZE / 2;
    const cy = CONFIG.TEX_SIZE / 2;

    for (let i = 0; i < data.length; i += 4) {
      const x = (i / 4) % CONFIG.TEX_SIZE;
      const y = Math.floor(i / 4 / CONFIG.TEX_SIZE);
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 18) {
        data[i] = 0;
        data[i + 1] = 255;
        data[i + 2] = dist < 14 ? 200 : 100;
        data[i + 3] = 255;
      } else if (dist < 22 && dist > 12) {
        data[i] = 0;
        data[i + 1] = 200;
        data[i + 2] = 50;
        data[i + 3] = 255;
      } else {
        data[i + 3] = 0;
      }
    }
  }

  genProjectile(data) {
    const cx = CONFIG.TEX_SIZE / 2;
    const cy = CONFIG.TEX_SIZE / 2;

    for (let i = 0; i < data.length; i += 4) {
      const x = (i / 4) % CONFIG.TEX_SIZE;
      const y = Math.floor(i / 4 / CONFIG.TEX_SIZE);
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 12) {
        const glow = 1 - dist / 12;
        data[i] = 0;
        data[i + 1] = 255 * glow;
        data[i + 2] = 200 * glow;
        data[i + 3] = 255;
      } else {
        data[i + 3] = 0;
      }
    }
  }
}

// ============== INPUT HANDLER ==============
class InputHandler {
  constructor() {
    this.keys = new Set();
    this.mouseX = 0;
    this.mouseY = 0;
    this.mouseDown = false;
    this.locked = false;

    this.setupListeners();
  }

  setupListeners() {
    document.addEventListener("keydown", (e) => {
      this.keys.add(e.code);

      if (e.code === "Escape" && game?.state === "playing") {
        game.pause();
        e.preventDefault();
      }
    });

    document.addEventListener("keyup", (e) => {
      this.keys.delete(e.code);
    });

    document.addEventListener("mousemove", (e) => {
      if (this.locked) {
        this.mouseX += e.movementX;
        this.mouseY += e.movementY;
      }
    });

    document.addEventListener("mousedown", (e) => {
      this.mouseDown = true;

      if (!this.locked && game?.state === "playing") {
        document.body.requestPointerLock();
      }
    });

    document.addEventListener("mouseup", () => {
      this.mouseDown = false;
    });

    document.addEventListener("pointerlockchange", () => {
      this.locked = document.pointerLockElement === document.body;
    });
  }

  isPressed(code) {
    return this.keys.has(code);
  }

  consumeMouse() {
    const mx = this.mouseX;
    const my = this.mouseY;
    this.mouseX = 0;
    this.mouseY = 0;
    return { x: mx, y: my };
  }

  reset() {
    this.keys.clear();
    this.mouseX = 0;
    this.mouseY = 0;
    this.mouseDown = false;
  }
}

// ============== ENTITIES ==============
class Entity {
  constructor(x, y, texIndex) {
    this.pos = new Vec2(x, y);
    this.texIndex = texIndex;
    this.active = true;
    this.height = 0.6;
  }
}

class Enemy extends Entity {
  constructor(x, y) {
    super(x, y, 6);
    this.health = CONFIG.ENEMY_HEALTH;
    this.maxHealth = CONFIG.ENEMY_HEALTH;
    this.lastAttackTime = 0;
    this.state = "idle";
    this.moveTarget = null;
  }

  update(player, worldMap, dt) {
    if (!this.active) return;

    const dist = this.pos.distance(player.pos);

    if (dist < CONFIG.ENEMY_SIGHT_RANGE) {
      this.state = "chase";

      // Move toward player
      const dir = player.pos.sub(this.pos).normalize();
      const moveX = dir.x * CONFIG.ENEMY_SPEED;
      const moveY = dir.y * CONFIG.ENEMY_SPEED;

      // Collision check
      const newX = this.pos.x + moveX;
      const newY = this.pos.y + moveY;

      if (
        worldMap[Math.floor(newX)] &&
        worldMap[Math.floor(newX)][Math.floor(this.pos.y)] === 0
      ) {
        this.pos.x = newX;
      }
      if (
        worldMap[Math.floor(this.pos.x)] &&
        worldMap[Math.floor(this.pos.x)][Math.floor(newY)] === 0
      ) {
        this.pos.y = newY;
      }

      // Attack if in range
      if (dist < CONFIG.ENEMY_ATTACK_RANGE) {
        const now = Date.now();
        if (now - this.lastAttackTime > CONFIG.ENEMY_ATTACK_COOLDOWN) {
          this.attack(player);
          this.lastAttackTime = now;
        }
      }
    }
  }

  attack(player) {
    game.damagePlayer(CONFIG.ENEMY_DAMAGE);
  }

  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      this.die();
    }
  }

  die() {
    this.active = false;
    game.particles.emit(this.pos.x, this.pos.y, 0.5, 25, [255, 0, 0]);
    game.audio.playDeath();
    game.addScore(CONFIG.KILL_POINTS);
    game.addKill();
    game.checkLevelComplete();
  }
}

class Projectile extends Entity {
  constructor(x, y, dirX, dirY) {
    super(x, y, 8);
    this.dir = new Vec2(dirX, dirY);
    this.speed = CONFIG.PROJECTILE_SPEED;
    this.lifetime = 3000;
    this.createdAt = Date.now();
    this.height = 0.3;
  }

  update(worldMap, enemies, dt) {
    if (!this.active) return;

    const move = this.dir.mul(this.speed * dt * 0.001);
    this.pos = this.pos.add(move);

    // Wall collision
    if (
      worldMap[Math.floor(this.pos.x)] &&
      worldMap[Math.floor(this.pos.x)][Math.floor(this.pos.y)] > 0
    ) {
      this.active = false;
      game.particles.emit(this.pos.x, this.pos.y, 0.5, 12, [0, 255, 200]);
      return;
    }

    // Enemy collision
    for (const enemy of enemies) {
      if (!enemy.active) continue;

      if (this.pos.distance(enemy.pos) < 0.4) {
        enemy.takeDamage(CONFIG.PROJECTILE_DAMAGE);
        this.active = false;
        game.particles.emit(this.pos.x, this.pos.y, 0.5, 20, [255, 100, 0]);
        game.audio.playHit();

        // Hitmarker
        const crosshair = document.getElementById("crosshair");
        crosshair.classList.add("hit");
        setTimeout(() => crosshair.classList.remove("hit"), 200);

        return;
      }
    }

    // Lifetime check
    if (Date.now() - this.createdAt > this.lifetime) {
      this.active = false;
    }
  }
}

class Pickup extends Entity {
  constructor(x, y, type) {
    super(x, y, 7);
    this.type = type;
    this.bobOffset = Math.random() * Math.PI * 2;
    this.bobSpeed = 0.002;
  }

  update(player, dt) {
    if (!this.active) return;

    this.bobOffset += this.bobSpeed * dt;

    if (this.pos.distance(player.pos) < CONFIG.PICKUP_RANGE) {
      this.collect();
    }
  }

  collect() {
    this.active = false;

    if (this.type === "health") {
      game.player.health = Math.min(
        CONFIG.MAX_HEALTH,
        game.player.health + CONFIG.HEALTH_RESTORE
      );
      game.showNotification(`+${CONFIG.HEALTH_RESTORE} HEALTH`);
    } else if (this.type === "ammo") {
      game.player.reserveAmmo = Math.min(
        CONFIG.RESERVE_AMMO,
        game.player.reserveAmmo + CONFIG.AMMO_RESTORE
      );
      game.showNotification(`+${CONFIG.AMMO_RESTORE} AMMO`);
    }

    game.audio.playPickup();
    game.particles.emit(this.pos.x, this.pos.y, 0.5, 15, [0, 255, 136]);
  }
}

// ============== RENDERER ==============
class Renderer {
  constructor(canvas, textures) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false });
    this.textures = textures;
    this.width = canvas.width;
    this.height = canvas.height;
    this.zBuffer = new Float32Array(this.width);
    this.buffer = this.ctx.createImageData(this.width, this.height);
  }

  render(player, entities, particles, worldMap) {
    const data = this.buffer.data;

    // Clear
    this.zBuffer.fill(Infinity);

    // Render pipeline
    this.renderFloorCeiling(player, data);
    this.renderWalls(player, worldMap, data);
    this.renderSprites(player, entities, data);
    this.renderParticles(player, particles, data);

    this.ctx.putImageData(this.buffer, 0, 0);
  }

  renderFloorCeiling(player, data) {
    for (let y = Math.floor(this.height / 2); y < this.height; y++) {
      const rayDirX0 = player.dir.x - player.plane.x;
      const rayDirY0 = player.dir.y - player.plane.y;
      const rayDirX1 = player.dir.x + player.plane.x;
      const rayDirY1 = player.dir.y + player.plane.y;

      const p = y - this.height / 2;
      const posZ = 0.5 * this.height;
      const rowDistance = posZ / p;

      const floorStepX = (rowDistance * (rayDirX1 - rayDirX0)) / this.width;
      const floorStepY = (rowDistance * (rayDirY1 - rayDirY0)) / this.width;

      let floorX = player.pos.x + rowDistance * rayDirX0;
      let floorY = player.pos.y + rowDistance * rayDirY0;

      for (let x = 0; x < this.width; x++) {
        const tx =
          Math.floor(CONFIG.TEX_SIZE * (floorX - Math.floor(floorX))) &
          (CONFIG.TEX_SIZE - 1);
        const ty =
          Math.floor(CONFIG.TEX_SIZE * (floorY - Math.floor(floorY))) &
          (CONFIG.TEX_SIZE - 1);

        floorX += floorStepX;
        floorY += floorStepY;

        const tex = this.textures.textures[5];
        const pixIdx = (ty * CONFIG.TEX_SIZE + tx) * 4;
        const buffIdx = (y * this.width + x) * 4;

        // Floor
        data[buffIdx] = tex.data[pixIdx] >> 1;
        data[buffIdx + 1] = tex.data[pixIdx + 1] >> 1;
        data[buffIdx + 2] = tex.data[pixIdx + 2] >> 1;
        data[buffIdx + 3] = 255;

        // Ceiling
        const ceilIdx = ((this.height - y - 1) * this.width + x) * 4;
        data[ceilIdx] = 10;
        data[ceilIdx + 1] = 10;
        data[ceilIdx + 2] = 20;
        data[ceilIdx + 3] = 255;
      }
    }
  }

  renderWalls(player, worldMap, data) {
    for (let x = 0; x < this.width; x++) {
      const cameraX = (2 * x) / this.width - 1;
      const rayDirX = player.dir.x + player.plane.x * cameraX;
      const rayDirY = player.dir.y + player.plane.y * cameraX;

      let mapX = Math.floor(player.pos.x);
      let mapY = Math.floor(player.pos.y);

      const deltaDistX = Math.abs(1 / rayDirX);
      const deltaDistY = Math.abs(1 / rayDirY);

      let stepX, stepY, sideDistX, sideDistY;

      if (rayDirX < 0) {
        stepX = -1;
        sideDistX = (player.pos.x - mapX) * deltaDistX;
      } else {
        stepX = 1;
        sideDistX = (mapX + 1 - player.pos.x) * deltaDistX;
      }

      if (rayDirY < 0) {
        stepY = -1;
        sideDistY = (player.pos.y - mapY) * deltaDistY;
      } else {
        stepY = 1;
        sideDistY = (mapY + 1 - player.pos.y) * deltaDistY;
      }

      let hit = 0,
        side = 0;

      while (hit === 0) {
        if (sideDistX < sideDistY) {
          sideDistX += deltaDistX;
          mapX += stepX;
          side = 0;
        } else {
          sideDistY += deltaDistY;
          mapY += stepY;
          side = 1;
        }

        if (
          mapX < 0 ||
          mapX >= CONFIG.MAP_SIZE ||
          mapY < 0 ||
          mapY >= CONFIG.MAP_SIZE ||
          worldMap[mapX][mapY] > 0
        ) {
          hit = 1;
        }
      }

      const perpWallDist =
        side === 0 ? sideDistX - deltaDistX : sideDistY - deltaDistY;

      this.zBuffer[x] = perpWallDist;

      const lineHeight = Math.floor(this.height / perpWallDist);
      let drawStart = Math.max(0, -lineHeight / 2 + this.height / 2);
      let drawEnd = Math.min(this.height - 1, lineHeight / 2 + this.height / 2);

      const texNum = Math.max(0, Math.min(5, worldMap[mapX][mapY] - 1));

      let wallX =
        side === 0
          ? player.pos.y + perpWallDist * rayDirY
          : player.pos.x + perpWallDist * rayDirX;
      wallX -= Math.floor(wallX);

      let texX = Math.floor(wallX * CONFIG.TEX_SIZE);
      if ((side === 0 && rayDirX > 0) || (side === 1 && rayDirY < 0)) {
        texX = CONFIG.TEX_SIZE - texX - 1;
      }

      const step = CONFIG.TEX_SIZE / lineHeight;
      let texPos = (drawStart - this.height / 2 + lineHeight / 2) * step;

      for (let y = drawStart; y < drawEnd; y++) {
        const texY = Math.floor(texPos) & (CONFIG.TEX_SIZE - 1);
        texPos += step;

        const tex = this.textures.textures[texNum];
        const pixIdx = (texY * CONFIG.TEX_SIZE + texX) * 4;
        const buffIdx = (y * this.width + x) * 4;

        let r = tex.data[pixIdx];
        let g = tex.data[pixIdx + 1];
        let b = tex.data[pixIdx + 2];

        // Shading
        if (side === 1) {
          r = (r * 0.75) | 0;
          g = (g * 0.75) | 0;
          b = (b * 0.75) | 0;
        }

        // Distance fog
        const fog = Math.max(0, 1 - perpWallDist / 20);
        r = (r * fog) | 0;
        g = (g * fog) | 0;
        b = (b * fog) | 0;

        data[buffIdx] = r;
        data[buffIdx + 1] = g;
        data[buffIdx + 2] = b;
        data[buffIdx + 3] = 255;
      }
    }
  }

  renderSprites(player, entities, data) {
    const sorted = entities
      .filter((e) => e.active)
      .sort((a, b) => b.pos.distance(player.pos) - a.pos.distance(player.pos));

    for (const ent of sorted) {
      const sprite = ent.pos.sub(player.pos);

      const invDet =
        1.0 / (player.plane.x * player.dir.y - player.dir.x * player.plane.y);
      const transformX =
        invDet * (player.dir.y * sprite.x - player.dir.x * sprite.y);
      const transformY =
        invDet * (-player.plane.y * sprite.x + player.plane.x * sprite.y);

      if (transformY <= 0.1) continue;

      const spriteScreenX = Math.floor(
        (this.width / 2) * (1 + transformX / transformY)
      );
      const spriteHeight = Math.abs(Math.floor(this.height / transformY));

      // Bob effect for pickups
      let yOffset = 0;
      if (ent instanceof Pickup) {
        yOffset = Math.sin(ent.bobOffset) * 15;
      }

      let drawStartY = Math.max(
        0,
        -spriteHeight / 2 + this.height / 2 + yOffset
      );
      let drawEndY = Math.min(
        this.height - 1,
        spriteHeight / 2 + this.height / 2 + yOffset
      );

      const spriteWidth = Math.abs(Math.floor(this.height / transformY));
      const drawStartX = Math.max(0, -spriteWidth / 2 + spriteScreenX);
      const drawEndX = Math.min(
        this.width - 1,
        spriteWidth / 2 + spriteScreenX
      );

      for (let stripe = drawStartX; stripe < drawEndX; stripe++) {
        const texX = Math.floor(
          ((stripe - (-spriteWidth / 2 + spriteScreenX)) * CONFIG.TEX_SIZE) /
            spriteWidth
        );

        if (transformY < this.zBuffer[stripe]) {
          for (let y = drawStartY; y < drawEndY; y++) {
            const d =
              (y - yOffset) * 256 - this.height * 128 + spriteHeight * 128;
            const texY = Math.floor((d * CONFIG.TEX_SIZE) / spriteHeight / 256);

            const tex = this.textures.textures[ent.texIndex];
            const pixIdx =
              ((texY & (CONFIG.TEX_SIZE - 1)) * CONFIG.TEX_SIZE +
                (texX & (CONFIG.TEX_SIZE - 1))) *
              4;
            const buffIdx = (y * this.width + stripe) * 4;

            if (tex.data[pixIdx + 3] > 128) {
              const fog = Math.max(0.3, 1 - transformY / 15);
              data[buffIdx] = (tex.data[pixIdx] * fog) | 0;
              data[buffIdx + 1] = (tex.data[pixIdx + 1] * fog) | 0;
              data[buffIdx + 2] = (tex.data[pixIdx + 2] * fog) | 0;
              data[buffIdx + 3] = 255;
            }
          }
        }
      }
    }
  }

  renderParticles(player, particles, data) {
    for (const p of particles) {
      const sprite = p.pos.sub(player.pos);
      const invDet =
        1.0 / (player.plane.x * player.dir.y - player.dir.x * player.plane.y);
      const transformX =
        invDet * (player.dir.y * sprite.x - player.dir.x * sprite.y);
      const transformY =
        invDet * (-player.plane.y * sprite.x + player.plane.x * sprite.y);

      if (transformY <= 0.1) continue;

      const screenX = Math.floor(
        (this.width / 2) * (1 + transformX / transformY)
      );
      const screenY = Math.floor(
        this.height / 2 - (p.z / transformY) * this.height
      );

      if (
        screenX < 0 ||
        screenX >= this.width ||
        transformY >= this.zBuffer[screenX]
      )
        continue;

      const size = Math.max(1, Math.floor((p.size / transformY) * this.height));
      const alpha = p.life / p.maxLife;

      for (let dy = -size; dy <= size; dy++) {
        for (let dx = -size; dx <= size; dx++) {
          const px = screenX + dx;
          const py = screenY + dy;

          if (px >= 0 && px < this.width && py >= 0 && py < this.height) {
            const buffIdx = (py * this.width + px) * 4;
            const blend = alpha * 0.8;

            data[buffIdx] = Math.min(255, data[buffIdx] + p.color[0] * blend);
            data[buffIdx + 1] = Math.min(
              255,
              data[buffIdx + 1] + p.color[1] * blend
            );
            data[buffIdx + 2] = Math.min(
              255,
              data[buffIdx + 2] + p.color[2] * blend
            );
          }
        }
      }
    }
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
    this.zBuffer = new Float32Array(width);
    this.buffer = this.ctx.createImageData(width, height);
  }
}

// ============== MINIMAP ==============
class Minimap {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.scale = 6.5;
    this.visible = true;
  }

  render(player, enemies, pickups, worldMap) {
    if (!this.visible) return;

    const ctx = this.ctx;
    const scale = this.scale;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Map
    for (let y = 0; y < CONFIG.MAP_SIZE; y++) {
      for (let x = 0; x < CONFIG.MAP_SIZE; x++) {
        if (worldMap[x][y] > 0) {
          ctx.fillStyle = "rgba(0, 255, 136, 0.3)";
          ctx.fillRect(x * scale, y * scale, scale, scale);
        }
      }
    }

    // Pickups
    pickups.forEach((p) => {
      if (!p.active) return;
      ctx.fillStyle = "#0f0";
      ctx.fillRect(p.pos.x * scale - 2, p.pos.y * scale - 2, 4, 4);
    });

    // Enemies
    enemies.forEach((e) => {
      if (!e.active) return;
      ctx.fillStyle = "#f00";
      ctx.beginPath();
      ctx.arc(e.pos.x * scale, e.pos.y * scale, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Player
    ctx.fillStyle = "#0ff";
    ctx.beginPath();
    ctx.arc(player.pos.x * scale, player.pos.y * scale, 4, 0, Math.PI * 2);
    ctx.fill();

    // Direction
    ctx.strokeStyle = "#0ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(player.pos.x * scale, player.pos.y * scale);
    ctx.lineTo(
      (player.pos.x + player.dir.x * 2) * scale,
      (player.pos.y + player.dir.y * 2) * scale
    );
    ctx.stroke();
  }

  toggle() {
    this.visible = !this.visible;
    this.canvas.parentElement.style.display = this.visible ? "block" : "none";
  }
}

// ============== MAIN GAME ==============
class Game {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.canvas.width = CONFIG.RES_W;
    this.canvas.height = CONFIG.RES_H;

    this.input = new InputHandler();
    this.audio = new AudioSystem();
    this.textures = new TextureGenerator();
    this.renderer = new Renderer(this.canvas, this.textures);
    this.particles = new ParticleSystem();
    this.minimap = new Minimap(document.getElementById("minimap"));

    this.state = "menu";
    this.level = 1;
    this.score = 0;
    this.kills = 0;
    this.levelStartTime = 0;

    this.player = null;
    this.worldMap = null;
    this.enemies = [];
    this.projectiles = [];
    this.pickups = [];

    this.lastShootTime = 0;
    this.reloading = false;

    this.lastTime = 0;
    this.frameCount = 0;
    this.fps = 0;
    this.fpsTimer = 0;

    this.initPlayer();
    this.generateWorld(1);

    requestAnimationFrame(this.loop.bind(this));
  }

  initPlayer() {
    this.player = {
      pos: new Vec2(22, 12),
      dir: new Vec2(-1, 0),
      plane: new Vec2(0, CONFIG.FOV),
      health: CONFIG.MAX_HEALTH,
      ammo: CONFIG.MAX_AMMO,
      reserveAmmo: CONFIG.RESERVE_AMMO,
    };
  }

  generateWorld(level) {
    const map = [];

    // Initialize
    for (let x = 0; x < CONFIG.MAP_SIZE; x++) {
      map[x] = [];
      for (let y = 0; y < CONFIG.MAP_SIZE; y++) {
        if (
          x === 0 ||
          x === CONFIG.MAP_SIZE - 1 ||
          y === 0 ||
          y === CONFIG.MAP_SIZE - 1
        ) {
          map[x][y] = 1;
        } else {
          map[x][y] = 0;
        }
      }
    }

    // Add rooms
    const rooms = 4 + level;
    for (let i = 0; i < rooms; i++) {
      const x = Math.floor(Math.random() * (CONFIG.MAP_SIZE - 12)) + 4;
      const y = Math.floor(Math.random() * (CONFIG.MAP_SIZE - 12)) + 4;
      const w = Math.floor(Math.random() * 5) + 4;
      const h = Math.floor(Math.random() * 5) + 4;
      const wallType = (i % 5) + 1;

      for (let dx = 0; dx < w; dx++) {
        for (let dy = 0; dy < h; dy++) {
          const mx = x + dx;
          const my = y + dy;
          if (mx >= CONFIG.MAP_SIZE || my >= CONFIG.MAP_SIZE) continue;

          if (dx === 0 || dx === w - 1 || dy === 0 || dy === h - 1) {
            if (Math.random() > 0.2) {
              map[mx][my] = wallType;
            }
          }
        }
      }
    }

    this.worldMap = map;
  }

  spawnEntities() {
    this.enemies = [];
    this.projectiles = [];
    this.pickups = [];

    // Spawn enemies
    const enemyCount = 4 + this.level * 2;
    for (let i = 0; i < enemyCount; i++) {
      let x,
        y,
        attempts = 0;
      do {
        x = Math.floor(Math.random() * (CONFIG.MAP_SIZE - 4)) + 2;
        y = Math.floor(Math.random() * (CONFIG.MAP_SIZE - 4)) + 2;
        attempts++;
      } while (
        (this.worldMap[x][y] !== 0 ||
          new Vec2(x + 0.5, y + 0.5).distance(this.player.pos) < 6) &&
        attempts < 100
      );

      if (attempts < 100) {
        this.enemies.push(new Enemy(x + 0.5, y + 0.5));
      }
    }

    // Spawn pickups
    const pickupCount = 3 + this.level;
    for (let i = 0; i < pickupCount; i++) {
      let x,
        y,
        attempts = 0;
      do {
        x = Math.floor(Math.random() * (CONFIG.MAP_SIZE - 4)) + 2;
        y = Math.floor(Math.random() * (CONFIG.MAP_SIZE - 4)) + 2;
        attempts++;
      } while (this.worldMap[x][y] !== 0 && attempts < 100);

      if (attempts < 100) {
        const type = Math.random() > 0.5 ? "health" : "ammo";
        this.pickups.push(new Pickup(x + 0.5, y + 0.5, type));
      }
    }
  }

  startGame() {
    this.level = 1;
    this.score = 0;
    this.kills = 0;
    this.initPlayer();
    this.generateWorld(this.level);
    this.spawnEntities();
    this.particles.clear();
    this.state = "playing";
    this.levelStartTime = Date.now();

    document.getElementById("mainMenu").classList.add("hidden");
    document.body.requestPointerLock();

    this.updateUI();
    this.showNotification("MISSION START");
  }

  nextLevel() {
    this.level++;
    this.initPlayer();
    this.generateWorld(this.level);
    this.spawnEntities();
    this.particles.clear();
    this.state = "playing";
    this.levelStartTime = Date.now();

    document.getElementById("levelCompleteScreen").classList.remove("show");

    this.updateUI();
    this.showNotification(`LEVEL ${this.level}`);
  }

  pause() {
    if (this.state === "playing") {
      this.state = "paused";
      document.getElementById("mainMenu").classList.remove("hidden");
      document.exitPointerLock();
    }
  }

  restart() {
    document.getElementById("gameOverScreen").classList.remove("show");
    this.startGame();
  }

  returnToMenu() {
    this.state = "menu";
    document.getElementById("gameOverScreen").classList.remove("show");
    document.getElementById("mainMenu").classList.remove("hidden");
    document.exitPointerLock();
  }

  toggleQuality() {
    const qualities = ["low", "medium", "high"];
    const current = qualities.indexOf(CONFIG.QUALITY);
    const next = (current + 1) % qualities.length;
    CONFIG.QUALITY = qualities[next];

    const sizes = { low: [640, 360], medium: [800, 450], high: [960, 540] };
    const [w, h] = sizes[CONFIG.QUALITY];

    this.renderer.resize(w, h);
    CONFIG.RES_W = w;
    CONFIG.RES_H = h;

    document.getElementById("qualityText").textContent =
      CONFIG.QUALITY.toUpperCase();
  }

  showInstructions() {
    document.getElementById("instructions").classList.add("show");
  }

  hideInstructions() {
    document.getElementById("instructions").classList.remove("show");
  }

  handleInput(dt) {
    if (this.state !== "playing") return;

    const p = this.player;
    const sprint = this.input.isPressed("ShiftLeft")
      ? CONFIG.SPRINT_MULTIPLIER
      : 1;
    const speed = CONFIG.MOVE_SPEED * sprint;

    let moveX = 0,
      moveY = 0;

    // Movement
    if (this.input.isPressed("KeyW")) {
      moveX += p.dir.x * speed;
      moveY += p.dir.y * speed;
    }
    if (this.input.isPressed("KeyS")) {
      moveX -= p.dir.x * speed;
      moveY -= p.dir.y * speed;
    }
    if (this.input.isPressed("KeyA")) {
      moveX += p.dir.y * speed;
      moveY -= p.dir.x * speed;
    }
    if (this.input.isPressed("KeyD")) {
      moveX -= p.dir.y * speed;
      moveY += p.dir.x * speed;
    }

    // Collision
    const newX = p.pos.x + moveX;
    const newY = p.pos.y + moveY;

    if (
      this.worldMap[Math.floor(newX)] &&
      this.worldMap[Math.floor(newX)][Math.floor(p.pos.y)] === 0
    ) {
      p.pos.x = newX;
    }
    if (
      this.worldMap[Math.floor(p.pos.x)] &&
      this.worldMap[Math.floor(p.pos.x)][Math.floor(newY)] === 0
    ) {
      p.pos.y = newY;
    }

    // Mouse look
    const mouse = this.input.consumeMouse();
    if (mouse.x !== 0) {
      const rot = -mouse.x * CONFIG.ROT_SPEED;
      p.dir = p.dir.rotate(rot);
      p.plane = p.plane.rotate(rot);
    }

    // Shooting
    if (this.input.mouseDown && !this.reloading) {
      this.shoot();
    }

    // Reload
    if (
      this.input.isPressed("KeyR") &&
      !this.reloading &&
      p.ammo < CONFIG.MAX_AMMO &&
      p.reserveAmmo > 0
    ) {
      this.reload();
    }

    // Toggle minimap
    if (this.input.isPressed("Tab")) {
      this.minimap.toggle();
      this.input.keys.delete("Tab");
    }
  }

  shoot() {
    const now = Date.now();
    if (now - this.lastShootTime < CONFIG.FIRE_RATE) return;
    if (this.player.ammo <= 0) {
      if (this.player.reserveAmmo > 0 && !this.reloading) {
        this.reload();
      }
      return;
    }

    this.lastShootTime = now;
    this.player.ammo--;

    const proj = new Projectile(
      this.player.pos.x,
      this.player.pos.y,
      this.player.dir.x,
      this.player.dir.y
    );
    this.projectiles.push(proj);

    this.audio.playShoot();
    this.particles.emit(
      this.player.pos.x + this.player.dir.x * 0.4,
      this.player.pos.y + this.player.dir.y * 0.4,
      0.3,
      8,
      [0, 255, 200],
      0.5
    );

    this.updateUI();
  }

  reload() {
    if (this.reloading) return;

    this.reloading = true;
    document.getElementById("reloadText").style.display = "block";

    setTimeout(() => {
      const needed = CONFIG.MAX_AMMO - this.player.ammo;
      const available = Math.min(needed, this.player.reserveAmmo);

      this.player.ammo += available;
      this.player.reserveAmmo -= available;
      this.reloading = false;

      document.getElementById("reloadText").style.display = "none";
      this.updateUI();
    }, CONFIG.RELOAD_TIME);
  }

  damagePlayer(amount) {
    this.player.health -= amount;
    this.audio.playDamage();

    const vignette = document.getElementById("damageVignette");
    vignette.classList.add("active");
    setTimeout(() => vignette.classList.remove("active"), 200);

    if (this.player.health <= 0) {
      this.gameOver();
    }

    this.updateUI();
  }

  gameOver() {
    this.state = "gameover";

    document.getElementById("finalLevel").textContent = this.level;
    document.getElementById("finalKills").textContent = this.kills;
    document.getElementById("finalScore").textContent = this.score;
    document.getElementById("gameOverScreen").classList.add("show");

    document.exitPointerLock();
  }

  checkLevelComplete() {
    const alive = this.enemies.filter((e) => e.active).length;
    if (alive === 0 && this.state === "playing") {
      this.levelComplete();
    }
  }

  levelComplete() {
    this.state = "complete";

    const timeElapsed = Math.floor((Date.now() - this.levelStartTime) / 1000);
    const bonus = this.level * CONFIG.LEVEL_BONUS_MULTIPLIER;
    this.addScore(bonus);

    const minutes = Math.floor(timeElapsed / 60);
    const seconds = timeElapsed % 60;

    document.getElementById("levelKills").textContent = this.enemies.length;
    document.getElementById("levelTime").textContent = `${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;
    document.getElementById("levelBonus").textContent = bonus;
    document.getElementById("levelCompleteScreen").classList.add("show");
  }

  addScore(points) {
    this.score += points;
    this.updateUI();
  }

  addKill() {
    this.kills++;

    // Kill feed
    const feed = document.getElementById("killFeed");
    const msg = document.createElement("div");
    msg.className = "kill-message";
    msg.textContent = `+ ENEMY ELIMINATED (+${CONFIG.KILL_POINTS})`;
    feed.appendChild(msg);

    setTimeout(() => msg.remove(), 3000);
  }

  showNotification(text) {
    const notif = document.getElementById("notification");
    notif.textContent = text;
    notif.classList.add("show");
    setTimeout(() => notif.classList.remove("show"), 2000);
  }

  updateUI() {
    // Health
    const healthPercent = Math.max(
      0,
      (this.player.health / CONFIG.MAX_HEALTH) * 100
    );
    document.getElementById("healthValue").textContent = Math.max(
      0,
      Math.floor(this.player.health)
    );
    document.getElementById("healthBar").style.width = healthPercent + "%";
    document
      .getElementById("healthBar")
      .classList.toggle("critical", healthPercent < 30);

    // Ammo
    const ammoPercent = (this.player.ammo / CONFIG.MAX_AMMO) * 100;
    document.getElementById(
      "ammoValue"
    ).textContent = `${this.player.ammo} / ${this.player.reserveAmmo}`;
    document.getElementById("ammoBar").style.width = ammoPercent + "%";
    document
      .getElementById("ammoBar")
      .classList.toggle("low", ammoPercent < 30);
    document.getElementById("weaponAmmo").textContent = this.player.ammo;

    // Stats
    document.getElementById("enemiesValue").textContent = this.enemies.filter(
      (e) => e.active
    ).length;
    document.getElementById("levelDisplay").textContent = this.level;
    document.getElementById("scoreDisplay").textContent = this.score;
  }

  update(dt) {
    if (this.state !== "playing") return;

    // Update entities
    this.enemies.forEach((e) => e.update(this.player, this.worldMap, dt));
    this.projectiles.forEach((p) => p.update(this.worldMap, this.enemies, dt));
    this.projectiles = this.projectiles.filter((p) => p.active);
    this.pickups.forEach((p) => p.update(this.player, dt));
    this.pickups = this.pickups.filter((p) => p.active);

    // Update particles
    this.particles.update(dt);
  }

  render() {
    const allEntities = [...this.enemies, ...this.projectiles, ...this.pickups];

    this.renderer.render(
      this.player,
      allEntities,
      this.particles.particles,
      this.worldMap
    );

    this.minimap.render(this.player, this.enemies, this.pickups, this.worldMap);
  }

  loop(time) {
    const dt = Math.min(50, time - this.lastTime);
    this.lastTime = time;

    // FPS counter
    this.fpsTimer += dt;
    this.frameCount++;
    if (this.fpsTimer >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsTimer = 0;
      document.getElementById("fpsDisplay").textContent = this.fps;
    }

    this.handleInput(dt);
    this.update(dt);
    this.render();

    requestAnimationFrame(this.loop.bind(this));
  }
}

// Initialize
let game;
window.addEventListener("DOMContentLoaded", () => {
  game = new Game();
});
