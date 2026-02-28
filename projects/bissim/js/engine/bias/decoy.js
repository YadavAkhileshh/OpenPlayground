/**
 * @fileoverview Implementation of the Decoy Effect (Asymmetric Dominance).
 * Introduces an inferior option similar to the target to make the target look better.
 */

import { randomChoice } from '../../utils/math.js';

export class DecoyBias {
    constructor() {
        this.targetId = null;
    }

    /**
     * Injects a decoy product into the scenario.
     * @param {Object} scenario 
     * @returns {Object} Modified scenario
     */
    inject(scenario) {
        // 1. Identify a "Target" product (usually the middle/premium one)
        // For simplicity, we'll pick the one with the highest price that isn't the absolute max, 
        // or just the 2nd item if available.
        const products = [...scenario.products]; // Clone

        // Strategy: Pick the 2nd item as target (usually the intended 'good' choice in our data)
        const target = products[1] || products[0];
        this.targetId = target.id;

        // 2. Create the Decoy
        // The decoy should be:
        // - Similar price to Target (maybe slightly higher or same)
        // - Significantly worse features
        const decoy = {
            id: 'decoy_' + target.id,
            name: target.name + ' (Legacy)', // Make it sound older or less efficient
            price: target.price, // Same price
            rating: target.rating - 1.5, // Worse rating
            image: target.image, // Same icon
            features: target.features.slice(0, -1), // Remove best feature
            isDecoy: true
        };

        // Make the decoy explicitly worse in one dimension
        decoy.features.push('Refurbished');

        // 3. Insert Decoy next to target
        products.splice(1, 0, decoy);

        return {
            ...scenario,
            products: products
        };
    }

    getExplanation() {
        return {
            title: 'The Decoy Effect',
            description: `We introduced a "Decoy" option (${this.targetId}'s inferior twin) that was priced similarly but offered less value. This "asymmetrically dominated" option exists purely to make the target product look like a steal in comparison. Your brain simplifies the complex decision by comparing the target to the decoy, ignoring the other options.`
        };
    }
}
