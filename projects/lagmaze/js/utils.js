/**
 * Utility Functions
 * Helper methods for math and collisions
 */

const Utils = {
    /**
     * Linear interpolation
     */
    lerp: (start, end, t) => {
        return start * (1 - t) + end * t;
    },

    /**
     * Clamp a value between min and max
     */
    clamp: (val, min, max) => {
        return Math.min(Math.max(val, min), max);
    },

    /**
     * Check collision between a circle and a rectangle
     * @param {Object} circle {x, y, r}
     * @param {Object} rect {x, y, w, h}
     */
    rectCircleColliding: (circle, rect) => {
        const distX = Math.abs(circle.x - rect.x - rect.w / 2);
        const distY = Math.abs(circle.y - rect.y - rect.h / 2);

        if (distX > (rect.w / 2 + circle.r)) { return false; }
        if (distY > (rect.h / 2 + circle.r)) { return false; }

        if (distX <= (rect.w / 2)) { return true; }
        if (distY <= (rect.h / 2)) { return true; }

        const dx = distX - rect.w / 2;
        const dy = distY - rect.h / 2;
        return (dx * dx + dy * dy <= (circle.r * circle.r));
    },

    /**
     * Convert milliseconds to MM:SS format
     */
    formatTime: (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },

    /**
     * Generate a random hex ID
     */
    randomId: () => {
        return Math.random().toString(16).slice(2);
    }
};
