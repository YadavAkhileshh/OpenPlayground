/**
 * GameLoop.js
 * 
 * Manages the high-precision timing loop using requestAnimationFrame.
 * Calculates delta time (dt) to ensure smooth consistent movement regardless of framerate.
 */

export class GameLoop {
    constructor(updateCallback, renderCallback) {
        this.updateCallback = updateCallback;
        this.renderCallback = renderCallback;

        this.lastTime = 0;
        this.accumulator = 0;
        this.step = 1 / 60; // Fixed time step (60 FPS)

        this.isRunning = false;
        this.requestId = null;

        this.boundLoop = this.loop.bind(this);
    }

    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.lastTime = performance.now();
        this.requestId = requestAnimationFrame(this.boundLoop);
        console.log('Game Loop started');
    }

    stop() {
        this.isRunning = false;
        if (this.requestId) {
            cancelAnimationFrame(this.requestId);
            this.requestId = null;
        }
        console.log('Game Loop stopped');
    }

    loop(currentTime) {
        if (!this.isRunning) return;

        // Calculate delta time in seconds
        let deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // Prevent spiral of death if lag occurs (cap dt at 0.25s)
        if (deltaTime > 0.25) deltaTime = 0.25;

        this.accumulator += deltaTime;

        // Update fixed time steps
        while (this.accumulator >= this.step) {
            this.updateCallback(this.step);
            this.accumulator -= this.step;
        }

        // Render with interpolation factor (alpha)
        // alpha = accumulator / step
        // (For this simple engine, we might ignore alpha in the render system for now,
        // but it's good practice for smooth visuals)
        const alpha = this.accumulator / this.step;
        this.renderCallback(alpha);

        this.requestId = requestAnimationFrame(this.boundLoop);
    }
}
