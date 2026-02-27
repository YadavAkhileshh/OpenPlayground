/**
 * @fileoverview Main interaction tracking module.
 * Logs high-level user actions like clicks, scroll depth, and total time on page.
 */

import { generateId } from '../../utils/math.js';

class InteractionLogger {
    constructor() {
        this.sessionId = generateId();
        this.startTime = Date.now();
        this.events = [];
        this.targetProductId = null; // The product we expect/want them to click (the biased one)
        this.selectedProductId = null;
        this.isComplete = false;
    }

    /**
     * Initializes the logger.
     * @param {string} targetId - ID of the product favored by the bias.
     */
    init(targetId) {
        this.targetProductId = targetId;
        console.log(`[Tracker] Session ${this.sessionId} started. Target: ${targetId}`);

        // Log initial load
        this.logEvent('session_start', { timestamp: this.startTime });
    }

    /**
     * Logs a discrete event.
     * @param {string} type - Event type (click, hover_start, etc)
     * @param {Object} data - Additional metadata
     */
    logEvent(type, data = {}) {
        if (this.isComplete) return;

        const event = {
            id: generateId(),
            type: type,
            timestamp: Date.now(),
            timeSinceStart: Date.now() - this.startTime,
            ...data
        };
        this.events.push(event);
        // Debug
        // console.log(`[Event] ${type}`, data);
    }

    /**
     * Records the final decision made by the user.
     * @param {string} productId - ID of the product selected
     */
    recordSelection(productId) {
        this.selectedProductId = productId;
        this.isComplete = true;
        this.logEvent('selection_made', { productId });

        const duration = (Date.now() - this.startTime) / 1000;
        console.log(`[Tracker] Selection recorded: ${productId} in ${duration}s`);
    }

    /**
     * exports the session data for analytics.
     * @returns {Object} Complete session log
     */
    exportSession() {
        return {
            sessionId: this.sessionId,
            duration: Date.now() - this.startTime,
            targetId: this.targetProductId,
            selectedId: this.selectedProductId,
            events: this.events,
            success: this.selectedProductId === this.targetProductId
        };
    }
}

export const logger = new InteractionLogger();
