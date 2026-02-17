/**
 * decay-engine.js
 * The central heartbeat of DecayDiary.
 * 
 * This module manages the requestAnimationFrame loop, triggering the 
 * TimerSystem to update character states and the UIManager to reflect 
 * changes in the display.
 */

class DecayEngine {
    constructor() {
        /**
         * State of the engine loop
         * @type {boolean}
         */
        this.isRunning = false;

        /**
         * ID of the current animation frame
         * @type {number|null}
         */
        this.frameId = null;

        /**
         * Timestamp of the last processed frame
         * @type {number}
         */
        this.lastUpdateTime = 0;
    }

    /**
     * Starts the decay engine.
     */
    start() {
        if (this.isRunning) return;

        console.log("DecayEngine: Initiating lifecycle.");
        this.isRunning = true;
        this.lastUpdateTime = Date.now();
        this.loop();
    }

    /**
     * The main execution loop.
     * Synchronized with the browser's refresh rate via requestAnimationFrame.
     */
    loop() {
        if (!this.isRunning) return;

        // Record frame for performance tracking
        if (typeof performanceMonitor !== 'undefined') {
            performanceMonitor.recordFrame();
        }

        const now = Date.now();
        const deltaTime = now - this.lastUpdateTime;

        // Ensure we only tick at the rate defined in CONFIG
        if (deltaTime >= CONFIG.DECAY.TICK_RATE) {
            this.update(now);
            this.lastUpdateTime = now;

            // Emit tick event for decoupled subscribers
            if (typeof eventBus !== 'undefined') {
                eventBus.emit(EVENTS.ENGINE_TICK, { timestamp: now, deltaTime });
            }
        }

        this.frameId = requestAnimationFrame(() => this.loop());
    }

    /**
     * Executes a single update cycle.
     * @param {number} timestamp - Current high-precision timestamp.
     */
    update(timestamp) {
        // 1. Tick the timer system to age characters
        const expiredIds = timerSystem.tick(timestamp);

        // 2. Cleanup expired elements
        if (expiredIds.length > 0) {
            this.cleanup(expiredIds);

            // Emit expiration event
            if (typeof eventBus !== 'undefined') {
                eventBus.emit(EVENTS.CHAR_EXPIRED, { count: expiredIds.length });
            }
        }

        // 3. Update global UI elements (counters, indicators)
        uiManager.updateStats(timerSystem.count);
    }

    /**
     * Safely removes expired characters from the tracking system.
     * @param {Array<string>} ids - List of IDs to unregister.
     */
    cleanup(ids) {
        ids.forEach(id => {
            timerSystem.unregister(id);
        });

        // Signal UI manager that a decay event occurred
        uiManager.onDecayEvent();
    }

    /**
     * Pauses the decay engine.
     * Useful for performance conservation when the tab is inactive.
     */
    pause() {
        this.isRunning = false;
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
            this.frameId = null;
        }
        console.log("DecayEngine: Paused.");
    }

    /**
     * Resumes the engine from a paused state.
     */
    resume() {
        if (!this.isRunning) {
            this.start();
        }
    }
}

// Global instance
const decayEngine = new DecayEngine();
