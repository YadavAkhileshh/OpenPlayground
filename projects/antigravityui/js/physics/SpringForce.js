// js/physics/SpringForce.js
import { Vector2D } from '../core/Vector2D.js';
import { MathUtils } from '../core/MathUtils.js';

export class SpringForce {
    /**
     * Applies a Hooke's Law spring force
     * F = -k * x
     * @param {Body} body 
     * @param {Vector2D} targetAnchor 
     * @param {number} restLength 
     * @param {number} stiffness (k)
     * @param {number} damping 
     */
    static apply(body, targetAnchor, restLength = 100, stiffness = 0.05, damping = 0.1) {
        if (body.isStatic || body.isDragged) return;

        const center = body.getCenter();
        const force = Vector2D.sub(center, targetAnchor);
        const dist = force.mag();

        // Calculate spring force magnitude
        const stretch = dist - restLength;
        const springMag = -stiffness * stretch;

        if (dist > 0) {
            force.normalize();
            force.mult(springMag);

            // Add internal damping based on velocity away from anchor
            const rv = body.velocity;
            const dampingMag = force.dot(rv) * damping;
            const dampingForce = force.copy().mult(-dampingMag);

            force.add(dampingForce);

            // Apply force
            body.applyForce(force);
        }
    }
}
