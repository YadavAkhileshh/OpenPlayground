/**
 * Ragdoll Climbing Engine
 * Uses Verlet Integration for physics and constraint solving.
 */

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// --- Physics Config ---
const GRAVITY = 0.5;
const FRICTION = 0.99;
const ITERATIONS = 5; // Solver accuracy
const GRIP_RADIUS = 30; // How close to rock to grip

// --- State ---
let width, height;
let cameraY = 0;
let points = []; // Ragdoll particles
let sticks = []; // Ragdoll bones
let rocks = [];  // Climbing holds
let draggedPoint = null;
let maxHeight = 0;
let isPlaying = false;

// Ragdoll Definition (Indices in points array)
const P_HEAD = 0;
const P_NECK = 1;
const P_SHOULDER_L = 2, P_ELBOW_L = 3, P_HAND_L = 4;
const P_SHOULDER_R = 5, P_ELBOW_R = 6, P_HAND_R = 7;
const P_PELVIS = 8;
const P_KNEE_L = 9, P_FOOT_L = 10;
const P_KNEE_R = 11, P_FOOT_R = 12;

// --- Classes ---

class Point {
    constructor(x, y, locked = false) {
        this.x = x;
        this.y = y;
        this.oldx = x;
        this.oldy = y;
        this.pinned = locked; // If true, unaffected by gravity/forces
        this.gripRock = null; // Reference to rock if holding
    }

    update() {
        if (this.pinned) return;
        const vx = (this.x - this.oldx) * FRICTION;
        const vy = (this.y - this.oldy) * FRICTION;
        this.oldx = this.x;
        this.oldy = this.y;
        this.x += vx;
        this.y += vy;
        this.y += GRAVITY;
    }
}

class Stick {
    constructor(p1, p2, length, width = 5) {
        this.p1 = p1;
        this.p2 = p2;
        this.length = length || Math.hypot(p1.x - p2.x, p1.y - p2.y);
        this.width = width;
    }

    update() {
        const dx = this.p2.x - this.p1.x;
        const dy = this.p2.y - this.p1.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const diff = this.length - dist;
        const percent = diff / dist / 2;
        const offsetX = dx * percent;
        const offsetY = dy * percent;

        if (!this.p1.pinned) {
            this.p1.x -= offsetX;
            this.p1.y -= offsetY;
        }
        if (!this.p2.pinned) {
            this.p2.x += offsetX;
            this.p2.y += offsetY;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.moveTo(this.p1.x, this.p1.y);
        ctx.lineTo(this.p2.x, this.p2.y);
        ctx.lineWidth = this.width;
        ctx.strokeStyle = '#333';
        ctx.lineCap = 'round';
        ctx.stroke();
    }
}

class Rock {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 15 + Math.random() * 15;
        this.color = '#795548'; // Brown
    }
    
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        ctx.fillStyle = this.color;
        ctx.fill();
        // Highlight
        ctx.beginPath();
        ctx.arc(this.x - 3, this.y - 3, this.radius * 0.7, 0, Math.PI*2);
        ctx.fillStyle = '#8D6E63';
        ctx.fill();
    }
}

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
    document.getElementById('game-over').classList.add('hidden');
    
    points = [];
    sticks = [];
    rocks = [];
    cameraY = 0;
    maxHeight = 0;
    isPlaying = true;
    
    createRagdoll(width/2, height - 200);
    generateRocks();
    
    loop();
}

function createRagdoll(x, y) {
    // 1. Create Points
    // Head
    points.push(new Point(x, y)); // 0
    points.push(new Point(x, y + 20)); // 1 Neck
    // Arms
    points.push(new Point(x - 20, y + 20)); // 2 L Shldr
    points.push(new Point(x - 40, y + 40)); // 3 L Elb
    points.push(new Point(x - 50, y + 70)); // 4 L Hand
    points.push(new Point(x + 20, y + 20)); // 5 R Shldr
    points.push(new Point(x + 40, y + 40)); // 6 R Elb
    points.push(new Point(x + 50, y + 70)); // 7 R Hand
    // Torso/Legs
    points.push(new Point(x, y + 70)); // 8 Pelvis
    points.push(new Point(x - 20, y + 100)); // 9 L Knee
    points.push(new Point(x - 20, y + 130)); // 10 L Foot
    points.push(new Point(x + 20, y + 100)); // 11 R Knee
    points.push(new Point(x + 20, y + 130)); // 12 R Foot
    
    // Start hands locked on imaginary rocks
    points[4].pinned = true; // Left Hand
    points[7].pinned = true; // Right Hand
    
    // 2. Create Sticks (Bones)
    // Head-Neck
    sticks.push(new Stick(points[0], points[1], 20, 20)); // Head is thick
    // Shoulders
    sticks.push(new Stick(points[1], points[2]));
    sticks.push(new Stick(points[1], points[5]));
    sticks.push(new Stick(points[2], points[5])); // Bracing
    // Arms
    sticks.push(new Stick(points[2], points[3])); // L Upper
    sticks.push(new Stick(points[3], points[4])); // L Lower
    sticks.push(new Stick(points[5], points[6])); // R Upper
    sticks.push(new Stick(points[6], points[7])); // R Lower
    // Torso
    sticks.push(new Stick(points[1], points[8], 50, 15)); // Spine
    sticks.push(new Stick(points[2], points[8])); // Bracing
    sticks.push(new Stick(points[5], points[8])); // Bracing
    // Legs
    sticks.push(new Stick(points[8], points[9])); // L Thigh
    sticks.push(new Stick(points[9], points[10])); // L Shin
    sticks.push(new Stick(points[8], points[11])); // R Thigh
    sticks.push(new Stick(points[11], points[12])); // R Shin
}

