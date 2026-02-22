/**
 * A lightweight Event Emitter for decoupling modules.
 */
export class EventEmitter {
    constructor() {
        this.events = new Map();
    }

    /**
     * Subscribe to an event.
     * @param {string} eventName
     * @param {Function} callback
     */
    on(eventName, callback) {
        if (!this.events.has(eventName)) {
            this.events.set(eventName, []);
        }
        this.events.get(eventName).push(callback);
    }

    /**
     * Unsubscribe from an event.
     * @param {string} eventName
     * @param {Function} callback
     */
    off(eventName, callback) {
        if (!this.events.has(eventName)) return;
        const listeners = this.events.get(eventName);
        const index = listeners.indexOf(callback);
        if (index > -1) {
            listeners.splice(index, 1);
        }
    }

    /**
     * Emit an event with data.
     * @param {string} eventName
     * @param {any} [data]
     */
    emit(eventName, data) {
        if (!this.events.has(eventName)) return;
        const listeners = this.events.get(eventName);
        for (const callback of listeners) {
            callback(data);
        }
    }

    /**
     * Subscribe once.
     */
    once(eventName, callback) {
        const wrapper = (data) => {
            callback(data);
            this.off(eventName, wrapper);
        };
        this.on(eventName, wrapper);
    }
}
