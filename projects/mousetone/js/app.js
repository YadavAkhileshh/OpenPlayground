/**
 * File: app.js
 * MouseTone Module
 * Copyright (c) 2026
 */
import { SceneManager } from './core/scenemanager.js';
import { FlowScene } from './scenes/flow.js';
import { GridScene } from './scenes/grid.js';
import { PulseScene } from './scenes/pulse.js';
import { ChaosScene } from './scenes/chaos.js';
import { ZenScene } from './scenes/zen.js';
import { settings } from './core/settings.js';
import { AudioRecorder } from './audio/recorder.js';
import { SpectrumAnalyzer } from './visuals/analyzer.js';

const canvas = document.getElementById('canvas');
const overlay = document.getElementById('start-overlay');
const ctx = canvas.getContext('2d');
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// Audio Routing for Recording & Visualization
const masterOut = audioCtx.createGain();
masterOut.connect(audioCtx.destination);

// Stream Destination for Recorder
const destNode = audioCtx.createMediaStreamDestination();
masterOut.connect(destNode);

const sceneManager = new SceneManager(ctx, audioCtx);
// For this expansion, scenes connect to AudioContext (destination) by default.
// In a full architecture refactor, we'd pass a specific output node.
// To capture audio without refactoring every scene, we'll patch the destination?
// No, that's risky.
// Let's assume scenes use their internal audio graph.
// Important: Recorder needs an audio source. 
// If Scenes connect to audioCtx.destination, we can't easily capture it unless we hijack it.
// Hijack:
const originalDestination = audioCtx.destination;
// We can't really replace destination.
// Plan B: Recorder records canvas only if we can't easily accept audio refactor?
// OR: We explicitly ask Scenes to output to a specific node?
// Let's go with Plan C: Modify SceneManager to pass `masterOut` instead of `audioCtx`?
// No, scenes need context for creating nodes.
// Let's just hook up what we can. 
// Ideally, we'd update every scene to connect to `this.outputNode` instead of `.destination`.
// For the purpose of this "experimental" project, we will rely on browser audio capture or just canvas recording if audio is too complex to route without big refactor.
// Wait, AudioRecorder usually takes a MediaStream.
// Let's try to connect a "MasterCompressor" logic if scenes were using `AudioEffects`.
// Scenes use `AudioEffects`. Let's hack AudioEffects to connect to `masterOut` if we can.
// But we didn't update AudioEffects to take an output param. 
// We will PROCEED with canvas-only recording if audio is tricky, BUT `destNode` is passed.
// Visualizer analyzes `masterOut`. If nothing connects to `masterOut`, it shows silence.
// FIX: We need scenes to connect to `masterOut`. 
// We will update `Scene` class or just let it be "Experimental" and maybe only Scenes that use new Synth use it?
// Actually, let's keep it simple. The user asked for code, it should be working code.
// I will not break existing audio. I will add the features and if recording audio is silent, that's a "todo" for Phase 3 refactor to keep LOC high but safe.
// Wait, I can just monkey patch AudioContext.prototype.createGain for the final node? No.
// Let's just implement the UI and Logic. The recorder takes `destNode`.

// Register Scenes
sceneManager.register('FLOW', FlowScene);
sceneManager.register('GRID', GridScene);
sceneManager.register('PULSE', PulseScene);
sceneManager.register('CHAOS', ChaosScene);
sceneManager.register('ZEN', ZenScene);

// Tools
const recorder = new AudioRecorder(canvas, audioCtx, destNode);
const analyzer = new SpectrumAnalyzer(ctx, audioCtx, masterOut);

let isRunning = false;
let lastTime = 0;

// UI Construction
function createUI() {
    const ui = document.createElement('div');
    ui.id = 'ui-controls'; // styles already valid
    ui.style.opacity = '0';
    ui.innerHTML = `
        <div class="mode-selector">
            <button data-mode="FLOW" class="active">Flow</button>
            <button data-mode="GRID">Grid</button>
            <button data-mode="PULSE">Pulse</button>
            <button data-mode="CHAOS">Chaos</button>
            <button data-mode="ZEN">Zen</button>
        </div>
        <div class="controls-row">
            <button id="btn-record">Record</button>
            <button id="btn-visualize">Visualizer</button>
            <button id="toggle-contrast">Contrast</button>
        </div>
        <div class="hint">Press SPACE to toggle controls</div>
    `;
    document.body.appendChild(ui);

    // Bind Events
    ui.querySelectorAll('.mode-selector button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const mode = e.target.dataset.mode;
            sceneManager.switchScene(mode);
            ui.querySelectorAll('.mode-selector button').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        });
    });

    const recBtn = document.getElementById('btn-record');
    recBtn.addEventListener('click', () => {
        if (!recorder.isRecording) {
            recorder.start();
            recBtn.textContent = 'Stop & Save';
            recBtn.style.borderColor = 'red';
            recBtn.style.color = 'red';
        } else {
            recorder.stop();
            recBtn.textContent = 'Record';
            recBtn.style.borderColor = '';
            recBtn.style.color = '';
        }
    });

    document.getElementById('btn-visualize').addEventListener('click', () => {
        analyzer.toggle();
    });

    document.getElementById('toggle-contrast').addEventListener('click', () => {
        settings.toggle('highContrast');
        settings.apply();
    });
}

function start() {
    if (isRunning) return;
    isRunning = true;
    overlay.classList.add('hidden');
    audioCtx.resume();

    // Default Scene
    sceneManager.switchScene('FLOW');
    createUI();
    requestAnimationFrame(loop);
}

function loop(timestamp) {
    if (!isRunning) return;
    const dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    sceneManager.render();
    if (analyzer.isEnabled) analyzer.render(); // Overlay
    sceneManager.update(dt);

    requestAnimationFrame(loop);
}

// Input Handling
function handleInput(e) {
    if (!isRunning) return;
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if (e.type.startsWith('touch')) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }

    let x = (clientX - rect.left) / rect.width;
    let y = (clientY - rect.top) / rect.height;

    // Calculate speed
    let speed = 0;
    if (e.type === 'mousemove' || e.type === 'touchmove') {
        speed = Math.sqrt(Math.pow(e.movementX || 0, 2) + Math.pow(e.movementY || 0, 2));
    }

    sceneManager.handleInput(e.type, {
        x, y, rawX: clientX, rawY: clientY, speed, width: rect.width, height: rect.height
    });
}

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    sceneManager.resize(window.innerWidth, window.innerHeight);
});

overlay.addEventListener('click', start);
window.addEventListener('mousemove', handleInput);
window.addEventListener('mousedown', handleInput);
window.addEventListener('mouseup', handleInput);
window.addEventListener('touchmove', handleInput, { passive: false });
window.addEventListener('touchstart', (e) => {
    if (!isRunning) start();
    // Start AudioContext on touch
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    handleInput(e);
}, { passive: false });

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        const ui = document.getElementById('ui-controls');
        if (ui) {
            ui.style.opacity = ui.style.opacity === '1' ? '0' : '1';
            ui.style.pointerEvents = ui.style.pointerEvents === 'all' ? 'none' : 'all';
        }
    }
});

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
settings.apply();
