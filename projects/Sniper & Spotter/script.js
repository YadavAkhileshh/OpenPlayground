const canvas = document.getElementById('scopeCanvas');
const ctx = canvas.getContext('2d');

// Resize handling
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// HUD Elements
const windArrow = document.getElementById('windArrow');
const windSpdReadout = document.getElementById('windSpdReadout');
const windDirReadout = document.getElementById('windDirReadout');
const elevReadout = document.getElementById('elevReadout');
const windageReadout = document.getElementById('windageReadout');
const fireStatus = document.getElementById('fireStatus');
const scoreReadout = document.getElementById('scoreReadout');
const distReadout = document.getElementById('distReadout');

// --- Physics & Game State ---
const state = {
    score: 0,
    distance: 850,
    gravityDrop: 12.4, // Simplified drop factor
    windSpeed: 0,
    windAngle: 0, // Degrees
    windDriftX: 0,
    windDriftY: 0,
    
    // Player Dials (MILs)
    elevation: 0.0,
    windage: 0.0,
    
    // Scope/Mouse position
    mouseX: canvas.width / 2,
    mouseY: canvas.height / 2,
    swayTime: 0,
    
    // Weapon state
    canFire: true,
    impactPoints: [] // Tracks bullet holes
};

// Target Entity
const target = {
    x: canvas.width / 2,
    y: canvas.height / 2 + 100,
    radius: 20,
    speed: 1.5,
    direction: 1
};

// --- Input Handling ---
window.addEventListener('mousemove', (e) => {
    state.mouseX = e.clientX;
    state.mouseY = e.clientY;
});

const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    
    // Quick Reset
    if (e.key.toLowerCase() === 'r') {
        state.elevation = 0;
        state.windage = 0;
    }
});
window.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);

window.addEventListener('mousedown', () => {
    if (state.canFire) fireWeapon();
});

// --- Core Logic ---
function generateWeather() {
    // Random wind speed 0.0 to 8.0 m/s
    state.windSpeed = (Math.random() * 8).toFixed(1);
    // Random angle 0 to 360
    state.windAngle = Math.floor(Math.random() * 360);
    
    // Calculate lateral and vertical wind drift forces
    const rad = state.windAngle * (Math.PI / 180);
    // Multiply by an arbitrary factor to simulate distance magnification
    const distanceFactor = state.distance / 100; 
    state.windDriftX = Math.sin(rad) * state.windSpeed * distanceFactor;
    state.windDriftY = -Math.cos(rad) * state.windSpeed * distanceFactor;

    // Update UI
    windSpdReadout.innerText = state.windSpeed;
    windDirReadout.innerText = state.windAngle.toString().padStart(3, '0');
    windArrow.style.transform = `rotate(${state.windAngle}deg)`;
}

function processInputs() {
    const dialSpeed = 0.1;
    if (keys['w']) state.elevation += dialSpeed;
    if (keys['s']) state.elevation -= dialSpeed;
    if (keys['d']) state.windage += dialSpeed;
    if (keys['a']) state.windage -= dialSpeed;

    // Clamp values
    state.elevation = Math.max(-50, Math.min(50, state.elevation));
    state.windage = Math.max(-50, Math.min(50, state.windage));

    elevReadout.innerText = state.elevation.toFixed(1);
    windageReadout.innerText = state.windage.toFixed(1);
}

