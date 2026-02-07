/**
 * @file CameraManager.js
 * @description Core module for handling webcam access and stream management.
 * 
 * MirrorASCII relies on a steady stream of video data to process into ASCII characters.
 * The CameraManager class encapsulates all browser-level logic for:
 * 1. Checking for media device availability.
 * 2. Requesting user permission for the webcam.
 * 3. Initializing a concealed video element to serve as the data source.
 * 4. Handling stream lifecycle events (start, stop, errors).
 * 
 * This module is designed to be resilient and provide clear feedback if the webcam
 * is unavailable or if the user denies permission.
 */

class CameraManager {
    /**
     * Initializes a new instance of the CameraManager.
     * Sets up internal state and the video element used for capturing frames.
     */
    constructor() {
        /**
         * The HTMLVideoElement that receives the webcam stream.
         * This element is typically kept hidden from the user, as we render
         * the ASCII representation instead.
         * @type {HTMLVideoElement|null}
         */
        this.videoElement = null;

        /**
         * The active MediaStream object.
         * @type {MediaStream|null}
         */
        this.stream = null;

        /**
         * Flag indicating whether the camera is currently active and streaming.
         * @type {boolean}
         */
        this.isActive = false;

        /**
         * Configuration for the camera stream request.
         * We specifically want video only, with preferred dimensions for 
         * performance-balanced ASCII conversion.
         * @type {Object}
         */
        this.constraints = {
            video: {
                width: { ideal: 640 },
                height: { ideal: 480 },
                frameRate: { ideal: 30 }
            },
            audio: false
        };

        // Initialize the internal video element.
        this._initializeVideoElement();
    }

    /**
     * Creates and configures the hidden video element used for stream capture.
     * @private
     */
    _initializeVideoElement() {
        this.videoElement = document.createElement('video');
        this.videoElement.setAttribute('autoplay', '');
        this.videoElement.setAttribute('playsinline', '');
        this.videoElement.style.display = 'none';
        
        // Append to body to ensure it's part of the DOM, even if hidden.
        document.body.appendChild(this.videoElement);
        
        console.log('[CameraManager] Internal video element initialized.');
    }

    /**
     * Requests access to the user's webcam and starts the stream.
     * @returns {Promise<boolean>} Resolves to true if successful, false otherwise.
     */
    async start() {
        if (this.isActive) {
            console.warn('[CameraManager] Camera is already active.');
            return true;
        }

        try {
            console.log('[CameraManager] Requesting camera access...');
            
            // Check if mediaDevices API is supported.
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Webcam API (getUserMedia) is not supported by this browser.');
            }

            // Request the stream from the user.
            this.stream = await navigator.mediaDevices.getUserMedia(this.constraints);
            
            // Assign the stream to the video element.
            this.videoElement.srcObject = this.stream;
            
            // Wait for the video to be ready to play.
            await new Promise((resolve) => {
                this.videoElement.onloadedmetadata = () => {
                    this.videoElement.play();
                    resolve();
                };
            });

            this.isActive = true;
            console.log('[CameraManager] Camera stream started successfully.');
            return true;

        } catch (error) {
            console.error('[CameraManager] Failed to start camera stream:', error.message);
            this._handleError(error);
            return false;
        }
    }

    /**
     * Stops the webcam stream and cleans up resources.
     */
    stop() {
        if (!this.isActive || !this.stream) {
            return;
        }

        console.log('[CameraManager] Stopping camera stream...');
        
        // Stop all tracks in the stream.
        const tracks = this.stream.getTracks();
        tracks.forEach(track => track.stop());
        
        // Clear the video element source.
        this.videoElement.srcObject = null;
        this.isActive = false;
        this.stream = null;
        
        console.log('[CameraManager] Camera stream stopped.');
    }

    /**
     * Centralized error handling for camera-related issues.
     * @param {Error} error The error object encountered.
     * @private
     */
    _handleError(error) {
        let userMessage = 'Unable to access webcam.';
        
        if (error.name === 'NotAllowedError') {
            userMessage = 'Webcam permission was denied. Please allow access to use the ASCII Mirror.';
        } else if (error.name === 'NotFoundError') {
            userMessage = 'No webcam found on this device.';
        } else if (error.name === 'NotReadableError') {
            userMessage = 'Webcam is already in use by another application.';
        }

        // Dispatch a custom event for the UI to handle and display to the user.
        const event = new CustomEvent('camera-error', { 
            detail: { message: userMessage, originalError: error } 
        });
        window.dispatchEvent(event);
    }

    /**
     * Returns the current dimensions of the video stream.
     * Helpful for scaling the ASCII grid.
     * @returns {{width: number, height: number}}
     */
    getDimensions() {
        if (!this.videoElement) {
            return { width: 0, height: 0 };
        }
        return {
            width: this.videoElement.videoWidth,
            height: this.videoElement.videoHeight
        };
    }

    /**
     * Provides access to the video element for frame processing.
     * @returns {HTMLVideoElement|null}
     */
    getVideoSource() {
        return this.videoElement;
    }
}

// Exporting logic (Simplified for Vanilla JS injection or global usage)
window.CameraManager = CameraManager;
