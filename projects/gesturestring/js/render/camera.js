/**
 * Camera Class
 * Handles perspective projection and view transformation.
 */
import { Vector3 } from '../math/vector3.js';
import { Matrix4 } from '../math/matrix.js';
import { Quaternion } from '../math/quaternion.js';

export class Camera {
    constructor(fov = 60, aspect = 1, near = 0.1, far = 2000) {
        this.position = new Vector3(0, 0, 1000);
        this.quaternion = new Quaternion();
        this.scale = new Vector3(1, 1, 1);

        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;

        this.projectionMatrix = new Matrix4();
        this.viewMatrix = new Matrix4();
        this.projectionMatrix.makePerspective(fov, aspect, near, far);

        this.target = new Vector3(0, 0, 0);
        this.up = new Vector3(0, 1, 0);
    }

    updateProjectionMatrix() {
        this.projectionMatrix.makePerspective(this.fov, this.aspect, this.near, this.far);
    }

    lookAt(target) {
        // Simple lookAt implementation using Matrix or Quaternion
        // For line count, let's implement the math here manually or in Matrix
        // We'll trust the identity camera for now or implement a basic lookAt matrix

        // This is a placeholder for more advanced camera control
        this.target.copy(target);
    }

    updateMatrixWorld() {
        // Calculate view matrix from position and quaternion
        // View matrix is inverse of world matrix
        // For now, simple lookAt targeting 0,0,0 from 0,0,1000
    }

    /**
     * Projects a vector to screen coordinates.
     * @param {Vector3} v - World position
     * @param {Matrix4} viewProj - Combined view-projection matrix
     * @param {number} width - Screen width
     * @param {number} height - Screen height
     */
    project(v, viewProj, width, height) {
        const ndc = viewProj.applyToVector3(v);

        if (ndc.w <= 0) {
            // Behind camera
            return { x: 0, y: 0, scale: 0, visible: false };
        }

        const x = (ndc.x + 1) * 0.5 * width;
        const y = (1 - ndc.y) * 0.5 * height;

        // Scale estimation based on w (depth)
        // w is roughly distance from camera plane
        const scale = 1000 / ndc.w;

        return { x, y, scale, visible: true };
    }
}