function fireWeapon() {
    state.canFire = false;
    fireStatus.innerText = "RELOADING...";
    fireStatus.style.color = "#ff5555";
    
    // Screen shake
    ctx.translate(0, -30);
    setTimeout(() => ctx.setTransform(1, 0, 0, 1, 0, 0), 50);

    // Calculate actual impact point 
    // The crosshair is always at screen center. 
    // We adjust the virtual impact point based on physics and dial compensation.
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const dialMultiplier = 15; // Pixels per MIL adjustment
    
    let impactX = cx + state.windDriftX - (state.windage * dialMultiplier);
    let impactY = cy + state.gravityDrop * (state.distance/100) - (state.elevation * dialMultiplier);

    // Save impact for visual feedback (relative to the background)
    // We need to map screen impact to world coordinates
    const swayX = Math.sin(state.swayTime) * 15;
    const swayY = Math.cos(state.swayTime * 0.8) * 10;
    
    const worldImpactX = impactX + (state.mouseX - cx) + swayX;
    const worldImpactY = impactY + (state.mouseY - cy) + swayY;

    state.impactPoints.push({ x: worldImpactX, y: worldImpactY, alpha: 1.0 });

    // Check Collision with Target
    const distToTarget = Math.hypot(worldImpactX - target.x, worldImpactY - target.y);
    if (distToTarget < target.radius) {
        state.score++;
        scoreReadout.innerText = state.score;
        generateWeather(); // Weather changes on hit
        
        // Reset target
        target.x = Math.random() < 0.5 ? 200 : canvas.width - 200;
        target.direction *= -1;
    }

    // Reload timer
    setTimeout(() => {
        state.canFire = true;
        fireStatus.innerText = "READY TO FIRE";
        fireStatus.style.color = "#50fa7b";
    }, 2000);
}

// --- Render Loop ---
function draw() {
    processInputs();
    
    // Scope Sway Math
    state.swayTime += 0.02;
    const swayX = Math.sin(state.swayTime) * 15;
    const swayY = Math.cos(state.swayTime * 0.8) * 10;

    // Calculate Camera Offset (Parallax based on mouse + sway)
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const camX = (state.mouseX - cx) + swayX;
    const camY = (state.mouseY - cy) + swayY;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw Environment (Moves opposite to camera)
    ctx.save();
    ctx.translate(-camX, -camY);

    // Draw Grid Background
    ctx.strokeStyle = '#112211';
    ctx.lineWidth = 2;
    for (let i = -1000; i < canvas.width + 1000; i += 100) {
        ctx.beginPath(); ctx.moveTo(i, -1000); ctx.lineTo(i, canvas.height + 1000); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-1000, i); ctx.lineTo(canvas.width + 1000, i); ctx.stroke();
    }

    // Draw Target
    target.x += target.speed * target.direction;
    if (target.x < 100 || target.x > canvas.width - 100) target.direction *= -1;

    ctx.fillStyle = '#ff5555';
    ctx.beginPath();
    ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw Bullet Impacts
    state.impactPoints.forEach((pt, index) => {
        ctx.fillStyle = `rgba(255, 255, 0, ${pt.alpha})`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
        ctx.fill();
        pt.alpha -= 0.005; // Fade out slowly
        if (pt.alpha <= 0) state.impactPoints.splice(index, 1);
    });

    ctx.restore();

    // 2. Draw Scope Overlay (Static to Screen Center)
    const scopeRadius = 300;
    
    // Vignette / Black out edges
    ctx.fillStyle = '#020202';
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.arc(cx, cy, scopeRadius, 0, Math.PI * 2, true);
    ctx.fill();

    // Scope Lens Tint
    const gradient = ctx.createRadialGradient(cx, cy, scopeRadius * 0.5, cx, cy, scopeRadius);
    gradient.addColorStop(0, 'rgba(80, 250, 123, 0.05)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, scopeRadius, 0, Math.PI * 2);
    ctx.fill();

    // Crosshairs
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy - scopeRadius); ctx.lineTo(cx, cy + scopeRadius);
    ctx.moveTo(cx - scopeRadius, cy); ctx.lineTo(cx + scopeRadius, cy);
    ctx.stroke();

    // Mil-Dots on Crosshairs
    ctx.fillStyle = '#000';
    const spacing = 30; // 1 MIL visual spacing
    for (let i = -8; i <= 8; i++) {
        if (i === 0) continue;
        // Horizontal dots
        ctx.fillRect(cx + (i * spacing) - 1, cy - 4, 2, 8);
        // Vertical dots
        ctx.fillRect(cx - 4, cy + (i * spacing) - 1, 8, 2);
    }

    requestAnimationFrame(draw);
}

// Start Game
generateWeather();
requestAnimationFrame(draw);