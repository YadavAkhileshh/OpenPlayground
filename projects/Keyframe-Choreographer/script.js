// --- State Management ---
const keyframesData = {
    0:   { rx: 0, ry: 0, rz: 0, ty: 0, s: 1 },
    50:  { rx: 180, ry: 90, rz: 0, ty: -50, s: 1.2 },
    100: { rx: 360, ry: 360, rz: 0, ty: 0, s: 1 }
};

let activeStep = 0;

// --- DOM Elements ---
const cube = document.getElementById('targetCube');
const dynamicStyles = document.getElementById('dynamicStyles');
const codeOutput = document.getElementById('codeOutput');
const steps = document.querySelectorAll('.step');
const currentStepLabel = document.getElementById('currentStepLabel');

// Sliders and Value Displays
const controls = {
    rx: { input: document.getElementById('slRX'), val: document.getElementById('valRX') },
    ry: { input: document.getElementById('slRY'), val: document.getElementById('valRY') },
    rz: { input: document.getElementById('slRZ'), val: document.getElementById('valRZ') },
    ty: { input: document.getElementById('slTY'), val: document.getElementById('valTY') },
    s:  { input: document.getElementById('slS'), val: document.getElementById('valS') }
};

// --- Initialization ---
function init() {
    loadStepData(0);
    generateCSS();
    
    // Attach slider events
    Object.keys(controls).forEach(key => {
        controls[key].input.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            controls[key].val.innerText = val;
            keyframesData[activeStep][key] = val;
            
            applyLivePreview();
            generateCSS();
        });
    });

    // Attach step click events
    steps.forEach(stepEl => {
        stepEl.addEventListener('click', (e) => {
            steps.forEach(s => s.classList.remove('active'));
            e.target.classList.add('active');
            
            activeStep = parseInt(e.target.getAttribute('data-step'));
            currentStepLabel.innerText = `Editing: ${activeStep}%`;
            
            // Stop animation so user can see raw state
            cube.style.animation = 'none';
            loadStepData(activeStep);
            applyLivePreview();
        });
    });
}

function loadStepData(stepNum) {
    const data = keyframesData[stepNum];
    Object.keys(controls).forEach(key => {
        controls[key].input.value = data[key];
        controls[key].val.innerText = data[key];
    });
}

function buildTransformString(data) {
    // Note: Applying transforms right to left (scale, translate, rotate) for consistent center-axis spinning
    return `scale(${data.s}) translateY(${data.ty}px) rotateX(${data.rx}deg) rotateY(${data.ry}deg) rotateZ(${data.rz}deg)`;
}

function applyLivePreview() {
    cube.style.transform = buildTransformString(keyframesData[activeStep]);
}

// --- Code Generation & Injection ---
function generateCSS() {
    let cssString = `@keyframes customAnimation {\n`;
    
    // Sort keys just in case
    const sortedSteps = Object.keys(keyframesData).sort((a,b) => a-b);
    
    sortedSteps.forEach(step => {
        const tStr = buildTransformString(keyframesData[step]);
        cssString += `  ${step}% {\n    transform: ${tStr};\n  }\n`;
    });
    
    cssString += `}\n\n.cube.animated {\n  animation: customAnimation 3s infinite ease-in-out;\n}`;
    
    // Update text output
    codeOutput.innerText = cssString;
    
    // Update actual stylesheet
    dynamicStyles.innerHTML = cssString;
}

// --- Playback Controls ---
document.getElementById('btnPlay').addEventListener('click', () => {
    // Reset preview transform so it doesn't conflict
    cube.style.transform = '';
    
    // Force reflow to restart animation cleanly
    cube.classList.remove('animated');
    void cube.offsetWidth; 
    cube.classList.add('animated');
});

document.getElementById('btnStop').addEventListener('click', () => {
    cube.classList.remove('animated');
    applyLivePreview(); // Snap back to whatever the sliders currently say
});

init();

/**
 * Zen Archery Physics Engine
 * Handles projectile motion, trajectory prediction, and collision.
 */

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// --- Config ---
const GRAVITY = 0.4;
const FRICTION = 0.995; // Air resistance
const FORCE_MULTIPLIER = 0.15;
const MAX_FORCE = 25;
const GROUND_Y = window.innerHeight - 50;

// --- State ---
let width, height;
let arrows = [];
let targets = [];
let particles = [];
let score = 0;
let arrowsLeft = 10;
let isDragging = false;
let dragStart = { x: 0, y: 0 };
let currentMouse = { x: 0, y: 0 };
let isPlaying = false;

