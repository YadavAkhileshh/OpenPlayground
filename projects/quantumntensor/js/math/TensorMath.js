/**
 * js/math/TensorMath.js
 * High-level orchestration wrapper around Kronecker.js
 * Provides utility methods to expand specific single-qubit gates
 * into their appropriate system-level matrix representation.
 */

class TensorMath {
    /**
     * Expands a 2x2 single qubit gate into an a 2^N x 2^N system operator matrix.
     * Formula: I ⊗ I ⊗ ... ⊗ GATE ⊗ ... ⊗ I
     * @param {Matrix} singleGate The 2x2 matrix to expand
     * @param {number} totalQubits N, total qubits in the system
     * @param {number} targetQubit Which qubit wire the gate is applied to (0 is top wire)
     * @returns {Matrix} The expanded global matrix.
     */
    static expandSingleGate(singleGate, totalQubits, targetQubit) {
        if (totalQubits <= 0) return singleGate;
        if (targetQubit < 0 || targetQubit >= totalQubits) {
            throw new Error(`Invalid targetQubit index ${targetQubit} for ${totalQubits} total qubits`);
        }

        let id = window.Matrix.identity(2);
        let ops = [];

        // Build array of operators to tensor together sequentially
        for (let i = 0; i < totalQubits; i++) {
            if (i === targetQubit) {
                ops.push(singleGate);
            } else {
                ops.push(id);
            }
        }

        // Tensor them I ⊗ Gate ⊗ I
        return window.Kronecker.multiProduct(ops);
    }

    /**
     * Expands a multi-qubit controlled gate (like CNOT, CZ).
     * Controlled gates are decomposed using Projection Operators for the control wire:
     * P0 = |0><0| matrix (leaves state alone if control is 0)
     * P1 = |1><1| matrix (applies gate if control is 1)
     * 
     * Target Qubit receives: Identity (if control is 0) + Gate (if control is 1)
     * 
     * Example CNOT (Control=0, Target=1):
     * CNOT = (P0 ⊗ I) + (P1 ⊗ X)
     * 
     * @param {Matrix} operationGate The 2x2 matrix to apply to the target when control is active (e.g. Pauli X)
     * @param {number} totalQubits 
     * @param {number} controlQubit Wire acting as the conditional flag
     * @param {number} targetQubit Wire receiving the operation
     * @returns {Matrix} The expanded 2^N x 2^N matrix
     */
    static expandControlledGate(operationGate, totalQubits, controlQubit, targetQubit) {
        if (controlQubit === targetQubit) {
            throw new Error("Control and Target qubits cannot be the same wire.");
        }

        // P0 = [1 0]
        //      [0 0]
        const proj0 = new window.Matrix(2, 2, [
            [window.Complex.ONE.clone(), window.Complex.ZERO.clone()],
            [window.Complex.ZERO.clone(), window.Complex.ZERO.clone()]
        ]);

        // P1 = [0 0]
        //      [0 1]
        const proj1 = new window.Matrix(2, 2, [
            [window.Complex.ZERO.clone(), window.Complex.ZERO.clone()],
            [window.Complex.ZERO.clone(), window.Complex.ONE.clone()]
        ]);

        const id = window.Matrix.identity(2);

        // Build the first term list: (P0 ⊗ ... ⊗ I)
        let term0_ops = [];
        // Build the second term list: (P1 ⊗ ... ⊗ Gate)
        let term1_ops = [];

        for (let i = 0; i < totalQubits; i++) {
            if (i === controlQubit) {
                term0_ops.push(proj0);
                term1_ops.push(proj1);
            } else if (i === targetQubit) {
                term0_ops.push(id);
                term1_ops.push(operationGate);
            } else {
                term0_ops.push(id);
                term1_ops.push(id);
            }
        }

        // Tensor the lists
        let tensor0 = window.Kronecker.multiProduct(term0_ops);
        let tensor1 = window.Kronecker.multiProduct(term1_ops);

        // Add them together
        let result = new window.Matrix(tensor0.rows, tensor0.cols);
        for (let r = 0; r < result.rows; r++) {
            for (let c = 0; c < result.cols; c++) {
                let sum = tensor0.get(r, c).add(tensor1.get(r, c));
                result.set(r, c, sum.clean());
            }
        }

        return result;
    }
}

window.TensorMath = TensorMath;
