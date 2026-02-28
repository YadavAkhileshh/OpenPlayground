/** NetherRift — UI Controls
 * Wires HTML sliders and buttons to engine subsystems.
 */

import { PARTICLES, CURL, NOISE, UI } from "../config.js";
import { clamp }                      from "../utils/math.js";
import { buildPaletteLUT }            from "../utils/color.js";

export class UIControls {

  /**
   * @param {object} deps
   * @param {import("../particles/pool.js").ParticlePool}           deps.pool
   * @param {import("../particles/integrator.js").ParticleIntegrator} deps.integrator
   * @param {import("../curl/curl.js").CurlField}                   deps.curlField
   * @param {import("../render/renderer.js").Renderer}              deps.renderer
   * @param {object}                                                deps.engineState
   */
  constructor({ pool, integrator, curlField, renderer, engineState }) {
    this.pool        = pool;
    this.integrator  = integrator;
    this.curlField   = curlField;
    this.renderer    = renderer;
    this.state       = engineState;

    // Refs to DOM elements populated in _queryDOM
    this._els = {};
    this._ready = false;
  }

  // ─── Initialise ───────────────────────────────────────────────────

  /**
   * Query all DOM elements and attach listeners.
   * Must be called after DOMContentLoaded.
   */
  init() {
    this._queryDOM();
    this._attachListeners();
    this._syncAllToDOM();
    this._ready = true;
  }

  // ─── DOM query ────────────────────────────────────────────────────

  _queryDOM() {
    const $ = id => document.getElementById(id);
    this._els = {
      density:      { slider: $("slider-density"),      val: $("val-density") },
      curl:         { slider: $("slider-curl"),          val: $("val-curl") },
      noiseScale:   { slider: $("slider-noise-scale"),   val: $("val-noise-scale") },
      speed:        { slider: $("slider-speed"),         val: $("val-speed") },

      btnGlow:      $("btn-glow"),
      btnTrails:    $("btn-trails"),
      btnPause:     $("btn-pause"),
      btnReset:     $("btn-reset"),
      btnCollapse:  $("btn-collapse"),
      panelBody:    $("panel-body"),
      paletteRow:   $("palette-row"),
    };
  }

  // ─── Listeners ────────────────────────────────────────────────────

