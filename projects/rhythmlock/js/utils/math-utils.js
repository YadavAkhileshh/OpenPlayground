/**
 * RhythmLock - Math Utilities
 * ---------------------------
 * Provides statistical functions for biometric analysis.
 */

export const MathUtils = {
    /**
     * Calculates the mean (average) of an array of numbers.
     * @param {number[]} data 
     * @returns {number}
     */
    mean(data) {
        if (!data || data.length === 0) return 0;
        const sum = data.reduce((a, b) => a + b, 0);
        return sum / data.length;
    },

    /**
     * Calculates the standard deviation of an array of numbers.
     * @param {number[]} data 
     * @returns {number}
     */
    stdDev(data) {
        if (!data || data.length === 0) return 0;
        const avg = this.mean(data);
        const squareDiffs = data.map(value => {
            const diff = value - avg;
            return diff * diff;
        });
        const avgSquareDiff = this.mean(squareDiffs);
        return Math.sqrt(avgSquareDiff);
    },

    /**
     * Calculates the Euclidean distance between two vectors (arrays) of the same length.
     * Used to compare rhythm profiles.
     * @param {number[]} vectorA 
     * @param {number[]} vectorB 
     * @returns {number}
     */
    euclideanDistance(vectorA, vectorB) {
        if (vectorA.length !== vectorB.length) {
            console.warn("Vector length mismatch in Euclidean calculation");
            return Infinity;
        }

        let sum = 0;
        for (let i = 0; i < vectorA.length; i++) {
            const diff = vectorA[i] - vectorB[i];
            sum += diff * diff;
        }
        return Math.sqrt(sum);
    },

    /**
     * Calculates the Manhattan distance between two vectors.
     * Less sensitive to outliers than Euclidean distance.
     * @param {number[]} vectorA 
     * @param {number[]} vectorB 
     * @returns {number}
     */
    manhattanDistance(vectorA, vectorB) {
        if (vectorA.length !== vectorB.length) return Infinity;
        let sum = 0;
        for (let i = 0; i < vectorA.length; i++) {
            sum += Math.abs(vectorA[i] - vectorB[i]);
        }
        return sum;
    },

    /**
     * Calculates cosine similarity between two vectors.
     * Returns a value between -1 and 1. 1 means identical direction.
     * @param {number[]} vectorA 
     * @param {number[]} vectorB 
     * @returns {number}
     */
    cosineSimilarity(vectorA, vectorB) {
        if (vectorA.length !== vectorB.length) return 0;

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < vectorA.length; i++) {
            dotProduct += vectorA[i] * vectorB[i];
            normA += vectorA[i] ** 2;
            normB += vectorB[i] ** 2;
        }

        if (normA === 0 || normB === 0) return 0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    },

    /**
     * Normalizes a vector to have a mean of 0 and stdDev of 1.
     * Useful for comparing patterns regardless of absolute speed.
     * @param {number[]} vector 
     * @returns {number[]}
     */
    zScoreNormalize(vector) {
        const mean = this.mean(vector);
        const std = this.stdDev(vector);
        if (std === 0) return vector.map(() => 0);
        return vector.map(v => (v - mean) / std);
    },

    /**
     * Clamps a value between a min and max.
     * @param {number} num 
     * @param {number} min 
     * @param {number} max 
     * @returns {number}
     */
    clamp(num, min, max) {
        return Math.min(Math.max(num, min), max);
    },

    /**
     * Calculates the covariance between two datasets.
     * @param {number[]} dataX 
     * @param {number[]} dataY 
     * @returns {number}
     */
    covariance(dataX, dataY) {
        if (dataX.length !== dataY.length || dataX.length === 0) return 0;
        const meanX = this.mean(dataX);
        const meanY = this.mean(dataY);
        let sum = 0;
        for (let i = 0; i < dataX.length; i++) {
            sum += (dataX[i] - meanX) * (dataY[i] - meanY);
        }
        return sum / (dataX.length - 1); // Sample covariance
    },

    /**
     * Calculates the Variance-Covariance Matrix for a set of vectors.
     * Dimensions: N x N where N is vector length.
     * @param {number[][]} matrix (M samples x N features)
     * @returns {number[][]} N x N matrix
     */
    calculateCovarianceMatrix(matrix) {
        const numFeatures = matrix[0].length;
        const covMatrix = Array(numFeatures).fill(0).map(() => Array(numFeatures).fill(0));

        // Transpose to get arrays of features
        const features = [];
        for (let f = 0; f < numFeatures; f++) {
            features.push(matrix.map(row => row[f]));
        }

        for (let i = 0; i < numFeatures; i++) {
            for (let j = 0; j < numFeatures; j++) {
                covMatrix[i][j] = this.covariance(features[i], features[j]);
            }
        }
        return covMatrix;
    },

    /**
     * Inverts a square matrix (Gaussian elimination).
     * Necessary for Mahalanobis distance.
     * @param {number[][]} M 
     * @returns {number[][]} Inverse matrix
     */
    invertMatrix(M) {
        // Simple implementation for small dimensions. 
        // For production/large scale, would use LU decomposition.
        // This is a naive O(n^3) implementation.

        const n = M.length;
        // Create augmented matrix [M | I]
        const aug = M.map(row => [...row, ...Array(n).fill(0).map((_, i) => i === M.indexOf(row) ? 1 : 0)]);

        // Gaussian elimination
        for (let i = 0; i < n; i++) {
            // Find pivot
            let pivot = i;
            for (let j = i + 1; j < n; j++) {
                if (Math.abs(aug[j][i]) > Math.abs(aug[pivot][i])) pivot = j;
            }

            // Swap rows
            [aug[i], aug[pivot]] = [aug[pivot], aug[i]];

            // Normalize pivot row
            const div = aug[i][i];
            if (div === 0) return null; // Singular matrix
            for (let j = i; j < 2 * n; j++) {
                aug[i][j] /= div;
            }

            // Eliminate other rows
            for (let k = 0; k < n; k++) {
                if (k !== i) {
                    const factor = aug[k][i];
                    for (let j = i; j < 2 * n; j++) {
                        aug[k][j] -= factor * aug[i][j];
                    }
                }
            }
        }

        // Extract inverse
        return aug.map(row => row.slice(n));
    },

    /**
     * Calculates Mahalanobis Distance.
     * D = sqrt( (x - u)^T * S^-1 * (x - u) )
     * @param {number[]} vector Input vector
     * @param {number[]} meanVector Mean vector
     * @param {number[][]} invCovMatrix Inverse Covariance Matrix
     * @returns {number}
     */
    mahalanobisDistance(vector, meanVector, invCovMatrix) {
        if (!invCovMatrix) return this.euclideanDistance(vector, meanVector);

        const diff = vector.map((v, i) => v - meanVector[i]);
        const n = diff.length;
        let sum = 0;

        // Multiply (x-u) * S^-1
        const intermediate = Array(n).fill(0);
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                intermediate[i] += diff[j] * invCovMatrix[j][i];
            }
        }

        // Multiply result * (x-u)^T
        for (let i = 0; i < n; i++) {
            sum += intermediate[i] * diff[i];
        }

        return Math.sqrt(Math.max(0, sum)); // Max(0) handles floating point potential negative zero
    }
};
