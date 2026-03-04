/**
 * High-performance synchronous/asynchronous Event Bus for decoupling systems
 */
class EventBus {
    constructor() {
        this.listeners = new Map();
        this.stats = {
            eventsEmitted: 0
        };
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    off(event, callback) {
        if (!this.listeners.has(event)) return;
        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    }

    emit(event, payload = null) {
        this.stats.eventsEmitted++;
        if (!this.listeners.has(event)) return;
        const callbacks = this.listeners.get(event);
        for (let i = 0; i < callbacks.length; i++) {
            try {
                callbacks[i](payload);
            } catch (err) {
                console.error(`Error in event listener for ${event}:`, err);
            }
        }
    }

    // Deferred emit for less critical UI updates to avoid blocking the matching engine
    emitAsync(event, payload = null) {
        setTimeout(() => this.emit(event, payload), 0);
    }

    clear() {
        this.listeners.clear();
    }
}

window.EventBus = EventBus;
