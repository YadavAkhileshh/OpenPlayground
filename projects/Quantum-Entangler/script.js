/**
 * Quantum Entangler Engine
 * Simulates basic quantum mechanics concepts: Superposition & Entanglement.
 */

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const blochCanvas = document.getElementById('bloch-canvas');
const blochCtx = blochCanvas.getContext('2d');

// --- Config ---
const PARTICLE_RAD = 12;
const SPEED = 4;
const CLOUD_SPREAD = 30;

// --- State ---
let width, height;
let gameState = 'start'; // start, playing, win
let level = 1;
let particles = [];
let walls = [];
let goals = [];
let isEntangled = false;
let isSuperposed = false;

// Keys
const keys = {};

// --- Level Data ---
const LEVELS = [
    {
        p1: {x: 100, y: 300},
        p2: {x: 100, y: 400},
        goals: [{x: 700, y: 300}, {x: 700, y: 400}],
        walls: []
    },
    {   // Level 2: Entanglement Puzzle (Inverse movement needed)
        p1: {x: 100, y: 200},
        p2: {x: 100, y: 500}, // Needs to go UP while P1 goes DOWN
        goals: [{x: 700, y: 200}, {x: 700, y: 500}],
        walls: [
            {x: 400, y: 0, w: 20, h: 350, type: 'solid'},
            {x: 400, y: 450, w: 20, h: 300, type: 'solid'}
        ]
    },
    {   // Level 3: Tunneling (Superposition needed)
        p1: {x: 100, y: 350},
        p2: {x: 150, y: 350},
        goals: [{x: 700, y: 350}, {x: 750, y: 350}],
        walls: [
            {x: 400, y: 100, w: 20, h: 500, type: 'filter'} // Only pass in superposition
        ]
    }
];

// --- Classes ---

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.color = color;
        this.cloudPoints = []; // For superposition visual
    }

    update() {
        if (isSuperposed) {
            // Jitter movement
            this.x += this.vx * 0.5; // Slower in cloud
            this.y += this.vy * 0.5;
            
            // Generate cloud visuals
            if (this.cloudPoints.length < 20) {
                this.cloudPoints.push({
                    ox: (Math.random()-0.5)*CLOUD_SPREAD,
                    oy: (Math.random()-0.5)*CLOUD_SPREAD,
                    life: 1.0
                });
            }
        } else {
            this.x += this.vx;
            this.y += this.vy;
            this.cloudPoints = [];
        }

        // Friction
        this.vx *= 0.8;
        this.vy *= 0.8;

        // Collision
        this.checkCollisions();
    }

    checkCollisions() {
        // Bounds
        if(this.x < 0) this.x = 0;
        if(this.x > width) this.x = width;
        if(this.y < 0) this.y = 0;
        if(this.y > height) this.y = height;

        // Walls
        for (let w of walls) {
            if (this.intersects(w)) {
                if (w.type === 'filter' && isSuperposed) {
                    // Pass through (Tunneling)
                    continue;
                }
                // Solid collision logic (AABB vs Point/Circle approx)
                // Simplified: Push back
                if (Math.abs(this.vx) > Math.abs(this.vy)) {
                    this.x -= this.vx * 1.5;
                } else {
                    this.y -= this.vy * 1.5;
                }
                this.vx = 0;
                this.vy = 0;
            }
        }
    }

    intersects(rect) {
        return (this.x > rect.x && this.x < rect.x + rect.w &&
                this.y > rect.y && this.y < rect.y + rect.h);
    }

    draw() {
        if (isSuperposed) {
            // Draw Cloud
            ctx.fillStyle = this.color;
            for (let p of this.cloudPoints) {
                ctx.globalAlpha = p.life * 0.5;
                ctx.beginPath();
                ctx.arc(this.x + p.ox, this.y + p.oy, 4, 0, Math.PI*2);
                ctx.fill();
                p.life -= 0.1;
            }
            // Regen dead points
            this.cloudPoints = this.cloudPoints.filter(p => p.life > 0);
            ctx.globalAlpha = 1.0;
        } else {
            // Draw Solid Particle
            ctx.shadowBlur = 15;
            ctx.shadowColor = this.color;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, PARTICLE_RAD, 0, Math.PI*2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }
}

// --- Init ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Inputs
    window.addEventListener('keydown', e => {
        keys[e.key] = true;
        if (e.key === 'e' || e.key === 'E') toggleEntangle();
        if (e.key === ' ') toggleSuperposition();
        if (e.key === 'm' || e.key === 'M') measure();
    });
    window.addEventListener('keyup', e => keys[e.key] = false);

    // Buttons
    document.getElementById('btn-entangle').onclick = toggleEntangle;
    document.getElementById('btn-superpose').onclick = toggleSuperposition;
    document.getElementById('btn-measure').onclick = measure;
    document.getElementById('btn-start').onclick = startGame;

    loadLevel(0);
    loop();
}

function resizeCanvas() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
}

function loadLevel(idx) {
    if (idx >= LEVELS.length) {
        alert("Simulation Complete. Resetting.");
        idx = 0;
    }
    level = idx + 1;
    document.getElementById('level-val').innerText = level;
    
    const data = LEVELS[idx];
    particles = [
        new Particle(data.p1.x, data.p1.y, '#00f3ff'), // Blue
        new Particle(data.p2.x, data.p2.y, '#bc13fe')  // Purple
    ];
    walls = data.walls;
    goals = data.goals;
    
    // Reset states
    isEntangled = false;
    isSuperposed = false;
    updateUI();
}

