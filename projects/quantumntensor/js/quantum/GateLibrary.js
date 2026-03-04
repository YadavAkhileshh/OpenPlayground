/**
 * js/quantum/GateLibrary.js
 * Pre-defined mathematical definitions of common quantum gates.
 * Represents simply the 2x2 matrices of single qubit operations.
 */

class GateLibrary {

    /**
     * Retrieves the 2x2 Unitary matrix for a given gate name.
     * @param {string} type 
     * @returns {Matrix}
     */
    static getMatrix(type) {
        switch (type.toUpperCase()) {
            case 'H': return GateLibrary.H();
            case 'X': return GateLibrary.X();
            case 'Y': return GateLibrary.Y();
            case 'Z': return GateLibrary.Z();
            case 'I': return window.Matrix.identity(2);
            default:
                throw new Error(`Unknown gate type requested: ${type}`);
        }
    }

    /**
     * Hadamard Gate: Creates equal superposition.
     * 1/sqrt(2) * [1  1]
     *             [1 -1]
     * @returns {Matrix}
     */
    static H() {
        const inv2 = window.MathConstants.INV_ROOT_2;
        return new window.Matrix(2, 2, [
            [window.Complex.create(inv2), window.Complex.create(inv2)],
            [window.Complex.create(inv2), window.Complex.create(-inv2)]
        ]);
    }

    /**
     * Pauli-X Gate: Quantum NOT gate. Swaps |0> and |1>.
     * [0 1]
     * [1 0]
     * @returns {Matrix}
     */
    static X() {
        return new window.Matrix(2, 2, [
            [window.Complex.ZERO, window.Complex.ONE],
            [window.Complex.ONE, window.Complex.ZERO]
        ]);
    }

    /**
     * Pauli-Y Gate: Rotation around Y axis.
     * [0 -i]
     * [i  0]
     * @returns {Matrix}
     */
    static Y() {
        return new window.Matrix(2, 2, [
            [window.Complex.ZERO, window.Complex.create(0, -1)],
            [window.Complex.create(0, 1), window.Complex.ZERO]
        ]);
    }

    /**
     * Pauli-Z Gate: Phase flip gate. Flips sign of |1>.
     * [1  0]
     * [0 -1]
     * @returns {Matrix}
     */
    static Z() {
        return new window.Matrix(2, 2, [
            [window.Complex.ONE, window.Complex.ZERO],
            [window.Complex.ZERO, window.Complex.create(-1, 0)]
        ]);
    }

    /**
     * S Gate: PI/2 phase shift.
     * [1 0]
     * [0 i]
     * @returns {Matrix}
     */
    static S() {
        return new window.Matrix(2, 2, [
            [window.Complex.ONE, window.Complex.ZERO],
            [window.Complex.ZERO, window.Complex.I.clone()]
        ]);
    }

    /**
     * Returns meta-data about all available gates for UI rendering.
     * @returns {Object[]}
     */
    static getAvailableGates() {
        return [
            { id: 'H', name: 'Hadamard', symbol: 'H', type: 'single', color: '#ff0055', description: 'Creates equal superposition' },
            { id: 'X', name: 'Pauli-X', symbol: 'X', type: 'single', color: '#00ddff', description: 'Quantum NOT gate (Bit Flip)' },
            { id: 'Y', name: 'Pauli-Y', symbol: 'Y', type: 'single', color: '#00ddff', description: 'Bit and Phase flip' },
            { id: 'Z', name: 'Pauli-Z', symbol: 'Z', type: 'single', color: '#00ddff', description: 'Phase flip (π rotation)' },
            { id: 'S', name: 'Phase (S)', symbol: 'S', type: 'single', color: '#ffaa00', description: 'π/2 Phase rotation' },
            { id: 'CNOT', name: 'Controlled-NOT', symbol: '⊕', type: 'control', color: '#00ff88', description: 'Flips target if control is |1⟩' },
            { id: 'CZ', name: 'Controlled-Z', symbol: '•', type: 'control', color: '#00ff88', description: 'Phase flip target if control is |1⟩' },
            { id: 'M', name: 'Measurement', symbol: 'M', type: 'measure', color: '#ffffff', description: 'Collapses wavefunction to classical bit' }
        ];
    }
}

window.GateLibrary = GateLibrary;
