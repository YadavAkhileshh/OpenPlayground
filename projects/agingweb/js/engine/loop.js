/**
 * loop.js
 * The main heartbeat of the application using requestAnimationFrame.
 */

export class GameLoop {
    constructor(updateFn, renderFn) {
        this.updateFn = updateFn;
        this.renderFn = renderFn;
        this.lastTime = 0;
        this.running = false;
        this.rafId = null;
    }

    start() {
        if (this.running) return;
        this.running = true;
        this.lastTime = performance.now();
        this.rafId = requestAnimationFrame(this.tick.bind(this));
    }

    stop() {
        this.running = false;
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }
    }

    tick(currentTime) {
        if (!this.running) return;

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Cap delta time to prevent spiraling on large pauses
        const safeDelta = Math.min(deltaTime, 100);

        if (this.updateFn) this.updateFn(safeDelta);
        if (this.renderFn) this.renderFn();

        this.rafId = requestAnimationFrame(this.tick.bind(this));
    }
}
