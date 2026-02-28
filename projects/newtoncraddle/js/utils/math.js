/**
 * @fileoverview Utility functions for vacuum-precision physics calculations.
 * This module provides mathematical constants and helper methods for 
 * pendulum dynamics and collision detection.
 * 
 * Newton's Cradle requires precise momentum transfer which depends on
 * accurate floating-point arithmetic and stable integration methods.
 */

export const MathUtils = {
    /**
     * Clamps a value between a minimum and maximum range.
     * Useful for preventing pendulum angles from exceeding physical limits if necessary.
     * 
     * @param {number} value - The value to clamp.
     * @param {number} min - The lower bound.
     * @param {number} max - The upper bound.
     * @returns {number} The clamped value.
     */
    clamp: (value, min, max) => Math.min(Math.max(value, min), max),

    /**
     * Linear interpolation between two values.
     * Can be used for smoothing visual transitions or damping.
     * 
     * @param {number} start - The starting value.
     * @param {number} end - The ending value.
     * @param {number} t - The interpolation factor (0 to 1).
     * @returns {number} The interpolated value.
     */
    lerp: (start, end, t) => start * (1 - t) + end * t,

    /**
     * Converts degrees to radians.
     * Physics calculations typically use radians for angular velocity.
     * 
     * @param {number} degrees - The angle in degrees.
     * @returns {number} The angle in radians.
     */
    degreesToRadians: (degrees) => (degrees * Math.PI) / 180,

    /**
     * Converts radians to degrees.
     * Might be used for UI labels or debugging.
     * 
     * @param {number} radians - The angle in radians.
     * @returns {number} The angle in degrees.
     */
    radiansToDegrees: (radians) => (radians * 180) / Math.PI,

    /**
     * Calculates the distance between two points (x1, y1) and (x2, y2).
     * Standard Euclidean distance formula.
     * 
     * @param {number} x1 - X coordinate of point 1.
     * @param {number} y1 - Y coordinate of point 1.
     * @param {number} x2 - X coordinate of point 2.
     * @param {number} y2 - Y coordinate of point 2.
     * @returns {number} The distance.
     */
    getDistance: (x1, y1, x2, y2) => {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },

    /**
     * Normalizes an angle to be within [-PI, PI].
     * Prevents angular drift over time.
     * 
     * @param {number} angle - The angle in radians.
     * @returns {number} The normalized angle.
     */
    normalizeAngle: (angle) => {
        while (angle > Math.PI) angle -= 2 * Math.PI;
        while (angle < -Math.PI) angle += 2 * Math.PI;
        return angle;
    }
};

/**
 * Historical Context:
 * The mathematics of the Newtons's Cradle (also known as Executive Ball Clicker)
 * was first described by Christiaan Huygens in the 17th century.
 * It demonstrates conservation of momentum and energy.
 */
