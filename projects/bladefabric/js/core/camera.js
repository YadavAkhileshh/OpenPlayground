// camera.js
import { Vec2 } from '../math/vec2.js';
import { globalEvents } from './eventBus.js';

export class Camera {
    constructor(canvas) {
        this.canvas = canvas;
        this.position = new Vec2(0, 0);
        this.zoom = 1.0;

        // Screen to World matrix elements
        this.offsetX = 0;
        this.offsetY = 0;
    }

    update() {
        // Center the camera on the screen
        this.offsetX = this.canvas.width / 2;
        this.offsetY = this.canvas.height / 2;
    }

    applyTransform(ctx) {
        ctx.save();
        ctx.translate(this.offsetX, this.offsetY);
        ctx.scale(this.zoom, this.zoom);
        // Important: Invert Y axis so +Y is up like standard math, rather than down
        ctx.scale(1, -1);
        ctx.translate(-this.position.x, -this.position.y);
    }

    restoreTransform(ctx) {
        ctx.restore();
    }

    screenToWorld(screenPos) {
        // Inverse of applyTransform
        const x = (screenPos.x - this.offsetX) / this.zoom + this.position.x;
        // Notice the negation for Y due to inverted axis
        const y = -(screenPos.y - this.offsetY) / this.zoom + this.position.y;
        return new Vec2(x, y);
    }

    worldToScreen(worldPos) {
        const x = (worldPos.x - this.position.x) * this.zoom + this.offsetX;
        const y = -(worldPos.y - this.position.y) * this.zoom + this.offsetY;
        return new Vec2(x, y);
    }
}