  _attachListeners() {
    const els = this._els;

    // ── Density ──────────────────────────────────────────────────
    this._slider(els.density, v => {
      const count = Math.round(v);
      const { canvasW, canvasH } = this.state;
      this.pool.resize(count, canvasW, canvasH);
      els.density.val.textContent = _fmtInt(count);
    });

    // ── Curl intensity ────────────────────────────────────────────
    this._slider(els.curl, v => {
      this.curlField.setIntensity(v);
      els.curl.val.textContent = v.toFixed(2);
    });

    // ── Noise scale ───────────────────────────────────────────────
    this._slider(els.noiseScale, v => {
      this.curlField.setNoiseScale(v);
      els.noiseScale.val.textContent = v.toFixed(4);
    });

    // ── Flow speed ────────────────────────────────────────────────
    this._slider(els.speed, v => {
      this.integrator.setFlowSpeed(v);
      els.speed.val.textContent = v.toFixed(2);
    });

    // ── Glow toggle ───────────────────────────────────────────────
    this._toggle(els.btnGlow, active => {
      this.renderer.setGlow(active);
    });

    // ── Trails toggle ─────────────────────────────────────────────
    this._toggle(els.btnTrails, active => {
      this.renderer.setTrails(active);
    });

    // ── Pause toggle ──────────────────────────────────────────────
    this._toggle(els.btnPause, active => {
      this.state.paused = active;
    });

    // ── Reset ─────────────────────────────────────────────────────
    els.btnReset.addEventListener("click", () => {
      const { canvasW, canvasH } = this.state;
      this.pool.reset();
      this.pool.fillRandom(
        parseInt(els.density.slider.value, 10),
        canvasW, canvasH
      );
      this.curlField.clearRifts();
    });

    // ── Collapse panel ────────────────────────────────────────────
    els.btnCollapse.addEventListener("click", () => {
      const body = els.panelBody;
      const collapsed = body.classList.toggle("collapsed");
      els.btnCollapse.textContent = collapsed ? "▸" : "◂";
    });

    // ── Palette selector ──────────────────────────────────────────
    const paletteBtns = els.paletteRow.querySelectorAll(".palette-btn");
    paletteBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        paletteBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const palName = btn.dataset.palette;
        this.renderer.setPalette(palName);
        document.body.dataset.palette = palName;
        this.state.palette = palName;
      });
    });
  }

  // ─── Sync state to DOM ────────────────────────────────────────────

  /**
   * Push current simulation state values back into the DOM controls.
   * Useful after programmatic state changes (e.g. keyboard shortcuts).
   */
  _syncAllToDOM() {
    const els = this._els;

    _setSlider(els.density.slider,    this.pool.aliveCount,
               parseInt(els.density.slider.min),
               parseInt(els.density.slider.max));
    els.density.val.textContent = _fmtInt(this.pool.aliveCount);

    _setSlider(els.curl.slider,       this.curlField.intensity,
               parseFloat(els.curl.slider.min),
               parseFloat(els.curl.slider.max));
    els.curl.val.textContent = this.curlField.intensity.toFixed(2);

    _setSlider(els.noiseScale.slider, this.curlField.noiseScale,
               parseFloat(els.noiseScale.slider.min),
               parseFloat(els.noiseScale.slider.max));
    els.noiseScale.val.textContent = this.curlField.noiseScale.toFixed(4);

    _setSlider(els.speed.slider,      this.integrator.flowSpeed,
               parseFloat(els.speed.slider.min),
               parseFloat(els.speed.slider.max));
    els.speed.val.textContent = this.integrator.flowSpeed.toFixed(2);
  }

  /**
   * Sync a single slider to a programmatic value.
   * @param {string} key — one of "density", "curl", "noiseScale", "speed"
   * @param {number} v
   */
  syncSlider(key, v) {
    if (!this._ready) return;
    const el = this._els[key];
    if (!el) return;
    _setSlider(el.slider, v, parseFloat(el.slider.min), parseFloat(el.slider.max));
  }

  // ─── Helpers ─────────────────────────────────────────────────────

  /**
   * Attach input + change listeners to a slider, calling `cb` with the value.
   * Also updates the CSS custom property --pct for the gradient track.
   */
  _slider({ slider, val }, cb) {
    if (!slider) return;
    const handler = () => {
      const v = parseFloat(slider.value);
      _updateSliderPct(slider);
      cb(v);
    };
    slider.addEventListener("input",  handler);
    slider.addEventListener("change", handler);
    _updateSliderPct(slider);
  }

  /**
   * Attach click listener to a toggle button, call cb(isActive).
   */
  _toggle(btn, cb) {
    if (!btn) return;
    btn.addEventListener("click", () => {
      const active = btn.classList.toggle("active");
      btn.setAttribute("aria-pressed", active);
      cb(active);
    });
  }
}

// ─── Private helpers ──────────────────────────────────────────────────

/**
 * Update the CSS --pct variable on a slider to drive the fill gradient.
 * @param {HTMLInputElement} slider
 */
function _updateSliderPct(slider) {
  const min = parseFloat(slider.min);
  const max = parseFloat(slider.max);
  const val = parseFloat(slider.value);
  const pct = ((val - min) / (max - min) * 100).toFixed(1) + "%";
  slider.style.setProperty("--pct", pct);
}

/**
 * Programmatically set a slider value and fire a synthetic input event.
 * @param {HTMLInputElement} slider
 * @param {number} v
 * @param {number} min
 * @param {number} max
 */
function _setSlider(slider, v, min, max) {
  if (!slider) return;
  slider.value = clamp(v, min, max);
  _updateSliderPct(slider);
}

/**
 * Format integer for HUD display (e.g. 50000 → "50 000").
 * @param {number} n
 * @returns {string}
 */
function _fmtInt(n) {
  return n.toLocaleString("en-US").replace(/,/g, " ");
}
