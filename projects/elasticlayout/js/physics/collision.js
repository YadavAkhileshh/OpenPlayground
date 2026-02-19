import { Vector } from '../math/vector.js';

/**
 * Handles collision detection and resolution between particles.
 */
export class Collision {
    static resolve(p1, p2) {
        const dx = p1.pos.x - p2.pos.x;
        const dy = p1.pos.y - p2.pos.y;
        const distSq = dx * dx + dy * dy;
        const minDist = p1.radius + p2.radius;

        if (distSq < minDist * minDist && distSq > 0) {
            const dist = Math.sqrt(distSq);
            const overlap = minDist - dist;

            // Normalize impact vector
            const nx = dx / dist;
            const ny = dy / dist;

            // Separate particles
            // Assume equal mass/restitution for simple verlet bubbles
            // Or use mass ratio
            const totalMass = p1.mass + p2.mass;
            const r1 = p2.mass / totalMass;
            const r2 = p1.mass / totalMass;

            const moveX = nx * overlap;
            const moveY = ny * overlap;

            if (!p1.isPinned) {
                p1.pos.x += moveX * r1;
                p1.pos.y += moveY * r1;
            }
            if (!p2.isPinned) {
                p2.pos.x -= moveX * r2;
                p2.pos.y -= moveY * r2;
            }

            // Friction/Energy loss could be applied to oldPos here to simulate inelastic collision
            // But for simple "separation" (sticking prevention), position correction is enough.
        }
    }
}
