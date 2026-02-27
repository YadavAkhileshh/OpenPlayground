/**
 * Particle Class
 * Represents a single visual particle (dust, spark, etc.)
 */
class Particle {
    constructor(pos, vel, color, life, size) {
        this.pos = pos.copy();
        this.vel = vel.copy();
        this.color = color;
        this.maxLife = life;
        this.life = life;
        this.size = size || 2;
        this.alpha = 1;
    }

    update() {
        this.pos.add(this.vel);
        this.vel.mult(0.95); // Drag
        this.life--;
        this.alpha = this.life / this.maxLife;
    }
}

/**
 * ParticleSystem Class
 * Manages all particles in the scene.
 */
class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    /**
     * Spawns a burst of particles at a location.
     * @param {Vector2} pos - Origin position
     * @param {string} type - 'dust' | 'spark' | 'smoke'
     */
    emitBurst(pos, type) {
        const count = type === 'dust' ? 10 : 5;

        for (let i = 0; i < count; i++) {
            const vel = new Vector2(
                MathUtils.randomRange(-2, 2),
                MathUtils.randomRange(-3, -0.5) // Upward bias
            );

            let color = '#ccc';
            let life = 30;
            let size = MathUtils.randomRange(1, 3);

            if (type === 'dust') {
                color = `rgba(150, 150, 150, ${Math.random()})`;
                life = MathUtils.randomRange(20, 40);
            } else if (type === 'spark') {
                color = '#ffaa00';
                life = MathUtils.randomRange(10, 20);
                vel.mult(2);
            }

            this.particles.push(new Particle(pos, vel, color, life, size));
        }
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.update();
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        ctx.save();
        this.particles.forEach(p => {
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.pos.x, p.pos.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }
}
