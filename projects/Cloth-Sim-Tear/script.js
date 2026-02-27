/**
 * Cloth Simulation Engine
 * Uses Verlet Integration for soft-body physics.
 */

const canvas = document.getElementById('sim-canvas');
const ctx = canvas.getContext('2d');

// --- Config ---
const GRAVITY = 0.2;
const FRICTION = 0.99;
const BOUNCE = 0.9;
let TEAR_DIST = 60; // Max stretch distance
let WIND = 0;
const ITERATIONS = 5; // Constraint solving passes per frame

// --- State ---
let width, height;
let points = [];
let constraints = [];
let mouse = { x: 0, y: 0, down: false, button: 0 };
let draggedPoint = null;
let isCutting = false;

// --- Classes ---

class Point {
    constructor(x, y, pinned = false) {
        this.x = x;
        this.y = y;
        this.oldx = x;
        this.oldy = y;
        this.pinned = pinned;
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
        
        // Wind (Random noise)
        if (WIND > 0) {
            this.x += (Math.random() - 0.2) * (WIND * 0.1); // Blow rightish
        }

        // Bounds
        if (this.x > width) { this.x = width; this.oldx = this.x + vx * BOUNCE; }
        else if (this.x < 0) { this.x = 0; this.oldx = this.x + vx * BOUNCE; }

        if (this.y > height) { this.y = height; this.oldy = this.y + vy * BOUNCE; }
        else if (this.y < 0) { this.y = 0; this.oldy = this.y + vy * BOUNCE; }
    }
}

class Constraint {
    constructor(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;
        this.length = Math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2);
        this.active = true;
    }

    resolve() {
        if (!this.active) return;
        
        const dx = this.p2.x - this.p1.x;
        const dy = this.p2.y - this.p1.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        // Tearing Logic
        if (dist > TEAR_DIST) {
            this.active = false;
            return;
        }

        const diff = (this.length - dist) / dist;
        
        // Scalar offset (stiffness = 0.5 for equal split)
        const offsetX = dx * diff * 0.5;
        const offsetY = dy * diff * 0.5;

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
        if (!this.active) return;
        ctx.moveTo(this.p1.x, this.p1.y);
        ctx.lineTo(this.p2.x, this.p2.y);
    }
}

// --- Initialization ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupInput();

    // Controls
    document.getElementById('btn-reset').onclick = createCloth;
    document.getElementById('btn-cut').onclick = toggleCut;
    document.getElementById('tear-slider').oninput = e => TEAR_DIST = parseInt(e.target.value);
    document.getElementById('wind-slider').oninput = e => WIND = parseInt(e.target.value);
    
    // Toggles re-draw
    ['chk-points', 'chk-lines'].forEach(id => {
        document.getElementById(id).onchange = () => {};
    });

    createCloth();
    loop();
}

function resizeCanvas() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
}

function createCloth() {
    points = [];
    constraints = [];
    
    const rows = 15;
    const cols = 20;
    const spacing = 25;
    const startX = width/2 - (cols * spacing)/2;
    const startY = 50;

    // Create Points
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            // Pin top row (every 3rd point for draping effect)
            const pinned = (y === 0 && x % 3 === 0);
            points.push(new Point(startX + x * spacing, startY + y * spacing, pinned));
        }
    }

    // Create Constraints (Grid)
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const i = y * cols + x;
            
            // Connect Right
            if (x < cols - 1) {
                constraints.push(new Constraint(points[i], points[i+1]));
            }
            // Connect Down
            if (y < rows - 1) {
                constraints.push(new Constraint(points[i], points[i+cols]));
            }
        }
    }
}

function toggleCut() {
    isCutting = !isCutting;
    const btn = document.getElementById('btn-cut');
    btn.innerText = `Cut Tool: ${isCutting ? 'ON' : 'OFF'}`;
    btn.classList.toggle('active');
}

// --- Interaction ---

function setupInput() {
    canvas.addEventListener('mousedown', e => {
        mouse.down = true;
        mouse.button = e.button; // 0=left, 2=right
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;

        if (isCutting || mouse.button === 2) {
            // Cut mode: handled in move
        } else {
            // Find nearest point to drag
            let nearest = null;
            let minD = 30;
            for(let p of points) {
                const d = Math.sqrt((mouse.x - p.x)**2 + (mouse.y - p.y)**2);
                if (d < minD) { minD = d; nearest = p; }
            }
            draggedPoint = nearest;
        }
    });

    canvas.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        
        // Mouse Cut Logic
        if (mouse.down && (isCutting || mouse.button === 2)) {
            // Check intersection with constraints
            for(let c of constraints) {
                if (!c.active) continue;
                // Simple distance check to mouse
                // Better: Line intersection with previous mouse pos
                const d1 = Math.sqrt((c.p1.x - mx)**2 + (c.p1.y - my)**2);
                const d2 = Math.sqrt((c.p2.x - mx)**2 + (c.p2.y - my)**2);
                
                // If mouse is close to either end, or midpoint
                const midX = (c.p1.x + c.p2.x)/2;
                const midY = (c.p1.y + c.p2.y)/2;
                const dMid = Math.sqrt((midX - mx)**2 + (midY - my)**2);
                
                if (dMid < 10) c.active = false;
            }
        }
        
        // Drag Logic
        if (draggedPoint) {
            // Instead of setting pos directly (teleport), pull it
            // Or set oldx/oldy to move it physically
            // Simple:
            draggedPoint.x = mx;
            draggedPoint.y = my;
            draggedPoint.oldx = mx; // Stop momentum
            draggedPoint.oldy = my;
        }
        
        mouse.x = mx;
        mouse.y = my;
    });

    window.addEventListener('mouseup', () => {
        mouse.down = false;
        draggedPoint = null;
    });

    canvas.addEventListener('contextmenu', e => e.preventDefault()); // Block context menu
}

// --- Loop ---

function update() {
    // 1. Update Points
    points.forEach(p => p.update());

    // 2. Resolve Constraints (Multiple passes for stiffness)
    for (let i = 0; i < ITERATIONS; i++) {
        constraints.forEach(c => c.resolve());
        // Re-enforce pin constraints after resolution
        // (Not strictly needed if pinned points simply don't move in resolve,
        // but resolve() currently moves pinned points if both were unpinned in logic. 
        // My resolve logic checks pinned status, so we are good.)
    }
}

function draw() {
    ctx.clearRect(0, 0, width, height);

    const showLines = document.getElementById('chk-lines').checked;
    const showPoints = document.getElementById('chk-points').checked;

    if (showLines) {
        ctx.strokeStyle = '#fff'; // '#e0e0e0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        constraints.forEach(c => c.draw());
        ctx.stroke();
    }

    if (showPoints) {
        ctx.fillStyle = '#ff4757';
        points.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI*2);
            ctx.fill();
        });
    }

    // Draw Mouse Cursor for Cut
    if (isCutting) {
        ctx.strokeStyle = '#ff4757';
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 10, 0, Math.PI*2);
        ctx.stroke();
    }
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Start
init();