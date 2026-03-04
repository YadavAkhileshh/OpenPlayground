const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const timerDisplay = document.getElementById('timeReadout');
const statusDisplay = document.getElementById('statusReadout');

const TILE_SIZE = 40;
const COLS = canvas.width / TILE_SIZE; // 15
const ROWS = canvas.height / TILE_SIZE; // 15

// Level Design
const startPos = { x: 1, y: 13 };
const goalPos = { x: 13, y: 1 };
const switchPos = { x: 1, y: 3 }; 
const doorPos = { x: 13, y: 3 };

// Obstacles
const walls = [
    {x: 12, y: 1}, {x: 12, y: 2}, {x: 12, y: 3}, {x: 14, y: 3}, 
    {x: 6, y: 6}, {x: 7, y: 6}, {x: 8, y: 6}, {x: 8, y: 7}, {x: 8, y: 8}
];

// Entities
let player = { x: startPos.x, y: startPos.y, color: '#89b4fa' };
let ghost = null;

// Time Loop State
let currentRun = []; // Tracks {time, x, y}
let previousRun = [];
let timeRemaining = 10.0;
let lastFrameTime = performance.now();
let hasWon = false;

// Input Handling
let keys = {};
let moveCooldown = 0;

window.addEventListener('keydown', e => {
    keys[e.key] = true;
    if (e.key === 'r' || e.key === 'R') forceRewind();
});
window.addEventListener('keyup', e => keys[e.key] = false);

function isWalkable(x, y) {
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return false;
    
    // Wall Collision
    for (let w of walls) {
        if (w.x === x && w.y === y) return false;
    }
    
    // Door Logic
    let switchPressed = (player.x === switchPos.x && player.y === switchPos.y) || 
                        (ghost && ghost.x === switchPos.x && ghost.y === switchPos.y);
    
    if (!switchPressed && x === doorPos.x && y === doorPos.y) return false;
    return true;
}

function forceRewind() {
    if (hasWon) return;
    
    previousRun = [...currentRun];
    currentRun = [];
    player.x = startPos.x;
    player.y = startPos.y;
    timeRemaining = 10.0;
    
    if (previousRun.length > 0) {
        ghost = { x: startPos.x, y: startPos.y, color: 'rgba(137, 180, 250, 0.4)' };
    }
}

function update(dt) {
    if (hasWon) return;

    timeRemaining -= dt;
    if (timeRemaining <= 0) {
        forceRewind();
        return;
    }

    if (moveCooldown > 0) moveCooldown -= dt;

    let moved = false;
    if (moveCooldown <= 0) {
        let nx = player.x;
        let ny = player.y;
        
        if (keys['ArrowUp'] || keys['w']) ny--;
        else if (keys['ArrowDown'] || keys['s']) ny++;
        else if (keys['ArrowLeft'] || keys['a']) nx--;
        else if (keys['ArrowRight'] || keys['d']) nx++;

        if (nx !== player.x || ny !== player.y) {
            if (isWalkable(nx, ny)) {
                player.x = nx;
                player.y = ny;
                moved = true;
                moveCooldown = 0.12; // Snap grid delay
            }
        }
    }

    // Record timeline state
    let elapsedTime = 10.0 - timeRemaining;
    if (moved || currentRun.length === 0) {
        currentRun.push({ time: elapsedTime, x: player.x, y: player.y });
    }

    // Playback Ghost
    if (ghost && previousRun.length > 0) {
        let state = previousRun[0];
        for (let i = previousRun.length - 1; i >= 0; i--) {
            if (previousRun[i].time <= elapsedTime) {
                state = previousRun[i];
                break;
            }
        }
        ghost.x = state.x;
        ghost.y = state.y;
    }

    // Win Condition
    if (player.x === goalPos.x && player.y === goalPos.y) {
        hasWon = true;
        statusDisplay.innerText = "SUCCESS! PARADOX RESOLVED.";
        statusDisplay.style.color = "#a6e3a1";
        timerDisplay.style.color = "#a6e3a1";
    }

    timerDisplay.innerText = timeRemaining.toFixed(2) + "s";
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Grid
    ctx.strokeStyle = '#313244';
    for (let i=0; i<=COLS; i++) {
        ctx.beginPath(); ctx.moveTo(i*TILE_SIZE, 0); ctx.lineTo(i*TILE_SIZE, canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i*TILE_SIZE); ctx.lineTo(canvas.width, i*TILE_SIZE); ctx.stroke();
    }

    // Draw Walls
    ctx.fillStyle = '#45475a';
    for (let w of walls) {
        ctx.fillRect(w.x * TILE_SIZE, w.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }

    // Draw Switch
    let switchPressed = (player.x === switchPos.x && player.y === switchPos.y) || 
                        (ghost && ghost.x === switchPos.x && ghost.y === switchPos.y);
    ctx.fillStyle = switchPressed ? '#a6e3a1' : '#f38ba8';
    ctx.fillRect(switchPos.x * TILE_SIZE + 5, switchPos.y * TILE_SIZE + 5, TILE_SIZE - 10, TILE_SIZE - 10);

    // Draw Door
    ctx.fillStyle = switchPressed ? 'rgba(249, 226, 175, 0.1)' : '#f9e2af';
    ctx.fillRect(doorPos.x * TILE_SIZE, doorPos.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

    // Draw Goal
    ctx.fillStyle = '#a6e3a1';
    ctx.beginPath();
    ctx.arc(goalPos.x * TILE_SIZE + TILE_SIZE/2, goalPos.y * TILE_SIZE + TILE_SIZE/2, TILE_SIZE/3, 0, Math.PI*2);
    ctx.fill();

    // Draw Ghost
    if (ghost) {
        ctx.fillStyle = ghost.color;
        ctx.fillRect(ghost.x * TILE_SIZE + 4, ghost.y * TILE_SIZE + 4, TILE_SIZE - 8, TILE_SIZE - 8);
    }

    // Draw Player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x * TILE_SIZE + 4, player.y * TILE_SIZE + 4, TILE_SIZE - 8, TILE_SIZE - 8);
}

function gameLoop(timestamp) {
    let dt = (timestamp - lastFrameTime) / 1000;
    lastFrameTime = timestamp;
    if (dt > 0.1) dt = 0.1; 

    update(dt);
    draw();

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);