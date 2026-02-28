/**
 * InputHandler System
 * Captures user input and buffers it for delayed execution.
 */

class InputHandler {
    constructor() {
        this.buffer = []; // Queue of { timestamp, action, type }
        this.activeKeys = new Set();
        this.isListening = false;

        // We bind these once to keep references
        this._handleKeyDown = this._handleKeyDown.bind(this);
        this._handleKeyUp = this._handleKeyUp.bind(this);
    }

    /**
     * Start listening for keyboard events
     */
    init() {
        window.addEventListener('keydown', this._handleKeyDown);
        window.addEventListener('keyup', this._handleKeyUp);
        this.isListening = true;
        console.log("Input system initialized.");
    }

    /**
     * Stop listening
     */
    destroy() {
        window.removeEventListener('keydown', this._handleKeyDown);
        window.removeEventListener('keyup', this._handleKeyUp);
        this.isListening = false;
        this.buffer = [];
        this.activeKeys.clear();
    }

    /**
     * Clear buffer and state, e.g. on level restart
     */
    reset() {
        this.buffer = [];
        this.activeKeys.clear();
    }

    /**
     * Handle key press
     * @param {KeyboardEvent} e 
     */
    _handleKeyDown(e) {
        if (!this.isListening) return;

        const action = KEY_MAP[e.key];
        if (action && !this.activeKeys.has(e.key)) {
            this.activeKeys.add(e.key); // Prevent repeat until keyup

            // Push "START" action to buffer
            this._addToBuffer(action, 'START');
        }
    }

    /**
     * Handle key release
     * @param {KeyboardEvent} e 
     */
    _handleKeyUp(e) {
        if (!this.isListening) return;

        const action = KEY_MAP[e.key];
        if (action) {
            this.activeKeys.delete(e.key);

            // Push "STOP" action to buffer
            this._addToBuffer(action, 'STOP');
        }
    }

    /**
     * Add an input event to the queue
     * @param {string} action - 'UP', 'DOWN', etc.
     * @param {string} type - 'START' or 'STOP'
     */
    _addToBuffer(action, type) {
        const timestamp = performance.now();

        // Safety cap
        if (this.buffer.length > CONFIG.BUFFER_SIZE) {
            this.buffer.shift(); // Drop oldest if overflowing (rare)
        }

        this.buffer.push({
            timestamp: timestamp,
            action: action,
            type: type,
            executed: false
        });

        // Notify UI to visualize this input (optional direct call or polling)
    }

    /**
     * Get inputs that are ready to be executed based on the delay
     * @param {number} currentTime - Current game time
     * @param {number} delay - The delay in milliseconds
     * @returns {Array} List of executable input events
     */
    getReadyInputs(currentTime, delay) {
        const ready = [];
        const threshold = currentTime - delay;

        while (this.buffer.length > 0 && this.buffer[0].timestamp <= threshold) {
            const input = this.buffer.shift();
            ready.push(input);
        }

        return ready;
    }

    /**
     * Return the current future buffer for visualization
     * @returns {Array}
     */
    getFutureBuffer() {
        return this.buffer;
    }
}
