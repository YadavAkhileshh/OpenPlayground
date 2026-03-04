/**
 * File: visuals_old.js
 * MouseTone Module
 * Copyright (c) 2026
 */
export class VisualEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.hue = 0;

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    addParticle(x, y, speed) {
        const count = Math.floor(speed * 0.5) + 1; // More speed = more particles
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * speed * 0.2, // Spread based on speed
                vy: (Math.random() - 0.5) * speed * 0.2,
                size: Math.random() * 5 + 2,
                life: 1.0,
                color: `hsl(${this.hue + Math.random() * 40}, 100%, 50%)`
            });
        }
    }

    render() {
        // Fade effect for trails
        this.ctx.fillStyle = 'rgba(13, 13, 13, 0.15)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.hue += 0.5; // Slowly cycle hue over time

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];

            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
                i--;
                continue;
            }

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.fill();
        }
    }
}
