/**
 * @file filters.js
 * @description Advanced post-processing filters for the biological aesthetic.
 * Implements grain, chromatic aberration, and scanline effects on-demand.
 */

export class PostProcessor {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d', { alpha: false });
    }

    /**
     * Applies a collection of filters to the source image.
     * @param {HTMLCanvasElement} sourceCanvas 
     * @param {Object} options 
     */
    apply(sourceCanvas, options = {}) {
        const { width, height } = sourceCanvas;

        if (this.canvas.width !== width || this.canvas.height !== height) {
            this.canvas.width = width;
            this.canvas.height = height;
        }

        // 1. Initial draw
        this.ctx.drawImage(sourceCanvas, 0, 0);

        // 2. Chromatic Aberration (R/B shift)
        if (options.aberration > 0) {
            this.applyAberration(width, height, options.aberration);
        }

        // 3. Digital Grain / Noise
        if (options.grain > 0) {
            this.applyGrain(width, height, options.grain);
        }

        // 4. Scanlines
        if (options.scanlines > 0) {
            this.applyScanlines(width, height, options.scanlines);
        }

        // 5. Vignette (Biological Focus)
        if (options.vignette > 0) {
            this.applyVignette(width, height, options.vignette);
        }

        return this.canvas;
    }

    /**
     * Shifts channels for a low-fi biological lens effect.
     */
    applyAberration(w, h, amount) {
        this.ctx.globalCompositeOperation = 'screen';
        this.ctx.globalAlpha = 0.5;

        // Red shift
        this.ctx.drawImage(this.canvas, amount, 0, w, h, 0, 0, w, h);
        // Blue shift
        this.ctx.drawImage(this.canvas, -amount, 0, w, h, 0, 0, w, h);

        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.globalAlpha = 1.0;
    }

    /**
     * Adds high-frequency noise.
     */
    applyGrain(w, h, intensity) {
        const imageData = this.ctx.getImageData(0, 0, w, h);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * intensity;
            data[i] += noise;
            data[i + 1] += noise;
            data[i + 2] += noise;
        }

        this.ctx.putImageData(imageData, 0, 0);
    }

    /**
     * Renders horizontal scanlines.
     */
    applyScanlines(w, h, intensity) {
        this.ctx.fillStyle = `rgba(0, 0, 0, ${intensity})`;
        for (let i = 0; i < h; i += 4) {
            this.ctx.fillRect(0, i, w, 2);
        }
    }

    /**
     * Adds a dark circular border focus.
     */
    applyVignette(w, h, intensity) {
        const grd = this.ctx.createRadialGradient(w / 2, h / 2, w / 4, w / 2, h / 2, h / 1.2);
        grd.addColorStop(0, 'rgba(0, 0, 0, 0)');
        grd.addColorStop(1, `rgba(0, 0, 0, ${intensity})`);

        this.ctx.fillStyle = grd;
        this.ctx.fillRect(0, 0, w, h);
    }
}
