import { Vector2 } from './Vector2.js';

export class Body {
    constructor(x, y, mass = 1) {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2(0, 0);
        this.acceleration = new Vector2(0, 0);
        this.force = new Vector2(0, 0);
        this.mass = mass;
        this.invMass = mass === 0 ? 0 : 1 / mass; // 0 mass = infinite mass (static)
        this.restitution = 0.2; // Bounciness
        this.friction = 0.1;
        this.isStatic = mass === 0;
        this.useGravity = !this.isStatic;
    }

    applyForce(force) {
        this.force.add(force);
    }

    applyImpulse(impulse) {
        this.velocity.add(impulse.clone().mult(this.invMass));
    }

    update(dt) {
        if (this.isStatic) return;

        // F = ma -> a = F/m
        this.acceleration.set(0, 0);
        this.acceleration.add(this.force.clone().mult(this.invMass));

        // v += a * dt
        this.velocity.add(this.acceleration.clone().mult(dt));

        // Damping
        this.velocity.mult(1 - this.friction * dt * 5); // Simple damping approximation

        // p += v * dt
        this.position.add(this.velocity.clone().mult(dt));

        // Reset forces
        this.force.set(0, 0);
    }
}
