import { APP_CONFIG, ERRORS } from './constants.js';

/**
 * ImageProcessor Class
 * 
 * A utility class for handling HTML5 Canvas operations.
 * It abstracts away the complexity of context management and pixel data access.
 */
export class ImageProcessor {

    /**
     * Loads an image from a file object (e.g., from drag-and-drop or file input).
     * @param {File} file - The image file to load.
     * @returns {Promise<HTMLImageElement>} - Resolves with the loaded Image object.
     */
    static async loadImage(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error("No file provided"));
                return;
            }

            const reader = new FileReader();

            reader.onload = (event) => {
                const img = new Image();

                img.onload = () => {
                    resolve(img);
                };

                img.onerror = () => {
                    reject(new Error(ERRORS.INVALID_FILE_TYPE));
                };

                img.src = event.target.result;
            };

            reader.onerror = () => {
                reject(new Error(ERRORS.INVALID_FILE_TYPE));
            };

            reader.readAsDataURL(file);
        });
    }

    /**
     * Resizes a canvas to match the image dimensions and draws the image onto it.
     * @param {HTMLCanvasElement} canvas - The target canvas element.
     * @param {HTMLImageElement} image - The source image.
     * @returns {CanvasRenderingContext2D} - The 2D context of the canvas.
     */
    static videoImageToCanvas(canvas, image) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        // precise width/height setting
        canvas.width = image.width;
        canvas.height = image.height;

        // Clear and draw
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0);

        return ctx;
    }

    /**
     * Retrieves the ImageData object from a canvas.
     * @param {HTMLCanvasElement} canvas - The source canvas.
     * @returns {ImageData} - The pixel data of the canvas.
     */
    static getImageData(canvas) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        return ctx.getImageData(0, 0, canvas.width, canvas.height);
    }

    /**
     * Creates a new ImageData object with specified dimensions.
     * @param {number} width 
     * @param {number} height 
     * @returns {ImageData}
     */
    static createEmptyImageData(width, height) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        return ctx.createImageData(width, height);
    }

    /**
     * Validates if the secret image can fit inside the cover image.
     * We calculate the capacity based on pixels.
     * 
     * Note: This is a basic check. The actual bit capacity is determined by 
     * the number of channels (3: RGB) and bits per channel used.
     * 
     * @param {HTMLImageElement} coverImage 
     * @param {HTMLImageElement} secretImage 
     * @param {number} bitsPerChannel 
     * @returns {boolean}
     */
    static canFit(coverImage, secretImage, bitsPerChannel = 1) {
        const coverPixels = coverImage.width * coverImage.height;
        const secretPixels = secretImage.width * secretImage.height;

        // Each pixel has 4 channels (RGBA), but we usually only use RGB for storage (3 channels)
        // because modifying Alpha can cause transparency issues.
        // Capacity in bits = coverPixels * 3 * bitsPerChannel
        const capacityBits = coverPixels * 3 * bitsPerChannel;

        // Secret size in bits = secretPixels * 4 (RGBA) * 8 (bits per byte)
        // We need to store the full structure of the secret image.
        // Plus some overhead for the header (dimensions).
        const requiredBits = (secretPixels * 32) + 64; // 32 bits per pixel + 64 bits header buffer

        return capacityBits >= requiredBits;
    }

    /**
     * Converts an ImageData object to a data URL for downloading/displaying.
     * @param {ImageData} imageData 
     * @returns {string} - Base64 data URL
     */
    static imageDataToURL(imageData) {
        const canvas = document.createElement('canvas');
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        const ctx = canvas.getContext('2d');
        ctx.putImageData(imageData, 0, 0);
        return canvas.toDataURL('image/png');
    }
}
