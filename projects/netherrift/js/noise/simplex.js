/** NetherRift — 3D Simplex Noise (from scratch, no libraries)
 * Ken Perlin's simplex tetrahedra algorithm. O(N²), smooth, isotropic.
 * Exports: SimplexNoise, fbm3, warpedFbm3, buildNoiseField, sharedNoiseX/Y/Z, turbulenceNoise.
 */

import { NOISE } from "../config.js";
import { lerp, smootherstep } from "../utils/math.js";

// ─── Gradient vectors ───────────────────────────────────────────────
// 12 edge-midpoints of a cube, used as gradient directions.
// Each entry is [gx, gy, gz].
const GRAD3 = [
  [ 1,  1,  0], [-1,  1,  0], [ 1, -1,  0], [-1, -1,  0],
  [ 1,  0,  1], [-1,  0,  1], [ 1,  0, -1], [-1,  0, -1],
  [ 0,  1,  1], [ 0, -1,  1], [ 0,  1, -1], [ 0, -1, -1],
];

// ─── Permutation table ──────────────────────────────────────────────
// A reference permutation of 0..255.  Doubled to avoid % 256 in lookups.
const PERM_BASE = new Uint8Array([
  151,160,137, 91, 90, 15,131, 13,201, 95, 96, 53,194,233,  7,225,
  140, 36,103, 30, 69,142,  8, 99, 37,240, 21, 10, 23,190,  6,148,
  247,120,234, 75,  0, 26,197, 62, 94,252,219,203,117, 35, 11, 32,
   57,177, 33, 88,237,149, 56, 87,174, 20,125,136,171,168, 68,175,
   74,165, 71,134,139, 48, 27,166, 77,146,158,231, 83,111,229,122,
   60,211,133,230,220,105, 92, 41, 55, 46,245, 40,244,102,143, 54,
   65, 25, 63,161,  1,216, 80, 73,209, 76,132,187,208, 89, 18,169,
  200,196,135,130,116,188,159, 86,164,100,109,198,173,186,  3, 64,
   52,217,226,250,124,123,  5,202, 38,147,118,126,255, 82, 85,212,
  207,206, 59,227, 47, 16, 58, 17,182,189, 28, 42,223,183,170,213,
  119,248,152,  2, 44,154,163, 70,221,153,101,155,167, 43,172,  9,
  129, 22, 39,253, 19, 98,108,110, 79,113,224,232,178,185,112,104,
  218,246, 97,228,251, 34,242,193,238,210,144, 12,191,179,162,241,
   81, 51,145,235,249, 14,239,107, 49,192,214, 31,181,199,106,157,
  184, 84,204,176,115,121, 50, 45,127,  4,150,254,138,236,205, 93,
  222,114, 67, 29, 24, 72,243,141,128,195, 78, 66,215, 61,156,180,
]);

// ─── SimplexNoise class ─────────────────────────────────────────────

/**
 * 3-D Simplex Noise generator.
 * Instantiate with an optional integer seed to shuffle the permutation.
 *
 * @example
 *   const sn = new SimplexNoise(42);
 *   const v  = sn.noise3(0.5, 1.2, 0.8);  // ∈ [−1, 1]
 */
export class SimplexNoise {

  /** @param {number} [seed=0] — integer seed */
  constructor(seed = 0) {
    // Build a seeded permutation by applying a simple Fisher-Yates
    // shuffle driven by a LCG seeded from `seed`.
    this._perm  = new Uint8Array(512);
    this._perm12 = new Uint8Array(512);

    const src = new Uint8Array(256);
    for (let i = 0; i < 256; i++) src[i] = PERM_BASE[i];

    // LCG parameters (classic Numerical Recipes)
    let s = (seed ^ 0x9e3779b9) >>> 0;
    const lcg = () => {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      return s;
    };

    // Fisher-Yates shuffle
    for (let i = 255; i > 0; i--) {
      const j = lcg() % (i + 1);
      const tmp = src[i]; src[i] = src[j]; src[j] = tmp;
    }

    // Double the table to avoid wrapping modulo in hot path
    for (let i = 0; i < 512; i++) {
      this._perm[i]  = src[i & 255];
      this._perm12[i] = this._perm[i] % 12;
    }

    // Skew / un-skew factors for 3-D simplex
    // F3 = (sqrt(4) − 1) / 3  = 1/3
    // G3 = (1 − 1/sqrt(4)) / 3 = 1/6
    this._F3 = 1 / 3;
    this._G3 = 1 / 6;
  }

