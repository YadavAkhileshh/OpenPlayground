/**
 * Core rendering and logical iteration loop.
 */
export class Loop {
    /**
     * @param {Time} time 
     * @param {EventEmitter} events 
     */
    constructor(time, events) {
        this.time = time;
        this.events = events;
        this.rafId = null;
        this.isRunning = false;

        this.tick = this.tick.bind(this);
    }

    /**
     * Start the main loop.
     */
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.rafId = requestAnimationFrame(this.tick);
        this.events.emit('loop:start');
    }

    /**
     * Stop the main loop.
     */
    stop() {
        if (!this.isRunning) return;
        this.isRunning = false;
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
        this.events.emit('loop:stop');
    }

    /**
     * Main tick function called each frame.
     * @param {number} timestamp 
     */
    tick(timestamp) {
        if (!this.isRunning) return;

        this.time.update(timestamp);

        // Pre-update (e.g. input handling)
        this.events.emit('loop:preUpdate');

        // Main Logic update
        this.events.emit('loop:update');

        // Render step
        this.events.emit('loop:render');

        // Post-render / cleanup
        this.events.emit('loop:postRender');

        this.rafId = requestAnimationFrame(this.tick);
    }
}
