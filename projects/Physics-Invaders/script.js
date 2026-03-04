/**
 * Physics Invaders Engine
 * Implements structural integrity checks (BFS) and falling debris physics.
 */

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// --- Config ---
const BLOCK_SIZE = 15;
const SWARM_COLS = 30;
const SWARM_ROWS = 12;
const GRAVITY = 0.3;

// --- State ---
let width, height;
let player = { x: 0, y: 0, w: 40, h: 20, speed: 6, color: '#00ffff' };
let bullets = [];
let debris = [];
let swarmGrid = []; // 2D Array
let swarmX = 0;
let swarmY = 50;
let swarmDir = 1;
let swarmSpeed = 1;

let score = 0;
let lives = 3;
let isPlaying = false;
let keys = {};

// Colors for different alien rows
const ROW_COLORS = ['#ff00ff', '#ff00ff', '#ff00ff', '#39ff14', '#39ff14', '#39ff14', '#ffff00', '#ffff00', '#ffff00', '#ff2a2a', '#ff2a2a', '#ff2a2a'];

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
    
    player.x = width / 2 - player.w / 2;
    player.y = height - 50;
}

function startGame() {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-over').classList.add('hidden');
    
    score = 0;
    lives = 3;
    bullets = [];
    debris = [];
    swarmX = 50;
    swarmY = 50;
    swarmDir = 1;
    swarmSpeed = 1;
    isPlaying = true;
    
    updateUI();
    generateSwarm();
    
    loop();
}

function generateSwarm() {
    swarmGrid = [];
    // Generate a blocky formation
    for (let r = 0; r < SWARM_ROWS; r++) {
        swarmGrid[r] = [];
        for (let c = 0; c < SWARM_COLS; c++) {
            // Cut out some blocks to make "alien" shapes
            // Simple pattern: vertical columns with gaps
            if (c % 4 !== 3) {
                swarmGrid[r][c] = { color: ROW_COLORS[r] };
            } else {
                swarmGrid[r][c] = null;
            }
        }
    }
}

// --- Logic ---

function update() {
    if (!isPlaying) return;

    updatePlayer();
    updateBullets();
    updateSwarm();
    updateDebris();
}

function updatePlayer() {
    if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
    if (keys['ArrowRight'] && player.x + player.w < width) player.x += player.speed;
}

function fireBullet() {
    if (!isPlaying) return;
    bullets.push({
        x: player.x + player.w / 2 - 2,
        y: player.y,
        w: 4, h: 15,
        vy: -10
    });
}

function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        let b = bullets[i];
        b.y += b.vy;

        // Off screen
        if (b.y < 0) {
            bullets.splice(i, 1);
            continue;
        }

        // Swarm Collision
        if (checkGridCollision(b)) {
            bullets.splice(i, 1);
            checkStructuralIntegrity(); // Run the physics check!
        }
    }
}

function checkGridCollision(b) {
    // Map bullet pos to grid coordinates
    const localX = b.x - swarmX;
    const localY = b.y - swarmY;
    
    const c = Math.floor(localX / BLOCK_SIZE);
    const r = Math.floor(localY / BLOCK_SIZE);

    if (r >= 0 && r < SWARM_ROWS && c >= 0 && c < SWARM_COLS) {
        if (swarmGrid[r][c]) {
            // HIT!
            swarmGrid[r][c] = null;
            score += 10;
            updateUI();
            
            // Add tiny particle explosion
            createExplosion(b.x, b.y, '#fff');
            return true;
        }
    }
    return false;
}

// THE CORE MECHANIC: Breadth-First Search to find unsupported blocks
function checkStructuralIntegrity() {
    const visited = Array.from({ length: SWARM_ROWS }, () => Array(SWARM_COLS).fill(false));
    const queue = [];

    // Step 1: Add all blocks in the TOP row to the queue (they are the "anchors")
    for (let c = 0; c < SWARM_COLS; c++) {
        if (swarmGrid[0][c]) {
            queue.push({ r: 0, c: c });
            visited[0][c] = true;
        }
    }

    // Directions: Up, Down, Left, Right
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    // Step 2: Flood fill to find all connected blocks
    while (queue.length > 0) {
        const { r, c } = queue.shift();

        for (let d of dirs) {
            const nr = r + d[0];
            const nc = c + d[1];

            if (nr >= 0 && nr < SWARM_ROWS && nc >= 0 && nc < SWARM_COLS) {
                if (swarmGrid[nr][nc] && !visited[nr][nc]) {
                    visited[nr][nc] = true;
                    queue.push({ r: nr, c: nc });
                }
            }
        }
    }

    // Step 3: Any block not visited is disconnected. It falls! 
    for (let r = 0; r < SWARM_ROWS; r++) {
        for (let c = 0; c < SWARM_COLS; c++) {
            if (swarmGrid[r][c] && !visited[r][c]) {
                // Detach block
                const block = swarmGrid[r][c];
                swarmGrid[r][c] = null;
                
                // Add to physical debris
                debris.push({
                    x: swarmX + c * BLOCK_SIZE,
                    y: swarmY + r * BLOCK_SIZE,
                    vx: (Math.random() - 0.5) * 2, // Slight horizontal scatter
                    vy: 0,
                    w: BLOCK_SIZE,
                    h: BLOCK_SIZE,
                    color: block.color,
                    rot: 0,
                    vrot: (Math.random() - 0.5) * 0.2
                });
                
                score += 5; // Bonus for structural kills
            }
        }
    }
    updateUI();
}

