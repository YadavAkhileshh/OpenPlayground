/**
 * @class Point
 * @description Represents a mass-point in the Verlet Integration system.
 * Each point maintains its current and previous positions to derive velocity implicitly.
 * This implementation includes support for pinning, freezing, and external forces.
 */
export default class Point {
    /**
     * @param {number} x - Initial X position.
     * @param {number} y - Initial Y position.
     * @param {boolean} isPinned - Whether the point is fixed in space.
     */
    constructor(x, y, isPinned = false) {
        // High-precision position tracking
        this.x = x;
        this.y = y;
        this.oldX = x;
        this.oldY = y;

        // Acceleration accumulation buffer
        this.accX = 0;
        this.accY = 0;

        // Physical state flags
        this.isPinned = isPinned;
        this.isFrozen = false;

        // Metadata for rendering and effects
        this.mass = 1.0;
        this.radius = 2.0;
        this.color = '#818cf8';
    }

    /**
     * Primary physics update step using Verlet Integration.
     * x_new = x + (x - x_old) * friction + acc * dt^2
     * 
     * @param {number} dt - Timestep delta.
     * @param {number} friction - Damping factor for velocity.
     * @param {number} gravity - Vertical force to apply.
     */
    update(dt, friction, gravity) {
        // Pinned and Frozen points skip the integration step
        if (this.isPinned || this.isFrozen) return;

        // Calculate implicit velocity from position history
        const velX = (this.x - this.oldX) * friction;
        const velY = (this.y - this.oldY) * friction;

        // Store current position as "old" for next frame
        this.oldX = this.x;
        this.oldY = this.y;

        // Apply Verlet integration formula
        // We multiply dt*dt to translate acceleration into position displacement
        const timeSq = dt * dt;
        this.x += velX + this.accX * timeSq;
        this.y += velY + (this.accY + gravity) * timeSq;

        // Buffer clearing: acceleration is reset every frame after integration
        this.accX = 0;
        this.accY = 0;
    }

    /**
     * Accumulates a force vector to be applied in the next update call.
     * Force is divided by mass to get acceleration (F = ma).
     * 
     * @param {number} fx - Force along X axis.
     * @param {number} fy - Force along Y axis.
     */
    applyForce(fx, fy) {
        if (this.isFrozen) return;
        this.accX += fx / this.mass;
        this.accY += fy / this.mass;
    }

    /**
     * Toggles the pinned state of the point.
     * Useful for manual interaction and structural changes.
     */
    togglePin() {
        this.isPinned = !this.isPinned;
    }

    /**
     * Locks the point in its current position, ignoring both integration and forces.
     */
    freeze() {
        this.isFrozen = true;
    }

    /**
     * Resumes physics calculation for this point.
     */
    unfreeze() {
        this.isFrozen = false;
    }

    /**
     * Renders a visual representation of the mass point.
     * Usually hidden for cloth but useful for debugging or specific styles.
     * 
     * @param {CanvasRenderingContext2D} ctx 
     * @param {string} overrideColor - Optional color to use instead of default.
     */
    render(ctx, overrideColor = null) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = overrideColor || this.color;
        ctx.fill();

        // Highlight pinned points with a white border
        if (this.isPinned) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }

    /**
     * Telemetry helper to calculate current instantaneous velocity.
     * @returns {Object} {vx, vy}
     */
    getVelocity() {
        return {
            x: this.x - this.oldX,
            y: this.y - this.oldY
        };
    }
}

