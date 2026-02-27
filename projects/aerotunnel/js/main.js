/**
 * @file main.js
 * @description Main entry point. Initializes simulation loop.
 */

import { LBMSolver } from './lbm/solver.js';
import { FlowRenderer } from './viz/renderer.js';
import { InputHandler } from './ui/input.js';
import { UIControls } from './ui/controls.js';
import { AeroSensors } from './lbm/sensors.js';
import { ObstaclePresets } from './ui/presets.js';
import { RealTimeGraph } from './viz/graph.js';
import { ParticleSystem } from './viz/particles.js';
import { SmokeSolver } from './viz/smoke.js';
import { WindAudio } from './audio.js';
import { StateManager } from './ui/state.js';
import { naca4 } from './utils/math.js'; // Ensure math has naca4 or similar

// Configuration
// We want ~200-300 width for good performance in JS
const WIDTH = 300;
const HEIGHT = 150;
const STEPS_PER_FRAME = 8; // Adjust based on performance

let solver, renderer, input, controls, sensors, presets, graph;
let particles, audio, smoke, stateMgr;
let isRunning = false;
let animationId;
let lastTime = 0;
let frameCount = 0;
let lastFpsTime = 0;

function init() {
    console.log("Initializing AeroTunnel...");

    // 1. Init Solver
    solver = new LBMSolver(WIDTH, HEIGHT);

    // 2. Init Renderer
    const canvas = document.getElementById('simulation-canvas');
    renderer = new FlowRenderer(canvas, solver);

    // 3. Init Scientific Modules
    sensors = new AeroSensors(solver);
    presets = new ObstaclePresets(solver);
    graph = new RealTimeGraph(document.getElementById('drag-graph'));
    particles = new ParticleSystem(solver, 3000);
    audio = new WindAudio();
    smoke = new SmokeSolver(solver);
    stateMgr = new StateManager(solver, controls);

    // 4. Init Input
    // Be careful with dependency injection loop if input needs new features
    input = new InputHandler(canvas, solver);
    input.setProbeCallback((x, y) => {
        // Handle probe click
        const idx = Math.floor(y) * WIDTH + Math.floor(x);
        if (idx >= 0 && idx < solver.size) {
            const u = Math.sqrt(solver.ux[idx] ** 2 + solver.uy[idx] ** 2);
            const rho = solver.rho[idx];
            controls.log(`Probe [${Math.floor(x)},${Math.floor(y)}]: Speed=${u.toFixed(3)} Density=${rho.toFixed(3)}`);
        }
    });

    // Pass smoke to input? Or handle via specialized callback
    // Let's add a specialized smoke mode to InputHandler via injection or property
    input.setSmokeCallback((x, y, drawing) => {
        if (drawing) smoke.addSource(x, y);
    });

    // 5. Init UI
    controls = new UIControls(solver, renderer, toggleSimulation);

    // Bind new features
    document.getElementById('chk-particles').addEventListener('change', (e) => {
        particles.active = e.target.checked;
    });

    document.getElementById('chk-smoke').addEventListener('change', (e) => {
        smoke.active = e.target.checked;
        smoke.clearSources();
        if (e.target.checked) controls.log("Smoke Enabled. Right Click to adding Source.");
    });


    const btnAudio = document.getElementById('btn-audio');
    btnAudio.addEventListener('click', () => {
        if (!audio.active) {
            audio.init();
            audio.active = true;
            btnAudio.textContent = "Audio: ON";
            btnAudio.classList.add('primary');
        } else {
            audio.active = !audio.active;
            if (!audio.active) audio.stop();
            btnAudio.textContent = audio.active ? "Audio: ON" : "Audio: OFF";
            if (audio.active) btnAudio.classList.add('primary');
            else btnAudio.classList.remove('primary');
        }
    });

    const btnProbe = document.getElementById('btn-probe');
    btnProbe.addEventListener('click', () => {
        // Toggle input mode
        if (input.drawMode === 2) {
            input.drawMode = 1; // Back to Draw
            btnProbe.textContent = "Mode: Draw";
            btnProbe.classList.remove('primary');
        } else {
            input.drawMode = 2; // Probe
            btnProbe.textContent = "Mode: Probe Active";
            btnProbe.classList.add('primary');
        }
    });

    // Save/Load
    document.getElementById('btn-save').addEventListener('click', () => {
        stateMgr.saveState();
        controls.log("Simulation State Saved.");
    });

    document.getElementById('file-load').addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            stateMgr.loadState(e.target.files[0]);
            controls.log("Loading State...");
        }
    });

    // NACA Generator
    document.getElementById('btn-gen-naca').addEventListener('click', () => {
        const nacaInput = document.getElementById('input-naca');
        const angleInput = document.getElementById('input-angle');

        const code = nacaInput.value;
        const angle = parseFloat(angleInput.value);
        if (code.length !== 4) {
            controls.log("Invalid NACA code. Must be 4 digits.", "error");
            return;
        }

        // Parse NACA 4-digit: M P TT (Max Camber, Pos Camber, Thickness)
        const t = parseInt(code.substring(2)) / 100.0;

        solver.clearObstacles();
        presets.drawAirfoil(0.2, 0.5, 0.5, t, angle);
        renderer.render();
        controls.log(`Generated NACA ${code} at ${angle} deg`);
    });

    const angleInput = document.getElementById('input-angle');
    angleInput.addEventListener('input', (e) => {
        document.getElementById('val-angle').textContent = e.target.value;
    });

    controls.bindPresetCallback((type) => {
        solver.clearObstacles();
        switch (type) {
            case 'cylinder': presets.drawCylinder(0.25, 0.5, 0.08); break;
            case 'airfoil': presets.drawAirfoil(0.2, 0.5, 0.5, 0.12, 10); break; // 10 deg attack
            case 'plate': presets.drawCylinder(0.3, 0.5, 0.02); break; // Small cylinder as plate/wire
            case 'random':
                for (let i = 0; i < 5; i++) {
                    presets.drawCylinder(Math.random() * 0.8 + 0.1, Math.random() * 0.8 + 0.1, Math.random() * 0.05 + 0.02);
                }
                break;
        }
        controls.log(`Loaded preset: ${type}`);
        // Render update
        renderer.render();
    });

    // Initial draw
    // Load default
    presets.drawCylinder(0.25, 0.5, 0.08);
    renderer.render();
    controls.log("System Initialized. Default Cylinder Loaded.");

    // Start loop
    start();
}

