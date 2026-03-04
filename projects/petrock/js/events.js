/**
 * @fileoverview Event Utility for PetRock.
 * Implements a lightweight Pub/Sub pattern to decouple modules and 
 * provide a centralized message bus for the application.
 * @module Events
 */

/**
 * A central event hub for the application.
 */
class EventBus {
    constructor() {
        /** @type {Object<string, Function[]>} */
        this.events = {};
    }

    /**
     * Subscribe to an event.
     * @param {string} eventName - The name of the event to listen for.
     * @param {Function} callback - The function to call when the event fires.
     * @returns {Function} An unsubscribe function.
     */
    on(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }

        this.events[eventName].push(callback);

        // Return a cleanup function
        return () => this.off(eventName, callback);
    }

    /**
     * Unsubscribe from an event.
     * @param {string} eventName - The name of the event.
     * @param {Function} callback - The function to remove.
     */
    off(eventName, callback) {
        if (!this.events[eventName]) return;

        this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
    }

    /**
     * Emit an event with data.
     * @param {string} eventName - The name of the event to trigger.
     * @param {any} data - Data to pass to the listeners.
     */
    emit(eventName, data) {
        if (!this.events[eventName]) return;

        console.debug(`EventBus | Emitting: ${eventName}`, data);
        this.events[eventName].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`EventBus | Error in listener for ${eventName}:`, error);
            }
        });
    }

    /**
     * Removes all listeners for a specific event.
     * @param {string} eventName - The event to clear.
     */
    clear(eventName) {
        if (eventName) {
            delete this.events[eventName];
        } else {
            this.events = {};
        }
    }
}

// Export a singleton instance
export const events = new EventBus();

/**
 * Standard event names used in the application.
 * @enum {string}
 */
export const EVENT_TYPES = {
    ROCK_INIT: 'rock:init',
    ROCK_PET: 'rock:pet',
    ROCK_FEED: 'rock:feed',
    ROCK_THINK: 'rock:think',
    UI_UPDATE: 'ui:update',
    LOG_MESSAGE: 'log:message',
    SAVE_STATE: 'state:save'
};

/**
 * Utility function to debounce event emissions or other calls.
 * @param {Function} func - Function to debounce.
 * @param {number} wait - Wait time in ms.
 * @returns {Function} Debounced function.
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
