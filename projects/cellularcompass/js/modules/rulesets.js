/**
 * @file rulesets.js
 * @description A dictionary of Cellular Automata rules and logic for dynamic switching.
 * Biological and experimental rulesets derived from the Life-like family.
 */

/**
 * Rules format: 
 * Birth (B): Neighbors needed for a dead cell to become alive.
 * Survival (S): Neighbors needed for an alive cell to stay alive.
 */
export const RULESETS = {
    CONWAY: {
        id: 'conway',
        name: "Conway's Life",
        description: "The classic biological equilibrium. B3/S23.",
        birth: [3],
        survival: [2, 3]
    },
    HIGHLIFE: {
        id: 'highlife',
        name: "HighLife",
        description: "Produces frequent replicators. B36/S23.",
        birth: [3, 6],
        survival: [2, 3]
    },
    SEEDS: {
        id: 'seeds',
        name: "Seeds",
        description: "Extremely volatile organic growth. B2/S.",
        birth: [2],
        survival: []
    },
    DAY_NIGHT: {
        id: 'daynight',
        name: "Day & Night",
        description: "Symmetric evolution patterns. B3678/S34678.",
        birth: [3, 6, 7, 8],
        survival: [3, 4, 6, 7, 8]
    },
    WALLED_CITIES: {
        id: 'walled',
        name: "Walled Cities",
        description: "Forms geometric structures. B45678/S2345.",
        birth: [4, 5, 6, 7, 8],
        survival: [2, 3, 4, 5]
    },
    AMOEBA: {
        id: 'amoeba',
        name: "Amoeba",
        description: "Organic blob-like movement. B357/S1358.",
        birth: [3, 5, 7],
        survival: [1, 3, 5, 8]
    },
    DIAMOBA: {
        id: 'diamoba',
        name: "Diamoeba",
        description: "Diamond-shaped growth. B35678/S5678.",
        birth: [3, 5, 6, 7, 8],
        survival: [5, 6, 7, 8]
    },
    CORAL: {
        id: 'coral',
        name: "Coral",
        description: "Reef-like growth patterns. B3/S45678.",
        birth: [3],
        survival: [4, 5, 6, 7, 8]
    }
};

/**
 * Rule utility to check if a cell should be alive in the next generation.
 */
export class RuleProcessor {
    constructor(ruleKey = 'CONWAY') {
        this.setRule(ruleKey);
    }

    /**
     * Updates the current active rule.
     */
    setRule(ruleKey) {
        this.currentRule = RULESETS[ruleKey] || RULESETS.CONWAY;
        console.log(`Ruleset: Switched to ${this.currentRule.name}`);
    }

    /**
     * Validates if a cell should be born or survive based on neighbor count.
     * @param {number} neighbors 
     * @param {boolean} isAlive 
     * @returns {boolean}
     */
    evaluate(neighbors, isAlive) {
        if (isAlive) {
            return this.currentRule.survival.includes(neighbors);
        } else {
            return this.currentRule.birth.includes(neighbors);
        }
    }

    /**
     * Returns a list of all available rules for UI population.
     */
    getAvailableRules() {
        return Object.values(RULESETS);
    }
}
