/**
 * @file camera.js
 * @description Manages camera position and ray generation logic.
 */

class Camera {
    constructor() {
        this.position = new Vec3(0, 5, 10);
        this.target = new Vec3(0, 0, 0);
        this.up = new Vec3(0, 1, 0);
        this.fov = 60;

        // Orbit params
        this.theta = 0; // Horizontal
        this.phi = Math.PI / 3; // Vertical
        this.radius = 8.0;
    }

    /**
     * Updates the camera position based on input or auto-orbit.
     * @param {number} time Time in seconds
     * @param {Input} input Input manager
     */
    update(time, input) {
        if (input) {
            const delta = input.getDelta();

            // Mouse sensitivity
            const sens = 0.005;
            this.theta -= delta.x * sens;
            this.phi -= delta.y * sens;

            // Clamp vertical
            this.phi = MathUtils.clamp(this.phi, 0.1, Math.PI - 0.1);

            // Zoom
            this.radius += delta.zoom;
            this.radius = MathUtils.clamp(this.radius, 2.0, 20.0);
        } else {
            // Auto orbit if no input system yet
            this.theta = time * 0.2;
        }

        // Spherical to Cartesian
        this.position.x = this.radius * Math.sin(this.phi) * Math.sin(this.theta);
        this.position.y = this.radius * Math.cos(this.phi);
        this.position.z = this.radius * Math.sin(this.phi) * Math.cos(this.theta);

        this.target = new Vec3(0, 0, 0);
    }

    /**
     * Calculates the ray direction for a specific pixel.
     * This logic is often inside the shader/worker, but we can precalculate the view matrix here if needed.
     * For bandwidth efficiency, we usually send camera pos/target to worker and let it compute rays.
     * This class acts more as the state controller in the main thread.
     */
    getLookAtMatrix() {
        const zAxis = this.position.sub(this.target).normalize();   // Forward (inverted)
        const xAxis = this.up.cross(zAxis).normalize();             // Right
        const yAxis = zAxis.cross(xAxis).normalize();               // Up

        return {
            origin: this.position,
            xAxis: xAxis,
            yAxis: yAxis,
            zAxis: zAxis
        };
    }
}
