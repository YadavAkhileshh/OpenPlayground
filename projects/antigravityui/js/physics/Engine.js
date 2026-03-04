// js/physics/Engine.js
import { Body } from './Body.js';
import { Forces } from './Forces.js';
import { Collision } from './Collision.js';
import { CollisionResolver } from './CollisionResolver.js';
import { PHYSICS } from '../config/constants.js';

export class Engine {
    constructor() {
        this.bodies = [];
        this.gravityEnabled = true;

        // Environmental bounds
        this.bounds = { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight };

        // Interactive state
        this.pointerPos = null; // Vector2D
        this.scrollVelocity = null; // Vector2D
        this.repulsionStrength = 1.0;
        this.frictionCoefficient = 1.0;
        this.gravityCoefficient = 1.0;
    }

    addBody(body) {
        this.bodies.push(body);
        return body;
    }

    removeBody(body) {
        this.bodies = this.bodies.filter(b => b.id !== body.id);
    }

    setBounds(width, height) {
        this.bounds.width = width;
        this.bounds.height = height;
    }

    setPointerInfo(pos, strength) {
        this.pointerPos = pos;
        this.repulsionStrength = strength;
    }

    setScrollInfo(velocity) {
        this.scrollVelocity = velocity;
    }

    setModifiers(gravity, friction) {
        this.gravityCoefficient = gravity;
        this.frictionCoefficient = friction;
    }

    update(dt) {
        // 1. Apply Forces
        const dampingFactor = PHYSICS.DAMPING * this.frictionCoefficient;

        for (const body of this.bodies) {
            if (this.gravityEnabled && this.gravityCoefficient > 0) {
                // Create a temporary state config change if gravity modified
                const ogGravX = PHYSICS.GRAVITY.x;
                const ogGravY = PHYSICS.GRAVITY.y;
                PHYSICS.GRAVITY.x *= this.gravityCoefficient;
                PHYSICS.GRAVITY.y *= this.gravityCoefficient;

                Forces.applyGravity(body);

                PHYSICS.GRAVITY.x = ogGravX;
                PHYSICS.GRAVITY.y = ogGravY;
            }

            if (this.pointerPos) {
                Forces.applyCursorRepulsion(body, this.pointerPos, this.repulsionStrength);
            }

            if (this.scrollVelocity && (this.scrollVelocity.x !== 0 || this.scrollVelocity.y !== 0)) {
                Forces.applyScrollForce(body, this.scrollVelocity);
            }
        }

        // Reset scroll velocity after applying
        if (this.scrollVelocity) {
            this.scrollVelocity.x *= 0.8;
            this.scrollVelocity.y *= 0.8;
            if (Math.abs(this.scrollVelocity.y) < 0.1) this.scrollVelocity.y = 0;
            if (Math.abs(this.scrollVelocity.x) < 0.1) this.scrollVelocity.x = 0;
        }

        // 2. Integrate (Update positions)
        for (const body of this.bodies) {
            body.velocity.mult(dampingFactor / PHYSICS.DAMPING); // apply custom friction modifier slightly hacky
            body.update(dt);
        }

        // 3. Collision Detection & Resolution
        // We use discrete collision detection in a nested loop (O(n^2))
        // Fine for small number of UI elements (<100)
        const manifolds = [];

        for (let i = 0; i < this.bodies.length; i++) {
            for (let j = i + 1; j < this.bodies.length; j++) {
                const manifold = Collision.checkAABB(this.bodies[i], this.bodies[j]);
                if (manifold) {
                    manifolds.push(manifold);
                }
            }
        }

        // Resolve all gathered manifolds
        for (const manifold of manifolds) {
            CollisionResolver.resolve(manifold);
        }

        // 4. Resolve World Boundaries
        this.resolveBoundaries();
    }

    resolveBoundaries() {
        for (const body of this.bodies) {
            if (body.isStatic || body.isDragged) continue;

            let bounced = false;

            // X axis bounds
            if (body.position.x < 0) {
                body.position.x = 0;
                body.velocity.x *= -PHYSICS.WALL_BOUNCE;
                bounced = true;
            } else if (body.position.x + body.width > this.bounds.width) {
                body.position.x = this.bounds.width - body.width;
                body.velocity.x *= -PHYSICS.WALL_BOUNCE;
                bounced = true;
            }

            // Y axis bounds (Top and Bottom)
            // It's inverted gravity, so elements float UP to y=0
            if (body.position.y < 0) {
                body.position.y = 0;
                body.velocity.y *= -PHYSICS.WALL_BOUNCE;
                bounced = true;
            } else if (body.position.y + body.height > this.bounds.height) {
                body.position.y = this.bounds.height - body.height;
                body.velocity.y *= -PHYSICS.WALL_BOUNCE;
                bounced = true;
            }

            if (bounced) {
                body.aabb.update(body.position.x, body.position.y);
            }
        }
    }

    getTotalKineticEnergy() {
        let energy = 0;
        for (const body of this.bodies) {
            const speedSq = body.velocity.magSq();
            energy += 0.5 * body.mass * speedSq;
        }
        return energy;
    }
}
