/**
 * js/core/events.js
 * Simple PubSub Event Bus for decoupling systems.
 */

class EventBus {
    constructor() {
        this.listeners = new Map();
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
    }

    off(event, callback) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).delete(callback);
            if (this.listeners.get(event).size === 0) {
                this.listeners.delete(event);
            }
        }
    }

    emit(event, ...args) {
        if (this.listeners.has(event)) {
            for (const callback of this.listeners.get(event)) {
                try {
                    callback(...args);
                } catch (err) {
                    console.error(`Error in event listener for ${event}:`, err);
                }
            }
        }
    }
}

export const events = new EventBus();
