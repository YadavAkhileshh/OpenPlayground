import { State } from './state.js';
import { CONSTANTS } from './constants.js';

export class InputHandler {
    constructor() {
        this.isDragging = false;
        this.lastY = 0;

        this.bindEvents();
    }

    bindEvents() {
        // Mouse Wheel (Zoom)
        window.addEventListener('wheel', (e) => {
            e.preventDefault(); // Stop native scrolling

            // Normalize delta
            const delta = -e.deltaY * CONSTANTS.ZOOM_SENSITIVITY;

            // Update target velocity in State
            // We accumulate velocity for smooth inertia
            State.physics.targetVelocity += delta;

            // Clamp velocity for sanity
            State.physics.targetVelocity = Math.max(
                Math.min(State.physics.targetVelocity, CONSTANTS.MAX_VELOCITY),
                -CONSTANTS.MAX_VELOCITY
            );
        }, { passive: false });

        // Touch Events (Basic pinch mapping)
        // For MVP, we might just map vertical drag to zoom for mobile simple testing
        // Or implement robust pinch-zoom

        window.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                this.isDragging = true;
                this.lastY = e.touches[0].clientY;
            }
        }, { passive: false });

        window.addEventListener('touchmove', (e) => {
            if (this.isDragging && e.touches.length === 1) {
                e.preventDefault();
                const currentY = e.touches[0].clientY;
                const deltaY = currentY - this.lastY;

                // Drag up to zoom out, down to zoom in (or vice versa)
                // Let's say drag down (positive delta) -> Zoom In
                const zoomFactor = deltaY * CONSTANTS.ZOOM_SENSITIVITY * 2;
                State.physics.targetVelocity += zoomFactor;

                this.lastY = currentY;
            }
        }, { passive: false });

        window.addEventListener('touchend', () => {
            this.isDragging = false;
        });
    }
}
