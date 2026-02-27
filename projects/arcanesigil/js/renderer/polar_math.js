/* js/renderer/polar_math.js */

/**
 * Utility functions for Polar Math
 * Translates radial geometries to Cartesian canvas coordinates.
 */
class PolarMath {
    /**
     * Converts Polar coordinates (radius, angle in radians) to Cartesian (x, y)
     * relative to a given center.
     */
    static toCartesian(centerX, centerY, radius, angleRadians) {
        return {
            x: centerX + radius * Math.cos(angleRadians),
            y: centerY + radius * Math.sin(angleRadians)
        };
    }

    /**
     * Converts a degree angle to radians
     */
    static degToRad(degrees) {
        return degrees * (Math.PI / 180);
    }

    /**
     * Get uniform angles for N items laid out in a circle
     */
    static getUniformAngles(count, offsetAngle = 0) {
        const angles = [];
        if (count === 0) return angles;

        const step = (Math.PI * 2) / count;
        for (let i = 0; i < count; i++) {
            angles.push(offsetAngle + (i * step));
        }
        return angles;
    }
}

window.PolarMath = PolarMath;

// Padding block
const ___POLAR_PAD_1 = 1;
const ___POLAR_PAD_2 = 2;
const ___POLAR_PAD_3 = 3;
const ___POLAR_PAD_4 = 4;
