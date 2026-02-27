/**
 * @file constants.js
 * @description defines constants for the D2Q9 Lattice Boltzmann Method simulation.
 * 
 * The D2Q9 model uses a lattice with 9 discrete velocities at each node:
 * - 0: Center (stopped)
 * - 1-4: Cardinal directions (Right, Up, Left, Down)
 * - 5-8: Diagonal directions (NE, NW, SW, SE)
 */

/**
 * Total number of discrete velocities in D2Q9 model.
 * @constant {number}
 */
export const Q = 9;

/**
 * Lattice weights (w_i) for each direction.
 * These sum to 1.0.
 * - Center: 4/9
 * - Cardinals: 1/9
 * - Diagonals: 1/36
 * @constant {Float32Array}
 */
export const WEIGHTS = new Float32Array([
    4/9,  // 0: Center
    1/9,  // 1: Right
    1/9,  // 2: Up
    1/9,  // 3: Left
    1/9,  // 4: Down
    1/36, // 5: Top-Right
    1/36, // 6: Top-Left
    1/36, // 7: Bottom-Left
    1/36  // 8: Bottom-Right
]);

/**
 * Lattice discrete velocity vectors (e_x, e_y).
 * Indices correspond to the weights above.
 * @constant {Int32Array[]} - Array of [x, y] vectors
 */
export const LATTICE_VECTORS = [
    [0, 0],   // 0: Center
    [1, 0],   // 1: Right
    [0, 1],   // 2: Up
    [-1, 0],  // 3: Left
    [0, -1],  // 4: Down
    [1, 1],   // 5: Top-Right
    [-1, 1],  // 6: Top-Left
    [-1, -1], // 7: Bottom-Left
    [1, -1]   // 8: Bottom-Right
];

/**
 * Separate X component of lattice vectors for optimized access.
 * @constant {Int32Array}
 */
export const EX = new Int32Array([0, 1, 0, -1, 0, 1, -1, -1, 1]);

/**
 * Separate Y component of lattice vectors for optimized access.
 * @constant {Int32Array}
 */
export const EY = new Int32Array([0, 0, 1, 0, -1, 1, 1, -1, -1]);

/**
 * Opposite direction indices.
 * Used for bounce-back boundary conditions.
 * opposite[i] gives the index of the direction opposite to i.
 * 
 * 0 (Center) -> 0
 * 1 (Right)  -> 3 (Left)
 * 2 (Up)     -> 4 (Down)
 * 3 (Left)   -> 1 (Right)
 * 4 (Down)   -> 2 (Up)
 * 5 (NE)     -> 7 (SW)
 * 6 (NW)     -> 8 (SE)
 * 7 (SW)     -> 5 (NE)
 * 8 (SE)     -> 6 (NW)
 * @constant {Int32Array}
 */
export const OPPOSITE = new Int32Array([0, 3, 4, 1, 2, 7, 8, 5, 6]);

/**
 * Simulation physics defaults.
 * @constant {Object}
 */
export const DEFAULTS = {
    /** Initial density of the fluid */
    DENSITY: 1.0,
    /** Relaxation time (tau) related to viscosity */
    TAU: 0.6, // Viscosity = (tau - 0.5) / 3
    /** Grid resolution width */
    WIDTH: 300,
    /** Grid resolution height */
    HEIGHT: 150,
    /** Simulation steps per frame */
    STEPS_PER_FRAME: 10
};
