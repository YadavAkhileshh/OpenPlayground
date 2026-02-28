/**
 * Performance.js
 * 
 * Telemetry and monitoring utilities for the NoiseTV engine.
 * Tracks frame rates, render times, and resource usage.
 */

export class Telemetry {
    /**
     * @param {boolean} enabled - Whether to display stats on screen
     */
    constructor(enabled = false) {
        this.enabled = enabled;
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 0;

        this.stats = {
            renderTime: 0,
            audioLatency: 0,
            systemLoad: 0
        };

        if (this.enabled) {
            this.createOverlay();
        }
    }

    /**
     * Initializes a minimal debug overlay.
     */
    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            background: rgba(0,0,0,0.8);
            color: #0f0;
            padding: 5px 10px;
            font-family: monospace;
            font-size: 10px;
            border-radius: 4px;
            pointer-events: none;
            z-index: 1000;
            border: 1px solid #333;
        `;
        document.body.appendChild(this.overlay);
    }

    /**
     * Marks the beginning of a render frame.
     */
    beginFrame() {
        this.frameStart = performance.now();
    }

    /**
     * Marks the end of a render frame and updates FPS.
     */
    endFrame() {
        this.frameCount++;
        const now = performance.now();

        // Calculate Render Time
        this.stats.renderTime = now - this.frameStart;

        // Calculate FPS every second
        if (now > this.lastTime + 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (now - this.lastTime));
            this.frameCount = 0;
            this.lastTime = now;

            if (this.enabled) {
                this.updateOverlay();
            }
        }
    }

    /**
     * Updates the debug UI content.
     */
    updateOverlay() {
        this.overlay.innerHTML = `
            FPS: ${this.fps}<br>
            RENDER: ${this.stats.renderTime.toFixed(2)}ms<br>
            LOAD: ${((this.stats.renderTime / 16.6) * 100).toFixed(1)}%
        `;
    }

    /**
     * Logs internal telemetry for performance auditing.
     */
    logReport() {
        console.group('NOISE-TV PERFORMANCE REPORT');
        console.log('Average FPS:', this.fps);
        console.log('Avg Render Latency:', this.stats.renderTime.toFixed(2), 'ms');
        console.groupEnd();
    }
}
