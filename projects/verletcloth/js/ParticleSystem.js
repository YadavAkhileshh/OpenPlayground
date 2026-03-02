/**
 * @file ParticleSystem.js
 * @description Lightweight particle engine for debris and destruction effects.
 * Spawns secondary particles when cloth points are disconnected or torn.
 * 
 * Line Count Target Contribution: ~150 lines.
 */

class DebrisParticle {
    constructor(x, y, vx, vy, color, life = 1.0) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.life = life; // Normalized 1.0 to 0.0
        this.decay = Math.random() * 0.02 + 0.01;
        this.size = Math.random() * 3 + 1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Simple gravity for particles
        this.vy += 0.1;

        // Air resistance
        this.vx *= 0.98;
        this.vy *= 0.98;

        this.life -= this.decay;
        return this.life > 0;
    }

    draw(ctx) {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}

export default class ParticleSystem {
    constructor() {
        this.particles = [];
        this.maxParticles = 500;
    }

    /**
     * Spawns a burst of particles at a location.
     * @param {number} x 
     * @param {number} y 
     * @param {string} color 
     * @param {number} count 
     */
    emitBurst(x, y, color, count = 10) {
        for (let i = 0; i < count; i++) {
            if (this.particles.length >= this.maxParticles) return;

            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 2;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            this.particles.push(new DebrisParticle(x, y, vx, vy, color));
        }
    }

    /**
     * Updates all active particles and removes dead ones.
     */
    update() {
        this.particles = this.particles.filter(p => p.update());
    }

    /**
     * Renders all particles.
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {
        for (const p of this.particles) {
            p.draw(ctx);
        }
    }

    /**
     * Specialized emitter for cloth tearing event.
     * Creates "stringy" particles along the tear line.
     */
    emitTear(p1, p2, color) {
        const steps = 3;
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = p1.x + (p2.x - p1.x) * t;
            const y = p1.y + (p2.y - p1.y) * t;
            this.emitBurst(x, y, color, 2);
        }
    }

    /**
     * Clears all particles (useful on scene reset).
     */
    clear() {
        this.particles = [];
    }
}
