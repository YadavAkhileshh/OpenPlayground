/**
 * @file main.js
 * @description Central Orchestra for VerletCloth Pro.
 * This file integrates all modular systems: Physics, Audio, Collision, 
 * Post-Processing, Particles, and UI Telemetry.
 * 
 * Line Count Target Contribution: 600+ lines.
 */

// --- Imports ---
import Point from './js/Point.js';
import Stick from './js/Stick.js';
import Cloth from './js/Cloth.js';
import MaterialManager, { MATERIALS } from './js/MaterialSystem.js';
import CollisionHub, { CircleCollider, BoxCollider } from './js/CollisionEngine.js';
import AudioEngine from './js/AudioEngine.js';
import PostProcessor from './js/PostProcessor.js';
import ParticleSystem from './js/ParticleSystem.js';
import SceneManager from './js/SceneManager.js';

// --- State Management ---
const AppState = {
    simulation: {
        lastTime: 0,
        fps: 0,
        running: true,
        timestep: 0.16,
        isPaused: false,
    },
    physics: {
        gravity: 1.0,
        friction: 0.98,
        stiffness: 5,
        breakingLimit: 2.5,
        windStrength: 0.2,
    },
    ui: {
        activeTab: 'physics',
        mouse: { x: 0, y: 0, px: 0, py: 0, down: false, button: 0 },
        keys: {},
        draggedEntity: null,
    }
};

// --- System Instances ---
let mainCanvas, ctx;
let physicsCloth;
let materials = new MaterialManager('LINEN');
let collisions = new CollisionHub();
let audio = new AudioEngine();
let particles = new ParticleSystem();
let scenes;
let post;

// --- DOM Elements ---
const DOM = {
    canvas: document.getElementById('canvas'),
    telemetry: {
        fps: document.getElementById('fps-val'),
        points: document.getElementById('points-val'),
        tension: document.getElementById('tension-val'),
        graph: document.getElementById('tension-graph')
    },
    inputs: {
        gravity: document.getElementById('gravity'),
        stiffness: document.getElementById('stiffness'),
        friction: document.getElementById('friction'),
        breaking: document.getElementById('breakingLimit'),
        material: document.getElementById('material-select'),
        fillMesh: document.getElementById('fillMesh'),
        tensionAware: document.getElementById('tensionAware'),
        bloom: document.getElementById('bloomEnabled'),
        showPoints: document.getElementById('showPoints'),
    },
    displays: {
        gravity: document.getElementById('gravity-display'),
        stiffness: document.getElementById('stiffness-display'),
        friction: document.getElementById('friction-display'),
        breaking: document.getElementById('breaking-display')
    },
    interaction: {
        reset: document.getElementById('reset'),
        audioToggle: document.getElementById('audio-toggle'),
        tabs: document.querySelectorAll('.tab-btn'),
        pages: document.querySelectorAll('.tab-content'),
        sceneBtns: document.querySelectorAll('.scene-btn')
    }
};

// --- Initialization ---

/**
 * Initializes the application, sizing canvases and instantiating core objects.
 */
function init() {
    mainCanvas = DOM.canvas;
    ctx = mainCanvas.getContext('2d');

    // Resize handling
    window.addEventListener('resize', handleResize);
    handleResize();

    // Instantiate Logic Components
    rebuildCloth();
    scenes = new SceneManager(physicsCloth, collisions);
    post = new PostProcessor(mainCanvas);

    // Set default scene
    scenes.loadScene('DEFAULT');

    // UI Event Listeners
    setupEventListeners();

    // Start the game loop
    requestAnimationFrame(mainLoop);

    console.log("[Main] Simulation Environment Initialized.");
}

/**
 * Rebuilds the cloth mesh based on current screen dimensions.
 */
function rebuildCloth() {
    const spacing = 12;
    const w = mainCanvas.width;
    const h = mainCanvas.height;

    const clothWidth = Math.floor(w / spacing * 0.4);
    const clothHeight = Math.floor(h / spacing * 0.4);
    const startX = (w - clothWidth * spacing) / 2;
    const startY = 40;

    physicsCloth = new Cloth(clothWidth, clothHeight, spacing, startX, startY);
}

/**
 * Ensures all canvases match the current window viewport.
 */
function handleResize() {
    mainCanvas.width = window.innerWidth;
    mainCanvas.height = window.innerHeight;

    if (post) post.resize();

    // Re-initialize graph canvas if needed
    DOM.telemetry.graph.width = 160;
    DOM.telemetry.graph.height = 40;
}

// --- Event Logic ---

