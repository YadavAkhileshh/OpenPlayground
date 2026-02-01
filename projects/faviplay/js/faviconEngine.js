/**
 * FaviPlay - Favicon Engine
 * Manages favicon animation playback with precise timing
 */

class FaviconEngine {
    constructor(frameGenerator) {
        this.frameGenerator = frameGenerator;
        this.faviconElement = null;
        this.isPlaying = false;
        this.currentSequence = 'spinner';
        this.fps = 24;
        this.frameBuffer = [];
        this.currentFrameIndex = 0;
        this.lastFrameTime = 0;
        this.animationFrameId = null;
        this.startTime = 0;
        this.totalFrames = 0;

        // Performance monitoring
        this.frameDropCount = 0;
        this.actualFPS = 0;
        this.fpsHistory = [];

        // Callbacks
        this.onPlayStateChange = null;
        this.onFrameUpdate = null;

        this.init();
    }

    /**
     * Initialize the favicon engine
     */
    init() {
        // Get or create favicon element
        this.faviconElement = document.getElementById('favicon');
        if (!this.faviconElement) {
            this.faviconElement = document.createElement('link');
            this.faviconElement.id = 'favicon';
            this.faviconElement.rel = 'icon';
            this.faviconElement.type = 'image/svg+xml';
            document.head.appendChild(this.faviconElement);
        }

        // Load initial sequence
        this.loadSequence(this.currentSequence);

        // Start playing by default
        this.play();
    }

    /**
     * Load a new animation sequence
     */
    loadSequence(sequenceName) {
        // Stop current animation
        const wasPlaying = this.isPlaying;
        this.pause();

        // Update sequence
        this.currentSequence = sequenceName;
        this.totalFrames = this.frameGenerator.getFrameCount(sequenceName);
        this.currentFrameIndex = 0;

        // Pre-generate all frames
        this.bufferFrames();

        // Update favicon to first frame
        this.updateFavicon(0);

        // Resume if was playing
        if (wasPlaying) {
            this.play();
        }
    }

    /**
     * Pre-generate and buffer all frames for current sequence
     */
    bufferFrames() {
        this.frameBuffer = [];

        for (let i = 0; i < this.totalFrames; i++) {
            const svgString = this.frameGenerator.generateFrame(this.currentSequence, i);
            const dataURI = this.svgToDataURI(svgString);
            this.frameBuffer.push(dataURI);
        }

        console.log(`Buffered ${this.frameBuffer.length} frames for ${this.currentSequence}`);
    }

    /**
     * Convert SVG string to Data URI
     */
    svgToDataURI(svgString) {
        // Clean up SVG string
        const cleanSVG = svgString
            .replace(/\s+/g, ' ')
            .replace(/>\s+</g, '><')
            .trim();

        // Encode to base64
        const encoded = btoa(unescape(encodeURIComponent(cleanSVG)));
        return `data:image/svg+xml;base64,${encoded}`;
    }

    /**
     * Update favicon to specific frame
     */
    updateFavicon(frameIndex) {
        if (frameIndex >= 0 && frameIndex < this.frameBuffer.length) {
            this.faviconElement.href = this.frameBuffer[frameIndex];
            this.currentFrameIndex = frameIndex;

            // Trigger callback
            if (this.onFrameUpdate) {
                this.onFrameUpdate(frameIndex, this.totalFrames);
            }
        }
    }

    /**
     * Start animation playback
     */
    play() {
        if (this.isPlaying) return;

        this.isPlaying = true;
        this.startTime = performance.now();
        this.lastFrameTime = this.startTime;
        this.fpsHistory = [];

        // Start animation loop
        this.animationLoop();

        // Trigger callback
        if (this.onPlayStateChange) {
            this.onPlayStateChange(true);
        }

        console.log('Animation started');
    }

