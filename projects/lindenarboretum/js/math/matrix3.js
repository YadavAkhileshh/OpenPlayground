/**
 * LindenArboretum - Matrix3 Math Module
 * Used for maintaining the transformation stack during branch generation.
 * Handles translations, rotations, and scaling.
 */

export class Matrix3 {
    constructor() {
        // Initialize as Identity Matrix
        // Column-major format for easy float32array mapping if needed
        this.elements = [
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        ];
    }

    /**
     * Resets to Identity Matrix.
     * @returns {Matrix3}
     */
    identity() {
        const e = this.elements;
        e[0] = 1; e[3] = 0; e[6] = 0;
        e[1] = 0; e[4] = 1; e[7] = 0;
        e[2] = 0; e[5] = 0; e[8] = 1;
        return this;
    }

    /**
     * Copies values from another Matrix3.
     * @param {Matrix3} m 
     * @returns {Matrix3}
     */
    copy(m) {
        const e = this.elements;
        const me = m.elements;
        for (let i = 0; i < 9; i++) {
            e[i] = me[i];
        }
        return this;
    }

    /**
     * Clones this matrix.
     * @returns {Matrix3}
     */
    clone() {
        const m = new Matrix3();
        return m.copy(this);
    }

    /**
     * Multiplies this matrix by another. (this = this * m)
     * @param {Matrix3} m 
     * @returns {Matrix3}
     */
    multiply(m) {
        const a = this.elements;
        const b = m.elements;

        const a11 = a[0], a12 = a[3], a13 = a[6];
        const a21 = a[1], a22 = a[4], a23 = a[7];
        const a31 = a[2], a32 = a[5], a33 = a[8];

        const b11 = b[0], b12 = b[3], b13 = b[6];
        const b21 = b[1], b22 = b[4], b23 = b[7];
        const b31 = b[2], b32 = b[5], b33 = b[8];

        a[0] = a11 * b11 + a12 * b21 + a13 * b31;
        a[3] = a11 * b12 + a12 * b22 + a13 * b32;
        a[6] = a11 * b13 + a12 * b23 + a13 * b33;

        a[1] = a21 * b11 + a22 * b21 + a23 * b31;
        a[4] = a21 * b12 + a22 * b22 + a23 * b32;
        a[7] = a21 * b13 + a22 * b23 + a23 * b33;

        a[2] = a31 * b11 + a32 * b21 + a33 * b31;
        a[5] = a31 * b12 + a32 * b22 + a33 * b32;
        a[8] = a31 * b13 + a32 * b23 + a33 * b33;

        return this;
    }

    /**
     * Applies a translation to this matrix.
     * @param {number} x 
     * @param {number} y 
     * @returns {Matrix3}
     */
    translate(x, y) {
        const m = new Matrix3();
        m.elements[6] = x;
        m.elements[7] = y;
        return this.multiply(m);
    }

    /**
     * Applies a rotation to this matrix.
     * @param {number} theta - Angle in radians
     * @returns {Matrix3}
     */
    rotate(theta) {
        const cos = Math.cos(theta);
        const sin = Math.sin(theta);
        const m = new Matrix3();

        m.elements[0] = cos;
        m.elements[1] = sin;
        m.elements[3] = -sin;
        m.elements[4] = cos;

        return this.multiply(m);
    }

    /**
     * Transforms a Vector2 using this matrix.
     * @param {Vector2} v 
     * @returns {Vector2}
     */
    transformPoint(v) {
        const e = this.elements;
        const x = v.x;
        const y = v.y;
        v.x = e[0] * x + e[3] * y + e[6];
        v.y = e[1] * x + e[4] * y + e[7];
        return v;
    }
}
