/**
 * Particle Node for Mass-Spring systems
 * Represents a point mass in the physics simulation.
 */
class Particle {
    /**
     * Create a new Particle
     * @param {number} x - Initial x position
     * @param {number} y - Initial y position
     * @param {number} mass - Mass of the particle
     */
    constructor(x, y, mass = 1.0) {
        this.pos = new Vec2(x, y);
        this.prevPos = new Vec2(x, y); // For Verlet integration
        this.vel = new Vec2(0, 0);
        this.acc = new Vec2(0, 0);
        this.mass = mass;
        this.invMass = mass === 0 ? 0 : 1 / mass; // 0 mass = static (pinned)
        this.radius = 5.0; // Collision radius
        this.isPinned = false;
        this.friction = 0.95; // Damping
    }

    /**
     * Apply a force to the particle
     * @param {Vec2} f - Force vector
     */
    applyForce(f) {
        if (this.isPinned) return;
        this.acc.x += f.x * this.invMass;
        this.acc.y += f.y * this.invMass;
    }

    /**
     * Update particle position using Verlet Integration
     * @param {number} dt - Time step
     */
    update(dt) {
        if (this.isPinned) return;

        // v = (pos - prevPos) 
        // nextPos = pos + v * friction + a * dt * dt

        // Compute velocity implicitly
        const vx = (this.pos.x - this.prevPos.x) * this.friction;
        const vy = (this.pos.y - this.prevPos.y) * this.friction;

        this.prevPos = this.pos.copy();

        this.pos.x += vx + this.acc.x * dt * dt;
        this.pos.y += vy + this.acc.y * dt * dt;

        // Reset forces
        this.acc.set(0, 0);
    }

    /**
     * Manually set the position of the particle
     * Resets velocity to zero (implicitly) by setting prevPos = pos
     * @param {number} x 
     * @param {number} y 
     */
    setPos(x, y) {
        this.pos.set(x, y);
        this.prevPos.set(x, y);
    }
}
