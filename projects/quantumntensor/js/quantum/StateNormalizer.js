/**
 * js/quantum/StateNormalizer.js
 * Utility class used post-evolution step to detect and repair 
 * catastrophic floating point deterioration in deeply sequenced circuits.
 */

class StateNormalizer {
    /**
     * Hard-checks the QuantumState probability norm and repairs if slightly off.
     * If completely off (e.g. Infinity/NaN), throws fatal error.
     * @param {QuantumState} qs 
     */
    static enforce(qs) {
        const probs = qs.getProbabilities();
        let total = 0.0;
        let hasNaN = false;

        for (let i = 0; i < probs.length; i++) {
            if (Number.isNaN(probs[i]) || !Number.isFinite(probs[i])) {
                hasNaN = true;
                break;
            }
            total += probs[i];
        }

        if (hasNaN) {
            throw new Error("CRITICAL QUANTUM MATH FAILURE: Vector contains NaN or Infinity. Circuit state destroyed.");
        }

        const delta = Math.abs(total - 1.0);

        if (delta > window.MathConstants.TOLERANCE) {
            if (window.AppLogger) {
                window.AppLogger.warn(`State Normalizer injected correction. Drift ∆ = ${delta.toExponential(4)}`);
            }
            // Trigger the internal vector normalization sequence
            qs.getVector().normalize();
        }
    }
}

window.StateNormalizer = StateNormalizer;
