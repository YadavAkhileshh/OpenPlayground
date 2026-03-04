/**
 * CHECKBOXSCREEN - ANIMATION CONTROLLER
 * Handles frame-based rendering, timing, and playback control
 */

class Animator {
    constructor(grid, patternLibrary) {
        this.grid = grid;
        this.patternLibrary = patternLibrary;
        
        // Animation state
        this.isPlaying = false;
        this.currentFrame = 0;
        this.frames = [];
        this.fps = 30;
        this.frameInterval = 1000 / this.fps;
        this.lastFrameTime = 0;
        this.animationId = null;
        this.autoLoop = true;
        
        // Performance tracking
        this.actualFps = 0;
        this.frameCount = 0;
        this.fpsStartTime = 0;
        this.fpsSamples = [];
        
        // Frame interpolation
        this.interpolationEnabled = true;
        this.previousFrame = null;
        
        // Callbacks
        this.onFrameChange = null;
        this.onFpsUpdate = null;
        this.onPlayStateChange = null;
    }
    
    /**
     * Load a pattern
     */
    loadPattern(patternName) {
        const generator = this.patternLibrary.getPattern(patternName);
        if (!generator) {
            console.error(`Pattern not found: ${patternName}`);
            return false;
        }
        
        // Stop current animation
        this.stop();
        
        // Update pattern library dimensions
        const dims = this.grid.getDimensions();
        this.patternLibrary.setDimensions(dims.rows, dims.cols);
        
        // Generate frames
        this.frames = generator();
        this.currentFrame = 0;
        
        // Apply first frame
        if (this.frames.length > 0) {
            this.grid.applyFrame(this.frames[0]);
        }
        
        return true;
    }
    
    /**
     * Start animation playback
     */
    play() {
        if (this.isPlaying || this.frames.length === 0) {
            return;
        }
        
        this.isPlaying = true;
        this.grid.setAnimationActive(true);
        this.lastFrameTime = performance.now();
        this.fpsStartTime = this.lastFrameTime;
        this.frameCount = 0;
        this.fpsSamples = [];
        
        this.animate();
        
        if (this.onPlayStateChange) {
            this.onPlayStateChange(true);
        }
    }
    
    /**
     * Pause animation playback
     */
    pause() {
        if (!this.isPlaying) {
            return;
        }
        
        this.isPlaying = false;
        this.grid.setAnimationActive(false);
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        if (this.onPlayStateChange) {
            this.onPlayStateChange(false);
        }
    }
    
    /**
     * Stop and reset animation
     */
    stop() {
        this.pause();
        this.currentFrame = 0;
        if (this.frames.length > 0) {
            this.grid.applyFrame(this.frames[0]);
        }
        
        if (this.onFrameChange) {
            this.onFrameChange(this.currentFrame, this.frames.length);
        }
    }
    
    /**
     * Toggle play/pause
     */
    togglePlayPause() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
    
    /**
     * Main animation loop with interpolation
     */
    animate() {
        if (!this.isPlaying) {
            return;
        }
        
        const currentTime = performance.now();
        const elapsed = currentTime - this.lastFrameTime;
        
        if (elapsed >= this.frameInterval) {
            // Store previous frame for interpolation
            this.previousFrame = this.currentFrame;
            
            // Advance to next frame
            this.currentFrame++;
            
            // Handle loop
            if (this.currentFrame >= this.frames.length) {
                if (this.autoLoop) {
                    this.currentFrame = 0;
                } else {
                    this.pause();
                    return;
                }
            }
            
            // Apply frame with double-buffered smooth rendering
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    this.grid.applyFrame(this.frames[this.currentFrame]);
                });
            });
            
            // Update timing - compensate for frame time overshoot
            const overshoot = elapsed - this.frameInterval;
            this.lastFrameTime = currentTime - Math.min(overshoot, this.frameInterval * 0.5);
            this.frameCount++;
            
            // Calculate FPS
            this.calculateFps(currentTime);
            
            // Trigger callbacks
            if (this.onFrameChange) {
                this.onFrameChange(this.currentFrame, this.frames.length);
            }
        }
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    /**
     * Calculate actual FPS
     */
    calculateFps(currentTime) {
        const elapsed = currentTime - this.fpsStartTime;
        
        if (elapsed >= 1000) {
            this.actualFps = Math.round((this.frameCount / elapsed) * 1000);
            this.fpsSamples.push(this.actualFps);
            
            // Keep last 5 samples
            if (this.fpsSamples.length > 5) {
                this.fpsSamples.shift();
            }
            
            // Calculate average
            const avgFps = Math.round(
                this.fpsSamples.reduce((a, b) => a + b, 0) / this.fpsSamples.length
            );
            
            if (this.onFpsUpdate) {
                this.onFpsUpdate(avgFps);
            }
            
            this.frameCount = 0;
            this.fpsStartTime = currentTime;
        }
    }
    
    /**
     * Set target FPS
     */
    setFps(fps) {
        fps = Math.max(1, Math.min(60, fps));
        this.fps = fps;
        this.frameInterval = 1000 / fps;
    }
    
    /**
     * Get current FPS
     */
    getFps() {
        return this.fps;
    }
    
    /**
     * Get actual measured FPS
     */
    getActualFps() {
        return this.actualFps;
    }
    
    /**
     * Set auto-loop
     */
    setAutoLoop(enabled) {
        this.autoLoop = enabled;
    }
    
    /**
     * Go to specific frame
     */
    gotoFrame(frameNumber) {
        frameNumber = Math.max(0, Math.min(this.frames.length - 1, frameNumber));
        this.currentFrame = frameNumber;
        
        if (this.frames.length > 0) {
            this.grid.applyFrame(this.frames[this.currentFrame]);
        }
        
        if (this.onFrameChange) {
            this.onFrameChange(this.currentFrame, this.frames.length);
        }
    }
    
    /**
     * Step forward one frame
     */
    stepForward() {
        if (this.frames.length === 0) {
            return;
        }
        
        this.currentFrame = (this.currentFrame + 1) % this.frames.length;
        this.grid.applyFrame(this.frames[this.currentFrame]);
        
        if (this.onFrameChange) {
            this.onFrameChange(this.currentFrame, this.frames.length);
        }
    }
    
    /**
     * Step backward one frame
     */
    stepBackward() {
        if (this.frames.length === 0) {
            return;
        }
        
        this.currentFrame = (this.currentFrame - 1 + this.frames.length) % this.frames.length;
        this.grid.applyFrame(this.frames[this.currentFrame]);
        
        if (this.onFrameChange) {
            this.onFrameChange(this.currentFrame, this.frames.length);
        }
    }
    
    /**
     * Get current frame number
     */
    getCurrentFrame() {
        return this.currentFrame;
    }
    
    /**
     * Get total frame count
     */
    getTotalFrames() {
        return this.frames.length;
    }
    
    /**
     * Check if animation is playing
     */
    getIsPlaying() {
        return this.isPlaying;
    }
    
    /**
     * Reset animation
     */
    reset() {
        this.stop();
    }
    
    /**
     * Clear all frames
     */
    clear() {
        this.stop();
        this.frames = [];
        this.currentFrame = 0;
        this.grid.clear();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Animator;
}
