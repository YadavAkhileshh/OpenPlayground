/**
 * Snake on a Cube Engine
 * Handles 3D projection, face wrapping logic, and game state.
 */

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// --- Config ---
const GRID_SIZE = 11; // Grid per face (odd number helps centering)
const CUBE_SIZE = 300; // Visual size in pixels
const SPEED = 150; // ms per tick

// --- State ---
let width, height;
let snake = []; // Array of {face, x, y}
let food = {face: 0, x: 0, y: 0};
let direction = {x: 1, y: 0}; // Local grid direction
let nextDir = {x: 1, y: 0};
let isPlaying = false;
let score = 0;
let lastTime = 0;

// Camera Rotation (Target and Current)
let rotX = 0, rotY = 0;
let targetRotX = 0, targetRotY = 0;

// Face Topology (Adjacency Graph)
// 0: Front, 1: Right, 2: Back, 3: Left, 4: Top, 5: Bottom
const FACES = [
    { id: 0, color: '#222', normal: [0, 0, 1] },
    { id: 1, color: '#2a2a2a', normal: [1, 0, 0] },
    { id: 2, color: '#333', normal: [0, 0, -1] },
    { id: 3, color: '#2a2a2a', normal: [-1, 0, 0] },
    { id: 4, color: '#222', normal: [0, -1, 0] },
    { id: 5, color: '#333', normal: [0, 1, 0] }
];

// --- Math / 3D Helpers ---

function project(x, y, z) {
    // Simple rotation matrices
    // Rotate Y
    let x1 = x * Math.cos(rotY) - z * Math.sin(rotY);
    let z1 = z * Math.cos(rotY) + x * Math.sin(rotY);
    
    // Rotate X
    let y2 = y * Math.cos(rotX) - z1 * Math.sin(rotX);
    let z2 = z1 * Math.cos(rotX) + y * Math.sin(rotX);
    
    // Perspective
    let scale = 1000 / (1000 - z2);
    return {
        x: width/2 + x1 * scale,
        y: height/2 + y2 * scale,
        z: z2 // for Z-sorting
    };
}

// Get 3D coords of a point on a specific face
function getFacePoint(faceId, gx, gy) {
    // Map grid (0..GRID) to local 3D (-1..1)
    const s = CUBE_SIZE / 2;
    // Normalized grid coords (-1 to 1)
    const u = (gx / (GRID_SIZE - 1)) * 2 - 1;
    const v = (gy / (GRID_SIZE - 1)) * 2 - 1;
    
    // Return 3D point based on face orientation
    switch(faceId) {
        case 0: return {x: u*s, y: v*s, z: s};   // Front
        case 1: return {x: s, y: v*s, z: -u*s};  // Right
        case 2: return {x: -u*s, y: v*s, z: -s}; // Back
        case 3: return {x: -s, y: v*s, z: u*s};  // Left
        case 4: return {x: u*s, y: -s, z: v*s};  // Top
        case 5: return {x: u*s, y: s, z: -v*s};  // Bottom
    }
}

// --- Init ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupInput();
    requestAnimationFrame(loop);
}

function resizeCanvas() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
}

function startGame() {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-over').classList.add('hidden');
    
    snake = [
        {face: 0, x: 5, y: 5},
        {face: 0, x: 4, y: 5},
        {face: 0, x: 3, y: 5}
    ];
    direction = {x: 1, y: 0};
    nextDir = {x: 1, y: 0};
    spawnFood();
    score = 0;
    isPlaying = true;
    
    // Reset Camera
    targetRotX = 0;
    targetRotY = 0;
}

function spawnFood() {
    // Random face, random pos
    while(true) {
        const f = Math.floor(Math.random() * 6);
        const x = Math.floor(Math.random() * GRID_SIZE);
        const y = Math.floor(Math.random() * GRID_SIZE);
        
        // Check collision with snake
        const hit = snake.some(s => s.face === f && s.x === x && s.y === y);
        if(!hit) {
            food = {face: f, x: x, y: y};
            break;
        }
    }
}

