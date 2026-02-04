/**
 * @file comm.js
 * @description Centralized communication hub for WindowPong. 
 * This module leverages the BroadcastChannel API to create a seamless message bus
 * between the main terminal window, the paddle windows, and the ball window.
 * 
 * DESIGN PATTERN:
 * This module implements a Publish-Subscribe (Pub/Sub) pattern. Components can
 * register listeners for specific message types and broadcast events globally.
 * 
 * MESSAGE TYPES:
 * - PADDLE_UPDATE: Sent by paddles to report their screen coordinates.
 * - BALL_MOVE: Sent by the manager to update the ball window's position.
 * - FLASH_HIT: Sent by the manager to trigger visual feedback in a paddle window.
 * - MISS_FLASH: Sent by the manager to trigger feedback in the ball window.
 * 
 * WHY BROADCASTCHANNEL?
 * Unlike postMessage, BroadcastChannel doesn't require direct window references
 * for every communication pair. This makes it ideal for a decoupled multi-window
 * environment where windows might be opened or closed dynamically.
 */

const PongComm = (function () {
    /**
     * The unique channel name for this game session.
     * All windows in the same origin sharing this name will communicate.
     */
    const CHANNEL_NAME = 'pong_channel';

    /**
     * Internal reference to the browser's BroadcastChannel instance.
     */
    const channel = new BroadcastChannel(CHANNEL_NAME);

    /**
     * A Map to hold all registered listeners.
     * Key: Message type (string)
     * Value: Array of callback functions
     */
    const listeners = new Map();

    /**
     * Centralized message handler.
     * Every message entering the channel is parsed and dispatched to relevant listeners.
     */
    channel.onmessage = (event) => {
        try {
            const { type, ...payload } = event.data;

            if (!type) {
                console.warn("[Comm] Received message without type:", event.data);
                return;
            }

            if (listeners.has(type)) {
                listeners.get(type).forEach(callback => {
                    try {
                        callback(payload);
                    } catch (err) {
                        console.error(`[Comm] Error in listener for ${type}:`, err);
                    }
                });
            }
        } catch (err) {
            console.error("[Comm] Global message handling error:", err);
        }
    };

    /**
     * Error handling for the channel itself.
     */
    channel.onmessageerror = (event) => {
        console.error("[Comm] BroadcastChannel message error:", event);
    };

    return {
        /**
         * Broadcast a message to all windows in the session.
         * 
         * @param {string} type - The event identifier.
         * @param {object} payload - The data to accompany the event.
         */
        broadcast: function (type, payload = {}) {
            if (!type) return;

            try {
                channel.postMessage({ type, ...payload });
            } catch (err) {
                console.error(`[Comm] Failed to broadcast ${type}:`, err);
            }
        },

        /**
         * Register a callback to be executed when a specific message type is received.
         * 
         * @param {string} type - The event identifier to listen for.
         * @param {function} callback - The function to execute on event.
         */
        on: function (type, callback) {
            if (typeof callback !== 'function') return;

            if (!listeners.has(type)) {
                listeners.set(type, []);
            }
            listeners.get(type).push(callback);
        },

        /**
         * Remove a specific listener or all listeners for a type.
         * 
         * @param {string} type - The event identifier.
         * @param {function} [callback] - The specific function to remove.
         */
        off: function (type, callback) {
            if (!listeners.has(type)) return;

            if (callback) {
                const list = listeners.get(type);
                const index = list.indexOf(callback);
                if (index !== -1) list.splice(index, 1);
            } else {
                listeners.delete(type);
            }
        },

        /**
         * Closes the channel and cleans up listeners.
         */
        destroy: function () {
            channel.close();
            listeners.clear();
        }
    };
})();