    /**
     * Pause animation playback
     */
    pause() {
        if (!this.isPlaying) return;

        this.isPlaying = false;

        // Cancel animation frame
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        // Trigger callback
        if (this.onPlayStateChange) {
            this.onPlayStateChange(false);
        }

        console.log('Animation paused');
    }

    /**
     * Toggle play/pause
     */
    toggle() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    /**
     * Set frames per second
     */
    setFPS(fps) {
        this.baseFPS = Math.max(1, Math.min(60, fps));
        this.fps = this.baseFPS * this.speedMultiplier;
        console.log(`FPS set to ${this.fps} (base: ${this.baseFPS}, multiplier: ${this.speedMultiplier}x)`);
    }

    /**
     * Set speed multiplier
     */
    setSpeedMultiplier(multiplier) {
        this.speedMultiplier = multiplier;
        this.fps = this.baseFPS * this.speedMultiplier;
        console.log(`Speed multiplier set to ${multiplier}x (FPS: ${this.fps})`);
    }

    /**
     * Toggle reverse playback
     */
    toggleReverse() {
        this.isReversed = !this.isReversed;
        console.log(`Reverse playback: ${this.isReversed ? 'ON' : 'OFF'}`);
        return this.isReversed;
    }

    /**
     * Set reverse playback state
     */
    setReverse(isReversed) {
        this.isReversed = isReversed;
        console.log(`Reverse playback: ${this.isReversed ? 'ON' : 'OFF'}`);
    }

    /**
     * Manually set frame (for scrubbing when paused)
     */
    setFrame(frameIndex) {
        if (frameIndex >= 0 && frameIndex < this.totalFrames) {
            this.updateFavicon(frameIndex);
        }
    }

    /**
     * Main animation loop
     */
    animationLoop(timestamp) {
        if (!this.isPlaying) return;

        // Request next frame
        this.animationFrameId = requestAnimationFrame((ts) => this.animationLoop(ts));

        // Calculate time since last frame
        if (!timestamp) timestamp = performance.now();
        const elapsed = timestamp - this.lastFrameTime;
        const frameDuration = 1000 / this.fps;

        // Only update if enough time has passed
        if (elapsed >= frameDuration) {
            // Calculate which frame we should be on based on total elapsed time
            const totalElapsed = timestamp - this.startTime;
            const expectedFrame = Math.floor((totalElapsed / 1000) * this.fps) % this.totalFrames;

            // Update to correct frame
            this.updateFavicon(expectedFrame);

            // Track actual FPS
            this.trackFPS(elapsed);

            // Update last frame time
            // Use expected time to prevent drift
            this.lastFrameTime = timestamp - (elapsed % frameDuration);
        }
    }

    /**
     * Track actual FPS for performance monitoring
     */
    trackFPS(elapsed) {
        const actualFPS = 1000 / elapsed;
        this.fpsHistory.push(actualFPS);

        // Keep only last 30 samples
        if (this.fpsHistory.length > 30) {
            this.fpsHistory.shift();
        }

        // Calculate average
        const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
        this.actualFPS = Math.round(sum / this.fpsHistory.length);

        // Detect frame drops
        if (actualFPS < this.fps * 0.8) {
            this.frameDropCount++;
        }
    }

    /**
     * Get current playback state
     */
    getState() {
        return {
            isPlaying: this.isPlaying,
            currentSequence: this.currentSequence,
            fps: this.fps,
            currentFrame: this.currentFrameIndex,
            totalFrames: this.totalFrames,
            actualFPS: this.actualFPS,
            frameDropCount: this.frameDropCount
        };
    }

    /**
     * Reset animation to first frame
     */
    reset() {
        this.currentFrameIndex = 0;
        this.startTime = performance.now();
        this.lastFrameTime = this.startTime;
        this.updateFavicon(0);
    }

    /**
     * Destroy and cleanup
     */
    destroy() {
        this.pause();
        this.frameBuffer = [];
        if (this.faviconElement) {
            this.faviconElement.href = '';
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FaviconEngine;
}
