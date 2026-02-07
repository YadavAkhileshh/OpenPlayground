/**
 * TitleBarCinema - Entity.js
 * 
 * ============================================================================
 * ARCHITECTURAL OVERVIEW
 * ============================================================================
 * The Entity class serves as the foundational blueprint for all simulated 
 * objects within the TitleBarCinema world. Whether it is the heroic 
 * stickman (the player) or a rogue bird (an obstacle), they all inherit 
 * the basic kinematic properties and rendering metadata defined here.
 * 
 * In a 1D ASCII engine, an entity's position is primarily defined by its 
 * 'x' coordinate (index in the title string). However, to support jumping 
 * and aerial maneuvers, a vertical 'y' coordinate is maintained and 
 * used to determine state-based sprite selection.
 * 
 * ============================================================================
 * MODULE METADATA
 * ============================================================================
 * @project TitleBarCinema
 * @module Logic.Entity
 * @version 1.0.0
 * @stability Production-Ready
 * @author Antigravity
 */

/**
 * @class Entity
 * @description Base class for actors and objects in the game world.
 */
export class Entity {
    /**
     * @constructor
     * @param {number} x - Initial horizontal position.
     * @param {number} y - Initial vertical position (0 is ground level).
     * @param {string} sprite - The initial ASCII character representing the entity.
     */
    constructor(x, y, sprite) {
        /** 
         * @public @type {number} 
         * Horizontal position in the character buffer.
         */
        this.x = x;

        /** 
         * @public @type {number} 
         * Vertical position. Values < 0 indicate the entity is in the air.
         */
        this.y = y;

        /** 
         * @public @type {string} 
         * Current ASCII character or emoji for rendering.
         */
        this.sprite = sprite;

        /** 
         * @public @type {number} 
         * Change in X position per tick.
         */
        this.velocityX = 0;

        /** 
         * @public @type {number} 
         * Change in Y position per tick (positive is downward).
         */
        this.velocityY = 0;

        /** 
         * @public @type {number} 
         * Conceptual width in ASCII characters for collision detection.
         */
        this.width = 1;

        /** 
         * @public @type {number} 
         * Conceptual height for collision detection.
         */
        this.height = 1;

        /** 
         * @public @type {boolean} 
         * Flag indicating if the entity is currently resting on the ground.
         */
        this.isGrounded = false;

        /** 
         * @public @type {boolean} 
         * Lifecycle flag. If false, the entity is considered 'dead' or destroyed.
         */
        this.isAlive = true;
    }

    /**
     * Updates the entity's position components based on current velocities.
     * This follows basic Euler integration for movement.
     * @returns {void}
     */
    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
    }

    /**
     * Resets the entity's state to a specific position and resets velocities.
     * Useful for respawning or resetting the game.
     * @param {number} x - Reset horizontal position.
     * @param {number} y - Reset vertical position.
     * @returns {void}
     */
    reset(x, y) {
        this.x = x;
        this.y = y;
        this.velocityX = 0;
        this.velocityY = 0;
        this.isAlive = true;
        this.isGrounded = true;
    }

    /**
     * Determines if the entity has moved outside the visible bounds of the viewport.
     * @param {number} viewportWidth - The total width of the animation area.
     * @returns {boolean}
     */
    isOffScreen(viewportWidth) {
        // Buffer of 1 width effectively ensures the character is fully out
        return this.x < -this.width || this.x > viewportWidth + this.width;
    }

    /**
     * Set the horizontal speed of the entity.
     * @param {number} speed - New velocity in X.
     */
    setSpeed(speed) {
        this.velocityX = speed;
    }
}
