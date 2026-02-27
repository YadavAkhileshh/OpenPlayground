/**
 * Image Processor Module
 * 
 * Handles pre-dithering image transformations including:
 * 1. Grayscale conversion (Luma-based)
 * 2. Contrast adjustment
 * 3. Dithering (using selectable algorithm)
 * 4. CRT Post-Processing
 */

import { applyDither } from './dithering-algorithm.js';
import { CrtEffect } from './crt-effect.js';

export class ImageProcessor {
    constructor() {
        this.ctx = null;
        this.width = 0;
        this.height = 0;
        this.crtEffect = new CrtEffect();
    }

    init(ctx) {
        this.ctx = ctx;
        this.width = ctx.canvas.width;
        this.height = ctx.canvas.height;
    }

    processFrame(source, options) {
        if (!this.ctx) return;

        // Draw source
        this.ctx.drawImage(source, 0, 0, this.width, this.height);

        // Get pixel data
        const imageData = this.ctx.getImageData(0, 0, this.width, this.height);
        const data = imageData.data;

        // Pass 1: Grayscale & Contrast
        this.applyGrayscaleAndContrast(data, options.contrast);

        // Pass 2: Dithering
        if (options.ditherEnabled) {
            const algo = options.algorithm || 'atkinson';
            applyDither(imageData, algo, options.threshold);
        }

        // Pass 3: CRT Effects
        if (options.scanlineIntensity > 0 || options.noiseIntensity > 0) {
            this.crtEffect.apply(imageData, {
                scanlineIntensity: options.scanlineIntensity,
                noiseIntensity: options.noiseIntensity,
                rgbShift: 0 // Optional, keep 0 for now
            });
        }

        // Put data back
        this.ctx.putImageData(imageData, 0, 0);
    }

    applyGrayscaleAndContrast(data, contrast) {
        const intercept = 128 * (1 - contrast);

        // Iterate assuming RGBA
        for (let i = 0; i < data.length; i += 4) {
            // Luma Rec. 601
            let gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

            // Contrast
            gray = gray * contrast + intercept;

            // Clamp
            if (gray < 0) gray = 0;
            if (gray > 255) gray = 255;

            data[i] = gray;
            data[i + 1] = gray;
            data[i + 2] = gray;
        }
    }
}