  // ─── Core 3-D noise ──────────────────────────────────────────────

  /**
   * Evaluate 3-D simplex noise at position (xin, yin, zin).
   * Returns a value in the range [−1, +1].
   *
   * @param {number} xin
   * @param {number} yin
   * @param {number} zin
   * @returns {number}
   */
  noise3(xin, yin, zin) {
    const F3 = this._F3;
    const G3 = this._G3;
    const perm  = this._perm;
    const perm12 = this._perm12;

    // ── Step 1: Skew the input space to determine simplex cell ──
    const s = (xin + yin + zin) * F3;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const k = Math.floor(zin + s);

    const t = (i + j + k) * G3;

    // Un-skew the cell origin back to (x,y,z) space
    const X0 = i - t;
    const Y0 = j - t;
    const Z0 = k - t;

    // The (x,y,z) distances from the cell origin
    const x0 = xin - X0;
    const y0 = yin - Y0;
    const z0 = zin - Z0;

    // ── Step 2: Determine which simplex we are in ────────────────
    // There are 6 possible tetrahedra; pick the correct one.
    let i1, j1, k1; // offsets for second corner
    let i2, j2, k2; // offsets for third corner

    if (x0 >= y0) {
      if (y0 >= z0)      { i1=1;j1=0;k1=0; i2=1;j2=1;k2=0; }
      else if (x0 >= z0) { i1=1;j1=0;k1=0; i2=1;j2=0;k2=1; }
      else               { i1=0;j1=0;k1=1; i2=1;j2=0;k2=1; }
    } else {
      if (y0 < z0)       { i1=0;j1=0;k1=1; i2=0;j2=1;k2=1; }
      else if (x0 < z0)  { i1=0;j1=1;k1=0; i2=0;j2=1;k2=1; }
      else               { i1=0;j1=1;k1=0; i2=1;j2=1;k2=0; }
    }

    // ── Step 3: Compute corner offsets ──────────────────────────
    // Second corner
    const x1 = x0 - i1 + G3;
    const y1 = y0 - j1 + G3;
    const z1 = z0 - k1 + G3;

    // Third corner
    const x2 = x0 - i2 + 2 * G3;
    const y2 = y0 - j2 + 2 * G3;
    const z2 = z0 - k2 + 2 * G3;

    // Fourth corner (always opposite of origin)
    const x3 = x0 - 1 + 3 * G3;
    const y3 = y0 - 1 + 3 * G3;
    const z3 = z0 - 1 + 3 * G3;

    // ── Step 4: Gradient index hashing ──────────────────────────
    const ii = i & 255;
    const jj = j & 255;
    const kk = k & 255;

    const gi0 = perm12[ii +       perm[jj +       perm[kk        ]]];
    const gi1 = perm12[ii + i1 +  perm[jj + j1 +  perm[kk + k1   ]]];
    const gi2 = perm12[ii + i2 +  perm[jj + j2 +  perm[kk + k2   ]]];
    const gi3 = perm12[ii + 1  +  perm[jj + 1  +  perm[kk + 1    ]]];

    // ── Step 5: Corner contributions ────────────────────────────
    // The kernel function is (0.6 − r²)⁴ × dot(gradient, [x,y,z])

    let n0 = 0, n1 = 0, n2 = 0, n3 = 0;

    let t0 = 0.6 - x0*x0 - y0*y0 - z0*z0;
    if (t0 >= 0) {
      t0 *= t0;
      const g = GRAD3[gi0];
      n0 = t0 * t0 * (g[0]*x0 + g[1]*y0 + g[2]*z0);
    }

    let t1 = 0.6 - x1*x1 - y1*y1 - z1*z1;
    if (t1 >= 0) {
      t1 *= t1;
      const g = GRAD3[gi1];
      n1 = t1 * t1 * (g[0]*x1 + g[1]*y1 + g[2]*z1);
    }

    let t2 = 0.6 - x2*x2 - y2*y2 - z2*z2;
    if (t2 >= 0) {
      t2 *= t2;
      const g = GRAD3[gi2];
      n2 = t2 * t2 * (g[0]*x2 + g[1]*y2 + g[2]*z2);
    }

    let t3 = 0.6 - x3*x3 - y3*y3 - z3*z3;
    if (t3 >= 0) {
      t3 *= t3;
      const g = GRAD3[gi3];
      n3 = t3 * t3 * (g[0]*x3 + g[1]*y3 + g[2]*z3);
    }

    // ── Step 6: Sum and scale ────────────────────────────────────
    // Scale factor 32 normalises to approximately [−1, +1].
    return 32 * (n0 + n1 + n2 + n3);
  }

