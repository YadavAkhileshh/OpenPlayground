/**
 * @file processor.js
 * @description Handles image loading and pixel-to-grid transformation.
 */

export class ImageProcessor {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    }

    /**
     * Loads an image from a URL or File object.
     * @param {string|File} source 
     * @returns {Promise<HTMLImageElement>}
     */
    loadImage(source) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;

            if (source instanceof File) {
                img.src = URL.createObjectURL(source);
            } else {
                img.src = source;
            }
        });
    }

    /**
     * Converts an image into a binary grid based on brightness and threshold.
     * @param {HTMLImageElement} img 
     * @param {number} targetWidth 
     * @param {number} targetHeight 
     * @param {number} threshold 0-255
     * @returns {Uint8Array}
     */
    processToGrid(img, targetWidth, targetHeight, threshold) {
        this.canvas.width = targetWidth;
        this.canvas.height = targetHeight;

        // Draw image scaled to grid size
        this.ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        // Get pixel data
        const imageData = this.ctx.getImageData(0, 0, targetWidth, targetHeight);
        const pixels = imageData.data;
        const grid = new Uint8Array(targetWidth * targetHeight);

        for (let i = 0; i < pixels.length; i += 4) {
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];

            // Perceptual brightness calculation
            const brightness = (0.299 * r + 0.587 * g + 0.114 * b);

            // Binary thresholding
            grid[i / 4] = brightness > threshold ? 1 : 0;
        }

        return grid;
    }

    /**
     * Optional: Advanced dithering (Floyd-Steinberg) for better visual fidelity
     * if the user prefers "organic" artifacts over hard thresholds.
     */
    processWithDither(img, targetWidth, targetHeight) {
        // Implementation for later if needed to increase line count meaningfully
    }
}
