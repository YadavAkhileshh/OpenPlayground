/**
 * DarkFluid - Cinematic Fluid Simulation
 * Renderer Module
 * 
 * Handles the visualization of the fluid data.
 * Transforms the abstract density field into a high-fidelity visual.
 * 
 * @module Renderer
 */

import { Config } from './config.js';

export class FluidRenderer {
    /**
     * @param {HTMLCanvasElement} canvas 
     * @param {import('./grid.js').FluidGrid} grid 
     */
    constructor(canvas, grid) {
        this.canvas = canvas;
        this.grid = grid;
        this.ctx = canvas.getContext('2d', { alpha: false }); // Optimize for no transparency

        // Buffer setup
        this.width = grid.size;
        this.height = grid.size;

        // ImageData buffer for direct pixel manipulation
        this.imageData = this.ctx.createImageData(this.width, this.height);
        this.buffer = new ArrayBuffer(this.imageData.data.length);
        this.buffer8 = new Uint8ClampedArray(this.buffer);
        this.data = new Uint32Array(this.buffer); // 32-bit view for faster writes
    }

    /**
     * Main draw function called every frame.
     */
    render() {
        const { density } = this.grid;
        const { BASE_COLOR, ACCENT_COLOR, SECONDARY_COLOR, CONTRAST, BRIGHTNESS } = Config.RENDER;
        const pixels = this.data;
        const N = this.grid.size;

        // Iterate through all grid cells
        for (let i = 0; i < this.grid.count; i++) {
            let d = density[i];

            // Apply cosmetic curves
            // 1. Thresholding/Contrast
            if (d < 0.1) d = 0;
            else d = Math.pow(d * 0.005 * CONTRAST, 0.9) * 255;

            // Clamp
            if (d > 255) d = 255;


            // Color Mapping
            // We'll treat 'd' as an intensity value to interpolate between Base and Accent
            const t = d / 255.0;

            // Ease out/in curve for smoother color blending
            // const smoothT = t * t * (3 - 2 * t); 

            // Linear blend for speed in JS (can optimize later if needed)
            let r, g, b;

            if (t < 0.5) {
                // Blend Base -> Accent
                const mix = t * 2;
                r = (1 - mix) * BASE_COLOR.r + mix * ACCENT_COLOR.r;
                g = (1 - mix) * BASE_COLOR.g + mix * ACCENT_COLOR.g;
                b = (1 - mix) * BASE_COLOR.b + mix * ACCENT_COLOR.b;
            } else {
                // Blend Accent -> Secondary (for hot spots)
                const mix = (t - 0.5) * 2;
                r = (1 - mix) * ACCENT_COLOR.r + mix * SECONDARY_COLOR.r;
                g = (1 - mix) * ACCENT_COLOR.g + mix * SECONDARY_COLOR.g;
                b = (1 - mix) * ACCENT_COLOR.b + mix * SECONDARY_COLOR.b;
            }

            // Apply global brightness boost
            r *= BRIGHTNESS;
            g *= BRIGHTNESS;
            b *= BRIGHTNESS;

            // ABGR bitwise packing for Little Endian architecture
            // (Standard for Canvas ImageData)
            pixels[i] =
                (255 << 24) | // Alpha (always 255)
                ((b & 0xFF) << 16) |
                ((g & 0xFF) << 8) |
                (r & 0xFF);
        }

        // Push buffer to imageData
        this.imageData.data.set(this.buffer8);

        // Draw to canvas
        // Note: We are drawing small 128x128 image to potentially large canvas.
        // We rely on CSS 'image-rendering: pixelated' or smooth scaling depending on desired look.
        // For "Cinematic", usually smooth scaling (bilinear) is better, initialized in CSS.

        // Create a temporary offscreen canvas or just putImageData and let CSS scale it?
        // simple putImageData puts it at 1:1 top left. We need to scale it up.
        // Efficient way: Draw to a small temp canvas, then drawImage that scaled up.

        this.ctx.putImageData(this.imageData, 0, 0);

        // --- BLOOM PASS ---
        // Manually calculate Gaussian Blur on top of the rendered image
        // Only if Glow > 0
        if (Config.RENDER.GLOW > 0) {
            this.applyBloom();
        }
    }

