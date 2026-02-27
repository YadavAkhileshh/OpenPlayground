export function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

export function rectIntersect(r1, r2) {
    return !(r2.left > r1.right ||
        r2.right < r1.left ||
        r2.top > r1.bottom ||
        r2.bottom < r1.top);
}
