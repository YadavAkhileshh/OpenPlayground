/**
 * @file overlay.js
 * @description Manages the cinematic UI overlay and statistics.
 */

class Overlay {
    constructor() {
        this.elMs = document.getElementById('stat-ms');
        this.elRes = document.getElementById('stat-res');
        this.elRays = document.getElementById('stat-rays');
        this.elLoading = document.getElementById('loading-bar');

        this.frameCount = 0;
        this.accumTime = 0;

        // Initial state
        this.setLoading(50);
        setTimeout(() => this.setLoading(100), 500);
        setTimeout(() => this.hideLoading(), 1000);
    }

    updateTime(ms) {
        // Smooth out the display
        this.accumTime += ms;
        this.frameCount++;

        if (this.frameCount > 10) {
            const avg = this.accumTime / this.frameCount;
            const fps = (1000 / avg).toFixed(1);
            this.elMs.textContent = `${avg.toFixed(1)}ms (${fps} FPS)`;

            this.accumTime = 0;
            this.frameCount = 0;
        }
    }

    updateResolution(w, h) {
        this.elRes.textContent = `${w}x${h}`;
    }

    updateRays(count) {
        // Format with commas
        this.elRays.textContent = count.toLocaleString();
    }

    setLoading(percent) {
        if (this.elLoading) {
            this.elLoading.style.width = `${percent}%`;
        }
    }

    hideLoading() {
        const container = document.getElementById('loading-bar-container');
        if (container) {
            container.style.opacity = '0';
        }
    }
}
