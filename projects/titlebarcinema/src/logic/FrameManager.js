/**
 * TitleBarCinema - FrameManager.js
 * 
 * ============================================================================
 * ARCHITECTURAL OVERVIEW
 * ============================================================================
 * The FrameManager module is responsible for the "Animation State Machine" 
 * of the game. Its role is to select the most appropriate ASCII character 
 * (the 'sprite') for an entity based on its current physical state and 
 * progression in the timeline.
 * 
 * For example:
 * - If the player is on the ground, it cycles through a 'Run' sequence.
 * - If the player has upward velocity, it displays a 'Jump' sprite.
 * - If the player has downward velocity, it displays a 'Fall' sprite.
 * - If the player has collided, it displays a 'Crash' sprite.
 * 
 * This logic ensures that despite the limited 1-character resolution of 
 * the title bar, the character's movement feels expressive and reactive.
 * 
 * ============================================================================
 * MODULE METADATA
 * ============================================================================
 * @project TitleBarCinema
 * @module Logic.FrameManager
 * @version 1.0.0
 * @author Antigravity
 */

import { SPRITES } from '../core/Constants.js';

/**
 * @class FrameManager
 * @description Manages animation frame cycling and state-based sprite selection.
 */
export class FrameManager {
    /**
     * @constructor
     * Initializes the animation counters and speed settings.
     */
    constructor() {
        /** 
         * @private @type {number} 
         * Monotonic counter of game ticks since last reset.
         */
        this.frameCounter = 0;

        /** 
         * @private @type {number} 
         * Determines how many game ticks pass between animation frame changes.
         * Lower values result in "faster" running animations.
         */
        this.animationSpeed = 4;
    }

    /**
     * Determines the correct ASCII sprite for a player entity based on its state.
     * This handles transitions between running, jumping, falling, and death.
     * @param {Entity} player - The player entity to analyze.
     * @returns {string} The character/emoji to be rendered this tick.
     */
    getPlayerSprite(player) {
        // State 1: Death/Collision
        if (!player.isAlive) {
            return SPRITES.CRASH;
        }

        // State 2: Airborne (Jumping or Falling)
        if (!player.isGrounded) {
            // Check vertical velocity sign to determine arc position
            return player.velocityY < 0 ? SPRITES.JUMP : SPRITES.FALL;
        }

        // State 3: Grounded (Running)
        // We use modular math to cycle through the RUN sprite array
        const frameIndex = Math.floor(this.frameCounter / this.animationSpeed) % SPRITES.RUN.length;
        return SPRITES.RUN[frameIndex];
    }

    /**
     * Determines the sprite for an obstacle.
     * Obstacles are typically static characters, but this allows for 
     * future expansion into animated obstacles.
     * @param {Entity} obstacle - The target obstacle entity.
     * @returns {string} The ASCII sprite.
     */
    getObstacleSprite(obstacle) {
        // Fallback to BARRIER if no specific sprite is set
        return obstacle.sprite || SPRITES.BARRIER;
    }

    /**
     * Advances the internal frame counter by one tick.
     * Should be called exactly once per engine heartbeat.
     * @returns {void}
     */
    update() {
        this.frameCounter++;
    }

    /**
     * Resets the animation timer to zero.
     * Useful for restarting the game to ensure animation starts at frame 0.
     * @returns {void}
     */
    reset() {
        this.frameCounter = 0;
    }

    /**
     * Dynamically adjusts the running animation speed.
     * @param {number} newSpeed - Ticks per frame (lower is faster).
     */
    setAnimationSpeed(newSpeed) {
        this.animationSpeed = Math.max(1, newSpeed);
    }
}
