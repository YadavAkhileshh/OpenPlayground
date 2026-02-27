/**
 * @file diagnostics.js
 * @description System diagnostic and performance monitoring for StegPlay.
 * 
 * This module provides transparency into the encoding/decoding process,
 * allowing users or developers to verify the integrity of the steganographic
 * layer and monitor system resource impact.
 */

class StegDiagnostics {
    /**
     * Initializes the diagnostics system.
     * @param {StegPlayUIManager} uiContext - Reference to the main UI.
     */
    constructor(uiContext) {
        this.context = uiContext;
        this.history = [];
        this.isEnabled = true;

        console.log('[DIAGNOSTICS] Monitoring system initialized.');
    }

    /**
     * Performs a full system health check.
     * Validates that all core modules are loaded and responsive.
     * @returns {Object} Health report.
     */
    runHealthCheck() {
        const report = {
            timestamp: new Date().toISOString(),
            status: 'HEALTHY',
            modules: {
                stegoEngine: !!this.context.stego ? 'READY' : 'MISSING',
                contentParser: !!this.context.parser ? 'READY' : 'MISSING',
                uiManager: 'ACTIVE'
            },
            browserCapabilities: {
                unicodeSupport: true, // Baseline
                clipboardAccess: !!navigator.clipboard,
                localStorage: !!window.localStorage
            }
        };

        if (Object.values(report.modules).includes('MISSING')) {
            report.status = 'DEGRADED';
        }

        console.table(report.modules);
        return report;
    }

    /**
     * Analyzes bit density of the current carrier.
     * Useful for identifying if a text is "suspiciously" dense with hidden data.
     * @returns {Object} Density report.
     */
    analyzeDensity() {
        const carrier = this.context._elements.articleBody.innerText;
        const stats = this.context.stego.getStats(carrier);

        const totalChars = carrier.length;
        const stegoChars = stats.zeroWidthCount;
        const densityPercentage = (stegoChars / totalChars) * 100;

        return {
            totalChars,
            stegoChars,
            densityPercentage: densityPercentage.toFixed(4) + '%',
            riskLevel: densityPercentage > 1 ? 'High' : (densityPercentage > 0.1 ? 'Moderate' : 'Minimal')
        };
    }

    /**
     * Measures the execution time of a specific task.
     * @param {string} taskName - Label for the task.
     * @param {Function} taskFn - The logic to execute.
     */
    measurePerformance(taskName, taskFn) {
        const start = performance.now();
        const result = taskFn();
        const end = performance.now();

        const duration = end - start;
        this.history.push({ task: taskName, duration, time: new Date() });

        console.log(`[PERF] ${taskName} took ${duration.toFixed(3)}ms`);
        return result;
    }

    /**
     * Estimates the memory footprint of the current application state.
     * (Simulated estimation based on string sizes).
     * @returns {string} Estimated size.
     */
    estimateMemoryUsage() {
        const carrierSize = new Blob([this.context._elements.articleBody.innerText]).size;
        const secretSize = new Blob([this.context._elements.inputSecret.value]).size;

        const total = carrierSize + secretSize;
        return Utils.formatBytes(total);
    }

    /**
     * Exports a diagnostic report to the log.
     */
    exportFullReport() {
        const health = this.runHealthCheck();
        const density = this.analyzeDensity();
        const memory = this.estimateMemoryUsage();

        const fullLog = `
--- STEGPLAY DIAGNOSTIC REPORT ---
Status: ${health.status}
Carrier Density: ${density.densityPercentage}
Estimated Carrier Memory: ${memory}
Operations this session: ${this.context._state.operationsCount}
Uptime: ${((Date.now() - this.context._state.sessionStart) / 1000).toFixed(1)}s
----------------------------------
        `;

        console.log(fullLog);
    }
}

// Attach to global window after UI is ready
document.addEventListener('DOMContentLoaded', () => {
    if (window.stegPlay) {
        window.diagnostics = new StegDiagnostics(window.stegPlay);

        // Auto-run first report in console
        setTimeout(() => window.diagnostics.exportFullReport(), 2000);
    }
});
