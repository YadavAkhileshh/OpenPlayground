/** NetherRift — Particle Integrator
 * RK4 integration: dx/dt = V_curl + V_turbulence; lifespan fade; boundary respawn.
 */

import { PARTICLES, NOISE }           from "../config.js";
import { clamp, smoothstep, lerp }    from "../utils/math.js";
import { turbulenceNoise }            from "../noise/simplex.js";
import { curlField }                  from "../curl/curl.js";
import { particlePool }               from "./pool.js";

// ─── Internal scratch buffers (avoid allocation in hot path) ────────
const _kBuf = new Float32Array(8);   // 4 RK4 stages × 2 components

// ─── Particle Integrator ─────────────────────────────────────────────

export class ParticleIntegrator {

  /**
   * @param {ParticlePool} pool
   * @param {CurlField}    field
   */
  constructor(pool = particlePool, field = curlField) {
    this.pool         = pool;
    this.field        = field;

    // Runtime configuration (synced from UI)
    this.flowSpeed    = 1.0;
    this.turbAmp      = PARTICLES.TURBULENCE;
    this.maxSpeed     = 320;          // px/s ceiling
    this.damping      = 0.985;        // per-step velocity retention

    // Boundary margin: particles outside [−margin, W+margin] × [−margin, H+margin] are killed
    this.boundsMargin = 60;

    // Canvas dimensions (updated each frame by engine)
    this.canvasW = 1;
    this.canvasH = 1;

    // Simulation time
    this.time = 0;

    // Per-frame respawn quota
    this.respawnQuota = PARTICLES.RESPAWN_RATE;

    // Rift list reference (updated by input system)
    this.rifts = [];

    // Turbulence time offset
    this._turbTime = 0;
    this._turbTimeScale = 0.00035;
  }

  // ─── Main tick ─────────────────────────────────────────────────────

  /**
   * Advance all particles by `dt` seconds.
   * This is called once per rAF frame by the engine.
   *
   * @param {number} dt     — seconds since last frame (clamped to ≤ 0.05)
   * @param {number} canvasW
   * @param {number} canvasH
   */
  tick(dt, canvasW, canvasH) {
    // Clamp dt to prevent spiral on tab refocus
    const h = Math.min(dt, 0.05) * this.flowSpeed;

    this.canvasW = canvasW;
    this.canvasH = canvasH;
    this.time   += h;
    this._turbTime += h * this._turbTimeScale;

    const pool   = this.pool;
    const field  = this.field;
    const live   = pool.liveIndices;
    const n      = pool.aliveCount;

    const px       = pool.px;
    const py       = pool.py;
    const age      = pool.age;
    const lifespan = pool.lifespan;
    const speed    = pool.speed;

    const margin   = this.boundsMargin;
    const maxSp    = this.maxSpeed;
    const turbAmp  = this.turbAmp;
    const turbT    = this._turbTime;

    const velBuf   = _kBuf;   // reuse scratch buffer for single-stage calls

    // ── RK4 intermediate buffers ─────────────────────────────────────
    // k1..k4 for x and y stored at fixed offsets in velBuf
    // [0,1] = k1, [2,3] = k2, [4,5] = k3, [6,7] = k4

    let killed  = 0;

    for (let li = 0; li < n; li++) {
      const i = live[li];

      // Advance age; kill if expired
      age[i] += h;
      if (age[i] >= lifespan[i]) {
        pool.kill(i);
        killed++;
        continue;
      }

      const x = px[i];
      const y = py[i];

      // ── RK4 ────────────────────────────────────────────────────
      // k1 = f(p)
      field.sample(x, y, velBuf, 0);
      _addTurbulence(velBuf, 0, x, y, turbT, turbAmp);
      const k1x = velBuf[0], k1y = velBuf[1];

      // k2 = f(p + 0.5h k1)
      field.sample(x + 0.5 * h * k1x, y + 0.5 * h * k1y, velBuf, 2);
      _addTurbulence(velBuf, 2, x + 0.5*h*k1x, y + 0.5*h*k1y, turbT, turbAmp);
      const k2x = velBuf[2], k2y = velBuf[3];

      // k3 = f(p + 0.5h k2)
      field.sample(x + 0.5 * h * k2x, y + 0.5 * h * k2y, velBuf, 4);
      _addTurbulence(velBuf, 4, x + 0.5*h*k2x, y + 0.5*h*k2y, turbT, turbAmp);
      const k3x = velBuf[4], k3y = velBuf[5];

      // k4 = f(p + h k3)
      field.sample(x + h * k3x, y + h * k3y, velBuf, 6);
      _addTurbulence(velBuf, 6, x + h*k3x, y + h*k3y, turbT, turbAmp);
      const k4x = velBuf[6], k4y = velBuf[7];

      // Weighted sum: (k1 + 2k2 + 2k3 + k4) / 6
      let dx = (h / 6) * (k1x + 2*k2x + 2*k3x + k4x);
      let dy = (h / 6) * (k1y + 2*k2y + 2*k3y + k4y);

      // Speed cap
      const spd = Math.sqrt(dx * dx + dy * dy) / h + 1e-9;
      if (spd > maxSp * h) {
        const scale = (maxSp * h) / spd;
        dx *= scale;
        dy *= scale;
      }

      // Cache scalar speed for renderer (px/s)
      speed[i] = spd;

      // Integrate position
      px[i] = x + dx;
      py[i] = y + dy;

      // ── Boundary check ───────────────────────────────────────────
      if (px[i] < -margin || px[i] > canvasW + margin ||
          py[i] < -margin || py[i] > canvasH + margin) {
        pool.kill(i);
        killed++;
      }
    }

    // ── Respawn killed particles (maintain target count) ────────────
    this._respawn(killed);

    // ── Rebuild live list ────────────────────────────────────────────
    pool.compactLiveList();
  }

