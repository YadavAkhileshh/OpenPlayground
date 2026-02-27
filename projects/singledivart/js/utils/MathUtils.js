/**
 * MathUtils - Mathematical helpers for SingleDivArt
 * 
 * This utility library provides a collection of mathematical functions 
 * and algorithms specifically tailored for procedural art generation 
 * using CSS box-shadows. It includes interpolation, mapping, noise 
 * generation, and geometric projection utilities.
 * 
 * Version: 1.0.0
 * Author: Antigravity AI
 */

const MathUtils = (() => {

    /**
     * Linear interpolation (LERP)
     * Performs a linear interpolation between two values a and b based on t.
     * 
     * @param {number} a - The start value.
     * @param {number} b - The end value.
     * @param {number} t - The interpolation factor (typically 0.0 to 1.0).
     * @returns {number} The interpolated value.
     */
    const lerp = (a, b, t) => {
        return a + (b - a) * t;
    };

    /**
     * Range Mapping
     * Correlates a value from an input range [s1, e1] to an output range [s2, e2].
     * Extremely useful for mapping slider values to artistic parameters.
     * 
     * @param {number} val - The input value to map.
     * @param {number} s1 - Input range start.
     * @param {number} e1 - Input range end.
     * @param {number} s2 - Output range start.
     * @param {number} e2 - Output range end.
     * @returns {number} The mapped value in the new range.
     */
    const map = (val, s1, e1, s2, e2) => {
        return s2 + (e2 - s2) * (val - s1) / (e1 - s1);
    };

    /**
     * Value Clamping
     * Restricts a value within a specified minimum and maximum boundary.
     * 
     * @param {number} val - The value to clamp.
     * @param {number} min - The lower bound.
     * @param {number} max - The upper bound.
     * @returns {number} The clamped value.
     */
    const clamp = (val, min, max) => {
        return Math.min(Math.max(val, min), max);
    };

    /**
     * Pseudo-random Number Generator
     * Generates a deterministic pseudo-random number based on a seed.
     * Useful for reproducing certain patterns across renders.
     * 
     * @param {number} seed - The seed value for the sinusoidal generator.
     * @returns {number} A value between 0.0 and 1.0.
     */
    const pseudoRandom = (seed) => {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    };

    /**
     * 2D Optimized Noise
     * A high-performance bitwise noise generator. This is a simplified 
     * version of Perlin/Simplex noise designed for real-time CSS rendering.
     * 
     * @param {number} x - The X coordinate.
     * @param {number} y - The Y coordinate.
     * @returns {number} A noise value typically between -1.0 and 1.0.
     */
    const noise2D = (x, y) => {
        const n = x + y * 57;
        const res = (n << 13) ^ n;
        // Constants used here are standard for bit-level noise hashing
        return (1.0 - ((res * (res * res * 15731 + 789221) + 1376312589) & 0x7fffffff) / 1073741824.0);
    };

    /**
     * Circle Coordinate Generator
     * Calculates all integer pixel coordinates that lie within a circle 
     * of a given radius. Used for the 'Organic Cells' and 'Geometry' presets.
     * 
     * @param {number} radius - The radius of the circle in resolution units.
     * @param {number} centerX - The X offset from the origin.
     * @param {number} centerY - The Y offset from the origin.
     * @returns {Array<Object>} List of {x, y} coordinate objects.
     */
    const circleCoords = (radius, centerX, centerY) => {
        const coords = [];
        const r2 = radius * radius;
        for (let x = -radius; x <= radius; x++) {
            for (let y = -radius; y <= radius; y++) {
                if (x * x + y * y <= r2) {
                    coords.push({ x: centerX + x, y: centerY + y });
                }
            }
        }
        return coords;
    };

    /**
     * Smoothstep Interpolation
     * Performs smooth Hermite interpolation between 0 and 1. 
     * Often used for masking and soft transitions.
     * 
     * @param {number} edge0 - The start boundary.
     * @param {number} edge1 - The end boundary.
     * @param {number} x - The input value.
     * @returns {number} The interpolated value.
     */
    const smoothstep = (edge0, edge1, x) => {
        const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
        return t * t * (3 - 2 * t);
    };

    /**
     * Euclidean Distance
     * Calculates the straight-line distance between two points (x1, y1) and (x2, y2).
     * 
     * @param {number} x1 - Point 1 X.
     * @param {number} y1 - Point 1 Y.
     * @param {number} x2 - Point 2 X.
     * @param {number} y2 - Point 2 Y.
     * @returns {number} The distance value.
     */
    const distance = (x1, y1, x2, y2) => {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    };

    /**
     * Degree to Radian Conversion
     * 
     * @param {number} degrees - Angle in degrees.
     * @returns {number} Angle in radians.
     */
    const toRadians = (degrees) => {
        return degrees * Math.PI / 180;
    };

    return {
        lerp,
        map,
        clamp,
        pseudoRandom,
        noise2D,
        circleCoords,
        smoothstep,
        distance,
        toRadians
    };

})();

// Ensure global accessibility for the entire application
window.MathUtils = MathUtils;
