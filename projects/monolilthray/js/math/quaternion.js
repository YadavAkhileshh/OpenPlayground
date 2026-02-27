/**
 * @file quaternion.js
 * @description Quaternion implementation for smooth 3D rotations.
 */

class Quaternion {
    constructor(x = 0, y = 0, z = 0, w = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    /**
     * Set from axis angle.
     */
    setFromAxisAngle(axis, angle) {
        const halfAngle = angle / 2, s = Math.sin(halfAngle);
        this.x = axis.x * s;
        this.y = axis.y * s;
        this.z = axis.z * s;
        this.w = Math.cos(halfAngle);
        return this;
    }

    multiply(q) {
        return new Quaternion(
            this.x * q.w + this.w * q.x + this.y * q.z - this.z * q.y,
            this.y * q.w + this.w * q.y + this.z * q.x - this.x * q.z,
            this.z * q.w + this.w * q.z + this.x * q.y - this.y * q.x,
            this.w * q.w - this.x * q.x - this.y * q.y - this.z * q.z
        );
    }
}
