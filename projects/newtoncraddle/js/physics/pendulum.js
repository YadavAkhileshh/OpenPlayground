import { CONFIG } from '../utils/constants.js';
import { MathUtils } from '../utils/math.js';

/**
 * @fileoverview Implementation of a simple pendulum.
 * This class handles the angular kinematics and dynamics of a single ball.
 */
export class Pendulum {
    /**
     * Create a new Pendulum ball.
     * @param {number} x - The anchor X coordinate (where the string is tied).
     * @param {number} y - The anchor Y coordinate.
     * @param {number} index - The zero-indexed position of this ball.
     */
    constructor(x, y, index) {
        this.anchorX = x;
        this.anchorY = y;
        this.index = index;

        // State variables
        this.angle = 0;              // Current angle in radians (0 is vertical)
        this.angularVelocity = 0;    // Change in angle over time
        this.angularAcceleration = 0; // Force-driven change in velocity

        // Physical properties
        this.length = CONFIG.STRING_LENGTH;
        this.radius = CONFIG.BALL_RADIUS;
        this.mass = 1.0;             // Unit mass for simplicity in momentum transfer

        // Interaction state
        this.isDragged = false;

        // Current position in screen coordinates (updated every step)
        this.ballX = x;
        this.ballY = y + this.length;
    }

    /**
     * Update the pendulum's physical state using Verlet-like integration
     * or simple Euler depending on precision requirements.
     * 
     * Formula: alpha = -(g/L) * sin(theta)
     * 
     * @param {number} dt - Time delta for this step.
     */
    update(dt) {
        if (this.isDragged) return; // Physics paused while dragging

        // Calculate angular acceleration (restoring force)
        this.angularAcceleration = - (CONFIG.GRAVITY / (this.length / CONFIG.PIXELS_PER_METER)) * Math.sin(this.angle);

        // Update velocity and angle
        this.angularVelocity += this.angularAcceleration * dt;
        this.angle += this.angularVelocity * dt;

        // Apply damping (air resistance / energy loss at pivot)
        this.angularVelocity *= CONFIG.DAMPING;

        // Update Cartesian coordinates for rendering and collision detection
        this.updateCoordinates();
    }

    /**
     * Precompute the screen position of the ball based on current angle.
     */
    updateCoordinates() {
        // Simple trigonometry to convert polar (L, theta) to Cartesian (x, y)
        // Note: angle 0 is vertical down, so x = sin(theta), y = cos(theta)
        this.ballX = this.anchorX + Math.sin(this.angle) * this.length;
        this.ballY = this.anchorY + Math.cos(this.angle) * this.length;
    }

    /**
     * Start dragging the ball.
     */
    startDrag() {
        this.isDragged = true;
        this.angularVelocity = 0;
        this.angularAcceleration = 0;
    }

    /**
     * Stop dragging and release the ball into physics.
     * @param {number} finalAngle - The angle at which it was released.
     */
    stopDrag(finalAngle) {
        this.isDragged = false;
        this.angle = finalAngle;
        this.angularVelocity = 0; // Assume released from rest for simplicity
        this.updateCoordinates();
    }

    /**
     * Manually set the angle (useful during interactions).
     * @param {number} angle - Target angle in radians.
     */
    setAngle(angle) {
        const maxRad = MathUtils.degreesToRadians(CONFIG.MAX_SWING);
        this.angle = MathUtils.clamp(angle, -maxRad, maxRad);
        this.updateCoordinates();
    }
}
