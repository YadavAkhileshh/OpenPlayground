// NematodeSim — Muscle Segment
// Represents a single neurally-driven muscle unit along the body.
// Each segment pairs with one body node and drives lateral bending
// by modifying its associated distance constraints (dorsal/ventral sides).

export class MuscleSegment {
    /**
     * @param {number} index            Segment index in body (0 = head)
     * @param {number} baseRestLength   Baseline rest length for this segment's constraint
     */
    constructor(index, baseRestLength) {
        this.index = index;
        this.baseRestLength = baseRestLength;
        this.activation = 0;   // Current activation [-1, 1]
        this.maxStrain = 0.22; // Maximum strain as fraction of rest length
        // Dorsal / ventral constraint references (set by BodyFactory)
        this.dorsalConstraint = null;
        this.ventralConstraint = null;
        // Smoothed activation for rendering
        this._smoothed = 0;
    }

    /**
     * Apply CPG signal to muscle activation with optional low-pass filtering.
     * @param {number} signal  Raw CPG signal ∈ [-1, 1]
     * @param {number} tau     Time constant for smoothing (frames)
     */
    activate(signal, tau = 3) {
        this._smoothed = this._smoothed + (signal - this._smoothed) / tau;
        this.activation = this._smoothed;
    }

    /**
     * Apply the current activation to body distance constraints.
     * Positive activation → dorsal shortening + ventral lengthening (bend right).
     * Negative activation → the reverse (bend left).
     * @param {number} baseLen  Rest length of the segment
     */
    applyToConstraints(baseLen) {
        if (this.dorsalConstraint == null && this.ventralConstraint == null) return;
        const delta = this.activation * this.maxStrain * baseLen;
        if (this.dorsalConstraint) this.dorsalConstraint.restLength = baseLen - delta;
        if (this.ventralConstraint) this.ventralConstraint.restLength = baseLen + delta;
    }

    /**
     * Compute signed contraction force magnitude for this segment.
     * @param {number} amplitude  Wave amplitude (from WavePattern)
     * @param {number} envelope   Tapering factor [0, 1]
     * @returns {number}
     */
    forceContribution(amplitude, envelope) {
        return this.activation * amplitude * envelope;
    }

    /** Reset activation to zero. */
    reset() {
        this.activation = 0;
        this._smoothed = 0;
        if (this.dorsalConstraint) this.dorsalConstraint.restLength = this.baseRestLength;
        if (this.ventralConstraint) this.ventralConstraint.restLength = this.baseRestLength;
    }
}

export default MuscleSegment;
