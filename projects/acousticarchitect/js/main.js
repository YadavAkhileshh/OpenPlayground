/**
 * main.js
 * AcousticArchitect – Application bootstrap.
 * Wires together: UIState, ray engine, impulse builder, convolution engine,
 * Web Audio API playback, animation loop, and all sidebar controls.
 */

'use strict';

/* ── Globals ──────────────────────────────────────────────────── */
const roomCanvas = document.getElementById('room-canvas');
const roomCtx = roomCanvas.getContext('2d');
const irCanvas = document.getElementById('ir-canvas');

let audioCtx = null;  // Created lazily on first user gesture
let dryBuffer = null;  // AudioBuffer from loaded file
let activeSource = null;  // Currently playing AudioBufferSourceNode
let activeGain = null;
let simulateDebounce = null; // setTimeout handle

/** Shared application state (managed by ui.js) */
const state = createUIState();

/* ── AudioContext Lazy Init ───────────────────────────────────── */
function ensureAudioCtx() {
    if (audioCtx) return audioCtx;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 44100 });
    return audioCtx;
}

/* ── Simulation Pipeline ─────────────────────────────────────── */
/**
 * Run the full simulation: cast rays → build IR → convolve → update UI.
 * Heavy but called on-demand (debounced for slider changes).
 */
function runSimulation() {
    if (state.walls.length < 2) {
        updateStatus('Need at least 2 walls');
        return;
    }

    const rayCount = parseInt(document.getElementById('sl-rays').value, 10);
    const maxBounces = parseInt(document.getElementById('sl-bounces').value, 10);
    const absorption = parseFloat(document.getElementById('sl-absorb').value);
    const speedOfSound = parseFloat(document.getElementById('sl-speed').value);
    const pixelsPerMeter = parseFloat(document.getElementById('sl-scale').value);

    // 1. Cast rays
    const { allSegments, allHits } = castRays(
        state.source, state.listener, state.walls,
        { rayCount, maxBounces, absorption, pixelsPerMeter, speedOfSound }
    );

    state.allSegments = allSegments;

    // Update header status
    document.getElementById('status-rays').textContent = `Rays: ${allHits.length} hits`;
    document.getElementById('info-hits').textContent = allHits.length;
    document.getElementById('info-walls').textContent = state.walls.length;

    // 2. Build impulse response
    const { ir, sampleRate, duration } = buildImpulseResponse(allHits, 44100);
    state.irBuffer = ir;

    const rt60 = irRT60(ir, sampleRate);
    const rt60Str = rt60 > 0 ? `${rt60.toFixed(2)} s` : '–';
    document.getElementById('status-rt60').textContent = `RT60: ${rt60Str}`;
    document.getElementById('info-rt60').textContent = rt60Str;
    document.getElementById('info-irlen').textContent = `${duration.toFixed(2)} s`;

    // 3. Render IR graph
    renderIR(irCanvas, ir);
    document.getElementById('graph-subtitle').textContent = `${allHits.length} arrivals · ${duration.toFixed(2)} s`;
    document.getElementById('graph-subtitle').classList.add('live');

    return ir;
}

/**
 * Play the convolved audio.
 * Requires that runSimulation() has been called and dryBuffer is loaded.
 */
async function playConvolved() {
    const actx = ensureAudioCtx();

    // Run simulation first (or use cached IR if already done)
    const ir = runSimulation();
    if (!ir) return;

    if (!dryBuffer) {
        // Generate a simple test tone so the user hears something without a file
        const testLen = actx.sampleRate * 0.5;
        const testBuf = actx.createBuffer(1, testLen, actx.sampleRate);
        const td = testBuf.getChannelData(0);
        for (let i = 0; i < testLen; i++) {
            // Short impulse click
            td[i] = i < 64 ? Math.exp(-i * 0.15) * (i % 2 === 0 ? 1 : -1) : 0;
        }
        dryBuffer = testBuf;
        document.getElementById('audio-name').textContent = '(test impulse)';
    }

    stopPlayback();

    const dry = audioBufferToFloat32(dryBuffer, 0);

    // Off-main-thread note: for a large file this could block briefly.
    // The convolution is guarded against NaN in convolution-engine.js.
    const wetMix = parseFloat(document.getElementById('sl-wet').value);
    const wet = convolve(dry, ir);
    const mixed = mixDryWet(dry, wet, wetMix);
    normaliseBuffer(mixed, 0.88);

    const outBuf = float32ToAudioBuffer(actx, mixed, actx.sampleRate);

    activeSource = actx.createBufferSource();
    activeGain = actx.createGain();
    activeGain.gain.value = parseFloat(document.getElementById('sl-gain').value);

    activeSource.buffer = outBuf;
    activeSource.connect(activeGain);
    activeGain.connect(actx.destination);
    activeSource.start();

    activeSource.onended = () => {
        activeSource = null;
    };
}

/** Stop any currently playing source. */
function stopPlayback() {
    if (activeSource) {
        try { activeSource.stop(); } catch (_) { /* ignore */ }
        activeSource = null;
    }
}

