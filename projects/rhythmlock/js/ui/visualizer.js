/**
 * RhythmLock - Visualizer
 * -----------------------
 * Renders real-time feedback of the user's typing rhythm.
 * Uses a canvas to draw particles representing keystroke intensity and timing.
 */

export class Visualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.resize();

        window.addEventListener('resize', () => this.resize());

        this.dataPoints = []; // Stores particles
        this.running = false;

        // Animation loop
        this.animate = this.animate.bind(this);
    }

    resize() {
        // Handle high-DPI displays
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.parentElement.getBoundingClientRect();

        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;

        this.ctx.scale(dpr, dpr);
        this.width = rect.width;
        this.height = rect.height;
    }

    start() {
        if (!this.running) {
            this.running = true;
            this.dataPoints = []; // Clear on start
            requestAnimationFrame(this.animate);
        }
    }

    stop() {
        this.running = false;
        this.clear();
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.dataPoints = [];
    }

    /**
     * Adds a visual event.
     * @param {string} type 'keydown' or 'keyup'
     */
    triggerEvent(type) {
        // Create particles
        const count = type === 'keydown' ? 8 : 3;
        const color = type === 'keydown' ? '#2f81f7' : '#ffffff';

        for (let i = 0; i < count; i++) {
            this.dataPoints.push({
                x: this.width,
                y: this.height / 2 + (Math.random() - 0.5) * 60,
                vx: -3 - Math.random() * 4,
                vy: (Math.random() - 0.5) * 4,
                size: Math.random() * 3 + 1,
                life: 1.0,
                decay: 0.015 + Math.random() * 0.02,
                type: type,
                color: color
            });
        }

        // Add a "Shockwave" vertical line for rhythm beat
        if (type === 'keydown') {
            this.dataPoints.push({
                isWave: true,
                x: this.width,
                life: 1.0,
                width: 2,
                velocity: 4
            });
        }
    }

    animate() {
        if (!this.running) return;

        // Trail effect to create motion blur
        this.ctx.fillStyle = 'rgba(22, 27, 34, 0.3)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw baseline
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'rgba(48, 54, 61, 0.8)';
        this.ctx.lineWidth = 1;
        this.ctx.moveTo(0, this.height / 2);
        this.ctx.lineTo(this.width, this.height / 2);
        this.ctx.stroke();

        this.ctx.shadowBlur = 0;

        for (let i = this.dataPoints.length - 1; i >= 0; i--) {
            const p = this.dataPoints[i];

            if (p.isWave) {
                p.x -= p.velocity;
                p.life -= 0.02;

                if (p.life <= 0 || p.x < -10) {
                    this.dataPoints.splice(i, 1);
                    continue;
                }

                // Draw wave line
                this.ctx.fillStyle = `rgba(47, 129, 247, ${p.life * 0.6})`;
                this.ctx.fillRect(p.x, 0, p.width, this.height);

                // Draw connecting line to baseline center
                this.ctx.beginPath();
                this.ctx.strokeStyle = `rgba(47, 129, 247, ${p.life * 0.3})`;
                this.ctx.moveTo(p.x, 0);
                this.ctx.lineTo(p.x, this.height);
                this.ctx.stroke();

                continue;
            }

            // Move particle
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;

            // Gravity effect? No, just floaty space

            if (p.life <= 0 || p.x < -10) {
                this.dataPoints.splice(i, 1);
                continue;
            }

            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.life;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalAlpha = 1.0;
        }

        // Draw "Grid" overlay for sci-fi feel
        this.drawGrid();

        requestAnimationFrame(this.animate);
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(48, 54, 61, 0.2)';
        this.ctx.lineWidth = 1;
        const step = 50;

        // Vertical lines moving
        const offset = (Date.now() / 15) % step;

        for (let x = -offset; x < this.width; x += step) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }

        // Horizontal lines static
        for (let y = 0; y < this.height; y += step) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
    }
}
