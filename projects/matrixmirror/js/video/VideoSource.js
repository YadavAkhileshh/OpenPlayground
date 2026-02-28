/**
 * @file VideoSource.js
 * @description Handles webcam access and frame capture.
 * Maintains a hidden video element and an offscreen canvas for pixel reading.
 */

export class VideoSource {
    constructor() {
        this.video = document.createElement('video');
        this.video.autoplay = true;
        this.video.playsInline = true;
        this.video.style.display = 'none';
        document.body.appendChild(this.video);

        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

        this.width = 0;
        this.height = 0;
        this.isReady = false;
    }

    /**
     * Request webcam access.
     */
    async initialize() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                },
                audio: false
            });

            this.video.srcObject = stream;

            return new Promise((resolve) => {
                this.video.onloadedmetadata = () => {
                    this.width = this.video.videoWidth;
                    this.height = this.video.videoHeight;
                    this.canvas.width = this.width;
                    this.canvas.height = this.height;
                    this.isReady = true;
                    console.log(`Video initialized: ${this.width}x${this.height}`);
                    resolve();
                };
            });

        } catch (err) {
            console.error('Error accessing webcam:', err);
            throw err;
        }
    }

    /**
     * Capture a frame and return pixel data resized to target dimensions.
     * @param {number} cols - Number of columns in the ASCII grid.
     * @param {number} rows - Number of rows in the ASCII grid.
     * @returns {Uint8ClampedArray} Pixel data (RGBA).
     */
    getFrameData(cols, rows) {
        if (!this.isReady) return null;

        // Draw video to offscreen canvas, scaling it down to grid size
        this.ctx.drawImage(this.video, 0, 0, cols, rows);

        // Read pixels
        const frame = this.ctx.getImageData(0, 0, cols, rows);
        return frame.data;
    }
}
