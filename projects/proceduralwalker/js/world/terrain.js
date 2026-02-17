/**
 * Terrain Class
 * Handles procedural ground generation using Perlin Noise.
 */
class Terrain {
    constructor() {
        this.roughness = 20; // Amplitude of noise
        this.frequency = 0.005; // Zoom level of noise
        this.scrollOffset = 0; // For infinite scrolling if needed
        this.updateParams({ roughness: 20 });

        // Pseudo-random permutation table for noise
        this.perm = [];
        this.gradP = [];
        this.seed(Math.random() * 65536);
    }

    updateParams(params) {
        if (params.roughness !== undefined) this.roughness = params.roughness;
    }

    seed(seed) {
        this.perm = new Array(512);
        this.gradP = new Array(512);

        // Simple LCG for seeding
        let v = seed;
        const next = () => {
            v = (v * 1664525 + 1013904223) % 4294967296;
            return (v >>> 0) / 4294967296;
        };

        const p = new Array(256).fill(0).map((_, i) => i);

        // Shuffle
        for (let i = 255; i > 0; i--) {
            const r = Math.floor(next() * (i + 1));
            [p[i], p[r]] = [p[r], p[i]];
        }

        // Duplicate for overflow
        for (let i = 0; i < 512; i++) {
            this.perm[i] = p[i & 255];
            this.gradP[i] = (this.perm[i] % 12) - 6; // Gradients
        }
    }

    // 1D Perlin Noise
    noise(x) {
        const X = Math.floor(x) & 255;
        const fx = x - Math.floor(x);
        const u = fx * fx * (3 - 2 * fx); // Smoothstep

        const a = this.perm[X];
        const b = this.perm[X + 1];

        // Gradient at X and X+1
        // In 1D, gradient is just a slope scalar. 
        // We use hashing to get a repeatable random value.
        const ga = this.gradP[X] / 6.0;
        const gb = this.gradP[X + 1] / 6.0;

        const va = ga * fx;
        const vb = gb * (fx - 1);

        return va + u * (vb - va);
    }

    /**
     * Get the ground height at a specific X coordinate.
     * @param {number} x 
     */
    getHeight(x) {
        // Overlay multiple octaves for detail
        const y1 = this.noise(x * this.frequency) * this.roughness * 5;
        const y2 = this.noise(x * this.frequency * 2 + 100) * this.roughness * 2.5;
        const y3 = this.noise(x * this.frequency * 4 + 200) * this.roughness * 1;

        // Base ground level + noise
        // Canvas Y increases downwards. Let's say baseline is 0 relative to "ground level".
        // The Renderer translates this to screen space.
        return y1 + y2 + y3;
    }
}
