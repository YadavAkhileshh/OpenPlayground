// mat2.js
import { Vec2 } from './vec2.js';

export class Mat2 {
    constructor(m00 = 1, m01 = 0, m10 = 0, m11 = 1) {
        this.m00 = m00;
        this.m01 = m01;
        this.m10 = m10;
        this.m11 = m11;
    }

    set(m00, m01, m10, m11) {
        this.m00 = m00;
        this.m01 = m01;
        this.m10 = m10;
        this.m11 = m11;
        return this;
    }

    setAngle(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        this.m00 = c;
        this.m01 = -s;
        this.m10 = s;
        this.m11 = c;
        return this;
    }

    multiplyVec2(v) {
        return new Vec2(
            this.m00 * v.x + this.m01 * v.y,
            this.m10 * v.x + this.m11 * v.y
        );
    }

    multiply(m) {
        const m00 = this.m00 * m.m00 + this.m01 * m.m10;
        const m01 = this.m00 * m.m01 + this.m01 * m.m11;
        const m10 = this.m10 * m.m00 + this.m11 * m.m10;
        const m11 = this.m10 * m.m01 + this.m11 * m.m11;
        this.m00 = m00;
        this.m01 = m01;
        this.m10 = m10;
        this.m11 = m11;
        return this;
    }

    transpose() {
        const m01 = this.m01;
        this.m01 = this.m10;
        this.m10 = m01;
        return this;
    }

    getInverse() {
        const det = this.m00 * this.m11 - this.m01 * this.m10;
        if (det === 0) return new Mat2(0, 0, 0, 0);
        const invDet = 1.0 / det;
        return new Mat2(
            this.m11 * invDet,
            -this.m01 * invDet,
            -this.m10 * invDet,
            this.m00 * invDet
        );
    }

    clone() {
        return new Mat2(this.m00, this.m01, this.m10, this.m11);
    }
}
