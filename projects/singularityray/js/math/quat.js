/**
 * SingularityRay JS - Math - Quat
 * Quaternion for robust, gimbal-lock-free 3D rotations, especially 
 * for the orbital camera controlling the black hole scene.
 */

export class Quat {
    /**
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @param {number} w
     */
    constructor(x = 0, y = 0, z = 0, w = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    identity() {
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.w = 1;
        return this;
    }

    /**
     * Set from axis / angle representation
     * @param {Vec3} axis
     * @param {number} angle
     * @returns {Quat}
     */
    setFromAxisAngle(axis, angle) {
        const halfAngle = angle / 2;
        const s = Math.sin(halfAngle);

        this.x = axis.x * s;
        this.y = axis.y * s;
        this.z = axis.z * s;
        this.w = Math.cos(halfAngle);

        return this;
    }

    /**
     * Multiply two quaternions
     * @param {Quat} q
     * @returns {Quat}
     */
    multiply(q) {
        return this.multiplyQuaternions(this, q);
    }

    /**
     * Multiply a * b and store in this
     */
    multiplyQuaternions(a, b) {
        const qax = a.x, qay = a.y, qaz = a.z, qaw = a.w;
        const qbx = b.x, qby = b.y, qbz = b.z, qbw = b.w;

        this.x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
        this.y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
        this.z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
        this.w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

        return this;
    }

    /**
     * Extracts rotation matrix from this quaternion
     * @param {import('./mat3.js').Mat3} target 
     * @returns {import('./mat3.js').Mat3} target
     */
    toMat3(target) {
        const m = target.elements;
        const x = this.x, y = this.y, z = this.z, w = this.w;
        const x2 = x + x, y2 = y + y, z2 = z + z;
        const xx = x * x2, xy = x * y2, xz = x * z2;
        const yy = y * y2, yz = y * z2, zz = z * z2;
        const wx = w * x2, wy = w * y2, wz = w * z2;

        m[0] = 1 - (yy + zz);
        m[3] = xy - wz;
        m[6] = xz + wy;

        m[1] = xy + wz;
        m[4] = 1 - (xx + zz);
        m[7] = yz - wx;

        m[2] = xz - wy;
        m[5] = yz + wx;
        m[8] = 1 - (xx + yy);

        return target;
    }

    /**
     * Normalize the quaternion
     */
    normalize() {
        let len = this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
        if (len === 0) {
            this.x = 0;
            this.y = 0;
            this.z = 0;
            this.w = 1;
        } else {
            len = 1 / Math.sqrt(len);
            this.x *= len;
            this.y *= len;
            this.z *= len;
            this.w *= len;
        }
        return this;
    }

    /**
     * Apply quaternion rotation to a Vec3
     * @param {import('./vec3.js').Vec3} v
     * @returns {import('./vec3.js').Vec3} v (modified in place)
     */
    applyToVec3(v) {
        const x = v.x, y = v.y, z = v.z;
        const qx = this.x, qy = this.y, qz = this.z, qw = this.w;

        // calculate quat * vec
        const ix = qw * x + qy * z - qz * y;
        const iy = qw * y + qz * x - qx * z;
        const iz = qw * z + qx * y - qy * x;
        const iw = -qx * x - qy * y - qz * z;

        // calculate result * inverse quat
        v.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
        v.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
        v.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;

        return v;
    }
}
