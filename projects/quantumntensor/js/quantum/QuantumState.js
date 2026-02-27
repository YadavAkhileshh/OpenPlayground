/**
 * js/quantum/QuantumState.js
 * Represents the entire state of an N-qubit quantum system.
 * Main actor in state evolution.
 */

class QuantumState {
    /**
     * @param {number} numQubits Total number of qubits in the system (default 4)
     */
    constructor(numQubits = window.MathConstants.DEFAULT_QUBITS) {
        this.numQubits = numQubits;
        this.size = Math.pow(2, numQubits);

        // The mathematical state vector of 2^N length
        this.vector = window.Vector.createEmpty(this.size);

        this.initializeToGroundState();
    }

    /**
     * Resets the entire system to |00..0>
     */
    initializeToGroundState() {
        // |00...0> basis is always index 0
        for (let i = 0; i < this.size; i++) {
            this.vector.set(i, window.Complex.ZERO.clone());
        }
        this.vector.set(0, window.Complex.ONE.clone());
    }

    /**
     * Applies a Global 2^N x 2^N Transformation Matrix to the State Vector.
     * Matrix * Vector = Vector'
     * @param {Matrix} opMatrix 
     */
    applyTransformation(opMatrix) {
        if (opMatrix.cols !== this.size) {
            throw new Error(`Transformation matrix size (${opMatrix.cols}) does not match system state size (${this.size})`);
        }

        this.vector = opMatrix.mul(this.vector);
        this.vector.normalize();
    }

    /**
     * Replaces the underlying vector entirely.
     * @param {Vector} newVector 
     */
    setState(newVector) {
        if (newVector.size() !== this.size) {
            throw new Error("Cannot set state with mismatched dimensions.");
        }
        this.vector = newVector;
        this.vector.normalize(); // Ensure purity
    }

    /**
     * Retrieves the vector amplitude array.
     * @returns {Vector}
     */
    getVector() {
        return this.vector;
    }

    /**
     * Deep clone of QuantumState.
     * @returns {QuantumState}
     */
    clone() {
        let qs = new QuantumState(this.numQubits);
        qs.setState(this.vector.clone());
        return qs;
    }

    /**
     * Calculates probability array (0-1) for UI Bar charts
     * @returns {number[]}
     */
    getProbabilities() {
        return this.vector.toProbabilities();
    }

    /**
     * Debugging helper to print non-zero basis vectors
     */
    printNonZero() {
        let probSum = this.vector.totalProbability();
        console.log(`--- Quantum State |${this.numQubits} qubits> Total Prob: ${probSum.toFixed(4)} ---`);
        for (let i = 0; i < this.size; i++) {
            let amp = this.vector.get(i);
            let magSq = amp.magSquared();
            if (magSq > window.MathConstants.TOLERANCE) {
                let basis = window.MathUtils.toBinaryString(i, this.numQubits);
                console.log(`|${basis}> : Amplitude: ${amp.toString(4)} | Probability: ${(magSq * 100).toFixed(2)}%`);
            }
        }
    }
}

window.QuantumState = QuantumState;
