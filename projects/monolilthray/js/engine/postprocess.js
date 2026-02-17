/**
 * @file postprocess.js
 * @description CPU-based post-processing effects.
 */

class PostProcess {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }

    /**
     * Apply chromatic aberration and noise.
     * @param {Uint8ClampedArray} targetData 
     * @param {Uint8ClampedArray} sourceData 
     */
    apply(targetData, sourceData) {
        // Simple pixel loop
        // We can do this in the worker actually, or Main thread.
        // Doing in main thread might block UI.

        const w = this.width;
        const h = this.height;

        for (let i = 0; i < sourceData.length; i += 4) {
            // Noise
            const noise = (Math.random() - 0.5) * 10;

            // Chromatic Aberration (Channel Shift)
            // Default: Copy
            let r = sourceData[i];
            let g = sourceData[i + 1];
            let b = sourceData[i + 2];

            // Red Offset
            // const offset = 4 * 2; // 2 pixels
            // if (i + offset < sourceData.length) r = sourceData[i+offset];

            // Apply Noise
            targetData[i] = MathUtils.clamp(r + noise, 0, 255);
            targetData[i + 1] = MathUtils.clamp(g + noise, 0, 255);
            targetData[i + 2] = MathUtils.clamp(b + noise, 0, 255);
            targetData[i + 3] = 255;
        }
    }
}

// Attach to worker scope if needed
if (typeof self !== 'undefined') self.PostProcess = PostProcess;
