// js/physics/Forces.js
import { Vector2D } from '../core/Vector2D.js';
import { PHYSICS } from '../config/constants.js';
import { MathUtils } from '../core/MathUtils.js';

export class Forces {
    /**
     * Applies global inverted gravity to a body
     * @param {Body} body 
     */
    static applyGravity(body) {
        if (body.isStatic || body.isDragged) return;

        // F = m * g (Gravity force is proportional to mass)
        const gravityForce = new Vector2D(PHYSICS.GRAVITY.x, PHYSICS.GRAVITY.y);
        gravityForce.mult(body.mass);

        body.applyForce(gravityForce);
    }

    /**
     * Applies a repulsive force from the cursor outward
     * @param {Body} body 
     * @param {Vector2D} pointerPos 
     * @param {number} strengthMultiplier user configured strength
     */
    static applyCursorRepulsion(body, pointerPos, strengthMultiplier = 1.0) {
        if (!pointerPos || body.isDragged) return;

        const center = body.getCenter();
        const distSq = MathUtils.distSq(pointerPos.x, pointerPos.y, center.x, center.y);
        const radiusSq = PHYSICS.REPULSION_RADIUS * PHYSICS.REPULSION_RADIUS;

        if (distSq < radiusSq && distSq > 0.01) {
            const dist = Math.sqrt(distSq);
            // Calculate force magnitude based on distance (inverse square or linear)
            // Linear falloff for smoother UI feel
            const forceMag = MathUtils.map(dist, 0, PHYSICS.REPULSION_RADIUS, PHYSICS.REPULSION_FORCE, 0) * strengthMultiplier;

            const forceDir = Vector2D.sub(center, pointerPos).normalize();
            forceDir.mult(forceMag * body.mass); // Multiply by mass so heavier things get pushed but resist more

            body.applyForce(forceDir);
        }
    }

    /**
     * Apply lateral force from mouse scroll
     * @param {Body} body 
     * @param {Vector2D} scrollVelocity 
     */
    static applyScrollForce(body, scrollVelocity) {
        if (body.isStatic || body.isDragged) return;

        const force = scrollVelocity.copy().mult(body.mass * 0.05); // Scale down scroll impact
        body.applyForce(force);
    }
}