  // ─── 2-D convenience (uses z=0) ──────────────────────────────────

  /**
   * Evaluate 2-D simplex noise by passing z = 0.
   * @param {number} x
   * @param {number} y
   * @returns {number}
   */
  noise2(x, y) {
    return this.noise3(x, y, 0);
  }

  // ─── Gradient vector ─────────────────────────────────────────────

  /**
   * Return the gradient vector [dx, dy, dz] at (x, y, z) approximated
   * via central finite differences.  Epsilon is intentionally small to
   * capture sub-pixel detail at noise scale.
   *
   * @param {number} x @param {number} y @param {number} z
   * @param {number} [eps=0.0001]
   * @returns {[number, number, number]}
   */
  gradient3(x, y, z, eps = 0.0001) {
    const dx = (this.noise3(x + eps, y, z) - this.noise3(x - eps, y, z)) / (2 * eps);
    const dy = (this.noise3(x, y + eps, z) - this.noise3(x, y - eps, z)) / (2 * eps);
    const dz = (this.noise3(x, y, z + eps) - this.noise3(x, y, z - eps)) / (2 * eps);
    return [dx, dy, dz];
  }
}

// ─── Fractional Brownian Motion ─────────────────────────────────────

/**
 * Fractional Brownian Motion — sum of multiple octaves of simplex noise.
 *
 * Each successive octave has double the frequency and halved amplitude.
 *
 * @param {SimplexNoise} sn         — noise instance
 * @param {number}       x
 * @param {number}       y
 * @param {number}       z
 * @param {number}       [octaves=4]
 * @param {number}       [lacunarity=2.0]  — frequency multiplier per octave
 * @param {number}       [persistence=0.5] — amplitude multiplier per octave
 * @returns {number}  — sum, roughly in [−1, +1] for typical configs
 */
export function fbm3(sn, x, y, z,
                     octaves     = NOISE.OCTAVES,
                     lacunarity  = NOISE.LACUNARITY,
                     persistence = NOISE.PERSISTENCE) {
  let value    = 0;
  let amplitude = 1.0;
  let frequency = 1.0;
  let maxAmp    = 0;    // for normalisation

  for (let o = 0; o < octaves; o++) {
    value    += amplitude * sn.noise3(x * frequency, y * frequency, z * frequency);
    maxAmp   += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }

  // Normalise so the result is roughly in [−1, 1]
  return value / maxAmp;
}

/**
 * Domain-warped fbm.  Evaluates fbm(p + fbm(p + fbm(p))).
 * Creates highly complex, folded smoke / fluid structures.
 *
 * @param {SimplexNoise} sn
 * @param {number} x @param {number} y @param {number} z
 * @param {number} [warpStrength=1.0] — displacement scale (spatial units)
 * @param {number} [octaves=3]
 * @returns {number}
 */
