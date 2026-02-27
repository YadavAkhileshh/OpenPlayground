/**
 * Camera — Orbit camera with correct LookAt math.
 *
 * Bugs fixed vs original:
 *   - position is NOT added to itself every frame (was permanently corrupting orbit)
 *   - Camera basis vectors are built correctly without reusing this.position ref
 *   - Auto-rotation support added
 */
class Camera {
    constructor() {
        // Orbit spherical coords
        this.radius = 65;
        this.theta = 0.4;          // azimuth  (horizontal)
        this.phi = Math.PI / 3;  // polar / elevation (vertical)

        // Look target (world space origin)
        this.target = new Vector3(0, 0, 0);

        // Derived (computed by update())
        this.position = new Vector3();

        // Camera intrinsics
        this.fov = 55;   // degrees, conceptual — used for focal len
        this.near = 0.5;
        this.far = 500;

        // Auto-rotate
        this.autoRotate = true;
        this.autoRotateSpeed = 0.003;

        // World up
        this._worldUp = new Vector3(0, 1, 0);

        // Cached basis vectors — recomputed each frame in update()
        this._forward = new Vector3();
        this._right = new Vector3();
        this._up = new Vector3();

        // Focal length factor — pixels equivalent to FOV
        this.focalLen = 600;

        this.update();
    }

    /** Recalculate position and basis vectors from spherical coords. */
    update() {
        if (this.autoRotate) {
            this.theta += this.autoRotateSpeed;
        }

        // Spherical → Cartesian (camera is at radius from target)
        const sinP = Math.sin(this.phi);
        const cosP = Math.cos(this.phi);
        const sinT = Math.sin(this.theta);
        const cosT = Math.cos(this.theta);

        this.position.x = this.target.x + this.radius * sinP * cosT;
        this.position.y = this.target.y + this.radius * cosP;
        this.position.z = this.target.z + this.radius * sinP * sinT;

        // Build camera basis
        // Forward (-Z toward target)
        this._forward.copy(this.target).sub(this.position).normalize();

        // Right = Forward × WorldUp
        this._right.copy(this._forward).crossSelf(this._worldUp).normalize();
        if (this._right.lengthSq() < 1e-8) {
            // Degenerate case (looking straight up/down) — pick arbitrary right
            this._right.set(1, 0, 0);
        }

        // Up = Right × Forward
        this._up.copy(this._right).crossSelf(this._forward).normalize();
    }

    /**
     * Transforms a world-space point into camera (view) space.
     * Camera space: +X=right, +Y=up, +Z=toward camera (depth)
     */
    worldToCamera(pt) {
        const dx = pt.x - this.position.x;
        const dy = pt.y - this.position.y;
        const dz = pt.z - this.position.z;

        return {
            x: dx * this._right.x + dy * this._right.y + dz * this._right.z,
            y: dx * this._up.x + dy * this._up.y + dz * this._up.z,
            // depth: project onto -forward (toward camera = positive)
            z: -(dx * this._forward.x + dy * this._forward.y + dz * this._forward.z)
        };
    }

    /**
     * Projects a camera-space point onto the screen.
     * @returns {{x, y}} screen coords (needs canvas half-size offset externally)
     */
    project(camPt, halfW, halfH) {
        const scale = this.focalLen / camPt.z;
        return {
            x: camPt.x * scale + halfW,
            y: -camPt.y * scale + halfH
        };
    }

    rotate(dx, dy) {
        this.theta -= dx * 0.006;
        this.phi -= dy * 0.006;
        const EPS = 0.05;
        this.phi = Math.max(EPS, Math.min(Math.PI - EPS, this.phi));
    }

    zoom(delta) {
        this.radius = Math.max(8, Math.min(180, this.radius + delta * 0.08));
    }
}
