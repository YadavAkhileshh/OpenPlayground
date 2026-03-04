/**
 * Vector3 — Immutable-style 3D vector utility class.
 * All mutating methods return `this` for chaining.
 */
class Vector3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    set(x, y, z) {
        this.x = x; this.y = y; this.z = z;
        return this;
    }

    copy(v) {
        this.x = v.x; this.y = v.y; this.z = v.z;
        return this;
    }

    clone() {
        return new Vector3(this.x, this.y, this.z);
    }

    add(v) {
        this.x += v.x; this.y += v.y; this.z += v.z;
        return this;
    }

    addScaledVector(v, s) {
        this.x += v.x * s; this.y += v.y * s; this.z += v.z * s;
        return this;
    }

    sub(v) {
        this.x -= v.x; this.y -= v.y; this.z -= v.z;
        return this;
    }

    multiplyScalar(s) {
        this.x *= s; this.y *= s; this.z *= s;
        return this;
    }

    divideScalar(s) {
        if (s !== 0) { this.x /= s; this.y /= s; this.z /= s; }
        return this;
    }

    lengthSq() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    length() {
        return Math.sqrt(this.lengthSq());
    }

    normalize() {
        const l = this.length();
        if (l > 1e-8) this.divideScalar(l);
        return this;
    }

    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    /** Returns a NEW Vector3 — cross product of this × v */
    cross(v) {
        return new Vector3(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x
        );
    }

    /** In-place cross product: this = this × v */
    crossSelf(v) {
        const ax = this.x, ay = this.y, az = this.z;
        this.x = ay * v.z - az * v.y;
        this.y = az * v.x - ax * v.z;
        this.z = ax * v.y - ay * v.x;
        return this;
    }

    distanceTo(v) {
        return Math.sqrt(this.distanceToSq(v));
    }

    distanceToSq(v) {
        const dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;
        return dx * dx + dy * dy + dz * dz;
    }

    lerp(v, t) {
        this.x += (v.x - this.x) * t;
        this.y += (v.y - this.y) * t;
        this.z += (v.z - this.z) * t;
        return this;
    }

    negate() {
        this.x = -this.x; this.y = -this.y; this.z = -this.z;
        return this;
    }

    reflect(normal) {
        // r = d - 2(d.n)n
        const d = this.dot(normal) * 2;
        this.x -= d * normal.x;
        this.y -= d * normal.y;
        this.z -= d * normal.z;
        return this;
    }

    toArray() {
        return [this.x, this.y, this.z];
    }

    fromArray(arr, offset = 0) {
        this.x = arr[offset];
        this.y = arr[offset + 1];
        this.z = arr[offset + 2];
        return this;
    }

    equals(v, eps = 1e-6) {
        return Math.abs(this.x - v.x) < eps &&
            Math.abs(this.y - v.y) < eps &&
            Math.abs(this.z - v.z) < eps;
    }

    toString() {
        return `(${this.x.toFixed(2)}, ${this.y.toFixed(2)}, ${this.z.toFixed(2)})`;
    }
}
