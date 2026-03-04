/** NetherRift — Curl Calculator
 * Divergence-free velocity field via curl of noise-derived potential: F = ∇×A.
 * Rift attractors inject Rankine vortices superimposed on the field.
 */

import { NOISE, CURL }          from "../config.js";
import { clamp }                from "../utils/math.js";
import {
  sharedNoiseX, sharedNoiseY, sharedNoiseZ,
  turbulenceNoise, fbm3
} from "../noise/simplex.js";

// ─── CurlField ──────────────────────────────────────────────────────

export class CurlField {

  /**
   * @param {object} params
   * @param {number} [params.intensity]   — global velocity scale
   * @param {number} [params.noiseScale]  — spatial sample frequency
   * @param {number} [params.epsilon]     — finite-difference step
   */
  constructor(params = {}) {
    this.intensity  = params.intensity  ?? CURL.INTENSITY;
    this.noiseScale = params.noiseScale ?? NOISE.SCALE;
    this.epsilon    = params.epsilon    ?? CURL.EPSILON;

    // Noise-scale second layer
    this._scale2      = NOISE.SCALE2;
    this._layer2w     = NOISE.LAYER2_WEIGHT;
    this._timeScale   = NOISE.TIME_SCALE;
    this._timeScale2  = NOISE.TIME_SCALE2;

    // Current simulation time (seconds)
    this.time = 0;

    /** @type {Array<{x:number, y:number, strength:number, radius:number, age:number, maxAge:number}>} */
    this._rifts = [];
  }

  // ─── Time step ─────────────────────────────────────────────────────

  /**
   * Advance the internal time coordinate by `dt` seconds.
   * Also decays rift attractors.
   * @param {number} dt
   */
  tick(dt) {
    this.time += dt;
    this._updateRifts(dt);
  }

  // ─── Main sample ───────────────────────────────────────────────────

  /**
   * Sample the curl velocity field at canvas position (px, py).
   * Returns the 2-D velocity vector [vx, vy] in pixels-per-second.
   *
   * Hot path — called once per live particle per frame.
   * Minimise allocations: write into provided out array.
   *
   * @param {number}   px       — canvas x
   * @param {number}   py       — canvas y
   * @param {Float32Array} out  — length ≥ 2; [vx, vy] are written here
   * @param {number}   outOff   — start offset into out
   */
  sample(px, py, out, outOff) {
    const e  = this.epsilon;
    const s  = this.noiseScale;
    const t  = this.time * this._timeScale;
    const t2 = this.time * this._timeScale2;

    // ── Layer 1 (primary): 3-D potential field A = (Ax, Ay, Az) ───
    //   Spatial coords scaled, z = flowing time
    const x1 = px * s,  y1 = py * s,  z1 = t;

    // FBM potential components
    const Ax_yp  = fbm3(sharedNoiseX, x1,     y1 + e, z1);
    const Ax_ym  = fbm3(sharedNoiseX, x1,     y1 - e, z1);
    const Ax_zp  = fbm3(sharedNoiseX, x1,     y1,     z1 + e);
    const Ax_zm  = fbm3(sharedNoiseX, x1,     y1,     z1 - e);

    const Ay_xp  = fbm3(sharedNoiseY, x1 + e, y1,     z1);
    const Ay_xm  = fbm3(sharedNoiseY, x1 - e, y1,     z1);
    const Ay_zp  = fbm3(sharedNoiseY, x1,     y1,     z1 + e);
    const Ay_zm  = fbm3(sharedNoiseY, x1,     y1,     z1 - e);

    const Az_xp  = fbm3(sharedNoiseZ, x1 + e, y1,     z1);
    const Az_xm  = fbm3(sharedNoiseZ, x1 - e, y1,     z1);
    const Az_yp  = fbm3(sharedNoiseZ, x1,     y1 + e, z1);
    const Az_ym  = fbm3(sharedNoiseZ, x1,     y1 - e, z1);

    const inv2e = 0.5 / e;

    // Partial derivatives
    const dAx_dy = (Ax_yp - Ax_ym) * inv2e;
    const dAx_dz = (Ax_zp - Ax_zm) * inv2e;
    const dAy_dx = (Ay_xp - Ay_xm) * inv2e;
    const dAy_dz = (Ay_zp - Ay_zm) * inv2e;
    const dAz_dx = (Az_xp - Az_xm) * inv2e;
    const dAz_dy = (Az_yp - Az_ym) * inv2e;

    // Full curl components
    // curl_x = dAz/dy − dAy/dz
    // curl_y = dAx/dz − dAz/dx
    // curl_z = dAy/dx − dAx/dy  ← used as canvas vx, vy flow
    const curl_z_1 = dAy_dx - dAx_dy;
    const curl_x_1 = dAz_dy - dAy_dz;

    // ── Layer 2 (detail overlay) ────────────────────────────────────
    const x2 = px * this._scale2, y2 = py * this._scale2;

    const Az2_xp = sharedNoiseZ.noise3(x2 + e, y2,     t2);
    const Az2_xm = sharedNoiseZ.noise3(x2 - e, y2,     t2);
    const Az2_yp = sharedNoiseZ.noise3(x2,     y2 + e, t2);
    const Az2_ym = sharedNoiseZ.noise3(x2,     y2 - e, t2);

    const dAz2_dx = (Az2_xp - Az2_xm) * inv2e;
    const dAz2_dy = (Az2_yp - Az2_ym) * inv2e;

    // 2-D curl of this layer (scalar → vx = −∂/∂y, vy = +∂/∂x)
    const curl_2_x = -dAz2_dy;
    const curl_2_y =  dAz2_dx;

    // ── Blend layers ────────────────────────────────────────────────
    const w2 = this._layer2w;
    let vx = (curl_z_1 + w2 * curl_2_x) * this.intensity;
    let vy = (curl_x_1 + w2 * curl_2_y) * this.intensity;

    // ── Rift attractor contributions ────────────────────────────────
    for (let ri = 0; ri < this._rifts.length; ri++) {
      const rift = this._rifts[ri];
      const dx   = px - rift.x;
      const dy   = py - rift.y;
      const rSq  = dx * dx + dy * dy;
      const rLen = Math.sqrt(rSq) + 1e-6;

      // Normalised radial falloff: 1 at core, 0 at radius
      const falloff = Math.pow(
        Math.max(0, 1 - rLen / rift.radius),
        CURL.RIFT_FALLOFF
      );

      // Age fade: decay after maxAge
      const ageFade = clamp(1 - rift.age / rift.maxAge, 0, 1);
      const mag     = rift.strength * falloff * ageFade;

      // Tangential velocity (counter-clockwise vortex)
      //   v_x = −dy/r × mag
      //   v_y =  dx/r × mag
      const nx = -dy / rLen;
      const ny =  dx / rLen;
      vx += nx * mag;
      vy += ny * mag;

      // Inward radial pull (suction toward the tear centre)
      const suck = mag * 0.35;
      vx -= (dx / rLen) * suck;
      vy -= (dy / rLen) * suck;
    }

    // Write result
    out[outOff    ] = vx;
    out[outOff + 1] = vy;
  }

