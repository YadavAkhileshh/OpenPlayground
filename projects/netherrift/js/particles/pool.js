/** NetherRift — Particle Pool
 * SoA TypedArray pool with free-list O(1) spawn/kill for up to MAX_COUNT particles.
 */

import { PARTICLES }        from "../config.js";
import { mulberry32, lerp } from "../utils/math.js";

// ─── Layout constants ────────────────────────────────────────────────
// Attribute strides for each SoA buffer
export const MAX_POOL = PARTICLES.MAX_COUNT;

// ─── ParticlePool class ──────────────────────────────────────────────

export class ParticlePool {

  /**
   * @param {number} [capacity] — max pool size (defaults to PARTICLES.MAX_COUNT)
   */
  constructor(capacity = MAX_POOL) {
    this.capacity = capacity;

    // ── SoA typed arrays ──────────────────────────────────────────
    this.px       = new Float32Array(capacity);   // position x
    this.py       = new Float32Array(capacity);   // position y
    this.vx       = new Float32Array(capacity);   // velocity x
    this.vy       = new Float32Array(capacity);   // velocity y
    this.age      = new Float32Array(capacity);   // age (seconds)
    this.lifespan = new Float32Array(capacity);   // total lifespan
    this.size     = new Float32Array(capacity);   // point render size
    this.speed    = new Float32Array(capacity);   // cached scalar speed

    // Boolean alive flag (1 = alive, 0 = dead)
    this.alive    = new Uint8Array(capacity);

    // ── Free list (stack) ──────────────────────────────────────────
    // Pre-filled with all indices in reverse order so index 0
    // is the first to be popped.
    this._freeList  = new Int32Array(capacity);
    this._freeTop   = capacity;   // points one above the last valid entry

    for (let i = 0; i < capacity; i++) {
      this._freeList[i] = capacity - 1 - i;
    }

    // ── Live index list ────────────────────────────────────────────
    // A packed array of currently alive indices, rebuilt each
    // time compactLiveList() is called (once per frame).
    //
    // The renderer and integrator iterate over this array to avoid
    // scanning the full capacity for dead particles.
    this._liveList  = new Int32Array(capacity);
    this._liveCount = 0;

    // Stats
    this.spawnCount = 0;
    this.killCount  = 0;

    // Seed for deterministic jitter
    this._rngSeed = 1;
  }

  // ─── Access helpers ───────────────────────────────────────────────

  /** Current number of alive particles. */
  get aliveCount() { return this._liveCount; }

  /** Available (dead) slot count. */
  get freeCount()  { return this._freeTop; }

  /** Int32Array view of alive indices, length = aliveCount. */
  get liveIndices() { return this._liveList; }

  // ─── Spawn a single particle ──────────────────────────────────────

  /**
   * Allocate one particle from the free list and initialise it.
   * Returns the index (≥ 0) or −1 if the pool is full.
   *
   * @param {number} x        — initial x (canvas px)
   * @param {number} y        — initial y (canvas px)
   * @param {number} [initVx] — initial velocity x (px/s)
   * @param {number} [initVy] — initial velocity y (px/s)
   * @returns {number}  index or -1
   */
  spawn(x, y, initVx = 0, initVy = 0) {
    if (this._freeTop === 0) return -1;   // pool full

    const idx = this._freeList[--this._freeTop];

    // Seed-based pseudo-random per particle
    const seed  = ++this._rngSeed;
    const r0    = mulberry32(seed);
    const r1    = mulberry32(seed + 77777);

    // Initialise attributes
    this.px[idx]       = x;
    this.py[idx]       = y;
    this.vx[idx]       = initVx + (r0 - 0.5) * PARTICLES.VELOCITY_JITTER;
    this.vy[idx]       = initVy + (r1 - 0.5) * PARTICLES.VELOCITY_JITTER;
    this.age[idx]      = 0;
    this.lifespan[idx] = lerp(
      PARTICLES.LIFESPAN_MIN,
      PARTICLES.LIFESPAN_MAX,
      mulberry32(seed + 12345)
    );
    this.size[idx]     = lerp(
      PARTICLES.SIZE_MIN,
      PARTICLES.SIZE_MAX,
      mulberry32(seed + 54321)
    );
    this.speed[idx]    = 0;
    this.alive[idx]    = 1;

    this.spawnCount++;
    return idx;
  }

  /**
   * Spawn a particle at a random position within a circle centred on (cx, cy).
   * Uses structured jitter seeded from the internal RNG.
   *
   * @param {number} cx      — centre x
   * @param {number} cy      — centre y
   * @param {number} minR    — inner spawn radius (px)
   * @param {number} maxR    — outer spawn radius (px)
   * @returns {number}       — particle index or −1
   */
  spawnInCircle(cx, cy, minR = PARTICLES.SPAWN_RADIUS_MIN, maxR = PARTICLES.SPAWN_RADIUS_MAX) {
    const seed   = ++this._rngSeed;
    const angle  = mulberry32(seed) * Math.PI * 2;
    const radius = lerp(minR, maxR, mulberry32(seed + 333));
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    return this.spawn(x, y, 0, 0);
  }

