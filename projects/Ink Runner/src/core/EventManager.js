/**
 * EventManager.js
 * Simple Publish/Subscribe system for decoupled communication between game parts.
 */

class EventManager {
    constructor() {
        this.listeners = new Map();
    }

    /**
     * Subscribe to an event.
     * @param {string} event - The event name.
     * @param {function} callback - The function to call when event is emitted.
     * @returns {function} - Unsubscribe function.
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);

        // Return unsubscribe function
        return () => this.off(event, callback);
    }

    /**
     * Unsubscribe from an event.
     * @param {string} event - The event name.
     * @param {function} callback - The callback to remove.
     */
    off(event, callback) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).delete(callback);
        }
    }

    /**
     * Emit an event.
     * @param {string} event - The event name.
     * @param {any} data - Data to pass to listeners.
     */
    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for "${event}":`, error);
                }
            });
        }
    }

    /**
     * Clear all listeners.
     */
    clear() {
        this.listeners.clear();
    }
}

// Singleton instance
export const eventManager = new EventManager();
