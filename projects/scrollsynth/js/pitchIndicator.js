// ============================================
// PITCH INDICATOR
// ============================================

/**
 * PitchIndicator displays current pitch and frequency
 */
class PitchIndicator {
    constructor(audioEngine) {
        this.audio = audioEngine;

        // DOM elements
        this.pitchValue = document.getElementById('pitchValue');
        this.frequencyValue = document.getElementById('frequencyValue');
        this.pitchBar = document.getElementById('pitchBar');

        // Update interval
        this.updateInterval = null;
    }

    /**
     * Start updating pitch display
     */
    start() {
        if (this.updateInterval) return;

        this.updateInterval = setInterval(() => {
            this.update();
        }, CONFIG.UI.PITCH_UPDATE_INTERVAL);
    }

    /**
     * Stop updating pitch display
     */
    stop() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    /**
     * Update pitch display
     */
    update() {
        const settings = this.audio.getSettings();
        const frequency = settings.frequency;

        // Get note name
        const noteName = MUSIC.frequencyToNote(frequency);

        // Update displays
        this.pitchValue.textContent = noteName;
        this.frequencyValue.textContent = `${Math.round(frequency)} Hz`;

        // Update pitch bar (normalized position in frequency range)
        const normalized = MATH.inverseExponentialScale(
            frequency,
            CONFIG.AUDIO.MIN_FREQUENCY,
            CONFIG.AUDIO.MAX_FREQUENCY
        );

        this.pitchBar.style.width = `${normalized * 100}%`;
    }

    /**
     * Set frequency directly (for external updates)
     * @param {number} frequency - Frequency in Hz
     */
    setFrequency(frequency) {
        const noteName = MUSIC.frequencyToNote(frequency);
        this.pitchValue.textContent = noteName;
        this.frequencyValue.textContent = `${Math.round(frequency)} Hz`;

        const normalized = MATH.inverseExponentialScale(
            frequency,
            CONFIG.AUDIO.MIN_FREQUENCY,
            CONFIG.AUDIO.MAX_FREQUENCY
        );

        this.pitchBar.style.width = `${normalized * 100}%`;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PitchIndicator;
}
