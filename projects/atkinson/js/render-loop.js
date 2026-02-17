/**
 * Render Loop Module
 * 
 * Manages the animation frame loop.
 * Decouples the timing from the specific rendering logic.
 */

export class RenderLoop {
    constructor(callback) {
        this.callback = callback;
        this.isRunning = false;
        this.frameId = 0;

        // FPS throttling (optional, for retro feel or performance)
        // 0 means no throttle (max fps)
        this.targetFps = 0;
        this.lastTime = 0;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        this.loop();
    }

    stop() {
        this.isRunning = false;
        cancelAnimationFrame(this.frameId);
    }

    loop(time) {
        if (!this.isRunning) return;

        this.frameId = requestAnimationFrame((t) => this.loop(t));

        if (this.targetFps > 0) {
            const delta = time - this.lastTime;
            const interval = 1000 / this.targetFps;
            if (delta < interval) return;
            this.lastTime = time - (delta % interval);
        }

        if (this.callback) {
            this.callback(time);
        }
    }
}