// --- Classes ---

class Arrow {
    constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.angle = Math.atan2(vy, vx);
        this.active = true;
        this.stuck = false;
        this.length = 60;
    }

    update() {
        if (this.stuck) return;

        this.x += this.vx;
        this.y += this.vy;
        this.vy += GRAVITY;
        this.vx *= FRICTION;
        this.vy *= FRICTION;
        
        // Update Angle based on velocity
        this.angle = Math.atan2(this.vy, this.vx);

        // Ground Collision
        if (this.y >= height - 20) {
            this.stuck = true;
            this.y = height - 20;
            // Shake effect logic could go here
        }
        
        // Bounds
        if (this.x > width + 100 || this.x < -100) this.active = false;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Shaft
        ctx.beginPath();
        ctx.moveTo(-this.length/2, 0);
        ctx.lineTo(this.length/2, 0);
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#2d3436';
        ctx.stroke();
        
        // Fletching (Feathers)
        ctx.fillStyle = '#e17055';
        ctx.beginPath();
        ctx.moveTo(-this.length/2, 0);
        ctx.lineTo(-this.length/2 - 10, -5);
        ctx.lineTo(-this.length/2 - 5, 0);
        ctx.lineTo(-this.length/2 - 10, 5);
        ctx.fill();
        
        // Head
        ctx.fillStyle = '#636e72';
        ctx.beginPath();
        ctx.moveTo(this.length/2, 0);
        ctx.lineTo(this.length/2 - 10, -4);
        ctx.lineTo(this.length/2 - 10, 4);
        ctx.fill();
        
        ctx.restore();
    }
}

class Target {
    constructor() {
        this.radius = 30 + Math.random() * 20;
        this.x = width - 100 - Math.random() * 200;
        this.y = height - 100 - Math.random() * (height/2);
        this.speedY = (Math.random() - 0.5) * 3;
        this.active = true;
        this.color1 = '#d63031'; // Red
        this.color2 = '#dfe6e9'; // White
    }

    update() {
        this.y += this.speedY;
        // Bounce bounds
        if (this.y < 100 || this.y > height - 100) this.speedY *= -1;
    }

    draw() {
        // Outer Ring
        ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        ctx.fillStyle = this.color1; ctx.fill();
        // Middle Ring
        ctx.beginPath(); ctx.arc(this.x, this.y, this.radius * 0.66, 0, Math.PI*2);
        ctx.fillStyle = this.color2; ctx.fill();
        // Bullseye
        ctx.beginPath(); ctx.arc(this.x, this.y, this.radius * 0.33, 0, Math.PI*2);
        ctx.fillStyle = this.color1; ctx.fill();
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x; this.y = y;
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = (Math.random() - 0.5) * 10;
        this.color = color;
        this.life = 1.0;
        this.size = Math.random() * 5 + 2;
    }
    update() {
        this.x += this.vx; this.y += this.vy;
        this.vy += GRAVITY;
        this.life -= 0.02;
    }
    draw() {
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI*2); ctx.fill();
        ctx.globalAlpha = 1.0;
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
    
    // Reset
    arrows = [];
    targets = [new Target(), new Target()];
    particles = [];
    score = 0;
    arrowsLeft = 10;
    isPlaying = true;
    updateUI();
    
    loop();
}

// --- Physics Logic ---

function checkCollisions() {
    for (let i = arrows.length - 1; i >= 0; i--) {
        let a = arrows[i];
        if (a.stuck || !a.active) continue;
        
        // Tip of arrow
        const tipX = a.x + Math.cos(a.angle) * (a.length/2);
        const tipY = a.y + Math.sin(a.angle) * (a.length/2);

        for (let j = targets.length - 1; j >= 0; j--) {
            let t = targets[j];
            const dist = Math.hypot(tipX - t.x, tipY - t.y);
            
            if (dist < t.radius) {
                // Hit!
                createExplosion(t.x, t.y);
                targets.splice(j, 1);
                a.stuck = true; // Arrow stops mid-air (cinematic) or falls? 
                // Let's remove arrow for cleaner look or make it fall
                a.active = false;
                
                // Scoring
                const bullseye = dist < t.radius * 0.33;
                score += bullseye ? 50 : 20;
                if (bullseye) arrowsLeft++; // Bonus arrow
                
                updateUI();
                
                // Spawn new target
                setTimeout(() => targets.push(new Target()), 1000);
            }
        }
    }
}