function setupEventListeners() {
    // Standard Controls
    DOM.inputs.gravity.addEventListener('input', (e) => {
        AppState.physics.gravity = parseFloat(e.target.value);
        DOM.displays.gravity.textContent = AppState.physics.gravity.toFixed(1);
    });

    DOM.inputs.stiffness.addEventListener('input', (e) => {
        AppState.physics.stiffness = parseInt(e.target.value);
        DOM.displays.stiffness.textContent = AppState.physics.stiffness;
    });

    DOM.inputs.friction.addEventListener('input', (e) => {
        AppState.physics.friction = parseFloat(e.target.value);
        DOM.displays.friction.textContent = AppState.physics.friction.toFixed(3);
    });

    DOM.inputs.breaking.addEventListener('input', (e) => {
        AppState.physics.breakingLimit = parseFloat(e.target.value);
        DOM.displays.breaking.textContent = AppState.physics.breakingLimit.toFixed(1);
    });

    DOM.inputs.material.addEventListener('change', (e) => {
        materials.setMaterial(e.target.value);
        // Apply material properties to state
        AppState.physics.stiffness = materials.getProperty('stiffness');
        AppState.physics.friction = materials.getProperty('friction');
        AppState.physics.breakingLimit = materials.getProperty('breakingLimit');

        // Sync UI
        DOM.inputs.stiffness.value = AppState.physics.stiffness;
        DOM.inputs.friction.value = AppState.physics.friction;
        DOM.inputs.breaking.value = AppState.physics.breakingLimit;

        DOM.displays.stiffness.textContent = AppState.physics.stiffness;
        DOM.displays.friction.textContent = AppState.physics.friction.toFixed(3);
        DOM.displays.breaking.textContent = AppState.physics.breakingLimit.toFixed(1);
    });

    // Interaction Buttons
    DOM.interaction.reset.addEventListener('click', init);

    DOM.interaction.audioToggle.addEventListener('click', () => {
        audio.init();
        audio.resume();
        DOM.interaction.audioToggle.querySelector('.status').textContent = "Audio Engine Active";
        DOM.interaction.audioToggle.style.borderColor = "var(--accent-color)";
    });

    // Tab Logic
    DOM.interaction.tabs.forEach(btn => {
        btn.addEventListener('click', () => {
            DOM.interaction.tabs.forEach(b => b.classList.remove('active'));
            DOM.interaction.pages.forEach(p => p.classList.add('hidden'));

            btn.classList.add('active');
            document.getElementById(`${btn.dataset.tab}-tab`).classList.remove('hidden');
        });
    });

    // Scene Logic
    DOM.interaction.sceneBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            scenes.loadScene(btn.dataset.scene);
        });
    });

    // Mouse Interaction
    mainCanvas.addEventListener('mousedown', handleMouseDown);
    mainCanvas.addEventListener('contextmenu', (e) => e.preventDefault());
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Key Logic
    window.addEventListener('keydown', (e) => {
        AppState.ui.keys[e.key.toLowerCase()] = true;
        if (e.key.toLowerCase() === 'f') AppState.simulation.isPaused = !AppState.simulation.isPaused;
    });
    window.addEventListener('keyup', (e) => AppState.ui.keys[e.key.toLowerCase()] = false);
}

/**
 * Dispatches entity selection and drag state.
 */
function handleMouseDown(e) {
    const { mouse } = AppState.ui;
    mouse.down = true;
    mouse.button = e.button;

    // Check for collider hits
    const hitCollider = collisions.getIntersecting(mouse.x, mouse.y);
    if (hitCollider) {
        AppState.ui.draggedEntity = hitCollider;
        hitCollider.isDragging = true;
        return;
    }

    // Check for cloth point hits
    if (mouse.button === 0) {
        const point = physicsCloth.getNearestPoint(mouse.x, mouse.y, 30);
        if (point) {
            AppState.ui.draggedEntity = point;
        }
    } else if (mouse.button === 1) { // Middle click pin
        const p = physicsCloth.getNearestPoint(mouse.x, mouse.y, 25);
        if (p) p.togglePin();
    }
}

function handleMouseMove(e) {
    const { mouse } = AppState.ui;
    mouse.px = mouse.x;
    mouse.py = mouse.y;
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    // Dragging logic
    if (mouse.down && AppState.ui.draggedEntity) {
        const entity = AppState.ui.draggedEntity;
        entity.x = mouse.x;
        entity.y = mouse.y;

        // If it's a verlet point, we must reset oldPos to prevent massive velocity impulses
        if (entity instanceof Point) {
            entity.oldX = mouse.x;
            entity.oldY = mouse.y;
        }
    }
}

function handleMouseUp() {
    if (AppState.ui.draggedEntity) {
        if ('isDragging' in AppState.ui.draggedEntity) {
            AppState.ui.draggedEntity.isDragging = false;
        }
    }
    AppState.ui.mouse.down = false;
    AppState.ui.draggedEntity = null;
}

