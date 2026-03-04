/**
 * LindenArboretum - Events Module
 * Simple PubSub system to decouple the UI from the rendering engine.
 */

class EventEmitter {
    constructor() {
        this.listeners = new Map();
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    emit(event, data) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            for (let i = 0; i < callbacks.length; i++) {
                callbacks[i](data);
            }
        }
    }
}

export const eventBus = new EventEmitter();
