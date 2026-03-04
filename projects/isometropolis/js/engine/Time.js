/**
 * Handles delta time, simulation speed multiplier, and pause states.
 */
export class Time {
    constructor() {
        this.deltaTime = 0;
        this.totalTime = 0;
        this.lastTime = 0;

        // Simulation speed: 0 (paused), 1 (normal), 3 (fast)
        this.timeScale = 1;

        // Raw unmodified delta
        this.unscaledDeltaTime = 0;
    }

    /**
     * Updates the time variables based on requestAnimationFrame timestamp.
     * @param {number} timestamp - The current timestamp in milliseconds.
     */
    update(timestamp) {
        if (this.lastTime === 0) {
            this.lastTime = timestamp;
        }

        const rawDelta = (timestamp - this.lastTime) / 1000;
        // Cap delta to prevent massive jumps when tab is inactive
        this.unscaledDeltaTime = Math.min(rawDelta, 0.1);
        this.deltaTime = this.unscaledDeltaTime * this.timeScale;

        this.totalTime += this.deltaTime;
        this.lastTime = timestamp;
    }

    /**
     * Sets the simulation speed.
     * @param {number} scale
     */
    setScale(scale) {
        this.timeScale = scale;
    }

    /**
     * Returns whether the game is currently paused.
     */
    isPaused() {
        return this.timeScale === 0;
    }
}
