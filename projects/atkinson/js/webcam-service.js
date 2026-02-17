/**
 * Webcam Service Module
 * 
 * Handles interaction with the user's camera via the MediaDevices API.
 * Provides a video element source for the processor.
 */

export class WebcamService {
    constructor() {
        this.videoElement = document.createElement('video');
        this.videoElement.autoplay = true;
        this.videoElement.playsInline = true;
        this.videoElement.muted = true; // Required for autoplay in many browsers

        this.stream = null;
        this.isActive = false;

        // Error callback
        this.onError = (err) => console.error("Webcam Error:", err);
    }

    /**
     * Request access to the user's webcam.
     * @param {Object} constraints - Optional media constraints.
     * @returns {Promise<HTMLVideoElement>} - Resolves with the video element when ready.
     */
    async start(constraints = { video: { width: 640, height: 480 } }) {
        if (this.isActive) return this.videoElement;

        try {
            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.videoElement.srcObject = this.stream;

            // Wait for metadata to load (dimensions)
            await new Promise((resolve) => {
                this.videoElement.onloadedmetadata = () => {
                    this.videoElement.play();
                    this.isActive = true;
                    resolve();
                };
            });

            return this.videoElement;

        } catch (err) {
            this.isActive = false;
            if (this.onError) this.onError(err);
            throw err;
        }
    }

    /**
     * Stop the webcam stream and release resources.
     */
    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        this.videoElement.srcObject = null;
        this.isActive = false;
    }

    /**
     * Check permissions (optional utility).
     */
    async checkPermissions() {
        try {
            // New API, might not be supported everywhere
            if (navigator.permissions && navigator.permissions.query) {
                const result = await navigator.permissions.query({ name: 'camera' });
                return result.state;
            }
        } catch (e) {
            return 'unknown';
        }
        return 'unknown';
    }

    getVideoElement() {
        return this.videoElement;
    }
}
