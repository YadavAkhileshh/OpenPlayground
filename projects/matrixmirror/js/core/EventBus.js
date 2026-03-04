/**
 * @file EventBus.js
 * @description A robust publish/subscribe system for handling application-wide events.
 * Allows modules to communicate without direct dependencies.
 */

export class EventBus {
    constructor() {
        this.listeners = new Map();
        this.debug = false; // Toggle for verbose logging
    }

    /**
     * Subscribe to an event.
     * @param {string} event - The event name.
     * @param {Function} callback - The function to execute.
     * @returns {Function} Unsubscribe function.
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);

        if (this.debug) {
            console.log(\`[EventBus] Subscribed to "\${event}"\`);
        }

        // Return unsubscriber
        return () => this.off(event, callback);
    }

    /**
     * Unsubscribe from an event.
     * @param {string} event - The event name.
     * @param {Function} callback - The callback to remove.
     */
    off(event, callback) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).delete(callback);
            if (this.listeners.get(event).size === 0) {
                this.listeners.delete(event);
            }
        }
    }

    /**
     * Emit an event to all subscribers.
     * @param {string} event - The event name.
     * @param {*} data - Data to pass to callbacks.
     */
    emit(event, data) {
        if (this.debug) {
            console.log(\`[EventBus] Emitting "\${event}"\`, data);
        }

        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(\`[EventBus] Error in listener for "\${event}":\`, error);
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
