/**
 * LindenArboretum - Rule Module
 * Represents a single production rule in an L-System.
 * E.g., F -> FF+[+F-F-F]-[-F+F+F]
 */

export class Rule {
    /**
     * @param {string} predecessor - The character to match (e.g., 'F')
     * @param {string|string[]} successor - The replacement string or array of strings for stochastic
     * @param {number|number[]} probability - Probability weighting (default 1.0)
     */
    constructor(predecessor, successor, probability = 1.0) {
        this.predecessor = predecessor;

        // Handle stochastic rules natively
        if (Array.isArray(successor)) {
            this.successors = successor;
            this.probabilities = Array.isArray(probability) ? probability : [1.0];
            this.isStochastic = true;
        } else {
            this.successors = [successor];
            this.probabilities = [1.0];
            this.isStochastic = false;
        }
    }

    /**
     * Gets the matching successor string. 
     * If deterministic, returns the only successor.
     * If stochastic, uses a random value to pick based on weights.
     * @param {number} randNum - Value between 0 and 1
     * @returns {string}
     */
    getSuccessor(randNum = 0.5) {
        if (!this.isStochastic) {
            return this.successors[0];
        }

        // Stochastic selection logic
        let cumulativeProb = 0;
        for (let i = 0; i < this.successors.length; i++) {
            cumulativeProb += this.probabilities[i];
            if (randNum <= cumulativeProb) {
                return this.successors[i];
            }
        }

        // Fallback to the last one
        return this.successors[this.successors.length - 1];
    }

    /**
     * String representation for debugging.
     */
    toString() {
        if (!this.isStochastic) {
            return `${this.predecessor} -> ${this.successors[0]}`;
        } else {
            return `${this.predecessor} -> [Stochastic Nodes]`;
        }
    }
}
