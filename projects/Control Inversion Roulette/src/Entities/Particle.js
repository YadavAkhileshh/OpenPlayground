import { Entity } from './Entity.js';

export class Particle extends Entity {
    constructor(x, y, color, speed, life) {
        super(x, y, 2, color);
        this.vx = (Math.random() - 0.5) * speed;
        this.vy = (Math.random() - 0.5) * speed;
        this.life = life;
        this.maxLife = life;
        this.alpha = 1;
        this.decay = 0.95; // Velocity decay
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Friction
        this.vx *= this.decay;
        this.vy *= this.decay;

        this.life -= dt;
        this.alpha = this.life / this.maxLife;

        if (this.life <= 0) {
            this.destroy();
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}
