/** NetherRift — Performance Monitor
 * Rolling FPS history, HUD readout, mini FPS graph, adaptive quality.
 */

import { UI, ENGINE }  from "../config.js";
import { average }     from "../utils/math.js";

// ─── PerfMonitor ─────────────────────────────────────────────────────

export class PerfMonitor {

  /**
   * @param {object} [opts]
   * @param {number} [opts.historySize] — rolling sample count
   */
  constructor(opts = {}) {
    this._histSize  = opts.historySize ?? UI.FPS_GRAPH_SAMPLES;

    // Timing history
    this._msHistory  = new Float32Array(this._histSize);
    this._fpsHistory = new Float32Array(this._histSize);
    this._histIdx    = 0;

    // Last frame timestamp
    this._lastTime   = performance.now();

    // Rolling stats
    this.currentFPS  = 0;
    this.currentMS   = 0;
    this.avgFPS      = 0;
    this.minFPS      = Infinity;
    this.maxFPS      = 0;

    // Frame counter
    this.frameCount  = 0;

    // HUD DOM elements
    this._hudFPS      = null;
    this._hudMS       = null;
    this._hudParticles = null;
    this._hudAlive    = null;

    // Mini graph canvas
    this._graphCanvas = null;
    this._graphCtx    = null;

    // HUD refresh rate throttle (update every N frames to reduce DOM writes)
    this._hudUpdateInterval = 6;

    // Adaptive quality
    this._qualityCallback  = null;
    this._qualityCheckEvery = ENGINE.QUALITY_CHECK_EVERY;
    this._qualityCooldown  = 0;    // frames until next quality check

    // Idle opacity auto-dim
    this._hudEl = null;
    this._idleTimer = 0;
  }

  // ─── Initialise ───────────────────────────────────────────────────

  /**
   * Bind to DOM elements.
   * @param {object} [opts]
   * @param {Function} [opts.onQualityStep] — cb(delta: number) called on quality change
   */
  init(opts = {}) {
    this._hudFPS       = document.getElementById("hud-fps");
    this._hudMS        = document.getElementById("hud-ms");
    this._hudParticles = document.getElementById("hud-particles");
    this._hudAlive     = document.getElementById("hud-alive");
    this._hudEl        = document.getElementById("perf-hud");

    this._graphCanvas  = document.getElementById("fps-graph");
    if (this._graphCanvas) {
      this._graphCtx = this._graphCanvas.getContext("2d");
    }

    if (opts.onQualityStep) {
      this._qualityCallback = opts.onQualityStep;
    }
  }

  // ─── Per-frame tick ───────────────────────────────────────────────

  /**
   * Call once at the very start of each rAF callback, before sim work.
   * @returns {number} dt — frame time in seconds
   */
  beginFrame() {
    const now = performance.now();
    const ms  = now - this._lastTime;
    this._lastTime = now;
    this.frameCount++;

    // Store in rolling buffer
    const idx = this._histIdx % this._histSize;
    this._msHistory[idx]  = ms;
    this._fpsHistory[idx] = ms > 0 ? 1000 / ms : 0;
    this._histIdx++;

    // Update stats
    this.currentMS  = ms;
    this.currentFPS = ms > 0 ? 1000 / ms : 0;

    // Compute rolling average over last _histSize frames
    const filled = Math.min(this._histIdx, this._histSize);
    let sumFPS = 0;
    let minF = Infinity, maxF = 0;
    for (let i = 0; i < filled; i++) {
      const f = this._fpsHistory[i];
      sumFPS += f;
      if (f < minF) minF = f;
      if (f > maxF) maxF = f;
    }
    this.avgFPS = filled > 0 ? sumFPS / filled : 0;
    this.minFPS = isFinite(minF) ? minF : 0;
    this.maxFPS = maxF;

    return ms / 1000;   // seconds
  }

