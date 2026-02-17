/**
 * ParticleSystem.js
 * 
 * Manages creation, updating, and rendering of visual particles.
 * Uses object pooling for performance.
 */

import { Utils } from '../core/Utils.js';

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.life = 0;
        this.maxLife = 0;
        this.size = 0;
        this.color = '#fff';
        this.alpha = 1;
        this.active = false;
        this.decay = 0.02; // Alpha decay per frame
    }
}

export class ParticleSystem {
    constructor(maxParticles = 500) {
        this.particles = [];
        this.pool = [];
        this.maxParticles = maxParticles;

        // Pre-fill pool
        for (let i = 0; i < maxParticles; i++) {
            this.pool.push(new Particle());
        }
    }

    /**
     * Spawns a new particle.
     * @param {Object} options - Configuration for the particle.
     */
    spawn(x, y, options = {}) {
        if (this.pool.length === 0) return; // Pool empty

        const p = this.pool.pop();
        p.active = true;
        p.x = x;
        p.y = y;
        p.vx = options.vx || Utils.randomFloat(-2, 2);
        p.vy = options.vy || Utils.randomFloat(-2, 2);
        p.color = options.color || '#fff';
        p.size = options.size || Utils.randomFloat(2, 5);
        p.maxLife = options.life || 60;
        p.life = p.maxLife;
        p.alpha = 1;
        p.decay = options.decay || (1 / p.maxLife);

        this.particles.push(p);
    }

    /**
     * Emit multiple particles (explosion/burst).
     */
    emit(x, y, count, options = {}) {
        for (let i = 0; i < count; i++) {
            // Add some randomness to options if desired
            this.spawn(x, y, options);
        }
    }

    /**
     * Update all active particles.
     */
    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            p.alpha -= p.decay;

            // Check death conditions
            if (p.life <= 0 || p.alpha <= 0) {
                p.active = false;
                this.returnToPool(p, i);
            }
        }
    }

    returnToPool(particle, index) {
        this.particles.splice(index, 1);
        particle.reset();
        this.pool.push(particle);
    }

    /**
     * Render all active particles.
     * @param {CanvasRenderingContext2D} ctx 
     */
    render(ctx) {
        ctx.save();
        this.particles.forEach(p => {
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }
}
