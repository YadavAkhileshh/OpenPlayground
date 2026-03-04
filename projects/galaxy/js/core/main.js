/**
 * @file main.js
 * @description Entry point for GalaxyCollider.
 * Handles initialization, loop management, and DOM bindings.
 * 
 * @module Core
 */

import { Vector3 } from '../math/vector.js';
import { Particle } from '../physics/particle.js';
import { Octree } from '../physics/quadtree.js';
import { calculateForce } from '../physics/barnesHut.js';
import { generateSpiralGalaxy } from '../simulation/galaxy.js';
import { Renderer } from '../render/visualizer.js';

// --- Configuration ---
const CONFIG = {
    particleCount: 8000, // Total particles (split between galaxies)
    G: 0.5,             // Gravitational Constant
    theta: 0.5,         // Barnes-Hut Accuracy
    epsilon: 50.0,      // Softening 
    dt: 0.1,            // Time step
    trailFalloff: 0.2,  // Trail persistence
};

// --- State ---
const state = {
    particles: [],
    octree: new Octree(4000), // Large initial bounds
    running: true,
    fps: 0,
    time: 0
};

// --- DOM Elements ---
const canvas = document.getElementById('sim-canvas');
const fpsDisplay = document.getElementById('fps-count');
const particleCountDisplay = document.getElementById('particle-count');

// --- Initialization ---
const renderer = new Renderer(canvas);

function resize() {
    renderer.resize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', resize);
resize();

function initSimulation() {
    state.particles = [];

    // Galaxy 1: Blue, moving right
    const g1 = generateSpiralGalaxy(
        new Vector3(-400, -200, 0),
        CONFIG.particleCount / 2,
        300,
        new Vector3(0.2, 0.4, 1), // Tilted
        1.0,
        'blue'
    );

    // Apply initial bulk velocity
    const v1 = new Vector3(1.5, 0.5, 0);
    g1.forEach(p => p.velocity.add(v1));

    // Galaxy 2: Red, moving left
    const g2 = generateSpiralGalaxy(
        new Vector3(400, 200, 0),
        CONFIG.particleCount / 2,
        300,
        new Vector3(-0.2, 0.4, 1), // Tilted opposite way
        1.0,
        'red'
    );

    // Apply initial bulk velocity
    const v2 = new Vector3(-1.5, -0.5, 0);
    g2.forEach(p => p.velocity.add(v2));

    state.particles = [...g1, ...g2];
    particleCountDisplay.innerText = state.particles.length;
}

// --- Physics Step ---
function updatePhysics() {
    // 1. Rebuild Quadtree
    // We assume a fixed large size for simplicity, or we could calculate bounds dynamically
    // Dynamic bounds recommended to prevent particles leaving tree
    let min = new Vector3(Infinity, Infinity, Infinity);
    let max = new Vector3(-Infinity, -Infinity, -Infinity);

    // Quick bounds check (optional optimization: only check every N frames)
    for (const p of state.particles) {
        if (p.position.x < min.x) min.x = p.position.x;
        if (p.position.y < min.y) min.y = p.position.y;
        if (p.position.z < min.z) min.z = p.position.z;
        if (p.position.x > max.x) max.x = p.position.x;
        if (p.position.y > max.y) max.y = p.position.y;
        if (p.position.z > max.z) max.z = p.position.z;
    }

    // Make cube
    const sizeX = max.x - min.x;
    const sizeY = max.y - min.y;
    const sizeZ = max.z - min.z;
    const size = Math.max(sizeX, sizeY, sizeZ, 100) * 1.2; // 20% padding

    const center = new Vector3(
        min.x + sizeX / 2,
        min.y + sizeY / 2,
        min.z + sizeZ / 2
    );

    state.octree.clear(size, center);

    // Insert all particles
    for (const p of state.particles) {
        state.octree.insert(p);
    }

    // 2. Calculate Forces
    for (const p of state.particles) {
        p.resetForce();
        calculateForce(p, state.octree.root, CONFIG.theta, CONFIG.G, CONFIG.epsilon);
    }

    // 3. Integrate (Update pos/vel)
    for (const p of state.particles) {
        p.update(CONFIG.dt);
    }
}

// --- Main Loop ---
let lastTime = 0;
let frames = 0;
let lastFpsTime = 0;

function loop(timestamp) {
    if (!state.running) {
        requestAnimationFrame(loop);
        return;
    }

    const dt = timestamp - lastTime;
    lastTime = timestamp;

    // Throttle physics if visual framerate is high? 
    // Or run multiple physics steps per frame?
    // Setting 1 physics step per frame for visual smoothness in JS
    updatePhysics();

    // Render
    renderer.trailFalloff = CONFIG.trailFalloff;
    renderer.clear();
    renderer.render(state.particles);

    // Debug
    // renderer.drawDebug(state.octree);

    // FPS Calculation
    frames++;
    if (timestamp - lastFpsTime >= 1000) {
        state.fps = frames;
        frames = 0;
        lastFpsTime = timestamp;
        fpsDisplay.innerText = state.fps;
    }

    requestAnimationFrame(loop);
}

// --- UI Binding ---
document.getElementById('btn-reset').addEventListener('click', () => {
    initSimulation();
});

document.getElementById('input-speed').addEventListener('input', (e) => {
    CONFIG.dt = parseFloat(e.target.value);
    document.getElementById('val-speed').innerText = CONFIG.dt;
});

document.getElementById('input-count').addEventListener('change', (e) => {
    CONFIG.particleCount = parseInt(e.target.value);
    document.getElementById('val-count').innerText = CONFIG.particleCount;
    initSimulation(); // Restart needed to change count
});

document.getElementById('input-theta').addEventListener('input', (e) => {
    CONFIG.theta = parseFloat(e.target.value);
    document.getElementById('val-theta').innerText = CONFIG.theta;
});

// Start
initSimulation();
requestAnimationFrame(loop);
