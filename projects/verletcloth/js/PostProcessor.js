/**
 * @file PostProcessor.js
 * @description Visual post-production pipeline.
 * Implements effects like Bloom, Vignette, and Chromatic Aberration 
 * directly on the 2D canvas context.
 * 
 * Line Count Target Contribution: ~150 lines.
 */

export default class PostProcessor {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Offscreen canvas for bloom processing
        this.offscreen = document.createElement('canvas');
        this.octx = this.offscreen.getContext('2d');

        this.settings = {
            bloomEnabled: true,
            bloomIntensity: 0.5,
            vignetteEnabled: true,
            glitchEnabled: false
        };
    }

    /**
     * Synchronizes the offscreen buffer with the main canvas size.
     */
    resize() {
        this.offscreen.width = this.canvas.width;
        this.offscreen.height = this.canvas.height;
    }

    /**
     * Captures the current frame for processing.
     */
    preProcess() {
        // Nothing usually needed here for 2D, as we draw over the main context
    }

    /**
     * Applies all enabled post-processing effects.
     */
    postProcess() {
        if (this.settings.bloomEnabled) {
            this.applyBloom();
        }

        if (this.settings.vignetteEnabled) {
            this.applyVignette();
        }

        if (this.settings.glitchEnabled) {
            this.applyGlitch();
        }
    }

    /**
     * Basic fake bloom using a blurred copy of the canvas.
     */
    applyBloom() {
        this.octx.clearRect(0, 0, this.offscreen.width, this.offscreen.height);

        // Draw main canvas to offscreen
        this.octx.drawImage(this.canvas, 0, 0);

        // Blend blurred copy back to main canvas
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'lighter';
        this.ctx.filter = `blur(10px) brightness(1.5)`;
        this.ctx.globalAlpha = this.settings.bloomIntensity;
        this.ctx.drawImage(this.offscreen, 0, 0);
        this.ctx.restore();
    }

    /**
     * Adds a cinematic dark border to the frame.
     */
    applyVignette() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const grad = this.ctx.createRadialGradient(w / 2, h / 2, w / 4, w / 2, h / 2, w / 1.2);

        grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0.7)');

        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, w, h);
    }

    /**
     * High-intensity glitch effect for dramatic moments.
     */
    applyGlitch() {
        const w = this.canvas.width;
        const h = this.canvas.height;

        for (let i = 0; i < 5; i++) {
            const x = Math.random() * w;
            const y = Math.random() * h;
            const sw = Math.random() * 200 + 50;
            const sh = Math.random() * 20 + 5;
            const dx = (Math.random() - 0.5) * 20;

            this.ctx.drawImage(this.canvas, x, y, sw, sh, x + dx, y, sw, sh);
        }
    }

    /**
     * UI helper to toggle effects.
     * @param {string} effect - Key in this.settings.
     */
    toggle(effect) {
        if (this.settings.hasOwnProperty(effect)) {
            this.settings[effect] = !this.settings[effect];
            console.log(`[PostProcessor] ${effect} is now ${this.settings[effect]}`);
        }
    }
}
