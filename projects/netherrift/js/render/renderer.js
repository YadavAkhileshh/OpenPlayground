/** NetherRift — Canvas Renderer
 * Dual-buffer: trail-fade + ImageData stamp + half-res glow composite.
 */

import { RENDER, PARTICLES, DEBUG }    from "../config.js";
import { clamp, lerp }               from "../utils/math.js";
import { samplePalette, buildPaletteLUT, buildDiscStamp } from "../utils/color.js";
import { particlePool }              from "../particles/pool.js";
import { integrator }                from "../particles/integrator.js";
import { curlField }                 from "../curl/curl.js";

// ─── Renderer ────────────────────────────────────────────────────────

export class Renderer {

  /**
   * @param {HTMLCanvasElement} canvas — the main #rift-canvas element
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext("2d", {
      alpha:       false,
      desynchronized: true,
      willReadFrequently: true,
    });

    // ── Glow offscreen buffer ────────────────────────────────────
    this._glowCanvas = document.createElement("canvas");
    this._glowCtx    = this._glowCanvas.getContext("2d", {
      alpha: true,
      willReadFrequently: false,
    });

    // ── Particle ImageData ───────────────────────────────────────
    // Allocated on first resize, then reused
    this._imgData  = null;    // ImageData
    this._imgBuf   = null;    // Uint8ClampedArray view into _imgData
    this._imgBuf32 = null;    // Uint32Array view (optional fast write path)

    // ── State ────────────────────────────────────────────────────
    this.width     = 1;
    this.height    = 1;
    this.dpr       = 1;

    this.glowEnabled   = RENDER.GLOW_ENABLED;
    this.trailEnabled  = true;
    this.trailAlpha    = RENDER.TRAIL_ALPHA;
    this.glowAlpha     = RENDER.GLOW_ALPHA;
    this.glowScale     = RENDER.GLOW_BUFFER_SCALE;

    this.currentPalette = "inferno";

    // Pre-built disc stamp for particle softness (radius 2)
    this._stamp = buildDiscStamp(2);

    // Scratch RGBA pixel for hot path
    this._pixelScratch = new Uint8Array(4);

    // Frame count for debug/perf
    this.frameCount = 0;
  }

  // ─── Resize ───────────────────────────────────────────────────────

  /**
   * Update canvas resolution to match the display size.
   * Must be called whenever the window is resized.
   *
   * @param {number} displayW — CSS pixels
   * @param {number} displayH — CSS pixels
   */
  resize(displayW, displayH) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.dpr    = dpr;
    this.width  = Math.round(displayW * dpr);
    this.height = Math.round(displayH * dpr);

    this.canvas.width  = this.width;
    this.canvas.height = this.height;

    // Scale context so logical coords match CSS pixels
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Glow buffer
    const gw = Math.round(displayW * this.glowScale);
    const gh = Math.round(displayH * this.glowScale);
    this._glowCanvas.width  = gw;
    this._glowCanvas.height = gh;

    // Allocate / reallocate ImageData
    this._imgData  = new ImageData(this.width, this.height);
    this._imgBuf   = this._imgData.data;

