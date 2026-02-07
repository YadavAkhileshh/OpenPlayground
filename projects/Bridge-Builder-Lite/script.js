/**
 * Bridge-Builder Engine
 * Implements Verlet Integration for constraint physics.
 */

const canvas = document.getElementById('sim-canvas');
const ctx = canvas.getContext('2d');

// --- Config ---
const GRAVITY = 0.5;
const FRICTION = 0.99;
const BOUNCE = 0.9;
const SNAP_DIST = 15; // Mouse snap radius

// --- State ---
let width, height;
let points = [];
let sticks = []; // Constraints (Beams)
let isSimulating = false;
let tool = 'wood'; // wood, steel, delete
let budget = 1000;
let dragStartPoint = null;
let mouse = { x: 0, y: 0 };

// --- Classes ---

class Point {
    constructor(x, y, pinned = false) {
        this.x = x;
        this.y = y;
        this.oldx = x;
        this.oldy = y;
        this.pinned = pinned;
        this.id = Math.random();
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

    constrain() {
        if (this.pinned) return;
        
        // Floor constraint (Water/Death zone)
        if (this.y > height) {
            this.y = height;
            this.oldy = this.y + (this.y - this.oldy) * BOUNCE;
        }
    }
}

class Stick {
    constructor(p1, p2, type) {
        this.p1 = p1;
        this.p2 = p2;
        this.type = type;
        this.length = distance(p1, p2);
        this.strength = type === 'wood' ? 100 : 300; // Snap threshold
        this.color = type === 'wood' ? '#d35400' : '#7f8c8d';
        this.width = type === 'wood' ? 4 : 6;
        this.broken = false;
        this.stress = 0;
    }

    update() {
        if (this.broken) return;

        const dx = this.p2.x - this.p1.x;
        const dy = this.p2.y - this.p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Calculate Stress
        const diff = this.length - dist;
        this.stress = Math.abs(diff);

        // Break logic
        if (this.stress > this.strength) {
            this.broken = true;
            budget -= 50; // Penalty? Or just visual
            return;
        }

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
        if (this.broken) return;

        ctx.beginPath();
        ctx.moveTo(this.p1.x, this.p1.y);
        ctx.lineTo(this.p2.x, this.p2.y);
        
        // Stress Visualization: Wood turns Red, Steel turns Blue
        if (isSimulating) {
            const stressRatio = Math.min(this.stress / this.strength, 1);
            const r = Math.floor(255 * stressRatio);
            ctx.strokeStyle = `rgb(${r}, ${100 - r}, 0)`;
        } else {
            ctx.strokeStyle = this.color;
        }
        
        ctx.lineWidth = this.width;
        ctx.stroke();

        // Draw Joints
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.p1.x, this.p1.y, 3, 0, Math.PI*2);
        ctx.arc(this.p2.x, this.p2.y, 3, 0, Math.PI*2);
        ctx.fill();
    }
}

// --- Helpers ---
function distance(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx*dx + dy*dy);
}

function getClosestPoint(x, y) {
    let closest = null;
    let minDist = SNAP_DIST;
    for(let p of points) {
        const d = Math.sqrt((p.x - x)**2 + (p.y - y)**2);
        if (d < minDist) {
            minDist = d;
            closest = p;
        }
    }
    return closest;
}

// --- Init & Loop ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupInput();
    resetSim();
    loop();
}

function resizeCanvas() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
    if(!isSimulating) resetSim();
}

function resetSim() {
    isSimulating = false;
    points = [];
    sticks = [];
    budget = 1000;
    updateUI();

    // Setup Cliffs (Fixed Points)
    // Left Cliff
    points.push(new Point(50, height/2 + 50, true));
    points.push(new Point(150, height/2 + 50, true));
    
    // Right Cliff
    points.push(new Point(width - 150, height/2 + 50, true));
    points.push(new Point(width - 50, height/2 + 50, true));
    
    // Default Floor Deck (Ghost/Guide)
    // In a real game, user builds this. For Lite version, let's give them anchor points.
    for(let i=250; i<width-200; i+=100) {
        // points.push(new Point(i, height/2 + 50));
    }
}

function setupInput() {
    canvas.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    canvas.addEventListener('mousedown', e => {
        if (isSimulating) return;

        // Snap to existing point?
        let p = getClosestPoint(mouse.x, mouse.y);
        
        if (tool === 'delete') {
            if (p) {
                // Delete connected sticks
                sticks = sticks.filter(s => s.p1 !== p && s.p2 !== p);
                if(!p.pinned) points = points.filter(pt => pt !== p);
            }
            return;
        }

        // Building Mode
        if (!p) {
            // Create new point (grid snap logic could go here)
            // For now, allow free placement if connected
            if (!dragStartPoint) return; // Must start from existing
            // Actually, let's allow creating points anywhere within radius
        }

        if (!dragStartPoint) {
            if (p) dragStartPoint = p;
        } else {
            // Finish Line
            if (!p) {
                // Create new point at mouse
                p = new Point(mouse.x, mouse.y);
                points.push(p);
            }
            
            // Deduct Cost
            const cost = tool === 'wood' ? 50 : 150;
            if (budget >= cost && p !== dragStartPoint) {
                sticks.push(new Stick(dragStartPoint, p, tool));
                budget -= cost;
                dragStartPoint = null; // Deselect
                updateUI();
            } else {
                dragStartPoint = null;
            }
        }
    });

    canvas.addEventListener('contextmenu', e => {
        e.preventDefault();
        dragStartPoint = null; // Cancel drag
    });
}

function setMaterial(mat) {
    tool = mat;
    document.querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`tool-${mat}`).classList.add('active');
}

function setTool(t) {
    tool = t;
    document.querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`tool-${t}`).classList.add('active');
}

function toggleSimulation() {
    if (isSimulating) {
        resetSim(); // Actually resets
        document.getElementById('btn-test').innerHTML = '<i class="fas fa-play"></i> TEST BRIDGE';
    } else {
        isSimulating = true;
        // Save state logic would go here
        document.getElementById('btn-test').innerHTML = '<i class="fas fa-stop"></i> STOP';
        
        // Add "Car" Weight (Load)
        // Find center nodes
        const centerX = width / 2;
        points.forEach(p => {
            if (Math.abs(p.x - centerX) < 100) {
                p.y += 20; // Initial jolt
            }
        });
    }
}

function updateUI() {
    document.getElementById('budget-val').innerText = `$${budget}`;
}

// --- Main Loop ---

function loop() {
    ctx.clearRect(0, 0, width, height);

    // Draw Cliff Visuals
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, height/2+50, 150, height);
    ctx.fillRect(width-150, height/2+50, 150, height);

    // Physics
    if (isSimulating) {
        // Verlet Steps
        points.forEach(p => p.update());
        // Constraint Solving (Iterate multiple times for stability)
        for(let i=0; i<5; i++) {
            sticks.forEach(s => s.update());
            points.forEach(p => p.constrain());
        }
    }

    // Render Sticks
    sticks.forEach(s => s.draw());

    // Render Points
    points.forEach(p => {
        ctx.fillStyle = p.pinned ? '#c0392b' : '#fff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p === dragStartPoint ? 6 : 4, 0, Math.PI*2);
        ctx.fill();
    });

    // Render Drag Line
    if (dragStartPoint && !isSimulating) {
        ctx.beginPath();
        ctx.moveTo(dragStartPoint.x, dragStartPoint.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = '#fff';
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    requestAnimationFrame(loop);
}

// Start
init();