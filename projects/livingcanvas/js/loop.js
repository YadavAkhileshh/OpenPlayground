/**
 * loop.js
 * Main simulation loop.
 */

class Loop {
    constructor(grid, renderer, ui, config) {
        this.grid = grid;
        this.renderer = renderer;
        this.ui = ui;
        this.config = config;
        this.stats = null;

        this.animationId = null;
        this.lastFrameTime = 0;
    }

    setUI(ui) {
        this.ui = ui;
    }

    start() {
        if (!this.config.IS_PAUSED) return;
        this.config.IS_PAUSED = false;
        this.lastFrameTime = performance.now();
        this.animate(this.lastFrameTime);
    }

    stop() {
        this.config.IS_PAUSED = true;
        cancelAnimationFrame(this.animationId);
    }

    step() {
        // Single step forward
        this.grid.update();
        this.renderer.draw();
        if (this.stats) this.stats.update();
    }

    draw() {
        // Force a draw (e.g. after clear)
        this.renderer.draw();
    }

    animate(timestamp) {
        if (this.config.IS_PAUSED) return;

        this.animationId = requestAnimationFrame((t) => this.animate(t));

        // Throttle FPS
        const interval = 1000 / this.config.DEFAULT_SPEED;
        const delta = timestamp - this.lastFrameTime;

        if (delta > interval) {
            this.lastFrameTime = timestamp - (delta % interval);

            this.grid.update();
            this.renderer.draw();

            if (this.ui) this.ui.updateStats();
            if (this.stats) this.stats.update();
        }
    }
}
