/* js/utils/math.js */
export const MathUtils = {
    lerp: (a, b, t) => a + (b - a) * t,

    clamp: (val, min, max) => Math.min(Math.max(val, min), max),

    randRange: (min, max) => Math.random() * (max - min) + min,

    dist: (x1, y1, x2, y2) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2),

    // Normalize a vector {x, y}
    normalize: (vec) => {
        const mag = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
        if (mag === 0) return { x: 0, y: 0 };
        return { x: vec.x / mag, y: vec.y / mag };
    }
};