    // Clear to black
    this._clearImgBuf();
    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(0, 0, displayW, displayH);
  }

  // ─── Frame render ─────────────────────────────────────────────────

  /**
   * Render one frame.
   * @param {number} dt — seconds since last frame
   */
  render(dt) {
    this.frameCount++;

    const ctx    = this.ctx;
    const W      = this.canvas.width  / this.dpr;   // CSS px
    const H      = this.canvas.height / this.dpr;

    // ── 1. Trail fade ────────────────────────────────────────────
    if (this.trailEnabled) {
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = this.trailAlpha;
      ctx.fillStyle   = "#000000";
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    } else {
      ctx.clearRect(0, 0, W, H);
    }

    // ── 2. Write particles to ImageData ──────────────────────────
    this._clearImgBuf();
    this._renderParticlesToImageData();

    // ── 3. Push ImageData to screen (particle layer) ─────────────
    ctx.globalCompositeOperation = RENDER.PARTICLE_COMPOSITE;
    this.ctx.putImageData(this._imgData, 0, 0);
    ctx.globalCompositeOperation = "source-over";

    // ── 4. Glow pass ─────────────────────────────────────────────
    if (this.glowEnabled) {
      this._renderGlow(W, H);
    }

    // ── 5. Debug field lines ─────────────────────────────────────
    if (DEBUG.ENABLED && DEBUG.DRAW_FIELD_LINES) {
      this._debugFieldLines(ctx, W, H);
    }
  }

  // ─── ImageData particle rendering ────────────────────────────────

  /**
   * Iterate over all live particles and stamp their colour+alpha
   * into _imgBuf at their pixel position.
   * This is the hot inner loop — every nanosecond counts here.
   */
  _renderParticlesToImageData() {
    const pool     = particlePool;
    const intg     = integrator;
    const live     = pool.liveIndices;
    const n        = pool.aliveCount;
    const buf      = this._imgBuf;
    const W        = this.width;
    const H        = this.height;
    const scratch  = this._pixelScratch;
    const stamp    = this._stamp;
    const stampSz  = stamp.size;
    const stampAlp = stamp.alpha;
    const stampR   = (stampSz - 1) >> 1;   // radius
    const dpr      = this.dpr;

    for (let li = 0; li < n; li++) {
      const i = live[li];

      // Canvas pixel coords (apply dpr scaling)
      const cx = (pool.px[i] * dpr + 0.5) | 0;
      const cy = (pool.py[i] * dpr + 0.5) | 0;

      // Cull off-screen
      if (cx < 0 || cx >= W || cy < 0 || cy >= H) continue;

      // Age-based colour
      const tAge   = intg.normAge(i);
      const tSpeed = intg.normSpeed(i);
      const alpha  = intg.computeAlpha(i);

      samplePalette(tAge, scratch, 0);

      // Boost brightness by speed
      const speedBoost = 1 + tSpeed * 0.6;
      const r = Math.min(255, (scratch[0] * speedBoost) | 0);
      const g = Math.min(255, (scratch[1] * speedBoost) | 0);
      const b = Math.min(255, (scratch[2] * speedBoost) | 0);
      const a = (scratch[3] / 255) * alpha;

      // Stamp the soft disc
      const sz = Math.max(1, (pool.size[i] * dpr) | 0);

      if (sz <= 1) {
        // Single-pixel fast path
        const px4 = (cy * W + cx) * 4;
        _addPixel(buf, px4, r, g, b, a);
      } else {
        // Disc stamp (up to radius stampR)
        const effectR = Math.min(stampR, sz);
        for (let sy = -effectR; sy <= effectR; sy++) {
          const ry = cy + sy;
          if (ry < 0 || ry >= H) continue;
          for (let sx = -effectR; sx <= effectR; sx++) {
            const rx = cx + sx;
            if (rx < 0 || rx >= W) continue;
            const stampIdx  = (sy + stampR) * stampSz + (sx + stampR);
            const stampFade = stampAlp[stampIdx];
            if (stampFade < 0.01) continue;
            const px4 = (ry * W + rx) * 4;
            _addPixel(buf, px4, r, g, b, a * stampFade);
          }
        }
      }
    }
  }

  // ─── Glow pass ───────────────────────────────────────────────────

  /**
   * Downsample the main canvas into the glow buffer, blur it, then
   * composite back with screen blend.
   *
   * @param {number} W — CSS display width
   * @param {number} H — CSS display height
   */
  _renderGlow(W, H) {
    const gCtx = this._glowCtx;
    const gW   = this._glowCanvas.width;
    const gH   = this._glowCanvas.height;

    // Draw downscaled version of main canvas into glow buffer
    gCtx.clearRect(0, 0, gW, gH);
    gCtx.drawImage(this.canvas, 0, 0, gW, gH);

    // Blur in place using CSS filter (GPU-accelerated in browsers)
    const blurPx = RENDER.GLOW_BLUR_RADIUS * this.glowScale;
    gCtx.filter  = `blur(${blurPx}px)`;
    gCtx.drawImage(this._glowCanvas, 0, 0, gW, gH);
    gCtx.filter  = "none";

    // Second blur pass for softer glow
    if (RENDER.GLOW_PASSES >= 2) {
      gCtx.filter = `blur(${blurPx * 1.8}px)`;
      gCtx.drawImage(this._glowCanvas, 0, 0, gW, gH);
      gCtx.filter = "none";
    }

    // Composite glow onto main canvas (screen blend)
    const ctx = this.ctx;
    ctx.globalCompositeOperation = RENDER.GLOW_COMPOSITE;
    ctx.globalAlpha = this.glowAlpha;
    ctx.drawImage(this._glowCanvas, 0, 0, W, H);

    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
  }

  // ─── Debug: field lines ───────────────────────────────────────────

  /**
   * Draw curl field streamlines for debugging.
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} W @param {number} H
   */
  _debugFieldLines(ctx, W, H) {
    const step = DEBUG.FIELD_LINE_STEP;
    ctx.globalAlpha = 0.25;
    ctx.strokeStyle = "rgba(123,0,255,0.6)";
    ctx.lineWidth   = 0.5;

    for (let gx = step / 2; gx < W; gx += step) {
      for (let gy = step / 2; gy < H; gy += step) {
        const pts = curlField.traceStreamline(gx, gy, 30, 3);
        if (pts.length < 2) continue;
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let pi = 1; pi < pts.length; pi++) {
          ctx.lineTo(pts[pi][0], pts[pi][1]);
        }
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  // ─── Rift glow indicator ──────────────────────────────────────────

  /**
   * Draw a radial glow at each active rift position.
   * Called by the engine after normal render pass.
   *
   * @param {Array} rifts — [{x, y, strength, radius, age, maxAge}]
   */
  renderRiftIndicators(rifts) {
    if (!rifts || rifts.length === 0) return;

    const ctx = this.ctx;
    ctx.save();
    ctx.globalCompositeOperation = "screen";

    for (let ri = 0; ri < rifts.length; ri++) {
      const r       = rifts[ri];
      const ageFrac = clamp(1 - r.age / r.maxAge, 0, 1);
      const alpha   = ageFrac * 0.45;

      const grad = ctx.createRadialGradient(
        r.x, r.y, 0,
        r.x, r.y, r.radius * 0.6
      );
      grad.addColorStop(0,   `rgba(200, 100, 255, ${alpha})`);
      grad.addColorStop(0.4, `rgba(140,  0, 200, ${alpha * 0.5})`);
      grad.addColorStop(1,   `rgba(0,   0,   0, 0)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // ─── Utility ─────────────────────────────────────────────────────

  /** Fill ImageData buffer with transparent black. */
  _clearImgBuf() {
    if (!this._imgBuf) return;
    this._imgBuf.fill(0);
  }

  /**
   * Set the active colour palette.
   * @param {string} name
   */
  setPalette(name) {
    this.currentPalette = name;
    buildPaletteLUT(name);
  }

  /** @param {boolean} v */
  setGlow(v)   { this.glowEnabled  = v; }

  /** @param {boolean} v */
  setTrails(v) { this.trailEnabled = v; }

  /**
   * Get canvas centre in CSS pixel space.
   * @returns {{x:number, y:number}}
   */
  centre() {
    return {
      x: (this.canvas.width  / this.dpr) * 0.5,
      y: (this.canvas.height / this.dpr) * 0.5,
    };
  }
}

// ─── Additive pixel blending helper ─────────────────────────────────

/**
 * Additively blend (r,g,b) with alpha onto the ImageData buffer at byte offset px4.
 * Clamps to 255.
 *
 * @param {Uint8ClampedArray} buf
 * @param {number}            px4   — byte offset (= pixelIndex * 4)
 * @param {number}            r
 * @param {number}            g
 * @param {number}            b
 * @param {number}            a     — 0..1
 */
function _addPixel(buf, px4, r, g, b, a) {
  const ai = (a * 255 + 0.5) | 0;
  buf[px4    ] = Math.min(255, buf[px4    ] + ((r * a) | 0));
  buf[px4 + 1] = Math.min(255, buf[px4 + 1] + ((g * a) | 0));
  buf[px4 + 2] = Math.min(255, buf[px4 + 2] + ((b * a) | 0));
  // Alpha: keep the max of existing and new
  if (ai > buf[px4 + 3]) buf[px4 + 3] = ai;
}

// ─── Singleton renderer (initialised by engine.js) ──────────────────

/** @type {Renderer|null} */
export let renderer = null;

/**
 * Create and return the singleton Renderer.
 * @param {HTMLCanvasElement} canvas
 * @returns {Renderer}
 */
export function createRenderer(canvas) {
  renderer = new Renderer(canvas);
  return renderer;
}
