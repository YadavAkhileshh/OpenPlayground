/**
 * Core types and configuration constants for the GeneticForger engine.
 * Defines the shape of data structures used throughout the application.
 * @module Engine/Types
 */

/**
 * Represents a 2D point in normalized coordinate space.
 * @typedef {Object} Point
 * @property {number} x - X coordinate, normalized to 0-1 range.
 * @property {number} y - Y coordinate, normalized to 0-1 range.
 */

/**
 * Represents an RGBA color value.
 * @typedef {Object} Color
 * @property {number} r - Red component (0-255).
 * @property {number} g - Green component (0-255).
 * @property {number} b - Blue component (0-255).
 * @property {number} a - Alpha opacity/transparency (0-1).
 */

/**
 * Global configuration settings for the genetic algorithm.
 * These values control the initialization and mutation behavior.
 * @constant
 * @type {Object}
 */
export const CONFIG = {
    /** Number of polygons per genome. Higher means more detail but slower convergence. */
    POLYGON_COUNT: 50,

    /** Number of vertices per polygon. 3 = Triangle. */
    VERTEX_COUNT: 3,

    /** Internal resolution for fitness calculation. 
     *  Lower values are faster but less accurate.
     */
    CANVAS_SIZE: 400,

    /** Default mutation parameters. */
    MUTATION: {
        /** Probability that a mutation occurs. */
        RATE: 0.05,

        /** Maximum distance a vertex can shift in normalized space (0-1). */
        VERTEX_SHIFT: 0.1,

        /** Maximum change in color channel value (0-255). */
        COLOR_SHIFT: 20,

        /** Maximum change in opacity (0-1). */
        OPACITY_SHIFT: 0.1
    }
};
