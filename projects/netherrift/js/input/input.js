/** NetherRift — Gesture Input System
 * Pointer/touch drag → rift attractors, wheel/pinch zoom, keyboard shortcuts.
 * Emits: "rift", "zoom", "pause", "reset", "resize", "toggleGlow",
 *        "toggleTrails", "nudgeDensity" via EventTarget.
 */

import { INPUT, CURL, ENGINE } from "../config.js";
import { dist2, lerp, clamp }  from "../utils/math.js";
import { curlField }           from "../curl/curl.js";

// ─── InputSystem ─────────────────────────────────────────────────────

export class InputSystem extends EventTarget {

  /**
   * @param {HTMLCanvasElement} canvas  — main simulation canvas
   * @param {SVGElement}        tearSVG — #rift-tear-svg overlay
   */
  constructor(canvas, tearSVG) {
    super();

    this.canvas  = canvas;
    this.tearSVG = tearSVG;
    this.tearGroup = tearSVG ? tearSVG.querySelector("#tear-group") : null;

    // ── State ───────────────────────────────────────────────────
    this._isDragging   = false;
    this._dragStartX   = 0;
    this._dragStartY   = 0;
    this._dragCurrX    = 0;
    this._dragCurrY    = 0;
    this._dragPath     = [];          // [{x, y}] drag point history
    this._dragDist     = 0;           // accumulated drag distance
    this._lastRiftPt   = null;        // last point where a rift was emitted

    // Pinch tracking
    this._pinchDist    = 0;
    this._pinchActive  = false;

    // Zoom
    this.zoom          = 1.0;
    this._zoomMin      = 0.25;
    this._zoomMax      = 4.00;

    // Cursor ring element (injected into DOM if absent)
    this._cursorRing   = null;

    // Tear SVG paths currently rendered
    this._tearPaths    = [];
    this._tearPathMaxAge = INPUT.RIFT_DECAY_FRAMES;
    this._tearPathAges   = [];

    this._boundHandlers = {};
    this._attached  = false;
  }

  // ─── Attach / Detach ──────────────────────────────────────────────

  /**
   * Attach all event listeners to the canvas and window.
   */
  attach() {
    if (this._attached) return;
    this._attached = true;

    const c = this.canvas;

    // Pointer events (covers mouse + touch + pen)
    this._on(c, "pointerdown",  this._onPointerDown.bind(this));
    this._on(c, "pointermove",  this._onPointerMove.bind(this));
    this._on(c, "pointerup",    this._onPointerUp.bind(this));
    this._on(c, "pointerleave", this._onPointerUp.bind(this));
    this._on(c, "pointercancel",this._onPointerUp.bind(this));

    // Wheel
    this._on(c, "wheel",        this._onWheel.bind(this), { passive: false });

    // Touch (for pinch)
    this._on(c, "touchstart",   this._onTouchStart.bind(this), { passive: true });
    this._on(c, "touchmove",    this._onTouchMove.bind(this),  { passive: true });
    this._on(c, "touchend",     this._onTouchEnd.bind(this),   { passive: true });

    // Keyboard
    this._on(window, "keydown", this._onKeyDown.bind(this));

    // Cursor ring
    this._initCursorRing();
    this._on(c, "mousemove", this._onMouseMoveForCursor.bind(this));

    // Resize
    this._on(window, "resize", this._onResize.bind(this));
  }

  /**
   * Remove all listeners.
   */
  detach() {
    for (const [target, type, handler, opts] of Object.values(this._boundHandlers)) {
      target.removeEventListener(type, handler, opts);
    }
    this._boundHandlers = {};
    this._attached = false;
  }

  // ─── Pointer events ───────────────────────────────────────────────

  _onPointerDown(e) {
    if (e.button !== 0 && e.pointerType === "mouse") return;

    this.canvas.setPointerCapture(e.pointerId);
    this._isDragging  = true;
    const [x, y]      = this._eventToCanvas(e);
    this._dragStartX  = x;
    this._dragStartY  = y;
    this._dragCurrX   = x;
    this._dragCurrY   = y;
    this._dragPath    = [{ x, y }];
    this._dragDist    = 0;
    this._lastRiftPt  = { x, y };

    if (this._cursorRing) this._cursorRing.classList.add("dragging");

    // Emit initial rift at click position
    this._emitRift(x, y, CURL.RIFT_STRENGTH, CURL.RIFT_RADIUS);
  }