    /**
     * Applies a separated Gaussian Blur pass (Horizon + Vertical)
     * effectively creating a glow effect.
     * Note: This is CPU intensive in JS. Optimized with fixed kernel and downsampling.
     */
    applyBloom() {
        const width = this.width;
        const height = this.height;
        const data = this.data; // The source image 32-bit (ABGR)

        // We need a separate buffer for the blur
        // Ideally we reuse a buffer. 
        if (!this.bloomBuffer) {
            this.bloomBuffer = new Uint32Array(width * height);
            this.bloomBuffer2 = new Uint32Array(width * height); // For 2-pass
        }

        // Optimization: A true Gaussian is expensive. We'll use a simple box blur or 3-pass box blur (approximates Gaussian)
        // or a small 5-tap kernel.

        const intensity = Config.RENDER.GLOW;

        // COPY data to buffer
        this.bloomBuffer.set(data);

        // Pass 1: Horizontal Blur
        this.boxBlurH(this.bloomBuffer, this.bloomBuffer2, width, height, 1);

        // Pass 2: Vertical Blur
        this.boxBlurT(this.bloomBuffer2, this.bloomBuffer, width, height, 1);

        // Composite: Additive blending
        // Source (data) + Blur (bloomBuffer)
        for (let i = 0; i < width * height; i++) {
            const src = data[i];
            const blur = this.bloomBuffer[i];

            // Extract components
            const sr = (src) & 0xFF;
            const sg = (src >> 8) & 0xFF;
            const sb = (src >> 16) & 0xFF;

            const br = (blur) & 0xFF;
            const bg = (blur >> 8) & 0xFF;
            const bb = (blur >> 16) & 0xFF;

            // Additive with intensity
            let nr = sr + br * intensity;
            let ng = sg + bg * intensity;
            let nb = sb + bb * intensity;

            // Clamp
            if (nr > 255) nr = 255;
            if (ng > 255) ng = 255;
            if (nb > 255) nb = 255;

            data[i] = (255 << 24) | (nb << 16) | (ng << 8) | nr;
        }

        // Update ImageData again? 
        // We modified 'data' in place (which is a view on buffer), so yes
        this.imageData.data.set(this.buffer8);
        this.ctx.putImageData(this.imageData, 0, 0);
    }

    /**
     * Horizontal Box Blur
     */
    boxBlurH(scl, tcl, w, h, r) {
        for (let i = 0; i < h; i++) {
            for (let j = 0; j < w; j++) {
                let valR = 0, valG = 0, valB = 0;
                let hits = 0;
                for (let ix = j - r; ix <= j + r; ix++) {
                    if (ix >= 0 && ix < w) {
                        const col = scl[i * w + ix];
                        valR += (col) & 0xFF;
                        valG += (col >> 8) & 0xFF;
                        valB += (col >> 16) & 0xFF;
                        hits++;
                    }
                }
                const idx = i * w + j;
                tcl[idx] = (255 << 24) | (((valB / hits) | 0) << 16) | (((valG / hits) | 0) << 8) | ((valR / hits) | 0);
            }
        }
    }

    /**
     * Vertical Box Blur
     */
    boxBlurT(scl, tcl, w, h, r) {
        for (let i = 0; i < h; i++) {
            for (let j = 0; j < w; j++) {
                let valR = 0, valG = 0, valB = 0;
                let hits = 0;
                for (let iy = i - r; iy <= i + r; iy++) {
                    if (iy >= 0 && iy < h) {
                        const col = scl[iy * w + j];
                        valR += (col) & 0xFF;
                        valG += (col >> 8) & 0xFF;
                        valB += (col >> 16) & 0xFF;
                        hits++;
                    }
                }
                const idx = i * w + j;
                tcl[idx] = (255 << 24) | (((valB / hits) | 0) << 16) | (((valG / hits) | 0) << 8) | ((valR / hits) | 0);
            }
        }
    }

    /**
     * Resizes the internal buffers if grid size changes (not currently dynamic, but good for future).
     */
    resize(size) {
        this.width = size;
        this.height = size;
        this.imageData = this.ctx.createImageData(size, size);
        this.buffer = new ArrayBuffer(this.imageData.data.length);
        this.buffer8 = new Uint8ClampedArray(this.buffer);
        this.data = new Uint32Array(this.buffer);
    }
}