  // ─── Respawn logic ─────────────────────────────────────────────────

  /**
   * Spawn up to `count` new particles near rifts or randomly.
   * @param {number} count
   */
  _respawn(count) {
    const pool  = this.pool;
    const rifts = this.rifts;
    const w     = this.canvasW;
    const h     = this.canvasH;

    if (rifts.length > 0) {
      const perRift = Math.ceil(count / rifts.length);
      for (let ri = 0; ri < rifts.length; ri++) {
        const r = rifts[ri];
        for (let i = 0; i < perRift; i++) {
          if (pool.freeCount === 0) return;
          pool.spawnInCircle(r.x, r.y);
        }
      }
    } else {
      for (let i = 0; i < count; i++) {
        if (pool.freeCount === 0) return;
        pool.spawnRandom(w, h);
      }
    }
  }

  // ─── Alpha calculation (public — used by renderer) ─────────────────

  /**
   * Compute the current alpha (0..1) for a particle based on its
   * normalised age.  Fade-in at birth and fade-out before death.
   *
   * @param {number} i — particle index
   * @returns {number}  — alpha ∈ [0, ALPHA_MAX]
   */
  computeAlpha(i) {
    const t = this.pool.age[i] / this.pool.lifespan[i];   // 0..1

    // Fade-in window
    const fadeIn  = smoothstep(t / PARTICLES.FADE_IN_FRAC);

    // Fade-out window
    const fadeOutStart = PARTICLES.FADE_OUT_FRAC;
    const fadeOut = t < fadeOutStart
      ? 1
      : smoothstep(1 - (t - fadeOutStart) / (1 - fadeOutStart));

    return fadeIn * fadeOut * PARTICLES.ALPHA_MAX;
  }

  /**
   * Compute normalised age for a particle.
   * @param {number} i
   * @returns {number}
   */
  normAge(i) {
    return clamp(this.pool.age[i] / this.pool.lifespan[i], 0, 1);
  }

  /**
   * Compute normalised speed (0..1) clamped to maxSpeed.
   * @param {number} i
   * @returns {number}
   */
  normSpeed(i) {
    return clamp(this.pool.speed[i] / this.maxSpeed, 0, 1);
  }

  // ─── Configuration setters ─────────────────────────────────────────

  /** Update canvas size reference. */
  setCanvas(w, h) { this.canvasW = w; this.canvasH = h; }

  /** @param {number} v — flow speed multiplier */
  setFlowSpeed(v)  { this.flowSpeed = clamp(v, 0.05, 10); }

  /** @param {number} v — turbulence amplitude */
  setTurbulence(v) { this.turbAmp = clamp(v, 0, 2); }

  /** @param {number} rifts — array from input system */
  setRifts(rifts)  { this.rifts = rifts || []; }
}

// ─── Turbulence helper (inline, avoids method call in hot loop) ──────

/**
 * Add simplex turbulence to the velocity stored at velBuf[offset..+1].
 * @param {Float32Array} velBuf
 * @param {number}       offset
 * @param {number}       x
 * @param {number}       y
 * @param {number}       t
 * @param {number}       amp
 */
function _addTurbulence(velBuf, offset, x, y, t, amp) {
  if (amp < 1e-6) return;
  const scale  = NOISE.SCALE2 * 3;
  velBuf[offset    ] += turbulenceNoise.noise3(x * scale, y * scale,     t) * amp;
  velBuf[offset + 1] += turbulenceNoise.noise3(x * scale + 17.4, y * scale + 31.8, t + 5.1) * amp;
}

// ─── Singleton integrator ─────────────────────────────────────────────
export const integrator = new ParticleIntegrator(particlePool, curlField);
