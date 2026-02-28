/**
 * js/core/utils.js
 * General utility functions.
 */

export const Utils = {
    // Generate a unique ID
    generateId: () => {
        return Math.random().toString(36).substr(2, 9);
    },

    // Debounce function calls
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function calls
    throttle: (func, limit) => {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Create a 2D Array using typed arrays for performance
    createTypedGrid: (width, height, Type = Float32Array) => {
        const grid = new Array(width);
        for (let i = 0; i < width; i++) {
            grid[i] = new Type(height);
        }
        return grid;
    },

    // Flattened 1D typed array for 2D grid representation (best performance)
    createFlatGrid: (width, height, Type = Float32Array) => {
        return new Type(width * height);
    }
};
