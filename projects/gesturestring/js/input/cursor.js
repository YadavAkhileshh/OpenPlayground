/**
 * Cursor Module
 * Handles mouse and touch input tracking.
 */
import { Vector3 } from '../math/vector3.js';

export class Cursor {
    constructor(element) {
        this.element = element;
        this.position = new Vector3(0, 0, 0);
        this.prevPosition = new Vector3(0, 0, 0);
        this.velocity = new Vector3(0, 0, 0);
        this.isDown = false;

        // History for smoothing if needed
        this.history = [];
        this.maxHistory = 5;

        this.initEvents();
    }

    initEvents() {
        // Mouse
        window.addEventListener('mousedown', (e) => this.onDown(e));
        window.addEventListener('mousemove', (e) => this.onMove(e));
        window.addEventListener('mouseup', () => this.onUp());

        // Touch
        window.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        window.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
        window.addEventListener('touchend', () => this.onUp());
    }

    getRelativePosition(clientX, clientY) {
        // For keeping 3D simple, we can map screen pixels directly or normalize
        // Let's map to a centered coordinate system where 0,0 is center of screen
        const rect = this.element.getBoundingClientRect();
        const x = clientX - rect.left - rect.width / 2;
        const y = clientY - rect.top - rect.height / 2;
        return { x, y };
    }

    onDown(e) {
        this.isDown = true;
        const pos = this.getRelativePosition(e.clientX, e.clientY);
        this.position.set(pos.x, pos.y, 0);
        this.prevPosition.copy(this.position);
        this.velocity.set(0, 0, 0);
    }

    onMove(e) {
        const pos = this.getRelativePosition(e.clientX, e.clientY);

        // Update previous position before setting new
        this.prevPosition.copy(this.position);
        this.position.set(pos.x, pos.y, 0);

        // Calculate immediate velocity
        this.velocity.subVectors(this.position, this.prevPosition);

        if (this.isDown) {
            // Optional: Add to history
            this.history.push(this.position.clone());
            if (this.history.length > this.maxHistory) {
                this.history.shift();
            }
        }
    }

    onUp() {
        this.isDown = false;
        this.history = [];
    }

    onTouchStart(e) {
        if (e.touches.length > 0) {
            this.isDown = true;
            const t = e.touches[0];
            const pos = this.getRelativePosition(t.clientX, t.clientY);
            this.position.set(pos.x, pos.y, 0);
            this.prevPosition.copy(this.position);
            e.preventDefault();
        }
    }

    onTouchMove(e) {
        if (e.touches.length > 0) {
            const t = e.touches[0];
            const pos = this.getRelativePosition(t.clientX, t.clientY);

            this.prevPosition.copy(this.position);
            this.position.set(pos.x, pos.y, 0);
            this.velocity.subVectors(this.position, this.prevPosition);

            e.preventDefault();
        }
    }
}