function startGame() {
    gameState = 'playing';
    document.getElementById('message-overlay').classList.add('hidden');
}

// --- Logic ---

function toggleEntangle() {
    isEntangled = !isEntangled;
    updateUI();
}

function toggleSuperposition() {
    isSuperposed = !isSuperposed;
    updateUI();
}

function measure() {
    if (isSuperposed) {
        isSuperposed = false;
        // Collapse wave function to random point in cloud
        particles.forEach(p => {
            p.x += (Math.random()-0.5) * CLOUD_SPREAD;
            p.y += (Math.random()-0.5) * CLOUD_SPREAD;
            p.checkCollisions(); // Ensure not in wall
        });
        updateUI();
    }
}

function updateUI() {
    const eBtn = document.getElementById('btn-entangle');
    const sBtn = document.getElementById('btn-superpose');
    const eStat = document.getElementById('status-entangle');
    const sStat = document.getElementById('status-superpose');

    if (isEntangled) {
        eBtn.classList.add('active');
        eStat.innerText = "LINKED";
    } else {
        eBtn.classList.remove('active');
        eStat.innerText = "OFF";
    }

    if (isSuperposed) {
        sBtn.classList.add('active');
        sStat.innerText = "WAVE";
    } else {
        sBtn.classList.remove('active');
        sStat.innerText = "PARTICLE";
    }
}

function update() {
    if (gameState !== 'playing') return;

    // Movement P1
    let dx = 0; let dy = 0;
    if (keys['ArrowUp']) dy = -SPEED;
    if (keys['ArrowDown']) dy = SPEED;
    if (keys['ArrowLeft']) dx = -SPEED;
    if (keys['ArrowRight']) dx = SPEED;

    particles[0].vx = dx;
    particles[0].vy = dy;

    // P2 Logic
    if (isEntangled) {
        // Inverse Movement
        particles[1].vx = -dx;
        particles[1].vy = -dy;
    } else {
        // P2 stays still if not entangled (or separate controls could be added)
        particles[1].vx = 0;
        particles[1].vy = 0;
    }

    particles.forEach(p => p.update());

    // Win Check
    let winCount = 0;
    particles.forEach(p => {
        goals.forEach(g => {
            const d = Math.sqrt((p.x - g.x)**2 + (p.y - g.y)**2);
            if (d < 20) winCount++;
        });
    });

    // Check if both particles are near ANY goal (simplified)
    // Ideally each particle has a specific goal, but for puzzle simplicity:
    // P1 -> G1, P2 -> G2 logic is better.
    const p1 = particles[0];
    const p2 = particles[1];
    const g1 = goals[0];
    const g2 = goals[1];

    const d1 = Math.sqrt((p1.x - g1.x)**2 + (p1.y - g1.y)**2);
    const d2 = Math.sqrt((p2.x - g2.x)**2 + (p2.y - g2.y)**2);

    if (d1 < 30 && d2 < 30) {
        loadLevel(level); // Next level (level is 1-based index)
    }
}

// --- Render ---

function draw() {
    ctx.clearRect(0, 0, width, height);

    // Draw Entanglement Link
    if (isEntangled) {
        ctx.beginPath();
        ctx.moveTo(particles[0].x, particles[0].y);
        ctx.lineTo(particles[1].x, particles[1].y);
        ctx.strokeStyle = 'rgba(0, 243, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // Draw Goals
    ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
    ctx.strokeStyle = '#00ff00';
    for (let g of goals) {
        ctx.beginPath();
        ctx.arc(g.x, g.y, 20, 0, Math.PI*2);
        ctx.fill();
        ctx.stroke();
    }

    // Draw Walls
    for (let w of walls) {
        if (w.type === 'filter') {
            ctx.fillStyle = 'rgba(188, 19, 254, 0.2)'; // Purple transparent
            ctx.strokeStyle = '#bc13fe';
            // Grid pattern
            ctx.fillRect(w.x, w.y, w.w, w.h);
            ctx.strokeRect(w.x, w.y, w.w, w.h);
        } else {
            ctx.fillStyle = '#444';
            ctx.fillRect(w.x, w.y, w.w, w.h);
        }
    }

    // Draw Particles
    particles.forEach(p => p.draw());

    drawBlochSphere();
}

function drawBlochSphere() {
    blochCtx.clearRect(0, 0, 100, 100);
    const cx = 50, cy = 50, r = 40;

    // Circle
    blochCtx.strokeStyle = '#444';
    blochCtx.beginPath();
    blochCtx.arc(cx, cy, r, 0, Math.PI*2);
    blochCtx.stroke();
    
    // Axes
    blochCtx.beginPath(); blochCtx.moveTo(cx, cy-r); blochCtx.lineTo(cx, cy+r); blochCtx.stroke();
    blochCtx.beginPath(); blochCtx.moveTo(cx-r, cy); blochCtx.lineTo(cx+r, cy); blochCtx.stroke();

    // State Vector
    blochCtx.strokeStyle = isSuperposed ? '#bc13fe' : '#00f3ff';
    blochCtx.lineWidth = 2;
    blochCtx.beginPath();
    blochCtx.moveTo(cx, cy);
    
    // Animate vector based on state
    if (isSuperposed) {
        // Pointing to equator (Superposition)
        const angle = Date.now() / 500;
        blochCtx.lineTo(cx + Math.cos(angle)*r, cy + Math.sin(angle)*r * 0.3); // Ellipse rotation
    } else {
        // Pointing Up (State |0>)
        blochCtx.lineTo(cx, cy - r);
    }
    blochCtx.stroke();
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Start
init();