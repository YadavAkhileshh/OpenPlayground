/**
 * grid.js — WaveTank Grid State Management
 * Manages prev/curr wave height buffers, barrier mask, and depth map.
 * All buffers are flat Float32Array / Uint8Array for typed-array performance.
 */

export class Grid {
  /**
   * @param {number} width  - grid columns
   * @param {number} height - grid rows
   */
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.size = width * height;

    // Wave height double-buffer (float, range roughly -1 to 1)
    this.curr = new Float32Array(this.size);
    this.prev = new Float32Array(this.size);

    // Depth map: 0 = very shallow (slow wave), 255 = deep (fast wave)
    this.depth = new Uint8Array(this.size).fill(200);

    // Barrier mask: 1 = solid wall, 0 = open water
    this.barrier = new Uint8Array(this.size);
  }

  /** Inline index calculation */
  idx(x, y) {
    return y * this.width + x;
  }

  /**
   * Inject a disturbance at grid coordinates (x, y).
   * @param {number} x - grid column
   * @param {number} y - grid row
   * @param {number} amplitude - height to add (clamped later by wave stepper)
   * @param {number} radius - brush radius in cells
   */
  inject(x, y, amplitude, radius = 1) {
    const xi = Math.round(x);
    const yi = Math.round(y);
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx * dx + dy * dy > radius * radius) continue;
        const nx = xi + dx;
        const ny = yi + dy;
        if (nx < 0 || nx >= this.width || ny < 0 || ny >= this.height) continue;
        if (this.barrier[this.idx(nx, ny)]) continue;
        const falloff = 1 - Math.sqrt(dx * dx + dy * dy) / (radius + 1);
        this.curr[this.idx(nx, ny)] += amplitude * falloff;
      }
    }
  }

  /**
   * Paint a barrier at (x, y) with given brush radius.
   * @param {number} x
   * @param {number} y
   * @param {number} radius
   * @param {boolean} erase - if true, clear barrier
   */
  paintBarrier(x, y, radius = 1, erase = false) {
    const xi = Math.round(x);
    const yi = Math.round(y);
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx * dx + dy * dy > radius * radius) continue;
        const nx = xi + dx;
        const ny = yi + dy;
        if (nx < 0 || nx >= this.width || ny < 0 || ny >= this.height) continue;
        const i = this.idx(nx, ny);
        this.barrier[i] = erase ? 0 : 1;
        if (!erase) {
          this.curr[i] = 0;
          this.prev[i] = 0;
        }
      }
    }
  }

  /**
   * Paint depth at (x, y).
   * @param {number} x
   * @param {number} y
   * @param {number} depthValue - 0–255
   * @param {number} radius
   */
  paintDepth(x, y, depthValue, radius = 4) {
    const xi = Math.round(x);
    const yi = Math.round(y);
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx * dx + dy * dy > radius * radius) continue;
        const nx = xi + dx;
        const ny = yi + dy;
        if (nx < 0 || nx >= this.width || ny < 0 || ny >= this.height) continue;
        this.depth[this.idx(nx, ny)] = depthValue;
      }
    }
  }

  /** Clear all wave energy (preserve barriers and depth). */
  clearWaves() {
    this.curr.fill(0);
    this.prev.fill(0);
  }

  /** Full reset: clear everything including barriers and depth. */
  reset() {
    this.curr.fill(0);
    this.prev.fill(0);
    this.depth.fill(200);
    this.barrier.fill(0);
  }

  /** Swap curr ↔ prev in-place (zero allocation). */
  swap() {
    const tmp = this.prev;
    this.prev = this.curr;
    this.curr = tmp;
  }
}
