/**
 * Glitch Pong Engine
 * A Pong clone where collisions trigger chaotic visual and physical modifiers.
 */

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const wrapper = document.getElementById('game-wrapper');

// --- Config & State ---
let width, height;
let isPlaying = false;
let score = { p1: 0, p2: 0 };
let multiplier = 1;
const WIN_SCORE = 7;

let keys = { w: false, s: false };

// Entities
let player = { x: 30, y: 0, w: 15, h: 100, speed: 8, color: '#00ffcc', originalH: 100 };
let ai = { x: 0, y: 0, w: 15, h: 100, speed: 6, color: '#ff0055', originalH: 100 };
let balls = [];

// Glitch Management
let activeGlitches = new Set();
let glitchTimer = null;

const GLITCH_POOL = [
    { id: 'invert', name: 'COLOR INVERSION', duration: 4000, type: 'visual' },
    { id: 'multiball', name: 'MULTIBALL', duration: 6000, type: 'physical' },
    { id: 'hyper', name: 'HYPER SPEED', duration: 3000, type: 'physical' },
    { id: 'shrink', name: 'PADDLE SHRINK', duration: 5000, type: 'physical' },
    { id: 'shake', name: 'SYSTEM SHAKE', duration: 2000, type: 'visual' }
];

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
    
    ai.x = width - 45;
    player.y = height/2 - player.h/2;
    ai.y = height/2 - ai.h/2;
}

function startGame() {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-over').classList.add('hidden');
    
    score = { p1: 0, p2: 0 };
    multiplier = 1;
    resetGlitches();
    updateUI();
    spawnBall();
    isPlaying = true;
    
    loop();
}

function spawnBall(isExtra = false) {
    let b = {
        x: width/2,
        y: height/2,
        size: 10,
        vx: (Math.random() > 0.5 ? 1 : -1) * 6,
        vy: (Math.random() * 4 - 2),
        color: '#fff',
        trail: []
    };
    
    if (isExtra) {
        // Spawn with random angle
        b.vy = (Math.random() * 8 - 4);
        balls.push(b);
    } else {
        balls = [b]; // Reset to 1 ball
    }
}

// --- Logic ---

function update() {
    if (!isPlaying) return;

    // Player Input
    let moveSpeed = player.speed;
    if (keys.w && player.y > 0) player.y -= moveSpeed;
    if (keys.s && player.y + player.h < height) player.y += moveSpeed;

    // AI Logic (Tracks the closest approaching ball)
    let targetBall = null;
    let minDist = Infinity;
    balls.forEach(b => {
        if (b.vx > 0) { // Moving towards AI
            let dist = Math.abs(b.x - ai.x);
            if (dist < minDist) { minDist = dist; targetBall = b; }
        }
    });
    
    if (targetBall) {
        let aiCenter = ai.y + ai.h/2;
        if (aiCenter < targetBall.y - 10) ai.y += ai.speed;
        else if (aiCenter > targetBall.y + 10) ai.y -= ai.speed;
    }
    // Constrain AI
    if (ai.y < 0) ai.y = 0;
    if (ai.y + ai.h > height) ai.y = height - ai.h;

    // Ball Physics 
    for (let i = balls.length - 1; i >= 0; i--) {
        let b = balls[i];
        
        // Trail
        b.trail.push({x: b.x, y: b.y});
        if(b.trail.length > 5) b.trail.shift();

        // Speed modifier
        let currentVx = b.vx * (activeGlitches.has('hyper') ? 2 : 1);
        let currentVy = b.vy * (activeGlitches.has('hyper') ? 2 : 1);

        b.x += currentVx;
        b.y += currentVy;

        // Wall Bounces (Top/Bottom)
        if (b.y < 0 || b.y + b.size > height) {
            b.vy *= -1;
            b.y = b.y < 0 ? 0 : height - b.size;
        }

        // Paddle Collisions
        if (checkPaddleCollision(b, player) && b.vx < 0) {
            handleHit(b, player);
        } else if (checkPaddleCollision(b, ai) && b.vx > 0) {
            handleHit(b, ai);
        }

        // Scoring (Left/Right walls)
        if (b.x < 0) {
            scoreGoal('p2');
            balls.splice(i, 1);
        } else if (b.x > width) {
            scoreGoal('p1');
            balls.splice(i, 1);
        }
    }
    
    // Ensure at least one ball exists if not scored yet
    if (balls.length === 0 && isPlaying) {
        spawnBall();
    }
}

function checkPaddleCollision(b, p) {
    return b.x < p.x + p.w &&
           b.x + b.size > p.x &&
           b.y < p.y + p.h &&
           b.y + b.size > p.y;
}

