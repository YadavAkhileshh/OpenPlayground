/**
 * LindenArboretum - Turtle Graphics Module
 * Holds the discrete drawing state for the renderer.
 * Keeps track of position, heading angle, thickness, and color depth.
 */

import { Vector2 } from '../math/vector2.js';

export class Turtle {
    constructor() {
        this.position = new Vector2(0, 0);
        this.angle = -Math.PI / 2; // Pointing upwards initially (-90 deg in canvas coords)

        // Rendering attributes
        this.thickness = 10.0;
        this.length = 20.0;

        // Depth tracks how many '[' pushes we've done, useful for color profiling
        this.depth = 0;

        // Optional wind force acting on this specific turtle segment
        this.windOffset = 0;
    }

    /**
     * Resets turtle to origin pointing up.
     * @param {number} x 
     * @param {number} y 
     */
    reset(x, y) {
        this.position.set(x, y);
        this.angle = -Math.PI / 2;
        this.thickness = 10.0;
        this.length = 20.0;
        this.depth = 0;
        this.windOffset = 0;
    }

    /**
     * Moves the turtle forward and returns the end position.
     * @returns {Vector2} The new position
     */
    forward() {
        // Calculate the translation vector
        const finalAngle = this.angle + this.windOffset;
        const dx = Math.cos(finalAngle) * this.length;
        const dy = Math.sin(finalAngle) * this.length;

        // Move turtle
        this.position.x += dx;
        this.position.y += dy;

        return this.position;
    }

    turnRight(amount) {
        this.angle += amount;
    }

    turnLeft(amount) {
        this.angle -= amount;
    }

    /**
     * Scales thickness for branches (thinner at tips).
     * @param {number} factor 
     */
    scaleThickness(factor = 0.8) {
        this.thickness *= factor;
        // Keep a minimum thickness so tips don't vanish
        if (this.thickness < 0.5) this.thickness = 0.5;
    }

    /**
     * Clones the current turtle state (used for pushing to stack).
     * @returns {Turtle}
     */
    clone() {
        const t = new Turtle();
        t.position.copy(this.position);
        t.angle = this.angle;
        t.thickness = this.thickness;
        t.length = this.length;
        t.depth = this.depth;
        t.windOffset = this.windOffset;
        return t;
    }
}
