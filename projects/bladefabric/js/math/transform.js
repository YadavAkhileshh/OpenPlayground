// transform.js
import { Vec2 } from './vec2.js';
import { Mat2 } from './mat2.js';

export class Transform {
    constructor(position = new Vec2(), angle = 0) {
        this.position = position.clone();
        this.angle = angle;
        this.rotation = new Mat2().setAngle(angle);
    }

    set(position, angle) {
        this.position.copy(position);
        this.setAngle(angle);
    }

    setAngle(angle) {
        this.angle = angle;
        this.rotation.setAngle(angle);
    }

    clone() {
        return new Transform(this.position, this.angle);
    }

    // Multiply Vector by this transform
    mulVec2(v) {
        // v2 = R * v + P
        const x = this.rotation.m00 * v.x + this.rotation.m01 * v.y + this.position.x;
        const y = this.rotation.m10 * v.x + this.rotation.m11 * v.y + this.position.y;
        return new Vec2(x, y);
    }

    // Multiply Vector by Inverse of this transform
    mulTVec2(v) {
        // v2 = R^T * (v - P)
        const px = v.x - this.position.x;
        const py = v.y - this.position.y;
        const x = this.rotation.m00 * px + this.rotation.m10 * py;
        const y = this.rotation.m01 * px + this.rotation.m11 * py;
        return new Vec2(x, y);
    }

    // Rotate Vector (without position shift)
    rotateVec2(v) {
        const x = this.rotation.m00 * v.x + this.rotation.m01 * v.y;
        const y = this.rotation.m10 * v.x + this.rotation.m11 * v.y;
        return new Vec2(x, y);
    }

    // Inverse Rotate Vector
    invRotateVec2(v) {
        const x = this.rotation.m00 * v.x + this.rotation.m10 * v.y;
        const y = this.rotation.m01 * v.x + this.rotation.m11 * v.y;
        return new Vec2(x, y);
    }
}
