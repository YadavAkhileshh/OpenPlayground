/**
 * @file DebugManager.js
 * @description Performance monitoring and diagnostics for MirrorASCII.
 * 
 * MirrorASCII requires high performance to maintain real-time interactivity.
 * The DebugManager provides:
 * 1. FPS (Frames Per Second) tracking.
 * 2. Frame processing time (ms).
 * 3. Grid metadata visibility.
 * 4. System health reporting.
 */

class DebugManager {
    /**
     * Initializes the debugger.
     */
    constructor() {
        /** @type {boolean} */
        this.enabled = false;

        /** @type {number} */
        this.frameCounter = 0;

        /** @type {number} */
        this.lastUpdateTime = performance.now();

        /** @type {number} */
        this.currentFPS = 0;

        /** 
         * History of frame times for averaging.
         * @type {number[]} 
         */
        this.frameHistory = [];
        this.maxHistory = 60;

        /** @type {HTMLElement|null} */
        this.overlay = null;

        this._createOverlay();
    }

    /**
     * Creates a hidden DOM element for displaying stats.
     * @private
     */
    _createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.id = 'debug-overlay';
        this.overlay.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.7);
            color: #00ff41;
            padding: 10px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 10px;
            border-radius: 4px;
            z-index: 9999;
            pointer-events: none;
            display: none;
            border: 1px solid rgba(0, 255, 65, 0.3);
        `;
        document.body.appendChild(this.overlay);
    }

    /**
     * Toggles the debug overlay visibility.
     */
    toggle() {
        this.enabled = !this.enabled;
        this.overlay.style.display = this.enabled ? 'block' : 'none';
        console.log(`[Debug] Monitor ${this.enabled ? 'Enabled' : 'Disabled'}`);
    }

    /**
     * Records the start of a frame processing cycle.
     * @returns {number} The current high-res timestamp.
     */
    beginFrame() {
        return performance.now();
    }

    /**
     * Records the end of a frame and updates stats.
     * @param {number} startTime Timestamp from beginFrame.
     * @param {Object} metadata Optional grid metadata.
     */
    endFrame(startTime, metadata = {}) {
        if (!this.enabled) return;

        const endTime = performance.now();
        const duration = endTime - startTime;

        this.frameCounter++;
        this.frameHistory.push(duration);
        if (this.frameHistory.length > this.maxHistory) {
            this.frameHistory.shift();
        }

        // Update FPS every second.
        if (endTime - this.lastUpdateTime >= 1000) {
            this.currentFPS = Math.round((this.frameCounter * 1000) / (endTime - this.lastUpdateTime));
            this.frameCounter = 0;
            this.lastUpdateTime = endTime;
            this._updateDisplay(duration, metadata);
        }
    }

    /**
     * Refreshes the overlay text.
     * @param {number} lastDuration 
     * @param {Object} meta 
     * @private
     */
    _updateDisplay(lastDuration, meta) {
        const avgFrameTime = this.frameHistory.reduce((a, b) => a + b, 0) / this.frameHistory.length;

        this.overlay.innerHTML = `
            <div><strong>MIRROR_ASCII_DEBUG v1.0</strong></div>
            <div style="margin-top:5px">FPS: ${this.currentFPS}</div>
            <div>FRAME: ${lastDuration.toFixed(2)}ms (AVG: ${avgFrameTime.toFixed(2)}ms)</div>
            <div>GRID: ${meta.cols || 0}x${meta.rows || 0} (${(meta.cols * meta.rows) || 0} chars)</div>
            <div style="margin-top:5px; color:#aaa">MEM: ${(performance.memory ? (performance.memory.usedJSHeapSize / 1048576).toFixed(1) + 'MB' : 'N/A')}</div>
        `;
    }
}

// Exporting logic
window.DebugManager = DebugManager;
