/**
 * Particle System
 * visual effects for movement, collisions, and goals
 */

class Particle {
    constructor(x, y, color, speed, life) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.life = life;
        this.maxLife = life;
        this.size = Math.random() * 3 + 1;

        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * speed;
        this.vx = Math.cos(angle) * velocity;
        this.vy = Math.sin(angle) * velocity;

        this.decay = Math.random() * 0.05 + 0.02;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        this.size *= 0.95; // Shrink over time
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life / this.maxLife;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.maxParticles = 500;
    }

    /**
     * Spawn particles at a location
     * @param {number} x 
     * @param {number} y 
     * @param {string} color 
     * @param {number} count 
     */
    emit(x, y, color, count = 10) {
        for (let i = 0; i < count; i++) {
            if (this.particles.length >= this.maxParticles) {
                this.particles.shift(); // Remove oldest
            }
            this.particles.push(new Particle(x, y, color, 2, 1.0));
        }
    }

    /**
     * Update all particles
     */
    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.update();
            if (p.life <= 0 || p.size <= 0.1) {
                this.particles.splice(i, 1);
            }
        }
    }

    /**
     * Render all particles
     * @param {CanvasRenderingContext2D} ctx 
     */
    render(ctx) {
        // Batch drawing by color/state could be faster but simple loop is fine here
        // Set blend mode for cool effects
        ctx.globalCompositeOperation = 'lighter';

        this.particles.forEach(p => p.draw(ctx));

        ctx.globalCompositeOperation = 'source-over';
    }

    /**
     * Clear system
     */
    clear() {
        this.particles = [];
    }
}
