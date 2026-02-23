/**
 * js/math/Vector.js
 * A 1-Dimensional sequence of Complex numbers representing quantum state coefficients.
 * e.g. An N-Qubit system requires a Vector of 2^N elements.
 */

class Vector {
    /**
     * @param {Complex[]} elements 
     */
    constructor(elements) {
        this.elements = elements || [];
    }

    /**
     * Create a Vector filled with zero states.
     * @param {number} size 
     * @returns {Vector}
     */
    static createEmpty(size) {
        let elems = [];
        for (let i = 0; i < size; i++) {
            elems.push(window.Complex.ZERO.clone());
        }
        return new Vector(elems);
    }

    /**
     * Number of states in the vector.
     * @returns {number}
     */
    size() {
        return this.elements.length;
    }

    /**
     * Equivalent to extracting a probability amplitude.
     * @param {number} index 
     * @returns {Complex}
     */
    get(index) {
        return this.elements[index];
    }

    /**
     * Mutate the state amplitude.
     * @param {number} index 
     * @param {Complex} val 
     */
    set(index, val) {
        this.elements[index] = val;
    }

    /**
     * Deep copy of the state vector.
     * @returns {Vector}
     */
    clone() {
        return new Vector(this.elements.map(c => c.clone()));
    }

    /**
     * Calculates the sum of squared magnitudes of all amplitudes.
     * In a valid quantum system, this must always be 1.0 (Unitary constraint).
     * @returns {number}
     */
    totalProbability() {
        let sum = 0;
        for (let i = 0; i < this.size(); i++) {
            sum += this.elements[i].magSquared();
        }
        return sum;
    }

    /**
     * Cleans up floating point errors across the vector to ensure it remains a valid state.
     * Will re-normalize the probabilities if they drifted.
     * @returns {Vector} this instance mutated
     */
    normalize() {
        let totalProb = this.totalProbability();

        // Prevent div by zero if state is completely broken
        if (totalProb === 0) {
            console.warn("Vector normalization failed: Zero total probability.");
            return this;
        }

        // Only normalize if drifting significantly
        if (Math.abs(totalProb - 1.0) > window.MathConstants.TOLERANCE) {
            let scaleFactor = 1.0 / Math.sqrt(totalProb);
            for (let i = 0; i < this.size(); i++) {
                this.elements[i] = this.elements[i].scale(scaleFactor).clean();
            }
        } else {
            // Even if normalized length is basically 1, still clean the floats
            for (let i = 0; i < this.size(); i++) {
                this.elements[i].clean();
            }
        }

        return this;
    }

    /**
     * Convert this state vector to an array of probabilities (real numbers 0.0 to 1.0)
     * Useful for bar-chart UI rendering.
     * @returns {number[]} Array of real probabilities
     */
    toProbabilities() {
        let probs = new Float32Array(this.size());
        for (let i = 0; i < this.size(); i++) {
            probs[i] = this.elements[i].magSquared();
        }
        return Array.from(probs);
    }

    /**
     * Debug print out to terminal / console
     */
    print() {
        let out = "[ ";
        for (let i = 0; i < this.size(); i++) {
            out += this.elements[i].toString() + (i < this.size() - 1 ? " ,  " : " ");
        }
        out += "]";
        console.log(out);
    }
}

window.Vector = Vector;
