/**
 * LindenArboretum - FPS Counter Module
 * Samples requestAnimationFrame timestamps to print FPS and metrics.
 */

import { domUtils } from './domUtils.js';

export const perfMonitor = {
    fpsEl: null,
    genTimeEl: null,
    commandsEl: null,

    frameCount: 0,
    lastTime: 0,
    fps: 0,

    init() {
        this.fpsEl = domUtils.get('fps-value');
        this.genTimeEl = domUtils.get('gen-time-value');
        this.commandsEl = domUtils.get('commands-value');

        this.lastTime = performance.now();
    },

    /**
     * Called every frame to measure FPS.
     */
    tick(now) {
        this.frameCount++;

        if (now - this.lastTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = now;

            if (this.fpsEl) {
                this.fpsEl.textContent = this.fps;
            }
        }
    },

    /**
     * Updates Generation Time and Command Count metrics.
     */
    updateGenMetrics(timeMs, cmdCount) {
        if (this.genTimeEl) {
            this.genTimeEl.textContent = timeMs.toFixed(1) + 'ms';
            // Highlight slow generations
            if (timeMs > 50) this.genTimeEl.style.color = 'var(--color-error)';
            else this.genTimeEl.style.color = 'var(--color-primary-bright)';
        }

        if (this.commandsEl) {
            this.commandsEl.textContent = cmdCount.toLocaleString();
        }
    }
};
