import { CONFIG } from '../utils/constants.js';
import { MathUtils } from '../utils/math.js';
import { logger } from '../utils/logger.js';

/**
 * @fileoverview Handles user input (Mouse/Touch) for interacting with the cradle.
 * Allows users to grab, drag, and release balls to start the simulation.
 */
export class InteractionHandler {
    /**
     * @param {HTMLElement} container - The DOM element containing the simulation.
     * @param {Pendulum[]} balls - The array of balls to interact with.
     */
    constructor(container, balls) {
        this.container = container;
        this.balls = balls;

        // State
        this.draggedBall = null;
        this.isMouseDown = false;

        // Bind events
        this.initEvents();
    }

    /**
     * Set up event listeners for mouse and touch interactions.
     */
    initEvents() {
        this.container.addEventListener('mousedown', this.onMouseDown.bind(this));
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        window.addEventListener('mouseup', this.onMouseUp.bind(this));

        // Touch support
        this.container.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
        window.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
        window.addEventListener('touchend', this.onMouseUp.bind(this));
    }

    /**
     * Find if a click is within any ball's radius.
     * @param {number} mouseX 
     * @param {number} mouseY 
     * @returns {Pendulum|null}
     */
    getBallAt(mouseX, mouseY) {
        // We use the ball's current screen position
        for (const ball of this.balls) {
            const dist = MathUtils.getDistance(mouseX, mouseY, ball.ballX, ball.ballY);
            if (dist < ball.radius + 10) { // Slight padding for easier grabbing
                return ball;
            }
        }
        return null;
    }

    onMouseDown(e) {
        const { clientX, clientY } = this.getCoords(e);
        const ball = this.getBallAt(clientX, clientY);

        if (ball) {
            this.draggedBall = ball;
            this.isMouseDown = true;
            ball.startDrag();
            logger.debug(`Started dragging ball ${ball.index}`);

            // Prevent text selection during drag
            e.preventDefault();
        }
    }

    onMouseMove(e) {
        if (!this.isMouseDown || !this.draggedBall) return;

        const { clientX, clientY } = this.getCoords(e);

        // Calculate the angle based on mouse position relative to anchor
        const dx = clientX - this.draggedBall.anchorX;
        const dy = clientY - this.draggedBall.anchorY;

        // Calculate new angle using atan2
        // Note: angle 0 is vertical down (positive Y), so atan2(dx, dy)
        let angle = Math.atan2(dx, dy);

        // Clamp the angle to physical limits
        this.draggedBall.setAngle(angle);
    }

    onMouseUp() {
        if (this.draggedBall) {
            logger.debug(`Released ball ${this.draggedBall.index}`);
            this.draggedBall.stopDrag(this.draggedBall.angle);
            this.draggedBall = null;
        }
        this.isMouseDown = false;
    }

    /**
     * Helper to get coordinates from Mouse or Touch events.
     */
    getCoords(e) {
        const rect = this.container.getBoundingClientRect();
        if (e.touches && e.touches.length > 0) {
            return {
                clientX: e.touches[0].clientX - rect.left,
                clientY: e.touches[0].clientY - rect.top
            };
        }
        return {
            clientX: e.clientX - rect.left,
            clientY: e.clientY - rect.top
        };
    }

    onTouchStart(e) {
        // Redirect to mouse down logic
        this.onMouseDown(e);
    }

    onTouchMove(e) {
        // Redirect to mouse move logic
        this.onMouseMove(e);
        // Prevent scrolling while dragging
        if (this.isMouseDown) e.preventDefault();
    }
}