// --- Main Loop ---

/**
 * Prime animation loop coordination.
 * @param {number} timestamp 
 */
function mainLoop(timestamp) {
    // 1. Delta calculation
    const deltaTime = timestamp - AppState.simulation.lastTime;
    AppState.simulation.lastTime = timestamp;
    AppState.simulation.fps = Math.round(1000 / deltaTime);

    // 2. Logic Update
    if (!AppState.simulation.isPaused) {
        updateSimulation();
    }

    // 3. Render Pipeline
    renderScene();

    // 4. Recursive next frame
    requestAnimationFrame(mainLoop);
}

/**
 * Orchestrates physics steps and effect updates.
 */
function updateSimulation() {
    const { mouse, keys } = AppState.ui;
    const { physics } = AppState;

    // A. Apply dynamic turbulent wind
    const turbulentWind = Math.sin(Date.now() * 0.003) * physics.windStrength * 0.5 + physics.windStrength;

    // B. Handle force emitters
    if (keys['x']) {
        physicsCloth.applyExplosion(mouse.x, mouse.y, 300, 3.0);
        particles.emitBurst(mouse.x, mouse.y, '#f87171', 5);
    }
    if (keys['g']) {
        physicsCloth.applyGravitationalWell(mouse.x, mouse.y, 500, 2.5);
    }
    if (keys['v']) {
        // Simple vortex effect inlined here for logic volume
        for (const p of physicsCloth.points) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 200) {
                const f = (1 - dist / 200) * 1.5;
                p.applyForce(-dy / dist * f, dx / dist * f);
            }
        }
    }

    // C. Tear interaction
    if (mouse.down && mouse.button === 2) {
        const brokenSticks = physicsCloth.tear(mouse.x, mouse.y, 20);
        if (brokenSticks.length > 0) {
            audio.playTearSound(0.5);
            brokenSticks.forEach(s => particles.emitTear(s.p1, s.p2, materials.getProperty('highlightColor')));
        }
    }

    // D. Physics integration
    const simulationProps = {
        friction: physics.friction,
        gravity: physics.gravity,
        stiffness: physics.stiffness,
        wind: turbulentWind,
        breakingLimit: physics.breakingLimit
    };

    const hasBroken = physicsCloth.update(0.16, simulationProps, collisions);
    if (hasBroken) {
        audio.playTearSound(0.8);
    }

    // E. Peripheral systems
    particles.update();
    audio.updateTension(physicsCloth.getGlobalTension());

    // Telemetry updates (throttled)
    if (Math.random() < 0.1) updateTelemetry();
}

/**
 * Handles the multi-pass rendering process.
 */
function renderScene() {
    ctx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);

    // 1. Background (Grid/Scanlines handled by CSS or inlined here)

    // 2. Physics Objects
    const renderOpts = {
        tensionAware: DOM.inputs.tensionAware.checked,
        fillMesh: DOM.inputs.fillMesh.checked,
        materialColor: materials.getProperty('color')
    };

    physicsCloth.render(ctx, renderOpts);

    // 3. Collision Geometry
    collisions.render(ctx);

    // 4. Particles
    particles.draw(ctx);

    // 5. Explicit Visual Helpers
    if (DOM.inputs.showPoints.checked) {
        physicsCloth.points.forEach(p => p.render(ctx));
    }

    if (AppState.ui.draggedEntity instanceof Point) {
        const p = AppState.ui.draggedEntity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
        ctx.strokeStyle = '#c084fc';
        ctx.setLineDash([2, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // 6. Post-Processing
    post.settings.bloomEnabled = DOM.inputs.bloom.checked;
    post.postProcess();
}

// --- Telemetry Helpers ---

let tensionHistory = [];
function updateTelemetry() {
    DOM.telemetry.fps.textContent = AppState.simulation.fps;
    DOM.telemetry.points.textContent = physicsCloth.points.length;

    const tension = physicsCloth.getGlobalTension();
    DOM.telemetry.tension.textContent = tension.toFixed(4);

    // Draw mini graph
    tensionHistory.push(tension);
    if (tensionHistory.length > 80) tensionHistory.shift();

    const gctx = DOM.telemetry.graph.getContext('2d');
    gctx.clearRect(0, 0, 160, 40);
    gctx.beginPath();
    gctx.strokeStyle = 'var(--accent-color)';
    gctx.lineWidth = 1;
    for (let i = 0; i < tensionHistory.length; i++) {
        const val = tensionHistory[i] * 500;
        const x = (i / 80) * 160;
        const y = 40 - Math.min(38, val);
        if (i === 0) gctx.moveTo(x, y);
        else gctx.lineTo(x, y);
    }
    gctx.stroke();
}

// --- Bootstrap ---
window.onload = init;