// --- Logic ---

function update(dt) {
    if (!isPlaying) return;

    // Smooth Camera Rotation
    rotX += (targetRotX - rotX) * 0.1;
    rotY += (targetRotY - rotY) * 0.1;

    if (Date.now() - lastTime > SPEED) {
        moveSnake();
        lastTime = Date.now();
    }
}

function moveSnake() {
    direction = nextDir;
    const head = snake[0];
    let newHead = { ...head };
    
    newHead.x += direction.x;
    newHead.y += direction.y;
    
    // Check Face Wrapping
    // Grid is 0 to 10. Bounds are < 0 or > 10.
    if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        wrapFace(newHead);
    }
    
    // Collision Self
    if (snake.some(s => s.face === newHead.face && s.x === newHead.x && s.y === newHead.y)) {
        gameOver();
        return;
    }
    
    snake.unshift(newHead);
    
    // Food
    if (newHead.face === food.face && newHead.x === food.x && newHead.y === food.y) {
        score++;
        document.getElementById('score-val').innerText = score;
        spawnFood();
    } else {
        snake.pop();
    }
}

function wrapFace(pos) {
    // Transition Logic Table
    // Simplified standard unwrapped cube logic
    const f = pos.face;
    const max = GRID_SIZE - 1;
    
    // Right Edge
    if (pos.x > max) {
        if (f === 0) { pos.face = 1; pos.x = 0; targetRotY -= Math.PI/2; }
        else if (f === 1) { pos.face = 2; pos.x = 0; targetRotY -= Math.PI/2; }
        else if (f === 2) { pos.face = 3; pos.x = 0; targetRotY -= Math.PI/2; }
        else if (f === 3) { pos.face = 0; pos.x = 0; targetRotY -= Math.PI/2; }
        else if (f === 4) { pos.face = 1; pos.x = pos.y; pos.y = 0; direction = {x:0, y:1}; nextDir = direction; } // Top->Right
        else if (f === 5) { pos.face = 1; pos.x = max - pos.y; pos.y = max; direction = {x:0, y:-1}; nextDir = direction; } // Bot->Right
    }
    // Left Edge
    else if (pos.x < 0) {
        if (f === 0) { pos.face = 3; pos.x = max; targetRotY += Math.PI/2; }
        else if (f === 1) { pos.face = 0; pos.x = max; targetRotY += Math.PI/2; }
        else if (f === 2) { pos.face = 1; pos.x = max; targetRotY += Math.PI/2; }
        else if (f === 3) { pos.face = 2; pos.x = max; targetRotY += Math.PI/2; }
        else if (f === 4) { pos.face = 3; pos.x = max - pos.y; pos.y = 0; direction = {x:0, y:1}; nextDir = direction; }
        else if (f === 5) { pos.face = 3; pos.x = pos.y; pos.y = max; direction = {x:0, y:-1}; nextDir = direction; }
    }
    // Bottom Edge
    else if (pos.y > max) {
        if (f === 0) { pos.face = 5; pos.y = 0; targetRotX -= Math.PI/2; }
        else if (f === 1) { pos.face = 5; pos.y = pos.x; pos.x = max; direction = {x:-1, y:0}; nextDir = direction; }
        else if (f === 2) { pos.face = 5; pos.y = max; pos.x = max - pos.x; direction = {x:0, y:-1}; nextDir = direction; targetRotX -= Math.PI/2; } // Back flips
        else if (f === 3) { pos.face = 5; pos.y = max - pos.x; pos.x = 0; direction = {x:1, y:0}; nextDir = direction; }
        else if (f === 4) { pos.face = 0; pos.y = 0; targetRotX -= Math.PI/2; } // Top->Front
        else if (f === 5) { pos.face = 2; pos.y = max; targetRotX -= Math.PI/2; } // Bot->Back
    }
    // Top Edge
    else if (pos.y < 0) {
        if (f === 0) { pos.face = 4; pos.y = max; targetRotX += Math.PI/2; }
        else if (f === 1) { pos.face = 4; pos.y = max - pos.x; pos.x = max; direction = {x:-1, y:0}; nextDir = direction; }
        else if (f === 2) { pos.face = 4; pos.y = 0; pos.x = max - pos.x; direction = {x:0, y:1}; nextDir = direction; targetRotX += Math.PI/2; }
        else if (f === 3) { pos.face = 4; pos.y = pos.x; pos.x = 0; direction = {x:1, y:0}; nextDir = direction; }
        else if (f === 4) { pos.face = 2; pos.y = 0; targetRotX += Math.PI/2; }
        else if (f === 5) { pos.face = 0; pos.y = max; targetRotX += Math.PI/2; }
    }
}

