import { Entity } from './Entity.js';
import { CONFIG } from '../Config/Constants.js';
import { MathUtils } from '../Utils/MathUtils.js';

export class Enemy extends Entity {
    constructor(x, y, type) {
        super(x, y, CONFIG.ENEMY.BASE_SIZE, CONFIG.ENEMY.COLORS[type]);
        this.type = type;
        this.speed = CONFIG.ENEMY.BASE_SPEED;
        this.health = 10;
        this.scoreValue = 10;

        this.addTag('enemy');
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.destroy();
        }
    }
}

// Subclasses for specific behaviors

export class Chaser extends Enemy {
    constructor(x, y) {
        super(x, y, 'CHASER');
        this.scoreValue = 10;
    }

    update(dt, player) {
        if (!player) return;

        const angle = MathUtils.angleBetween(this.x, this.y, player.x, player.y);
        this.rotation = angle;

        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;

        super.update(dt);
    }
}

export class Shooter extends Enemy {
    constructor(x, y) {
        super(x, y, 'SHOOTER');
        this.speed *= 0.7; // Slower
        this.scoreValue = 20;
        this.lastShot = 0;
        this.fireRate = 2000;
        this.range = 300;
    }

    update(dt, player, bullets) {
        if (!player) return;

        const dist = MathUtils.distance(this.x, this.y, player.x, player.y);
        const angle = MathUtils.angleBetween(this.x, this.y, player.x, player.y);
        this.rotation = angle;

        if (dist > this.range) {
            // Move closer
            this.vx = Math.cos(angle) * this.speed;
            this.vy = Math.sin(angle) * this.speed;
        } else if (dist < this.range - 50) {
            // Back away
            this.vx = -Math.cos(angle) * this.speed;
            this.vy = -Math.sin(angle) * this.speed;
        } else {
            // Strafe
            this.vx = Math.cos(angle + Math.PI / 2) * this.speed;
            this.vy = Math.sin(angle + Math.PI / 2) * this.speed;
        }

        super.update(dt);
    }
}

export class Dasher extends Enemy {
    constructor(x, y) {
        super(x, y, 'DASHER');
        this.speed *= 0.5; // Starts slow
        this.scoreValue = 30;
        this.dashCooldown = 3000;
        this.lastDash = 0;
        this.isDashing = false;
        this.dashDuration = 500;
        this.dashTimer = 0;
    }

    update(dt, player) {
        if (!player) return;

        const now = Date.now();

        if (this.isDashing) {
            this.dashTimer -= dt * 1000;
            if (this.dashTimer <= 0) {
                this.isDashing = false;
                this.speed = CONFIG.ENEMY.BASE_SPEED * 0.5; // Reset speed
                this.radius = CONFIG.ENEMY.BASE_SIZE; // Reset size
            }
        } else {
            // Normal movement
            const angle = MathUtils.angleBetween(this.x, this.y, player.x, player.y);
            this.vx = Math.cos(angle) * this.speed;
            this.vy = Math.sin(angle) * this.speed;

            // Check dash
            const dist = MathUtils.distance(this.x, this.y, player.x, player.y);
            if (dist < 200 && now - this.lastDash > this.dashCooldown) {
                this.isDashing = true;
                this.lastDash = now;
                this.dashTimer = this.dashDuration;
                this.speed *= 5; // Dash speed
                this.vx = Math.cos(angle) * this.speed;
                this.vy = Math.sin(angle) * this.speed;
            }
        }

        super.update(dt);
    }
}