function handleHit(b, paddle) {
    // Reverse and speed up slightly
    b.vx *= -1.05; 
    
    // English/Spin based on where it hit the paddle
    let hitPoint = (b.y + b.size/2) - (paddle.y + paddle.h/2);
    let normalizedHit = hitPoint / (paddle.h/2); // -1 to 1
    b.vy = normalizedHit * 5;

    // Glitch Chance!
    if (Math.random() < 0.4) {
        triggerRandomGlitch();
    }
}

// --- Glitch System ---

function triggerRandomGlitch() {
    if (activeGlitches.size > 2) return; // Prevent absolute unplayable chaos

    let glitch = GLITCH_POOL[Math.floor(Math.random() * GLITCH_POOL.length)];
    
    // Don't stack the exact same glitch
    if (activeGlitches.has(glitch.id)) return;
    
    activeGlitches.add(glitch.id);
    multiplier++;
    
    // Apply Effects
    if (glitch.id === 'invert') wrapper.classList.add('invert');
    if (glitch.id === 'shake') wrapper.classList.add('shake');
    if (glitch.id === 'multiball') spawnBall(true);
    if (glitch.id === 'shrink') {
        player.h = player.originalH / 2;
        ai.h = ai.originalH / 2;
    }

    // UI Alert
    let alertEl = document.getElementById('glitch-alert');
    alertEl.innerText = `[ ${glitch.name} ]`;
    alertEl.classList.remove('hidden');
    updateUI();

    // Clear specific glitch after duration
    setTimeout(() => {
        removeGlitch(glitch.id);
    }, glitch.duration);
}

function removeGlitch(id) {
    activeGlitches.delete(id);
    
    if (id === 'invert') wrapper.classList.remove('invert');
    if (id === 'shake') wrapper.classList.remove('shake');
    if (id === 'shrink') {
        player.h = player.originalH;
        ai.h = ai.originalH;
    }
    
    if (activeGlitches.size === 0) {
        document.getElementById('glitch-alert').classList.add('hidden');
    }
}

function resetGlitches() {
    activeGlitches.clear();
    wrapper.classList.remove('invert', 'shake');
    player.h = player.originalH;
    ai.h = ai.originalH;
    document.getElementById('glitch-alert').classList.add('hidden');
}

// --- Game Flow ---

function scoreGoal(winner) {
    score[winner] += (1 * multiplier);
    
    // Reset combo/multiplier on goal
    multiplier = 1;
    resetGlitches();
    updateUI();

    if (score.p1 >= WIN_SCORE || score.p2 >= WIN_SCORE) {
        isPlaying = false;
        document.getElementById('winner-text').innerText = score.p1 >= WIN_SCORE ? "USER WINS" : "SYS WINS";
        document.getElementById('game-over').classList.remove('hidden');
    } else {
        setTimeout(spawnBall, 1000); // 1 sec delay before next round
    }
}

// --- Rendering ---

function draw() {
    ctx.clearRect(0, 0, width, height);
    
    // Draw Center Line (Dashed)
    ctx.beginPath();
    ctx.setLineDash([10, 15]);
    ctx.moveTo(width/2, 0);
    ctx.lineTo(width/2, height);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Player
    ctx.fillStyle = player.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = player.color;
    ctx.fillRect(player.x, player.y, player.w, player.h);
    
    // Draw AI
    ctx.fillStyle = ai.color;
    ctx.shadowColor = ai.color;
    ctx.fillRect(ai.x, ai.y, ai.w, ai.h);

    // Draw Balls
    ctx.fillStyle = '#fff';
    ctx.shadowColor = '#fff';
    balls.forEach(b => {
        // Draw Trail
        b.trail.forEach((t, index) => {
            ctx.globalAlpha = (index / b.trail.length) * 0.5;
            ctx.fillRect(t.x, t.y, b.size, b.size);
        });
        ctx.globalAlpha = 1.0;
        
        // RGB split glitch effect if hyper is active
        if (activeGlitches.has('hyper')) {
            ctx.fillStyle = '#f00'; ctx.fillRect(b.x - 3, b.y, b.size, b.size);
            ctx.fillStyle = '#0ff'; ctx.fillRect(b.x + 3, b.y, b.size, b.size);
        }
        
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, b.y, b.size, b.size);
    });
    ctx.shadowBlur = 0;
}

function updateUI() {
    document.getElementById('p1-score').innerText = String(score.p1).padStart(2, '0');
    document.getElementById('p2-score').innerText = String(score.p2).padStart(2, '0');
    document.getElementById('mult-val').innerText = multiplier;
}

// --- Input ---

function setupInput() {
    window.addEventListener('keydown', e => {
        let key = e.key.toLowerCase();
        if (key === 'w' || key === 's') keys[key] = true;
    });
    
    window.addEventListener('keyup', e => {
        let key = e.key.toLowerCase();
        if (key === 'w' || key === 's') keys[key] = false;
    });
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Start
init();