function createExplosion(x, y) {
    for(let i=0; i<15; i++) {
        particles.push(new Particle(x, y, Math.random()>0.5 ? '#d63031' : '#dfe6e9'));
    }
}

// --- Render ---

function drawTrajectory() {
    if (!isDragging) return;
    
    // Calculate launch vector
    let dx = dragStart.x - currentMouse.x;
    let dy = dragStart.y - currentMouse.y;
    
    // Clamp Force
    const rawLen = Math.hypot(dx, dy);
    const len = Math.min(rawLen * FORCE_MULTIPLIER, MAX_FORCE);
    const angle = Math.atan2(dy, dx);
    
    let vx = Math.cos(angle) * len;
    let vy = Math.sin(angle) * len;
    
    // Simulate path
    let simX = 100; // Player pos
    let simY = height - 150;
    
    ctx.beginPath();
    for(let i=0; i<30; i++) { // Draw 30 steps
        simX += vx;
        simY += vy;
        vy += GRAVITY;
        vx *= FRICTION; // Air resistance
        
        ctx.lineTo(simX, simY);
    }
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw Bow String stretch visualization
    ctx.beginPath();
    ctx.moveTo(100, height - 150 - 40);
    ctx.lineTo(100 - Math.min(dx*0.2, 30), height - 150 + Math.min(dy*0.2, 10)); // Pulled point
    ctx.lineTo(100, height - 150 + 40);
    ctx.strokeStyle = '#2d3436';
    ctx.lineWidth = 1;
    ctx.stroke();
}

function draw() {
    ctx.clearRect(0, 0, width, height);
    
    // Draw Ground 
    ctx.fillStyle = '#b2bec3';
    ctx.fillRect(0, height - 20, width, 20);
    
    // Draw Player (Simple Bow)
    ctx.save();
    ctx.translate(100, height - 150);
    // Determine rotation based on aim if dragging, else neutral
    if(isDragging) {
        let dx = dragStart.x - currentMouse.x;
        let dy = dragStart.y - currentMouse.y;
        ctx.rotate(Math.atan2(dy, dx));
    }
    // Bow arc
    ctx.beginPath();
    ctx.arc(0, 0, 40, -Math.PI/2, Math.PI/2);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#2d3436';
    ctx.stroke();
    ctx.restore();

    // Trajectory
    drawTrajectory();
    
    // Entities
    targets.forEach(t => t.draw());
    arrows.forEach(a => a.draw());
    particles.forEach(p => p.draw());
}

function updateUI() {
    document.getElementById('score-val').innerText = score;
    document.getElementById('arrow-val').innerText = arrowsLeft;
}

function gameOver() {
    isPlaying = false;
    document.getElementById('final-score').innerText = score;
    document.getElementById('game-over').classList.remove('hidden');
}

// --- Input ---

function setupInput() {
    canvas.addEventListener('mousedown', e => {
        if (!isPlaying || arrowsLeft <= 0) return;
        const rect = canvas.getBoundingClientRect();
        dragStart = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        // Only start drag if near player? For now global drag is easier UX
        isDragging = true;
    });
    
    canvas.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        currentMouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    });
    
    window.addEventListener('mouseup', e => {
        if (!isDragging) return;
        isDragging = false;
        
        if (arrowsLeft > 0) {
            shootArrow();
            arrowsLeft--;
            updateUI();
            
            if (arrowsLeft === 0) {
                // Wait for last arrow to settle before game over
                setTimeout(() => {
                    if (arrowsLeft === 0) gameOver(); 
                }, 3000);
            }
        }
    });
}

function shootArrow() {
    let dx = dragStart.x - currentMouse.x;
    let dy = dragStart.y - currentMouse.y;
    
    const rawLen = Math.hypot(dx, dy);
    const len = Math.min(rawLen * FORCE_MULTIPLIER, MAX_FORCE);
    const angle = Math.atan2(dy, dx);
    
    const vx = Math.cos(angle) * len;
    const vy = Math.sin(angle) * len;
    
    arrows.push(new Arrow(100, height - 150, vx, vy));
}

// --- Loop ---

function loop() {
    if (isPlaying) {
        // Update
        targets.forEach(t => t.update());
        arrows.forEach(a => a.update());
        particles.forEach(p => p.update());
        
        // Cleanup
        arrows = arrows.filter(a => a.active);
        particles = particles.filter(p => p.life > 0);
        
        checkCollisions();
        draw();
        
        requestAnimationFrame(loop);
    }
}

// Start
init();