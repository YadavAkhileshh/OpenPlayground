/**
 * Math utility functions.
 * @module Utils/Math
 */

export const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

export const mapRange = (value, low1, high1, low2, high2) => {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
};

export const lerp = (start, end, amt) => {
    return (1 - amt) * start + amt * end;
};
