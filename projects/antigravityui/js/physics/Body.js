// js/physics/Body.js
import { Vector2D } from '../core/Vector2D.js';
import { AABB } from './AABB.js';
import { PHYSICS } from '../config/constants.js';
import { IdGenerator } from '../core/IdGenerator.js';

export class Body {
    constructor(x, y, width, height, mass = 1.0, isStatic = false) {
        this.id = IdGenerator.nextId();

        // Physics properties
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D(0, 0);
        this.acceleration = new Vector2D(0, 0);

        this.mass = mass;
        this.invMass = mass === 0 || isStatic ? 0 : 1 / mass;
        this.isStatic = isStatic;
        this.isSleeping = false;

        // Dimensions & Bounding Box
        this.width = width;
        this.height = height;
        this.aabb = new AABB(x, y, width, height);

        // UI Interaction state
        this.isDragged = false;
        this.isHovered = false;

        this.bounce = PHYSICS.BOUNCE;
    }

    applyForce(forceVec) {
        if (this.isStatic || this.isDragged) return;

        // force = mass * acceleration -> acceleration = force / mass
        const f = forceVec.copy().mult(this.invMass);
        this.acceleration.add(f);
    }

    applyImpulse(impulseVec) {
        if (this.isStatic || this.isDragged) return;

        // impulse changes velocity directly based on mass
        const invMassEffect = impulseVec.copy().mult(this.invMass);
        this.velocity.add(invMassEffect);
    }

    update(dt) {
        if (this.isStatic || this.isDragged) {
            this.acceleration.set(0, 0);
            return;
        }

        // Apply drag/friction
        this.velocity.mult(PHYSICS.DAMPING);

        // Cap velocity
        this.velocity.limit(PHYSICS.MAX_VELOCITY);

        // Semi-implicit Euler Integration
        this.velocity.add(this.acceleration); // assuming dt is handled in engine or simplified here
        this.position.add(this.velocity);

        // Update AABB
        this.aabb.update(this.position.x, this.position.y);

        // Reset acceleration for next frame
        this.acceleration.set(0, 0);

        // Sleep check
        if (this.velocity.magSq() < PHYSICS.RESTING_VELOCITY * PHYSICS.RESTING_VELOCITY) {
            // we could sleep it, but UI elements are usually active with cursor
        }
    }

    setPosition(x, y) {
        this.position.set(x, y);
        this.aabb.update(x, y);
    }

    getCenter() {
        return new Vector2D(this.position.x + this.width / 2, this.position.y + this.height / 2);
    }
}
