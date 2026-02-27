/**
 * js/quantum/TimelineVector.js
 * A container mapped to horizontal columns in the circuit grid.
 * Caches the QuantumState output at the END of this step.
 * Allows instant UI playback scrubbing without recalculating matrices.
 */

class TimelineVector {
    /**
     * @param {number} stepIndex Column index (0-based)
     * @param {QuantumState} incomingState The state entering this step
     * @param {Matrix|null} globalOp The 2^N x 2^N matrix applied at this step (or null if Identity)
     */
    constructor(stepIndex, incomingState, globalOp) {
        this.stepIndex = stepIndex;
        // The resulting state vector after execution
        this.resultState = incomingState.clone();

        // If there were active gates in this step, apply them.
        if (globalOp) {
            this.resultState.applyTransformation(globalOp);
        }

        // Caching for probability charts
        this.cachedProbabilities = this.resultState.getProbabilities();

        // Flag to indicate if a Measurement gate occurred here
        this.measuredValue = null;
    }

    /**
     * If a measurement is requested here, force collapse the cached state.
     */
    applyMeasurementCollapse() {
        this.measuredValue = window.Measurement.measureSystem(this.resultState);
        this.cachedProbabilities = this.resultState.getProbabilities();
    }

    /**
     * Returns the finalized QuantumState instance for UI rendering.
     * @returns {QuantumState}
     */
    getState() {
        return this.resultState;
    }
}

window.TimelineVector = TimelineVector;
