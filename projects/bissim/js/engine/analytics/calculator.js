/**
 * @fileoverview Influence Score Calculator.
 * Algorithms to quantify how much the user was influenced by the bias.
 */

import { mouseTracker } from '../tracking/mouseTracker.js';
import { normalize } from '../../utils/math.js';

export class AnalyticsCalculator {
    constructor() {
        this.weights = {
            selection: 50,      // Did they pick the target? (50% of score)
            hoverTime: 30,      // Did they stare at it longer?
            hesitation: 20      // Did they hesitate before picking?
        };
    }

    /**
     * Calculates the final "Influence Score" (0-100%).
     * @param {Object} sessionData - Full session data log
     * @returns {number} Score
     */
    calculateScore(sessionData) {
        let score = 0;
        const targetId = sessionData.targetId;
        const selectedId = sessionData.selectedId;

        // 1. Selection Score (Binary)
        if (selectedId === targetId) {
            score += this.weights.selection;
        } else if (sessionData.events.find(e => e.type === 'click' && e.productId === targetId)) {
            // Did they at least try to click it initially? (Partial credit)
            score += this.weights.selection * 0.2;
        }

        // 2. Attention Score (Hover Time)
        // Compare target hover time vs average of others
        const targetHover = mouseTracker.getHoverTime(targetId);
        let otherHoverTotal = 0;
        let otherCount = 0;

        // Iterate through hover log keys
        for (const pid in mouseTracker.hoverLog) {
            if (pid !== targetId) {
                otherHoverTotal += mouseTracker.hoverLog[pid];
                otherCount++;
            }
        }

        const avgOtherHover = otherCount > 0 ? (otherHoverTotal / otherCount) : 0;

        // If they hovered target significantly more than average
        if (targetHover > avgOtherHover) {
            // max score if double the attention
            const ratio = Math.min(targetHover / (avgOtherHover + 1), 2.0);
            // Normalized 0-1
            const normalizedRatio = normalize(ratio, 1, 2);
            score += normalizedRatio * this.weights.hoverTime;
        }

        // 3. Hesitation Score
        // If they picked the target quickly/decisively, high influence.
        // If they hesitated, lower influence (they thought about it).
        // Wait... actually, if they picked the target *mindlessly* (fast), that's high influence.
        const hesitation = mouseTracker.calculateHesitation();

        // hesitation 1.0 = straight line. 
        // We want low hesitation (high decisiveness) -> high score?
        // Let's invert: 
        if (selectedId === targetId) {
            // If they picked target, low hesitation = good (manipulation worked perfectly)
            // Cap hesitation at 3.0 for normalization
            const hesitationFactor = Math.max(0, 1 - normalize(hesitation, 1, 3));
            score += hesitationFactor * this.weights.hesitation;
        }

        return Math.min(Math.round(score), 100);
    }
}

export const calculator = new AnalyticsCalculator();
