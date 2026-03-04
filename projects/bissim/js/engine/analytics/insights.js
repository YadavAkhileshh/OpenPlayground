/**
 * @fileoverview Sentiment and text generation for the Reveal phase.
 * Produces the "Why this happened" text.
 */

import { mouseTracker } from '../tracking/mouseTracker.js';

export class InsightsGenerator {

    /**
     * Generates a breakdown of the user's behavior.
     * @param {Object} sessionData 
     * @param {Object} biasInfo 
     * @returns {string} HTML formatted insight string
     */
    generateInsight(sessionData, biasInfo) {
        const targetId = sessionData.targetId;
        const selectedId = sessionData.selectedId;
        const isSuccess = selectedId === targetId;

        let trackingInsight = '';

        // Analyze Hover Data
        const targetHover = mouseTracker.getHoverTime(targetId);
        if (targetHover > 2000) {
            trackingInsight += `<br><br><strong>Attention Capture:</strong> You spent ${(targetHover / 1000).toFixed(1)} seconds focusing on the biased option, which is significantly higher than average.`;
        }

        let conclusion = '';
        if (isSuccess) {
            conclusion = `The <strong>${biasInfo.title}</strong> succeeded. ${biasInfo.description}`;
        } else {
            conclusion = `The <strong>${biasInfo.title}</strong> was attempted, but you resisted. ${biasInfo.description} However, you still spent time evaluating it.`;
        }

        return `
            <p>${conclusion}</p>
            <p>${trackingInsight}</p>
        `;
    }
}

export const insights = new InsightsGenerator();
