/**
 * @file matrix4.js
 * @description Represents a 4x4 Matrix for 4D transformations.
 * Handles rotations in 6 planes: XY, XZ, XW, YZ, YW, ZW.
 */

import { Vector4 } from './vector4.js';

export class Matrix4 {
    /**
     * Creates a new 4x4 Matrix. Defaults to Identity.
     * Data is stored in row-major order [row][col] or flat array for WebGL (but here we use JS arrays).
     * We will use a flat array of 16 elements.
     */
    constructor() {
        this.elements = new Float32Array(16);
        this.identity();
    }

    /**
     * Sets the matrix to Identity.
     */
    identity() {
        this.elements.fill(0);
        this.elements[0] = 1;
        this.elements[5] = 1;
        this.elements[10] = 1;
        this.elements[15] = 1;
    }

    /**
     * Multiplies this matrix by another Matrix4.
     * @param {Matrix4} m - The multiplier matrix
     * @returns {Matrix4} New Matrix4 result
     */
    multiply(m) {
        const result = new Matrix4();
        const a = this.elements;
        const b = m.elements;
        const out = result.elements;

        // Unrolled loop for performance (row-major multiplication)
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                let sum = 0;
                for (let k = 0; k < 4; k++) {
                    sum += a[row * 4 + k] * b[k * 4 + col];
                }
                out[row * 4 + col] = sum;
            }
        }
        return result;
    }

    /**
     * Multiplies a Vector4 by this matrix.
     * @param {Vector4} v - The vector to transform
     * @returns {Vector4} Transformed Vector4
     */
    multiplyVector(v) {
        const e = this.elements;
        const x = v.x, y = v.y, z = v.z, w = v.w;

        return new Vector4(
            e[0] * x + e[1] * y + e[2] * z + e[3] * w,
            e[4] * x + e[5] * y + e[6] * z + e[7] * w,
            e[8] * x + e[9] * y + e[10] * z + e[11] * w,
            e[12] * x + e[13] * y + e[14] * z + e[15] * w
        );
    }

    // --- ROTATION MATRICES (4D has 6 planes of rotation) ---

    /**
     * Creates a rotation matrix for the XY plane (rotates around Z and W).
     * @param {number} angle - Angle in radians
     * @returns {Matrix4} Rotation Matrix
     */
    static rotationXY(angle) {
        const m = new Matrix4();
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        m.elements[0] = c; m.elements[1] = -s;
        m.elements[4] = s; m.elements[5] = c;
        return m;
    }

    /**
     * Creates a rotation matrix for the XZ plane.
     */
    static rotationXZ(angle) {
        const m = new Matrix4();
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        m.elements[0] = c; m.elements[2] = -s;
        m.elements[8] = s; m.elements[10] = c;
        return m;
    }

    /**
     * Creates a rotation matrix for the XW plane.
     */
    static rotationXW(angle) {
        const m = new Matrix4();
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        m.elements[0] = c; m.elements[3] = -s;
        m.elements[12] = s; m.elements[15] = c;
        return m;
    }

    /**
     * Creates a rotation matrix for the YZ plane.
     */
    static rotationYZ(angle) {
        const m = new Matrix4();
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        m.elements[5] = c; m.elements[6] = -s;
        m.elements[9] = s; m.elements[10] = c;
        return m;
    }

    /**
     * Creates a rotation matrix for the YW plane.
     */
    static rotationYW(angle) {
        const m = new Matrix4();
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        m.elements[5] = c; m.elements[7] = -s;
        m.elements[13] = s; m.elements[15] = c;
        return m;
    }

    /**
     * Creates a rotation matrix for the ZW plane.
     */
    static rotationZW(angle) {
        const m = new Matrix4();
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        m.elements[10] = c; m.elements[11] = -s;
        m.elements[14] = s; m.elements[15] = c;
        return m;
    }

    // --- ADVANCED MATRIX OPERATIONS ---

    /**
     * Transposes the matrix (swaps rows and columns).
     * @returns {Matrix4} The transposed matrix.
     */
    transpose() {
        const result = new Matrix4();
        const m = this.elements;
        const r = result.elements;

        r[0] = m[0]; r[1] = m[4]; r[2] = m[8]; r[3] = m[12];
        r[4] = m[1]; r[5] = m[5]; r[6] = m[9]; r[7] = m[13];
        r[8] = m[2]; r[9] = m[6]; r[10] = m[10]; r[11] = m[14];
        r[12] = m[3]; r[13] = m[7]; r[14] = m[11]; r[15] = m[15];

        return result;
    }

    /**
     * Calculates the determinant of the 4x4 matrix.
     * Essential for finding the inverse.
     * @returns {number} The determinant.
     */
    determinant() {
        const m = this.elements;
        const m00 = m[0], m01 = m[1], m02 = m[2], m03 = m[3];
        const m10 = m[4], m11 = m[5], m12 = m[6], m13 = m[7];
        const m20 = m[8], m21 = m[9], m22 = m[10], m23 = m[11];
        const m30 = m[12], m31 = m[13], m32 = m[14], m33 = m[15];

        const b00 = m00 * m11 - m01 * m10;
        const b01 = m00 * m12 - m02 * m10;
        const b02 = m00 * m13 - m03 * m10;
        const b03 = m01 * m12 - m02 * m11;
        const b04 = m01 * m13 - m03 * m11;
        const b05 = m02 * m13 - m03 * m12;
        const b06 = m20 * m31 - m21 * m30;
        const b07 = m20 * m32 - m22 * m30;
        const b08 = m20 * m33 - m23 * m30;
        const b09 = m21 * m32 - m22 * m31;
        const b10 = m21 * m33 - m23 * m31;
        const b11 = m22 * m33 - m23 * m32;

        return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    }

    /**
     * Inverts the matrix.
     * @returns {Matrix4} The inverted matrix, or Identity if singular.
     */
    invert() {
        const m = this.elements;
        const m00 = m[0], m01 = m[1], m02 = m[2], m03 = m[3];
        const m10 = m[4], m11 = m[5], m12 = m[6], m13 = m[7];
        const m20 = m[8], m21 = m[9], m22 = m[10], m23 = m[11];
        const m30 = m[12], m31 = m[13], m32 = m[14], m33 = m[15];

        const b00 = m00 * m11 - m01 * m10;
        const b01 = m00 * m12 - m02 * m10;
        const b02 = m00 * m13 - m03 * m10;
        const b03 = m01 * m12 - m02 * m11;
        const b04 = m01 * m13 - m03 * m11;
        const b05 = m02 * m13 - m03 * m12;
        const b06 = m20 * m31 - m21 * m30;
        const b07 = m20 * m32 - m22 * m30;
        const b08 = m20 * m33 - m23 * m30;
        const b09 = m21 * m32 - m22 * m31;
        const b10 = m21 * m33 - m23 * m31;
        const b11 = m22 * m33 - m23 * m32;

        const det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

        if (det === 0) {
            console.warn("Matrix4.invert: Determinant is zero. Returning Identity.");
            return new Matrix4();
        }

        const invDet = 1.0 / det;
        const result = new Matrix4();
        const r = result.elements;

        r[0] = (m11 * b11 - m12 * b10 + m13 * b09) * invDet;
        r[1] = (-m01 * b11 + m02 * b10 - m03 * b09) * invDet;
        r[2] = (m31 * b05 - m32 * b04 + m33 * b03) * invDet;
        r[3] = (-m21 * b05 + m22 * b04 - m23 * b03) * invDet;
        r[4] = (-m10 * b11 + m12 * b08 - m13 * b07) * invDet;
        r[5] = (m00 * b11 - m02 * b08 + m03 * b07) * invDet;
        r[6] = (-m30 * b05 + m32 * b02 - m33 * b01) * invDet;
        r[7] = (m20 * b05 - m22 * b02 + m23 * b01) * invDet;
        r[8] = (m10 * b10 - m11 * b08 + m13 * b06) * invDet;
        r[9] = (-m00 * b10 + m01 * b08 - m03 * b06) * invDet;
        r[10] = (m30 * b04 - m31 * b02 + m33 * b00) * invDet;
        r[11] = (-m20 * b04 + m21 * b02 - m23 * b00) * invDet;
        r[12] = (-m10 * b09 + m11 * b07 - m12 * b06) * invDet;
        r[13] = (m00 * b09 - m01 * b07 + m02 * b06) * invDet;
        r[14] = (-m30 * b03 + m31 * b01 - m32 * b00) * invDet;
        r[15] = (m20 * b03 - m21 * b01 + m22 * b00) * invDet;

        return result;
    }

    /**
     * Scaling Matrix.
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @param {number} w
     */
    static scale(x, y, z, w) {
        const m = new Matrix4();
        m.elements[0] = x;
        m.elements[5] = y;
        m.elements[10] = z;
        m.elements[15] = w;
        return m;
    }

    /**
     * Translation Matrix.
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @param {number} w
     */
    static translation(x, y, z, w) {
        const m = new Matrix4();
        m.elements[12] = x;
        m.elements[13] = y;
        m.elements[14] = z;
        m.elements[15] = w; // Translation in 4th dimension!
        return m;
    }

    /**
     * Creates a standard 3D perspective projection matrix (4x4).
     * Useful for the final 3D->2D step if we wanted to use matrix math for it.
     * @param {number} fov - Field of view in radians
     * @param {number} aspect - Aspect ratio
     * @param {number} near - Near clip plane
     * @param {number} far - Far clip plane
     */
    static perspective(fov, aspect, near, far) {
        const f = 1.0 / Math.tan(fov / 2);
        const m = new Matrix4();
        m.elements[0] = f / aspect;
        m.elements[5] = f;
        m.elements[10] = (far + near) / (near - far);
        m.elements[11] = -1;
        m.elements[14] = (2 * far * near) / (near - far);
        m.elements[15] = 0;
        return m;
    }
}