  _onPointerMove(e) {
    const [x, y] = this._eventToCanvas(e);

    // Update cursor ring
    if (this._cursorRing) {
      this._cursorRing.style.left = x + "px";
      this._cursorRing.style.top  = y + "px";
    }

    if (!this._isDragging) return;

    this._dragCurrX = x;
    this._dragCurrY = y;

    // Accumulate distance since last rift emit
    if (this._lastRiftPt) {
      const d = dist2(this._lastRiftPt.x, this._lastRiftPt.y, x, y);
      if (d >= INPUT.MIN_DRAG_PX) {
        this._dragPath.push({ x, y });
        this._dragDist += d;

        // Emit rift — strength scales with drag speed
        const speed   = clamp(d / 16, 0.4, 2.5);
        const str     = CURL.RIFT_STRENGTH * speed;
        this._emitRift(x, y, str, CURL.RIFT_RADIUS);
        this._lastRiftPt = { x, y };

        // Update SVG tear path
        this._updateTearSVG();
      }
    }
  }

  _onPointerUp(e) {
    if (!this._isDragging) return;
    this._isDragging = false;
    this.canvas.releasePointerCapture?.(e.pointerId);

    if (this._cursorRing) this._cursorRing.classList.remove("dragging");

    // Schedule SVG path fade
    if (this._tearPaths.length > 0) {
      this._tearPathAges.push(0);
    }

    this._dragPath.length = 0;
  }

  // ─── Wheel ────────────────────────────────────────────────────────

  _onWheel(e) {
    e.preventDefault();

    const delta = e.deltaY * INPUT.SCROLL_SENSITIVITY;
    this.zoom   = clamp(this.zoom + delta, this._zoomMin, this._zoomMax);

    this.dispatchEvent(new CustomEvent("zoom", {
      detail: { zoom: this.zoom, delta },
    }));
  }

  // ─── Touch (pinch zoom) ───────────────────────────────────────────

  _onTouchStart(e) {
    if (e.touches.length === 2) {
      this._pinchActive = true;
      this._pinchDist   = this._touchDist(e.touches);
    }
  }

  _onTouchMove(e) {
    if (!this._pinchActive || e.touches.length !== 2) return;
    const newDist = this._touchDist(e.touches);
    const ratio   = newDist / (this._pinchDist || 1);
    this._pinchDist = newDist;

    const delta = (ratio - 1) * INPUT.PINCH_SENSITIVITY * 20;
    this.zoom   = clamp(this.zoom + delta, this._zoomMin, this._zoomMax);
    this.dispatchEvent(new CustomEvent("zoom", { detail: { zoom: this.zoom } }));
  }

  _onTouchEnd() {
    this._pinchActive = false;
  }

