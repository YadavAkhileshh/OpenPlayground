// utils.js

const Utils = {
    // Get random number between min and max
    random(min, max) {
        return Math.random() * (max - min) + min;
    },

    // Get random integer between min and max (inclusive)
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // Calculate distance between two points
    distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },

    // Normalize vector
    normalize(x, y) {
        const length = Math.sqrt(x * x + y * y);
        if (length === 0) return { x: 0, y: 0 };
        return { x: x / length, y: y / length };
    },

    // Limit vector magnitude
    limit(x, y, max) {
        const length = Math.sqrt(x * x + y * y);
        if (length > max) {
            const normalized = this.normalize(x, y);
            return { x: normalized.x * max, y: normalized.y * max };
        }
        return { x, y };
    },

    // Clamp value between min and max
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },

    // Format time in seconds
    formatTime(seconds) {
        return Math.floor(seconds) + 's';
    }
};