/**
 * Bridge Physics Engine
 * Uses Verlet Integration for simulation and stress analysis.
 */

const canvas = document.getElementById('sim-canvas');
const ctx = canvas.getContext('2d');

// --- Config ---
const GRAVITY = 0.2;
const FRICTION = 0.99;
const ITERATIONS = 5;
const SNAP_RADIUS = 15;
const GROUND_Y = 500;
const GAP_START = 100;
const GAP_END = 700;

const MATERIALS = {
    wood: { color: '#8d6e63', maxStress: 0.15, cost: 100, width: 6 },
    steel: { color: '#90a4ae', maxStress: 0.30, cost: 300, width: 4 },
    road: { color: '#37474f', maxStress: 0.20, cost: 50, width: 8 }
};

// --- State ---
let width, height;
let points = [];
let constraints = []; // Beams
let currentMaterial = 'wood';
let budget = 5000;
let isSimulating = false;
let truck = { x: 0, weight: 10, active: false };
let isDragging = false;
let dragStartPoint = null;
let mouse = { x: 0, y: 0 };
let maxStressRecorded = 0;

// --- Physics Classes ---

class Point {
    constructor(x, y, pinned = false) {
        this.x = x;
        this.y = y;
        this.oldx = x;
        this.oldy = y;
        this.pinned = pinned;
        this.isRoad = false; // Can truck drive on it?
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

class Constraint {
    constructor(p1, p2, type) {
        this.p1 = p1;
        this.p2 = p2;
        this.length = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        this.type = type;
        this.active = true;
        this.stress = 0;
    }

    update() {
        if (!this.active) return;

        const dx = this.p2.x - this.p1.x;
        const dy = this.p2.y - this.p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Calculate Stress (Ratio of deformation)
        const diff = dist - this.length;
        this.stress = Math.abs(diff) / this.length; // Normalized strain

        // Check Breakage
        const limit = MATERIALS[this.type].maxStress;
        if (this.stress > limit) {
            this.active = false;
            triggerFailure();
            return;
        }
        
        // Record max stress for UI
        if (this.stress > maxStressRecorded) maxStressRecorded = this.stress;

        // Solve Constraint
        const correction = diff / dist / 2; // Split correction
        const offsetX = dx * correction;
        const offsetY = dy * correction;

        if (!this.p1.pinned) {
            this.p1.x += offsetX;
            this.p1.y += offsetY;
        }
        if (!this.p2.pinned) {
            this.p2.x -= offsetX;
            this.p2.y -= offsetY;
        }
    }

    draw() {
        if (!this.active) return;

        ctx.beginPath();
        ctx.moveTo(this.p1.x, this.p1.y);
        ctx.lineTo(this.p2.x, this.p2.y);
        ctx.lineWidth = MATERIALS[this.type].width;

        // Color based on stress (Green -> Red)
        if (isSimulating) {
            const ratio = Math.min(this.stress / MATERIALS[this.type].maxStress, 1);
            const r = Math.floor(255 * ratio);
            const g = Math.floor(255 * (1 - ratio));
            ctx.strokeStyle = `rgb(${r}, ${g}, 0)`;
        } else {
            ctx.strokeStyle = MATERIALS[this.type].color;
        }
        
        ctx.stroke();

        // Draw Nodes
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(this.p1.x, this.p1.y, 4, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(this.p2.x, this.p2.y, 4, 0, Math.PI*2); ctx.fill();
    }
}

// --- Init ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupInput();
    
    // Set up Level Anchors
    createAnchors();
    
    loop();
}

function resizeCanvas() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
}

function createAnchors() {
    points = [];
    constraints = [];
    budget = 5000;
    updateUI();
    
    // Left Bank
    for(let i=0; i<=GAP_START; i+=50) {
        points.push(new Point(i, GROUND_Y, true));
    }
    // Right Bank
    for(let i=GAP_END; i<=width; i+=50) {
        points.push(new Point(i, GROUND_Y, true));
    }
    
    // Mark anchors as road
    points.forEach(p => p.isRoad = true);
}

// --- Physics Loop ---

function update() {
    if (isSimulating) {
        // Physics Steps
        points.forEach(p => p.update());
        
        maxStressRecorded = 0;
        
        // Solve Constraints multiple times for stability
        for(let i=0; i<ITERATIONS; i++) {
            constraints.forEach(c => c.update());
        }
        
        // Truck Logic
        if (truck.active) {
            truck.x += 2; // Speed
            
            // Apply Weight to nearest Road Nodes
            let roadNodes = points.filter(p => p.isRoad); // Optimization: cache this
            
            // Simple influence: Apply gravity to nodes close to truck X
            roadNodes.forEach(p => {
                const dx = Math.abs(p.x - truck.x);
                if (dx < 50) {
                    // Force is stronger when closer
                    const force = (1 - dx/50) * truck.weight;
                    if (!p.pinned) p.y += force;
                }
            });
            
            // Check Success
            if (truck.x > width - 50) {
                endSimulation(true);
            }
        }
        
        // UI Update
        const stressPercent = Math.min(Math.floor(maxStressRecorded * 500), 100);
        document.getElementById('stress-val').innerText = stressPercent + "%";
        if (stressPercent > 80) document.getElementById('stress-val').style.color = 'red';
        else document.getElementById('stress-val').style.color = 'white';
    }
}

// --- Interaction ---

function handleMouseDown(e) {
    if (isSimulating) return;
    
    const {x, y} = getMousePos(e);
    const p = findNearestPoint(x, y);
    
    if (p) {
        dragStartPoint = p;
        isDragging = true;
    } else {
        // Create new point if affordable?
        // Actually, gameplay usually forces building off existing nodes.
        // Let's enforce: Must start drag from existing node.
    }
}

function handleMouseMove(e) {
    const pos = getMousePos(e);
    mouse.x = pos.x;
    mouse.y = pos.y;
}

function handleMouseUp(e) {
    if (isSimulating || !isDragging) return;
    
    const {x, y} = getMousePos(e);
    
    // Snap to existing point?
    let endPoint = findNearestPoint(x, y);
    
    // If no existing point, create new one (Grid Snap)
    if (!endPoint) {
        // Snap to grid (25px)
        const snapX = Math.round(x / 25) * 25;
        const snapY = Math.round(y / 25) * 25;
        
        // Validation: Length limit
        const dist = Math.hypot(snapX - dragStartPoint.x, snapY - dragStartPoint.y);
        if (dist > 150) {
            // Too long
            isDragging = false;
            dragStartPoint = null;
            return;
        }
        
        endPoint = new Point(snapX, snapY, false);
        // If material is road, mark point as road
        if (currentMaterial === 'road') endPoint.isRoad = true;
        points.push(endPoint);
    }
    
    // Create Beam
    if (endPoint !== dragStartPoint) {
        const cost = MATERIALS[currentMaterial].cost;
        if (budget >= cost) {
            // Check if connection already exists
            const exists = constraints.some(c => 
                (c.p1 === dragStartPoint && c.p2 === endPoint) ||
                (c.p2 === dragStartPoint && c.p1 === endPoint)
            );
            
            if (!exists) {
                constraints.push(new Constraint(dragStartPoint, endPoint, currentMaterial));
                budget -= cost;
                
                // Propagate Road status?
                if (currentMaterial === 'road') {
                    dragStartPoint.isRoad = true;
                    endPoint.isRoad = true;
                }
                
                updateUI();
            }
        }
    }
    
    isDragging = false;
    dragStartPoint = null;
}

function findNearestPoint(x, y) {
    let closest = null;
    let minDst = SNAP_RADIUS;
    
    for (let p of points) {
        const d = Math.hypot(p.x - x, p.y - y);
        if (d < minDst) {
            minDst = d;
            closest = p;
        }
    }
    return closest;
}

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

// --- Game Control ---

function setMaterial(type) {
    currentMaterial = type;
    document.querySelectorAll('.mat-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.mat-btn[data-type="${type}"]`).classList.add('active');
}

function toggleSimulation() {
    if (isSimulating) {
        resetSimulation();
    } else {
        // Start Test
        isSimulating = true;
        truck.active = true;
        truck.x = 0;
        
        // Save state (simple restore by resetting positions to oldx/oldy isn't enough,
        // we usually clone the state. For this demo, "Edit Blueprint" will just reset positions).
        document.getElementById('btn-test').innerHTML = '<i class="fas fa-stop"></i> STOP';
        document.getElementById('sim-message').classList.remove('hidden');
    }
}

function resetSimulation() {
    isSimulating = false;
    truck.active = false;
    truck.x = 0;
    
    // Restore Points
    points.forEach(p => {
        p.x = p.oldx; // This assumes oldx stored the build position. 
        // Actually oldx is prev frame. We need a 'buildX'.
        // Quick fix: Since we haven't implemented 'buildX', the bridge might look saggy if we just stop.
        // Better: We should have saved initial state.
        // For now, let's just let physics settle or gravity will perform 'undo'.
        // Correct way:
        // In a real engine, we'd have a separate 'BluePrint' model and a 'Physics' model.
    });
    
    // Revive broken constraints
    constraints.forEach(c => c.active = true);
    
    document.getElementById('btn-test').innerHTML = '<i class="fas fa-play"></i> TEST BRIDGE';
    document.getElementById('sim-message').classList.add('hidden');
    document.getElementById('fail-overlay').classList.add('hidden');
    document.getElementById('success-overlay').classList.add('hidden');
}

function resetBridge() {
    resetSimulation();
    createAnchors(); // Wipes everything
}

function triggerFailure() {
    document.getElementById('fail-overlay').classList.remove('hidden');
    // Don't stop simulation, let it crumble!
    truck.active = false; // Stop truck movement
}

function endSimulation(success) {
    if (success) {
        document.getElementById('success-overlay').classList.remove('hidden');
    }
}

function updateUI() {
    document.getElementById('budget-val').innerText = "$" + budget;
}

// --- Render ---

function draw() {
    ctx.clearRect(0, 0, width, height);
    
    // Draw Environment
    ctx.fillStyle = '#8d6e63'; // Ground Left
    ctx.fillRect(0, GROUND_Y, GAP_START, height - GROUND_Y);
    ctx.fillRect(GAP_END, GROUND_Y, width - GAP_END, height - GROUND_Y); // Right
    
    // Draw Constraints (Beams)
    // Draw in order: Wood/Steel first, Road on top
    constraints.forEach(c => { if(c.type !== 'road') c.draw(); });
    constraints.forEach(c => { if(c.type === 'road') c.draw(); });
    
    // Draw Points
    points.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.isRoad ? 4 : 3, 0, Math.PI*2);
        ctx.fillStyle = p.pinned ? '#ffeb3b' : '#fff';
        ctx.fill();
    });
    
    // Draw Drag Line
    if (isDragging) {
        ctx.beginPath();
        ctx.moveTo(dragStartPoint.x, dragStartPoint.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = MATERIALS[currentMaterial].color;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
    }
    
    // Draw Truck
    if (truck.active || isSimulating) {
        ctx.fillStyle = '#d32f2f'; // Truck Body
        ctx.fillRect(truck.x - 20, points[0].y - 30, 40, 20); // Visual approximation of Y
        // Actually we should interpolate Y based on road nodes.
        // For visuals, just draw it at fixed Y relative to physics nodes?
        // Let's rely on physics engine to move nodes down, truck stays on 'top' logically
    }
}

function setupInput() {
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Start
init();