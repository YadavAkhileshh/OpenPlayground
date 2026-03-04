/**
 * main.js — WaveTank Application Entry Point
 * Orchestrates the simulation loop, event handling, and module coordination.
 */

import { Grid } from './core/grid.js';
import { WaveStepper } from './core/wave.js';
import { Renderer } from './render/renderer.js';
import { Controls } from './ui/controls.js';
import { Toolbar, TOOLS } from './ui/toolbar.js';

// ── Configuration ─────────────────────────────────────────────────────────────

const GRID_SIZE = 256;  // default grid resolution (square)
const STEPS_PER_FRAME = 3;   // wave steps per animation frame for speed

// ── State ─────────────────────────────────────────────────────────────────────

let grid, stepper, renderer, controls, toolbar;
let canvas, ctx;
let isPointerDown = false;
let lastPointerCell = null;
let frameCount = 0;
let animId = null;
let stepsPerFrame = STEPS_PER_FRAME;

// ── Initialisation ────────────────────────────────────────────────────────────

function init() {
    canvas = document.getElementById('wave-canvas');

    grid = new Grid(GRID_SIZE, GRID_SIZE);
    stepper = new WaveStepper(grid);
    renderer = new Renderer(canvas, grid);
    controls = new Controls();
    toolbar = new Toolbar();

    resizeCanvas();
    controls.bind();
    toolbar.bind();

    // Canvas interaction
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointerleave', onPointerUp);

    // Prevent context menu on right-click
    canvas.addEventListener('contextmenu', e => e.preventDefault());

    // Top buttons
    document.getElementById('btn-clear')?.addEventListener('click', () => grid.clearWaves());
    document.getElementById('btn-reset')?.addEventListener('click', () => { grid.reset(); });

    // Grid resolution selector
    const resSel = document.getElementById('resolution-select');
    if (resSel) {
        resSel.addEventListener('change', () => {
            const newSize = parseInt(resSel.value);
            grid = new Grid(newSize, newSize);
            stepper = new WaveStepper(grid, { damping: controls.damping });
            renderer = new Renderer(canvas, grid);
        });
    }

    // Steps per frame slider
    const spfSl = document.getElementById('speed-slider');
    if (spfSl) {
        spfSl.addEventListener('input', () => {
            stepsPerFrame = parseInt(spfSl.value);
            const out = document.getElementById('speed-val');
            if (out) out.textContent = `×${stepsPerFrame}`;
        });
    }

    window.addEventListener('resize', resizeCanvas);

    loop();
}

// ── Resize ────────────────────────────────────────────────────────────────────

function resizeCanvas() {
    const container = canvas.parentElement;
    const side = Math.min(container.clientWidth, container.clientHeight);
    canvas.width = side;
    canvas.height = side;
}

// ── Main Loop ─────────────────────────────────────────────────────────────────

function loop() {
    frameCount++;

    // Sync controls → stepper
    stepper.damping = controls.damping;
    renderer.setColorMap(controls.colorMap);
    renderer.setShowDepth(controls.showDepth);

    // Auto-pulse
    if (controls.autoPulse && frameCount % Math.max(1, Math.round(60 / controls.pulseRate)) === 0) {
        const cx = Math.floor(grid.width / 2);
        const cy = Math.floor(grid.height / 2);
        grid.inject(cx, cy, controls.amplitude * 1.5, controls.brushRadius);
    }

    // Step the wave equation
    for (let s = 0; s < stepsPerFrame; s++) {
        stepper.step();
    }

    renderer.render();

    // Update stats
    updateStats();

    animId = requestAnimationFrame(loop);
}

// ── Stats HUD ─────────────────────────────────────────────────────────────────

let _lastStatTime = performance.now();
let _fps = 60;

function updateStats() {
    const now = performance.now();
    const dt = now - _lastStatTime;
    _lastStatTime = now;
    _fps = _fps * 0.9 + (1000 / dt) * 0.1; // EWMA smoothing

    const fpsEl = document.getElementById('stat-fps');
    if (fpsEl) fpsEl.textContent = `${Math.round(_fps)} fps`;

    const toolEl = document.getElementById('stat-tool');
    if (toolEl) toolEl.textContent = toolbar.tool;
}

// ── Pointer Interaction ────────────────────────────────────────────────────────

function canvasToGrid(e) {
    const rect = canvas.getBoundingClientRect();
    const cx = (e.clientX - rect.left) / rect.width * grid.width;
    const cy = (e.clientY - rect.top) / rect.height * grid.height;
    return { x: Math.floor(cx), y: Math.floor(cy) };
}

function applyTool(e) {
    const { x, y } = canvasToGrid(e);
    const cell = `${x},${y}`;

    // Avoid repeated application on same cell (for barriers/depth painting)
    if (lastPointerCell === cell && toolbar.tool !== TOOLS.RIPPLE) return;
    lastPointerCell = cell;

    switch (toolbar.tool) {
        case TOOLS.RIPPLE:
            grid.inject(x, y, controls.amplitude, controls.brushRadius);
            break;
        case TOOLS.BARRIER:
            grid.paintBarrier(x, y, controls.brushRadius, false);
            break;
        case TOOLS.DEPTH:
            grid.paintDepth(x, y, controls.depthValue, controls.brushRadius + 2);
            break;
        case TOOLS.ERASER:
            grid.paintBarrier(x, y, controls.brushRadius + 1, true);
            grid.paintDepth(x, y, 200, controls.brushRadius + 2); // reset to default depth
            break;
    }
}

function onPointerDown(e) {
    canvas.setPointerCapture(e.pointerId);
    isPointerDown = true;
    lastPointerCell = null;
    applyTool(e);
}

function onPointerMove(e) {
    if (!isPointerDown) return;
    applyTool(e);
}

function onPointerUp(e) {
    isPointerDown = false;
    lastPointerCell = null;
}

// ── Boot ──────────────────────────────────────────────────────────────────────

window.addEventListener('DOMContentLoaded', init);
