export class Loop {
    constructor(updateFn, renderFn) {
        this.updateFn = updateFn;
        this.renderFn = renderFn;

        this.lastTime = 0;
        this.accumulator = 0;
        this.step = 1 / 60; // Fixed timestep for physics
        this.running = false;
        this.rafId = null;
    }

    start() {
        if (this.running) return;
        this.running = true;
        this.lastTime = performance.now();
        this.rafId = requestAnimationFrame(this.loop.bind(this));
    }

    stop() {
        this.running = false;
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }
    }

    loop(currentTime) {
        if (!this.running) return;

        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // Cap deltaTime to prevent spiral of death
        const safeDelta = Math.min(deltaTime, 0.25);

        this.accumulator += safeDelta;

        while (this.accumulator >= this.step) {
            this.updateFn(this.step);
            this.accumulator -= this.step;
        }

        // Render with interpolation factor (alpha)
        // alpha = this.accumulator / this.step;
        this.renderFn();

        this.rafId = requestAnimationFrame(this.loop.bind(this));
    }
}
