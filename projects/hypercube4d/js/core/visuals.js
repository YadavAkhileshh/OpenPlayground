/**
 * @file visuals.js
 * @description Manages secondary visual effects such as particles, background noise, and glitch effects
 * to enhance the scientific/sci-fi aesthetic.
 */

import { MathUtils } from '../math/utils.js';
import { settings } from './settings.js';

class Particle {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.reset();
    }

    reset() {
        this.x = Math.random() * this.width;
        this.y = Math.random() * this.height;
        this.vx = MathUtils.randomRange(-0.5, 0.5);
        this.vy = MathUtils.randomRange(-0.5, 0.5);
        this.life = MathUtils.randomRange(0.5, 1.0);
        this.size = MathUtils.randomRange(1, 2);
        this.alpha = MathUtils.randomRange(0.1, 0.5);
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 0.005;

        // Wrap around
        if (this.x < 0) this.x = this.width;
        if (this.x > this.width) this.x = 0;
        if (this.y < 0) this.y = this.height;
        if (this.y > this.height) this.y = 0;

        if (this.life <= 0) {
            this.reset();
        }
    }

    draw(ctx) {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha * this.life})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

export class Visuals {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.numParticles = 100;

        this.initParticles();

        // Listen for Resize
        window.addEventListener('resize', () => this.resize());
    }

    initParticles() {
        this.particles = [];
        for (let i = 0; i < this.numParticles; i++) {
            this.particles.push(new Particle(this.canvas.width / window.devicePixelRatio, this.canvas.height / window.devicePixelRatio));
        }
    }

    resize() {
        // Re-init particles on resize to fit new bounds
        this.initParticles();
    }

    /**
     * Renders background effects (particles).
     */
    renderBackground() {
        // Draw faint grid
        this.drawGrid();

        // Draw particles
        for (const p of this.particles) {
            p.update();
            p.draw(this.ctx);
        }
    }

    /**
     * Draws a scientific grid background.
     */
    drawGrid() {
        const width = this.canvas.width / window.devicePixelRatio;
        const height = this.canvas.height / window.devicePixelRatio;
        const spacing = 50;

        this.ctx.strokeStyle = 'rgba(0, 243, 255, 0.03)'; // Very faint cyan
        this.ctx.lineWidth = 1;

        // Vertical lines
        /*
        for (let x = 0; x <= width; x += spacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, height);
            this.ctx.stroke();
        }

        // Horizontal lines
        for (let y = 0; y <= height; y += spacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();
        }
        */
        // Using a more dynamic "scanner" line
        const time = performance.now() * 0.001;
        const scanY = (time * 50) % height;

        this.ctx.strokeStyle = 'rgba(0, 243, 255, 0.05)';
        this.ctx.beginPath();
        this.ctx.moveTo(0, scanY);
        this.ctx.lineTo(width, scanY);
        this.ctx.stroke();
    }

    /**
     * Applies post-processing effects.
     */
    applyPostProcess() {
        // Vignette
        const width = this.canvas.width / window.devicePixelRatio;
        const height = this.canvas.height / window.devicePixelRatio;

        const gradient = this.ctx.createRadialGradient(width / 2, height / 2, height / 3, width / 2, height / 2, height);
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, 'rgba(0,0,0,0.6)');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, width, height);

        // Scanlines
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        for (let y = 0; y < height; y += 4) {
            this.ctx.fillRect(0, y, width, 1);
        }
    }
}
