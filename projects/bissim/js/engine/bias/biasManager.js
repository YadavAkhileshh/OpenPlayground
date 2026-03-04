/**
 * @fileoverview Orchestrator for bias injection.
 * Selects and applies a specific bias strategy to the product list.
 */

import { ScarcityBias } from './scarcity.js';
import { SocialProofBias } from './socialProof.js';
import { DecoyBias } from './decoy.js';
import { randomChoice } from '../../utils/math.js';
import { logger } from '../tracking/interactLog.js';

/**
 * Interface that all Bias strategies must implement.
 * @interface BiasStrategy
 */
/*
class BiasStrategy {
    inject(scenario) { throw new Error('Not implemented'); }
    getExplanation() { throw new Error('Not implemented'); }
}
*/

export class BiasManager {
    constructor() {
        this.strategies = {
            'scarcity': new ScarcityBias(),
            'social_proof': new SocialProofBias(),
            'decoy': new DecoyBias()
        };
        this.activeStrategy = null;
        this.activeBiasType = null;
    }

    /**
     * Randomly selects a bias strategy and applies it to the given scenario.
     * @param {Object} scenario - The product scenario
     * @returns {Object} The modified scenario with biased products
     */
    applyRandomBias(scenario) {
        // Pick a random strategy key
        const keys = Object.keys(this.strategies);
        this.activeBiasType = randomChoice(keys);
        this.activeStrategy = this.strategies[this.activeBiasType];

        console.log(`[BiasEngine] Applying ${this.activeBiasType} to ${scenario.id}`);

        // Log the active bias for the session
        logger.logEvent('bias_injection', { type: this.activeBiasType });

        // Delegate to the strategy
        return this.activeStrategy.inject(scenario);
    }

    /**
     * Gets the explanation for the currently active bias.
     * @returns {Object} Title and description of the bias
     */
    getExplanation() {
        if (!this.activeStrategy) return null;
        return this.activeStrategy.getExplanation();
    }

    /**
     * Returns the ID of the product that was boosted/favored by the bias.
     * @returns {string} Product ID
     */
    getTargetId() {
        return this.activeStrategy ? this.activeStrategy.targetId : null;
    }
}

export const biasManager = new BiasManager();
