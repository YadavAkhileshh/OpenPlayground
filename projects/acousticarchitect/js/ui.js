/**
 * ui.js
 * Drawing canvas interaction, node dragging, ray debug overlay,
 * and IR waveform rendering.
 */

'use strict';

/* ── Tool State ───────────────────────────────────────────────── */
// Use var so this is accessible globally from main.js (classic script tags)
var TOOL = { DRAW: 'draw', SOURCE: 'source', LISTENER: 'listener', ERASE: 'erase' };

/**
 * UIState – shared mutable state for all UI operations.
 * Owned by main.js, passed here to avoid global leaks.
 */
function createUIState() {
    return {
        tool: TOOL.DRAW,
        walls: [],          // [{x1,y1,x2,y2}, ...]
        source: { x: 200, y: 200 },
        listener: { x: 500, y: 300 },
        showRays: false,
        allSegments: [],          // ray debug paths from last simulation
        irBuffer: null,        // Float32Array
        drawing: false,       // currently drawing a wall
        dragTarget: null,        // 'source' | 'listener' | null
        drawStart: null,        // {x,y} – wall draw start
        canvasW: 0,
        canvasH: 0,
        // Animation pulse for source node
        pulseT: 0,
    };
}

/* ── Canvas Setup ─────────────────────────────────────────────── */
/**
 * Resize room canvas to fill its container.
 * @param {HTMLCanvasElement} canvas
 * @param {UIState} state
 */
function resizeCanvas(canvas, state) {
    const wrap = canvas.parentElement;
    canvas.width = wrap.clientWidth;
    canvas.height = wrap.clientHeight;
    state.canvasW = canvas.width;
    state.canvasH = canvas.height;
}

/* ── Pointer Helpers ──────────────────────────────────────────── */
/**
 * Get canvas-relative pointer position from a MouseEvent.
 * @param {HTMLCanvasElement} canvas
 * @param {MouseEvent} e
 * @returns {{x,y}}
 */
function canvasPos(canvas, e) {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
}

/** Euclidean distance between two points. */
function dist(a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/* ── Input Binding ────────────────────────────────────────────── */
/**
 * Attach all mouse/pointer handlers to the room canvas.
 * @param {HTMLCanvasElement} canvas
 * @param {UIState} state
 * @param {Function} onChangeCallback – called when walls/nodes change
 */
function bindCanvasEvents(canvas, state, onChangeCallback) {
    const NODE_GRAB_RADIUS = 24;

    canvas.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        const p = canvasPos(canvas, e);

        if (state.tool === TOOL.SOURCE || state.tool === TOOL.LISTENER) {
            const target = state.tool === TOOL.SOURCE ? 'source' : 'listener';
            if (dist(p, state[target]) < NODE_GRAB_RADIUS * 2) {
                state.dragTarget = target;
            }
            return;
        }

        if (state.tool === TOOL.DRAW) {
            // Allow dragging source/listener even in draw mode if near them
            if (dist(p, state.source) < NODE_GRAB_RADIUS) {
                state.dragTarget = 'source'; return;
            }
            if (dist(p, state.listener) < NODE_GRAB_RADIUS) {
                state.dragTarget = 'listener'; return;
            }
            state.drawing = true;
            state.drawStart = { ...p };
            document.getElementById('canvas-hint').classList.add('hidden');
        }

        if (state.tool === TOOL.ERASE) {
            eraseWallNear(state, p);
            onChangeCallback();
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        const p = canvasPos(canvas, e);

        if (state.dragTarget) {
            state[state.dragTarget] = { ...p };
            canvas.style.cursor = 'grabbing';
            // Trigger live re-render (but no heavy re-simulation)
            return;
        }

        if (state.drawing && state.drawStart) {
            state._liveEnd = { ...p }; // Preview endpoint
        }
    });

    canvas.addEventListener('mouseup', (e) => {
        if (state.dragTarget) {
            state.dragTarget = null;
            canvas.style.cursor = '';
            onChangeCallback();
            return;
        }

        if (state.drawing && state.drawStart) {
            const p = canvasPos(canvas, e);
            const wallLen = dist(state.drawStart, p);
            if (wallLen > 8) {
                state.walls.push({
                    x1: state.drawStart.x, y1: state.drawStart.y,
                    x2: p.x, y2: p.y,
                });
                onChangeCallback();
            }
            state.drawing = false;
            state.drawStart = null;
            state._liveEnd = null;
        }
    });

    canvas.addEventListener('mouseleave', () => {
        if (state.drawing) {
            state.drawing = false;
            state.drawStart = null;
            state._liveEnd = null;
        }
        state.dragTarget = null;
    });
}

/**
 * Erase the wall closest to point p (within 10 px tolerance).
 * @param {UIState} state
 * @param {{x,y}} p
 */
