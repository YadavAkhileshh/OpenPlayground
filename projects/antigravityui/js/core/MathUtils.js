// js/core/MathUtils.js

export class MathUtils {
    /**
     * Clamps a value between a minimum and maximum
     */
    static clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    }

    /**
     * Linear interpolation
     */
    static lerp(start, end, amt) {
        return (1 - amt) * start + amt * end;
    }

    /**
     * Maps a value from one range to another
     */
    static map(val, inMin, inMax, outMin, outMax) {
        return outMin + (outMax - outMin) * ((val - inMin) / (inMax - inMin));
    }

    /**
     * Generates a random float between min and max
     */
    static random(min, max) {
        return Math.random() * (max - min) + min;
    }

    /**
     * Generates a random integer between min and max (inclusive)
     */
    static randomInt(min, max) {
        return Math.floor(MathUtils.random(min, max + 1));
    }

    /**
     * Calculates distance squared between two points
     */
    static distSq(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return dx * dx + dy * dy;
    }

    /**
     * Calculates distance between two points
     */
    static dist(x1, y1, x2, y2) {
        return Math.sqrt(MathUtils.distSq(x1, y1, x2, y2));
    }
}
