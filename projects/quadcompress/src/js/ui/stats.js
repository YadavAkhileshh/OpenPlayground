/**
 * QuadCompress Stats UI
 * 
 * Manages the "Telemetry" section of the UI.
 * Calculated compression ratios and updates DOM elements.
 * 
 * @module StatsUI
 */

export class StatsUI {
    constructor() {
        this.elCount = document.getElementById('stat-count');
        this.elTime = document.getElementById('stat-time');
        this.elDepth = document.getElementById('stat-depth');
        this.elRatio = document.getElementById('stat-ratio');

        this.sourcePixels = 0;
    }

    setSourceSize(w, h) {
        this.sourcePixels = w * h;
    }

    update(nodeCount, maxDepth, processTimeMs) {
        this.elCount.textContent = nodeCount.toLocaleString();
        this.elDepth.textContent = maxDepth;
        this.elTime.textContent = processTimeMs.toFixed(1) + 'ms';

        // Calculate theoretical compression
        // Raw RGB = 3 bytes per pixel.
        // Node = x,y,w,h,r,g,b (roughly 7 integers * 4 bytes = 28 bytes) + overhead
        // This is a naive estimation for fun visualization
        if (this.sourcePixels > 0) {
            const rawSize = this.sourcePixels * 3; // 3 bytes per pixel
            const compressedSize = nodeCount * 12; // approximated struct size
            const ratio = (1 - (compressedSize / rawSize)) * 100;
            this.elRatio.textContent = ratio.toFixed(2) + '%';
        }
    }
}
