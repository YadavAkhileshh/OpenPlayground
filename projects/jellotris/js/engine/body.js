/**
 * SoftBody - A collection of particles and springs
 * Represents a single deformable object.
 */
class SoftBody {
    constructor() {
        this.particles = [];
        this.springs = [];
        this.center = new Vec2();
        this.color = '#0ff';
        this.isStatic = false; // If true, particles are pinned
        this.id = Math.random().toString(36).substr(2, 9);
        this.pressure = 5000; // Force to maintain area
    }

    /**
     * Add a particle to this body
     * @param {Particle} p 
     */
    addParticle(p) {
        this.particles.push(p);
    }

    /**
     * Add a spring to this body
     * @param {Spring} s 
     */
    addSpring(s) {
        this.springs.push(s);
    }

    /**
     * Recalculate the geometric center (centroid) of the body
     */
    updateCenter() {
        let sumX = 0;
        let sumY = 0;
        for (let p of this.particles) {
            sumX += p.pos.x;
            sumY += p.pos.y;
        }
        this.center.set(sumX / this.particles.length, sumY / this.particles.length);
    }

    /**
     * Apply internal pressure to maintain volume
     * NOT IMPLEMENTED - Relying on cross-bracing springs for structure.
     */
    applyPressure() {
        // Placeholder for future pressure implementation
    }

    /**
     * Translate the entire body
     * @param {number} x - Delta x
     * @param {number} y - Delta y
     */
    translate(x, y) {
        for (let p of this.particles) {
            p.pos.x += x;
            p.pos.y += y;
            p.prevPos.x += x;
            p.prevPos.y += y;
        }
    }

    /**
     * Rotate the body around its center
     * @param {number} angle - Angle in radians
     */
    rotate(angle) {
        this.updateCenter();
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        for (let p of this.particles) {
            const dx = p.pos.x - this.center.x;
            const dy = p.pos.y - this.center.y;

            const nx = dx * cos - dy * sin;
            const ny = dx * sin + dy * cos;

            p.pos.x = this.center.x + nx;
            p.pos.y = this.center.y + ny;

            // Reset linear velocity approximation to prevent flinging
            p.prevPos.x = p.pos.x;
            p.prevPos.y = p.pos.y;
        }
    }

    /**
     * Get the Axis-Aligned Bounding Box (AABB)
     * @returns {{minX: number, minY: number, maxX: number, maxY: number}}
     */
    getBoundingBox() {
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        for (let p of this.particles) {
            if (p.pos.x < minX) minX = p.pos.x;
            if (p.pos.y < minY) minY = p.pos.y;
            if (p.pos.x > maxX) maxX = p.pos.x;
            if (p.pos.y > maxY) maxY = p.pos.y;
        }
        return { minX, minY, maxX, maxY };
    }
}
