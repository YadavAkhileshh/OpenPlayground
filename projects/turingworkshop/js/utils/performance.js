/**
 * Performance monitoring utilities.
 * @module Utils/Performance
 */

export class PerfMonitor {
    constructor() {
        this.fps = 0;
        this.frames = 0;
        this.lastTime = performance.now();
    }

    update() {
        this.frames++;
        const now = performance.now();
        if (now - this.lastTime >= 1000) {
            this.fps = this.frames;
            this.frames = 0;
            this.lastTime = now;
            return true; // Returns true if FPS was updated
        }
        return false;
    }

    getCSSColor() {
        if (this.fps > 50) return '#0f0';
        if (this.fps > 30) return '#ff0';
        return '#f00';
    }
}
