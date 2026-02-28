/**
 * Retro-Racer Engine
 * A Pseudo-3D racing engine based on 80s arcade scanline projection techniques.
 * Math concepts: Perspective Projection, Z-coordinate scaling, Camera Transforms.
 */

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// --- Config ---
const FPS = 60;
const STEP = 1/FPS;
const ROAD_WIDTH = 2000;
const SEGMENT_LENGTH = 200;
const RUMBLE_LENGTH = 3;
const DRAW_DISTANCE = 300; // Segments to draw
const FIELD_OF_VIEW = 100;
const CAMERA_HEIGHT = 1000;
const CAMERA_DEPTH = 1 / Math.tan((FIELD_OF_VIEW / 2) * Math.PI / 180);

// --- State ---
let width, height;
let segments = [];
let playerX = 0;
let position = 0; // Camera Z
let speed = 0;
let maxSpeed = 12000; // Scaled units
let accel = 100;
let breaking = 300;
let decel = 50;
let offRoadDecel = 200;
let offRoadLimit = 2000; // Road width is 2000, so >1000 is offroad
let keys = {};
let isPlaying = false;
let gameTime = 0;

// --- Colors ---
const COLORS = {
    sky: '#0984e3',
    tree: '#005c09',
    road: {
        light: { road: '#6b6b6b', grass: '#10ac84', rumble: '#555' },
        dark:  { road: '#636363', grass: '#009470', rumble: '#bbbbbb' }
    }
};

// --- Initialization ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupControls();
    resetRoad();
    
    document.getElementById('btn-start').addEventListener('click', startGame);
    
    // Initial draw (static)
    render();
}

function resizeCanvas() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
}

function setupControls() {
    window.addEventListener('keydown', e => keys[e.key] = true);
    window.addEventListener('keyup', e => keys[e.key] = false);
}

// --- Road Generation ---

function resetRoad() {
    segments = [];
    createRoad();
}

function createRoad() {
    // Generate segments
    addStraight(50);
    addCurve(100, 2);
    addHill(100, 4000);
    addCurve(100, -2);
    addHill(100, -4000);
    addStraight(200);
}

function addSegment(curve, y) {
    const n = segments.length;
    segments.push({
        index: n,
        p1: { world: { x: 0, y: lastY(), z: n * SEGMENT_LENGTH }, camera: {}, screen: {} },
        p2: { world: { x: 0, y: y,       z: (n + 1) * SEGMENT_LENGTH }, camera: {}, screen: {} },
        curve: curve,
        color: Math.floor(n / RUMBLE_LENGTH) % 2 ? COLORS.road.dark : COLORS.road.light
    });
}

function lastY() {
    return (segments.length === 0) ? 0 : segments[segments.length - 1].p2.world.y;
}

function addStraight(num) {
    for(let i=0; i<num; i++) addSegment(0, lastY());
}

function addCurve(num, curve) {
    for(let i=0; i<num; i++) addSegment(curve, lastY());
}

function addHill(num, height) {
    for(let i=0; i<num; i++) {
        const y = lastY() + (height / num) * Math.cos(i/num * Math.PI/2);
        addSegment(0, y);
    }
}

// --- Logic ---

function startGame() {
    isPlaying = true;
    document.getElementById('start-screen').classList.add('hidden');
    gameTime = 0;
    speed = 0;
    position = 0;
    requestAnimationFrame(loop);
}

function update(dt) {
    gameTime += dt;
    
    // Throttle
    if (keys['ArrowUp']) speed += accel;
    else if (keys['ArrowDown']) speed -= breaking;
    else speed -= decel;

    // Clamp speed
    speed = Math.max(0, Math.min(speed, maxSpeed));

    // Move Camera
    position += speed * dt;
    // Loop track
    while (position >= segments.length * SEGMENT_LENGTH) position -= segments.length * SEGMENT_LENGTH;
    while (position < 0) position += segments.length * SEGMENT_LENGTH;

    // Steering (Steering is fake! We actually move the "Player X" offset)
    const segIndex = Math.floor(position / SEGMENT_LENGTH);
    const playerSegment = segments[segIndex];
    
    const speedPercent = speed / maxSpeed;
    const dx = dt * 2 * speedPercent; // Steering sensitivity based on speed

    if (keys['ArrowLeft']) playerX -= dx;
    if (keys['ArrowRight']) playerX += dx;

    // Centrifugal Force from curve
    playerX -= dx * speedPercent * playerSegment.curve * 2;

    // Off-road slowdown
    if ((playerX < -1 || playerX > 1) && speed > offRoadDecel) {
        speed -= offRoadDecel; // Slow down on grass
    }

    // Update HUD
    document.getElementById('speed-val').innerText = Math.floor(speed / 60); // Fake km/h
    document.getElementById('dist-val').innerText = Math.floor(position / 100);
    document.getElementById('time-val').innerText = gameTime.toFixed(2);
}

// --- Rendering Core (The Pseudo-3D Magic) ---

