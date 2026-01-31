/**
 * ============================================
 * PulseGradient - Animation Controller
 * Manages BPM-based timing and breathing animations
 * ============================================
 */

class AnimationController {
    constructor(gradientEngine) {
        this.gradientEngine = gradientEngine;

        // BPM settings
        this.bpm = 80; // Default BPM
        this.minBPM = 40;
        this.maxBPM = 180;

        // Animation state
        this.isPlaying = true;
        this.animationId = null;
        this.startTime = null;
        this.pausedTime = 0;
        this.totalPausedDuration = 0;

        // Breathing cycle configuration
        this.breathingPhases = {
            expand: 0.40,    // 40% of cycle - expansion
            holdExpanded: 0.10,  // 10% of cycle - hold at peak
            contract: 0.40,  // 40% of cycle - contraction
            holdContracted: 0.10 // 10% of cycle - hold at rest
        };

        // Animation intensity
        this.intensity = 1.0; // 0.2 to 2.0
        this.baseScale = {
            layer1: { min: 1.0, max: 1.3 },
            layer2: { min: 1.0, max: 1.25 },
            layer3: { min: 1.0, max: 1.2 }
        };

        // Performance tracking
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.fps = 60;

        // DOM elements (will be set by app.js)
        this.layers = [];
    }

    /**
     * Set gradient layer DOM elements
     * @param {Array} layerElements - Array of DOM elements for gradient layers
     */
    setLayers(layerElements) {
        this.layers = layerElements;
    }

    /**
     * Set BPM and update animation timing
     * @param {number} newBPM - New BPM value
     */
    setBPM(newBPM) {
        this.bpm = Math.max(this.minBPM, Math.min(this.maxBPM, newBPM));
    }

    /**
     * Get current BPM
     * @returns {number} Current BPM value
     */
    getBPM() {
        return this.bpm;
    }

    /**
     * Set animation intensity
     * @param {number} intensityPercent - Intensity as percentage (20-200)
     */
    setIntensity(intensityPercent) {
        this.intensity = intensityPercent / 100;
    }

    /**
     * Get current intensity
     * @returns {number} Current intensity as percentage
     */
    getIntensity() {
        return Math.round(this.intensity * 100);
    }

    /**
     * Calculate cycle duration in milliseconds based on BPM
     * @returns {number} Duration of one breathing cycle in ms
     */
    getCycleDuration() {
        // BPM = beats per minute
        // One cycle = one beat
        return (60 / this.bpm) * 1000;
    }

    /**
     * Get current position in breathing cycle (0 to 1)
     * @param {number} currentTime - Current timestamp
     * @returns {number} Cycle position (0 to 1)
     */
    getCyclePosition(currentTime) {
        if (!this.startTime) {
            this.startTime = currentTime;
        }

        const elapsed = currentTime - this.startTime - this.totalPausedDuration;
        const cycleDuration = this.getCycleDuration();
        return (elapsed % cycleDuration) / cycleDuration;
    }

    /**
     * Calculate breathing scale based on cycle position
     * @param {number} cyclePosition - Position in cycle (0 to 1)
     * @returns {Object} Scale values for each layer
     */
    calculateBreathingScale(cyclePosition) {
        const phase = this.getBreathingPhase(cyclePosition);
        const phaseProgress = this.getPhaseProgress(cyclePosition);

        let breathingFactor;

        switch (phase) {
            case 'expand':
                // Ease out cubic for smooth expansion
                breathingFactor = this.easeOutCubic(phaseProgress);
                break;

            case 'holdExpanded':
                breathingFactor = 1.0;
                break;

            case 'contract':
                // Ease in cubic for smooth contraction
                breathingFactor = 1.0 - this.easeInCubic(phaseProgress);
                break;

            case 'holdContracted':
                breathingFactor = 0.0;
                break;

            default:
                breathingFactor = 0.0;
        }

        // Apply intensity multiplier
        const intensityMultiplier = this.intensity;

        return {
            layer1: 1.0 + (this.baseScale.layer1.max - this.baseScale.layer1.min) * breathingFactor * intensityMultiplier,
            layer2: 1.0 + (this.baseScale.layer2.max - this.baseScale.layer2.min) * breathingFactor * intensityMultiplier,
            layer3: 1.0 + (this.baseScale.layer3.max - this.baseScale.layer3.min) * breathingFactor * intensityMultiplier
        };
    }

    /**
     * Determine current breathing phase
     * @param {number} cyclePosition - Position in cycle (0 to 1)
     * @returns {string} Current phase name
     */
    getBreathingPhase(cyclePosition) {
        let accumulated = 0;

        for (const [phase, duration] of Object.entries(this.breathingPhases)) {
            accumulated += duration;
            if (cyclePosition < accumulated) {
                return phase;
            }
        }

        return 'holdContracted';
    }

    /**
     * Get progress within current phase (0 to 1)
     * @param {number} cyclePosition - Position in cycle (0 to 1)
     * @returns {number} Progress within current phase
     */
    getPhaseProgress(cyclePosition) {
        let accumulated = 0;

        for (const [phase, duration] of Object.entries(this.breathingPhases)) {
            const phaseStart = accumulated;
            accumulated += duration;

            if (cyclePosition < accumulated) {
                return (cyclePosition - phaseStart) / duration;
            }
        }

        return 0;
    }

