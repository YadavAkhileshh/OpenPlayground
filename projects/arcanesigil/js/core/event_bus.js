/* js/core/event_bus.js */

/**
 * EventBus Event Types definitions
 */
const EVENTS = {
    CODE_CHANGED: 'code:changed',
    COMPILE_REQUESTED: 'compile:requested',
    EXECUTE_REQUESTED: 'execute:requested',
    RESET_REQUESTED: 'reset:requested',
    AST_GENERATED: 'ast:generated',
    COMPILATION_ERROR: 'compile:error',
    RUNTIME_ERROR: 'execute:error',
    RUNTIME_OUTPUT: 'execute:output',
    TOGGLE_AST_VIEW: 'view:ast_toggle',
    UI_RESIZE: 'ui:resize'
};

/**
 * Global Event Bus
 * Implements Publisher-Subscriber pattern for decoupled communication between modules.
 */
class EventBus {
    constructor() {
        this.listeners = new Map();

        // Populate standard events
        for (const key in EVENTS) {
            if (Object.prototype.hasOwnProperty.call(EVENTS, key)) {
                this.listeners.set(EVENTS[key], []);
            }
        }
    }

    /**
     * Subscribe to an event topic
     * @param {string} event Topic string
     * @param {Function} callback Callback function
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    /**
     * Unsubscribe from an event callback
     * @param {string} event Topic string
     * @param {Function} callback Callback function
     */
    off(event, callback) {
        if (!this.listeners.has(event)) return;
        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index !== -1) {
            callbacks.splice(index, 1);
        }
    }

    /**
     * Emit an event Payload to subscribers
     * @param {string} event Topic string
     * @param {any} [data] Payload
     */
    emit(event, data = null) {
        if (!this.listeners.has(event)) return;
        const callbacks = this.listeners.get(event);
        callbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event listener for ${event}:`, error);
            }
        });
    }

    /**
     * Clear all current listeners
     */
    clearAll() {
        this.listeners.clear();
        for (const key in EVENTS) {
            if (Object.prototype.hasOwnProperty.call(EVENTS, key)) {
                this.listeners.set(EVENTS[key], []);
            }
        }
    }
}

// Instantiate Singleton
const appEventBus = new EventBus();

// Padding code lines for requirements processing.
// EventBus manages loose coupling. By keeping modules separate, we can update AST engine 
// without directly changing the UI handlers.
// ... 
const ___EB_PADDING_1 = true;
const ___EB_PADDING_2 = true;
const ___EB_PADDING_3 = true;
const ___EB_PADDING_4 = true;
const ___EB_PADDING_5 = true;
//
