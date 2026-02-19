export class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }

    clone() {
        return new Vector2(this.x, this.y);
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

    mult(s) {
        this.x *= s;
        this.y *= s;
        return this;
    }

    div(s) {
        if (s !== 0) {
            this.x /= s;
            this.y /= s;
        }
        return this;
    }

    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    magSq() {
        return this.x * this.x + this.y * this.y;
    }

    normalize() {
        const m = this.mag();
        if (m > 0) {
            this.div(m);
        }
        return this;
    }

    dist(v) {
        return Math.sqrt(this.distSq(v));
    }

    distSq(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        return dx * dx + dy * dy;
    }

    dot(v) {
        return this.x * v.x + this.y * v.y;
    }

    static add(v1, v2) {
        return new Vector2(v1.x + v1.y, v2.x + v2.y);
    }

    static sub(v1, v2) {
        return new Vector2(v1.x - v2.x, v1.y - v2.y);
    }
}