    /**
     * Main animation loop
     * @param {number} currentTime - Current timestamp from requestAnimationFrame
     */
    animate(currentTime) {
        if (!this.isPlaying) {
            return;
        }

        // Calculate FPS
        if (this.lastFrameTime) {
            const delta = currentTime - this.lastFrameTime;
            this.fps = Math.round(1000 / delta);
        }
        this.lastFrameTime = currentTime;
        this.frameCount++;

        // Update gradient transition
        this.gradientEngine.updateTransition(currentTime);

        // Get cycle position and calculate scales
        const cyclePosition = this.getCyclePosition(currentTime);
        const scales = this.calculateBreathingScale(cyclePosition);

        // Apply transformations to each layer
        this.updateLayerTransforms(scales, cyclePosition);

        // Update gradient colors
        this.updateGradientColors(cyclePosition);

        // Continue animation loop
        this.animationId = requestAnimationFrame((time) => this.animate(time));
    }

    /**
     * Update layer transforms based on breathing scales
     * @param {Object} scales - Scale values for each layer
     * @param {number} cyclePosition - Current cycle position
     */
    updateLayerTransforms(scales, cyclePosition) {
        if (this.layers.length === 0) return;

        // Layer 1 - main breathing
        if (this.layers[0]) {
            const rotation = Math.sin(cyclePosition * Math.PI * 2) * 2;
            this.layers[0].style.transform = `translate(-50%, -50%) scale(${scales.layer1}) rotate(${rotation}deg)`;
            this.layers[0].style.opacity = 0.8 + (scales.layer1 - 1.0) * 0.2;
        }

        // Layer 2 - offset breathing with slight rotation
        if (this.layers[1]) {
            const rotation = Math.sin(cyclePosition * Math.PI * 2 + Math.PI / 3) * 3;
            this.layers[1].style.transform = `translate(-50%, -50%) scale(${scales.layer2}) rotate(${rotation}deg)`;
            this.layers[1].style.opacity = 0.7 + (scales.layer2 - 1.0) * 0.2;
        }

        // Layer 3 - subtle breathing with counter-rotation
        if (this.layers[2]) {
            const rotation = Math.sin(cyclePosition * Math.PI * 2 + Math.PI / 2) * -2;
            this.layers[2].style.transform = `translate(-50%, -50%) scale(${scales.layer3}) rotate(${rotation}deg)`;
            this.layers[2].style.opacity = 0.5 + (scales.layer3 - 1.0) * 0.2;
        }
    }

    /**
     * Update gradient colors on layers
     * @param {number} cyclePosition - Current cycle position
     */
    updateGradientColors(cyclePosition) {
        if (this.layers.length === 0) return;

        this.layers.forEach((layer, index) => {
            const gradient = this.gradientEngine.generateGradient(index, cyclePosition);
            layer.style.background = gradient;
        });
    }

    /**
     * Start animation
     */
    start() {
        if (this.isPlaying) return;

        this.isPlaying = true;

        // Calculate paused duration
        if (this.pausedTime > 0) {
            this.totalPausedDuration += performance.now() - this.pausedTime;
            this.pausedTime = 0;
        }

        this.animationId = requestAnimationFrame((time) => this.animate(time));
    }

    /**
     * Pause animation
     */
    pause() {
        if (!this.isPlaying) return;

        this.isPlaying = false;
        this.pausedTime = performance.now();

        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    /**
     * Toggle play/pause
     * @returns {boolean} New playing state
     */
    toggle() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.start();
        }
        return this.isPlaying;
    }

    /**
     * Check if animation is playing
     * @returns {boolean} True if playing
     */
    isAnimationPlaying() {
        return this.isPlaying;
    }

    /**
     * Get current FPS
     * @returns {number} Current frames per second
     */
    getFPS() {
        return this.fps;
    }

    /**
     * Reset animation to initial state
     */
    reset() {
        this.pause();
        this.startTime = null;
        this.pausedTime = 0;
        this.totalPausedDuration = 0;
        this.frameCount = 0;
        this.bpm = 80;
        this.intensity = 1.0;
        this.start();
    }

    /**
     * Easing function: ease-in cubic
     * @param {number} t - Input value (0 to 1)
     * @returns {number} Eased value
     */
    easeInCubic(t) {
        return t * t * t;
    }

    /**
     * Easing function: ease-out cubic
     * @param {number} t - Input value (0 to 1)
     * @returns {number} Eased value
     */
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    /**
     * Easing function: ease-in-out cubic
     * @param {number} t - Input value (0 to 1)
     * @returns {number} Eased value
     */
    easeInOutCubic(t) {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    /**
     * Custom breathing easing curve
     * @param {number} t - Input value (0 to 1)
     * @returns {number} Eased value
     */
    breathingEase(t) {
        // Custom curve that feels like natural breathing
        return 0.5 - Math.cos(t * Math.PI) / 2;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimationController;
}
