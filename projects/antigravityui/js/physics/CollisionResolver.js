// js/physics/CollisionResolver.js
import { Vector2D } from '../core/Vector2D.js';
import { MathUtils } from '../core/MathUtils.js';

export class CollisionResolver {
    /**
     * Resolves the collision manifold applying impulses and positional correction
     * @param {Object} manifold 
     */
    static resolve(manifold) {
        const { bodyA, bodyB, normal, penetration } = manifold;

        // 1. Positional Correction (prevent sinking)
        const percent = 0.8; // usually 0.2 to 0.8
        const slop = 0.01;

        // Only correct if penetration is greater than slop to prevent jitter
        const maxPen = Math.max(penetration - slop, 0);
        const invMassSum = bodyA.invMass + bodyB.invMass;

        if (invMassSum > 0) {
            const correctionScalar = maxPen / invMassSum * percent;
            const correction = normal.copy().mult(correctionScalar);

            if (!bodyA.isStatic && !bodyA.isDragged) {
                bodyA.position.sub(correction.copy().mult(bodyA.invMass));
                bodyA.aabb.update(bodyA.position.x, bodyA.position.y);
            }
            if (!bodyB.isStatic && !bodyB.isDragged) {
                bodyB.position.add(correction.copy().mult(bodyB.invMass));
                bodyB.aabb.update(bodyB.position.x, bodyB.position.y);
            }
        }

        // 2. Impulse Resolution (Velocity)
        const rv = Vector2D.sub(bodyB.velocity, bodyA.velocity);

        // Calculate relative velocity in terms of the normal direction
        const velAlongNormal = rv.dot(normal);

        // Do not resolve if velocities are separating
        if (velAlongNormal > 0) {
            return;
        }

        // Calculate restitution (bounciness) - use the minimum of both bodies
        const e = Math.min(bodyA.bounce, bodyB.bounce);

        // Calculate impulse scalar
        let j = -(1 + e) * velAlongNormal;
        j /= invMassSum;

        // Apply impulse
        const impulse = normal.copy().mult(j);

        if (!bodyA.isStatic && !bodyA.isDragged) {
            bodyA.applyImpulse(impulse.copy().mult(-1));
        }
        if (!bodyB.isStatic && !bodyB.isDragged) {
            bodyB.applyImpulse(impulse);
        }
    }
}
