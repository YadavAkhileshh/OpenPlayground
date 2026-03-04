/**
 * Gravity-Golf Engine
 * Simulates N-Body Physics (F = G * m1 * m2 / r^2).
 */

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// --- Physics Config ---
const G_CONST = 0.5; // Gravitational Constant (Tweaked for gameplay)
const PREDICTION_STEPS = 500; // How far to look ahead
const MAX_POWER = 15;

// --- State ---
let width, height;
let ball, goal;
let planets = [];
let isDragging = false;
let dragStart = { x: 0, y: 0 };
let dragCurrent = { x: 0, y: 0 };
let gameStatus = 'aiming'; // aiming, flying, won, lost

// --- Vector Helper ---
class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    add(v) { this.x += v.x; this.y += v.y; return this; }
    sub(v) { this.x -= v.x; this.y -= v.y; return this; }
    mult(n) { this.x *= n; this.y *= n; return this; }
    div(n) { if(n!==0){this.x /= n; this.y /= n;} return this; }
    mag() { return Math.sqrt(this.x*this.x + this.y*this.y); }
    limit(max) {
        if (this.mag() > max) {
            this.div(this.mag()).mult(max);
        }
        return this;
    }
    dist(v) { return Math.sqrt((this.x-v.x)**2 + (this.y-v.y)**2); }
    copy() { return new Vector(this.x, this.y); }
}

// --- Entities ---

class Ball {
    constructor(x, y) {
        this.pos = new Vector(x, y);
        this.vel = new Vector(0, 0);
        this.acc = new Vector(0, 0);
        this.radius = 8;
        this.mass = 1;
        this.trail = [];
    }

    applyForce(force) {
        // F = ma -> a = F/m
        const f = force.copy().div(this.mass);
        this.acc.add(f);
    }

    update() {
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0); // Reset acceleration

        // Trail Logic
        if (gameStatus === 'flying' && performance.now() % 5 === 0) {
            this.trail.push(this.pos.copy());
            if (this.trail.length > 50) this.trail.shift();
        }
    }

    draw() {
        // Draw Trail
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        if(this.trail.length > 0) {
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for(let p of this.trail) ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();

        // Draw Ball
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#fff';
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

class Planet {
    constructor(x, y, mass) {
        this.pos = new Vector(x, y);
        this.mass = mass;
        // Radius linked to mass for visual logic
        this.radius = Math.sqrt(mass) * 3; 
        this.color = `hsl(${Math.random() * 360}, 70%, 60%)`;
    }

    attract(mover) {
        let force = this.pos.copy().sub(mover.pos);
        let distance = force.mag();
        // Constrain distance to avoid infinite forces
        distance = Math.max(distance, 5); 
        distance = Math.min(distance, 500);
        
        // F = (G * m1 * m2) / d^2
        let strength = (G_CONST * this.mass * mover.mass) / (distance * distance);
        force.div(distance); // Normalize
        force.mult(strength);
        return force;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        
        // Planet Atmosphere Glow
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Inner shadow for 3D effect
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 4;
        ctx.stroke();
    }
}

class Goal {
    constructor(x, y) {
        this.pos = new Vector(x, y);
        this.radius = 25;
        this.angle = 0;
    }

    draw() {
        this.angle += 0.05;
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(this.angle);
        
        // Wormhole Swirl Effect
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = '#4cc9f0';
        ctx.lineWidth = 4;
        ctx.setLineDash([10, 5]);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.6, 0, Math.PI * 2);
        ctx.strokeStyle = '#f72585';
        ctx.rotate(this.angle * -2);
        ctx.stroke();

        ctx.restore();
    }
}

// --- Init & Loop ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupEvents();
    loadLevel();
    loop();
}

function resizeCanvas() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
}

function loadLevel() {
    gameStatus = 'aiming';
    ball = new Ball(100, height / 2);
    goal = new Goal(width - 100, height / 2);
    
    // Default Planets
    planets = [
        new Planet(width / 2, height / 2 - 100, 400),
        new Planet(width / 2, height / 2 + 100, 300)
    ];
    
    document.getElementById('message-overlay').classList.add('hidden');
}

// --- Interaction ---

