import { events } from '../core/EventBus.js';

export class ViewportController {
    constructor(container, canvas) {
        this.container = container;
        this.canvas = canvas;

        // Transform state
        this.x = 0;
        this.y = 0;
        this.scale = 1;

        // Pan limits / configuration
        this.minScale = 0.2;
        this.maxScale = 3.0;

        this.applyTransform();
    }

    pan(dx, dy) {
        this.x += dx;
        this.y += dy;
        this.applyTransform();
    }

    zoom(delta, mouseX, mouseY) {
        const zoomFactor = 1.1;
        const previousScale = this.scale;

        if (delta < 0) {
            this.scale *= zoomFactor;
        } else {
            this.scale /= zoomFactor;
        }

        this.scale = Math.max(this.minScale, Math.min(this.maxScale, this.scale));

        // Adjust translation to zoom towards mouse cursor
        const rect = this.container.getBoundingClientRect();
        const offsetX = mouseX - rect.left;
        const offsetY = mouseY - rect.top;

        this.x = offsetX - (offsetX - this.x) * (this.scale / previousScale);
        this.y = offsetY - (offsetY - this.y) * (this.scale / previousScale);

        this.applyTransform();
    }

    applyTransform() {
        // CSS matrix: matrix(scaleX, skewY, skewX, scaleY, translateX, translateY)
        this.canvas.style.transform = `matrix(${this.scale}, 0, 0, ${this.scale}, ${this.x}, ${this.y})`;
        events.emit('viewport-transformed');
    }

    getMatrix() {
        return {
            a: this.scale,
            b: 0,
            c: 0,
            d: this.scale,
            e: this.x,
            f: this.y
        };
    }

    reset() {
        this.x = 0;
        this.y = 0;
        this.scale = 1;
        this.applyTransform();
    }
}
