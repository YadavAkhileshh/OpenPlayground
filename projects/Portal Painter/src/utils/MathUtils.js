export class MathUtils {
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    static lerp(start, end, t) {
        return start * (1 - t) + end * t;
    }

    static randRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    static distSq(x1, y1, x2, y2) {
        const dx = x1 - x2;
        const dy = y1 - y2;
        return dx * dx + dy * dy;
    }
}
