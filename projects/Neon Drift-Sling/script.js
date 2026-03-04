/**
 * Neon Drift Sling Engine
 * Handles centripetal physics, procedural track generation, and particle effects.
 */

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// --- Config ---
const CAR_SPEED = 12;
const TURN_RADIUS = 150;
const TRACK_WIDTH = 300;
const GRAPPLE_RANGE = 400;

// --- State ---
let width, height;
let car = { x: 0, y: 0, angle: 0, state: 'straight' }; // state: 'straight' or 'drift'
let camera = { x: 0, y: 0 };
let pivots = []; // Array of {x, y, id}
let particles = [];
let trails = [];
let isGrappling = false;
let activePivot = null; // The pivot we are currently holding
let score = 0;
let isPlaying = false;
let nextPivotId = 0;
let directionMultiplier = 1; // 1 for Right turns, -1 for Left turns (alternating)

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
    
    // Reset State
    car = { x: 0, y: 0, angle: -Math.PI / 2, state: 'straight' }; // Facing Up
    camera = { x: 0, y: 0 };
    pivots = [];
    particles = [];
    trails = [];
    score = 0;
    isPlaying = true;
    activePivot = null;
    isGrappling = false;
    directionMultiplier = 1;
    nextPivotId = 0;
    
    // Initial Track Generation
    generatePivots(5);
    
    updateUI();
    loop();
}

// Procedural Track Logic
// We generate a zigzag path going UP the screen
function generatePivots(count) {
    let startY = pivots.length > 0 ? pivots[pivots.length-1].y : -300;
    let startX = pivots.length > 0 ? pivots[pivots.length-1].x : 0;
    
    for(let i=0; i<count; i++) {
        // Next pivot is higher up and to the side
        const side = directionMultiplier * (Math.random() * 200 + 300); // 300-500px offset X
        const up = 600; // Distance between turns Y
        
        pivots.push({
            x: startX + side,
            y: startY - up,
            id: nextPivotId++,
            passed: false
        });
        
        startX += side;
        startY -= up;
        directionMultiplier *= -1; // Zig-Zag
    }
}

// --- Physics Logic ---

function update() {
    if (!isPlaying) return;

    // 1. Car Physics
    if (car.state === 'straight') {
        // Move in direction of angle
        car.x += Math.cos(car.angle) * CAR_SPEED;
        car.y += Math.sin(car.angle) * CAR_SPEED;
        
        // Check Bounds (Wall Hit)
        // Simple check: if too far from line between pivots?
        // For simplicity: If we go past the active pivot Y without grappling, crash?
        // Or simple distance check from "center lane"
        // Let's rely on visuals for bounds. If you miss a turn, you fly into void.
        
        // Check for Grapple Input
        if (isGrappling) {
            tryGrapple();
        }
    } 
    else if (car.state === 'drift' && activePivot) {
        // Centripetal Motion
        const dx = car.x - activePivot.x;
        const dy = car.y - activePivot.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const currentAngle = Math.atan2(dy, dx);
        
        // Calculate Angular Velocity (v = w * r  => w = v / r)
        // Tangential speed is constant CAR_SPEED
        // Direction of rotation depends on relative position?
        // We know turns alternate, but physics handles it naturally via tangent.
        
        // Determine rotation direction (Cross product)
        // Car velocity vector vs Radius vector
        // Simple hack: We know if pivot is to our Left or Right based on movement.
        
        // For ZigZag:
        // Moving Up (-Y). Pivot is Right (+X). Radius vector is (+X, +Yish).
        // We want to turn Right (Clockwise).
        
        // Let's determine direction dynamically:
        // Cross product of [cos(angle), sin(angle)] and [dx, dy]
        const cross = Math.cos(car.angle)*dy - Math.sin(car.angle)*dx;
        const dir = cross > 0 ? 1 : -1; 
        
        const angularVel = (CAR_SPEED / dist) * dir;
        
        const newAngle = currentAngle + angularVel;
        
        // Update Pos
        car.x = activePivot.x + Math.cos(newAngle) * dist;
        car.y = activePivot.y + Math.sin(newAngle) * dist;
        
        // Update Car Heading (Tangent to circle)
        // Tangent is perpendicular to radius.
        // If rotating clockwise (dir=1), tangent is radius angle - 90deg?
        // Actually simpler: just take angle difference from last frame
        // But for smoothness:
        car.angle = newAngle + (dir * Math.PI/2);
        
        // Particles
        createDriftSparks();
        
        if (!isGrappling) {
            releaseGrapple();
        }
    }
    
    // 2. Camera Follow (Smooth Lerp)
    // Target is car position, offset to show ahead
    const targetCamX = car.x - width/2;
    const targetCamY = car.y - height * 0.7; // Car is lower on screen
    
    camera.x += (targetCamX - camera.x) * 0.1;
    camera.y += (targetCamY - camera.y) * 0.1;
    
    // 3. Trail Logic
    if (frameCount % 3 === 0) {
        trails.push({ x: car.x, y: car.y, angle: car.angle, life: 1.0 });
    }
    for (let i = trails.length - 1; i >= 0; i--) {
        trails[i].life -= 0.02;
        if (trails[i].life <= 0) trails.splice(i, 1);
    }
    
    // 4. Particles
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx; p.y += p.vy;
        p.life -= 0.05;
        if (p.life <= 0) particles.splice(i, 1);
    }
    
    // 5. Bounds Check (Crash)
    // If car is excessively far from the nearest pivot, or active pivot
    const checkPivot = activePivot || findNearestPivot();
    if (checkPivot) {
        const d = Math.hypot(car.x - checkPivot.x, car.y - checkPivot.y);
        if (d > 800) crash(); // Flew off track
    }
    
    // Generate more track
    if (pivots[pivots.length-1].y > camera.y - height) { // Generate ahead
        generatePivots(3);
    }
    
    frameCount++;
}

