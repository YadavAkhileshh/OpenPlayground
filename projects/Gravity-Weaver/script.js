/**
 * Gravity-Weaver Engine
 * Implements Newtonian Physics (Inverse Square Law) and Mesh Deformation.
 */

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// --- Physics Config ---
const GRAVITY_CONST = 2000; // Strength of user wells
const FRICTION = 0.99; // Space drag (very low)
const GRID_SIZE = 40;
const ENERGY_REGEN = 0.5;
const ENERGY_DRAIN = 1.5;

// --- State ---
let width, height;
let gameState = 'start'; // start, playing, dead, win
let level = 1;
let energy = 100;
let mouse = { x: 0, y: 0, active: false };
let activeWells = [];

// --- Entities ---
let player = { x: 100, y: 100, vx: 0, vy: 0, radius: 8 };
let exit = { x: 0, y: 0, radius: 20 };
let obstacles = [];
let gridPoints = []; // Background mesh

// --- Levels ---
const LEVELS = [
    // Level 1: Straight shot
    {
        start: {x: 100, y: 300},
        exit: {x: 700, y: 300},
        obstacles: []
    },
    // Level 2: The Wall
    {
        start: {x: 100, y: 300},
        exit: {x: 700, y: 300},
        obstacles: [
            {x: 400, y: 200, w: 50, h: 400, type: 'rect'}
        ]
    },
    // Level 3: Slingshot curve
    {
        start: {x: 100, y: 500},
        exit: {x: 700, y: 100},
        obstacles: [
            {x: 300, y: 300, w: 200, h: 50, type: 'rect'},
            {x: 600, y: 0, w: 50, h: 300, type: 'rect'}
        ]
    }
];

// --- Initialization ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupInput();
    
    document.getElementById('btn-start').onclick = startGame;
    document.getElementById('btn-retry').onclick = restartLevel;
    document.getElementById('btn-next').onclick = nextLevel;

    createGrid();
    loadLevel(0);
    loop();
}

function resizeCanvas() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
    createGrid();
}

function setupInput() {
    canvas.addEventListener('mousedown', () => mouse.active = true);
    canvas.addEventListener('mouseup', () => mouse.active = false);
    canvas.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });
    // Touch support
    canvas.addEventListener('touchstart', (e) => {
        mouse.active = true;
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.touches[0].clientX - rect.left;
        mouse.y = e.touches[0].clientY - rect.top;
        e.preventDefault();
    });
    canvas.addEventListener('touchend', () => mouse.active = false);
    canvas.addEventListener('touchmove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.touches[0].clientX - rect.left;
        mouse.y = e.touches[0].clientY - rect.top;
        e.preventDefault();
    });
}

function createGrid() {
    gridPoints = [];
    for (let x = 0; x <= width; x += GRID_SIZE) {
        for (let y = 0; y <= height; y += GRID_SIZE) {
            gridPoints.push({
                x: x, y: y, // Dynamic pos
                ox: x, oy: y // Original pos
            });
        }
    }
}

function loadLevel(idx) {
    if (idx >= LEVELS.length) idx = 0;
    level = idx + 1;
    const data = LEVELS[idx];
    
    player.x = data.start.x;
    player.y = data.start.y;
    player.vx = 0; player.vy = 0;
    
    exit.x = data.exit.x;
    exit.y = data.exit.y;
    
    obstacles = data.obstacles.map(o => ({...o}));
    energy = 100;
    
    document.getElementById('level-val').innerText = level;
    gameState = 'playing'; // Or wait for start
}

// --- Game Logic ---

function startGame() {
    gameState = 'playing';
    document.getElementById('tutorial').classList.add('hidden');
}

function restartLevel() {
    loadLevel(level - 1);
    document.getElementById('game-over').classList.add('hidden');
}

function nextLevel() {
    if (level >= LEVELS.length) {
        // Loop or finish
        level = 0; 
    }
    loadLevel(level);
    document.getElementById('victory').classList.add('hidden');
}

