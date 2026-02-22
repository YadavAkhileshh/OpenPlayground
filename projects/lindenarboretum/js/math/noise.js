/**
 * LindenArboretum - Noise Module
 * 1D / 2D / 3D Perlin-like noise generator for organic wind fluctuation.
 * Based on basic value noise but sufficient for wind simulation.
 * 
 * =========================================================================
 * ALGORITHMIC OVERVIEW:
 * 
 * Procedural generation often relies on coherent noise to create natural
 * looking variations. Random number generators (PRNGs) produce white noise
 * which is too chaotic for natural phenomena like wind, terrain, or clouds.
 * 
 * Coherent noise, such as Perlin Noise (invented by Ken Perlin in 1983) 
 * or Simplex Noise, provides pseudo-random values that smoothly interpolate 
 * between points, giving an "organic" feel.
 * 
 * In this implementation, we use a permutation table approach combined with
 * polynomial fading and gradient dot products to generate our noise.
 * 
 * The polynomial used for fading (smoothing) is:
 * 6t^5 - 15t^4 + 10t^3
 * This was introduced by Perlin to solve second-order discontinuity
 * artifacts present in older smoothstep algorithms (3t^2 - 2t^3).
 * 
 * =========================================================================
 * USE CASES IN THIS APPLICATION:
 * 
 * 1. Wind Gusts: By sampling 1D noise over time (time = x), we get a 
 *    continuously varying float that we use to apply rotational forces.
 * 2. Alien Flora Texture: Can be mapped to canvas context filters if needed.
 * 3. Growth Perturbations: Future implementation could use noise to 
 *    slightly bend branches during the generation phase rather than 
 *    just the render phase.
 * 
 * =========================================================================
 * MATHEMATICAL FOUNDATION:
 * 
 * Coherent noise works by defining a grid of random gradient vectors.
 * Given a point in space, we:
 * 1. Find the grid cell enclosing the point.
 * 2. Determine the distance from the point to the corners of the cell.
 * 3. Compute the dot products between the distance vectors and gradients.
 * 4. Interpolate the dot products using the fade function.
 * 
 * Our hash function uses a simple Mulberry32 PRNG to pre-fill the 
 * permutation table. This ensures deterministic behavior across page loads.
 */

export class NoiseGenerator {
    /**
     * @param {number} seed - The initialization seed for the PRNG
     */
    constructor(seed = 12345) {
        this.seed = seed;
        this.p = new Uint8Array(512);
        this.init(seed);
    }

    /**
     * Initializes the permutation table based on seed.
     * The table relies on an initial array of 0-255 being shuffled
     * deterministically, and then duplicated to avoid array bounds checks
     * during the fast noise evaluation loop.
     * 
     * @param {number} seed 
     */
    init(seed) {
        let rng = this.mulberry32(seed);
        const p = new Uint8Array(256);
        for (let i = 0; i < 256; i++) {
            p[i] = i;
        }

        // Shuffle using Fisher-Yates with our PRNG
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1));
            const temp = p[i];
            p[i] = p[j];
            p[j] = temp;
        }

        // Duplicate the permutation array.
        // This is a standard trick to prevent buffer overflows
        // when interpolating between grid points (e.g., hash[X+1]).
        for (let i = 0; i < 512; i++) {
            this.p[i] = p[i & 255];
        }
    }

    /**
     * Seeded PRNG. Mulberry32 is a fast 32-bit generator.
     * It's not cryptographically secure, but perfectly adequate
     * and high-performance for procedural graphic generation.
     * 
     * @param {number} a - Initial seed
     */
    mulberry32(a) {
        return function () {
            var t = a += 0x6D2B79F5; // Magic constant for distribution
            t = Math.imul(t ^ t >>> 15, t | 1);
            t ^= t + Math.imul(t ^ t >>> 7, t | 61);
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        }
    }

    /**
     * The fade curve. 6t^5 - 15t^4 + 10t^3.
     * Guarantees smooth derivatives at the boundaries of the grid cells.
     * 
     * @param {number} t - Input value between 0 and 1
     */
    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    /**
     * Standard linear interpolation.
     * 
     * @param {number} t - Interpolant
     * @param {number} a - Start value
     * @param {number} b - End value
     */
    lerp(t, a, b) {
        return a + t * (b - a);
    }

    /**
     * Calculates the dot product of the distance vector and 
     * the pseudo-random gradient vector in 3D space.
     * 
     * @param {number} hash - Permutation hash value
     * @param {number} x - Distance x
     * @param {number} y - Distance y
     * @param {number} z - Distance z
     */
    grad(hash, x, y, z) {
        // Convert low 4 bits of hash code into 12 gradient directions.
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    /**
     * Evaluates 3D noise (often used for 2D + time).
     * Returns a coherent random value based on spatial coordinates.
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     * @returns {number} Value primarily in range [-1, 1]
     */
    noise(x, y, z) {
        const p = this.p;

        // Find unit cube that contains point
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;

        // Find relative coordinates of point in cube
        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);

        // Compute fade curves for each axis
        const u = this.fade(x);
        const v = this.fade(y);
        const w = this.fade(z);

        // Hash coordinates of the 8 cube corners
        const A = p[X] + Y, AA = p[A] + Z, AB = p[A + 1] + Z;
        const B = p[X + 1] + Y, BA = p[B] + Z, BB = p[B + 1] + Z;

        // Add blended results from 8 corners of cube
        return this.lerp(w, this.lerp(v, this.lerp(u, this.grad(p[AA], x, y, z),
            this.grad(p[BA], x - 1, y, z)),
            this.lerp(u, this.grad(p[AB], x, y - 1, z),
                this.grad(p[BB], x - 1, y - 1, z))),
            this.lerp(v, this.lerp(u, this.grad(p[AA + 1], x, y, z - 1),
                this.grad(p[BA + 1], x - 1, y, z - 1)),
                this.lerp(u, this.grad(p[AB + 1], x, y - 1, z - 1),
                    this.grad(p[BB + 1], x - 1, y - 1, z - 1))));
    }

    /**
     * 1D Noise wrapper mapping from 3D by keeping Y and Z at 0.
     * Extremely useful for smooth oscillations over an arbitrary timeline.
     * 
     * @param {number} x - The 1D coordinate (often time)
     * @returns {number} Value primarily in range [-1, 1]
     */
    noise1D(x) {
        return this.noise(x, 0, 0);
    }

    /**
     * 2D Noise wrapper mapping from 3D by keeping Z at 0.
     * Useful for terrain mapping or 2D wind flow fields.
     * 
     * @param {number} x 
     * @param {number} y 
     * @returns {number} Value primarily in range [-1, 1]
     */
    noise2D(x, y) {
        return this.noise(x, y, 0);
    }
}
