/**
 * SingularityRay JS - UI - FPS Monitor
 * Tracks frame times and updates the HUD styling dynamically
 * based on the CPU render performance.
 */

export class FPSMonitor {
    constructor() {
        this.displayElement = document.getElementById('fps-value');
        this.metricContainer = document.getElementById('fps-display');

        this.frames = 0;
        this.lastTime = performance.now();
        this.currentFPS = 0;
        this.updateInterval = 500; // ms between DOM updates

        // Rolling average for smoother display
        this.history = new Array(10).fill(60);
        this.historyIdx = 0;
    }

    /**
     * Called every single frame in the loop
     */
    tick() {
        this.frames++;
        const now = performance.now();
        const delta = now - this.lastTime;

        if (delta >= this.updateInterval) {
            // Calculate instantaneous FPS
            const rawFPS = (this.frames * 1000) / delta;

            // Add to history
            this.history[this.historyIdx] = rawFPS;
            this.historyIdx = (this.historyIdx + 1) % this.history.length;

            // Calculate Average
            let sum = 0;
            for (let i = 0; i < this.history.length; i++) sum += this.history[i];
            this.currentFPS = Math.round(sum / this.history.length);

            // Update UI
            if (this.displayElement) {
                // Formatting: always 2 digits min
                this.displayElement.textContent = this.currentFPS.toString().padStart(2, '0');
            }

            this._updateStyling();

            // Reset counters
            this.frames = 0;
            this.lastTime = now;
        }
    }

    /**
     * Updates CSS classes to visually indicate performance health
     */
    _updateStyling() {
        if (!this.metricContainer) return;

        // Remove old classes
        this.metricContainer.classList.remove('healthy', 'struggling', 'critical');

        // Apply new class based on threshold
        if (this.currentFPS >= 45) {
            this.metricContainer.classList.add('healthy');
        } else if (this.currentFPS >= 20) {
            this.metricContainer.classList.add('struggling');
        } else {
            this.metricContainer.classList.add('critical');
        }
    }
}
