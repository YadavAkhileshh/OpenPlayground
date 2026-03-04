/**
 * Represents a single particle in the visual effect system.
 * Handles position, velocity, and life cycle.
 */
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.random() * 3 + 2;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.life = 1.0; // 100% life
        this.decay = Math.random() * 0.03 + 0.01;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= this.decay;
        this.size *= 0.95; // Shrink
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

/**
 * System to manage and render multiple particles.
 * Used for exhaust smoke, sparks, etc.
 */
class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    /**
     * Spawns new particles.
     * @param {number} x - Origin X
     * @param {number} y - Origin Y
     * @param {string} color - CSS color string
     * @param {number} count - Number of particles to spawn
     */
    emit(x, y, color = "orange", count = 5) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }

    updateAndDraw(ctx) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            this.particles[i].draw(ctx);
            if (this.particles[i].life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
}
