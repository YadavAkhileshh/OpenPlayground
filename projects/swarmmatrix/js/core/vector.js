/**
 * js/core/vector.js
 * High-performance 2D Vector class mutating in place to minimize GC.
 */

export class Vec2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }

    copy(v) {
        this.x = v.x;
        this.y = v.y;
        return this;
    }

    clone() {
        return new Vec2(this.x, this.y);
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

    magSq() {
        return this.x * this.x + this.y * this.y;
    }

    mag() {
        return Math.hypot(this.x, this.y);
    }

    normalize() {
        const m = this.mag();
        if (m !== 0 && m !== 1) {
            this.div(m);
        }
        return this;
    }

    limit(max) {
        const ms = this.magSq();
        if (ms > max * max) {
            this.normalize().mult(max);
        }
        return this;
    }

    heading() {
        return Math.atan2(this.y, this.x);
    }

    setHeading(a) {
        const m = this.mag();
        this.x = m * Math.cos(a);
        this.y = m * Math.sin(a);
        return this;
    }

    distSq(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        return dx * dx + dy * dy;
    }
}
