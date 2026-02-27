/**
 * Main Entry Point
 */

// Global Systems
const terrain = new Terrain();
const environment = new Environment(terrain);
const particles = new ParticleSystem();
const audio = new AudioSynth();
const hud = new HUD();
const solver = new IKSolver();
const body = new Body();
const gait = new GaitController(body);
const sensors = new SensorArray(body);
const renderer = new Renderer('worldCanvas');

// expose to window
window.particles = particles;
window.audio = audio;

// State
let isDragging = false;
let dragOffset = new Vector2(0, 0);
let lastTime = 0;
let fps = 60;
let targetBodyHeight = 120;
let debugMode = false;

// UI Elements
const uiIds = {
    bodyHeight: document.getElementById('bodyHeight'),
    stepSpeed: document.getElementById('stepSpeed'),
    terrainRoughness: document.getElementById('terrainRoughness'),
    fpsCounter: document.getElementById('fpsCounter'),
    gaitState: document.getElementById('gaitState'),
    toggleDebug: document.getElementById('toggleDebug'),
    resetSim: document.getElementById('resetSim')
};

function init() {
    // Initial Positioning
    const startY = terrain.getHeight(0) - targetBodyHeight;
    body.setPosition(0, startY);

    // Snap feet to ground initially
    body.legs.forEach(leg => {
        const worldX = body.position.x + leg.offset.x;
        const groundY = terrain.getHeight(worldX);
        leg.target = new Vector2(worldX, groundY);
        leg.stepEnd = leg.target.copy();
    });

    setupInput();
    setupUI();

    requestAnimationFrame(loop);
}

function loop(timestamp) {
    const dt = timestamp - lastTime;
    lastTime = timestamp;

    // Update FPS
    if (timestamp % 20 < 1) { // Throttle DOM updates
        fps = Math.round(1000 / dt);
        uiIds.fpsCounter.innerText = fps;
    }

    // Physics / Logic
    if (!isDragging) {
        // Auto-balance body height
        // Find average foot height
        let avgFootY = 0;
        body.legs.forEach(leg => avgFootY += leg.target.y);
        avgFootY /= body.legs.length;

        const desiredY = avgFootY - targetBodyHeight;
        // Smoothly move body to desired height
        body.position.y += (desiredY - body.position.y) * 0.05;
    }

    // Update Systems
    body.update(terrain, solver);
    gait.update(terrain);
    particles.update();
    sensors.update(terrain);
    hud.update(fps);

    // Render
    renderer.render(terrain, body, environment, particles);
    sensors.draw(renderer.ctx);
    hud.draw(renderer.ctx, renderer.width, renderer.height, body);

    requestAnimationFrame(loop);
}

function setupInput() {
    const canvas = renderer.canvas;

    canvas.addEventListener('mousedown', e => {
        const rect = canvas.getBoundingClientRect();
        const worldMouse = new Vector2(
            (e.clientX - rect.left - renderer.width / 2) / renderer.zoom + body.position.x,
            (e.clientY - rect.top - renderer.height / 2) / renderer.zoom + body.position.y - 100
        );

        // Check intersection with body
        if (worldMouse.dist(body.position) < 50) {
            isDragging = true;
            dragOffset = Vector2.sub(body.position, worldMouse);
            canvas.style.cursor = 'grabbing';
            audio.resume(); // Resume audio context
        }
    });

    window.addEventListener('mousemove', e => {
        if (!isDragging) return;

        const movementX = e.movementX / renderer.zoom;
        const movementY = e.movementY / renderer.zoom;

        body.position.x += movementX;
        body.position.y += movementY;
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
        canvas.style.cursor = 'grab';
    });
}

function setupUI() {
    uiIds.bodyHeight.addEventListener('input', e => {
        targetBodyHeight = parseInt(e.target.value);
        document.getElementById('bodyHeightVal').innerText = targetBodyHeight;
    });

    uiIds.stepSpeed.addEventListener('input', e => {
        const val = parseInt(e.target.value);
        document.getElementById('stepSpeedVal').innerText = val;
        body.legs.forEach(leg => leg.stepSpeed = val * 0.02);
    });

    uiIds.terrainRoughness.addEventListener('input', e => {
        const val = parseInt(e.target.value);
        document.getElementById('terrainRoughnessVal').innerText = val;
        terrain.updateParams({ roughness: val });
    });

    uiIds.toggleDebug.addEventListener('click', () => {
        debugMode = !debugMode;
        // Pass debug mode to renderer if implemented
    });

    uiIds.resetSim.addEventListener('click', () => {
        body.position.x = 0;
        init();
    });
}

// Start
window.onload = init;
