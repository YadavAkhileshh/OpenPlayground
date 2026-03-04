/**
 * Knife Hit Game Engine
 * Handles rotation, knife throwing physics, and collision detection.
 */

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// --- Config ---
const LOG_RAD = 80;
const KNIFE_W = 15;
const KNIFE_H = 80;
const THROW_SPEED = 25;

// --- State ---
let width, height;
let center = { x: 0, y: 0 };
let log = { angle: 0, speed: 0.05, pattern: 'normal' };
let knives = []; // Knives stuck in log
let activeKnife = null; // Knife currently being thrown
let availableKnives = 7;
let stage = 1;
let score = 0;
let isPlaying = false;
let frameCount = 0;
let particles = []; // Wood chips

// --- Initialization ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousedown', throwKnife);
    window.addEventListener('touchstart', (e) => { e.preventDefault(); throwKnife(); });
    
    // Initial Render
    ctx.fillStyle = '#000';
    ctx.fillRect(0,0,width,height);
}

function resizeCanvas() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
    center.x = width / 2;
    center.y = height / 3; // Log sits higher up
}

function startGame() {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-over').classList.add('hidden');
    resetGame();
    isPlaying = true;
    loop();
}

function resetGame() {
    stage = 1;
    score = 0;
    setupStage();
}

function setupStage() {
    knives = [];
    activeKnife = { x: center.x, y: height - 100, state: 'ready' };
    availableKnives = 7 + Math.floor(stage / 2); // More knives per stage
    
    // Rotation Patterns
    const patterns = ['constant', 'sine', 'stop-go', 'reverse'];
    log.pattern = patterns[(stage - 1) % patterns.length];
    log.angle = 0;
    
    // Pre-stuck knives (increase diff)
    const stuckCount = Math.min(3, Math.floor(stage / 3));
    for(let i=0; i<stuckCount; i++) {
        knives.push({ angle: (Math.PI*2 / stuckCount) * i });
    }

    updateUI();
}

function updateUI() {
    document.getElementById('score-val').innerText = score;
    document.getElementById('stage-val').innerText = stage;
    
    const container = document.getElementById('knife-container');
    container.innerHTML = '';
    for(let i=0; i<availableKnives; i++) {
        const icon = document.createElement('i');
        icon.className = 'fas fa-khanda knife-icon active';
        container.appendChild(icon);
    }
}

// --- Game Logic ---

function throwKnife() {
    if (!isPlaying || activeKnife.state !== 'ready') return;
    
    activeKnife.state = 'flying';
    availableKnives--;
    
    // Update UI Icons (remove active class from top one)
    const icons = document.querySelectorAll('.knife-icon.active');
    if (icons.length > 0) icons[icons.length - 1].classList.remove('active');
}

function update() {
    if (!isPlaying) return;
    frameCount++;

    // 1. Log Rotation Logic
    updateLogRotation();

    // 2. Active Knife Logic
    if (activeKnife.state === 'flying') {
        activeKnife.y -= THROW_SPEED;

        // Collision with Log Surface
        if (activeKnife.y <= center.y + LOG_RAD) {
            checkHit();
        }
    } else if (activeKnife.state === 'ready') {
        // Reset position if stage changed
        activeKnife.y = height - 100;
    }

    // 3. Particles
    particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.5; p.life -= 0.05; });
    particles = particles.filter(p => p.life > 0);
}

function updateLogRotation() {
    // Base speed increases with stage
    const baseSpeed = 0.05 + (stage * 0.005);

    if (log.pattern === 'constant') {
        log.speed = baseSpeed;
    } else if (log.pattern === 'sine') {
        log.speed = Math.sin(frameCount * 0.05) * (baseSpeed * 1.5);
    } else if (log.pattern === 'stop-go') {
        // Stop every 60 frames
        log.speed = (Math.floor(frameCount / 60) % 2 === 0) ? baseSpeed * 2 : 0;
    } else if (log.pattern === 'reverse') {
        // Reverse every 100 frames
        log.speed = (Math.floor(frameCount / 100) % 2 === 0) ? baseSpeed : -baseSpeed;
    }
    
    log.angle += log.speed;
}