function project(p, cameraX, cameraY, cameraZ, cameraDepth) {
    // Translate world to camera
    p.camera.x = (p.world.x || 0) - cameraX;
    p.camera.y = (p.world.y || 0) - cameraY;
    p.camera.z = (p.world.z || 0) - cameraZ;

    // Screen scale factor (The perspective formula)
    // scale = depth / z
    p.screen.scale = cameraDepth / p.camera.z;

    // Project to screen coords
    // x = screenW/2 + (camX * scale * screenW/2)
    p.screen.x = Math.round((width / 2) + (p.screen.scale * p.camera.x * width / 2));
    p.screen.y = Math.round((height / 2) - (p.screen.scale * p.camera.y * height / 2));
    p.screen.w = Math.round((p.screen.scale * ROAD_WIDTH * width / 2));
}

function render() {
    ctx.clearRect(0, 0, width, height);

    // 1. Background (Parallax)
    ctx.fillStyle = COLORS.sky;
    ctx.fillRect(0, 0, width, height);
    // Add sun/mountains here if desired

    // 2. Find start segment
    const startPos = position;
    const startIdx = Math.floor(startPos / SEGMENT_LENGTH);
    const cameraH = CAMERA_HEIGHT + segments[startIdx].p1.world.y; // Follow hills
    
    let maxY = height; // Clipping buffer
    let x = 0;
    let dx = 0;

    // 3. Draw Road Segments
    for (let n = startIdx; n < startIdx + DRAW_DISTANCE; n++) {
        const segment = segments[n % segments.length];
        
        // Loop Z coordinate if we are wrapping around track end
        const loopedIndex = n >= segments.length ? segments.length * SEGMENT_LENGTH : 0;
        
        // Project Points
        // P1 is near, P2 is far
        segment.p1.world.z = (n * SEGMENT_LENGTH) - startPos;
        segment.p2.world.z = ((n + 1) * SEGMENT_LENGTH) - startPos;
        
        // If behind camera, skip
        if (segment.p1.world.z < CAMERA_DEPTH) continue;

        // Apply Curve Offset to Camera X (Simulate turning)
        x += dx;
        dx += segment.curve;

        // Projection math
        project(segment.p1, (playerX * ROAD_WIDTH) - x, cameraH, 0, CAMERA_DEPTH);
        project(segment.p2, (playerX * ROAD_WIDTH) - x - dx, cameraH, 0, CAMERA_DEPTH);

        const x1 = segment.p1.screen.x;
        const y1 = segment.p1.screen.y;
        const w1 = segment.p1.screen.w;
        const x2 = segment.p2.screen.x;
        const y2 = segment.p2.screen.y;
        const w2 = segment.p2.screen.w;

        // Clip logic: Ignore segments hidden behind hills
        if (y2 >= maxY) continue;
        maxY = y2; // New clip horizon

        // Draw Grass
        ctx.fillStyle = segment.color.grass;
        ctx.fillRect(0, y2, width, y1 - y2);

        // Draw Road
        drawPolygon(
            x1 - w1, y1,
            x1 + w1, y1,
            x2 + w2, y2,
            x2 - w2, y2,
            segment.color.road
        );

        // Draw Rumble Strips
        const rumbleW1 = w1 * 0.15;
        const rumbleW2 = w2 * 0.15;
        
        ctx.fillStyle = segment.color.rumble;
        // Left Rumble
        drawPolygon(x1-w1-rumbleW1, y1, x1-w1, y1, x2-w2, y2, x2-w2-rumbleW2, y2, segment.color.rumble);
        // Right Rumble
        drawPolygon(x1+w1, y1, x1+w1+rumbleW1, y1, x2+w2+rumbleW2, y2, x2+w2, y2, segment.color.rumble);
        
        // Draw Lane Line (only if light segment)
        if ((n / RUMBLE_LENGTH) % 2 === 0) {
            const laneW1 = w1 * 0.05;
            const laneW2 = w2 * 0.05;
            drawPolygon(x1 - laneW1, y1, x1 + laneW1, y1, x2 + laneW2, y2, x2 - laneW2, y2, '#fff');
        }
    }

    // 4. Draw Player Car (Static sprite centered)
    // Simple pixel art car
    const carW = 160;
    const carH = 80;
    const carX = width / 2 - carW / 2;
    const carY = height - carH - 20;
    
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(carX + 10, carY + carH - 10, carW - 20, 10);

    // Body
    ctx.fillStyle = '#d63031';
    ctx.fillRect(carX, carY + 30, carW, 40); // Main chassis
    ctx.fillStyle = '#ff7675';
    ctx.fillRect(carX + 20, carY, carW - 40, 30); // Roof
    
    // Lights
    ctx.fillStyle = '#ffeaa7';
    ctx.fillRect(carX + 10, carY + 40, 20, 10); // Left
    ctx.fillRect(carX + carW - 30, carY + 40, 20, 10); // Right
    
    // Wheels (Simulate rolling by flickering)
    const wheelOffset = (Math.floor(position / 50) % 2) * 2;
    ctx.fillStyle = '#000';
    ctx.fillRect(carX + 10, carY + 60 + wheelOffset, 30, 20);
    ctx.fillRect(carX + carW - 40, carY + 60 + wheelOffset, 30, 20);
}

function drawPolygon(x1, y1, x2, y2, x3, y3, x4, y4, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.lineTo(x4, y4);
    ctx.closePath();
    ctx.fill();
}

let lastTime = 0;
function loop(timestamp) {
    if (!isPlaying) return;
    const dt = Math.min(1, (timestamp - lastTime) / 1000);
    lastTime = timestamp;

    update(dt);
    render();
    requestAnimationFrame(loop);
}

// Start
init();