/**
 * js/render/camera.js
 * Handles view transformations (pan, zoom) if needed.
 * For SwarmMatrix, we mostly keep a 1:1 view but this allows future expansion.
 */

export class Camera {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.scale = 1;
    }

    apply(ctx) {
        ctx.save();
        ctx.translate(-this.x, -this.y);
        ctx.scale(this.scale, this.scale);
    }

    restore(ctx) {
        ctx.restore();
    }

    // Screen to world coordinates
    screenToWorld(x, y) {
        return {
            x: (x + this.x) / this.scale,
            y: (y + this.y) / this.scale
        };
    }
}