function toggleSimulation() {
    if (isRunning) {
        stop();
        return false;
    } else {
        start();
        return true;
    }
}

function start() {
    if (isRunning) return;
    isRunning = true;
    lastTime = performance.now();
    loop();
}

function stop() {
    isRunning = false;
    cancelAnimationFrame(animationId);
}

function loop(timestamp) {
    if (!isRunning) return;

    // Stats
    frameCount++;
    if (timestamp - lastFpsTime >= 1000) {
        const fps = Math.round(frameCount * 1000 / (timestamp - lastFpsTime));
        controls.updatePerf(fps, STEPS_PER_FRAME);
        frameCount = 0;
        lastFpsTime = timestamp;
    }

    // Physics Steps
    const inletSpeed = window.SIM_SPEED || 0.1;

    for (let i = 0; i < STEPS_PER_FRAME; i++) {
        solver.step(inletSpeed);
    }

    // Scientific Analysis
    sensors.computeForces();
    particles.update();
    smoke.step(); // Auto-advect existing smoke

    // Update Audio
    if (audio && audio.active) {
        // Get average speed in center
        const centerIdx = Math.floor(HEIGHT / 2) * WIDTH + Math.floor(WIDTH / 2);
        const ux = solver.ux[centerIdx];
        const speed = Math.abs(ux); // Approximate
        audio.update(speed);
    }

    graph.addPoint(sensors.dragForce); // Plot drag
    controls.updateSensors(sensors.dragForce, sensors.liftForce);

    // Render
    renderer.render(); // Fluid

    // Render Overlay
    const ctx = renderer.ctx;

    // Render Smoke (Additive)
    if (smoke && smoke.active) {
        // We can render smoke directly on top of fluid or blend
        // Smoke is scalar 0-1.
        // Let's render it as white/alpha overlay?
        // Access canvas buffer directly is faster but context drawing is easier for overlay.

        const imgData = renderer.imageData;
        const px = imgData.data;
        const sDensity = smoke.density;

        // Manual blend for performance
        // Overlay white smoke where density > 0
        for (let i = 0; i < solver.size; i++) {
            const val = sDensity[i];
            if (val > 0.01) {
                const pIdx = i * 4;
                const alpha = Math.min(val * 255, 255);
                // Additive white
                px[pIdx] = Math.min(255, px[pIdx] + alpha);
                px[pIdx + 1] = Math.min(255, px[pIdx + 1] + alpha);
                px[pIdx + 2] = Math.min(255, px[pIdx + 2] + alpha);
                // px[pIdx+3] is 255
            }
        }
        renderer.ctx.putImageData(imgData, 0, 0);
    }

    // Particles on top
    particles.render(ctx);

    graph.render();

    animationId = requestAnimationFrame(loop);
}

// Boot
window.addEventListener('load', init);
