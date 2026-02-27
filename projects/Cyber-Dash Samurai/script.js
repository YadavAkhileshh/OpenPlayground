/**
 * Cyber Dash Engine
 * Implements Time Dilation and Line Segment Intersection logic.
 */

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// --- Config ---
const MAX_DASH = 300;
const DASH_COOLDOWN = 10;
const ENEMY_SPEED = 2;
const SPAWN_RATE = 60; // Frames

// --- State ---
let width, height;
let player = { x: 0, y: 0, radius: 10, dead: false };
let enemies = [];
let particles = []; // Debris
let mouse = { x: 0, y: 0, down: false };
let timeScale = 1.0;
let score = 0;
let combo = 0;
let frameCount = 0;
let isPlaying = false;
let dashLine = null; // {x1, y1, x2, y2}

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
    player.x = width / 2;
    player.y = height / 2;
}

function startGame() {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-over').classList.add('hidden');
    
    player = { x: width/2, y: height/2, radius: 10, dead: false };
    enemies = [];
    particles = [];
    score = 0;
    combo = 0;
    timeScale = 1.0;
    isPlaying = true;
    
    updateUI();
    loop();
}

// --- Logic ---

function update() {
    if (!isPlaying) return;

    // Time Dilation
    // If aiming (mouse down), slow time to 10%
    const targetTime = mouse.down ? 0.1 : 1.0;
    timeScale += (targetTime - timeScale) * 0.2; // Smooth transition
    
    // UI Vignette
    if (timeScale < 0.5) document.getElementById('slow-mo-overlay').classList.add('active');
    else document.getElementById('slow-mo-overlay').classList.remove('active');

    // Enemies (Spawn & Move)
    if (frameCount % Math.floor(SPAWN_RATE / timeScale) === 0 && timeScale > 0.2) {
        spawnEnemy();
    }
    
    // Update Entities with Delta Time
    for (let i = enemies.length - 1; i >= 0; i--) {
        let e = enemies[i];
        
        // Move towards player
        const dx = player.x - e.x;
        const dy = player.y - e.y;
        const dist = Math.hypot(dx, dy);
        
        if (dist > 0) {
            e.x += (dx / dist) * ENEMY_SPEED * timeScale;
            e.y += (dy / dist) * ENEMY_SPEED * timeScale;
        }
        
        // Rotation
        e.angle += 0.05 * timeScale;
        
        // Collision with Player (Game Over)
        if (dist < player.radius + e.size) {
            gameOver();
        }
    }

    // Particles (Physics)
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx * timeScale;
        p.y += p.vy * timeScale;
        p.life -= 0.02 * timeScale; // Only age when time flows?
        if (p.life <= 0) particles.splice(i, 1);
    }
    
    frameCount++;
}

function performDash() {
    // 1. Calculate Dash Vector
    const dx = mouse.x - player.x;
    const dy = mouse.y - player.y;
    const dist = Math.hypot(dx, dy);
    
    // Clamp Dash
    const dashDist = Math.min(dist, MAX_DASH);
    const angle = Math.atan2(dy, dx);
    
    const targetX = player.x + Math.cos(angle) * dashDist;
    const targetY = player.y + Math.sin(angle) * dashDist;
    
    // 2. Raycast / Segment Intersection Check against Enemies
    let hitCount = 0;
    
    for (let i = enemies.length - 1; i >= 0; i--) {
        let e = enemies[i];
        // Dist from line segment to point
        if (lineCircleCollide(player.x, player.y, targetX, targetY, e.x, e.y, e.size)) {
            // SLICED!
            destroyEnemy(e);
            enemies.splice(i, 1);
            hitCount++;
        }
    }
    
    // 3. Move Player
    createDashTrail(player.x, player.y, targetX, targetY);
    player.x = targetX;
    player.y = targetY;
    
    // 4. Scoring
    if (hitCount > 0) {
        combo += hitCount;
        score += hitCount * 100 * combo;
        screenShake(5 * hitCount);
    } else {
        combo = 0; // Miss resets combo
    }
    
    updateUI();
}

