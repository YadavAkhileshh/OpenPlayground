// mat3.js
import { Vec2 } from './vec2.js';

export class Mat3 {
    constructor() {
        this.m = [
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        ];
    }

    identity() {
        this.m[0] = 1; this.m[1] = 0; this.m[2] = 0;
        this.m[3] = 0; this.m[4] = 1; this.m[5] = 0;
        this.m[6] = 0; this.m[7] = 0; this.m[8] = 1;
        return this;
    }

    translate(x, y) {
        this.m[2] += x;
        this.m[5] += y;
        return this;
    }

    rotate(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);

        const m00 = this.m[0];
        const m01 = this.m[1];
        const m10 = this.m[3];
        const m11 = this.m[4];

        this.m[0] = m00 * c - m01 * s;
        this.m[1] = m00 * s + m01 * c;
        this.m[3] = m10 * c - m11 * s;
        this.m[4] = m10 * s + m11 * c;

        return this;
    }

    scale(x, y) {
        this.m[0] *= x;
        this.m[4] *= y;
        return this;
    }

    multiplyVec2(v) {
        const x = v.x;
        const y = v.y;
        return new Vec2(
            this.m[0] * x + this.m[1] * y + this.m[2],
            this.m[3] * x + this.m[4] * y + this.m[5]
        );
    }

    clone() {
        const mat = new Mat3();
        mat.m = [...this.m];
        return mat;
    }

    getInverse() {
        const inv = new Mat3();
        const det = this.m[0] * (this.m[4] * this.m[8] - this.m[5] * this.m[7]) -
            this.m[1] * (this.m[3] * this.m[8] - this.m[5] * this.m[6]) +
            this.m[2] * (this.m[3] * this.m[7] - this.m[4] * this.m[6]);

        if (det === 0) return inv;
        const invDet = 1.0 / det;

        inv.m[0] = (this.m[4] * this.m[8] - this.m[5] * this.m[7]) * invDet;
        inv.m[1] = (this.m[2] * this.m[7] - this.m[1] * this.m[8]) * invDet;
        inv.m[2] = (this.m[1] * this.m[5] - this.m[2] * this.m[4]) * invDet;
        inv.m[3] = (this.m[5] * this.m[6] - this.m[3] * this.m[8]) * invDet;
        inv.m[4] = (this.m[0] * this.m[8] - this.m[2] * this.m[6]) * invDet;
        inv.m[5] = (this.m[2] * this.m[3] - this.m[0] * this.m[5]) * invDet;
        inv.m[6] = (this.m[3] * this.m[7] - this.m[4] * this.m[6]) * invDet;
        inv.m[7] = (this.m[1] * this.m[6] - this.m[0] * this.m[7]) * invDet;
        inv.m[8] = (this.m[0] * this.m[4] - this.m[1] * this.m[3]) * invDet;

        return inv;
    }
}