function generateRocks() {
    // Initial rocks near hands
    rocks.push(new Rock(width/2 - 50, height - 130));
    rocks.push(new Rock(width/2 + 50, height - 130));
    
    // Procedural rocks going up
    for(let y = height - 300; y > -50000; y -= 80) {
        let x = Math.random() * (width - 100) + 50;
        rocks.push(new Rock(x, y));
        // Sometimes double rocks
        if(Math.random() > 0.7) {
            rocks.push(new Rock(width - x, y - 40));
        }
    }
}

// --- Logic ---

function update() {
    if(!isPlaying) return;
    
    updatePhysics();
    updateCamera();
    checkGameOver();
}

function updatePhysics() {
    // Update Points
    points.forEach(p => p.update());
    
    // Mouse Interaction (Kinematic override)
    if (draggedPoint) {
        // Force position to mouse
        draggedPoint.x = mouse.x;
        draggedPoint.y = mouse.y;
        // It remains pinned/locked while dragging
    }
    
    // Solve Constraints
    for(let i=0; i<ITERATIONS; i++) {
        sticks.forEach(s => s.update());
    }
}

function updateCamera() {
    // Camera follows the head/torso average height
    const torsoY = points[1].y;
    const targetY = height/2 - torsoY;
    
    // Only scroll up (or let's allow down for falling)
    cameraY += (targetY - cameraY) * 0.1;
    
    // Calculate Score (Height in meters approx)
    const currentHeight = Math.floor((-torsoY + (height - 200)) / 20);
    if(currentHeight > maxHeight) maxHeight = currentHeight;
    document.getElementById('height-val').innerText = Math.max(0, maxHeight);
}

function checkGameOver() {
    // If torso falls below screen bottom relative to camera
    if (points[1].y + cameraY > height + 200) {
        gameOver();
    }
}

function gameOver() {
    isPlaying = false;
    document.getElementById('final-score').innerText = Math.max(0, maxHeight);
    document.getElementById('game-over').classList.remove('hidden');
}

// --- Draw ---

function draw() {
    ctx.clearRect(0, 0, width, height);
    
    ctx.save();
    ctx.translate(0, cameraY);
    
    // Draw Rocks 
    // Optimization: Only draw visible rocks
    rocks.forEach(r => {
        if (r.y + cameraY > -50 && r.y + cameraY < height + 50) {
            r.draw();
        }
    });
    
    // Draw Ragdoll sticks
    sticks.forEach(s => s.draw());
    
    // Draw Head
    const head = points[0];
    ctx.beginPath();
    ctx.arc(head.x, head.y, 15, 0, Math.PI*2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.stroke();
    // Face
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(head.x - 5, head.y - 2, 2, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(head.x + 5, head.y - 2, 2, 0, Math.PI*2); ctx.fill();
    
    // Draw Hands (Highlight grip)
    drawHand(points[P_HAND_L]);
    drawHand(points[P_HAND_R]);
    
    ctx.restore();
}

function drawHand(p) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 8, 0, Math.PI*2);
    ctx.fillStyle = p.pinned ? '#FF5722' : '#FFCCBC'; // Red if gripping
    ctx.fill();
    ctx.stroke();
}

// --- Input ---

let mouse = { x: 0, y: 0 };

function setupInput() {
    // Mouse
    canvas.addEventListener('mousedown', e => handleStart(e.offsetX, e.offsetY));
    window.addEventListener('mousemove', e => handleMove(e.clientX, e.clientY));
    window.addEventListener('mouseup', handleEnd);
    
    // Touch
    canvas.addEventListener('touchstart', e => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        handleStart(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top);
    });
    window.addEventListener('touchmove', e => {
        e.preventDefault();
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
    });
    window.addEventListener('touchend', handleEnd);
}

function handleStart(mx, my) {
    if(!isPlaying) return;
    
    // Adjust mouse for camera
    const worldX = mx;
    const worldY = my - cameraY;
    
    mouse.x = worldX;
    mouse.y = worldY;
    
    // Check closest hand
    const hands = [points[P_HAND_L], points[P_HAND_R]];
    let closest = null;
    let minDst = 50; // Grab radius
    
    hands.forEach(h => {
        const d = Math.hypot(h.x - worldX, h.y - worldY);
        if (d < minDst) {
            minDst = d;
            closest = h;
        }
    });
    
    if (closest) {
        draggedPoint = closest;
        draggedPoint.pinned = true; // Temporary lock while dragging
    }
}

function handleMove(cx, cy) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = cx - rect.left;
    mouse.y = (cy - rect.top) - cameraY;
}

function handleEnd() {
    if (draggedPoint) {
        // Try to grip rock
        let gripped = false;
        for (let r of rocks) {
            const d = Math.hypot(draggedPoint.x - r.x, draggedPoint.y - r.y);
            if (d < r.radius + 10) { // Grip tolerance
                draggedPoint.x = r.x;
                draggedPoint.y = r.y; // Snap to center
                draggedPoint.pinned = true; // Lock
                gripped = true;
                break;
            }
        }
        
        if (!gripped) {
            draggedPoint.pinned = false; // Let go
        }
        
        draggedPoint = null;
    }
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Start
init();