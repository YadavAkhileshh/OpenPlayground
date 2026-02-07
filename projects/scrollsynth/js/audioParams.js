// ============================================
// AUDIO PARAMETER SMOOTHING
// ============================================

/**
 * AudioParams handles smooth parameter transitions for the audio engine
 * to prevent clicks, pops, and harsh transitions
 */
class AudioParams {
    constructor(audioContext) {
        this.context = audioContext;
        this.currentTime = () => this.context.currentTime;
    }

    /**
     * Smoothly transition a parameter to a target value
     * @param {AudioParam} param - The audio parameter to modify
     * @param {number} targetValue - The target value
     * @param {number} smoothTime - Time to reach target (seconds)
     */
    smoothTransition(param, targetValue, smoothTime = CONFIG.AUDIO.PARAM_SMOOTH_TIME) {
        const now = this.currentTime();
        param.cancelScheduledValues(now);
        param.setValueAtTime(param.value, now);
        param.linearRampToValueAtTime(targetValue, now + smoothTime);
    }

    /**
     * Exponentially transition a parameter (better for frequency)
     * @param {AudioParam} param - The audio parameter to modify
     * @param {number} targetValue - The target value
     * @param {number} smoothTime - Time to reach target (seconds)
     */
    exponentialTransition(param, targetValue, smoothTime = CONFIG.AUDIO.PARAM_SMOOTH_TIME) {
        const now = this.currentTime();
        // Ensure target is not zero for exponential ramp
        const safeTarget = Math.max(targetValue, 0.0001);
        param.cancelScheduledValues(now);
        param.setValueAtTime(Math.max(param.value, 0.0001), now);
        param.exponentialRampToValueAtTime(safeTarget, now + smoothTime);
    }

    /**
     * Instantly set a parameter value
     * @param {AudioParam} param - The audio parameter to modify
     * @param {number} value - The value to set
     */
    setImmediate(param, value) {
        const now = this.currentTime();
        param.cancelScheduledValues(now);
        param.setValueAtTime(value, now);
    }

    /**
     * Create a smooth envelope for parameter changes
     * @param {AudioParam} param - The audio parameter to modify
     * @param {number} targetValue - The target value
     * @param {number} attackTime - Attack time (seconds)
     * @param {number} releaseTime - Release time (seconds)
     */
    envelope(param, targetValue, attackTime = 0.01, releaseTime = 0.1) {
        const now = this.currentTime();
        param.cancelScheduledValues(now);
        param.setValueAtTime(param.value, now);
        param.linearRampToValueAtTime(targetValue, now + attackTime);
        param.linearRampToValueAtTime(0, now + attackTime + releaseTime);
    }

    /**
     * Map normalized value (0-1) to frequency range with exponential scaling
     * @param {number} normalizedValue - Value between 0 and 1
     * @returns {number} Frequency in Hz
     */
    normalizedToFrequency(normalizedValue) {
        return MATH.exponentialScale(
            normalizedValue,
            CONFIG.AUDIO.MIN_FREQUENCY,
            CONFIG.AUDIO.MAX_FREQUENCY
        );
    }

    /**
     * Map frequency to normalized value (0-1) with exponential scaling
     * @param {number} frequency - Frequency in Hz
     * @returns {number} Normalized value between 0 and 1
     */
    frequencyToNormalized(frequency) {
        return MATH.inverseExponentialScale(
            frequency,
            CONFIG.AUDIO.MIN_FREQUENCY,
            CONFIG.AUDIO.MAX_FREQUENCY
        );
    }

    /**
     * Map normalized value (0-1) to filter frequency range
     * @param {number} normalizedValue - Value between 0 and 1
     * @returns {number} Filter frequency in Hz
     */
    normalizedToFilterFreq(normalizedValue) {
        return MATH.exponentialScale(
            normalizedValue,
            CONFIG.AUDIO.MIN_FILTER_FREQ,
            CONFIG.AUDIO.MAX_FILTER_FREQ
        );
    }

    /**
     * Map normalized value (0-1) to filter Q range
     * @param {number} normalizedValue - Value between 0 and 1
     * @returns {number} Filter Q value
     */
    normalizedToFilterQ(normalizedValue) {
        return MATH.map(
            normalizedValue,
            0, 1,
            CONFIG.AUDIO.MIN_FILTER_Q,
            CONFIG.AUDIO.MAX_FILTER_Q
        );
    }

    /**
     * Generate distortion curve for WaveShaper
     * @param {number} amount - Distortion amount (0-100)
     * @returns {Float32Array} Distortion curve
     */
    makeDistortionCurve(amount) {
        if (amount <= 0) return null;

        const samples = 44100;
        const curve = new Float32Array(samples);
        const deg = Math.PI / 180;
        const k = amount; // Simplified scaling

        for (let i = 0; i < samples; i++) {
            const x = (i * 2) / samples - 1;
            curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
        }

        return curve;
    }

    /**
     * Calculate gain from percentage (0-100)
     * @param {number} percentage - Volume percentage
     * @returns {number} Gain value
     */
    percentageToGain(percentage) {
        // Use exponential scaling for more natural volume control
        const normalized = percentage / 100;
        return Math.pow(normalized, 2);
    }

    /**
     * Calculate percentage from gain
     * @param {number} gain - Gain value
     * @returns {number} Volume percentage
     */
    gainToPercentage(gain) {
        return Math.sqrt(gain) * 100;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioParams;
}
