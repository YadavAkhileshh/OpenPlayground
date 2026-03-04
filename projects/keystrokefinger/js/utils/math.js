/**
 * KeystrokeFingerprint - Math Utilities
 * Provides statistical functions for biometric analysis.
 */

export class MathUtils {
    /**
     * Calculates the mean average of an array of numbers.
     * @param {number[]} data - Array of numbers
     * @returns {number} The mean
     */
    static mean(data) {
        if (!data || data.length === 0) return 0;
        const sum = data.reduce((a, b) => a + b, 0);
        return sum / data.length;
    }

    /**
     * Calculates the standard deviation of an array.
     * @param {number[]} data - Array of numbers
     * @returns {number} Standard deviation
     */
    static stdDev(data) {
        if (!data || data.length < 2) return 0;
        const m = this.mean(data);
        const squareDiffs = data.map(value => {
            const diff = value - m;
            return diff * diff;
        });
        const avgSquareDiff = this.mean(squareDiffs);
        return Math.sqrt(avgSquareDiff);
    }

    /**
     * Calculates the Euclidean distance (L2 norm) between two vectors.
     * Vectors must be of the same length.
     * @param {number[]} v1 - First vector
     * @param {number[]} v2 - Second vector
     * @returns {number} Euclidean distance
     */
    static euclideanDistance(v1, v2) {
        if (v1.length !== v2.length) {
            console.warn("Vector length mismatch in euclideanDistance");
            return Infinity;
        }

        let sum = 0;
        for (let i = 0; i < v1.length; i++) {
            const diff = v1[i] - v2[i];
            sum += diff * diff;
        }
        return Math.sqrt(sum);
    }

    /**
     * Calculates the Manhattan distance (L1 norm) between two vectors.
     * Often less sensitive to outliers than L2.
     * @param {number[]} v1 
     * @param {number[]} v2 
     * @returns {number} Manhattan distance
     */
    static manhattanDistance(v1, v2) {
        if (v1.length !== v2.length) {
            console.warn("Vector length mismatch in manhattanDistance");
            return Infinity;
        }

        let sum = 0;
        for (let i = 0; i < v1.length; i++) {
            sum += Math.abs(v1[i] - v2[i]);
        }
        return sum;
    }

    /**
     * Calculates the cosine similarity between two vectors.
     * Returns a value between -1 and 1. Near 1 means very similar direction.
     * @param {number[]} v1 
     * @param {number[]} v2 
     * @returns {number} Similarity score
     */
    static cosineSimilarity(v1, v2) {
        if (v1.length !== v2.length) return 0;

        let dotProduct = 0;
        let mag1 = 0;
        let mag2 = 0;

        for (let i = 0; i < v1.length; i++) {
            dotProduct += v1[i] * v2[i];
            mag1 += v1[i] * v1[i];
            mag2 += v2[i] * v2[i];
        }

        mag1 = Math.sqrt(mag1);
        mag2 = Math.sqrt(mag2);

        if (mag1 === 0 || mag2 === 0) return 0;

        return dotProduct / (mag1 * mag2);
    }

    /**
     * Normalizes a vector to have a mean of 0 and stdDev of 1 (Z-score normalization).
     * Useful for comparing profiles with different raw speeds but similar rhythms.
     * @param {number[]} vector 
     * @returns {number[]} Normalized vector
     */
    static normalize(vector) {
        const m = this.mean(vector);
        const s = this.stdDev(vector);
        if (s === 0) return vector.map(() => 0);
        return vector.map(x => (x - m) / s);
    }
}
