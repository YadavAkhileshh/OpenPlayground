/**
 * js/math/Kronecker.js
 * The core performance bottleneck of any simulation-based quantum computer.
 * Computes the Kronecker Product (Tensor Product) of two or more matrices.
 * Essential for expanding single-qubit gates (2x2) into N-qubit system gateways (2^N x 2^N).
 */

class Kronecker {
    /**
     * Calculates the Kronecker Product A ⊗ B.
     * Example: A(2x2) ⊗ B(2x2) = Result(4x4)
     * Time Complexity: O((R_A * C_A) * (R_B * C_B))
     * Result Size: (R_A * R_B) x (C_A * C_B)
     * @param {Matrix} A First Matrix
     * @param {Matrix} B Second Matrix
     * @returns {Matrix} The Tensor product result
     */
    static product(A, B) {
        let rA = A.rows;
        let cA = A.cols;
        let rB = B.rows;
        let cB = B.cols;

        let result = new window.Matrix(rA * rB, cA * cB);

        for (let i = 0; i < rA; i++) {
            for (let j = 0; j < cA; j++) {
                // Determine the block offset in the result matrix
                let offsetR = i * rB;
                let offsetC = j * cB;

                // Scale matrix B by the scalar A.get(i, j)
                let scalar = A.get(i, j);

                for (let x = 0; x < rB; x++) {
                    for (let y = 0; y < cB; y++) {
                        let bVal = B.get(x, y);
                        let productVal = scalar.mul(bVal).clean();
                        result.set(offsetR + x, offsetC + y, productVal);
                    }
                }
            }
        }

        return result;
    }

    /**
     * Efficiently calculates the tensor product of an arbitrary length array of matrices.
     * Evaluates strictly sequentially left to right.
     * @param {Matrix[]} matrices Array of matrices [M1, M2, M3...] to product M1 ⊗ M2 ⊗ M3
     * @returns {Matrix} The combined giant operator matrix
     */
    static multiProduct(matrices) {
        if (!matrices || matrices.length === 0) {
            throw new Error("Kronecker multiProduct requires at least one matrix");
        }

        if (matrices.length === 1) {
            return matrices[0]; // Base case, no product needed
        }

        if (matrices.length > window.MathConstants.MAX_QUBITS) {
            console.warn(`WARNING: Attempting to tensor product ${matrices.length} matrices. This might freeze the UI thread.`);
        }

        // Reduced left to right A ⊗ B ⊗ C => (A ⊗ B) ⊗ C
        let result = matrices[0];

        for (let i = 1; i < matrices.length; i++) {
            result = Kronecker.product(result, matrices[i]);
        }

        return result;
    }

    /**
     * Special optimization: When tensoring a Vector A ⊗ Vector B, 
     * instead of treating them as Nd array Matrices, calculate directly as 1D arrays
     * to skip Object instantiation overhead.
     * @param {Vector} vecA 
     * @param {Vector} vecB 
     * @returns {Vector} Tensored Vector
     */
    static vectorProduct(vecA, vecB) {
        let sizeA = vecA.size();
        let sizeB = vecB.size();
        let resultSize = sizeA * sizeB;

        // Use createEmpty instead of Array constructor to ensure nullity protection
        let result = Vector.createEmpty(resultSize);

        for (let i = 0; i < sizeA; i++) {
            let offset = i * sizeB;
            let aVal = vecA.get(i);

            for (let j = 0; j < sizeB; j++) {
                let p = aVal.mul(vecB.get(j)).clean();
                result.set(offset + j, p);
            }
        }

        return result;
    }
}

window.Kronecker = Kronecker;
