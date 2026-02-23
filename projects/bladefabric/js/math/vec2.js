// vec2.js
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

    mul(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }

    div(scalar) {
        if (scalar !== 0) {
            this.x /= scalar;
            this.y /= scalar;
        } else {
            this.x = 0;
            this.y = 0;
        }
        return this;
    }

    lengthSq() {
        return this.x * this.x + this.y * this.y;
    }

    length() {
        return Math.sqrt(this.lengthSq());
    }

    normalize() {
        const len = this.length();
        if (len > 0) {
            this.x /= len;
            this.y /= len;
        }
        return this;
    }

    dot(v) {
        return this.x * v.x + this.y * v.y;
    }

    cross(v) {
        return this.x * v.y - this.y * v.x;
    }

    crossScalar(s) {
        const x = this.x;
        this.x = s * this.y;
        this.y = -s * x;
        return this;
    }

    perp() {
        return new Vec2(-this.y, this.x);
    }

    distanceToSq(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        return dx * dx + dy * dy;
    }

    distanceTo(v) {
        return Math.sqrt(this.distanceToSq(v));
    }

    negate() {
        this.x = -this.x;
        this.y = -this.y;
        return this;
    }

    equals(v, epsilon = 1e-6) {
        return Math.abs(this.x - v.x) < epsilon && Math.abs(this.y - v.y) < epsilon;
    }

    static add(a, b) {
        return new Vec2(a.x + b.x, a.y + b.y);
    }

    static sub(a, b) {
        return new Vec2(a.x - b.x, a.y - b.y);
    }

    static mul(a, s) {
        return new Vec2(a.x * s, a.y * s);
    }

    static dot(a, b) {
        return a.x * b.x + a.y * b.y;
    }

    static cross(a, b) {
        return a.x * b.y - a.y * b.x;
    }

    static crossVecScalar(v, s) {
        return new Vec2(s * v.y, -s * v.x);
    }

    static crossScalarVec(s, v) {
        return new Vec2(-s * v.y, s * v.x);
    }

    static distance(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    static distanceSq(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return dx * dx + dy * dy;
    }

    static lerp(a, b, t) {
        return new Vec2(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
    }
}
