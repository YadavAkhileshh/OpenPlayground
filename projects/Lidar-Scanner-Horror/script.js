/**
 * LIDAR Raycasting Engine
 * Renders a 2D map as a 3D point cloud using raycasting.
 */

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// --- Config ---
const FOV = Math.PI / 3; // 60 degrees
const RAYS = 300; // Resolution of scanner
const MAX_DEPTH = 20; // Max render distance
const DOT_SIZE = 2;
const MAP_SIZE = 32;

// --- State ---
let width, height;
let player = { x: 3.5, y: 3.5, dir: 0 }; // Grid coordinates
let keys = {};
let points = []; // Array of active dots {x, y, alpha}
let isScanning = false;
let battery = 100;
let ghost = { x: 15.5, y: 15.5, active: true }; // Anomaly
let lastScanTime = 0;

// Simple Map (1 = Wall, 0 = Empty)
// A maze-like structure
const map = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,1,1,1,1,1,1,0,1,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,1],
    [1,0,1,0,1,1,1,1,1,0,1,1,1,0,1,0,1,0,1,1],
    [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,1],
    [1,1,1,0,1,0,1,0,1,1,1,0,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// --- Init ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupInput();
}

function resizeCanvas() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
}

function startGame() {
    document.getElementById('start-screen').classList.add('hidden');
    requestAnimationFrame(loop);
}

// --- Raycasting Logic ---

function castRays() {
    if (battery <= 0) return;
    battery -= 2;
    document.getElementById('scan-count').innerText = Math.floor(battery) + "%";

    const startAngle = player.dir - FOV / 2;
    const step = FOV / RAYS;

    for (let i = 0; i < RAYS; i++) {
        const rayAngle = startAngle + i * step;
        
        // Ray Data
        const res = rayMarch(player.x, player.y, rayAngle);
        
        if (res.hit) {
            // Calculate screen projection
            // Correct fisheye
            const dist = res.dist * Math.cos(rayAngle - player.dir);
            const wallH = (height / dist); // Perspective height

            // Map ray index to screen X
            const screenX = (i / RAYS) * width;
            
            // Randomly scatter dots along the vertical strip
            // To simulate "scanning", we don't draw a solid line.
            // We draw 5-10 random points along this vertical line.
            const density = Math.max(2, 20 / dist); // More dots if close
            
            for (let j = 0; j < density; j++) {
                // Random height along the wall strip
                // Center is height/2. Top is Center - H/2. Bottom is Center + H/2
                const yOffset = (Math.random() - 0.5) * wallH;
                const screenY = (height / 2) + yOffset;

                // Add to points list
                points.push({
                    x: screenX + (Math.random() - 0.5) * 2, // Slight jitter
                    y: screenY,
                    life: 1.0, // Opacity
                    color: res.isGhost ? '#ffffff' : '#ff3333' // Ghost is white
                });
            }
        }
    }
}

function rayMarch(px, py, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    let dist = 0;
    
    // Simple Raymarching (step size)
    const stepSize = 0.05;
    
    for (let d = 0; d < MAX_DEPTH; d += stepSize) {
        const mapX = px + cos * d;
        const mapY = py + sin * d;
        
        // Check Wall
        const mx = Math.floor(mapX);
        const my = Math.floor(mapY);
        
        // Bounds check
        if (my < 0 || my >= map.length || mx < 0 || mx >= map[0].length) {
            return { hit: true, dist: d, isGhost: false };
        }

        // Hit Wall
        if (map[my][mx] === 1) {
            return { hit: true, dist: d, isGhost: false };
        }

        // Hit Ghost? (Simple circle check)
        const dx = mapX - ghost.x;
        const dy = mapY - ghost.y;
        if (Math.sqrt(dx*dx + dy*dy) < 0.3) {
            return { hit: true, dist: d, isGhost: true };
        }
    }
    
    return { hit: false };
}

// --- Update & Render ---

function update() {
    // Movement
    const moveSpeed = 0.05;
    const rotSpeed = 0.03;
    
    // Forward/Back
    if (keys['w']) {
        const nx = player.x + Math.cos(player.dir) * moveSpeed;
        const ny = player.y + Math.sin(player.dir) * moveSpeed;
        if (map[Math.floor(ny)][Math.floor(nx)] === 0) { player.x = nx; player.y = ny; }
    }
    if (keys['s']) {
        const nx = player.x - Math.cos(player.dir) * moveSpeed;
        const ny = player.y - Math.sin(player.dir) * moveSpeed;
        if (map[Math.floor(ny)][Math.floor(nx)] === 0) { player.x = nx; player.y = ny; }
    }
    // Rotate
    if (keys['a']) player.dir -= rotSpeed;
    if (keys['d']) player.dir += rotSpeed;

    // Scan Logic
    if (isScanning && Date.now() - lastScanTime > 200) { // Throttle scans
        castRays();
        lastScanTime = Date.now();
        // Play sound effect ideally
    }

    // Ghost AI (Creep towards player slowly)
    const distToGhost = Math.sqrt((player.x - ghost.x)**2 + (player.y - ghost.y)**2);
    if (distToGhost < 10 && distToGhost > 1) {
        ghost.x += (player.x - ghost.x) * 0.005;
        ghost.y += (player.y - ghost.y) * 0.005;
    }

    // Update Points (Fade out)
    for (let i = points.length - 1; i >= 0; i--) {
        points[i].life -= 0.005; // Fade speed
        if (points[i].life <= 0) points.splice(i, 1);
    }
    
    // Recharge battery slowly
    if (battery < 100) battery += 0.05;
}

function draw() {
    // Clear with slight trail or hard clear?
    // Hard clear is better for point cloud look
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    // Draw Points
    for (let p of points) {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, DOT_SIZE * (p.life + 0.5), 0, Math.PI * 2); // Pulse size
        ctx.fill();
    }
    ctx.globalAlpha = 1.0;
}

function setupInput() {
    window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
    window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);
    
    window.addEventListener('mousedown', () => isScanning = true);
    window.addEventListener('mouseup', () => isScanning = false);
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Start
init();