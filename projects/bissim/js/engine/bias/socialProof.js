/**
 * @fileoverview Implementation of Social Proof.
 * Uses peer pressure mechanics (view counts, popularity badges) to influence choice.
 */

import { randomInt } from '../../utils/math.js';

export class SocialProofBias {
    constructor() {
        this.targetId = null;
    }

    /**
     * Adds social proof indicators.
     * @param {Object} scenario 
     * @returns {Object} Modified scenario
     */
    inject(scenario) {
        const products = [...scenario.products];

        // Target random item to make "Viral"
        const target = products[1] || products[0];
        this.targetId = target.id;

        // Add "Popular" badge
        if (!target.badges) target.badges = [];
        target.badges.push('popular');

        // Add fake live view count
        target.viewCount = randomInt(80, 150);
        target.purchasedRecently = randomInt(12, 30);

        // Add a "notification" trigger for the UI
        target.triggerNotification = true; // "Someone just bought this!"

        return {
            ...scenario,
            products: products
        };
    }

    getExplanation() {
        return {
            title: 'Social Proof',
            description: `We highlighted the target option as "Most Popular" and showed (fake) real-time viewing stats. When we are uncertain, we look to others for cues on how to behave. By suggesting that "everyone else matches this pattern," we bypassed your critical evaluation and tapped into herd mentality.`
        };
    }
}