  _touchDist(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // ─── Keyboard ─────────────────────────────────────────────────────

  _onKeyDown(e) {
    switch (e.key) {
      case " ":
        e.preventDefault();
        this.dispatchEvent(new CustomEvent("pause"));
        break;
      case "r":
      case "R":
        this.dispatchEvent(new CustomEvent("reset"));
        break;
      case "g":
      case "G":
        this.dispatchEvent(new CustomEvent("toggleGlow"));
        break;
      case "t":
      case "T":
        this.dispatchEvent(new CustomEvent("toggleTrails"));
        break;
      case "ArrowUp":
        e.preventDefault();
        this.dispatchEvent(new CustomEvent("nudgeDensity", { detail: +5000 }));
        break;
      case "ArrowDown":
        e.preventDefault();
        this.dispatchEvent(new CustomEvent("nudgeDensity", { detail: -5000 }));
        break;
    }
  }

  // ─── Resize ───────────────────────────────────────────────────────

  _onResize() {
    this.dispatchEvent(new CustomEvent("resize", {
      detail: {
        w: window.innerWidth,
        h: window.innerHeight,
      },
    }));
  }

  // ─── Cursor ring ──────────────────────────────────────────────────

  _initCursorRing() {
    let ring = document.getElementById("cursor-ring");
    if (!ring) {
      ring = document.createElement("div");
      ring.id = "cursor-ring";
      document.body.appendChild(ring);
    }
    this._cursorRing = ring;
  }

  _onMouseMoveForCursor(e) {
    if (this._cursorRing) {
      this._cursorRing.style.left = e.clientX + "px";
      this._cursorRing.style.top  = e.clientY + "px";
    }
  }

  // ─── SVG Tear overlay ────────────────────────────────────────────

  /**
   * Regenerate the SVG crack path from the current drag path.
   */
  _updateTearSVG() {
    if (!this.tearGroup || this._dragPath.length < 2) return;

    const pts = this._dragPath;

    // Build SVG path string
    let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 1; i < pts.length; i++) {
      // Jagged crack: add perpendicular jitter
      const jitter = (Math.random() - 0.5) * 8;
      const dx = pts[i].x - pts[i-1].x;
      const dy = pts[i].y - pts[i-1].y;
      const len = Math.sqrt(dx * dx + dy * dy) + 1e-6;
      const nx = -dy / len, ny = dx / len;     // perpendicular normal
      const mx = (pts[i-1].x + pts[i].x) / 2 + nx * jitter;
      const my = (pts[i-1].y + pts[i].y) / 2 + ny * jitter;
      d += ` Q ${mx.toFixed(1)} ${my.toFixed(1)} ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)}`;
    }

    // Reuse or create path element
    let pathEl = this.tearGroup.querySelector("path.active-tear");
    if (!pathEl) {
      pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
      pathEl.classList.add("active-tear");
      pathEl.setAttribute("stroke", "rgba(180,80,255,0.70)");
      pathEl.setAttribute("stroke-width", "2.5");
      pathEl.setAttribute("fill", "none");
      pathEl.setAttribute("stroke-linecap", "round");
      this.tearGroup.appendChild(pathEl);
    }
    pathEl.setAttribute("d", d);

    // Glow duplicate (wider, lower opacity)
    let glowEl = this.tearGroup.querySelector("path.active-tear-glow");
    if (!glowEl) {
      glowEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
      glowEl.classList.add("active-tear-glow");
      glowEl.setAttribute("stroke", "rgba(255,40,180,0.22)");
      glowEl.setAttribute("stroke-width", "8");
      glowEl.setAttribute("fill", "none");
      glowEl.setAttribute("stroke-linecap", "round");
      this.tearGroup.insertBefore(glowEl, pathEl);
    }
    glowEl.setAttribute("d", d);
  }

  /**
   * Fade and remove old tear paths.
   * Called each frame by the engine.
   * @param {number} dt — seconds
   */
  tickTearFade(dt) {
    if (!this.tearGroup) return;

    // Fade active tear after pointer-up
    if (!this._isDragging) {
      const paths = this.tearGroup.querySelectorAll("path");
      paths.forEach(p => {
        const op = parseFloat(p.getAttribute("stroke-opacity") || "1");
        const newOp = op - dt * 0.8;
        if (newOp <= 0) {
          p.remove();
        } else {
          p.setAttribute("stroke-opacity", newOp.toFixed(3));
        }
      });
    }
  }

  // ─── Rift emitter ─────────────────────────────────────────────────

  /**
   * Create a rift attractor in the curl field and dispatch event.
   * @param {number} x @param {number} y
   * @param {number} strength @param {number} radius
   */
  _emitRift(x, y, strength, radius) {
    const maxAgeSec = INPUT.RIFT_DECAY_FRAMES / 60;
    curlField.addRiftSync(x, y, strength, radius, maxAgeSec);

    this.dispatchEvent(new CustomEvent("rift", {
      detail: { x, y, strength, radius },
    }));
  }

  // ─── Helpers ─────────────────────────────────────────────────────

  /**
   * Convert a pointer/mouse event to canvas CSS-pixel coordinates.
   * @param {PointerEvent|MouseEvent} e
   * @returns {[number, number]}
   */
  _eventToCanvas(e) {
    const rect = this.canvas.getBoundingClientRect();
    return [
      e.clientX - rect.left,
      e.clientY - rect.top,
    ];
  }

  /**
   * Store event listener reference so we can remove it on detach().
   */
  _on(target, type, handler, opts) {
    target.addEventListener(type, handler, opts);
    const key = `${type}_${Math.random()}`;
    this._boundHandlers[key] = [target, type, handler, opts];
  }

  /** Return the current rift list from the curl field. */
  getRifts() {
    return curlField.getRifts();
  }
}

// ─── Singleton (created by engine.js) ───────────────────────────────
/** @type {InputSystem|null} */
export let inputSystem = null;

/**
 * Create and return the singleton InputSystem.
 * @param {HTMLCanvasElement} canvas
 * @param {SVGElement} svg
 * @returns {InputSystem}
 */
export function createInputSystem(canvas, svg) {
  inputSystem = new InputSystem(canvas, svg);
  return inputSystem;
}