  /**
   * Call once at the end of each frame with simulation stats.
   * @param {number} poolCapacity — total pool size
   * @param {number} aliveCount   — live particles this frame
   */
  endFrame(poolCapacity, aliveCount) {
    // Throttled HUD update
    if (this.frameCount % this._hudUpdateInterval === 0) {
      this._updateHUD(poolCapacity, aliveCount);
      this._drawGraph();
    }

    // Adaptive quality
    if (this._qualityCallback && this._qualityCooldown <= 0) {
      this._checkQuality();
      this._qualityCooldown = this._qualityCheckEvery;
    }
    if (this._qualityCooldown > 0) this._qualityCooldown--;

    // Auto-dim HUD when idle
    this._idleTimer++;
    if (this._idleTimer > 180 && this._hudEl) {
      this._hudEl.style.opacity = UI.HUD_IDLE_OPACITY;
    }
  }

  // ─── HUD refresh ──────────────────────────────────────────────────

  _updateHUD(capacity, alive) {
    if (this._hudFPS) {
      this._hudFPS.textContent = this.currentFPS.toFixed(0);
      // Colour code FPS
      const f = this.currentFPS;
      this._hudFPS.style.color =
        f >= 55 ? "#00ffaa" :
        f >= 40 ? "#ffcc00" :
                  "#ff4444";
    }
    if (this._hudMS) {
      this._hudMS.textContent = this.currentMS.toFixed(1);
    }
    if (this._hudParticles) {
      this._hudParticles.textContent = _fmtK(capacity);
    }
    if (this._hudAlive) {
      this._hudAlive.textContent = _fmtK(alive);
    }
  }

  // ─── Mini graph ───────────────────────────────────────────────────

  _drawGraph() {
    const ctx = this._graphCtx;
    if (!ctx) return;

    const W   = this._graphCanvas.width;
    const H   = this._graphCanvas.height;
    const his = this._fpsHistory;
    const n   = this._histSize;
    const TARGET = ENGINE.TARGET_FPS;

    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = "rgba(0,0,0,0.0)";
    ctx.fillRect(0, 0, W, H);

    // Target FPS line
    const targetY = H - (TARGET / (TARGET * 1.2)) * H;
    ctx.strokeStyle = "rgba(123,0,255,0.25)";
    ctx.lineWidth   = 0.8;
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(0, targetY);
    ctx.lineTo(W, targetY);
    ctx.stroke();
    ctx.setLineDash([]);

    // FPS graph bars
    const startIdx = this._histIdx;
    for (let i = 0; i < n; i++) {
      const fi  = (startIdx + i) % n;
      const fps = his[fi];
      const x   = (i / n) * W;
      const bW  = W / n + 0.5;
      const h   = Math.min((fps / (TARGET * 1.2)) * H, H);

      const t = fps / TARGET;
      const r = Math.round(t < 0.5 ? 255 : lerp255(255, 0,   (t - 0.5) * 2));
      const g = Math.round(t < 0.5 ? lerp255(0, 230, t * 2) : lerp255(230, 180, (t - 0.5) * 2));
      const b = 0;

      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x, H - h, bW, h);
    }

    // Current FPS text
    ctx.fillStyle = "rgba(200,180,255,0.60)";
    ctx.font      = "8px monospace";
    ctx.fillText("avg " + this.avgFPS.toFixed(0), 3, H - 3);
  }

  // ─── Adaptive quality ────────────────────────────────────────────

  _checkQuality() {
    if (!ENGINE.ADAPTIVE_QUALITY) return;
    const fps = this.avgFPS;
    if (fps < ENGINE.QUALITY_FPS_LOW) {
      this._qualityCallback(-ENGINE.QUALITY_STEP);
    } else if (fps > ENGINE.QUALITY_FPS_HIGH) {
      this._qualityCallback(+ENGINE.QUALITY_STEP);
    }
  }

  // ─── Mouse-over to restore opacity ───────────────────────────────

  resetIdleTimer() {
    this._idleTimer = 0;
    if (this._hudEl) this._hudEl.style.opacity = "1";
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────

function _fmtK(n) {
  if (n >= 1000) return (n / 1000).toFixed(0) + "k";
  return String(n);
}

function lerp255(a, b, t) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

// ─── Singleton ───────────────────────────────────────────────────────
export const perfMonitor = new PerfMonitor();
