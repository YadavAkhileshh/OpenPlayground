/**
 * performance-monitor.js
 * Real-time health tracking for the DecayDiary engine.
 * 
 * Provides metrics on FPS, memory usage (if available), and 
 * character registry density to ensure the application remains 
 * stable under heavy typing loads.
 */

class PerformanceMonitor {
    constructor() {
        this.frameCount = 0;
        this.fps = 0;
        this.lastTime = performance.now();

        // Debug mode toggle
        this.active = false;

        // History for averaging
        this.fpsHistory = [];
        this.maxHistorySize = 60;
    }

    /**
     * Records a frame and calculates FPS.
     * Called by the DecayEngine loop.
     */
    recordFrame() {
        if (!this.active) return;

        this.frameCount++;
        const now = performance.now();
        const delta = now - this.lastTime;

        if (delta >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / delta);
            this.frameCount = 0;
            this.lastTime = now;

            this.updateHistory(this.fps);
            this.logMetrics();
        }
    }

    /**
     * Adds the current FPS to the rolling history window.
     * @param {number} fps 
     */
    updateHistory(fps) {
        this.fpsHistory.push(fps);
        if (this.fpsHistory.length > this.maxHistorySize) {
            this.fpsHistory.shift();
        }
    }

    /**
     * Logs current system metrics to the console for verification.
     */
    logMetrics() {
        const stats = {
            fps: this.fps,
            characters: timerSystem ? timerSystem.count : 0,
            averageFps: this.getAverageFps(),
            memory: this.getMemoryUsage()
        };

        // We use a non-intrusive logging approach
        if (this.fps < 50) {
            console.warn(`[PerformanceMonitor] Lag detected: ${this.fps} FPS`);
        }
    }

    /**
     * Calculates the average FPS over the history window.
     * @returns {number}
     */
    getAverageFps() {
        if (this.fpsHistory.length === 0) return 0;
        const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
        return Math.round(sum / this.fpsHistory.length);
    }

    /**
     * Retrieves memory usage if the browser supports it.
     * @returns {string}
     */
    getMemoryUsage() {
        if (window.performance && window.performance.memory) {
            const used = window.performance.memory.usedJSHeapSize;
            return `${Math.round(used / 1048576)} MB`;
        }
        return 'N/A';
    }

    /**
     * Toggles the monitor on/off.
     */
    toggle(state) {
        this.active = state;
        console.log(`[PerformanceMonitor] ${state ? 'Enabled' : 'Disabled'}`);
    }
}

// Global instance
const performanceMonitor = new PerformanceMonitor();

// Auto-enable in console if needed: performanceMonitor.toggle(true);