export function warpedFbm3(sn, x, y, z, warpStrength = 1.0, octaves = 3) {
  // First warp position
  const qx = fbm3(sn, x              , y              , z              , octaves);
  const qy = fbm3(sn, x + 5.2        , y + 1.3        , z + 2.8        , octaves);
  const qz = fbm3(sn, x + 0.4        , y + 8.1        , z + 3.7        , octaves);

  // Second warp
  const rx = fbm3(sn, x + warpStrength * qx, y + warpStrength * qy, z + warpStrength * qz, octaves);
  const ry = fbm3(sn, x + warpStrength * qx + 1.7, y + warpStrength * qy + 9.2, z + warpStrength * qz + 4.5, octaves);

  // Sample using double-warped position
  return fbm3(sn,
    x + warpStrength * rx,
    y + warpStrength * ry,
    z,
    octaves);
}

// ─── Gradient field ─────────────────────────────────────────────────

/**
 * Compute two independent noise values to form a 2-D gradient-like
 * pair F(x,y,z) = [ noise(x,y,z), noise(x+seed, y+seed, z+seed) ].
 * Used to build the potential field from which curl is derived.
 *
 * @param {SimplexNoise} snA — first noise instance
 * @param {SimplexNoise} snB — second noise instance (different seed)
 * @param {number} x @param {number} y @param {number} z
 * @returns {[number, number]}
 */
export function noiseField2(snA, snB, x, y, z) {
  return [snA.noise3(x, y, z), snB.noise3(x, y, z)];
}

/**
 * Compute three independent noise components for a 3-D potential field
 * F(x,y,z) = [Fx, Fy, Fz]  from which we can take the curl.
 *
 * @param {SimplexNoise} snX
 * @param {SimplexNoise} snY
 * @param {SimplexNoise} snZ
 * @param {number} x @param {number} y @param {number} z
 * @returns {[number, number, number]}
 */
export function potentialField3(snX, snY, snZ, x, y, z) {
  return [
    snX.noise3(x, y, z),
    snY.noise3(x, y, z),
    snZ.noise3(x, y, z),
  ];
}

// ─── Noise Field Builder ────────────────────────────────────────────

/**
 * Fill a pre-allocated Float32Array with sampled 2-D simplex noise.
 * Layout: array[row * cols + col]  = noise(col * scaleX, row * scaleY, z).
 *
 * @param {SimplexNoise} sn
 * @param {Float32Array} out    — pre-allocated, length = rows * cols
 * @param {number}       rows
 * @param {number}       cols
 * @param {number}       scaleX — spatial step per column
 * @param {number}       scaleY — spatial step per row
 * @param {number}       z      — fixed z-slice (temporal dim)
 */
export function buildNoiseField(sn, out, rows, cols, scaleX, scaleY, z) {
  let idx = 0;
  for (let r = 0; r < rows; r++) {
    const ny = r * scaleY;
    for (let c = 0; c < cols; c++) {
      out[idx++] = sn.noise3(c * scaleX, ny, z);
    }
  }
}

// ─── Module-level shared instances ──────────────────────────────────

/**
 * Three pre-seeded SimplexNoise instances for X, Y, Z potential components.
 * Exported so curl.js can reuse them without re-allocation.
 */
export const sharedNoiseX = new SimplexNoise(0);
export const sharedNoiseY = new SimplexNoise(31337);
export const sharedNoiseZ = new SimplexNoise(98765);

/**
 * High-frequency noise for turbulence detail.
 */
export const turbulenceNoise = new SimplexNoise(55555);

/**
 * Test utility — sample the three noise functions at canonical origin.
 * Returns a quality check object.
 * @returns {{ok: boolean, samples: number[]}}
 */
export function selfTest() {
  const samples = [
    sharedNoiseX.noise3(0.1, 0.2, 0.3),
    sharedNoiseY.noise3(1.5, 2.5, 0.5),
    sharedNoiseZ.noise3(-1, 0.5, 2.0),
    fbm3(sharedNoiseX, 0.5, 0.5, 0.5),
  ];
  const ok = samples.every(v => isFinite(v) && v >= -1.1 && v <= 1.1);
  return { ok, samples };
}
