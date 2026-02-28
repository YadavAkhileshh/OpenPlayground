const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreText = document.getElementById('scoreText');
const finalScoreText = document.getElementById('finalScoreText');
const phaseCyanUI = document.getElementById('phaseCyan');
const phaseOrangeUI = document.getElementById('phaseOrange');
const gameOverUI = document.getElementById('gameOver');
const btnRestart = document.getElementById('btnRestart');

// --- Game Constants & State ---
const TYPE_CYAN = 1;
const TYPE_ORANGE = 2;
const TYPE_NEUTRAL = 3;

let state = {
    activePhase: TYPE_CYAN,
    scrollSpeed: 6,
    distance: 0,
    isGameOver: false,
    frame: 0
};

// --- Entities ---
const player = {
    x: 150,
    y: 200,
    size: 24,
    vy: 0,
    gravity: 0.7,
    jumpForce: -13,
    isGrounded: false,
    particles: []
};

let platforms = [];

// --- Input Handling ---
const keys = {};
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && player.isGrounded && !state.isGameOver) {
        player.vy = player.jumpForce;
        player.isGrounded = false;
        createJumpParticles();
    }
    if ((e.code === 'ShiftLeft' || e.code === 'ShiftRight') && !state.isGameOver) {
        if (!keys[e.code]) togglePhase();
    }
    keys[e.code] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

btnRestart.addEventListener('click', resetGame);

// --- Core Logic ---
function togglePhase() {
    state.activePhase = state.activePhase === TYPE_CYAN ? TYPE_ORANGE : TYPE_CYAN;
    
    // Update UI Glows
    if (state.activePhase === TYPE_CYAN) {
        phaseCyanUI.classList.add('active');
        phaseOrangeUI.classList.remove('active');
        document.querySelector('.game-wrapper').style.boxShadow = '0 0 50px rgba(0, 243, 255, 0.15)';
    } else {
        phaseOrangeUI.classList.add('active');
        phaseCyanUI.classList.remove('active');
        document.querySelector('.game-wrapper').style.boxShadow = '0 0 50px rgba(255, 115, 0, 0.15)';
    }
}

function spawnPlatform(isStartingFloor = false) {
    const minW = 120, maxW = 350;
    const w = isStartingFloor ? canvas.width + 200 : Math.random() * (maxW - minW) + minW;
    
    // 40% Cyan, 40% Orange, 20% Neutral
    const r = Math.random();
    let type = TYPE_NEUTRAL;
    if (!isStartingFloor) {
        if (r < 0.4) type = TYPE_CYAN;
        else if (r < 0.8) type = TYPE_ORANGE;
    }

    const lastPlat = platforms[platforms.length - 1];
    let x = isStartingFloor ? 0 : lastPlat.x + lastPlat.w + (Math.random() * 100 + 80);
    
    // Determine Y height (keep it reachable)
    let y = 350;
    if (!isStartingFloor && lastPlat) {
        y = lastPlat.y + (Math.random() * 160 - 80);
        y = Math.max(150, Math.min(canvas.height - 40, y)); // clamp
    }

    platforms.push({ x, y, w, h: 25, type });
}

function createJumpParticles() {
    for(let i=0; i<8; i++) {
        player.particles.push({
            x: player.x + player.size/2,
            y: player.y + player.size,
            vx: (Math.random() - 0.5) * 4,
            vy: Math.random() * 2,
            life: 1.0
        });
    }
}

function checkCollision(p, rect) {
    // Only collide if phases match or platform is neutral
    if (rect.type !== TYPE_NEUTRAL && rect.type !== state.activePhase) return false;

    return (
        p.x < rect.x + rect.w &&
        p.x + p.size > rect.x &&
        p.y < rect.y + rect.h &&
        p.y + p.size > rect.y
    );
}

function update() {
    if (state.isGameOver) return;

    state.frame++;
    state.distance += state.scrollSpeed / 60;
    scoreText.innerText = Math.floor(state.distance);

    if (state.frame % 360 === 0) state.scrollSpeed += 0.3; // Speed up over time

    // Physics
    player.vy += player.gravity;
    player.y += player.vy;
    player.isGrounded = false;

    // Platform generation
    if (platforms[platforms.length - 1].x < canvas.width) {
        spawnPlatform();
    }

    // Platform movement & Collision
    for (let i = platforms.length - 1; i >= 0; i--) {
        let p = platforms[i];
        p.x -= state.scrollSpeed;

        if (player.vy >= 0 && checkCollision(player, p)) {
            // Check if falling onto the top of it
            if (player.y + player.size - player.vy <= p.y + 10) {
                player.y = p.y - player.size;
                player.vy = 0;
                player.isGrounded = true;
            }
        }

        if (p.x + p.w < -100) platforms.splice(i, 1); // cleanup
    }

    // Update particles
    player.particles.forEach(p => {
        p.x += p.vx - state.scrollSpeed;
        p.y += p.vy;
        p.life -= 0.05;
    });
    player.particles = player.particles.filter(p => p.life > 0);

    // Death
    if (player.y > canvas.height + 100) {
        state.isGameOver = true;
        finalScoreText.innerText = Math.floor(state.distance);
        gameOverUI.classList.remove('hidden');
    }
}

// --- Rendering ---
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Platforms
    platforms.forEach(p => {
        let color = '#454a59'; // Neutral
        let alpha = 1.0;
        let isSolid = true;

        if (p.type === TYPE_CYAN) {
            color = '#00f3ff';
            isSolid = state.activePhase === TYPE_CYAN;
        } else if (p.type === TYPE_ORANGE) {
            color = '#ff7300';
            isSolid = state.activePhase === TYPE_ORANGE;
        }

        alpha = isSolid ? 1.0 : 0.15;
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha;
        
        if (isSolid && p.type !== TYPE_NEUTRAL) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = color;
        } else {
            ctx.shadowBlur = 0;
        }

        ctx.fillRect(p.x, p.y, p.w, p.h);
        
        // Draw tech-pattern line on top edge
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillRect(p.x, p.y, p.w, 3);
        
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
    });

    // Draw Player
    let pColor = state.activePhase === TYPE_CYAN ? '#00f3ff' : '#ff7300';
    ctx.fillStyle = '#fff';
    ctx.shadowBlur = 25;
    ctx.shadowColor = pColor;
    ctx.fillRect(player.x, player.y, player.size, player.size);
    
    // Player inner core
    ctx.fillStyle = pColor;
    ctx.shadowBlur = 0;
    ctx.fillRect(player.x + 4, player.y + 4, player.size - 8, player.size - 8);

    // Draw Particles
    ctx.fillStyle = pColor;
    player.particles.forEach(p => {
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillRect(p.x, p.y, 4, 4);
    });
    ctx.globalAlpha = 1.0;
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function resetGame() {
    player.y = 100;
    player.vy = 0;
    player.particles = [];
    platforms = [];
    state.distance = 0;
    state.scrollSpeed = 6;
    state.isGameOver = false;
    gameOverUI.classList.add('hidden');
    
    spawnPlatform(true); // Spawn initial long floor
}

resetGame();
requestAnimationFrame(gameLoop);