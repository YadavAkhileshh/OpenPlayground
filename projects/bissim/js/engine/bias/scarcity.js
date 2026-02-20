/**
 * @fileoverview Implementation of Scarcity Bias.
 * Creates artificial urgency by showing low stock counts on the target item.
 */

export class ScarcityBias {
    constructor() {
        this.targetId = null;
    }

    /**
     * Adds scarcity indicators to a target product.
     * @param {Object} scenario 
     * @returns {Object} Modified scenario
     */
    inject(scenario) {
        const products = [...scenario.products];

        // Pick the most expensive or middle option as target to drive upsell
        // Let's pick the one with highest margin (in our fake world, the 2nd one usually)
        const target = products[1] || products[0];
        this.targetId = target.id;

        // Add metadata for the renderer to pick up
        target.badges = ['scarcity']; // Triggers "Only 2 Left!" badge
        target.subtitle = 'High Demand - Selling Fast';
        target.stockLeft = 2; // Explicit low number

        return {
            ...scenario,
            products: products
        };
    }

    getExplanation() {
        return {
            title: 'Scarcity Bias',
            description: `We artificially flagged the target item as "Limited Stock" (Only 2 left!). This triggers your Fear Of Missing Out (FOMO). When an opportunity becomes less available, we lose our freedom to choose, and we react by desiring the object significantly more than its actual value warrants.`
        };
    }
}
