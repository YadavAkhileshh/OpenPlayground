import { Vector2 } from '../math/Vector2.js';
import { Matrix } from '../math/Matrix.js';
import { Rect } from '../math/Rect.js';

/**
 * 2D Camera for handling transforms and viewable bounds.
 */
export class Camera {
    constructor() {
        this.position = new Vector2(0, 0); // Center of view in world space
        this.zoom = 1.0;

        // Viewport dimensions
        this.width = 0;
        this.height = 0;
        this.dpr = 1;

        // Transformation Matrices
        this.transform = new Matrix();
        this.invTransform = new Matrix();

        // Bounds viewable area (AABB)
        this.bounds = new Rect();
    }

    /**
     * Updates viewport info.
     * @param {number} w - CSS width
     * @param {number} h - CSS height
     * @param {number} dpr - Device Pixel Ratio
     */
    setViewport(w, h, dpr) {
        this.width = w;
        this.height = h;
        this.dpr = dpr;
        this.updateMatrix();
    }

    /**
     * Computes the matrix for screen->world and world->screen maps.
     */
    updateMatrix() {
        this.transform.reset()
            .translate(this.width / 2, this.height / 2) // Move to center of screen
            .scale(this.zoom, this.zoom)                // Apply zoom
            .translate(-this.position.x, -this.position.y); // Move to camera position target

        // Inverse matrix for screen -> world picking
        this.invTransform.reset()
            .set(this.transform.a, this.transform.b, this.transform.c, this.transform.d, this.transform.e, this.transform.f)
            .invert();

        this.updateBounds();
    }

    /**
     * Updates AABB of the visible world space (with buffer for safety).
     */
    updateBounds() {
        const tl = this.screenToWorld(0, 0);
        const br = this.screenToWorld(this.width, this.height);

        const w = (br.x - tl.x) * 1.5; // 50% buffer
        const h = (br.y - tl.y) * 1.5;

        this.bounds.set(tl.x - w * 0.25, tl.y - h * 0.25, w, h);
    }

    /**
     * Zooms the camera focusing on a specific screen point.
     * @param {Vector2} screenPoint
     * @param {number} newZoom
     */
    zoomToPoint(screenPoint, newZoom) {
        // World point before zoom
        const worldPoint = this.screenToWorld(screenPoint.x, screenPoint.y);

        // Apply zoom
        this.zoom = newZoom;
        this.updateMatrix();

        // Screen point after zoom if we didn't move camera
        const newScreenPoint = this.worldToScreen(worldPoint.x, worldPoint.y);

        // Translate camera to keep point fixed
        this.position.x += (newScreenPoint.x - screenPoint.x) / this.zoom;
        this.position.y += (newScreenPoint.y - screenPoint.y) / this.zoom;

        this.updateMatrix();
    }

    /**
     * Converts a Screen position to World position.
     * @param {number} x
     * @param {number} y
     * @returns {Vector2}
     */
    screenToWorld(x, y) {
        return this.invTransform.transformPoint(new Vector2(x, y));
    }

    /**
     * Converts a World position to Screen position.
     * @param {number} x
     * @param {number} y
     * @returns {Vector2}
     */
    worldToScreen(x, y) {
        return this.transform.transformPoint(new Vector2(x, y));
    }

    /**
     * Apply camera transform to a canvas context.
     * @param {CanvasRenderingContext2D} ctx
     */
    applyTo(ctx) {
        // We scale by DPR immediately to ensure crispness
        ctx.scale(this.dpr, this.dpr);
        this.transform.applyToContext(ctx);
    }
}