function eraseWallNear(state, p) {
    const ERASE_RADIUS = 10;
    let minDist = Infinity;
    let minIdx = -1;
    for (let i = 0; i < state.walls.length; i++) {
        const w = state.walls[i];
        const d = pointToSegmentDist(p, { x: w.x1, y: w.y1 }, { x: w.x2, y: w.y2 });
        if (d < minDist) { minDist = d; minIdx = i; }
    }
    if (minIdx >= 0 && minDist <= ERASE_RADIUS * 2) {
        state.walls.splice(minIdx, 1);
    }
}

/** Point-to-segment distance. */
function pointToSegmentDist(p, a, b) {
    const abx = b.x - a.x, aby = b.y - a.y;
    const aptx = p.x - a.x, apty = p.y - a.y;
    const t = Math.max(0, Math.min(1, (aptx * abx + apty * aby) / (abx * abx + aby * aby + 1e-9)));
    const cx = a.x + t * abx, cy = a.y + t * aby;
    return Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2);
}

/* ── Keyboard Shortcuts ──────────────────────────────────────── */
/**
 * Bind keyboard shortcuts.
 * @param {Object} handlers {setTool, toggleRays, clearWalls, loadPreset}
 */
function bindKeyboardShortcuts(handlers) {
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT') return;
        switch (e.key.toLowerCase()) {
            case 'w': handlers.setTool(TOOL.DRAW); break;
            case 's': handlers.setTool(TOOL.SOURCE); break;
            case 'l': handlers.setTool(TOOL.LISTENER); break;
            case 'e': handlers.setTool(TOOL.ERASE); break;
            case 'r': handlers.toggleRays(); break;
            case 'c': handlers.clearWalls(); break;
        }
    });
}

/* ── Scene Rendering ─────────────────────────────────────────── */
/**
 * Main scene render function. Called every animation frame.
 * @param {CanvasRenderingContext2D} ctx
 * @param {UIState} state
 * @param {number} dt  delta time in seconds
 */
function renderScene(ctx, state, dt) {
    const { canvasW, canvasH } = state;
    ctx.clearRect(0, 0, canvasW, canvasH);

    // ── Ray debug paths ──────────────────────────────────────────
    if (state.showRays && state.allSegments.length > 0) {
        ctx.save();
        const maxBounce = Math.max(...state.allSegments.map(s => s.bounce), 1);
        for (const seg of state.allSegments) {
            const alpha = 0.12 * (1 - seg.bounce / (maxBounce + 1));
            ctx.strokeStyle = `rgba(0, 212, 255, ${alpha.toFixed(3)})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(seg.x1, seg.y1);
            ctx.lineTo(seg.x2, seg.y2);
            ctx.stroke();
        }
        ctx.restore();
    }

    // ── Walls ─────────────────────────────────────────────────
    ctx.save();
    ctx.strokeStyle = '#c8cadb';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    for (const w of state.walls) {
        ctx.beginPath();
        ctx.moveTo(w.x1, w.y1);
        ctx.lineTo(w.x2, w.y2);
        ctx.stroke();
    }
    // Wall endpoint dots
    ctx.fillStyle = '#9fa3c0';
    for (const w of state.walls) {
        ctx.beginPath(); ctx.arc(w.x1, w.y1, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(w.x2, w.y2, 3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();

    // ── Live wall preview ─────────────────────────────────────
    if (state.drawing && state.drawStart && state._liveEnd) {
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.7)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(state.drawStart.x, state.drawStart.y);
        ctx.lineTo(state._liveEnd.x, state._liveEnd.y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
    }

    // ── Listener node ─────────────────────────────────────────
    drawListenerNode(ctx, state.listener);

    // ── Source node ───────────────────────────────────────────
    state.pulseT += dt;
    drawSourceNode(ctx, state.source, state.pulseT);
}

/** Draw the listener (ear) node. */
function drawListenerNode(ctx, pos) {
    ctx.save();
    // Outer ring
    ctx.strokeStyle = '#00ff9f';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(pos.x, pos.y, 14, 0, Math.PI * 2); ctx.stroke();
    // Inner dot
    ctx.fillStyle = '#00ff9f';
    ctx.beginPath(); ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2); ctx.fill();
    // Label
    ctx.font = '10px Inter, sans-serif';
    ctx.fillStyle = '#00ff9f';
    ctx.textAlign = 'center';
    ctx.fillText('👂', pos.x, pos.y + 28);
    ctx.restore();
}

/** Draw the source node with animated pulse rings. */
function drawSourceNode(ctx, pos, t) {
    ctx.save();
    // Pulse rings
    const numRings = 3;
    for (let i = 0; i < numRings; i++) {
        const phase = (t * 1.5 + i / numRings) % 1;
        const r = 10 + phase * 40;
        const alpha = (1 - phase) * 0.35;
        ctx.strokeStyle = `rgba(255, 204, 0, ${alpha.toFixed(3)})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2); ctx.stroke();
    }
    // Core circle
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath(); ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.stroke();
    // Play triangle
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.moveTo(pos.x - 3, pos.y - 4);
    ctx.lineTo(pos.x + 5, pos.y);
    ctx.lineTo(pos.x - 3, pos.y + 4);
    ctx.closePath();
    ctx.fill();
    // Label
    ctx.font = '10px Inter, sans-serif';
    ctx.fillStyle = '#ffcc00';
    ctx.textAlign = 'center';
    ctx.fillText('🔊', pos.x, pos.y + 28);
    ctx.restore();
}