function checkHit() {
    // Convert current log angle to determine hit position relative to log
    // Knife hits at BOTTOM of log (PI/2 visual, but logic relative to 0)
    // The visual angle of hit is PI/2. The log is rotated by log.angle.
    // So the relative angle on the log is: PI/2 - log.angle
    
    const hitAngle = normalizeAngle(Math.PI/2 - log.angle);
    
    // Check Collision with existing knives
    // Knife width covers approx 0.15 radians
    const safeZone = 0.15; 
    
    let hit = false;
    for (let k of knives) {
        let diff = Math.abs(normalizeAngle(k.angle - hitAngle));
        if (diff > Math.PI) diff = Math.PI * 2 - diff; // Handle wrap-around distance
        
        if (diff < safeZone) {
            hit = true;
            break;
        }
    }

    if (hit) {
        gameOver();
    } else {
        // Success
        knives.push({ angle: hitAngle });
        score++;
        createParticles(center.x, center.y + LOG_RAD);
        
        // Shake effect
        center.y += 5; setTimeout(() => center.y -= 5, 50);

        // Next Knife
        if (availableKnives > 0) {
            activeKnife = { x: center.x, y: height - 100, state: 'ready' };
        } else {
            // Level Clear
            activeKnife.state = 'done';
            setTimeout(nextStage, 500);
        }
    }
    updateUI();
}

function nextStage() {
    stage++;
    setupStage();
}

function gameOver() {
    isPlaying = false;
    // Bouncing knife effect
    activeKnife.vx = (Math.random() - 0.5) * 10;
    activeKnife.vy = 10;
    activeKnife.state = 'falling';
    
    const loopFall = () => {
        if (!isPlaying) {
            activeKnife.x += activeKnife.vx;
            activeKnife.y += activeKnife.vy;
            activeKnife.vy += 1;
            draw();
            if(activeKnife.y < height) requestAnimationFrame(loopFall);
            else showFailScreen();
        }
    };
    loopFall();
}

function showFailScreen() {
    document.getElementById('final-score').innerText = score;
    document.getElementById('game-over').classList.remove('hidden');
}

function createParticles(x, y) {
    for(let i=0; i<8; i++) {
        particles.push({
            x: x, y: y,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            life: 1.0,
            color: '#8b5a2b'
        });
    }
}

function normalizeAngle(a) {
    a = a % (Math.PI * 2);
    if (a < 0) a += Math.PI * 2;
    return a;
}

// --- Rendering ---

function draw() {
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Log
    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(log.angle);
    
    // Log Body
    ctx.fillStyle = '#8b5a2b';
    ctx.beginPath();
    ctx.arc(0, 0, LOG_RAD, 0, Math.PI*2);
    ctx.fill();
    // Inner rings
    ctx.strokeStyle = '#6d4c41';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0,0, LOG_RAD-10, 0, Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.arc(0,0, LOG_RAD-25, 0, Math.PI*2); ctx.stroke();
    
    // Stuck Knives 
    // They rotate WITH the log
    for (let k of knives) {
        ctx.save();
        ctx.rotate(k.angle);
        drawKnife(0, LOG_RAD); // Draw at edge, rotated
        ctx.restore();
    }
    
    ctx.restore();

    // 2. Active Knife
    if (activeKnife.state !== 'done') {
        drawKnife(activeKnife.x, activeKnife.y, activeKnife.state === 'falling' ? activeKnife.angle : 0);
    }

    // 3. Particles
    particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fillRect(p.x, p.y, 4, 4);
    });
    ctx.globalAlpha = 1.0;
}

function drawKnife(x, y, angle = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    
    // Blade
    ctx.fillStyle = '#bdc3c7';
    ctx.beginPath();
    ctx.moveTo(-6, 0);
    ctx.lineTo(6, 0);
    ctx.lineTo(0, 40); // Point down if relative to log center? 
    // Actually, logic:
    // If drawing stuck knife: (0, LOG_RAD) means center of knife handle is at edge?
    // No, blade sticks IN.
    // If Active Knife: Y is bottom of screen.
    
    // Let's standardize: Draw knife pointing UP.
    // Handle at bottom (0,0), Tip at (0, -80)
    
    if (activeKnife.state === 'flying' || activeKnife.state === 'ready') {
        // Normal drawing
        // Handle
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(-6, 0, 12, 30);
        // Blade
        ctx.fillStyle = '#ecf0f1';
        ctx.beginPath();
        ctx.moveTo(-6, 0);
        ctx.lineTo(6, 0);
        ctx.lineTo(0, -60);
        ctx.fill();
        // Spine
        ctx.fillStyle = '#bdc3c7';
        ctx.fillRect(-1, 0, 2, -50);
    } else {
        // Stuck drawing (Relative to log center (0,0), rotated)
        // Knife is at angle. 
        // We are at (0, LOG_RAD). That is the surface.
        // We want the blade INSIDE (y < LOG_RAD) and handle OUTSIDE (y > LOG_RAD)
        
        // Handle
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(-6, 0, 12, 30);
        // Blade (buried)
        ctx.fillStyle = '#ecf0f1';
        ctx.beginPath();
        ctx.moveTo(-6, 0);
        ctx.lineTo(6, 0);
        ctx.lineTo(0, -20); // Short visible blade
        ctx.fill();
    }
    
    ctx.restore();
}

function loop() {
    update();
    draw();
    if(isPlaying) requestAnimationFrame(loop);
}

// Start
init();