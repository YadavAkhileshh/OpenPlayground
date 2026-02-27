/**
 * Loop.js
 * Handles the game loop using requestAnimationFrame.
 */

export class Loop {
    constructor(updateFn, renderFn) {
        this.updateFn = updateFn;
        this.renderFn = renderFn;

        this.lastTime = 0;
        this.running = false;
        this.rafId = null;
        this.accumulator = 0;
        this.stepSize = 1 / 60; // Fixed timestep for physics logic
    }

    start() {
        if (this.running) return;
        this.running = true;
        this.lastTime = performance.now();
        this.rafId = requestAnimationFrame(this.animate.bind(this));
    }

    stop() {
        this.running = false;
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }

    animate(currentTime) {
        if (!this.running) return;

        // Calculate delta time in seconds
        let deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // Cap delta time to prevent spiraling if tab is inactive
        if (deltaTime > 0.25) deltaTime = 0.25;

        this.accumulator += deltaTime;

        // Fixed timestep update
        while (this.accumulator >= this.stepSize) {
            this.updateFn(this.stepSize);
            this.accumulator -= this.stepSize;
        }

        // Render with interpolation factor (alpha)
        // alpha = this.accumulator / this.stepSize;
        this.renderFn(deltaTime); // Passing simple DT to render for now since we might not do full interpolation yet

        this.rafId = requestAnimationFrame(this.animate.bind(this));
    }
}
