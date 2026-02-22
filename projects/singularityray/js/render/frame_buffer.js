/**
 * SingularityRay JS - Render - Frame Buffer
 * Manages the raw Uint8ClampedArray pixel data before
 * blasting it to the Canvas 2D context.
 */

export class FrameBuffer {
    /**
     * @param {HTMLCanvasElement} canvasElement 
     */
    constructor(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d', {
            alpha: false,
            desynchronized: true // performance hint for low latency
        });

        this.width = 0;
        this.height = 0;
        this.imageData = null;
        this.pixels = null;

        // Internal clock for progressive rendering hooks
        this.frameCounter = 0;
    }

    /**
     * Resize internal buffers if canvas size changes
     * @param {number} width 
     * @param {number} height 
     */
    resize(width, height) {
        if (this.width !== width || this.height !== height) {
            this.width = width;
            this.height = height;

            // Set actual canvas dims
            this.canvas.width = width;
            this.canvas.height = height;

            // Re-allocate ImageData buffer
            this.imageData = this.ctx.createImageData(width, height);
            this.pixels = this.imageData.data;
        }
    }

    /**
     * Clear the buffer to a specific color
     * @param {number} r 
     * @param {number} g 
     * @param {number} b 
     */
    clear(r = 0, g = 0, b = 0) {
        const p = this.pixels;
        const len = p.length;
        for (let i = 0; i < len; i += 4) {
            p[i] = r;
            p[i + 1] = g;
            p[i + 2] = b;
            p[i + 3] = 255;
        }
    }

    /**
     * Display the buffer onto the canvas synchronously
     */
    present() {
        this.ctx.putImageData(this.imageData, 0, 0);
        this.frameCounter++;
    }
}
