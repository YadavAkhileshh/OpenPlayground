/**
 * @fileoverview Particle System for RayDOM.
 * Manages atmospheric dust, wall impacts, and "magic" trails using standard DOM elements.
 * Optimized for performance by reusing DOM elements (pooling).
 */

export class ParticleSystem {
    constructor(numParticles = 50) {
        this.container = document.body;
        this.particles = [];
        this.pool = [];
        this.maxParticles = numParticles;
        this.lastTime = Date.now();

        this.initPool();
    }

    /**
     * Initializes a pool of DIV elements to avoid constant DOM creation/deletion.
     */
    initPool() {
        for (let i = 0; i < this.maxParticles; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.position = 'absolute';
            p.style.pointerEvents = 'none';
            p.style.display = 'none';
            p.style.willChange = 'transform, opacity';
            this.container.appendChild(p);
            this.pool.push({
                el: p,
                active: false,
                x: 0,
                y: 0,
                vx: 0,
                vy: 0,
                life: 0,
                maxLife: 0,
                size: 2,
                color: '#fff'
            });
        }
    }

    /**
     * Spawns a new particle from the pool.
     */
    spawn(x, y, vx, vy, life, size = 2, color = '#fff') {
        const p = this.pool.find(item => !item.active);
        if (!p) return;

        p.active = true;
        p.x = x;
        p.y = y;
        p.vx = vx;
        p.vy = vy;
        p.life = life;
        p.maxLife = life;
        p.size = size;
        p.color = color;

        p.el.style.width = `${size}px`;
        p.el.style.height = `${size}px`;
        p.el.style.backgroundColor = color;
        p.el.style.display = 'block';
        p.el.style.borderRadius = '50%';
        p.el.style.zIndex = '1000';
    }

    /**
     * Creates an explosion of particles at a point.
     */
    emitExplosion(x, y, count = 10, color = '#ffaa00') {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const force = Math.random() * 5 + 2;
            this.spawn(
                x, y,
                Math.cos(angle) * force,
                Math.sin(angle) * force,
                Math.random() * 1000 + 500,
                Math.random() * 4 + 2,
                color
            );
        }
    }

    /**
     * Updates all active particles.
     */
    update(deltaTime) {
        const timeScale = deltaTime / 16.6;

        for (const p of this.pool) {
            if (!p.active) continue;

            p.x += p.vx * timeScale;
            p.y += p.vy * timeScale;
            p.life -= deltaTime;

            // Simple gravity
            p.vy += 0.1 * timeScale;

            if (p.life <= 0) {
                p.active = false;
                p.el.style.display = 'none';
            } else {
                const opacity = p.life / p.maxLife;
                p.el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
                p.el.style.opacity = opacity;
            }
        }
    }

    /**
     * Ambient dust effect that drifts around the screen.
     */
    updateAmbient(width, height) {
        if (Math.random() > 0.95) {
            this.spawn(
                Math.random() * width,
                Math.random() * height,
                Math.random() * 0.5 - 0.25,
                Math.random() * 0.5 - 0.25,
                2000,
                1.5,
                'rgba(255, 255, 255, 0.3)'
            );
        }
    }
}
