/**
 * Nebula Core: The visual rendering engine using HTML5 Canvas.
 * Implements a generative particle flow field.
 */

class Particle {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.reset();
    }

    reset() {
        this.x = Math.random() * this.width;
        this.y = Math.random() * this.height;
        this.vx = 0;
        this.vy = 0;
        this.acc = 0;
        this.life = Math.random() * 0.5 + 0.5;
        this.size = Math.random() * 2 + 0.5;
        this.color = '';
    }

    update(audioStats, options) {
        // Core flow field logic would go here
        // For simplicity, we create a swirling orbital motion affected by audio
        const cx = this.width / 2;
        const cy = this.height / 2;
        const dx = this.x - cx;
        const dy = this.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const angle = Math.atan2(dy, dx);
        const speed = (audioStats.bass / 255) * options.flowRate + options.flowRate * 0.5;

        // Orbital force
        this.vx += Math.cos(angle + Math.PI / 2) * speed * 0.1;
        this.vy += Math.sin(angle + Math.PI / 2) * speed * 0.1;

        // Slight pull to center
        this.vx += -dx * 0.001;
        this.vy += -dy * 0.001;

        // Turbulence from highs
        this.vx += (Math.random() - 0.5) * (audioStats.high / 255) * 5;
        this.vy += (Math.random() - 0.5) * (audioStats.high / 255) * 5;

        this.x += this.vx;
        this.y += this.vy;

        // Friction
        this.vx *= 0.95;
        this.vy *= 0.95;

        // Wrap around
        if (this.x < 0) this.x = this.width;
        if (this.x > this.width) this.x = 0;
        if (this.y < 0) this.y = this.height;
        if (this.y > this.height) this.y = 0;
    }

    draw(ctx, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

class NebulaCore {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.bgCanvas = null;
        this.bgCtx = null;
        this.particles = [];
        this.stars = [];
        this.options = {
            density: 1000,
            flowRate: 5,
            theme: 'cyber',
            sensitivity: 50
        };
        this.colors = {
            cyber: ['#00f2ff', '#7000ff', '#ff00d4'],
            void: ['#000000', '#16213e', '#413344'],
            nova: ['#ff4d00', '#ff9e00', '#ffffff']
        };
        this.hueShift = 0;
    }

    init(canvasId, bgCanvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.bgCanvas = document.getElementById(bgCanvasId);
        this.bgCtx = this.bgCanvas.getContext('2d');

        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.createParticles();
        this.createStars();
    }

    resize() {
        if (!this.canvas) return;
        const p = this.canvas.parentElement;
        this.canvas.width = p.clientWidth;
        this.canvas.height = p.clientHeight;

        if (this.bgCanvas) {
            this.bgCanvas.width = window.innerWidth;
            this.bgCanvas.height = window.innerHeight;
        }

        this.createParticles();
        this.createStars();
    }

    createStars() {
        if (!this.bgCanvas) return;
        this.stars = [];
        for (let i = 0; i < 200; i++) {
            this.stars.push({
                x: Math.random() * this.bgCanvas.width,
                y: Math.random() * this.bgCanvas.height,
                size: Math.random() * 1.5,
                opacity: Math.random()
            });
        }
    }

    createParticles() {
        if (!this.canvas) return;
        this.particles = [];
        // Lower max count for better performance: 3000 max
        const count = Math.min(this.options.density * 15, 3000);
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(this.canvas.width, this.canvas.height));
        }
    }

    updateParams(params) {
        this.options = { ...this.options, ...params };
        if (params.density) this.createParticles();
    }

    render(audioStats) {
        if (!this.ctx) return;

        const scalar = (this.options.sensitivity || 50) / 50;
        const bass = (audioStats.bass || 0) * scalar;
        const high = (audioStats.high || 0) * scalar;
        const avg = (audioStats.avg || 0) * scalar;

        const ambientStats = {
            bass: bass || (Math.sin(Date.now() * 0.001) + 1) * 20,
            high: high || (Math.cos(Date.now() * 0.002) + 1) * 15,
            avg: avg || 20
        };

        // Static background stars (don't clear entire bg canvas every frame)
        this.bgCtx.clearRect(0, 0, this.bgCanvas.width, this.bgCanvas.height);
        this.stars.forEach(s => {
            this.bgCtx.fillStyle = `rgba(255, 255, 255, ${s.opacity})`;
            this.bgCtx.fillRect(s.x, s.y, s.size, s.size);
        });

        // Nebula trail effect
        let bgStyle = 'rgba(2, 2, 5, 0.15)';
        if (this.options.theme === 'void') bgStyle = 'rgba(0, 0, 5, 0.08)';
        if (this.options.theme === 'nova') bgStyle = 'rgba(10, 0, 0, 0.15)';

        this.ctx.fillStyle = bgStyle;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const themeColors = this.colors[this.options.theme] || this.colors.cyber;
        this.hueShift += 0.2;

        if (this.options.theme === 'cyber') {
            this.ctx.filter = `hue-rotate(${this.hueShift}deg)`;
        } else {
            this.ctx.filter = 'none';
        }

        // PERFORMANCE: Batch Drawing
        // Group particles by color to minimize ctx.beginPath and ctx.fillStyle changes
        const colorBatches = {};
        themeColors.forEach(c => colorBatches[c] = []);

        this.particles.forEach((p, i) => {
            p.update(ambientStats, this.options);
            const color = themeColors[i % themeColors.length];
            colorBatches[color].push(p);
        });

        // Final Render Pass
        for (const [color, batch] of Object.entries(colorBatches)) {
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            batch.forEach(p => {
                this.ctx.moveTo(p.x, p.y);
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            });
            this.ctx.fill();
        }

        this.ctx.filter = 'none';
    }
}

export const nebulaCore = new NebulaCore();
