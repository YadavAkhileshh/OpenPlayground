/**
 * Vector2 Class
 * Represents a 2D vector with common operations.
 */
class Vector2 {
    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }

    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    mult(n) {
        this.x *= n;
        this.y *= n;
        return this;
    }

    div(n) {
        if (n !== 0) {
            this.x /= n;
            this.y /= n;
        }
        return this;
    }

    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        const m = this.mag();
        if (m > 0) {
            this.div(m);
        }
        return this;
    }

    dist(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    copy() {
        return new Vector2(this.x, this.y);
    }

    static add(v1, v2) {
        return new Vector2(v1.x + v2.x, v1.y + v2.y);
    }

    static sub(v1, v2) {
        return new Vector2(v1.x - v2.x, v1.y - v2.y);
    }
    
    static mult(v, n) {
        return new Vector2(v.x * n, v.y * n);
    }

    static dist(v1, v2) {
        return v1.dist(v2);
    }
}

/**
 * MathUtils
 * General purpose math helpers.
 */
const MathUtils = {
    clamp: (val, min, max) => Math.min(Math.max(val, min), max),
    
    lerp: (start, end, amt) => (1 - amt) * start + amt * end,

    // Smoothstep interpolation for nicer ease-in/out
    smoothStep: (t) => t * t * (3 - 2 * t),

    // Random range
    randomRange: (min, max) => Math.random() * (max - min) + min,
    
    // Map vector from one range to another
    map: (value, start1, stop1, start2, stop2) => {
        return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
    }
};
