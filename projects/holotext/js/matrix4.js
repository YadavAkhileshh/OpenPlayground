/**
 * Matrix4
 * A 4x4 Matrix class for 3D transformations.
 * Used for calculating perspective and view matrices manually if needed.
 */
class Matrix4 {
    constructor() {
        this.elements = new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    }

    /**
     * Sets the matrix to identity.
     * @returns {Matrix4} this
     */
    identity() {
        this.set(
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        );
        return this;
    }

    /**
     * Sets the matrix elements.
     */
    set(n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44) {
        const te = this.elements;
        te[0] = n11; te[4] = n12; te[8] = n13; te[12] = n14;
        te[1] = n21; te[5] = n22; te[9] = n23; te[13] = n24;
        te[2] = n31; te[6] = n32; te[10] = n33; te[14] = n34;
        te[3] = n41; te[7] = n42; te[11] = n43; te[15] = n44;
        return this;
    }

    /**
     * Creates a rotation matrix from Euler angles (XYZ order).
     * @param {number} x - Rotation around X axis in radians.
     * @param {number} y - Rotation around Y axis in radians.
     * @param {number} z - Rotation around Z axis in radians.
     * @returns {Matrix4} this
     */
    makeRotationFromEuler(x, y, z) {
        const te = this.elements;
        const c1 = Math.cos(x), s1 = Math.sin(x);
        const c2 = Math.cos(y), s2 = Math.sin(y);
        const c3 = Math.cos(z), s3 = Math.sin(z);

        // Standard rotation matrix construction
        te[0] = c2 * c3;
        te[4] = -c2 * s3;
        te[8] = s2;

        te[1] = c1 * s3 + c3 * s1 * s2;
        te[5] = c1 * c3 - s1 * s2 * s3;
        te[9] = -c2 * s1;

        te[2] = s1 * s3 - c1 * c3 * s2;
        te[6] = c3 * s1 + c1 * s2 * s3;
        te[10] = c1 * c2;

        // Bottom row identity
        te[3] = 0; te[7] = 0; te[11] = 0;
        te[12] = 0; te[13] = 0; te[14] = 0; te[15] = 1;

        return this;
    }
}
