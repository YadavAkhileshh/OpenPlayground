import { Particle } from '../Entities/Particle.js';
import { CONFIG } from '../Config/Constants.js';
import { MathUtils } from '../Utils/MathUtils.js';

export class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    update(dt) {
        // Update all particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.update(dt);
            if (p.isMarkedForDeletion) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        this.particles.forEach(p => p.draw(ctx));
    }

    createExplosion(x, y, color, count = 20) {
        for (let i = 0; i < count; i++) {
            const p = new Particle(x, y, color, MathUtils.randomRange(50, 200), MathUtils.randomRange(0.5, 1.5));
            this.particles.push(p);
        }
    }

    createTrail(x, y, color) {
        const p = new Particle(x, y, color, 20, 0.3);
        p.vx = (Math.random() - 0.5) * 20;
        p.vy = (Math.random() - 0.5) * 20;
        this.particles.push(p);
    }

    // Create specific shape effect
    createShockwave(x, y, color) {
        const count = 30;
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            const speed = 150;
            const p = new Particle(x, y, color, 0, 0.5);
            p.vx = Math.cos(angle) * speed;
            p.vy = Math.sin(angle) * speed;
            this.particles.push(p);
        }
    }
}
