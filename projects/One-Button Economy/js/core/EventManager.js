/**
 * EventManager.js
 * 
 * Implements the Publisher/Subscriber pattern to handle game events.
 * This decouples systems so they don't need direct references to each other.
 */

export class EventManager {
    constructor() {
        this.listeners = new Map();
        this.eventQueue = [];
        this.isProcessing = false;
    }

    /**
     * Subscribes a callback function to a specific event.
     * @param {string} eventName - The name of the event to listen for.
     * @param {Function} callback - The function to execute when the event is emitted.
     * @returns {Function} A function to unsubscribe this listener.
     */
    on(eventName, callback) {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, []);
        }

        const callbacks = this.listeners.get(eventName);
        callbacks.push(callback);

        // Return unsubscribe function
        return () => {
            this.off(eventName, callback);
        };
    }

    /**
     * Unsubscribes a callback from an event.
     * @param {string} eventName 
     * @param {Function} callback 
     */
    off(eventName, callback) {
        if (!this.listeners.has(eventName)) return;

        const callbacks = this.listeners.get(eventName);
        const index = callbacks.indexOf(callback);

        if (index !== -1) {
            callbacks.splice(index, 1);
        }
    }

    /**
     * Emits an event immediately.
     * @param {string} eventName - The name of the event.
     * @param {*} data - Data to pass to the listeners.
     */
    emit(eventName, data) {
        if (!this.listeners.has(eventName)) return;

        const callbacks = this.listeners.get(eventName);

        // Clone array to prevent issues if listeners unsubscribe during emission
        [...callbacks].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event listener for ${eventName}:`, error);
            }
        });
    }

    /**
     * Queues an event to be processed later (e.g., at the end of a frame).
     * @param {string} eventName 
     * @param {*} data 
     */
    queue(eventName, data) {
        this.eventQueue.push({ eventName, data });
    }

    /**
     * Processes all queued events.
     * Should be called once per frame, usually at the beginning or end.
     */
    processQueue() {
        if (this.isProcessing) return; // Prevent recursion issues

        this.isProcessing = true;

        // Process current queue, but not events added *during* processing
        // to avoid infinite loops
        const currentBatch = [...this.eventQueue];
        this.eventQueue = [];

        currentBatch.forEach(event => {
            this.emit(event.eventName, event.data);
        });

        this.isProcessing = false;
    }

    /**
     * Clears all listeners. Useful for game reset.
     */
    clear() {
        this.listeners.clear();
        this.eventQueue = [];
    }
}

// Export a singleton instance
export const GameEvents = new EventManager();
