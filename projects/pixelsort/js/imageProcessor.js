/**
 * PixelSort - Image Processor Module
 * Handles image loading, canvas rendering, and pixel data management
 */

class ImageProcessor {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.originalImageData = null;
        this.currentImageData = null;
        this.image = null;
        this.imageLoaded = false;
    }

    /**
     * Initialize the canvas with a given element
     * @param {HTMLCanvasElement} canvasElement - The canvas element to use
     */
    initialize(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        
        // Set canvas rendering properties for crisp pixels
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
        this.ctx.msImageSmoothingEnabled = false;
    }

    /**
     * Load an image from a file
     * @param {File} file - The image file to load
     * @returns {Promise} Resolves when image is loaded
     */
    loadImage(file) {
        return new Promise((resolve, reject) => {
            // Validate file type
            if (!file.type.match('image.*')) {
                reject(new Error('Invalid file type. Please select an image.'));
                return;
            }

            // Validate file size (max 10MB)
            const maxSize = 10 * 1024 * 1024;
            if (file.size > maxSize) {
                reject(new Error('File too large. Maximum size is 10MB.'));
                return;
            }

            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                
                img.onload = () => {
                    this.image = img;
                    this.renderImage();
                    this.imageLoaded = true;
                    resolve({
                        width: img.width,
                        height: img.height,
                        name: file.name,
                        size: file.size
                    });
                };
                
                img.onerror = () => {
                    reject(new Error('Failed to load image.'));
                };
                
                img.src = e.target.result;
            };
            
            reader.onerror = () => {
                reject(new Error('Failed to read file.'));
            };
            
            reader.readAsDataURL(file);
        });
    }

    /**
     * Render the current image to the canvas
     */
    renderImage() {
        if (!this.image) return;

        // Calculate dimensions to fit canvas while maintaining aspect ratio
        const maxWidth = 1200;
        const maxHeight = 800;
        
        let width = this.image.width;
        let height = this.image.height;
        
        // Scale down if necessary
        if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
        }

        // Set canvas dimensions
        this.canvas.width = width;
        this.canvas.height = height;

        // Draw image
        this.ctx.drawImage(this.image, 0, 0, width, height);

        // Store original image data
        this.originalImageData = this.ctx.getImageData(0, 0, width, height);
        this.currentImageData = this.ctx.getImageData(0, 0, width, height);
    }

    /**
     * Get the current image data
     * @returns {ImageData} Current image data
     */
    getImageData() {
        return this.currentImageData;
    }

    /**
     * Set new image data to the canvas
     * @param {ImageData} imageData - The image data to set
     */
    setImageData(imageData) {
        this.currentImageData = imageData;
        this.ctx.putImageData(imageData, 0, 0);
    }

    /**
     * Reset to original image
     */
    reset() {
        if (this.originalImageData) {
            this.currentImageData = new ImageData(
                new Uint8ClampedArray(this.originalImageData.data),
                this.originalImageData.width,
                this.originalImageData.height
            );
            this.ctx.putImageData(this.currentImageData, 0, 0);
        }
    }

    /**
     * Export canvas as image
     * @param {string} format - Image format (png, jpeg, webp)
     * @param {number} quality - Image quality (0-1)
     * @returns {string} Data URL of the image
     */
    exportImage(format = 'png', quality = 1.0) {
        const mimeType = `image/${format}`;
        return this.canvas.toDataURL(mimeType, quality);
    }

    /**
     * Download the current canvas as an image file
     * @param {string} filename - Name for the downloaded file
     */
    downloadImage(filename = 'pixelsort-export.png') {
        const dataURL = this.exportImage('png', 1.0);
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Get pixel at specific coordinates
     * @param {ImageData} imageData - Image data to read from
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {Object} Pixel data {r, g, b, a}
     */
    getPixel(imageData, x, y) {
        const index = (y * imageData.width + x) * 4;
        return {
            r: imageData.data[index],
            g: imageData.data[index + 1],
            b: imageData.data[index + 2],
            a: imageData.data[index + 3]
        };
    }

    /**
     * Set pixel at specific coordinates
     * @param {ImageData} imageData - Image data to write to
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {Object} pixel - Pixel data {r, g, b, a}
     */
    setPixel(imageData, x, y, pixel) {
        const index = (y * imageData.width + x) * 4;
        imageData.data[index] = pixel.r;
        imageData.data[index + 1] = pixel.g;
        imageData.data[index + 2] = pixel.b;
        imageData.data[index + 3] = pixel.a;
    }

    /**
     * Calculate brightness of a pixel
     * @param {Object} pixel - Pixel data {r, g, b, a}
     * @returns {number} Brightness value (0-255)
     */
    getBrightness(pixel) {
        // Using luminance formula
        return 0.299 * pixel.r + 0.587 * pixel.g + 0.114 * pixel.b;
    }

    /**
     * Convert RGB to HSL
     * @param {Object} pixel - Pixel data {r, g, b}
     * @returns {Object} HSL values {h, s, l}
     */
    rgbToHsl(pixel) {
        const r = pixel.r / 255;
        const g = pixel.g / 255;
        const b = pixel.b / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const delta = max - min;

        let h = 0;
        let s = 0;
        const l = (max + min) / 2;

        if (delta !== 0) {
            s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

            switch (max) {
                case r:
                    h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
                    break;
                case g:
                    h = ((b - r) / delta + 2) / 6;
                    break;
                case b:
                    h = ((r - g) / delta + 4) / 6;
                    break;
            }
        }

        return {
            h: h * 360,
            s: s * 100,
            l: l * 100
        };
    }

    /**
     * Get saturation of a pixel
     * @param {Object} pixel - Pixel data {r, g, b}
     * @returns {number} Saturation value (0-100)
     */
    getSaturation(pixel) {
        const hsl = this.rgbToHsl(pixel);
        return hsl.s;
    }

    /**
     * Get hue of a pixel
     * @param {Object} pixel - Pixel data {r, g, b}
     * @returns {number} Hue value (0-360)
     */
    getHue(pixel) {
        const hsl = this.rgbToHsl(pixel);
        return hsl.h;
    }

    /**
     * Create a copy of image data
     * @param {ImageData} imageData - Image data to copy
     * @returns {ImageData} Copied image data
     */
    copyImageData(imageData) {
        return new ImageData(
            new Uint8ClampedArray(imageData.data),
            imageData.width,
            imageData.height
        );
    }

    /**
     * Check if image is loaded
     * @returns {boolean} True if image is loaded
     */
    isLoaded() {
        return this.imageLoaded;
    }

    /**
     * Get canvas dimensions
     * @returns {Object} Canvas dimensions {width, height}
     */
    getDimensions() {
        return {
            width: this.canvas ? this.canvas.width : 0,
            height: this.canvas ? this.canvas.height : 0
        };
    }

    /**
     * Clear the canvas
     */
    clear() {
        if (this.canvas && this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        this.originalImageData = null;
        this.currentImageData = null;
        this.image = null;
        this.imageLoaded = false;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImageProcessor;
}
