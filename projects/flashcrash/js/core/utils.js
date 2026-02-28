/**
 * Global Utility Functions
 */
const Utils = {
    formatPrice: (val, decimals = 2) => {
        return Number(val).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    },

    formatSize: (val, decimals = 4) => {
        return Number(val).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    },

    formatVolume: (val) => {
        if (val >= 1000000) return (val / 1000000).toFixed(2) + 'M';
        if (val >= 1000) return (val / 1000).toFixed(2) + 'K';
        return val.toFixed(2);
    },

    clamp: (val, min, max) => Math.max(min, Math.min(max, val)),

    mapRange: (val, inMin, inMax, outMin, outMax) => {
        return (val - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    },

    lerp: (start, end, amt) => {
        return (1 - amt) * start + amt * end;
    },

    getHslForImbalance: (imbalance, side) => {
        // Imbalance -1 to 1.
        // If side is BID, we want Green intensity based on +ve imbalance
        // If side is ASK, we want Red intensity based on -ve imbalance
        const intensity = Utils.clamp(Math.abs(imbalance), 0, 1) * 100;
        if (side === 'BID') return `hsl(158, 100%, ${30 + intensity * 0.4}%)`;
        return `hsl(346, 100%, ${30 + intensity * 0.4}%)`;
    },

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
    }
};

window.Utils = Utils;
