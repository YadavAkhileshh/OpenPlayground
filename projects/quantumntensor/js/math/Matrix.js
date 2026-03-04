/**
 * js/math/Matrix.js
 * A 2D array of Complex numbers used for quantum gate operators.
 */

class Matrix {
    /**
     * @param {number} rows 
     * @param {number} cols 
     * @param {Complex[][]} [data=null] Optional 2D array of Complex values
     */
    constructor(rows, cols, data = null) {
        this.rows = rows;
        this.cols = cols;

        if (data) {
            this.matrix = data;
        } else {
            this.matrix = [];
            for (let r = 0; r < rows; r++) {
                let rowData = [];
                for (let c = 0; c < cols; c++) {
                    rowData.push(Complex.ZERO.clone());
                }
                this.matrix.push(rowData);
            }
        }
    }

    /**
     * Retrieves a value in the matrix.
     * @param {number} r Row
     * @param {number} c Col
     * @returns {Complex}
     */
    get(r, c) {
        return this.matrix[r][c];
    }

    /**
     * Sets a value in the matrix.
     * @param {number} r Row
     * @param {number} c Col
     * @param {Complex} val Complex number
     */
    set(r, c, val) {
        this.matrix[r][c] = val;
    }

    /**
     * Matrix multiplication: this * other
     * Time complexity: O(n^3) - Can be slow for large N but vital for execution.
     * @param {Matrix|Vector} other 
     * @returns {Matrix|Vector} Returns Vector if multipling with Vector, Matrix otherwise
     */
    mul(other) {
        // Checking if multiplying matrix by vector
        if (other instanceof window.Vector) {
            if (this.cols !== other.size()) {
                throw new Error(`Matrix/Vector dimension mismatch. Matrix cols (${this.cols}) vs Vector size (${other.size()})`);
            }
            let resultData = [];
            for (let r = 0; r < this.rows; r++) {
                let sum = Complex.ZERO.clone();
                for (let c = 0; c < this.cols; c++) {
                    sum = sum.add(this.get(r, c).mul(other.get(c)));
                }
                resultData.push(sum.clean());
            }
            return new window.Vector(resultData);
        }

        // Matrix by Matrix
        if (this.cols !== other.rows) {
            throw new Error(`Matrix dimensions mismatch. ${this.rows}x${this.cols} * ${other.rows}x${other.cols}`);
        }

        let result = new Matrix(this.rows, other.cols);
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < other.cols; c++) {
                let sum = Complex.ZERO.clone();
                for (let k = 0; k < this.cols; k++) {
                    sum = sum.add(this.get(r, k).mul(other.get(k, c)));
                }
                // Clean close-to-zero floats to prevent exponential noise
                result.set(r, c, sum.clean());
            }
        }
        return result;
    }

    /**
     * Hermitian transpose (Conjugate Transpose)
     * Dagger operation in quantum mechanics (U => U†)
     * @returns {Matrix}
     */
    adjoint() {
        let result = new Matrix(this.cols, this.rows);
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                result.set(c, r, this.get(r, c).conjugate());
            }
        }
        return result;
    }

    /**
     * Standard matrix transpose. Not typical in QM unless matrix is real.
     * @returns {Matrix}
     */
    transpose() {
        let result = new Matrix(this.cols, this.rows);
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                result.set(c, r, this.get(r, c).clone());
            }
        }
        return result;
    }

    /**
     * Scalar multiplication
     * @param {number|Complex} scalar 
     * @returns {Matrix}
     */
    scale(scalar) {
        let result = new Matrix(this.rows, this.cols);
        let complexScalar = typeof scalar === 'number' ? new Complex(scalar, 0) : scalar;

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                result.set(r, c, this.get(r, c).mul(complexScalar).clean());
            }
        }
        return result;
    }

    /**
     * Tests if matrix is unitary ( U * U† = I ).
     * All valid quantum gates must be unitary mapping logic.
     * @returns {boolean}
     */
    isUnitary() {
        const dagger = this.adjoint();
        const product = this.mul(dagger);
        const identity = Matrix.identity(this.rows);

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                let dMag = product.get(r, c).sub(identity.get(r, c)).magnitude();
                if (dMag > window.MathConstants.TOLERANCE) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Creates an Identity matrix of size N x N.
     * Essential for Kronecker products (e.g. Identity ⊗ Gate)
     * @param {number} size 
     * @returns {Matrix}
     */
    static identity(size) {
        let n = size;
        let result = new Matrix(n, n);
        for (let i = 0; i < n; i++) {
            result.set(i, i, Complex.ONE.clone());
        }
        return result;
    }
}

window.Matrix = Matrix;
