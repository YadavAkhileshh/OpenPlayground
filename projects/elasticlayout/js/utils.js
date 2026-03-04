/**
 * Utility functions for random numbers, colors, and other helpers.
 */

export const randomRange = (min, max) => {
    return Math.random() * (max - min) + min;
};

export const randomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

export const randomColor = () => {
    const h = randomInt(200, 240); // Blueish range
    const s = randomInt(70, 100);
    const l = randomInt(50, 70);
    return `hsl(${h}, ${s}%, ${l}%)`;
};

export const clamp = (val, min, max) => {
    return Math.max(min, Math.min(max, val));
};

export const mapRange = (value, low1, high1, low2, high2) => {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
};
