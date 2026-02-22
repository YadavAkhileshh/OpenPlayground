/**
 * SingularityRay JS - Core - Event Bus
 * Global pub-sub orchestrator for core engine events
 * Connects the UI layer to the physics simulation safely.
 */

export class CoreEventBus {
    constructor() {
        this.listeners = new Map();
    }

    /**
     * Subscribe to a core engine event
     * @param {string} eventName 
     * @param {Function} callback 
     */
    on(eventName, callback) {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, new Set());
        }
        this.listeners.get(eventName).add(callback);
    }

    /**
     * Unsubscribe
     * @param {string} eventName 
     * @param {Function} callback 
     */
    off(eventName, callback) {
        if (this.listeners.has(eventName)) {
            this.listeners.get(eventName).delete(callback);
        }
    }

    /**
     * Emit an event crossing the boundary into the engine
     * @param {string} eventName 
     * @param {any} data 
     */
    emit(eventName, data) {
        if (this.listeners.has(eventName)) {
            for (const callback of this.listeners.get(eventName)) {
                try {
                    callback(data);
                } catch (e) {
                    console.error(`CoreEventBus Error on [${eventName}]:`, e);
                }
            }
        }
    }
}
