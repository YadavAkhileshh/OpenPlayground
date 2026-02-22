/**
 * SingularityRay JS - Render - Camera
 * Orbital camera controller with spherical coordinates 
 * generating rays for the rendering pipeline.
 */

import { Vec3 } from '../math/vec3.js';
import { Mat4 } from '../math/mat4.js';
import { MathUtils } from '../math/utils.js';
import { FIELD_OF_VIEW, PI, HALF_PI } from '../math/constants.js';
import { Ray } from '../physics/ray.js';

export class Camera {
    constructor() {
        this.position = new Vec3(0, 5, 20);
        this.target = new Vec3(0, 0, 0);
        this.up = new Vec3(0, 1, 0);

        // Orbital coordinates
        this.radius = 20.0;
        this.theta = HALF_PI * 1.5; // Horizon angle
        this.phi = Math.PI * 0.45;  // Elevation angle

        // Physics / movement
        this.targetRadius = this.radius;
        this.targetTheta = this.theta;
        this.targetPhi = this.phi;

        // Configuration
        this.fov = FIELD_OF_VIEW;
        this.aspectRatio = 1.0;
        this.near = 0.1;
        this.far = 1000.0;

        // Matrices
        this.viewMatrix = new Mat4();
        this.projectionMatrix = new Mat4();
        this.cameraToWorld = new Mat4();

        // Internals for ray generation to save allocations
        this.forward = new Vec3();
        this.right = new Vec3();
        this.camUp = new Vec3();

        this.updateViewMatrix();
    }

    /**
     * Recomputes spherical to Cartesian coords and updates View Matrix
     */
    updateViewMatrix() {
        // Spherical to Cartesian interpolation for smooth movement
        this.radius = MathUtils.lerp(this.radius, this.targetRadius, 0.1);
        this.theta = MathUtils.lerp(this.theta, this.targetTheta, 0.1);
        this.phi = MathUtils.lerp(this.phi, this.targetPhi, 0.1);

        // Clamp
        this.phi = MathUtils.clamp(this.phi, 0.05, Math.PI - 0.05);
        this.radius = MathUtils.clamp(this.radius, 1.5, 100.0); // Don't allow camera inside BH

        // Calculate position
        const sinPhiRadius = Math.sin(this.phi) * this.radius;
        this.position.x = sinPhiRadius * Math.sin(this.theta);
        this.position.y = Math.cos(this.phi) * this.radius;
        this.position.z = sinPhiRadius * Math.cos(this.theta);

        // Calculate LookAt
        this.forward.copy(this.target).sub(this.position).normalize();
        this.right.copy(this.forward).cross(this.up).normalize();
        this.camUp.copy(this.right).cross(this.forward).normalize();

        // Create View Matrix logically from basis vectors
        const e = this.viewMatrix.elements;
        const p = this.position;
        const f = this.forward;
        const r = this.right;
        const u = this.camUp;

        e[0] = r.x; e[4] = r.y; e[8] = r.z; e[12] = -r.dot(p);
        e[1] = u.x; e[5] = u.y; e[9] = u.z; e[13] = -u.dot(p);
        e[2] = -f.x; e[6] = -f.y; e[10] = -f.z; e[14] = f.dot(p);
        e[3] = 0; e[7] = 0; e[11] = 0; e[15] = 1;

        // For Raymarching we need the inverse of the view-projection
        // So we can map standard screen xy to world space rays.
        this.cameraToWorld.copy(this.viewMatrix).invert();
    }

    /**
     * Setup aspect ratio on resize
     * @param {number} width 
     * @param {number} height 
     */
    setAspect(width, height) {
        this.aspectRatio = width / height;
        this.projectionMatrix.makePerspective(this.fov, this.aspectRatio, this.near, this.far);
    }

    /**
     * Mouse orbit input proxy
     * @param {number} deltaX 
     * @param {number} deltaY 
     */
    orbit(deltaX, deltaY) {
        this.targetTheta -= deltaX * 0.01;
        this.targetPhi -= deltaY * 0.01;
    }

    /**
     * Mouse wheel zoom proxy
     * @param {number} delta 
     */
    zoom(delta) {
        this.targetRadius += delta * 0.05;
    }

    /**
     * Reset camera to exact starting location
     */
    reset() {
        this.targetRadius = 20.0;
        this.targetTheta = HALF_PI * 1.5;
        this.targetPhi = PI * 0.45;
    }

    /**
     * Get a ray from screen coordinates [-1 to 1]
     * @param {number} nx Normalized X
     * @param {number} ny Normalized Y
     * @param {Ray} outRay Target ray to assign memory-safe values to
     */
    getRay(nx, ny, outRay) {
        // Perspective projection formula
        const scale = Math.tan(this.fov * 0.5);
        const px = nx * scale * this.aspectRatio;
        const py = ny * scale;

        // The point on the near clipping plane in camera space
        // Ray direction in camera space is simply vector from origin (0) to this point
        const dirCam = new Vec3(px, py, -1.0).normalize();

        // Transform direction to world space using basis vectors directly 
        // which avoids full Mat4 multiplication for speed in innermost loop
        const worldDirX = dirCam.x * this.right.x + dirCam.y * this.camUp.x - dirCam.z * this.forward.x;
        const worldDirY = dirCam.x * this.right.y + dirCam.y * this.camUp.y - dirCam.z * this.forward.y;
        const worldDirZ = dirCam.x * this.right.z + dirCam.y * this.camUp.z - dirCam.z * this.forward.z;

        const worldDir = new Vec3(worldDirX, worldDirY, worldDirZ).normalize();

        outRay.reset(this.position, worldDir);
    }
}
