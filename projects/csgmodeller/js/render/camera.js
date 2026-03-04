class Camera {
    constructor(fov, aspect, near, far) {
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;

        this.position = new Vector3(0, 5, 10);
        this.target = new Vector3(0, 0, 0);
        this.up = new Vector3(0, 1, 0);

        this.viewMatrix = new Matrix4();
        this.projectionMatrix = new Matrix4();

        // Spherical coordinates for orbit
        this.radius = 10;
        this.theta = 0; // Horizontal angle
        this.phi = Math.PI / 4; // Vertical angle (from y-axis)

        this.updateProjection();
        this.updateView();
    }

    updateProjection() {
        this.projectionMatrix.makePerspective(this.fov, this.aspect, this.near, this.far);
    }

    updateView() {
        // Convert spherical to Cartesian
        // y is up
        this.position.x = this.radius * Math.sin(this.phi) * Math.sin(this.theta);
        this.position.y = this.radius * Math.cos(this.phi);
        this.position.z = this.radius * Math.sin(this.phi) * Math.cos(this.theta);

        this.position = this.position.add(this.target);

        this.lookAt(this.position, this.target, this.up);
    }

    lookAt(eye, target, up) {
        const z = eye.sub(target).normalize();

        // Prevent gimbal lock / degenerate cross product if z is parallel to up
        let x = up.cross(z).normalize();
        if (x.length() === 0) {
            x = new Vector3(1, 0, 0); // Simple fallback
        }

        const y = z.cross(x).normalize();

        const te = this.viewMatrix.elements;
        te[0] = x.x; te[4] = x.y; te[8] = x.z; te[12] = -x.dot(eye);
        te[1] = y.x; te[5] = y.y; te[9] = y.z; te[13] = -y.dot(eye);
        te[2] = z.x; te[6] = z.y; te[10] = z.z; te[14] = -z.dot(eye);
        te[3] = 0; te[7] = 0; te[11] = 0; te[15] = 1;
    }

    // Controls
    orbit(deltaX, deltaY) {
        const sensitivity = 0.005;
        this.theta -= deltaX * sensitivity;
        this.phi -= deltaY * sensitivity;

        // Clamp phi to avoid flipping over pole
        this.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.phi));

        this.updateView();
    }

    zoom(delta) {
        this.radius += delta * 0.1;
        this.radius = Math.max(2, Math.min(50, this.radius));
        this.updateView();
    }
}
