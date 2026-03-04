/**
 * NetherRift — Core Engine
 * Boot sequence, main rAF loop, and subsystem wiring.
 */

import { PARTICLES, ENGINE, UI, NOISE, DEBUG, DEFAULT_PALETTE } from "../config.js";
import { selfTest }          from "../noise/simplex.js";
import { curlField }         from "../curl/curl.js";
import { particlePool }      from "../particles/pool.js";
import { integrator }        from "../particles/integrator.js";
import { createRenderer }    from "../render/renderer.js";
import { createInputSystem } from "../input/input.js";
import { UIControls }        from "../ui/controls.js";
import { perfMonitor }       from "../ui/perf.js";

//  Module-level singletons set during init 
let _renderer = null;
let _input    = null;

//  Loading UI helpers 
const $load   = () => document.getElementById("loading-screen");
const $bar    = () => document.getElementById("loading-bar");
const $status = () => document.getElementById("loading-status");

function setLoadingProgress(pct, msg) {
  const b = $bar(),   s = $status();
  if (b) b.style.width    = pct + "%";
  if (s) s.textContent    = msg;
}

//  Engine state 
const engineState = {
  paused:      false,
  canvasW:     window.innerWidth,
  canvasH:     window.innerHeight,
  palette:     DEFAULT_PALETTE,
  targetCount: PARTICLES.DEFAULT_COUNT,
};

//  Boot 
async function init() {
  setLoadingProgress(10, "Initialising renderer");
  await _nextFrame();

  const canvas  = document.getElementById("rift-canvas");
  const tearSVG = document.getElementById("rift-tear-svg");

  _renderer = createRenderer(canvas);
  _renderer.resize(window.innerWidth, window.innerHeight);

  setLoadingProgress(25, "Running noise self-test");
  await _nextFrame();

  const test = selfTest();
  if (!test.ok) console.warn("[NetherRift] Noise self-test WARN:", test.samples);

  setLoadingProgress(35, "Building colour LUT");
  _renderer.setPalette(DEFAULT_PALETTE);
  document.body.dataset.palette = DEFAULT_PALETTE;

  setLoadingProgress(48, "Filling particle pool");
  await _nextFrame();

  const filled = particlePool.fillRandom(
    PARTICLES.DEFAULT_COUNT, window.innerWidth, window.innerHeight
  );
  console.info(`[NetherRift] Spawned ${filled.toLocaleString()} particles.`);

  setLoadingProgress(60, "Configuring integrator");
  integrator.setCanvas(window.innerWidth, window.innerHeight);

  setLoadingProgress(72, "Attaching input system");
  _input = createInputSystem(canvas, tearSVG);
  _input.attach();

  _input.addEventListener("zoom", e => {
    curlField.setNoiseScale(NOISE.SCALE * (1 / e.detail.zoom));
  });
  _input.addEventListener("pause",  () => { engineState.paused = !engineState.paused; _syncPauseBtn(); });
  _input.addEventListener("reset",  () => _resetSim());
  _input.addEventListener("resize", e => _onResize(e.detail.w, e.detail.h));
  _input.addEventListener("toggleGlow",   () => { _renderer.glowEnabled  = !_renderer.glowEnabled; });
  _input.addEventListener("toggleTrails", () => { _renderer.trailEnabled = !_renderer.trailEnabled; });
  _input.addEventListener("nudgeDensity", e => {
    engineState.targetCount = Math.max(
      PARTICLES.MIN_COUNT,
      Math.min(PARTICLES.MAX_COUNT, engineState.targetCount + e.detail)
    );
    particlePool.resize(engineState.targetCount, engineState.canvasW, engineState.canvasH);
  });

  setLoadingProgress(84, "Wiring UI controls");
  const controls = new UIControls({ pool: particlePool, integrator, curlField, renderer: _renderer, engineState });
  controls.init();

  setLoadingProgress(92, "Starting performance monitor");
  perfMonitor.init({
    onQualityStep: delta => {
      engineState.targetCount = Math.max(
        PARTICLES.MIN_COUNT,
        Math.min(PARTICLES.MAX_COUNT, engineState.targetCount + delta)
      );
      particlePool.resize(engineState.targetCount, engineState.canvasW, engineState.canvasH);
    },
  });

  canvas.addEventListener("mousemove", () => perfMonitor.resetIdleTimer(), { passive: true });
  window.addEventListener("resize",    () => _onResize(window.innerWidth, window.innerHeight));

  setLoadingProgress(100, "Entering the rift");
  await _wait(UI.LOADING_LINGER_MS);

  const ls = $load(); if (ls) ls.classList.add("hidden");

  console.info("[NetherRift] Engine ready — starting rAF loop.");
  requestAnimationFrame(loop);
}

//  Main rAF loop 
function loop() {
  const dt = perfMonitor.beginFrame();

  if (!engineState.paused) {
    curlField.tick(dt);
    integrator.setRifts(curlField.getRifts());
    integrator.tick(dt, engineState.canvasW, engineState.canvasH);
  }

  if (_renderer) {
    _renderer.render(dt);
    _renderer.renderRiftIndicators(curlField.getRifts());
  }

  if (_input) _input.tickTearFade(dt);

  perfMonitor.endFrame(particlePool.capacity, particlePool.aliveCount);
  requestAnimationFrame(loop);
}

//  Helpers 
function _syncPauseBtn() {
  const btn = document.getElementById("btn-pause");
  if (!btn) return;
  btn.classList.toggle("active", engineState.paused);
  btn.setAttribute("aria-pressed", engineState.paused);
}

function _resetSim() {
  const { canvasW, canvasH, targetCount } = engineState;
  particlePool.reset();
  particlePool.fillRandom(targetCount, canvasW, canvasH);
  curlField.clearRifts();
}

function _onResize(w, h) {
  engineState.canvasW = w; engineState.canvasH = h;
  if (_renderer) _renderer.resize(w, h);
  integrator.setCanvas(w, h);
}

const _nextFrame = () => new Promise(r => requestAnimationFrame(r));
const _wait      = ms => new Promise(r => setTimeout(r, ms));

//  Bootstrap 
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else { init(); }

window.addEventListener("error", ev =>
  console.error("[NetherRift] Uncaught error:", ev.message, ev.filename, ev.lineno));
window.addEventListener("unhandledrejection", ev =>
  console.error("[NetherRift] Unhandled rejection:", ev.reason));

if (DEBUG.ENABLED) {
  window.NR = { particlePool, integrator, curlField, perfMonitor, engineState, selfTest };
  console.info("[NetherRift] Debug mode: window.NR exposed.");
}
