/**
 * TitleBarCinema - Physics.js
 * 
 * ============================================================================
 * ARCHITECTURAL OVERVIEW
 * ============================================================================
 * The PhysicsEngine provides the mathematical backbone for physical 
 * interactions within the TitleBarCinema world. While the game world is 
 * conceptually 1D (a string of characters), the engine simulates a 2D 
 * kinematic environment to support vertical jumping and gravity.
 * 
 * Major responsibilities include:
 * 1. Gravity Simulation: Constant downward acceleration for all airborne entities.
 * 2. Ground Resolution: Ensuring entities do not fall through the floor level.
 * 3. 1D/2D Collision Detection: Determining when two entities occupy 
 *    overlapping character segments in the title bar.
 * 
 * ============================================================================
 * MODULE METADATA
 * ============================================================================
 * @project TitleBarCinema
 * @module Logic.Physics
 * @version 1.0.0
 * @stability Production-Ready
 * @author Antigravity
 */

import { CONFIG } from '../core/Constants.js';

/**
 * @class PhysicsEngine
 * @description Manages movement math and collision logic.
 */
export class PhysicsEngine {
    /**
     * @constructor
     * Loads physical constants from the global configuration.
     */
    constructor() {
        /** 
         * @private @type {number} 
         * Acceleration applied to vertical velocity every tick.
         */
        this.gravity = CONFIG.GRAVITY;
    }

    /**
     * Applies gravitational pull to an entity's vertical velocity.
     * Only affects entities that are not currently grounded.
     * @param {Entity} entity - The target object to affect.
     * @returns {void}
     */
    applyGravity(entity) {
        if (!entity.isGrounded) {
            entity.velocityY += this.gravity;
        }
    }

    /**
     * Validates an entity's vertical position against the ground level.
     * If the entity falls below the floor (y >= 0), it is "snapped" 
     * back to the surface and its velocity is neutralized.
     * @param {Entity} entity - The object to reconcile with the ground.
     * @returns {void}
     */
    resolveGround(entity) {
        // Conceptually, y=0 is the surface depth. 
        // Increasing y moves the object "down" below the screen.
        if (entity.y >= 0) {
            entity.y = 0;
            entity.velocityY = 0;
            entity.isGrounded = true;
        } else {
            // Negative Y means the entity is above the ground (airborne)
            entity.isGrounded = false;
        }
    }

    /**
     * Performs a bounding-box collision check between two entities.
     * Positions are rounded to the nearest integer to match the 
     * discrete nature of character indices in the tab title string.
     * 
     * @param {Entity} a - The first entity (typically the player).
     * @param {Entity} b - The second entity (typically an obstacle).
     * @returns {boolean} True if the boxes overlap.
     */
    checkCollision(a, b) {
        // Quantize coordinates to character-grid space
        const ax = Math.round(a.x);
        const bx = Math.round(b.x);

        // Vertical quantization (though usually entities are at y=0 or y=-1)
        const ay = Math.round(a.y);
        const by = Math.round(b.y);

        // Standard AABB (Axis-Aligned Bounding Box) collision logic
        // horizontal overlap: (left_a < right_b) AND (right_a > left_b)
        const hOverlap = (ax < bx + b.width) && (ax + a.width > bx);

        // vertical overlap: (top_a < bottom_b) AND (bottom_a > top_b)
        const vOverlap = (ay < by + b.height) && (ay + a.height > by);

        // Only collision if overlapping in both axes
        return hOverlap && vOverlap;
    }

    /**
     * Utility method to calculate the distance between two entities in 1D space.
     * @param {Entity} a - Origin.
     * @param {Entity} b - Target.
     * @returns {number} Distance in characters.
     */
    getDistance(a, b) {
        return Math.abs(a.x - b.x);
    }
}
