// eventBus.js
export class EventBus {
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
        const idx = cbs.indexOf(callback);
        if (idx > -1) {
            cbs.splice(idx, 1);
        }
    }

    emit(event, data) {
        if (!this.listeners.has(event)) return;
        const cbs = this.listeners.get(event);
        for (const cb of cbs) {
            cb(data);
        }
    }
}

export const globalEvents = new EventBus();
