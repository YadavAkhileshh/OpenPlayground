/**
 * QuadCompress Image Loader
 * 
 * Handles the loading of images from the filesystem, resizing them to fit
 * within the viewports (if necessary), and extracting raw pixel data
 * for the algorithm to process.
 * 
 * @module ImageLoader
 */

import { CONFIG } from '../config.js';
import { Logger } from '../utils/logger.js';

export class ImageLoader {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            Logger.error('ImageLoader', `Canvas with ID "${canvasId}" not found.`);
            throw new Error('Canvas element missing');
        }
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        this.imageData = null;
        this.width = 0;
        this.height = 0;
    }

    /**
     * Loads an image from a File object (e.g. from input[type="file"])
     * @param {File} file 
     * @returns {Promise<Object>} Resolves with { width, height, imageData }
     */
    async loadFromFile(file) {
        return new Promise((resolve, reject) => {
            if (!file.type.startsWith('image/')) {
                reject(new Error('File is not an image'));
                return;
            }

            const reader = new FileReader();

            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    this._processImage(img);
                    resolve({
                        width: this.width,
                        height: this.height,
                        imageData: this.imageData
                    });
                };
                img.onerror = () => reject(new Error('Failed to load image data'));
                img.src = e.target.result;
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }

    /**
     * Internal method to draw image to canvas and extract data.
     * Handles resizing if the image is too large for the viewport/config.
     * @param {HTMLImageElement} img 
     */
    _processImage(img) {
        let w = img.width;
        let h = img.height;

        // Scale down if larger than config max dimensions
        // This is crucial for performance with 4k+ images
        const scale = Math.min(
            CONFIG.CANVAS.MAX_WIDTH / w,
            CONFIG.CANVAS.MAX_HEIGHT / h,
            1
        );

        w = Math.floor(w * scale);
        h = Math.floor(h * scale);

        // Resize internal canvas to match image
        this.canvas.width = w;
        this.canvas.height = h;

        // Draw image
        this.ctx.clearRect(0, 0, w, h);
        this.ctx.drawImage(img, 0, 0, w, h);

        // Extract buffer
        this.imageData = this.ctx.getImageData(0, 0, w, h);
        this.width = w;
        this.height = h;

        Logger.success('ImageLoader', `Image loaded and extracted: ${Math.round(w)}x${Math.round(h)}`);
    }

    /**
     * Returns the current standard ImageData object
     * @returns {ImageData}
     */
    getData() {
        return this.imageData;
    }

    /**
     * Utility to clear the loaded data
     */
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.imageData = null;
        this.width = 0;
        this.height = 0;
    }
}
