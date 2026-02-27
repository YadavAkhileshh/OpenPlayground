/**
 * Spring Class
 * Connects two particles with a spring force (Hooke's Law).
 */
import { Vector3 } from '../math/vector3.js';

export class Spring {
    constructor(p1, p2, restLength, stiffness, damping) {
        this.p1 = p1;
        this.p2 = p2;
        this.restLength = restLength;
        this.stiffness = stiffness || 0.5; // k
        this.damping = damping || 0.1;
    }

    /**
     * Applies spring forces to connected particles.
     */
    update() {
        const p1 = this.p1;
        const p2 = this.p2;

        // Vector from p1 to p2
        const delta = Vector3.subVectors(p2.position, p1.position);
        const distance = delta.length();

        // Avoid division by zero
        if (distance === 0) return;

        // Calculate spring force magnitude
        // F = -k * (currentLength - restLength)
        const stretch = distance - this.restLength;
        const forceMagnitude = this.stiffness * stretch;

        // Calculate damping force (relative velocity)
        const relVel = Vector3.subVectors(p2.velocity, p1.velocity);
        const normalizedDelta = delta.clone().normalize();

        // Damping along the axis of the spring
        const dampingForce = relVel.dot(normalizedDelta) * this.damping;

        const totalForceMagnitude = forceMagnitude + dampingForce;

        // Force vector
        const force = normalizedDelta.multiplyScalar(totalForceMagnitude);

        // Apply forces (Equal and opposite)
        p1.applyForce(force);
        p2.applyForce(force.clone().multiplyScalar(-1));
    }
}