// Math: Shortest distance from point (px,py) to line segment (x1,y1)-(x2,y2)
function lineCircleCollide(x1, y1, x2, y2, px, py, r) {
    const l2 = (x1-x2)**2 + (y1-y2)**2;
    if (l2 === 0) return Math.hypot(px-x1, py-y1) < r;
    
    let t = ((px-x1)*(x2-x1) + (py-y1)*(y2-y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    
    const projX = x1 + t * (x2 - x1);
    const projY = y1 + t * (y2 - y1);
    
    return Math.hypot(px-projX, py-projY) < r;
}

function spawnEnemy() {
    // Spawn at edge
    let x, y;
    if (Math.random() < 0.5) {
        x = Math.random() < 0.5 ? -20 : width + 20;
        y = Math.random() * height;
    } else {
        x = Math.random() * width;
        y = Math.random() < 0.5 ? -20 : height + 20;
    }
    
    enemies.push({
        x: x, y: y,
        size: 15,
        angle: Math.random() * Math.PI,
        color: Math.random() > 0.5 ? '#ff00ff' : '#ffff00'
    });
}

function destroyEnemy(e) {
    // Spawn Triangles (Shards)
    for (let i = 0; i < 4; i++) {
        particles.push({
            x: e.x, y: e.y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            life: 1.0,
            color: e.color,
            angle: e.angle
        });
    }
}

function createDashTrail(x1, y1, x2, y2) {
    // Visual only - managed in draw loop or separate array
    dashLine = { x1, y1, x2, y2, life: 1.0 };
}

function screenShake(amount) {
    // CSS Shake
    const body = document.body;
    body.style.transform = `translate(${Math.random()*amount}px, ${Math.random()*amount}px)`;
    setTimeout(() => body.style.transform = 'none', 50);
}

function gameOver() {
    isPlaying = false;
    document.getElementById('final-score').innerText = score;
    document.getElementById('game-over').classList.remove('hidden');
}

function updateUI() {
    document.getElementById('score-val').innerText = score;
    const box = document.getElementById('combo-box');
    if (combo > 1) {
        box.classList.remove('hidden');
        document.getElementById('combo-val').innerText = 'x' + combo;
    } else {
        box.classList.add('hidden');
    }
}

// --- Draw ---

function draw() {
    // Clear with trail effect? No, clean clear for crisp lines
    ctx.clearRect(0, 0, width, height);
    
    // Draw Dash Line (Aiming)
    if (mouse.down && isPlaying) {
        const dx = mouse.x - player.x;
        const dy = mouse.y - player.y;
        const dist = Math.hypot(dx, dy);
        const dashDist = Math.min(dist, MAX_DASH);
        const angle = Math.atan2(dy, dx);
        
        const tx = player.x + Math.cos(angle) * dashDist;
        const ty = player.y + Math.sin(angle) * dashDist;
        
        ctx.strokeStyle = '#00f3ff';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(player.x, player.y);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Target Reticle
        ctx.beginPath();
        ctx.arc(tx, ty, 5, 0, Math.PI*2);
        ctx.stroke();
    }
    
    // Draw Dash Flash (After effect)
    if (dashLine && dashLine.life > 0) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${dashLine.life})`;
        ctx.lineWidth = 10 * dashLine.life;
        ctx.beginPath();
        ctx.moveTo(dashLine.x1, dashLine.y1);
        ctx.lineTo(dashLine.x2, dashLine.y2);
        ctx.stroke();
        dashLine.life -= 0.1;
    }
    
    // Draw Enemies (Squares)
    ctx.lineWidth = 2;
    for (let e of enemies) {
        ctx.save();
        ctx.translate(e.x, e.y);
        ctx.rotate(e.angle);
        ctx.strokeStyle = e.color;
        ctx.shadowColor = e.color;
        ctx.shadowBlur = 10;
        ctx.strokeRect(-e.size, -e.size, e.size*2, e.size*2);
        ctx.restore();
    }
    ctx.shadowBlur = 0;

    // Draw Particles
    for (let p of particles) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.moveTo(0, -5);
        ctx.lineTo(5, 5);
        ctx.lineTo(-5, 5);
        ctx.fill();
        ctx.restore();
    }
    ctx.globalAlpha = 1.0;

    // Draw Player
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI*2);
    ctx.fill();
    // Glow
    ctx.shadowColor = '#00f3ff';
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.shadowBlur = 0;
}

// --- Input ---

function setupInput() {
    canvas.addEventListener('mousedown', e => {
        if (!isPlaying) return;
        mouse.down = true;
    });
    
    window.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });
    
    window.addEventListener('mouseup', e => {
        if (mouse.down && isPlaying) {
            performDash();
            mouse.down = false;
        }
    });
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Start
init();