function tryGrapple() {
    const p = findNearestPivot();
    if (p) {
        const dist = Math.hypot(car.x - p.x, car.y - p.y);
        if (dist < GRAPPLE_RANGE) {
            activePivot = p;
            car.state = 'drift';
            document.getElementById('hint').style.opacity = '0';
        }
    }
}

function releaseGrapple() {
    car.state = 'straight';
    
    // Check if we "passed" the pivot successfully
    // (Simply releasing adds to score if we haven't scored this pivot yet)
    if (activePivot && !activePivot.passed) {
        activePivot.passed = true;
        score++;
        updateUI();
        // Speed up slightly
    }
    activePivot = null;
}

function findNearestPivot() {
    let closest = null;
    let minDst = Infinity;
    
    // Only check pivots roughly ahead of us or near us
    for(let p of pivots) {
        // Optimization: ignore passed pivots?
        // No, might need to swing around one we just missed?
        const d = Math.hypot(car.x - p.x, car.y - p.y);
        if (d < minDst) {
            minDst = d;
            closest = p;
        }
    }
    return closest;
}

function createDriftSparks() {
    // Emit from back tires
    for(let i=0; i<2; i++) {
        const angle = car.angle + Math.PI; // Backwards
        const spread = (Math.random() - 0.5);
        particles.push({
            x: car.x, y: car.y,
            vx: Math.cos(angle + spread) * 5 + (Math.random()-0.5)*2,
            vy: Math.sin(angle + spread) * 5 + (Math.random()-0.5)*2,
            life: 1.0,
            color: Math.random() > 0.5 ? '#ff00ff' : '#00f3ff'
        });
    }
}

function crash() {
    isPlaying = false;
    document.getElementById('final-score').innerText = score;
    document.getElementById('game-over').classList.remove('hidden');
}

// --- Draw ---

function draw() {
    // Clear Background
    ctx.clearRect(0, 0, width, height);
    
    ctx.save();
    ctx.translate(-camera.x, -camera.y);
    
    // Draw Pivots (Neon Circles)
    for (let p of pivots) {
        // Culling
        if (p.y > camera.y + height || p.y < camera.y - 100) continue;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, 15, 0, Math.PI*2);
        ctx.fillStyle = '#000';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = p === activePivot ? '#fff' : '#00f3ff';
        ctx.shadowColor = '#00f3ff';
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        // Inner dot
        ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI*2);
        ctx.fillStyle = '#fff'; ctx.fill();
    }
    
    // Draw Tether
    if (car.state === 'drift' && activePivot) {
        ctx.beginPath();
        ctx.moveTo(car.x, car.y);
        ctx.lineTo(activePivot.x, activePivot.y);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ff00ff';
        ctx.shadowColor = '#ff00ff';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;
    }
    
    // Draw Trails (Skid marks)
    if (trails.length > 1) {
        for (let i = 0; i < trails.length - 1; i+=2) { // Skip for performance
             const t1 = trails[i];
             const t2 = trails[i+1];
             ctx.beginPath();
             ctx.moveTo(t1.x, t1.y);
             ctx.lineTo(t2.x, t2.y);
             ctx.strokeStyle = `rgba(0, 243, 255, ${t1.life * 0.5})`;
             ctx.lineWidth = 10;
             ctx.lineCap = 'round';
             ctx.stroke();
        }
    }
    
    // Draw Particles
    for (let p of particles) {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 3, 3);
        ctx.globalAlpha = 1.0;
    }
    
    // Draw Car
    ctx.save();
    ctx.translate(car.x, car.y);
    ctx.rotate(car.angle);
    
    // Car Body (Neon Tron style)
    ctx.fillStyle = '#000';
    ctx.shadowColor = '#00f3ff';
    ctx.shadowBlur = 20;
    ctx.fillRect(-15, -10, 30, 20); // Main body
    
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(-15, -10, 30, 20);
    
    // Headlights (glow)
    ctx.fillStyle = '#fff';
    ctx.fillRect(10, -8, 5, 16);
    
    ctx.restore();
    
    ctx.restore();
}

function updateUI() {
    document.getElementById('score-val').innerText = score;
}

// --- Input ---

function setupInput() {
    let startAction = (e) => {
        if (!isPlaying) return;
        isGrappling = true;
    };
    
    let endAction = (e) => {
        isGrappling = false;
    };
    
    window.addEventListener('mousedown', startAction);
    window.addEventListener('mouseup', endAction);
    window.addEventListener('touchstart', (e) => { e.preventDefault(); startAction(e); });
    window.addEventListener('touchend', (e) => { e.preventDefault(); endAction(e); });
}

let frameCount = 0;

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Start
init();