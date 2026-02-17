/**
 * Ragdoll Physics Engine
 * Uses Verlet Integration for soft-body constraints.
 */

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// --- Config ---
const GRAVITY = 0.5;
const FRICTION = 0.98;
const GROUND_Y = window.innerHeight * 0.8;
const MUSCLE_STRENGTH = 0.15; // How much length changes

// --- State ---
let width, height;
let points = [];
let constraints = [];
let muscles = {}; // Map keys to constraints
let isPlaying = false;
let startX = 0;
let distance = 0;
let cameraX = 0;

// --- Physics Classes ---

class Point {
    constructor(x, y, fixed = false) {
        this.x = x;
        this.y = y;
        this.oldx = x;
        this.oldy = y;
        this.fixed = fixed;
    }

    update() {
        if (this.fixed) return;
        
        const vx = (this.x - this.oldx) * FRICTION;
        const vy = (this.y - this.oldy) * FRICTION;
        
        this.oldx = this.x;
        this.oldy = this.y;
        
        this.x += vx;
        this.y += vy;
        this.y += GRAVITY;

        // Ground Collision
        if (this.y >= GROUND_Y) {
            this.y = GROUND_Y;
            // Simple friction on ground
            this.oldx = this.x - (this.x - this.oldx) * 0.5;
        }
    }
}

class Constraint {
    constructor(p1, p2, stiffness = 1) {
        this.p1 = p1;
        this.p2 = p2;
        this.length = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        this.restLength = this.length; // Original length
        this.stiffness = stiffness;
        this.color = '#333';
        this.width = 5;
    }

