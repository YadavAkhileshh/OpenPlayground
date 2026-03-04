import { Entity } from './Entity.js';
import { CONFIG } from '../Config/Constants.js';
import { MathUtils } from '../Utils/MathUtils.js';
import { Bullet } from './Bullet.js';

export class Player extends Entity {
    constructor(x, y, inputSystem, audioSystem, particleSystem) {
        super(x, y, CONFIG.PLAYER.SIZE, CONFIG.PLAYER.COLOR);

        this.input = inputSystem;
        this.audio = audioSystem;
        this.particles = particleSystem;

        this.speed = CONFIG.PLAYER.SPEED;
        this.friction = CONFIG.PLAYER.FRICTION;
        this.acceleration = CONFIG.PLAYER.ACCELERATION;

        this.velocity = { x: 0, y: 0 };
        this.lastShotTime = 0;
        this.fireRate = 200; // ms

        // Dash mechanics
        this.lastDashTime = 0;
        this.isDashing = false;
        this.dashTimer = 0;

        this.addTag('player');
    }

    update(dt, bulletsContainer) {
        // handle movement
        let dx = 0;
        let dy = 0;

        // Get actions from input system
        if (this.input.isActionActive(CONFIG.CONTROLS.ACTIONS.UP)) dy = -1;
        if (this.input.isActionActive(CONFIG.CONTROLS.ACTIONS.DOWN)) dy = 1;
        if (this.input.isActionActive(CONFIG.CONTROLS.ACTIONS.LEFT)) dx = -1;
        if (this.input.isActionActive(CONFIG.CONTROLS.ACTIONS.RIGHT)) dx = 1;

        // Normalize direction
        if (dx !== 0 || dy !== 0) {
            const length = Math.sqrt(dx * dx + dy * dy);
            dx /= length;
            dy /= length;
        }

        // Apply acceleration
        if (this.isDashing) {
            // Dash overrides normal movement
            this.dashTimer -= dt * 1000;
            if (this.dashTimer <= 0) {
                this.isDashing = false;
                this.velocity.x *= 0.5;
                this.velocity.y *= 0.5;
            }
        } else {
            this.velocity.x += dx * this.acceleration;
            this.velocity.y += dy * this.acceleration;

            // Apply friction
            this.velocity.x *= this.friction;
            this.velocity.y *= this.friction;
        }

        // Update position
        this.x += this.velocity.x * dt;
        this.y += this.velocity.y * dt;

        // Screen boundaries
        this.x = MathUtils.clamp(this.x, this.radius, CONFIG.CANVAS_WIDTH - this.radius);
        this.y = MathUtils.clamp(this.y, this.radius, CONFIG.CANVAS_HEIGHT - this.radius);

        // Rotation (face movement direction)
        if (Math.abs(this.velocity.x) > 1 || Math.abs(this.velocity.y) > 1) {
            this.rotation = Math.atan2(this.velocity.y, this.velocity.x);

            // Add trail particles if moving fast
            if (Date.now() % 5 === 0) {
                this.particles.createTrail(this.x, this.y, this.color);
            }
        }

        // Shooting
        if (this.input.isActionActive(CONFIG.CONTROLS.ACTIONS.SHOOT)) {
            this.shoot(Date.now(), bulletsContainer);
        }

        // Dash Trigger
        if (this.input.isActionActive(CONFIG.CONTROLS.ACTIONS.DASH)) {
            this.dash(Date.now());
        }
    }

    shoot(now, bullets) {
        if (now - this.lastShotTime > this.fireRate) {
            // Determine shoot direction (defaults to current rotation)
            let angle = this.rotation;

            // Create bullet
            const b = new Bullet(
                this.x + Math.cos(angle) * this.radius,
                this.y + Math.sin(angle) * this.radius,
                angle
            );
            bullets.push(b);

            this.audio.playShoot();
            this.lastShotTime = now;

            // Recoil
            this.velocity.x -= Math.cos(angle) * 5;
            this.velocity.y -= Math.sin(angle) * 5;
        }
    }

    dash(now) {
        if (now - this.lastDashTime > CONFIG.PLAYER.DASH_COOLDOWN && !this.isDashing) {
            this.isDashing = true;
            this.lastDashTime = now;
            this.dashTimer = CONFIG.PLAYER.DASH_DURATION;

            // Dash in movement direction or current facing
            let angle = this.rotation;
            if (Math.abs(this.velocity.x) > 0.1 || Math.abs(this.velocity.y) > 0.1) {
                angle = Math.atan2(this.velocity.y, this.velocity.x);
            }

            const dashSpeed = CONFIG.PLAYER.SPEED * CONFIG.PLAYER.DASH_SPEED_MULTIPLIER;
            this.velocity.x = Math.cos(angle) * dashSpeed;
            this.velocity.y = Math.sin(angle) * dashSpeed;

            this.particles.createShockwave(this.x, this.y, '#ffffff');
            this.audio.playSwap(); // Reuse swap sound for dash for now
        }
    }

    draw(ctx) {
        super.draw(ctx);

        // Draw gun barrel
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color;
        ctx.fillRect(0, -5, this.radius + 10, 10);
        ctx.restore();
    }
}
