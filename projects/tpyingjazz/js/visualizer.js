/**
 * typing-jazz/js/visualizer.js
 * 
 * ADVANCED PARTICLE VISUALIZER
 * 
 * This module handles all high-performance rendering for the application.
 * It uses a specialized particle engine with custom physics (gravity, friction)
 * and a "Motion Trail" effect to create a sophisticated jazz atmosphere.
 */

export class Visualizer {
    /**
     * @param {HTMLCanvasElement} canvas
     * @param {CanvasRenderingContext2D} ctx
     */
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;

        /** @type {Array} Active particle objects */
        this.particles = [];

        /** @type {Array} Rhythmic wave objects */
        this.waves = [];

        /** @type {string} Current accent color for rendering */
        this.accentColor = '#c5a059';

        /** @type {number} Global intensity multiplier for effects */
        this.intensity = 1.0;

        /** @type {number} Metronome pulse alpha */
        this.pulse = 0;

        this.setupListeners();
    }

    /**
     * Links visualizer to theme changes.
     */
    setupListeners() {
        window.addEventListener('themechanged', (e) => {
            this.accentColor = e.detail.accent;
        });
    }

    /**
     * Spawns a cluster of physics-based particles.
     * @param {number} x Origin X
     * @param {number} y Origin Y
     * @param {string} color Optional override
     */
    addParticle(x, y, color) {
        const count = 12 * this.intensity;
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.8) * 12, // Move upwards
                alpha: 1.0,
                size: Math.random() * 4 + 1,
                color: color || this.accentColor,
                gravity: 0.15,
                friction: 0.98
            });
        }
    }

    /**
     * Generates a "harmonic ripple" in the visual field.
     * @param {number} y Horizontal line position
     * @param {number} power Amplitude of the wave
     */
    addWave(y, power) {
        this.waves.push({
            y: y,
            power: power * this.intensity,
            time: 0,
            alpha: 0.6,
            decay: 0.008
        });
    }

    /**
     * Triggers a metronome pulse visual.
     */
    triggerPulse() {
        this.pulse = 0.5;
    }

    /**
     * Update loop for physics and animation states.
     * Call this once per frame.
     */
    update() {
        // Update Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            p.vx *= p.friction;
            p.vy *= p.friction;
            p.vy += p.gravity;

            p.x += p.vx;
            p.y += p.vy;

            p.alpha -= 0.015;

            if (p.alpha <= 0 || p.y > this.canvas.height + 50) {
                this.particles.splice(i, 1);
            }
        }

        // Update Waves
        for (let i = this.waves.length - 1; i >= 0; i--) {
            const w = this.waves[i];
            w.time += 0.15;
            w.alpha -= w.decay;
            if (w.alpha <= 0) {
                this.waves.splice(i, 1);
            }
        }

        // Update Pulse
        if (this.pulse > 0) {
            this.pulse -= 0.02;
        }
    }

    /**
     * Drawing loop. Handles layering and visual effects.
     */
    draw() {
        const w = this.canvas.width;
        const h = this.canvas.height;

        // 1. Draw Metronome Pulse (Ambient Background Glow)
        if (this.pulse > 0) {
            this.ctx.fillStyle = this.accentColor;
            this.ctx.globalAlpha = this.pulse * 0.1;
            this.ctx.fillRect(0, 0, w, h);
        }

        // 2. Draw Harmonic Waves
        this.ctx.lineWidth = 1.5;
        this.waves.forEach(wave => {
            this.ctx.beginPath();
            this.ctx.strokeStyle = this.accentColor;
            this.ctx.globalAlpha = wave.alpha;

            for (let x = 0; x < w; x += 10) {
                const waveY = wave.y + Math.sin(x * 0.005 + wave.time) * wave.power;
                if (x === 0) this.ctx.moveTo(x, waveY);
                else this.ctx.lineTo(x, waveY);
            }
            this.ctx.stroke();
        });

        // 3. Draw Particles
        this.particles.forEach(p => {
            this.ctx.globalAlpha = p.alpha;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            // Draw elongated sparks for "jazz motion"
            const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Reset global state
        this.ctx.globalAlpha = 1.0;
    }

    /**
     * Resets the visualizer state.
     */
    clear() {
        this.particles = [];
        this.waves = [];
    }
}
