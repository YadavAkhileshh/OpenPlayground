const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreText = document.getElementById('scoreText');
const finalScoreText = document.getElementById('finalScoreText');
const uiPos = document.getElementById('uiPositive');
const uiNeg = document.getElementById('uiNegative');
const gameOverUI = document.getElementById('gameOver');
const btnRestart = document.getElementById('btnRestart');

// Disable context menu for right click
canvas.addEventListener('contextmenu', e => e.preventDefault());

const POL_NONE = 0;
const POL_POS = 1;  // Red
const POL_NEG = -1; // Blue

let state = {
    scrollSpeed: 4.5,
    distance: 0,
    isGameOver: false,
    frame: 0
};

const player = {
    x: 150,
    y: 250,
    size: 24,
    vy: 0,
    gravity: 0.4,
    polarity: POL_NONE,
    maxFallSpeed: 8
};

let magneticBlocks = [];

// Input Handling
window.addEventListener('mousedown', (e) => {
    if (e.button === 0) player.polarity = POL_POS; // Left click
    if (e.button === 2) player.polarity = POL_NEG; // Right click
    updateUI();
});

window.addEventListener('mouseup', (e) => {
    if (e.button === 0 && player.polarity === POL_POS) player.polarity = POL_NONE;
    if (e.button === 2 && player.polarity === POL_NEG) player.polarity = POL_NONE;
    updateUI();
});

btnRestart.addEventListener('click', resetGame);

function updateUI() {
    uiPos.classList.remove('active');
    uiNeg.classList.remove('active');
    if (player.polarity === POL_POS) uiPos.classList.add('active');
    if (player.polarity === POL_NEG) uiNeg.classList.add('active');
}

function spawnBlock(isStarting = false) {
    const width = Math.random() * 200 + 150;
    const x = isStarting ? 0 : canvas.width + Math.random() * 100;
    
    // Bottom or Top block
    const isTop = Math.random() > 0.5;
    const y = isTop ? Math.random() * 50 : canvas.height - 30 - Math.random() * 50;
    
    // Assign polarity
    const rand = Math.random();
    let pol = POL_NONE;
    if (rand < 0.33) pol = POL_POS;
    else if (rand < 0.66) pol = POL_NEG;

    magneticBlocks.push({
        x: isStarting ? 0 : x,
        y: isStarting ? canvas.height - 40 : y,
        w: isStarting ? canvas.width + 200 : width,
        h: 40,
        polarity: isStarting ? POL_NONE : pol
    });
}

function checkCollision(p, b) {
    return (
        p.x < b.x + b.w &&
        p.x + p.size > b.x &&
        p.y < b.y + b.h &&
        p.y + p.size > b.y
    );
}

function calculateMagneticForce() {
    if (player.polarity === POL_NONE) return 0;
    
    let totalForce = 0;
    const magneticRange = 150; // How far the magnet reaches

    magneticBlocks.forEach(b => {
        if (b.polarity === POL_NONE) return;

        // Check horizontal alignment
        if (player.x + player.size > b.x && player.x < b.x + b.w) {
            let distY;
            let direction; // 1 for below block, -1 for above block

            if (player.y > b.y) {
                distY = player.y - (b.y + b.h);
                direction = 1;
            } else {
                distY = b.y - (player.y + player.size);
                direction = -1;
            }

            if (distY > 0 && distY < magneticRange) {
                const strength = 1 - (distY / magneticRange); // 0 to 1
                const baseForce = 1.2 * strength;
                
                // Likes repel, Opposites attract
                if (player.polarity === b.polarity) {
                    totalForce += baseForce * direction; // Repel away
                } else {
                    totalForce += baseForce * -direction; // Attract towards
                }
            }
        }
    });

    return totalForce;
}

function update() {
    if (state.isGameOver) return;

    state.frame++;
    state.distance += state.scrollSpeed / 60;
    scoreText.innerText = Math.floor(state.distance);

    if (state.frame % 400 === 0) state.scrollSpeed += 0.2;

    // Physics
    let magForce = calculateMagneticForce();
    player.vy += player.gravity + magForce;
    
    // Terminal velocity
    if (player.vy > player.maxFallSpeed) player.vy = player.maxFallSpeed;
    if (player.vy < -player.maxFallSpeed) player.vy = -player.maxFallSpeed;

    player.y += player.vy;

    // Block logic
    if (magneticBlocks[magneticBlocks.length - 1].x < canvas.width - 150) {
        spawnBlock();
    }

    for (let i = magneticBlocks.length - 1; i >= 0; i--) {
        let b = magneticBlocks[i];
        b.x -= state.scrollSpeed;

        if (checkCollision(player, b)) {
            // Simple resolve (snap to top or bottom depending on velocity)
            if (player.vy > 0 && player.y + player.size - player.vy <= b.y + 10) {
                player.y = b.y - player.size; // Land on top
                player.vy = 0;
            } else if (player.vy < 0 && player.y - player.vy >= b.y + b.h - 10) {
                player.y = b.y + b.h; // Hit head
                player.vy = 0;
            } else {
                state.isGameOver = true; // Hit the side wall
            }
        }

        if (b.x + b.w < -50) magneticBlocks.splice(i, 1);
    }

    // Death bounds
    if (player.y > canvas.height + 50 || player.y < -50) {
        state.isGameOver = true;
    }

    if (state.isGameOver) {
        finalScoreText.innerText = Math.floor(state.distance);
        gameOverUI.classList.remove('hidden');
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Blocks
    magneticBlocks.forEach(b => {
        let color = '#444c56';
        if (b.polarity === POL_POS) color = '#ff3366';
        if (b.polarity === POL_NEG) color = '#00ccff';

        ctx.fillStyle = color;
        ctx.fillRect(b.x, b.y, b.w, b.h);
        
        if (b.polarity !== POL_NONE) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = color;
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.strokeRect(b.x + 2, b.y + 2, b.w - 4, b.h - 4);
            ctx.shadowBlur = 0;
        }
    });

    // Draw Player
    let pColor = '#c9d1d9';
    if (player.polarity === POL_POS) pColor = '#ff3366';
    if (player.polarity === POL_NEG) pColor = '#00ccff';

    // Player Aura
    if (player.polarity !== POL_NONE) {
        ctx.beginPath();
        ctx.arc(player.x + player.size/2, player.y + player.size/2, player.size * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = player.polarity === POL_POS ? 'rgba(255, 51, 102, 0.2)' : 'rgba(0, 204, 255, 0.2)';
        ctx.fill();
    }

    ctx.fillStyle = pColor;
    ctx.shadowBlur = player.polarity !== POL_NONE ? 20 : 0;
    ctx.shadowColor = pColor;
    ctx.fillRect(player.x, player.y, player.size, player.size);
    ctx.shadowBlur = 0;
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function resetGame() {
    player.y = 250;
    player.vy = 0;
    player.polarity = POL_NONE;
    magneticBlocks = [];
    state.distance = 0;
    state.scrollSpeed = 4.5;
    state.frame = 0;
    state.isGameOver = false;
    gameOverUI.classList.add('hidden');
    updateUI();
    
    spawnBlock(true);
}

resetGame();
requestAnimationFrame(gameLoop);