/**
 * Lunar Cargo Lander Engine
 * Implements spring physics, vector thrust, and procedural terrain.
 */

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// --- Config ---
const GRAVITY = 0.05;
const THRUST_PWR = 0.15;
const ROT_SPEED = 0.05;
const MAX_SAFE_VELOCITY = 2.0;
const MAX_SAFE_ANGLE = 0.3; // Radians from upright
const TETHER_LENGTH = 80;
const SPRING_K = 0.05;   // Spring stiffness
const DAMPING = 0.95;    // Rope energy loss

// --- State ---
let width, height;
let terrain = [];
let pad = { x: 0, w: 100, y: 0 };
let particles = [];

let ship = { x: 0, y: 0, vx: 0, vy: 0, angle: -Math.PI/2, w: 20, h: 30, fuel: 100 };
let cargo = { x: 0, y: 0, vx: 0, vy: 0, radius: 15 };

let keys = { ArrowUp: false, ArrowLeft: false, ArrowRight: false };
let isPlaying = false;

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
    document.getElementById('victory').classList.add('hidden');
    
    generateTerrain();
    
    ship = { 
        x: 100, y: 100, 
        vx: 2, vy: 0, 
        angle: -Math.PI/2, 
        w: 20, h: 30, 
        fuel: 100 
    };
    
    cargo = { 
        x: ship.x, y: ship.y + TETHER_LENGTH, 
        vx: 2, vy: 0, 
        radius: 12 
    };
    
    particles = [];
    isPlaying = true;
    
    loop();
}

function generateTerrain() {
    terrain = [];
    const step = 20; // Pixel resolution of terrain
    let currentY = height - 100;
    
    // Place Landing Pad randomly in the middle 60% of the screen
    pad.w = 120;
    pad.x = width * 0.2 + Math.random() * (width * 0.6);
    pad.y = height - 50 - Math.random() * 150;
    
    for (let x = 0; x <= width + step; x += step) {
        // Flatten terrain if it's the landing pad
        if (x >= pad.x && x <= pad.x + pad.w) {
            terrain.push({ x: x, y: pad.y });
            currentY = pad.y;
        } else {
            // Random jaggedness
            currentY += (Math.random() - 0.5) * 60;
            // Constrain
            if (currentY > height - 20) currentY = height - 20;
            if (currentY < height - 300) currentY = height - 300;
            
            terrain.push({ x: x, y: currentY });
        }
    }
}

// --- Physics Logic ---

function update() {
    if (!isPlaying) return;

    // 1. Ship Input & Thrust
    if (keys.ArrowLeft) ship.angle -= ROT_SPEED;
    if (keys.ArrowRight) ship.angle += ROT_SPEED;
    
    if (keys.ArrowUp && ship.fuel > 0) {
        ship.vx += Math.cos(ship.angle) * THRUST_PWR;
        ship.vy += Math.sin(ship.angle) * THRUST_PWR;
        ship.fuel -= 0.1;
        createExhaust();
    }

    // 2. Gravity
    ship.vy += GRAVITY;
    cargo.vy += GRAVITY;

    // 3. Tether Physics (Hooke's Law) 
    let dx = cargo.x - ship.x;
    let dy = cargo.y - ship.y;
    let distance = Math.hypot(dx, dy);
    
    if (distance > 0) {
        // F = -k * x
        let displacement = distance - TETHER_LENGTH;
        let force = displacement * SPRING_K;
        
        let fx = (dx / distance) * force;
        let fy = (dy / distance) * force;
        
        // Apply forces (Cargo is heavier, so ship is pulled more)
        cargo.vx -= fx * 0.5;
        cargo.vy -= fy * 0.5;
        ship.vx += fx * 1.5; 
        ship.vy += fy * 1.5;
    }
    
    // Damping to simulate air resistance / internal rope friction
    cargo.vx *= DAMPING;
    cargo.vy *= DAMPING;

    // Apply Velocities
    ship.x += ship.vx;
    ship.y += ship.vy;
    cargo.x += cargo.vx;
    cargo.y += cargo.vy;

    // Particles
    for(let i=particles.length-1; i>=0; i--){
        let p = particles[i];
        p.x += p.vx; p.y += p.vy;
        p.life -= 0.05;
        if(p.life <= 0) particles.splice(i, 1);
    }

    checkCollisions();
    updateUI();
}

function createExhaust() {
    // Spawn particles opposite to ship angle
    const exhaustX = ship.x - Math.cos(ship.angle) * (ship.h/2);
    const exhaustY = ship.y - Math.sin(ship.angle) * (ship.h/2);
    
    particles.push({
        x: exhaustX + (Math.random()-0.5)*5,
        y: exhaustY + (Math.random()-0.5)*5,
        vx: -Math.cos(ship.angle) * 3 + (Math.random()-0.5),
        vy: -Math.sin(ship.angle) * 3 + (Math.random()-0.5),
        life: 1.0,
        color: Math.random() > 0.5 ? '#ffeb3b' : '#ff2a2a'
    });
}

