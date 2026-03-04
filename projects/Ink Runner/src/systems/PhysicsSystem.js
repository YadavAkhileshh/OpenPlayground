/**
 * PhysicsSystem.js
 * Handles gravity, velocity, and AABB collision detection.
 */

import { Settings, Events } from '../core/Settings.js';
import { eventManager } from '../core/EventManager.js';

export class PhysicsSystem {
    constructor() {
        this.gravity = Settings.GRAVITY;
    }

    update(dt, entities) {
        entities.forEach(entity => {
            if (!entity.physicsEnabled) return;

            // Apply Gravity
            if (!entity.grounded) {
                entity.vy += this.gravity * dt;

                // Terminal velocity
                if (entity.vy > Settings.TERMINAL_VELOCITY) {
                    entity.vy = Settings.TERMINAL_VELOCITY;
                }
            }

            // Apply Velocity
            entity.x += entity.vx * dt;
            entity.y += entity.vy * dt;

            // Ground collision is handled specifically by checking against InkStrokes
            // Because our ground is not a flat line but a series of segments.
        });
    }

    /**
     * Check if a dynamic entity (player) is colliding with static geometry (strokes).
     * @param {Entity} entity
     * @param {Array<InkStroke>} strokes
     */
    checkGroundCollision(entity, strokes) {
        // Reset grounded state first
        let wasGrounded = entity.grounded;
        entity.grounded = false;

        // If moving up, we usually don't snap to ground (jumping)
        if (entity.vy < 0) return;

        // Simple AABB / Line segment collision
        // We only care if the bottom of the player passes through the top of a stroke

        const playerBottom = entity.y + entity.height;
        const playerRight = entity.x + entity.width;

        // We look for strokes that are roughly under the player
        for (const stroke of strokes) {
            if (stroke.x > playerRight || stroke.x + stroke.width < entity.x) {
                continue; // X overlap check falied
            }

            // Check Y overlap
            // We want to detect if player's feet are close to the stroke's Y level
            // and if they were previously above it (or close enough)

            const buffer = 20; // Tolerance
            if (playerBottom >= stroke.y - buffer && playerBottom <= stroke.y + buffer + (entity.vy * 0.05)) {
                // Snap to top
                entity.y = stroke.y - entity.height;
                entity.vy = 0;
                entity.grounded = true;

                if (!wasGrounded) {
                    eventManager.emit(Events.PLAYER_LAND);
                }
                return; // Found ground
            }
        }
    }
}