/** Debounced simulation trigger for slider/state changes. */
function scheduleSimulation(delayMs = 350) {
    clearTimeout(simulateDebounce);
    simulateDebounce = setTimeout(() => runSimulation(), delayMs);
}

/* ── Sidebar Controls Wiring ─────────────────────────────────── */
function wireSlider(id, valId, cb) {
    const sl = document.getElementById(id);
    const lbl = document.getElementById(valId);
    sl.addEventListener('input', () => {
        lbl.textContent = sl.value;
        if (cb) cb(sl.value);
    });
    lbl.textContent = sl.value;
}

function wireSidebar() {
    wireSlider('sl-rays', 'val-rays', () => scheduleSimulation());
    wireSlider('sl-bounces', 'val-bounces', () => scheduleSimulation());
    wireSlider('sl-absorb', 'val-absorb', () => scheduleSimulation());
    wireSlider('sl-speed', 'val-speed', () => scheduleSimulation());
    wireSlider('sl-scale', 'val-scale', () => scheduleSimulation());
    wireSlider('sl-gain', 'val-gain', (v) => { if (activeGain) activeGain.gain.value = parseFloat(v); });
    wireSlider('sl-wet', 'val-wet');

    // Audio file loading
    const fileInput = document.getElementById('file-audio');
    document.getElementById('btn-load').addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const actx = ensureAudioCtx();
        const ab = await file.arrayBuffer();
        try {
            dryBuffer = await actx.decodeAudioData(ab);
            document.getElementById('audio-name').textContent = file.name;
        } catch (err) {
            console.error('Audio decode failed:', err);
            document.getElementById('audio-name').textContent = 'Error loading file';
        }
    });

    document.getElementById('btn-simulate').addEventListener('click', () => playConvolved());
    document.getElementById('btn-stop').addEventListener('click', () => stopPlayback());
}

/* ── Tool Buttons Wiring ─────────────────────────────────────── */
function wireToolbar() {
    const toolBtns = document.querySelectorAll('.tool-btn[data-tool]');

    function setActiveTool(tool) {
        state.tool = tool;
        // Update cursor class
        roomCanvas.className = '';
        if (tool === TOOL.SOURCE) roomCanvas.classList.add('tool-source');
        if (tool === TOOL.LISTENER) roomCanvas.classList.add('tool-listener');
        if (tool === TOOL.ERASE) roomCanvas.classList.add('tool-erase');
        // Update button active states
        toolBtns.forEach(b => b.classList.toggle('active', b.dataset.tool === tool));
    }

    toolBtns.forEach(b => {
        b.addEventListener('click', () => setActiveTool(b.dataset.tool));
    });

    // Toggle rays button
    const btnRays = document.getElementById('btn-rays');
    btnRays.addEventListener('click', () => {
        state.showRays = !state.showRays;
        btnRays.classList.toggle('on', state.showRays);
        btnRays.querySelector('span').textContent = state.showRays ? 'Hide Rays' : 'Show Rays';
    });

    // Clear walls
    document.getElementById('btn-clear').addEventListener('click', () => {
        state.walls = [];
        state.allSegments = [];
        state.irBuffer = null;
        document.getElementById('info-walls').textContent = '0';
        document.getElementById('info-hits').textContent = '0';
        renderIR(irCanvas, null);
    });

    // Preset room
    document.getElementById('btn-preset').addEventListener('click', () => {
        loadPresetRoom(state);
        scheduleSimulation(0);
    });

    // Keyboard shortcuts
    bindKeyboardShortcuts({
        setTool: setActiveTool,
        toggleRays: () => btnRays.click(),
        clearWalls: () => document.getElementById('btn-clear').click(),
        loadPreset: () => document.getElementById('btn-preset').click(),
    });
}

/* ── Status Helper ───────────────────────────────────────────── */
function updateStatus(msg) {
    document.getElementById('graph-subtitle').textContent = msg;
}

/* ── Animation Loop ──────────────────────────────────────────── */
let prevTime = performance.now();

function animationLoop(now) {
    const dt = Math.min((now - prevTime) / 1000, 0.05); // seconds, capped
    prevTime = now;
    renderScene(roomCtx, state, dt);
    requestAnimationFrame(animationLoop);
}

/* ── Resize Handler ──────────────────────────────────────────── */
function handleResize() {
    resizeCanvas(roomCanvas, state);
    renderIR(irCanvas, state.irBuffer);
}

/* ── Bootstrap ───────────────────────────────────────────────── */
function init() {
    // Resize canvas before anything
    resizeCanvas(roomCanvas, state);

    // Wire all controls
    wireSidebar();
    wireToolbar();

    // Bind drawing interactions with live simulation trigger
    bindCanvasEvents(roomCanvas, state, () => {
        document.getElementById('info-walls').textContent = state.walls.length;
        scheduleSimulation(300);
    });

    // Handle window resize
    window.addEventListener('resize', handleResize);

    // Load preset room on start
    loadPresetRoom(state);

    // Kick off initial simulation
    setTimeout(() => runSimulation(), 50);

    // Start render loop
    requestAnimationFrame(animationLoop);
}

// Run on DOMContentLoaded (scripts are deferred by placement at end of body)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
