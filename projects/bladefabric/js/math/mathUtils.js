// mathUtils.js
export const EPSILON = 1e-6;
export const EPSILON_SQ = EPSILON * EPSILON;
export const PI = Math.PI;
export const TWO_PI = Math.PI * 2;

export function clamp(val, min, max) {
    if (val < min) return min;
    if (val > max) return max;
    return val;
}

export function lerp(a, b, t) {
    return a + (b - a) * t;
}

export function sign(val) {
    return val < 0 ? -1 : 1;
}

export function sqr(val) {
    return val * val;
}

export function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

export function randomInt(min, max) {
    return Math.floor(randomRange(min, max));
}

export function approxEqual(a, b, epsilon = EPSILON) {
    return Math.abs(a - b) < epsilon;
}

export function degreesToRadians(deg) {
    return deg * (PI / 180);
}

export function radiansToDegrees(rad) {
    return rad * (180 / PI);
}