function setupEvents() {
    canvas.addEventListener('mousedown', e => {
        if (gameStatus !== 'aiming') return;
        isDragging = true;
        dragStart = { x: e.offsetX, y: e.offsetY };
        dragCurrent = { x: e.offsetX, y: e.offsetY };
    });

    window.addEventListener('mousemove', e => {
        if (!isDragging) return;
        // Update drag current relative to canvas
        const rect = canvas.getBoundingClientRect();
        dragCurrent = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    });

    window.addEventListener('mouseup', e => {
        if (!isDragging) return;
        isDragging = false;
        
        // Shoot!
        const force = calculateLaunchVector();
        ball.vel = force;
        gameStatus = 'flying';
    });
    
    // UI Buttons
    document.getElementById('btn-reset').addEventListener('click', loadLevel);
    document.getElementById('btn-next').addEventListener('click', loadLevel); // Just reloads for now
    document.getElementById('btn-add-planet').addEventListener('click', () => {
        const x = Math.random() * (width - 200) + 100;
        const y = Math.random() * (height - 100) + 50;
        const m = Math.random() * 500 + 100;
        planets.push(new Planet(x, y, m));
    });
}

function calculateLaunchVector() {
    // Vector from Mouse to Ball (Pull back mechanism)
    let launch = new Vector(ball.pos.x - dragCurrent.x, ball.pos.y - dragCurrent.y);
    launch.mult(0.1); // Power scaling
    launch.limit(MAX_POWER);
    return launch;
}

// --- Physics Logic ---

function checkCollisions() {
    // 1. Goal
    if (ball.pos.dist(goal.pos) < goal.radius) {
        gameOver(true);
        return;
    }

    // 2. Planets
    for (let p of planets) {
        if (ball.pos.dist(p.pos) < p.radius + ball.radius) {
            gameOver(false, "Crashed into Planet!");
            return;
        }
    }

    // 3. Off Screen
    if (ball.pos.x < 0 || ball.pos.x > width || ball.pos.y < 0 || ball.pos.y > height) {
        gameOver(false, "Lost in Space!");
    }
}

function runPhysicsStep(simBall) {
    // Calculate Gravity from all planets
    for (let p of planets) {
        let force = p.attract(simBall);
        simBall.applyForce(force);
    }
    simBall.update();
}

function drawPrediction() {
    // Simulate X steps into the future without rendering
    // "Ghost" ball
    let ghost = new Ball(ball.pos.x, ball.pos.y);
    ghost.vel = calculateLaunchVector(); // Initial velocity based on drag

    ctx.beginPath();
    ctx.moveTo(ball.pos.x, ball.pos.y);
    ctx.strokeStyle = 'rgba(76, 201, 240, 0.5)'; // Accent color
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    for (let i = 0; i < PREDICTION_STEPS; i++) {
        runPhysicsStep(ghost);
        ctx.lineTo(ghost.pos.x, ghost.pos.y);
        
        // Stop line if it hits something in simulation
        let hit = false;
        for (let p of planets) {
            if (ghost.pos.dist(p.pos) < p.radius) hit = true;
        }
        if (hit) break;
    }
    ctx.stroke();
    ctx.setLineDash([]);
}

function gameOver(win, msg) {
    gameStatus = win ? 'won' : 'lost';
    const overlay = document.getElementById('message-overlay');
    const title = document.getElementById('msg-title');
    
    overlay.classList.remove('hidden');
    if (win) {
        title.innerText = "Wormhole Entered!";
        title.className = "";
    } else {
        title.innerText = msg || "Mission Failed";
        title.className = "fail";
    }
}

// --- Main Loop ---

function loop() {
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Goal & Planets
    goal.draw();
    for (let p of planets) p.draw();

    // 2. Logic based on state
    if (gameStatus === 'aiming') {
        ball.draw();
        
        if (isDragging) {
            // Draw Drag Line
            ctx.beginPath();
            ctx.moveTo(ball.pos.x, ball.pos.y);
            ctx.lineTo(dragCurrent.x, dragCurrent.y);
            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            ctx.stroke();

            // Draw Prediction 
            drawPrediction();
        }
    } 
    else if (gameStatus === 'flying') {
        runPhysicsStep(ball);
        checkCollisions();
        ball.draw();
    } 
    else {
        // Game Over state - just draw static ball
        ball.draw();
    }

    requestAnimationFrame(loop);
}

// Start
init();