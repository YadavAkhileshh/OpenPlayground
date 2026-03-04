/**
 * Particle System
 */
import { Vector } from '../math/vector.js';

export class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    spawn(x, y, color, count = 5) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                pos: new Vector(x, y),
                vel: Vector.fromAngle(Math.random() * Math.PI * 2, Math.random() * 50),
                life: 1.0,
                color: color
            });
        }
    }

    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.pos = p.pos.add(p.vel.mult(dt));
            p.life -= dt * 2;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }

    render(ctx) {
        ctx.globalCompositeOperation = 'lighter';
        for (const p of this.particles) {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life;
            ctx.beginPath();
            ctx.arc(p.pos.x, p.pos.y, 2 * p.life, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1.0;
        ctx.globalCompositeOperation = 'source-over';
    }
}
