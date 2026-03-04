/**
 * DialControl.js
 * 
 * =============================================================================
 * RETRO INTERFACE CONTROLLER
 * =============================================================================
 * 
 * This module implements the tactile logic for the rotary tuning dial.
 * It provides a natural feel by mapping linear mouse/touch movements to 
 * angular rotation, while simulating the physical resistance of a high-end 
 * analog tuner.
 * 
 * FEATURES:
 * - 1:1 Motion mapping
 * - Physical rotation clamping (-150 to +150 degrees)
 * - Multimodal support (Mouse + Touch)
 * - Inertial styling (CSS-based smooth transitions)
 * 
 * @module DialControl
 */

import { CONFIG } from '../core/constants.js';

export class DialControl {
    /**
     * @param {string} containerId - Element ID for the dial knob container.
     * @param {Function} onUpdate - Callback fired when the tuning changes.
     */
    constructor(containerId, onUpdate) {
        this.container = document.getElementById(containerId);
        this.knob = this.container.querySelector('.knob');
        this.onUpdate = onUpdate;

        // INTERACTIVE STATE
        this.isDragging = false;
        this.startY = 0;
        this.currentRotation = 0;

        this.init();
    }

    /**
     * Binds input listeners for interactive control.
     * Implements basic event delegation for both desktop and mobile platforms.
     */
    init() {
        // MOUSE EVENTS
        this.container.addEventListener('mousedown', (e) => this.handleInputStart(e.clientY));
        window.addEventListener('mousemove', (e) => this.handleInputMove(e.clientY));
        window.addEventListener('mouseup', () => this.handleInputEnd());

        // TOUCH EVENTS (Mobile Compatibility)
        this.container.addEventListener('touchstart', (e) => {
            // Prevent scrolling while tuning.
            e.preventDefault();
            this.handleInputStart(e.touches[0].clientY);
        }, { passive: false });

        window.addEventListener('touchmove', (e) => {
            if (this.isDragging) {
                this.handleInputMove(e.touches[0].clientY);
            }
        });

        window.addEventListener('touchend', () => this.handleInputEnd());
    }

    /**
     * Captures the initial coordinate for movement delta calculation.
     * @param {number} y - Vertical client coordinate
     */
    handleInputStart(y) {
        this.isDragging = true;
        this.startY = y;
        this.container.classList.add('is-interacting');

        // Visual feedback
        document.body.style.cursor = 'ns-resize';
    }

    /**
     * Calculates movement delta and updates rotation state.
     * Uses vertical dragging to simulate a circular knob, which is more 
     * intuitive for mouse users than dragging in an actual circle.
     * 
     * @param {number} y - Current vertical client coordinate
     */
    handleInputMove(y) {
        if (!this.isDragging) return;

        // Calculate velocity delta
        const delta = this.startY - y;
        this.startY = y;

        // Apply sensitivity multiplier from global config.
        this.currentRotation += delta * CONFIG.UI.DIAL_SENSITIVITY;

        // CLAMPING LOGIC
        // We restrict the dial from spinning infinitely to simulate a physical limit switch.
        this.currentRotation = Math.max(
            CONFIG.UI.DIAL_ROTATION_MIN,
            Math.min(CONFIG.UI.DIAL_ROTATION_MAX, this.currentRotation)
        );

        this.applyVisuals();

        // NORMALIZATION
        // Map the degree range (-150 to 150) to a linear factor (0.0 to 1.0)
        const normalizedValue = (this.currentRotation - CONFIG.UI.DIAL_ROTATION_MIN) /
            (CONFIG.UI.DIAL_ROTATION_MAX - CONFIG.UI.DIAL_ROTATION_MIN);

        this.onUpdate(normalizedValue);
    }

    /**
     * Resets interaction states.
     */
    handleInputEnd() {
        this.isDragging = false;
        this.container.classList.remove('is-interacting');
        document.body.style.cursor = 'default';
    }

    /**
     * Updates the CSS transform for the hardware dial.
     */
    applyVisuals() {
        // We use translateZ(0) to trigger hardware acceleration on the rotation.
        this.knob.style.transform = `rotate(${this.currentRotation}deg) translateZ(0)`;
    }

    /**
     * Programmatically sets the dial position (used for auto-scan or init).
     * @param {number} normalizedTuning - Value between 0.0 and 1.0
     */
    setRotation(normalizedTuning) {
        this.currentRotation = (normalizedTuning *
            (CONFIG.UI.DIAL_ROTATION_MAX - CONFIG.UI.DIAL_ROTATION_MIN)) +
            CONFIG.UI.DIAL_ROTATION_MIN;

        this.applyVisuals();
    }
}
