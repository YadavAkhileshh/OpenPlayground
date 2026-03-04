import { Vector } from '../math/vector.js';

/**
 * Applies layout forces to particles.
 * Repulsion between all particles to preventing overlapping.
 * Attraction to center or specific points.
 */
export class ForceLayout {
    constructor(world) {
        this.world = world;
        this.strength = 0.5;
        this.center = new Vector(window.innerWidth / 2, window.innerHeight / 2);
    }

    apply() {
        const particles = this.world.particles;

        for (let i = 0; i < particles.length; i++) {
            const p1 = particles[i];
            if (p1.isPinned) continue;

            // 1. Attraction to Center (Gravity-like)
            // F = direction * strength
            // const dir = this.center.sub(p1.pos).normalize();
            // p1.applyForce(dir.mult(0.1));

            // 2. Repulsion from other particles (Coulomb-like)
            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p1.pos.x - p2.pos.x;
                const dy = p1.pos.y - p2.pos.y;
                const distSq = dx * dx + dy * dy;

                // Optimization: Ignore far away Interaction
                if (distSq > 20000 || distSq === 0) continue;

                const dist = Math.sqrt(distSq);
                const force = 500 / (distSq + 1); // Inverse square law

                const fx = (dx / dist) * force;
                const fy = (dy / dist) * force;

                p1.applyForce(new Vector(fx, fy));
                p2.applyForce(new Vector(-fx, -fy));
            }
        }
    }
}
