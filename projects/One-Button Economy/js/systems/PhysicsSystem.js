/**
 * PhysicsSystem.js
 * 
 * Handles movement, velocity, acceleration, and friction for all entities.
 */

import { PHYSICS_CONFIG, GAME_CONFIG } from '../core/Constants.js';
import { Utils } from '../core/Utils.js';

export class PhysicsSystem {
    constructor() {
    }

    /**
     * Updates physics for all entities.
     * @param {Array} entities - List of game entities.
     * @param {number} dt - Delta time in seconds.
     */
    update(entities, dt) {
        entities.forEach(entity => {
            if (!entity.components.physics) return;

            this.applyPhysics(entity, dt);
            this.constrainToBounds(entity);
        });
    }

    applyPhysics(entity, dt) {
        const phys = entity.components.physics;

        // Apply acceleration to velocity
        phys.vx += phys.ax * dt;
        phys.vy += phys.ay * dt;

        // Reset acceleration (forces are applied per frame usually)
        phys.ax = 0;
        phys.ay = 0;

        // Apply Friction/Drag
        phys.vx *= PHYSICS_CONFIG.FRICTION;
        phys.vy *= PHYSICS_CONFIG.FRICTION;

        // Stop if velocity is very low
        if (Math.abs(phys.vx) < PHYSICS_CONFIG.MIN_VELOCITY) phys.vx = 0;
        if (Math.abs(phys.vy) < PHYSICS_CONFIG.MIN_VELOCITY) phys.vy = 0;

        // Update Position
        entity.x += phys.vx; // pixels per frame style, or phys.vx * dt if thinking in pixels/sec
        entity.y += phys.vy;
    }

    constrainToBounds(entity) {
        // Simple screen wrap or clamp
        // For this game, let's clamp to screen
        const padding = entity.size || 20;

        if (entity.x < padding) {
            entity.x = padding;
            entity.components.physics.vx *= -0.5; // Bounce slightly
        }
        if (entity.x > GAME_CONFIG.WIDTH - padding) {
            entity.x = GAME_CONFIG.WIDTH - padding;
            entity.components.physics.vx *= -0.5;
        }

        if (entity.y < padding) {
            entity.y = padding;
            entity.components.physics.vy *= -0.5;
        }
        if (entity.y > GAME_CONFIG.HEIGHT - padding) {
            entity.y = GAME_CONFIG.HEIGHT - padding;
            entity.components.physics.vy *= -0.5;
        }
    }

    /**
     * Applies a force to an entity.
     * @param {Entity} entity 
     * @param {number} fx - Force X
     * @param {number} fy - Force Y
     */
    applyForce(entity, fx, fy) {
        if (!entity.components.physics) return;

        // F = ma -> a = F/m (assuming mass is 1 for now)
        entity.components.physics.ax += fx;
        entity.components.physics.ay += fy;
    }

    /**
     * Applies an impulse (instant velocity change).
     * @param {Entity} entity 
     * @param {number} ix 
     * @param {number} iy 
     */
    applyImpulse(entity, ix, iy) {
        if (!entity.components.physics) return;

        entity.components.physics.vx += ix;
        entity.components.physics.vy += iy;
    }
}