/* ── IR Graph Rendering ──────────────────────────────────────── */
/**
 * Render the impulse response waveform onto the IR canvas.
 * @param {HTMLCanvasElement} irCanvas
 * @param {Float32Array|null} irBuffer
 */
function renderIR(irCanvas, irBuffer) {
    const ctx = irCanvas.getContext('2d');

    // Resize canvas to container
    const parent = irCanvas.parentElement;
    irCanvas.width = parent.clientWidth;
    irCanvas.height = parent.clientHeight;

    const W = irCanvas.width;
    const H = irCanvas.height;

    ctx.clearRect(0, 0, W, H);

    if (!irBuffer || irBuffer.length === 0) {
        ctx.fillStyle = 'rgba(0, 212, 255, 0.15)';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No impulse response – simulate first', W / 2, H / 2);
        return;
    }

    const midY = H * 0.5;
    const half = H * 0.45;
    const step = irBuffer.length / W;

    // Background axis line
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, midY); ctx.lineTo(W, midY); ctx.stroke();

    // Waveform fill gradient
    const grad = ctx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, 'rgba(0, 212, 255, 0.90)');
    grad.addColorStop(0.3, 'rgba(124, 92, 252, 0.80)');
    grad.addColorStop(1, 'rgba(0, 212, 255, 0.10)');

    ctx.fillStyle = grad;
    ctx.strokeStyle = 'transparent';
    ctx.beginPath();
    ctx.moveTo(0, midY);

    for (let x = 0; x < W; x++) {
        const idx = Math.floor(x * step);
        const val = irBuffer[idx] || 0;
        ctx.lineTo(x, midY - val * half);
    }
    ctx.lineTo(W, midY);
    for (let x = W - 1; x >= 0; x--) {
        const idx = Math.floor(x * step);
        const val = irBuffer[idx] || 0;
        ctx.lineTo(x, midY + val * half);
    }
    ctx.closePath();
    ctx.fill();

    // Waveform outline (positive only)
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.85)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let x = 0; x < W; x++) {
        const idx = Math.floor(x * step);
        const val = irBuffer[idx] || 0;
        if (x === 0) ctx.moveTo(x, midY - val * half);
        else ctx.lineTo(x, midY - val * half);
    }
    ctx.stroke();

    // Time axis ticks (every 100 ms)
    const IR_SR = 44100; // match IB_SAMPLE_RATE in impulse-builder.js
    const durSec = irBuffer.length / IR_SR;
    const tickInterval = 0.1; // seconds
    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.font = '9px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.lineWidth = 1;
    for (let t = 0; t < durSec; t += tickInterval) {
        const x = (t / durSec) * W;
        ctx.beginPath(); ctx.moveTo(x, midY - 6); ctx.lineTo(x, midY + 6); ctx.stroke();
        if (t > 0.01) ctx.fillText(`${(t * 1000).toFixed(0)}ms`, x, H - 4);
    }

    irCanvas.classList.add('has-data');
}

/* ── Preset Room ─────────────────────────────────────────────── */
/**
 * Load a rectangular preset room centered in the canvas.
 * @param {UIState} state
 */
function loadPresetRoom(state) {
    const cx = state.canvasW / 2;
    const cy = state.canvasH / 2;
    const W = Math.min(state.canvasW * 0.55, 420);
    const H = Math.min(state.canvasH * 0.55, 280);
    const x1 = cx - W / 2, y1 = cy - H / 2;
    const x2 = cx + W / 2, y2 = cy + H / 2;
    state.walls = [
        { x1, y1, x2: x2, y2: y1 },  // top
        { x1: x2, y1, x2: x2, y2 },  // right
        { x1: x2, y1: y2, x2: x1, y2 },  // bottom
        { x1, y1: y2, x2: x1, y2: y1 },  // left
    ];
    // Place source and listener sensibly inside
    state.source = { x: x1 + W * 0.25, y: cy };
    state.listener = { x: x1 + W * 0.70, y: cy };
}
