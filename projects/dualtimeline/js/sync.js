import { logger } from './utils.js';

// Configuration constants for the sync system
const SYNC_CHANNEL_NAME = 'dualtimeline_broadcast';
const HEARTBEAT_INTERVAL = 1000; // 1 second heartbeats
const HANDSHAKE_TIMEOUT = 5000; // 5 seconds to establish first contact

/**
 * Sync Protocol Messages
 */
export const MESSAGES = {
    CONNECT: 'HEARTBEAT_READY',      // Initial contact
    DISCONNECT: 'TERMINATE',        // Window closing
    STATE_UPDATE: 'SYNC_STATE',     // Regular state updates (time, duration, buffers)
    CMD_PLAY: 'ACTION_PLAY',        // Play command from control
    CMD_PAUSE: 'ACTION_PAUSE',      // Pause command from control
    CMD_SEEK: 'ACTION_SEEK',        // Seek command from control
    CMD_PING: 'HEARTBEAT_PING',     // Latency check
    CMD_PONG: 'HEARTBEAT_PONG'      // Latency response
};

class SyncEngine {
    constructor() {
        // Core communication channel
        this.channel = new BroadcastChannel(SYNC_CHANNEL_NAME);

        // Internal state tracking
        this.role = this.detectRole();
        this.isConnected = false;
        this.lastHeartbeat = 0;
        this.latency = 0;

        // Event listeners storage
        this.callbacks = new Set();

        // Initialize channel listeners
        this.init();
    }

    /**
     * Determine if this instance is the Player or Timeline
     */
    detectRole() {
        const path = window.location.pathname;
        if (path.includes('player.html')) return 'PLAYER';
        if (path.includes('timeline.html')) return 'TIMELINE';
        return 'UNKNOWN';
    }

    /**
     * Initialize the broadcast channel and heartbeat system
     */
    init() {
        logger.info(`Initialized as ${this.role}`);

        this.channel.onmessage = (event) => {
            const { type, payload, timestamp, sender } = event.data;

            // Ignore messages from self
            if (sender === this.role) return;

            this.handleIncomingMessage(type, payload, timestamp);
        };

        // Start heartbeat logic after a short delay
        setTimeout(() => this.startHeartbeat(), 500);

        // Notify other Side about current page state
        window.addEventListener('load', () => {
            this.send(MESSAGES.CONNECT, { role: this.role, state: 'initial' });
        });

        // Handle window closure to notify other side
        window.addEventListener('beforeunload', () => {
            this.send(MESSAGES.DISCONNECT, { role: this.role });
            this.channel.close();
        });

        // Handle focus changes (helps keep sync tight)
        window.addEventListener('focus', () => {
            logger.debug('Window focused, requesting state refresh');
            this.send(MESSAGES.CMD_PING, { trigger: 'focus' });
        });
    }

    /**
     * Core message dispatcher
     */
    send(type, payload = {}) {
        const message = {
            type,
            payload,
            timestamp: performance.now(),
            sender: this.role
        };

        try {
            this.channel.postMessage(message);
        } catch (e) {
            console.error(`[SyncEngine] Failed to send message: ${type}`, e);
        }
    }

    /**
     * Process incoming broadcast messages
     */
    handleIncomingMessage(type, payload, timestamp) {
        // Calculate latency for debug mapping
        const currentLatency = performance.now() - timestamp;
        this.latency = Math.round(currentLatency);

        switch (type) {
            case MESSAGES.CONNECT:
                // Prevent cyclic connection messages
                if (payload.role === this.role) return;

                logger.info(`Connection handshake from ${payload.role}`);
                this.isConnected = true;
                this.lastHeartbeat = Date.now();
                this.broadcastLocalUpdate('connection', true);

                // Respondent with local state immediately if sender isn't responding to US
                if (payload.state === 'initial') {
                    this.send(MESSAGES.CONNECT, { role: this.role, state: 'response' });
                }
                break;

            case MESSAGES.DISCONNECT:
                logger.info(`Remote ${payload.role} disconnected`);
                this.isConnected = false;
                this.broadcastLocalUpdate('connection', false);
                break;

            case MESSAGES.CMD_PING:
                this.send(MESSAGES.CMD_PONG, { originalTimestamp: timestamp });
                break;

            case MESSAGES.CMD_PONG:
                this.latency = Math.round(performance.now() - payload.originalTimestamp);
                this.broadcastLocalUpdate('latency', this.latency);
                // Also treat pong as a heartbeat
                this.lastHeartbeat = Date.now();
                if (!this.isConnected) {
                    this.isConnected = true;
                    this.broadcastLocalUpdate('connection', true);
                }
                break;

            default:
                // Relay application-level messages to registered callbacks
                this.callbacks.forEach(cb => cb(type, payload));
        }
    }

    /**
     * Maintain connection health via heartbeat
     */
    startHeartbeat() {
        setInterval(() => {
            this.send(MESSAGES.CMD_PING);

            // Check if we've lost contact
            const now = Date.now();
            if (this.isConnected && (now - this.lastHeartbeat > HEARTBEAT_INTERVAL * 5)) {
                // We've missed too many heartbeats
                logger.warn('Heartbeat lost, marking as disconnected');
                this.isConnected = false;
                this.broadcastLocalUpdate('connection', false);
            }
        }, HEARTBEAT_INTERVAL);

        // Initial connection broadcast
        this.send(MESSAGES.CONNECT, { role: this.role, state: 'initial' });
    }

    /**
     * Subscribe to specific message types
     */
    on(callback) {
        this.callbacks.add(callback);
    }

    /**
     * Unsubscribe from message events
     */
    off(callback) {
        this.callbacks.delete(callback);
    }

    /**
     * Internal event broadcaster for UI updates locally
     */
    broadcastLocalUpdate(event, data) {
        const localEvent = new CustomEvent(`sync:${event}`, { detail: data });
        window.dispatchEvent(localEvent);
    }
}

// Export a singleton instance
export const sync = new SyncEngine();