  /**
   * Quick scalar sample — returns only curl magnitude at (px, py).
   * Cheaper than full sample; used by the renderer for brightness hints.
   *
   * @param {number} px
   * @param {number} py
   * @returns {number}
   */
  magnitude(px, py) {
    const buf = new Float32Array(2);
    this.sample(px, py, buf, 0);
    return Math.sqrt(buf[0] * buf[0] + buf[1] * buf[1]);
  }

  // ─── Rift management ──────────────────────────────────────────────

  /**
   * Register a rift attractor at (x, y).
   * @param {number} x
   * @param {number} y
   * @param {number} [strength]
   * @param {number} [radius]
   * @param {number} [decayFrames]
   */
  addRift(x, y, strength = CURL.RIFT_STRENGTH, radius = CURL.RIFT_RADIUS, decayFrames = 90) {
    this.addRiftSync(x, y, strength, radius, decayFrames / 60);
  }

  /**
   * Synchronous version used internally (avoids dynamic import).
   * @param {number} x @param {number} y
   * @param {number} strength @param {number} radius @param {number} maxAgeSec
   */
  addRiftSync(x, y, strength, radius, maxAgeSec) {
    this._rifts.push({ x, y, strength, radius, age: 0, maxAge: maxAgeSec });
    if (this._rifts.length > 6) this._rifts.shift();
  }

  /**
   * Update rift ages and remove expired ones.
   * @param {number} dt — seconds
   */
  _updateRifts(dt) {
    for (let i = this._rifts.length - 1; i >= 0; i--) {
      this._rifts[i].age += dt;
      if (this._rifts[i].age >= this._rifts[i].maxAge) {
        this._rifts.splice(i, 1);
      }
    }
  }

  /**
   * Remove all rift attractors immediately.
   */
  clearRifts() {
    this._rifts.length = 0;
  }

  /**
   * Return a copy of the current rift list (for renderer visualisation).
   * @returns {Array}
   */
  getRifts() {
    return this._rifts.slice();
  }

  // ─── Field line debug helper ───────────────────────────────────────

  /**
   * Trace a single streamline starting at (sx, sy) for `steps` steps.
   * Returns an array of [x, y] pairs.  Used by debug overlay only.
   *
   * @param {number} sx @param {number} sy
   * @param {number} [steps=80]
   * @param {number} [stepLen=4]   — pixels per step
   * @returns {Array<[number, number]>}
   */
  traceStreamline(sx, sy, steps = 80, stepLen = 4) {
    const buf    = new Float32Array(2);
    const points = [];
    let x = sx, y = sy;

    for (let i = 0; i < steps; i++) {
      points.push([x, y]);
      this.sample(x, y, buf, 0);
      const vLen = Math.sqrt(buf[0] * buf[0] + buf[1] * buf[1]) + 1e-8;
      x += (buf[0] / vLen) * stepLen;
      y += (buf[1] / vLen) * stepLen;
    }
    return points;
  }

  // ─── Configuration setters (called by UI controls) ─────────────────

  /** @param {number} v */
  setIntensity(v)  { this.intensity  = clamp(v, CURL.INTENSITY_MIN, CURL.INTENSITY_MAX); }

  /** @param {number} v */
  setNoiseScale(v) { this.noiseScale = clamp(v, NOISE.SCALE_MIN, NOISE.SCALE_MAX); }
}

// ─── Module singleton ───────────────────────────────────────────────

/** Shared CurlField instance used by the engine. */
export const curlField = new CurlField();
