// ============================================
// ARPEGGIATOR
// ============================================

/**
 * Arpeggiator automatically cycles through musical intervals
 */
class Arpeggiator {
    constructor(audioEngine) {
        this.audio = audioEngine;
        this.isActive = false;
        this.intervalId = null;

        // Settings
        this.pattern = 'up';
        this.speed = CONFIG.ARPEGGIATOR.DEFAULT_SPEED;
        this.interval = 12; // Octave
        this.baseFrequency = CONFIG.AUDIO.DEFAULT_FREQUENCY;

        // State
        this.currentStep = 0;
        this.stepCount = CONFIG.ARPEGGIATOR.STEP_COUNT;
    }

    /**
     * Start arpeggiator
     */
    start() {
        if (this.isActive) return;

        this.isActive = true;
        this.currentStep = 0;

        // Calculate interval in milliseconds
        const intervalMs = 1000 / this.speed;

        this.intervalId = setInterval(() => {
            this.step();
        }, intervalMs);
    }

    /**
     * Stop arpeggiator
     */
    stop() {
        if (!this.isActive) return;

        this.isActive = false;

        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        // Return to base frequency
        this.audio.setFrequency(this.baseFrequency);
    }

    /**
     * Execute one step of the arpeggio
     */
    step() {
        // Get base MIDI note
        const baseMidi = MUSIC.frequencyToMidi(this.baseFrequency);

        // Calculate offset based on pattern
        let offset = 0;

        switch (this.pattern) {
            case 'up':
                offset = (this.currentStep % this.stepCount) * this.interval / this.stepCount;
                break;

            case 'down':
                offset = ((this.stepCount - 1 - this.currentStep) % this.stepCount) * this.interval / this.stepCount;
                break;

            case 'updown':
                const cycle = this.stepCount * 2 - 2;
                const step = this.currentStep % cycle;
                if (step < this.stepCount) {
                    offset = step * this.interval / this.stepCount;
                } else {
                    offset = (cycle - step) * this.interval / this.stepCount;
                }
                break;

            case 'random':
                offset = Math.random() * this.interval;
                break;
        }

        // Calculate new frequency
        const targetMidi = baseMidi + offset;
        const targetFreq = MUSIC.midiToFrequency(targetMidi);

        // Set frequency
        this.audio.setFrequency(targetFreq);

        // Increment step
        this.currentStep++;
    }

    /**
     * Set base frequency (from scroll)
     * @param {number} frequency - Base frequency in Hz
     */
    setBaseFrequency(frequency) {
        this.baseFrequency = frequency;
    }

    /**
     * Set pattern
     * @param {string} pattern - Pattern type
     */
    setPattern(pattern) {
        this.pattern = pattern;
        this.currentStep = 0;
    }

    /**
     * Set speed
     * @param {number} speed - Notes per second
     */
    setSpeed(speed) {
        this.speed = MATH.clamp(
            speed,
            CONFIG.ARPEGGIATOR.MIN_SPEED,
            CONFIG.ARPEGGIATOR.MAX_SPEED
        );

        // Restart with new speed if active
        if (this.isActive) {
            this.stop();
            this.start();
        }
    }

    /**
     * Set interval
     * @param {number} interval - Interval in semitones
     */
    setInterval(interval) {
        this.interval = interval;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Arpeggiator;
}