function gameOver() {
    isPlaying = false;
    document.getElementById('final-score').innerText = snake.length;
    document.getElementById('game-over').classList.remove('hidden');
}

// --- Draw ---

function draw() {
    ctx.clearRect(0, 0, width, height);
    
    // Sort faces by Z-depth (Painters Algorithm)
    // Calc center Z of each face
    const renderOrder = FACES.map(f => {
        const center = getFacePoint(f.id, (GRID_SIZE-1)/2, (GRID_SIZE-1)/2);
        const proj = project(center.x, center.y, center.z);
        return { face: f, z: proj.z };
    }).sort((a, b) => a.z - b.z); // Draw far to near
    
    // Draw Each Face
    renderOrder.forEach(item => {
        const f = item.face;
        drawFace(f);
    });
}

function drawFace(face) {
    // Get 4 Corners
    const p1 = project3D(getFacePoint(face.id, 0, 0));
    const p2 = project3D(getFacePoint(face.id, GRID_SIZE-1, 0));
    const p3 = project3D(getFacePoint(face.id, GRID_SIZE-1, GRID_SIZE-1));
    const p4 = project3D(getFacePoint(face.id, 0, GRID_SIZE-1));
    
    // Draw Quad Background
    ctx.fillStyle = face.color;
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.lineTo(p4.x, p4.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Draw Grid Items (Snake & Food)
    // Filter snake parts on this face
    const parts = snake.filter(s => s.face === face.id);
    parts.forEach(p => {
        drawCell(face.id, p.x, p.y, '#00ff88');
    });
    
    if (food.face === face.id) {
        drawCell(face.id, food.x, food.y, '#ff4757');
    }
}

function drawCell(faceId, gx, gy, color) {
    // Project cell corners
    // Cell size in grid coords is 1. We draw slightly smaller (0.8)
    const padding = 0.1;
    const c1 = project3D(getFacePoint(faceId, gx+padding, gy+padding));
    const c2 = project3D(getFacePoint(faceId, gx+1-padding, gy+padding));
    const c3 = project3D(getFacePoint(faceId, gx+1-padding, gy+1-padding));
    const c4 = project3D(getFacePoint(faceId, gx+padding, gy+1-padding));
    
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(c1.x, c1.y);
    ctx.lineTo(c2.x, c2.y);
    ctx.lineTo(c3.x, c3.y);
    ctx.lineTo(c4.x, c4.y);
    ctx.closePath();
    ctx.fill();
}

function project3D(p) {
    return project(p.x, p.y, p.z);
}

// --- Inputs ---

function setupInput() {
    window.addEventListener('keydown', e => {
        const k = e.key;
        if (k === 'w' || k === 'ArrowUp') if (direction.y !== 1) nextDir = {x: 0, y: -1};
        if (k === 's' || k === 'ArrowDown') if (direction.y !== -1) nextDir = {x: 0, y: 1};
        if (k === 'a' || k === 'ArrowLeft') if (direction.x !== 1) nextDir = {x: -1, y: 0};
        if (k === 'd' || k === 'ArrowRight') if (direction.x !== -1) nextDir = {x: 1, y: 0};
    });
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Start
init();