function updateSwarm() {
    // Find grid bounds to bounce off walls
    let minC = SWARM_COLS, maxC = 0, blockCount = 0;
    
    for (let r = 0; r < SWARM_ROWS; r++) {
        for (let c = 0; c < SWARM_COLS; c++) {
            if (swarmGrid[r][c]) {
                minC = Math.min(minC, c);
                maxC = Math.max(maxC, c);
                blockCount++;
            }
        }
    }

    if (blockCount === 0) {
        // Level clear!
        swarmSpeed += 0.5;
        swarmY = 50;
        generateSwarm();
        return;
    }

    const leftEdge = swarmX + minC * BLOCK_SIZE;
    const rightEdge = swarmX + maxC * BLOCK_SIZE + BLOCK_SIZE;

    if (rightEdge > width - 10 || leftEdge < 10) {
        swarmDir *= -1;
        swarmY += 20; // Move down
    }

    swarmX += swarmSpeed * swarmDir;
    
    // Game over if swarm reaches player
    if (swarmY + SWARM_ROWS * BLOCK_SIZE > player.y) {
        takeDamage(true);
    }
}

function updateDebris() {
    for (let i = debris.length - 1; i >= 0; i--) {
        let d = debris[i];
        
        // Physics
        d.vy += GRAVITY;
        d.x += d.vx;
        d.y += d.vy;
        d.rot += d.vrot;

        // Player Collision (AABB)
        if (d.x < player.x + player.w &&
            d.x + d.w > player.x &&
            d.y < player.y + player.h &&
            d.y + d.h > player.y) {
            
            createExplosion(d.x, d.y, d.color);
            debris.splice(i, 1);
            takeDamage(false);
            continue;
        }

        // Floor Collision
        if (d.y > height) {
            debris.splice(i, 1);
        }
    }
}

function createExplosion(x, y, color) {
    // Just a visual flash for MVP
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI*2);
    ctx.fill();
}

function takeDamage(instantDeath) {
    if (instantDeath) lives = 0;
    else lives--;
    
    updateUI();
    
    // Screen shake
    canvas.style.transform = `translate(${Math.random()*10 - 5}px, ${Math.random()*10 - 5}px)`;
    setTimeout(() => canvas.style.transform = 'none', 50);

    if (lives <= 0) {
        isPlaying = false;
        document.getElementById('final-score').innerText = score;
        document.getElementById('game-over').classList.remove('hidden');
    }
}

function updateUI() {
    document.getElementById('score-val').innerText = String(score).padStart(4, '0');
    let hearts = '';
    for(let i=0; i<lives; i++) hearts += '❤️';
    document.getElementById('lives-val').innerText = hearts;
}

// --- Render ---

function draw() {
    ctx.clearRect(0, 0, width, height);
    
    // Draw Player
    ctx.fillStyle = player.color;
    ctx.shadowColor = player.color;
    ctx.shadowBlur = 10;
    ctx.fillRect(player.x, player.y, player.w, player.h);
    // Ship gun barrel
    ctx.fillRect(player.x + player.w/2 - 4, player.y - 10, 8, 10);
    ctx.shadowBlur = 0;

    // Draw Bullets
    ctx.fillStyle = '#fff';
    bullets.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));

    // Draw Swarm Grid
    for (let r = 0; r < SWARM_ROWS; r++) {
        for (let c = 0; c < SWARM_COLS; c++) {
            if (swarmGrid[r][c]) {
                ctx.fillStyle = swarmGrid[r][c].color;
                ctx.fillRect(
                    swarmX + c * BLOCK_SIZE, 
                    swarmY + r * BLOCK_SIZE, 
                    BLOCK_SIZE - 1, 
                    BLOCK_SIZE - 1
                );
            }
        }
    }

    // Draw Debris
    debris.forEach(d => {
        ctx.save();
        ctx.translate(d.x + d.w/2, d.y + d.h/2);
        ctx.rotate(d.rot);
        ctx.fillStyle = d.color;
        ctx.fillRect(-d.w/2, -d.h/2, d.w, d.h);
        ctx.restore();
    });
}

// --- Input ---

function setupInput() {
    window.addEventListener('keydown', e => {
        keys[e.key] = true;
        if (e.key === ' ' && !e.repeat) fireBullet();
    });
    
    window.addEventListener('keyup', e => {
        keys[e.key] = false;
    });
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Start
init();