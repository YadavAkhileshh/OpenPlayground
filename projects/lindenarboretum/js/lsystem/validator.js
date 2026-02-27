/**
 * LindenArboretum - Validator Module
 * Validates inputs from the user interface to ensure the L-System
 * engine doesn't crash on bad data or infinite loops.
 */

export const lsystemValidator = {
    // Valid characters for Turtle graphics commands
    // F: draw forward
    // f: move forward (no line)
    // +: turn right
    // -: turn left
    // [: push state
    // ]: pop state
    // X, Y, Z, etc.: variables
    VALID_CHARS_REGEX: /^[A-Za-z\+\-\[\]]+$/,

    /**
     * Checks if a single character is a valid predecessor.
     * @param {string} pred 
     */
    isValidPredecessor(pred) {
        return pred.length === 1 && /[A-Za-z]/.test(pred);
    },

    /**
     * Checks if a successor string contains only valid characters.
     * @param {string} succ 
     */
    isValidSuccessor(succ) {
        if (succ.length === 0) return false;
        return this.VALID_CHARS_REGEX.test(succ);
    },

    /**
     * Validates the axiom string.
     * @param {string} axiom 
     */
    isValidAxiom(axiom) {
        if (!axiom || axiom.length === 0) return false;
        return this.VALID_CHARS_REGEX.test(axiom);
    },

    /**
     * Checks if a user's requested depth is potentially dangerous.
     * O(branchFactor^depth) can kill the main thread.
     * @param {number} depth 
     */
    isSafeDepth(depth, rules) {
        // Very rough heuristic
        let maxSuccLength = 0;
        for (let r of rules) {
            maxSuccLength = Math.max(maxSuccLength, r.successors[0].length);
        }

        let estimatedOps = Math.pow(maxSuccLength, depth);
        // Ex: 5^10 = 9M. We cap around 50M safely in JS usually without extreme lag.
        return estimatedOps < 10000000;
    }
};
