/**
 * @fileoverview High-frequency mouse tracking for behavioral analysis.
 * Captures cursor path to determine hesitation, directness, and focus areas.
 */

import { mean } from '../../utils/math.js';
import { logger } from './interactLog.js';

class MouseTracker {
    constructor() {
        this.path = []; // Array of {x, y, timestamp}
        this.hoverLog = {}; // Map of productId -> totalDuration
        this.currentHoverStart = null;
        this.currentHoverId = null;
        this.isTracking = false;
        this.throttleTimer = null;
        this.sampleRate = 50; // ms
    }

    /**
     * Starts tracking mouse movements and hover events.
     */
    start() {
        if (this.isTracking) return;
        this.isTracking = true;

        document.addEventListener('mousemove', this.handleMove.bind(this));
        console.log('[MouseTracker] Tracking started');
    }

    /**
     * Stops tracking.
     */
    stop() {
        this.isTracking = false;
        document.removeEventListener('mousemove', this.handleMove.bind(this));
        this.endHover(); // Close any open hover sessions
    }

    /**
     * Handles mouse move events, throttled.
     * @param {MouseEvent} e 
     */
    handleMove(e) {
        if (!this.throttleTimer) {
            this.throttleTimer = setTimeout(() => {
                this.recordPoint(e.clientX, e.clientY);
                this.throttleTimer = null;
            }, this.sampleRate);
        }
    }

    /**
     * Records a single point in the path.
     * @param {number} x 
     * @param {number} y 
     */
    recordPoint(x, y) {
        this.path.push({
            x: Math.round(x),
            y: Math.round(y),
            t: Date.now()
        });
    }

    /**
     * Called when mouse enters a product card.
     * @param {string} productId 
     */
    startHover(productId) {
        if (this.currentHoverId === productId) return;

        // If we were hovering another product, end it first
        if (this.currentHoverId) {
            this.endHover();
        }

        this.currentHoverId = productId;
        this.currentHoverStart = Date.now();

        logger.logEvent('hover_start', { productId });
    }

    /**
     * Called when mouse leaves a product card.
     */
    endHover() {
        if (!this.currentHoverId) return;

        const duration = Date.now() - this.currentHoverStart;

        // Accumulate total hover time
        if (!this.hoverLog[this.currentHoverId]) {
            this.hoverLog[this.currentHoverId] = 0;
        }
        this.hoverLog[this.currentHoverId] += duration;

        logger.logEvent('hover_end', {
            productId: this.currentHoverId,
            duration: duration
        });

        this.currentHoverId = null;
        this.currentHoverStart = null;
    }

    /**
     * Analyzes the mouse path for "hesitation".
     * A simple heuristic: Path Length / Euclidean Distance.
     * Ratio closer to 1.0 means straight line (decisive).
     * High ratio means wandering (hesitant).
     * @returns {number} Hesitation index (1.0 = direct, >1.0 = hesitant)
     */
    calculateHesitation() {
        if (this.path.length < 2) return 1.0;

        let totalDistance = 0;
        for (let i = 1; i < this.path.length; i++) {
            const p1 = this.path[i - 1];
            const p2 = this.path[i];
            const dist = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
            totalDistance += dist;
        }

        const start = this.path[0];
        const end = this.path[this.path.length - 1];
        const euclidean = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));

        if (euclidean === 0) return 1.0; // Didn't actually move net distance

        return parseFloat((totalDistance / euclidean).toFixed(2));
    }

    /**
     * Returns the raw path for visualization.
     */
    getPath() {
        return this.path;
    }

    /**
     * Returns total hover time for a specific product.
     * @param {string} productId 
     */
    getHoverTime(productId) {
        return this.hoverLog[productId] || 0;
    }
}

export const mouseTracker = new MouseTracker();
