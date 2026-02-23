/**
 * js/quantum/QuantumGate.js
 * Instance of a gate that has been dropped onto the circuit grid.
 * Stores spatial location (qubit target, step time) and logic type.
 */

class QuantumGate {
    /**
     * @param {string} type Gate identity (e.g. 'H', 'X', 'CNOT')
     * @param {number} target Wire index the gate acts upon
     * @param {number} step Timeline column index
     */
    constructor(type, target, step) {
        this.id = window.MathUtils.generateUUID();
        this.type = type;
        this.target = target;
        this.step = step;

        // For controlled gates (like CNOT), stores the control wire index.
        // null if it's a single qubit gate.
        this.control = null;

        // Ensure gate meta exists
        let meta = window.GateLibrary.getAvailableGates().find(g => g.id === type);
        if (!meta) {
            throw new Error(`Invalid QuantumGate type instantiated: ${type}`);
        }
        this.isControlMode = (meta.type === 'control');
        this.isMeasure = (meta.type === 'measure');
    }

    /**
     * Sets the control wire for conditional gates
     * @param {number} controlWireIndex 
     */
    setControl(controlWireIndex) {
        if (!this.isControlMode) {
            console.warn(`Attempted to set control on non-controlled gate ${this.type}`);
            return;
        }
        if (controlWireIndex === this.target) {
            throw new Error("Control wire cannot be the same as target wire.");
        }
        this.control = controlWireIndex;
    }

    /**
     * Transforms this specific gate instance into its full system global operation matrix (2^N x 2^N).
     * @param {number} numQubits System N
     * @returns {Matrix}
     */
    getSystemMatrix(numQubits) {
        if (this.isMeasure) {
            throw new Error("Cannot get system matrix of a Measurement operator (non-unitary).");
        }

        if (this.isControlMode) {
            // CNOT or CZ
            let opMatrix;
            if (this.type === 'CNOT') {
                opMatrix = window.GateLibrary.getMatrix('X');
            } else if (this.type === 'CZ') {
                opMatrix = window.GateLibrary.getMatrix('Z');
            } else {
                throw new Error(`Unhandled controlled gate logic: ${this.type}`);
            }

            if (this.control === null) {
                // Return Identity if control wasn't wired up graphically yet, meaning it acts as a No-Op.
                return window.Matrix.identity(Math.pow(2, numQubits));
            }

            return window.TensorMath.expandControlledGate(opMatrix, numQubits, this.control, this.target);
        } else {
            // Single Qubit Gate
            let singleMatrix = window.GateLibrary.getMatrix(this.type);
            return window.TensorMath.expandSingleGate(singleMatrix, numQubits, this.target);
        }
    }

    /**
     * Returns true if gate requires a control node but it hasn't been mapped.
     * @returns {boolean}
     */
    isMissingControl() {
        return this.isControlMode && this.control === null;
    }
}

window.QuantumGate = QuantumGate;