function checkCollisions() {
    // Out of bounds (sides/top)
    if (ship.x < 0 || ship.x > width || ship.y < -100) return triggerFail("Ship flew out of mission zone.");

    // Helper to get terrain Y at a specific X
    function getTerrainY(px) {
        if (px < 0) px = 0;
        if (px >= width) px = width - 1;
        
        // Find segment
        for(let i=0; i<terrain.length-1; i++){
            if (px >= terrain[i].x && px <= terrain[i+1].x) {
                // Interpolate
                let t = (px - terrain[i].x) / (terrain[i+1].x - terrain[i].x);
                return terrain[i].y + t * (terrain[i+1].y - terrain[i].y);
            }
        }
        return height;
    }

    const shipSurfaceY = getTerrainY(ship.x);
    const cargoSurfaceY = getTerrainY(cargo.x);

    // Ship collision (bottom of ship)
    if (ship.y + ship.h/2 >= shipSurfaceY) {
        evaluateLanding();
    }
    
    // Cargo collision
    if (cargo.y + cargo.radius >= cargoSurfaceY) {
        triggerFail("Cargo smashed into the surface!");
    }
}

function evaluateLanding() {
    // Check if within pad boundaries
    if (ship.x > pad.x && ship.x < pad.x + pad.w) {
        // Calculate total velocity
        let velocity = Math.hypot(ship.vx, ship.vy);
        
        // Calculate angle deviation from vertical (-PI/2)
        let angleDev = Math.abs(ship.angle - (-Math.PI/2));
        // Normalize angle (e.g. 270 deg is also upright)
        angleDev = angleDev % (Math.PI*2);
        if (angleDev > Math.PI) angleDev = Math.PI*2 - angleDev;

        if (velocity > MAX_SAFE_VELOCITY) {
            triggerFail(`Landing speed too high (${velocity.toFixed(1)} m/s).`);
        } else if (angleDev > MAX_SAFE_ANGLE) {
            triggerFail("Landing angle too steep. Ship tipped over.");
        } else {
            triggerWin();
        }
    } else {
        triggerFail("Missed the landing pad. Crashed on jagged rocks.");
    }
}

function triggerFail(reason) {
    isPlaying = false;
    document.getElementById('fail-reason').innerText = reason;
    document.getElementById('game-over').classList.remove('hidden');
    spawnExplosion(ship.x, ship.y);
}

function triggerWin() {
    isPlaying = false;
    document.getElementById('victory').classList.remove('hidden');
}

function spawnExplosion(x, y) {
    for(let i=0; i<30; i++) {
        particles.push({
            x: x, y: y,
            vx: (Math.random()-0.5)*10,
            vy: (Math.random()-0.5)*10,
            life: 2.0,
            color: '#ff2a2a'
        });
    }
}

// --- Render ---

function draw() {
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Terrain
    ctx.beginPath();
    ctx.moveTo(0, height);
    terrain.forEach((pt, i) => {
        if (i === 0) ctx.lineTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
    });
    ctx.lineTo(width, height);
    
    ctx.fillStyle = '#111';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fff';
    ctx.stroke();

    // 2. Draw Pad
    ctx.fillStyle = '#ffeb3b';
    ctx.fillRect(pad.x, pad.y, pad.w, 5);

    // 3. Draw Particles
    particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 3, 3);
    });
    ctx.globalAlpha = 1.0;

    // Only draw ship/cargo if playing (hide if crashed)
    if (!isPlaying && document.getElementById('game-over').classList.contains('hidden') === false) return;

    // 4. Draw Tether
    ctx.beginPath();
    ctx.moveTo(ship.x, ship.y);
    ctx.lineTo(cargo.x, cargo.y);
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 5. Draw Cargo
    ctx.beginPath();
    ctx.arc(cargo.x, cargo.y, cargo.radius, 0, Math.PI*2);
    ctx.fillStyle = '#00ff41';
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.stroke();
    // Cargo Cross
    ctx.beginPath(); ctx.moveTo(cargo.x-8, cargo.y); ctx.lineTo(cargo.x+8, cargo.y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cargo.x, cargo.y-8); ctx.lineTo(cargo.x, cargo.y+8); ctx.stroke();

    // 6. Draw Ship
    ctx.save();
    ctx.translate(ship.x, ship.y);
    ctx.rotate(ship.angle + Math.PI/2); // Offset so 0 rotation draws pointing up
    
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#000';
    
    // Triangle hull
    ctx.beginPath();
    ctx.moveTo(0, -ship.h/2);
    ctx.lineTo(ship.w/2, ship.h/2);
    ctx.lineTo(-ship.w/2, ship.h/2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Landing gear
    ctx.beginPath(); ctx.moveTo(ship.w/2, ship.h/2); ctx.lineTo(ship.w/2 + 5, ship.h/2 + 5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-ship.w/2, ship.h/2); ctx.lineTo(-ship.w/2 - 5, ship.h/2 + 5); ctx.stroke();

    ctx.restore();
}

function updateUI() {
    let vel = Math.hypot(ship.vx, ship.vy);
    let elVel = document.getElementById('vel-val');
    elVel.innerText = vel.toFixed(1);
    elVel.className = vel > MAX_SAFE_VELOCITY ? 'red' : 'green';

    let alt = (height - ship.y - (height - pad.y)); // Approx relative to pad
    document.getElementById('alt-val').innerText = Math.max(0, Math.floor(alt));

    document.getElementById('fuel-val').innerText = Math.max(0, Math.floor(ship.fuel));
    
    let deg = (ship.angle * 180 / Math.PI) + 90;
    document.getElementById('ang-val').innerText = Math.floor(deg);
}

// --- Input ---

function setupInput() {
    window.addEventListener('keydown', e => {
        if(keys.hasOwnProperty(e.code)) keys[e.code] = true;
    });
    window.addEventListener('keyup', e => {
        if(keys.hasOwnProperty(e.code)) keys[e.code] = false;
    });
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Start
init();