/**
 * pendulum.js - Pendulum Class
 * Combines physics simulation with audio and visual properties
 */

class Pendulum {
    /**
     * Create a new pendulum
     * @param {string} id - Unique identifier
     * @param {AudioEngine} audioEngine - Audio engine instance
     * @param {Object} options - Configuration options
     */
    constructor(id, audioEngine, options = {}) {
        this.id = id;
        this.audioEngine = audioEngine;

        // Physics simulation
        this.physics = new PendulumPhysics(
            options.length || 1.5,
            options.initialAngle || Math.PI / 4,
            options.gravity || 9.8,
            options.damping || 0.995
        );

        // Visual properties
        this.color = options.color || '#60a5fa';
        this.name = options.name || `Pendulum ${id}`;

        // Audio properties
        this.frequency = this.audioEngine.lengthToFrequency(this.physics.length);
        this.muted = false;
        this.velocity = 1.0;

        // State tracking
        this.peakCount = 0;
        this.lastPeakTime = 0;
    }

    /**
     * Update the pendulum state
     * @param {number} currentTime - Current timestamp
     */
    update(currentTime) {
        // Update physics
        const peakDetected = this.physics.update(currentTime);

        // Trigger sound on peak if not muted
        if (peakDetected && !this.muted) {
            this.triggerSound();
            this.peakCount++;
            this.lastPeakTime = currentTime;
        }
    }

    /**
     * Trigger a sound based on current pendulum state
     */
    triggerSound() {
        // Calculate frequency based on length
        this.frequency = this.audioEngine.lengthToFrequency(this.physics.length);

        // Apply subtle frequency modulation based on angle
        const freqMod = this.audioEngine.angleToFrequencyMod(this.physics.angle);
        const modulatedFreq = this.frequency * freqMod;

        // Calculate velocity based on amplitude
        const amplitude = this.physics.getNormalizedAmplitude();
        const velocity = Math.max(0.3, Math.min(1.0, amplitude * 1.5)) * this.velocity;

        // Play the tone
        this.audioEngine.playTone(modulatedFreq, null, velocity);
    }

    /**
     * Set the length of the pendulum
     * @param {number} length - New length in meters
     */
    setLength(length) {
        this.physics.setLength(length);
        this.frequency = this.audioEngine.lengthToFrequency(this.physics.length);
    }

    /**
     * Get the current length
     * @returns {number} - Length in meters
     */
    getLength() {
        return this.physics.length;
    }

    /**
     * Set the initial angle and reset
     * @param {number} angle - Angle in radians
     */
    setInitialAngle(angle) {
        this.physics.reset(angle);
    }

    /**
     * Get the current angle
     * @returns {number} - Angle in radians
     */
    getAngle() {
        return this.physics.angle;
    }

    /**
     * Set the color
     * @param {string} color - Hex color
     */
    setColor(color) {
        this.color = color;
    }

    /**
     * Toggle mute state
     * @returns {boolean} - New mute state
     */
    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    }

    /**
     * Set mute state
     * @param {boolean} muted - Mute state
     */
    setMuted(muted) {
        this.muted = muted;
    }

    /**
     * Set velocity (volume)
     * @param {number} velocity - Velocity 0-1
     */
    setVelocity(velocity) {
        this.velocity = Math.max(0, Math.min(1, velocity));
    }

    /**
     * Reset the pendulum
     */
    reset() {
        this.physics.reset();
        this.peakCount = 0;
        this.lastPeakTime = 0;
    }

    /**
     * Get pendulum info for display
     * @returns {Object} - Info object
     */
    getInfo() {
        return {
            id: this.id,
            name: this.name,
            length: this.physics.length.toFixed(2),
            period: this.physics.getPeriod().toFixed(2),
            frequency: this.frequency.toFixed(1),
            angle: (this.physics.angle * 180 / Math.PI).toFixed(1),
            peakCount: this.peakCount,
            muted: this.muted
        };
    }

    /**
     * Get the period of oscillation
     * @returns {number} - Period in seconds
     */
    getPeriod() {
        return this.physics.getPeriod();
    }

    /**
     * Check if pendulum is at rest
     * @returns {boolean} - True if at rest
     */
    isAtRest() {
        return this.physics.isAtRest();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Pendulum;
}
