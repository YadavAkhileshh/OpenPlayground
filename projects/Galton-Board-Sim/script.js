/**
 * Galton Board Engine
 * Simulates rigid body physics for balls falling through pegs.
 */

const canvas = document.getElementById('sim-canvas');
const ctx = canvas.getContext('2d');

// --- Config ---
const GRAVITY = 0.2;
const FRICTION = 0.99;
let BOUNCE = 0.5;
let BALL_RAD = 4;
const PEG_RAD = 3;
const ROWS = 12;
const SPACING = 40;

// --- State ---
let width, height;
let balls = []; // Active physics balls
let pegs = [];
let bins = []; // Stores counts per column
let totalBalls = 0;
let simulationSpeed = 1;

// --- Physics Classes ---

class Ball {
    constructor(x, y) {
        this.x = x + (Math.random() - 0.5); // Slight jitter to prevent perfect stacking
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.rad = BALL_RAD;
        this.color = `hsl(${Math.random() * 50 + 20}, 90%, 60%)`; // Orange/Yellow hues
        this.active = true; // Becomes false when settled in bin
    }

    update() {
        if (!this.active) return;

        // Gravity
        this.vy += GRAVITY;
        this.vx *= FRICTION;
        this.vy *= FRICTION;

        // Move
        this.x += this.vx;
        this.y += this.vy;

        // Peg Collision
        for (let p of pegs) {
            const dx = this.x - p.x;
            const dy = this.y - p.y;
            const distSq = dx*dx + dy*dy;
            const minDist = this.rad + PEG_RAD;
            
            if (distSq < minDist * minDist) {
                const dist = Math.sqrt(distSq);
                const nx = dx / dist;
                const ny = dy / dist;
                
                // Resolve Overlap
                const overlap = minDist - dist;
                this.x += nx * overlap;
                this.y += ny * overlap;

                // Bounce (Reflect velocity)
                // v' = v - 2(v . n)n
                const dot = this.vx * nx + this.vy * ny;
                
                this.vx -= 2 * dot * nx * BOUNCE;
                this.vy -= 2 * dot * ny * BOUNCE;
                
                // Add tiny random X force to prevent balancing
                this.vx += (Math.random() - 0.5) * 0.5;
            }
        }

        // Bin Logic (Bottom)
        const floorY = height - 50;
        if (this.y > floorY - this.rad) {
            // Find bin index
            const binIdx = Math.floor(this.x / SPACING);
            if (binIdx >= 0 && binIdx < bins.length) {
                bins[binIdx].count++;
                this.active = false; // Remove from physics
                totalBalls++;
                updateUI();
            } else {
                // Out of bounds reset
                this.active = false;
            }
        }
        
        // Walls
        if (this.x < 0) { this.x = 0; this.vx *= -1; }
        if (this.x > width) { this.x = width; this.vx *= -1; }
    }

    draw() {
        if (!this.active) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.rad, 0, Math.PI * 2);
        ctx.fill();
    }
}

// --- Initialization ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Inputs
    document.getElementById('btn-100').onclick = () => dropBalls(100);
    document.getElementById('btn-1000').onclick = () => dropBalls(1000);
    document.getElementById('btn-reset').onclick = resetSim;
    
    document.getElementById('bounce-slider').oninput = e => BOUNCE = parseFloat(e.target.value);
    document.getElementById('size-slider').oninput = e => BALL_RAD = parseInt(e.target.value);

    resetSim();
    loop();
}

function resizeCanvas() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
    initBoard();
}

function initBoard() {
    pegs = [];
    bins = [];
    
    const startX = width / 2;
    const startY = 100;
    
    // Create Pyramid of Pegs
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col <= row; col++) {
            const x = startX - (row * SPACING / 2) + (col * SPACING);
            const y = startY + (row * SPACING * 0.866); // Hexagonal packing height
            pegs.push({ x, y });
        }
    }
    
    // Create Bins based on last row width
    const lastRowY = startY + ((ROWS) * SPACING * 0.866);
    const binCount = Math.floor(width / SPACING) + 2;
    
    // Align bins to peg spacing
    // Actually, bins should align between the final pegs
    // Simplified: Bin width = Spacing.
    
    for(let i=0; i<width/SPACING; i++) {
        bins.push({ count: 0, x: i*SPACING });
    }
}

function resetSim() {
    balls = [];
    bins.forEach(b => b.count = 0);
    totalBalls = 0;
    updateUI();
}

function dropBalls(n) {
    let count = 0;
    const interval = setInterval(() => {
        if (count >= n) {
            clearInterval(interval);
            return;
        }
        // Spawn batch per frame to be fast
        const batch = n > 500 ? 10 : 1;
        for(let k=0; k<batch; k++) {
            balls.push(new Ball(width/2, 50));
            count++;
        }
    }, 10);
}

function updateUI() {
    document.getElementById('count-val').innerText = totalBalls;
}

// --- Rendering ---

function draw() {
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Bins (Stacked Balls visualization)
    const floorY = height - 50;
    
    bins.forEach((bin, i) => {
        const binH = bin.count * (BALL_RAD * 2);
        const cx = bin.x + SPACING/2;
        
        // Draw Stack (Optimization: Just draw a rect or circles?)
        // Drawing 1000 circles is slow. Draw Rect for bulk, circles for top.
        
        if (bin.count > 0) {
            ctx.fillStyle = '#f9e2af';
            // Draw rectangle for bulk
            ctx.fillRect(bin.x + 2, floorY - binH, SPACING - 4, binH);
            
            // Draw count text
            /*
            ctx.fillStyle = '#666';
            ctx.font = '10px monospace';
            ctx.fillText(bin.count, cx - 5, floorY - binH - 5);
            */
        }
    });
    
    // Draw Floor Line
    ctx.fillStyle = '#45475a';
    ctx.fillRect(0, floorY, width, 5);

    // 2. Draw Pegs
    ctx.fillStyle = '#45475a';
    for (let p of pegs) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, PEG_RAD, 0, Math.PI*2);
        ctx.fill();
    }

    // 3. Draw Active Balls
    // Filter out inactive ones
    balls = balls.filter(b => b.active);
    for (let b of balls) {
        b.update();
        b.draw();
    }
    
    // 4. Draw Bell Curve Overlay
    if (document.getElementById('chk-curve').checked && totalBalls > 50) {
        drawBellCurve(floorY);
    }
}

function drawBellCurve(floorY) {
    // Calculate simple approximation
    // Peak should be at center bin
    const centerIdx = Math.floor(width/2 / SPACING);
    const maxVal = Math.max(...bins.map(b => b.count));
    
    ctx.strokeStyle = '#89b4fa';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    for (let i = 0; i < bins.length; i++) {
        // x is bin center
        const x = bins[i].x + SPACING/2;
        const count = bins[i].count;
        
        // Smoothing: Just connect tops of stacks?
        // Or draw theoretical Gaussian?
        // Let's draw the actual connection to show the shape forming
        const y = floorY - (count * BALL_RAD * 2);
        
        if (i===0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
}

function loop() {
    // Run physics steps
    draw();
    requestAnimationFrame(loop);
}

// Start
init();