function update() {
    if (gameState !== 'playing') return;

    // 1. Handle Gravity Input
    if (mouse.active && energy > 0) {
        energy = Math.max(0, energy - ENERGY_DRAIN);
        
        // Apply Force to Player 
        // F = G * M / r^2
        const dx = mouse.x - player.x;
        const dy = mouse.y - player.y;
        const distSq = dx*dx + dy*dy;
        const dist = Math.sqrt(distSq);
        
        if (dist > 10) { // Avoid singularity
            const force = GRAVITY_CONST / distSq;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            
            player.vx += fx;
            player.vy += fy;
        }
    } else {
        energy = Math.min(100, energy + ENERGY_REGEN);
    }
    
    document.getElementById('energy-bar').style.width = energy + '%';

    // 2. Physics & Movement
    player.x += player.vx;
    player.y += player.vy;
    
    // Friction (Space drag?)
    player.vx *= FRICTION;
    player.vy *= FRICTION;

    // 3. Grid Deformation Logic (Visuals)
    for (let p of gridPoints) {
        // Reset towards original
        p.x += (p.ox - p.x) * 0.1;
        p.y += (p.oy - p.y) * 0.1;

        if (mouse.active) {
            const dx = mouse.x - p.x;
            const dy = mouse.y - p.y;
            const dSq = dx*dx + dy*dy;
            const dist = Math.sqrt(dSq);
            
            // Grid gets pulled towards mouse
            if (dist < 300) {
                const pull = (300 - dist) * 0.05;
                const angle = Math.atan2(dy, dx);
                p.x += Math.cos(angle) * pull;
                p.y += Math.sin(angle) * pull;
            }
        }
    }

    checkCollisions();
}

function checkCollisions() {
    // 1. Bounds
    if (player.x < 0 || player.x > width || player.y < 0 || player.y > height) {
        die();
    }

    // 2. Obstacles (AABB)
    for (let o of obstacles) {
        if (player.x + player.radius > o.x && 
            player.x - player.radius < o.x + o.w &&
            player.y + player.radius > o.y && 
            player.y - player.radius < o.y + o.h) {
            die();
        }
    }

    // 3. Exit (Circle-Circle)
    const dx = player.x - exit.x;
    const dy = player.y - exit.y;
    if (Math.sqrt(dx*dx + dy*dy) < player.radius + exit.radius) {
        win();
    }
}

function die() {
    gameState = 'dead';
    document.getElementById('game-over').classList.remove('hidden');
}

function win() {
    gameState = 'win';
    document.getElementById('victory').classList.remove('hidden');
}

// --- Rendering ---

function draw() {
    // Clear
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, width, height);

    // 1. Draw Grid
    ctx.strokeStyle = 'rgba(64, 224, 208, 0.15)';
    ctx.lineWidth = 1;
    
    // Draw horizontal lines (connecting points)
    // Note: This is an inefficient grid draw loop for simplicity. 
    // Ideally we would index them properly.
    // For Level 3/Hard, we just iterate smartly.
    
    const rows = Math.ceil(height / GRID_SIZE) + 1;
    const cols = Math.ceil(width / GRID_SIZE) + 1;

    ctx.beginPath();
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const idx = x * rows + y; // Column-major logic if we stored it that way
            // Actually, let's just use the flat array logic:
            // gridPoints structure is row-by-row or linear? 
            // My init loop: x outer, y inner -> Column Major
            
            if (idx >= gridPoints.length) continue;
            const p = gridPoints[idx];

            // Connect Down
            if (y < rows - 1) {
                const down = gridPoints[idx + 1];
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(down.x, down.y);
            }
            // Connect Right
            if (x < cols - 1) {
                const right = gridPoints[idx + rows];
                if (right) {
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(right.x, right.y);
                }
            }
        }
    }
    ctx.stroke();

    // 2. Draw Gravity Well
    if (mouse.active) {
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 15, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(64, 224, 208, 0.8)';
        ctx.fill();
        
        // Gravity Radius Aura
        const grad = ctx.createRadialGradient(mouse.x, mouse.y, 10, mouse.x, mouse.y, 100);
        grad.addColorStop(0, 'rgba(64, 224, 208, 0.3)');
        grad.addColorStop(1, 'rgba(64, 224, 208, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 100, 0, Math.PI * 2);
        ctx.fill();
    }

    // 3. Draw Obstacles
    ctx.fillStyle = '#ff0055';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff0055';
    for (let o of obstacles) {
        ctx.fillRect(o.x, o.y, o.w, o.h);
        // Inner detail
        ctx.strokeStyle = '#ff99aa';
        ctx.strokeRect(o.x, o.y, o.w, o.h);
    }
    ctx.shadowBlur = 0;

    // 4. Draw Exit
    ctx.beginPath();
    ctx.arc(exit.x, exit.y, exit.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#00ff88';
    ctx.fill();
    // Pulse ring
    ctx.beginPath();
    ctx.arc(exit.x, exit.y, exit.radius + Math.sin(Date.now() / 200) * 5, 0, Math.PI * 2);
    ctx.strokeStyle = '#00ff88';
    ctx.stroke();

    // 5. Draw Player
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#fff';
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Start
init();