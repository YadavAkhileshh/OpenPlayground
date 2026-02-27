/**
 * System Event Bus
 */
class EventBusBase {
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

    emit(event, payload = null) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            callbacks.forEach(cb => {
                try {
                    cb(payload);
                } catch (e) {
                    Logger.error('EventBus', `Error in listener for event ${event}: ${e.message}`);
                }
            });
        }
    }

    once(event, callback) {
        const wrapper = (payload) => {
            this.off(event, wrapper);
            callback(payload);
        };
        this.on(event, wrapper);
    }
}

window.EventBus = new EventBusBase();
