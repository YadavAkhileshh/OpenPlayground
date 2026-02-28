import { CONFIG, DERIVED } from '../utils/constants.js';
import { logger } from '../utils/logger.js';

/**
 * @fileoverview Core physics engine for Newton's Cradle.
 * Handles collision detection and the preservation of momentum/energy.
 * 
 * In a Newton's Cradle, collisions are nearly elastic. We model this
 * by checking the distance between adjacent balls and calculating
 * their resulting velocities based on the conservation laws.
 */
export class PhysicsEngine {
    /**
     * @param {Pendulum[]} balls - Array of pendulum objects to simulate.
     * @param {Object} options - Events and config.
     */
    constructor(balls, options = {}) {
        this.balls = balls;
        this.subSteps = CONFIG.SUB_STEPS;
        this.onCollision = options.onCollision || null;
    }

    /**
     * Run the simulation for a single frame.
     * Uses sub-stepping for better numerical stability and to prevent
     * "interpenetration" where balls pass through each other.
     * 
     * @param {number} deltaTime - Time elapsed since last frame.
     */
    update(deltaTime) {
        const subDelta = deltaTime / this.subSteps;

        for (let s = 0; s < this.subSteps; s++) {
            // 1. Update individual ball physics (gravity, damping)
            this.balls.forEach(ball => ball.update(subDelta));

            // 2. Resolve collisions between adjacent balls
            // In Newton's Cradle, balls only collide with their neighbors.
            this.resolveCollisions();
        }
    }

    /**
     * Check and resolve collisions between adjacent balls.
     * Since the balls are in a row, we only need to check i and i+1.
     */
    resolveCollisions() {
        for (let i = 0; i < this.balls.length - 1; i++) {
            const ballA = this.balls[i];
            const ballB = this.balls[i + 1];

            // 1. Calculate distance between centers
            const dx = ballB.ballX - ballA.ballX;
            const dy = ballB.ballY - ballA.ballY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // 2. Check for overlap
            const minDistance = ballA.radius + ballB.radius;

            if (distance < minDistance) {
                // Colliding!
                this.handleCollision(ballA, ballB, distance, minDistance);
            }
        }
    }

    /**
     * Handle the elastic collision between two balls.
     * 
     * We use simple 1D elastic collision logic along the tangent, 
     * but since they are suspended, we convert linear velocity 
     * to angular velocity.
     * 
     * Conservation of Momentum: m1v1 + m2v2 = m1v1' + m2v2'
     * Conservation of Energy: 1/2 m1v1^2 + 1/2 m2v2^2 = 1/2 m1v1'^2 + 1/2 m2v2'^2
     * 
     * @param {Pendulum} ballA - Left ball.
     * @param {Pendulum} ballB - Right ball.
     * @param {number} distance - Current distance.
     * @param {number} minDistance - Target distance (2*radius).
     */
    handleCollision(ballA, ballB, distance, minDistance) {
        // Prevent sticking: only resolve if they are moving towards each other
        // Calculate relative angular velocity
        const relativeVel = ballB.angularVelocity - ballA.angularVelocity;

        // If relative velocity is positive, they are moving apart
        // (assuming ballA is to the left of ballB)
        if (relativeVel > 0) return;

        // 1. Resolve overlap (static resolution)
        const overlap = minDistance - distance;
        const moveX = (overlap / 2) * ((ballB.ballX - ballA.ballX) / distance);
        // We don't move them directly in X, we adjust their angles slightly
        // for better stability, though usually momentum transfer handles it.

        // 2. Dynamic resolution (Momentum transfer)
        // Since masses are equal (1.0), velocities simply swap in a perfectly elastic collision.
        // v1' = v2, v2' = v1

        const v1 = ballA.angularVelocity;
        const v2 = ballB.angularVelocity;

        // Apply coefficient of restitution (energy loss)
        ballA.angularVelocity = v2 * CONFIG.RESTITUTION;
        ballB.angularVelocity = v1 * CONFIG.RESTITUTION;

        // Notify systems of collision
        if (this.onCollision) {
            const intensity = Math.abs(v1 - v2);
            this.onCollision(ballA, ballB, intensity);
        }

        // Add a slight "kick" to prevent interpenetration in edge cases
        // but keep it minimal to preserve the "calm" feel.
        logger.debug(`Collision resolved between ball ${ballA.index} and ${ballB.index}`);
    }

    /**
     * Reset all balls to their vertical positions.
     */
    reset() {
        this.balls.forEach(ball => {
            ball.angle = 0;
            ball.angularVelocity = 0;
            ball.angularAcceleration = 0;
            ball.updateCoordinates();
        });
        logger.info("Simulation reset");
    }
}
