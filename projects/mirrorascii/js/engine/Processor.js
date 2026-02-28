/**
 * @file Processor.js
 * @description Frame processing engine for MirrorASCII.
 * 
 * The Processor class is responsible for the bridge between the raw video stream
 * and the ASCII rendering logic. It handles:
 * 1. Sampling frames from the hidden video source.
 * 2. Downscaling high-resolution video into a lower-resolution "ASCII grid".
 * 3. Extracting pixel data (RGBA) and calculating luminance (brightness) for each cell.
 * 4. Providing a clean data structure for the ASCII logic to map characters to.
 * 
 * Performance is the primary concern here, as this logic runs every frame.
 * We use an internal canvas for sampling to leverage GPU-accelerated drawing and scaling.
 */

class Processor {
    /**
     * Initializes the Processor.
     * @param {CameraManager} cameraManager The camera manager instance providing the video source.
     */
    constructor(cameraManager) {
        /** @type {CameraManager} */
        this.cameraManager = cameraManager;

        /** 
         * The internal canvas used for sampling and downscaling the video frame.
         * @type {HTMLCanvasElement} 
         */
        this.sampleCanvas = document.createElement('canvas');

        /** 
         * The 2D context for the sampling canvas.
         * @type {CanvasRenderingContext2D} 
         */
        this.sampleContext = this.sampleCanvas.getContext('2d', { willReadFrequently: true });

        /**
         * The target width of the ASCII grid (in columns).
         * Higher values increase detail but decrease performance.
         * @type {number}
         */
        this.gridWidth = 100;

        /**
         * The target height of the ASCII grid (in rows).
         * Usually calculated based on aspect ratio and font metrics.
         * @type {number}
         */
        this.gridHeight = 0;

        /**
         * Brightness offset/multiplier for user control.
         * @type {number}
         */
        this.brightnessAdjustment = 1.0;

        /**
         * Contrast adjustment (optional, for future expansion).
         * @type {number}
         */
        this.contrastAdjustment = 1.0;

        console.log('[Processor] Engine initialized.');
    }

    /**
     * Updates the grid dimensions based on the video source aspect ratio.
     * @param {number} columns Number of characters horizontally.
     * @param {number} fontAspectRatio Height/Width ratio of the target font (usually ~2.0 for monospace).
     */
    updateGridScale(columns, fontAspectRatio = 2.0) {
        const { width, height } = this.cameraManager.getDimensions();

        if (width === 0 || height === 0) return;

        this.gridWidth = columns;

        // monospace characters are taller than they are wide.
        // To preserve image aspect ratio, we need to divide the video aspect 
        // ratio by the font aspect ratio.
        const videoAspect = width / height;
        this.gridHeight = Math.floor(this.gridWidth / (videoAspect * fontAspectRatio));

        this.sampleCanvas.width = this.gridWidth;
        this.sampleCanvas.height = this.gridHeight;

        console.log(`[Processor] Grid updated: ${this.gridWidth}x${this.gridHeight}`);
    }

    /**
     * Processes the current video frame into a grid of pixel data objects.
     * @returns {Array<{char: string, brightness: number, color: string}>|null}
     */
    processFrame() {
        const video = this.cameraManager.getVideoSource();
        if (!video || !this.cameraManager.isActive) return null;

        // 1. Draw and downscale: The browser does the heavy lifting of interpolation here.
        this.sampleContext.drawImage(video, 0, 0, this.gridWidth, this.gridHeight);

        // 2. Extract pixel data.
        const imageData = this.sampleContext.getImageData(0, 0, this.gridWidth, this.gridHeight);
        const pixels = imageData.data;
        const gridData = [];

        // Track min and max brightness for auto-exposure
        let minB = 1.0;
        let maxB = 0.0;

        // 3. First pass: calculate raw brightness and detect range
        for (let i = 0; i < pixels.length; i += 4) {
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];

            let luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

            if (luminance < minB) minB = luminance;
            if (luminance > maxB) maxB = luminance;

            gridData.push({
                luminance: luminance,
                r: r, g: g, b: b
            });
        }

        // 4. Second pass: normalize and apply user adjustments
        const result = [];
        const range = maxB - minB;

        for (const item of gridData) {
            let b = item.luminance;

            // Auto-exposure normalization
            if (range > 0.05) { // Avoid normalizing noise in near-black scenes
                b = (b - minB) / range;
            }

            // Apply manual multiplier
            b = Math.min(1.0, b * this.brightnessAdjustment);

            result.push({
                brightness: b,
                color: `rgb(${item.r},${item.g},${item.b})`
            });
        }

        return result;
    }

    /**
     * Adjusts the brightness multiplier.
     * @param {number} value Expected 0.0 to 2.0+
     */
    setBrightness(value) {
        this.brightnessAdjustment = value;
    }

    /**
     * Gets the current grid metadata.
     * @returns {{cols: number, rows: number}}
     */
    getMetadata() {
        return {
            cols: this.gridWidth,
            rows: this.gridHeight
        };
    }
}

// Exporting logic
window.Processor = Processor;
