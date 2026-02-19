/**
 * Computes the fitness (error) of a generated image against a target.
 * Uses a pixel-by-pixel Mean Squared Error (MSE) approach.
 */
export class FitnessCalculator {
    constructor() {
        /** 
         * The pixel data of the target image.
         * @type {Uint8ClampedArray|null} 
         */
        this.targetData = null;
    }

    /**
     * Sets the target image data.
     * @param {ImageData} imageData - The target image data from Canvas context.
     */
    setTarget(imageData) {
        this.targetData = imageData.data;
    }

    /**
     * Calculates the error between the current canvas data and the target.
     * Lower score is better (0 = perfect match).
     * 
     * The algorithm sums the squared difference of R, G, and B channels for every pixel.
     * Alpha channel is currently ignored as the background is fixed to black.
     * 
     * @param {ImageData} currentImageData - The rendered genome image data.
     * @returns {number} The total error score.
     */
    calculateFitness(currentImageData) {
        if (!this.targetData) return Infinity;

        const current = currentImageData.data;
        let diff = 0;

        // Loop through pixels (R, G, B channels only)
        // Stride is 4 (RGBA)
        for (let i = 0; i < current.length; i += 4) {
            const rDiff = current[i] - this.targetData[i];
            const gDiff = current[i + 1] - this.targetData[i + 1];
            const bDiff = current[i + 2] - this.targetData[i + 2];

            // Squared difference penalizes large outliers more than small errors,
            // which encourages the algorithm to fix major discrepancies first.
            diff += rDiff * rDiff + gDiff * gDiff + bDiff * bDiff;
        }

        return diff;
    }
}
