import { CONFIG } from '../utils/constants.js';

/**
 * @fileoverview Particle effects system for collision feedback.
 * Newton's Cradle is subtle, so we only want tiny, elegant "sparks"
 * or "dust" to fly off during high-intensity collisions.
 */
export class ParticleSystem {
    /**
     * @param {HTMLElement} container - The container for particles.
     */
    constructor(container) {
        this.container = container;
        this.particles = [];
        this.maxParticles = 50;

        // Canvas overlay for particles (more efficient than many divs)
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'effects-canvas';
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);

        this.resize();
    }

    /**
     * Emit a burst of particles at a collision point.
     * 
     * @param {number} x - Collision X point.
     * @param {number} y - Collision Y point.
     * @param {number} intensity - How "hard" the hit was.
     */
    emit(x, y, intensity) {
        const count = Math.floor(intensity * 10);
        for (let i = 0; i < count; i++) {
            if (this.particles.length >= this.maxParticles) return;

            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * intensity * 2;

            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                decay: 0.02 + Math.random() * 0.05,
                size: 1 + Math.random() * 2
            });
        }
    }

    /**
     * Update and draw all active particles.
     * @param {number} dt 
     */
    update(dt) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            // Movement
            p.x += p.vx;
            p.y += p.vy;

            // Interaction with gravity (lightly)
            p.vy += 0.1;

            // Aging
            p.life -= p.decay;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            // Draw
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = '#f8fafc';
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    /**
     * Sync canvas size with container.
     */
    resize() {
        const rect = this.container.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }
}