    resolve() {
        const dx = this.p2.x - this.p1.x;
        const dy = this.p2.y - this.p1.y;
        const dist = Math.hypot(dx, dy);
        const diff = (this.length - dist) / dist * this.stiffness;
        
        const offsetX = dx * diff * 0.5;
        const offsetY = dy * diff * 0.5;
        
        if (!this.p1.fixed) {
            this.p1.x -= offsetX;
            this.p1.y -= offsetY;
        }
        if (!this.p2.fixed) {
            this.p2.x += offsetX;
            this.p2.y += offsetY;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.moveTo(this.p1.x - cameraX, this.p1.y);
        ctx.lineTo(this.p2.x - cameraX, this.p2.y);
        ctx.lineWidth = this.width;
        ctx.lineCap = 'round';
        ctx.strokeStyle = this.color;
        ctx.stroke();
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
    
    createRagdoll(200, GROUND_Y - 200);
    isPlaying = true;
    startX = points[0].x;
    loop();
}

function createRagdoll(x, y) {
    points = [];
    constraints = [];
    muscles = {};
    
    // Create Points (Anatomy)
    // 0: Head, 1: Neck/Torso Top, 2: Hips
    // 3: L Knee, 4: L Foot
    // 5: R Knee, 6: R Foot
    
    const p = points;
    p.push(new Point(x, y - 50)); // 0 Head
    p.push(new Point(x, y));      // 1 Torso
    p.push(new Point(x, y + 50)); // 2 Hips
    
    // Left Leg
    p.push(new Point(x + 20, y + 100)); // 3 Knee
    p.push(new Point(x + 20, y + 150)); // 4 Foot
    
    // Right Leg
    p.push(new Point(x - 20, y + 100)); // 5 Knee
    p.push(new Point(x - 20, y + 150)); // 6 Foot
    
    // Constraints (Bones)
    // Spine
    constraints.push(new Constraint(p[0], p[1])); // Neck
    constraints.push(new Constraint(p[1], p[2])); // Spine
    
    // Left Leg
    const lThigh = new Constraint(p[2], p[3]); // Hips -> Knee
    const lCalf = new Constraint(p[3], p[4]);  // Knee -> Foot
    
    // Right Leg
    const rThigh = new Constraint(p[2], p[5]);
    const rCalf = new Constraint(p[5], p[6]);
    
    constraints.push(lThigh, lCalf, rThigh, rCalf);
    
    // Visual tweak
    lThigh.color = '#e17055'; lThigh.width = 8;
    lCalf.color = '#e17055'; lCalf.width = 6;
    rThigh.color = '#0984e3'; rThigh.width = 8;
    rCalf.color = '#0984e3'; rCalf.width = 6;
    
    // Map Muscles (Keys to Constraints)
    // Q: Left Thigh, W: Left Calf
    // O: Right Thigh, P: Right Calf
    muscles['q'] = lThigh;
    muscles['w'] = lCalf;
    muscles['o'] = rThigh;
    muscles['p'] = rCalf;
    
    // Extra stability constraints (invisible)
    // Keep feet from doing splits easily
    // constraints.push(new Constraint(p[3], p[5], 0.1)); 
}

// --- Game Logic ---

let activeKeys = {};

function update() {
    if (!isPlaying) return;
    
    // 1. Muscle Contraction
    for (let key in activeKeys) {
        if (activeKeys[key] && muscles[key]) {
            // Contract: Shorten length
            muscles[key].length = muscles[key].restLength * (1 - MUSCLE_STRENGTH);
        } else if (muscles[key]) {
            // Relax: Return to rest
            muscles[key].length = muscles[key].restLength;
        }
    }
    
    // 2. Physics Steps
    points.forEach(p => p.update());
    
    for(let i=0; i<5; i++) { // Solve multiple times
        constraints.forEach(c => c.resolve());
    }
    
    // 3. Camera
    // Follow torso
    const torsoX = points[1].x;
    cameraX += (torsoX - cameraX - width/3) * 0.1;
    
    // 4. Game Over Check
    // If Head (p[0]) touches ground
    if (points[0].y > GROUND_Y - 20) {
        gameOver();
    }
    
    // 5. Score
    distance = Math.max(0, (points[1].x - startX) / 10).toFixed(1);
    document.getElementById('dist-val').innerText = distance + "m";
}

function gameOver() {
    isPlaying = false;
    document.getElementById('final-dist').innerText = distance + "m";
    document.getElementById('game-over').classList.remove('hidden');
}

// --- Interaction ---

function setupInput() {
    window.addEventListener('keydown', e => {
        const k = e.key.toLowerCase();
        if (muscles[k]) {
            activeKeys[k] = true;
            document.getElementById(`key-${k}`).classList.add('active');
        }
    });
    
    window.addEventListener('keyup', e => {
        const k = e.key.toLowerCase();
        if (muscles[k]) {
            activeKeys[k] = false;
            document.getElementById(`key-${k}`).classList.remove('active');
        }
    });
}

// --- Rendering ---

function draw() {
    ctx.clearRect(0, 0, width, height);
    
    // Ground 
    ctx.fillStyle = '#2d3436';
    ctx.fillRect(0, GROUND_Y, width, height - GROUND_Y);
    
    // Grid markers on ground
    ctx.fillStyle = '#636e72';
    for (let x = Math.floor(cameraX/100)*100; x < cameraX + width; x+=100) {
        ctx.fillRect(x - cameraX, GROUND_Y, 2, 20);
    }
    
    if (points.length > 0) {
        // Draw Constraints
        constraints.forEach(c => c.draw());
        
        // Draw Head
        const head = points[0];
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(head.x - cameraX, head.y, 15, 0, Math.PI*2);
        ctx.fill();
        // Face
        ctx.fillStyle = '#000';
        ctx.fillRect(head.x - cameraX + 5, head.y - 5, 5, 5); // Eye
        
        // Draw Feet Shoes
        const lFoot = points[4];
        const rFoot = points[6];
        ctx.fillStyle = '#e17055';
        ctx.fillRect(lFoot.x - cameraX - 5, lFoot.y - 5, 15, 10);
        ctx.fillStyle = '#0984e3';
        ctx.fillRect(rFoot.x - cameraX - 5, rFoot.y - 5, 15, 10);
    }
}

function loop() {
    update();
    draw();
    if(isPlaying) requestAnimationFrame(loop);
}

// Start
init();