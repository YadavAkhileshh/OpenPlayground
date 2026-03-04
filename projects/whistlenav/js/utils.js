/**
 * UTILS
 * Helper functions and constants.
 */

const Utils = {
    lerp: (start, end, amt) => (1 - amt) * start + amt * end,

    clamp: (num, min, max) => Math.min(Math.max(num, min), max),

    map: (n, start1, stop1, start2, stop2) => {
        return (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
    }
};

window.Utils = Utils;
