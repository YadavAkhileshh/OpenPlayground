/**
 * particle-system.js
 * Renders ephmeral visual effects for character decomposition.
 * 
 * Uses a Canvas overlay to simulate "ink dispersion" when a 
 * thought finally evaporates from the screen.
 */

class ParticleSystem {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.maxParticles = 500;
        this.isRunning = false;
    }

    /**
     * Injects the canvas and sets up the render loop.
     */
    init() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'particle-layer';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '1';

        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.setupSubscriptions();
        this.start();
    }

    /**
     * Resizes canvas to match viewport.
     */
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    /**
     * Listen for decay events.
     */
    setupSubscriptions() {
        if (typeof eventBus === 'undefined') return;

        // Note: We need the position of the expired element
        // For simplicity in this demo, we'll spawn near the center or randomly 
        // if no pos is provided.
        eventBus.on(EVENTS.CHAR_EXPIRED, (data) => {
            this.spawnCluster(window.innerWidth / 2, window.innerHeight / 2);
        });
    }

    /**
     * Spawns a burst of particles.
     */
    spawnCluster(x, y, count = 10) {
        const color = getComputedStyle(document.documentElement).getPropertyValue('--color-accent') || '#fff';

        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 50,
                y: y + (Math.random() - 0.5) * 50,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2 - 1,
                life: 1.0,
                decay: 0.01 + Math.random() * 0.02,
                size: 1 + Math.random() * 2,
                color: color
            });
        }

        // Prune old particles
        if (this.particles.length > this.maxParticles) {
            this.particles.splice(0, this.particles.length - this.maxParticles);
        }
    }

    /**
     * Animation loop.
     */
    start() {
        this.isRunning = true;
        this.render();
    }

    render() {
        if (!this.isRunning) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        }

        requestAnimationFrame(() => this.render());
    }
}

// Global instance
const particleSystem = new ParticleSystem();
