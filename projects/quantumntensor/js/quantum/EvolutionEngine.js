/**
 * js/quantum/EvolutionEngine.js
 * The core simulation runner. Reads the Circuit, calculates Tensor expansions,
 * steps through time, and generates an array of TimelineVectors.
 */

class EvolutionEngine {
    constructor() {
        // Cache variables to prevent GC jitter during playback
        this.timelineCache = [];
        this.cachedInitialState = null;
    }

    /**
     * Simulates the entire circuit from Time 0 to MaxStep.
     * @param {Circuit} circuit 
     * @returns {TimelineVector[]} Array of completed steps 
     */
    compileAndRun(circuit) {
        if (!circuit) return [];

        let numQubits = circuit.numQubits;
        let lastStep = circuit.getLastActiveStep();
        let N = Math.pow(2, numQubits);

        this.timelineCache = [];

        let currentState = new window.QuantumState(numQubits);

        if (window.AppLogger) {
            window.AppLogger.log("--- Evolution Compiler Initiated ---");
            window.AppLogger.log(`System initialized at |${window.MathUtils.toBinaryString(0, numQubits)}⟩`);
        }

        for (let step = 0; step <= lastStep; step++) {
            let gatesThisStep = circuit.getGatesAtStep(step);

            if (gatesThisStep.length === 0) {
                // Identity Step (pass through)
                let tlv = new window.TimelineVector(step, currentState, null);
                this.timelineCache.push(tlv);
                currentState = tlv.getState();
                continue;
            }

            // Check if there's a measurement gate
            // We apply measurement sequentially AT THE END of the step's unitaries
            let hasMeasurement = gatesThisStep.some(g => g.isMeasure);
            let unitaries = gatesThisStep.filter(g => !g.isMeasure);

            // 1. Calculate the Step's Global 2^N Matrix by multiplying independent gate matrices together.
            // When multiple gates are on parallel wires in the SAME step,
            // they can be Tensor Product-ed together.
            // HOWEVER! The TensorMath.expandSingleGate already creates 2^N Identity-padded matrices.
            // If we have two disjoint 2^N matrices expanded from different gates on the same step,
            // we can simulate parallel execution by matrix-multiplying them together (A * B).
            // Order doesn't technically matter for genuinely disjoint wires.

            let stepGlobalMatrix = window.Matrix.identity(N);

            for (let uGate of unitaries) {
                if (uGate.isMissingControl()) {
                    window.AppLogger && window.AppLogger.warn(`Step ${step}: CNOT target on Q${uGate.target} missing control wire. Acting as Identity.`);
                    continue; // Treat as I
                }

                let expandedOp = uGate.getSystemMatrix(numQubits);

                // Matrix multiply into the global step accumulator
                stepGlobalMatrix = stepGlobalMatrix.mul(expandedOp);

                if (window.AppLogger) {
                    window.AppLogger.log(`Step ${step}: Applied ${uGate.type} matrix projection. -> Q${uGate.target}`);
                }
            }

            // 2. Evolve the State
            let tlv = new window.TimelineVector(step, currentState, stepGlobalMatrix);

            // 3. Apply Measurement if present
            if (hasMeasurement) {
                tlv.applyMeasurementCollapse();
            }

            // 4. Force Normalizer validation
            window.StateNormalizer.enforce(tlv.getState());

            this.timelineCache.push(tlv);
            currentState = tlv.getState();

            if (hasMeasurement) {
                // Once measured, subsequent unitary logic in the circuit might be nonsensical 
                // but we let it run on the collapsed state.
                break; // Actually, visual simulation usually stops at measurement.
            }
        }

        if (window.AppLogger) {
            window.AppLogger.log(`--- Compilation Complete. Path Length: ${this.timelineCache.length} ---`);
        }

        return this.timelineCache;
    }
}

window.EvolutionEngine = EvolutionEngine;
