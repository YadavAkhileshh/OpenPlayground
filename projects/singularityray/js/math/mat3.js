/**
 * SingularityRay JS - Math - Mat3
 * 3x3 Matrix, primarily used for rotation and normal transformations
 * Column-major layout internally for standard graphics compatibility
 */

export class Mat3 {
    constructor() {
        // Identity matrix by default
        this.elements = [
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        ];
    }

    /**
     * Set to identity
     * @returns {Mat3} this
     */
    identity() {
        const e = this.elements;
        e[0] = 1; e[3] = 0; e[6] = 0;
        e[1] = 0; e[4] = 1; e[7] = 0;
        e[2] = 0; e[5] = 0; e[8] = 1;
        return this;
    }

    /**
     * Multiply another Mat3 (this = this * m)
     * @param {Mat3} m
     * @returns {Mat3} this
     */
    multiply(m) {
        return this.multiplyMatrices(this, m);
    }

    /**
     * Multiply two matrices and store in this 
     * @param {Mat3} a
     * @param {Mat3} b
     * @returns {Mat3} this
     */
    multiplyMatrices(a, b) {
        const ae = a.elements;
        const be = b.elements;
        const te = this.elements;

        const a11 = ae[0], a12 = ae[3], a13 = ae[6];
        const a21 = ae[1], a22 = ae[4], a23 = ae[7];
        const a31 = ae[2], a32 = ae[5], a33 = ae[8];

        const b11 = be[0], b12 = be[3], b13 = be[6];
        const b21 = be[1], b22 = be[4], b23 = be[7];
        const b31 = be[2], b32 = be[5], b33 = be[8];

        te[0] = a11 * b11 + a12 * b21 + a13 * b31;
        te[3] = a11 * b12 + a12 * b22 + a13 * b32;
        te[6] = a11 * b13 + a12 * b23 + a13 * b33;

        te[1] = a21 * b11 + a22 * b21 + a23 * b31;
        te[4] = a21 * b12 + a22 * b22 + a23 * b32;
        te[7] = a21 * b13 + a22 * b23 + a23 * b33;

        te[2] = a31 * b11 + a32 * b21 + a33 * b31;
        te[5] = a31 * b12 + a32 * b22 + a33 * b32;
        te[8] = a31 * b13 + a32 * b23 + a33 * b33;

        return this;
    }

    /**
     * Create rotation matrix from angle around X axis
     * @param {number} theta
     * @returns {Mat3} this
     */
    makeRotationX(theta) {
        const c = Math.cos(theta);
        const s = Math.sin(theta);
        const e = this.elements;

        e[0] = 1; e[3] = 0; e[6] = 0;
        e[1] = 0; e[4] = c; e[7] = -s;
        e[2] = 0; e[5] = s; e[8] = c;

        return this;
    }

    /**
     * Create rotation matrix from angle around Y axis
     * @param {number} theta
     * @returns {Mat3} this
     */
    makeRotationY(theta) {
        const c = Math.cos(theta);
        const s = Math.sin(theta);
        const e = this.elements;

        e[0] = c; e[3] = 0; e[6] = s;
        e[1] = 0; e[4] = 1; e[7] = 0;
        e[2] = -s; e[5] = 0; e[8] = c;

        return this;
    }

    /**
     * Create rotation matrix from angle around Z axis
     * @param {number} theta
     * @returns {Mat3} this
     */
    makeRotationZ(theta) {
        const c = Math.cos(theta);
        const s = Math.sin(theta);
        const e = this.elements;

        e[0] = c; e[3] = -s; e[6] = 0;
        e[1] = s; e[4] = c; e[7] = 0;
        e[2] = 0; e[5] = 0; e[8] = 1;

        return this;
    }
}
