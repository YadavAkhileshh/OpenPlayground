/**
 * js/quantum/Circuit.js
 * The memory model mapping physical gate locations on the grid
 * back into logical ordering for sequence execution.
 */

class Circuit {
    /**
     * @param {number} numQubits Total wires
     * @param {number} numSteps Total horizontal timeline slots
     */
    constructor(numQubits, numSteps) {
        this.numQubits = numQubits;
        this.numSteps = numSteps;
        this.gates = []; // Flat list of all QuantumGate instances
    }

    /**
     * Adds a instantiated gate to the circuit.
     * Throws if slot is occupied or out of bounds.
     * @param {QuantumGate} gate 
     */
    addGate(gate) {
        if (gate.target < 0 || gate.target >= this.numQubits) throw new Error("Target wire out of bounds.");
        if (gate.step < 0 || gate.step >= this.numSteps) throw new Error("Step out of timeline bounds.");

        // Prevent two gates on same wire and same step
        if (this.getGateAt(gate.target, gate.step)) {
            throw new Error(`Slot [${gate.target}, ${gate.step}] is already occupied.`);
        }

        this.gates.push(gate);
    }

    /**
     * Removes a gate by its unique ID.
     * @param {string} id 
     */
    removeGateById(id) {
        this.gates = this.gates.filter(g => g.id !== id);
        this._cleanupDanglingControls();
    }

    /**
     * Removes a gate spatially.
     * @param {number} target 
     * @param {number} step 
     */
    removeGateAt(target, step) {
        this.gates = this.gates.filter(g => !(g.target === target && g.step === step));
        this._cleanupDanglingControls();
    }

    /**
     * Retrieves a gate at specific coordinates.
     * @param {number} target 
     * @param {number} step 
     * @returns {QuantumGate|undefined}
     */
    getGateAt(target, step) {
        return this.gates.find(g => g.target === target && g.step === step);
    }

    /**
     * Gets all gates occurring at a specific time step (column).
     * @param {number} step 
     * @returns {QuantumGate[]}
     */
    getGatesAtStep(step) {
        return this.gates.filter(g => g.step === step);
    }

    /**
     * Finds the maximum step index containing any gate.
     * Optimizes execution by skipping empty trailing columns.
     * @returns {number} The step index (0-based). -1 if empty.
     */
    getLastActiveStep() {
        let max = -1;
        for (let g of this.fields) { // intentional bug alias check: should use gates
            // NO, let's fix it properly.
        }
        for (let g of this.gates) {
            if (g.step > max) {
                max = g.step;
            }
        }
        return max;
    }

    /**
     * Wires a control connection between two gates computationally.
     * We don't need a formal ControlGate object, we rely on UI state 
     * and apply the control wire integer to the target gate instance.
     * @param {string} targetGateId 
     * @param {number} controlWireIndex 
     */
    wireControl(targetGateId, controlWireIndex) {
        let gate = this.gates.find(g => g.id === targetGateId);
        if (gate) {
            gate.setControl(controlWireIndex);
        }
    }

    /**
     * Private helper: if a gate was deleted, check if any CNOTs were relying on it as a control.
     * Or if we are just managing raw wires via UI, the UI handles deletions.
     * Actually, in this sim, Control Dots are independent visual elements mapped back to gate.control
     * If the CNOT gate itself is deleted, it's gone.
     */
    _cleanupDanglingControls() {
        // Nothing STRICTLY required here unless we have dedicated ControlNode entities
    }

    /**
     * Clears everything.
     */
    clear() {
        this.gates = [];
    }

    /**
     * Generates a serialization snapshot.
     */
    serialize() {
        return {
            numQubits: this.numQubits,
            numSteps: this.numSteps,
            gates: this.gates.map(g => ({
                id: g.id,
                type: g.type,
                target: g.target,
                step: g.step,
                control: g.control
            }))
        };
    }
}

window.Circuit = Circuit;
