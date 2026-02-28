/**
 * utils.js
 * Helper functions.
 */

const Utils = {
    /**
     * Clamps a value between min and max.
     */
    clamp: (val, min, max) => Math.min(Math.max(val, min), max),

    /**
     * Returns a random integer between min (inclusive) and max (inclusive).
     */
    randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,

    /**
     * Creates a 2D array of given rows and cols, initialized with 0.
     */
    create2DArray: (rows, cols) => {
        let arr = new Array(rows);
        for (let i = 0; i < rows; i++) {
            arr[i] = new Uint8Array(cols); // Optimization: using TypedArray for 0/1 states
        }
        return arr;
    },

    /**
     * Parses a hex color to RGB
     */
    hexToRgb: (hex) => {
        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
};