  /**
   * Spawn a particle at a uniformly random position within the canvas bounds.
   *
   * @param {number} w — canvas width
   * @param {number} h — canvas height
   * @returns {number}
   */
  spawnRandom(w, h) {
    const seed = ++this._rngSeed;
    const x = mulberry32(seed)       * w;
    const y = mulberry32(seed + 111) * h;
    return this.spawn(x, y, 0, 0);
  }

  // ─── Kill a particle ──────────────────────────────────────────────

  /**
   * Mark particle at `idx` as dead and return its slot to the free list.
   * @param {number} idx
   */
  kill(idx) {
    if (!this.alive[idx]) return;
    this.alive[idx]          = 0;
    this._freeList[this._freeTop++] = idx;
    this.killCount++;
  }

  // ─── Bulk operations ──────────────────────────────────────────────

  /**
   * Kill all particles and refill the free list.
   * O(capacity) — run only on reset.
   */
  reset() {
    this._freeTop = this.capacity;
    for (let i = 0; i < this.capacity; i++) {
      this.alive[i]    = 0;
      this._freeList[i] = this.capacity - 1 - i;
    }
    this._liveCount = 0;
    this.spawnCount = 0;
    this.killCount  = 0;
    this._rngSeed   = 1;
  }

  /**
   * Rebuild the packed live-index list by scanning `alive`.
   * Called once at the end of each frame update.
   * O(capacity) scan — acceptable because it's cache-friendly.
   */
  compactLiveList() {
    let n = 0;
    const alive = this.alive;
    const live  = this._liveList;
    const cap   = this.capacity;

    for (let i = 0; i < cap; i++) {
      if (alive[i]) live[n++] = i;
    }
    this._liveCount = n;
  }

  // ─── Spawn batch ──────────────────────────────────────────────────

  /**
   * Spawn up to `count` particles uniformly across the canvas.
   * Used on initial fill.
   *
   * @param {number} count
   * @param {number} w
   * @param {number} h
   * @returns {number}  — actual spawned count
   */
  fillRandom(count, w, h) {
    let n = 0;
    for (let i = 0; i < count; i++) {
      if (this.spawnRandom(w, h) === -1) break;
      n++;
    }
    this.compactLiveList();
    return n;
  }

  /**
   * Spawn up to `count` particles around rift centres.
   * If no rifts are provided falls back to uniform spawn.
   *
   * @param {number}   count
   * @param {number}   w
   * @param {number}   h
   * @param {Array}    rifts     — [{x, y}] attractor centres
   * @returns {number} actual spawned
   */
  spawnBatch(count, w, h, rifts) {
    let spawned = 0;
    if (!rifts || rifts.length === 0) {
      for (let i = 0; i < count; i++) {
        if (this.spawnRandom(w, h) < 0) break;
        spawned++;
      }
      return spawned;
    }

    const perRift = Math.ceil(count / rifts.length);
    for (let ri = 0; ri < rifts.length; ri++) {
      const r = rifts[ri];
      for (let i = 0; i < perRift; i++) {
        if (spawned >= count) break;
        if (this.spawnInCircle(r.x, r.y) < 0) break;
        spawned++;
      }
    }

    // Fill remainder uniformly if count not met
    while (spawned < count) {
      if (this.spawnRandom(w, h) < 0) break;
      spawned++;
    }
    return spawned;
  }

  // ─── Resize pool ──────────────────────────────────────────────────

  /**
   * Change the target live-particle count by killing surplus particles
   * or spawning extras at random positions.
   *
   * @param {number} targetCount — desired alive count
   * @param {number} w
   * @param {number} h
   */
  resize(targetCount, w, h) {
    const current = this._liveCount;
    const target  = Math.min(targetCount, this.capacity);

    if (current > target) {
      // Kill surpluses from the live list end
      let n = current;
      const live = this._liveList;
      while (n > target) {
        this.kill(live[--n]);
      }
    } else if (current < target) {
      const deficit = target - current;
      for (let i = 0; i < deficit; i++) {
        if (this.spawnRandom(w, h) < 0) break;
      }
    }
    this.compactLiveList();
  }

  // ─── Statistics ───────────────────────────────────────────────────

  /**
   * Return a plain stats object for the HUD.
   * @returns {{capacity:number, alive:number, free:number, spawned:number, killed:number}}
   */
  stats() {
    return {
      capacity: this.capacity,
      alive:    this._liveCount,
      free:     this._freeTop,
      spawned:  this.spawnCount,
      killed:   this.killCount,
    };
  }
}

// ─── Singleton instance ───────────────────────────────────────────────
export const particlePool = new ParticlePool(PARTICLES.MAX_COUNT);
