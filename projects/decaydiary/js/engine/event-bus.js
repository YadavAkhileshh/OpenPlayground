/**
 * event-bus.js
 * A lightweight pub/sub implementation for component communication.
 * 
 * This ensures that modules like DecayEngine and UIManager remain 
 * decoupled, communicating through events rather than direct references.
 */

class EventBus {
    constructor() {
        /**
         * Registry of event listeners
         * @type {Object.<string, Array<Function>>}
         */
        this.events = {};
    }

    /**
     * Subscribe to an event.
     * @param {string} eventName 
     * @param {Function} callback 
     */
    on(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
    }

    /**
     * Unsubscribe from an event.
     * @param {string} eventName 
     * @param {Function} callback 
     */
    off(eventName, callback) {
        if (!this.events[eventName]) return;
        this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
    }

    /**
     * Emit an event with data.
     * @param {string} eventName 
     * @param {any} data 
     */
    emit(eventName, data) {
        if (!this.events[eventName]) return;

        console.groupCollapsed(`[EventBus] Emit: ${eventName}`);
        console.log("Payload:", data);
        console.groupEnd();

        this.events[eventName].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in EventBus subscriber for ${eventName}:`, error);
            }
        });
    }

    /**
     * Subscribe to an event once.
     * @param {string} eventName 
     * @param {Function} callback 
     */
    once(eventName, callback) {
        const handler = (data) => {
            this.off(eventName, handler);
            callback(data);
        };
        this.on(eventName, handler);
    }

    /**
     * Clears all listeners from the bus.
     */
    clear() {
        this.events = {};
    }
}

// Global instance
const eventBus = new EventBus();

/**
 * Event Constants
 */
const EVENTS = {
    CHAR_ADDED: 'char:added',
    CHAR_EXPIRED: 'char:expired',
    APP_LAUNCHED: 'app:launched',
    ENGINE_TICK: 'engine:tick',
    USER_ACTIVITY: 'user:activity',
    THEME_CHANGED: 'theme:changed'
};

// Freeze events to prevent magic string issues
Object.freeze(EVENTS);
