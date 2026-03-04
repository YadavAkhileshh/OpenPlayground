/**
 * Spring constraint between two particles
 * Enforces a distance constraint using Hooke's Law forces.
 */
class Spring {
    /**
     * Create a new Spring
     * @param {Particle} p1 - First connected particle
     * @param {Particle} p2 - Second connected particle
     * @param {number} restLength - Rest length of the spring
     * @param {number} stiffness - Spring constant (k)
     * @param {number} damping - Damping factor
     */
    constructor(p1, p2, restLength, stiffness, damping) {
        this.p1 = p1;
        this.p2 = p2;
        this.restLength = restLength;
        this.stiffness = stiffness; // k
        this.damping = damping;
    }

    /**
     * Update spring forces
     * Calculates and applies spring force + damping to connected particles.
     */
    update() {
        const delta = this.p2.pos.sub(this.p1.pos);
        const dist = delta.mag();

        if (dist === 0) return; // Avoid divide by zero

        // Hooke's Law: F = -k * (currentLength - restLength)
        // We will Apply this as a constraint relaxation for Verlet stability
        // or as a force. For soft bodies, force-based is good, but strict distance constraints (relaxation) are more stable for "solid" jelly.
        // Let's use a force-based approach w/ damping first.

        const difference = dist - this.restLength;
        const forceMagnitude = this.stiffness * difference;

        // Relative velocity for damping
        // Estimate velocity from Verlet positions
        // v = pos - prevPos
        const v1 = this.p1.pos.sub(this.p1.prevPos);
        const v2 = this.p2.pos.sub(this.p2.prevPos);
        const relVel = v2.sub(v1);

        // Damping force along the spring axis
        const normal = delta.normalize();
        const dampingForce = relVel.dot(normal) * this.damping;

        const totalForceMap = forceMagnitude + dampingForce;

        const f = normal.mult(totalForceMap);

        if (!this.p1.isPinned) this.p1.applyForce(f);
        if (!this.p2.isPinned) this.p2.applyForce(f.mult(-1));
    }

    /**
     * Alternative: Constraint Relaxation (More stable for stacking)
     * Moves particles to satisfy distance strictly.
     * Not currently used in favor of force-based soft body simulation.
     */
    solve() {
        const delta = this.p2.pos.sub(this.p1.pos);
        const dist = delta.mag();
        if (dist === 0) return;

        const difference = (dist - this.restLength) / dist;
        const scalar = difference * 0.5 * this.stiffness; // stiffness 0-1 acts as rigidity here

        const offset = delta.mult(scalar);

        if (!this.p1.isPinned) {
            this.p1.pos = this.p1.pos.add(offset);
        }
        if (!this.p2.isPinned) {
            this.p2.pos = this.p2.pos.sub(offset);
        }
    }
}
