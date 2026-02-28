// NematodeSim — Oscillator Chain
// Connects a series of MuscleSegments into a coordinated chain,
// managed by a single CPG. Each segment receives its phase from
// the PhaseController and generates lateral force for its body node.

import { MuscleSegment } from './MuscleSegment.js';
import Config from '../sim/Config.js';

export class OscillatorChain {
    /**
     * @param {number} segmentCount  Number of muscle segments = body nodes
     * @param {number} restLength    Base rest length for each segment
     */
    constructor(segmentCount = Config.SEGMENT_COUNT, restLength = Config.SEGMENT_LENGTH) {
        this.segments = [];
        for (let i = 0; i < segmentCount; i++) {
            this.segments.push(new MuscleSegment(i, restLength));
        }
        this.restLength = restLength;
    }

    /**
     * Update all segment activations from CPG activation array.
     * @param {Float32Array} activations  Per-segment signal ∈ [-1, 1]
     */
    update(activations) {
        const n = this.segments.length;
        for (let i = 0; i < n; i++) {
            this.segments[i].activate(activations[i] ?? 0, 4);
        }
    }

    /**
     * Apply segment activations to dorsal/ventral distance constraints.
     * Must be called after update() and before constraint solving.
     */
    applyToConstraints() {
        const n = this.segments.length;
        for (let i = 0; i < n; i++) {
            this.segments[i].applyToConstraints(this.restLength);
        }
    }

    /**
     * Get the activation for a specific segment.
     * @param {number} i
     * @returns {number}  ∈ [-1, 1]
     */
    activationAt(i) {
        return this.segments[i]?.activation ?? 0;
    }

    /**
     * Set dorsal/ventral constraint references for a segment.
     * Called by BodyFactory after building the node chain.
     * @param {number} i           Segment index
     * @param {Object} dorsal      DistanceConstraint on dorsal side
     * @param {Object} ventral     DistanceConstraint on ventral side
     */
    setConstraints(i, dorsal, ventral) {
        if (this.segments[i]) {
            this.segments[i].dorsalConstraint = dorsal;
            this.segments[i].ventralConstraint = ventral;
        }
    }

    /**
     * Reset all segments to zero activation.
     */
    reset() {
        this.segments.forEach(s => s.reset());
    }

    /** Number of segments. */
    get length() { return this.segments.length; }
}

export default OscillatorChain;
