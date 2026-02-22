/**
 * A simple decoupled event bus for cross-component communication.
 */
class EventBus {
    constructor() {
        this.listeners = new Map();
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    off(event, callback) {
        if (!this.listeners.has(event)) return;
        const cbs = this.listeners.get(event);
        const index = cbs.indexOf(callback);
        if (index > -1) {
            cbs.splice(index, 1);
        }
    }

    emit(event, payload = null) {
        if (!this.listeners.has(event)) return;
        for (const callback of this.listeners.get(event)) {
            try {
                callback(payload);
            } catch (e) {
                console.error(`Error in EventBus for event ${event}:`, e);
            }
        }
    }
}

// Export singleton instance
export const events = new EventBus();
