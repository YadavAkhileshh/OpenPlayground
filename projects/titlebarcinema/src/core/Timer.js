/**
 * TitleBarCinema - Timer.js
 * 
 * ============================================================================
 * ARCHITECTURAL OVERVIEW
 * ============================================================================
 * The Timer module is the heartbeat of the TitleBarCinema engine. Unlike a 
 * standard requestAnimationFrame loop which attempts to run at 60fps+, the 
 * GameTimer is designed to be "throttled by design." 
 * 
 * Because updating the browser tab title too frequently causes performance 
 * degradation and unreadable flickering, this timer gates the execution of 
 * its callback to a user-defined interval (defaulting to 150ms).
 * 
 * It employs a high-precision accumulation technique to ensure that even if
 * the browser's requestAnimationFrame timing fluctuates, the game logic
 * maintains a consistent pace relative to real time.
 * 
 * ============================================================================
 * MODULE METADATA
 * ============================================================================
 * @project TitleBarCinema
 * @module Core.Timer
 * @version 1.0.0
 * @author Antigravity
 */

/**
 * @class GameTimer
 * @description A precision timing engine for periodic execution.
 */
export class GameTimer {
    /**
     * @constructor
     * @param {Function} callback - The logic to execute on every tick.
     * @param {number} interval - The target milliseconds between ticks.
     */
    constructor(callback, interval) {
        /** @private @type {Function} The function to execute */
        this.callback = callback;

        /** @private @type {number} Target interval in ms */
        this.interval = interval;

        /** @private @type {number} Timestamp of the last frame */
        this.lastTime = 0;

        /** @private @type {number} Amount of time waiting to be processed */
        this.accumulatedTime = 0;

        /** @public @type {boolean} Current activity state of the timer */
        this.isRunning = false;

        /** @private @type {number|null} The requestAnimationFrame ID */
        this.requestId = null;
    }

    /**
     * Starts the game loop.
     * Initializes the timeline and begins the recursive rAF cycle.
     * @returns {void}
     */
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        this.loop();
    }

    /**
     * Pauses the game loop.
     * Stops the recursive rAF cycle and clears the request ID.
     * @returns {void}
     */
    stop() {
        this.isRunning = false;
        if (this.requestId) {
            cancelAnimationFrame(this.requestId);
            this.requestId = null;
        }
    }

    /**
     * Main recursive loop using requestAnimationFrame.
     * Updates only when the defined interval has passed.
     * Supports catch-up logic via temporal accumulation.
     * @private
     * @returns {void}
     */
    loop() {
        if (!this.isRunning) return;

        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Add the passed time to our bucket
        this.accumulatedTime += deltaTime;

        // Perform as many updates as necessary to catch up to real time
        // This ensures the game speed doesn't drop on laggy systems, 
        // though it may result in "teleporting" if delta is huge.
        while (this.accumulatedTime >= this.interval) {
            this.callback();
            this.accumulatedTime -= this.interval;

            // Safety break to prevent infinite loops if callback is too slow
            if (this.accumulatedTime > 1000) {
                this.accumulatedTime = 0;
                break;
            }
        }

        this.requestId = requestAnimationFrame(() => this.loop());
    }

    /**
     * Update the timing interval dynamically.
     * Useful for increasing game speed during difficulty spikes.
     * @param {number} newInterval - The new target milliseconds.
     * @returns {void}
     */
    setInterval(newInterval) {
        this.interval = Math.max(16, newInterval); // Clamp to roughly 60fps max
    }
}

