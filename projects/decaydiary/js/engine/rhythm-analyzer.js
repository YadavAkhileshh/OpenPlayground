/**
 * rhythm-analyzer.js
 * Tracks the temporal density of user input.
 * 
 * Generates an "Impact Score" based on WPM and burst frequency,
 * which other systems can use to modulate audio/visual intensity.
 */

class RhythmAnalyzer {
    constructor() {
        this.timestamps = [];
        this.windowSize = 5000; // 5 second analysis window
        this.currentIntensity = 0;

        this.metrics = {
            wpm: 0,
            burstiness: 0,
            consistency: 0
        };
    }

    /**
     * Records an activity pulse.
     */
    recordPulse() {
        const now = Date.now();
        this.timestamps.push(now);
        this.analyze();
    }

    /**
     * Performs temporal analysis on recent pulses.
     */
    analyze() {
        const now = Date.now();
        this.timestamps = this.timestamps.filter(t => now - t < this.windowSize);

        // Calculate raw intensity (0.0 to 1.0)
        // Assume 80 WPM (approx 6.6 chars/sec) as "high intensity" 
        // or 33 chars in 5 seconds.
        const charCount = this.timestamps.length;
        this.currentIntensity = Math.min(charCount / 40, 1.0);

        this.metrics.wpm = Math.round((charCount / (this.windowSize / 1000)) * 12);

        // Emit rhythm data
        if (typeof eventBus !== 'undefined') {
            eventBus.emit('rhythm:update', {
                intensity: this.currentIntensity,
                metrics: this.metrics
            });
        }
    }

    /**
     * Gets the current normalized intensity.
     */
    getIntensity() {
        return this.currentIntensity;
    }
}

// Global instance
const rhythmAnalyzer = new RhythmAnalyzer();
