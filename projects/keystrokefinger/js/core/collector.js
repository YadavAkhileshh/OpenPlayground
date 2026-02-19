/**
 * KeystrokeFingerprint - TypingCollector
 * Handles high-precision event listeners to capture keystroke dynamics.
 */

export class TypingCollector {
    constructor() {
        this.reset();
        this.activeKeys = new Map(); // Map<Key, StartTime>
        this.listeners = [];
    }

    /**
     * Resets the collector state.
     */
    reset() {
        this.rawData = []; // Array of {key, type, timestamp}
        this.dwellTimes = []; // Array of {key, duration, timestamp}
        this.flightTimes = []; // Array of {fromKey, toKey, duration}
        this.lastKeyUpTime = null;
        this.activeKeys.clear();
        this.startTime = null;
    }

    /**
     * Attaches event listeners to the target input element.
     * @param {HTMLInputElement} inputElement 
     */
    attach(inputElement) {
        this.inputElement = inputElement;

        const keyDownHandler = (e) => this.handleKeyDown(e);
        const keyUpHandler = (e) => this.handleKeyUp(e);
        // Using 'beforeinput' or 'input' isn't sufficient for timing, need key events

        inputElement.addEventListener('keydown', keyDownHandler);
        inputElement.addEventListener('keyup', keyUpHandler);

        this.listeners.push({ type: 'keydown', fn: keyDownHandler });
        this.listeners.push({ type: 'keyup', fn: keyUpHandler });
    }

    /**
     * Detaches listeners.
     */
    detach() {
        if (!this.inputElement) return;
        this.listeners.forEach(l => {
            this.inputElement.removeEventListener(l.type, l.fn);
        });
        this.listeners = [];
    }

    /**
     * Handles keydown event.
     * @param {KeyboardEvent} e 
     */
    handleKeyDown(e) {
        // Ignore modifiers and repeats if we want strict dwell/flight
        if (e.repeat) return;

        const now = performance.now();
        if (!this.startTime) this.startTime = now;

        // Calculate Flight Time (Time from last KeyUp to this KeyDown)
        if (this.lastKeyUpTime !== null) {
            const flightTime = now - this.lastKeyUpTime;
            this.flightTimes.push({
                time: flightTime,
                timestamp: now
            });
        }

        this.activeKeys.set(e.code, now);
        this.rawData.push({ type: 'down', key: e.code, time: now });

        // Notify visualizer via callback if assigned (handled in controller)
        if (this.onKeyDown) this.onKeyDown(e.code, now);
    }

    /**
     * Handles keyup event.
     * @param {KeyboardEvent} e 
     */
    handleKeyUp(e) {
        const now = performance.now();
        const start = this.activeKeys.get(e.code);

        if (start !== undefined) {
            const dwell = now - start;
            this.dwellTimes.push({
                key: e.code,
                duration: dwell,
                timestamp: now
            });
            this.activeKeys.delete(e.code);

            // Notify visualizer
            if (this.onKeyUp) this.onKeyUp(e.code, dwell);
        }

        this.lastKeyUpTime = now;
        this.rawData.push({ type: 'up', key: e.code, time: now });
    }

    /**
     * Returns the aggregated feature vector for the current session.
     * The vector could be simple [avgDwell, avgFlight] or a detailed sequence.
     * For accurate comparison, we'll return a raw sequence relative to the input text.
     */
    getSessionData() {
        return {
            dwells: [...this.dwellTimes],
            flights: [...this.flightTimes],
            totalTime: this.lastKeyUpTime - this.startTime
        };
    }
}
