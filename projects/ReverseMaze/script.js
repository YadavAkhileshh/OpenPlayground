const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');
const menuScreen = document.getElementById('menu-screen');
const gameScreen = document.getElementById('game-screen');
const instructionsEl = document.getElementById('instructions');
const pulseBtn = document.getElementById('pulseBtn');
const overlay = document.getElementById('overlay');
const messageEl = document.getElementById('message');
const restartBtn = document.getElementById('restartBtn');

// Game State
let config = { cols: 20, rows: 20, cellSize: 30, peekTime: 5, lightRadius: 3 };
let grid = [], stack = [], player = { x: 0, y: 0 }, goal = { x: 0, y: 0 };
let gameActive = false, isDark = false, canPulse = true;
let explored = new Set();
let audioCtx = new (window.AudioContext || window.webkitAudioContext)(); // For Sound

// Difficulty Presets
const levels = {
    easy:   { cols: 10, rows: 10, peekTime: 5, lightRadius: 120 }, 
    medium: { cols: 20, rows: 20, peekTime: 5, lightRadius: 80  }, 
    hard:   { cols: 30, rows: 30, peekTime: 3, lightRadius: 50  } 
};

// --- SOUND SYSTEM (Synthesized Retro Sounds) ---
function playSound(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    if (type === 'step') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    } else if (type === 'bump') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.linearRampToValueAtTime(50, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    } else if (type === 'win') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.setValueAtTime(600, now + 0.1);
        osc.frequency.setValueAtTime(1000, now + 0.2);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
    } else if (type === 'pulse') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(800, now + 0.5);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
    }
}

// --- INITIALIZATION ---
function selectDifficulty(level) {
    const selected = levels[level];
    const size = 600 / selected.cols;
    config = { ...selected, cellSize: size };

    menuScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    
    setup();
    startCountdown();
}

class Cell {
    constructor(c, r) {
        this.c = c; this.r = r;
        this.walls = [true, true, true, true];
        this.visited = false;
    }
    show(color = '#1e293b') {
        let x = this.c * config.cellSize;
        let y = this.r * config.cellSize;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (this.walls[0]) { ctx.moveTo(x, y); ctx.lineTo(x + config.cellSize, y); }
        if (this.walls[1]) { ctx.moveTo(x + config.cellSize, y); ctx.lineTo(x + config.cellSize, y + config.cellSize); }
        if (this.walls[2]) { ctx.moveTo(x + config.cellSize, y + config.cellSize); ctx.lineTo(x, y + config.cellSize); }
        if (this.walls[3]) { ctx.moveTo(x, y + config.cellSize); ctx.lineTo(x, y); }
        ctx.stroke();
    }
    checkNeighbors() {
        let neighbors = [];
        let top = grid[index(this.c, this.r - 1)];
        let right = grid[index(this.c + 1, this.r)];
        let bottom = grid[index(this.c, this.r + 1)];
        let left = grid[index(this.c - 1, this.r)];
        if (top && !top.visited) neighbors.push(top);
        if (right && !right.visited) neighbors.push(right);
        if (bottom && !bottom.visited) neighbors.push(bottom);
        if (left && !left.visited) neighbors.push(left);
        return neighbors.length > 0 ? neighbors[Math.floor(Math.random() * neighbors.length)] : undefined;
    }
}

function index(c, r) {
    if (c < 0 || r < 0 || c > config.cols - 1 || r > config.rows - 1) return -1;
    return c + r * config.cols;
}

function setup() {
    grid = []; stack = []; explored = new Set();
    player = { x: 0, y: 0 };
    goal = { x: config.cols - 1, y: config.rows - 1 };
    
    canvas.width = 600;
    canvas.height = 600;

    for (let r = 0; r < config.rows; r++) {
        for (let c = 0; c < config.cols; c++) grid.push(new Cell(c, r));
    }
    
    let current = grid[0];
    current.visited = true;
    while (true) {
        let next = current.checkNeighbors();
        if (next) {
            next.visited = true;
            stack.push(current);
            removeWalls(current, next);
            current = next;
        } else if (stack.length > 0) {
            current = stack.pop();
        } else break;
    }
    explored.add(index(0,0));
    draw();
}

function removeWalls(a, b) {
    let x = a.c - b.c;
    if (x === 1) { a.walls[3] = false; b.walls[1] = false; }
    if (x === -1) { a.walls[1] = false; b.walls[3] = false; }
    let y = a.r - b.r;
    if (y === 1) { a.walls[0] = false; b.walls[2] = false; }
    if (y === -1) { a.walls[2] = false; b.walls[0] = false; }
}

function startCountdown() {
    let t = config.peekTime;
    isDark = false; canPulse = true; gameActive = false; pulseBtn.disabled = true;
    draw();
    
    let timer = setInterval(() => {
        instructionsEl.innerHTML = `Memorize path! Darkness in <strong>${t}s</strong>`;
        t--;
        if (t < 0) {
            clearInterval(timer);
            isDark = true; gameActive = true; pulseBtn.disabled = false;
            instructionsEl.innerHTML = `<strong>Go!</strong> Find the Green Zone.`;
            draw();
        }
    }, 1000);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw Maze
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < grid.length; i++) grid[i].show();

    // 2. Draw Player & Goal
    let cs = config.cellSize;
    ctx.fillStyle = '#ef4444'; 
    ctx.fillRect(player.x * cs + 4, player.y * cs + 4, cs - 8, cs - 8);

    ctx.fillStyle = '#10b981'; 
    ctx.fillRect(goal.x * cs + 4, goal.y * cs + 4, cs - 8, cs - 8);

    // 3. FLASHLIGHT EFFECT & BREADCRUMBS
    if (isDark) {
        // Draw Breadcrumbs (Explored Tiles) ON TOP of the white maze, but UNDER the darkness
        // Actually, we will draw them ON TOP of the darkness to make them visible "HUD" style
        // Create Darkness Layer
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.rect(0, 0, canvas.width, canvas.height);
        
        // Cut out Flashlight hole
        let px = (player.x * cs) + (cs / 2);
        let py = (player.y * cs) + (cs / 2);
        ctx.arc(px, py, config.lightRadius, 0, Math.PI * 2, true);
        ctx.fill();

        // Draw Breadcrumbs (Faint grey dots on visited tiles)
        ctx.fillStyle = "rgba(100, 116, 139, 0.4)"; // Faint grey
        explored.forEach(idx => {
            let c = idx % config.cols;
            let r = Math.floor(idx / config.cols);
            // Don't draw on player or inside flashlight radius (optional, but looks cleaner)
            let dist = Math.hypot(c - player.x, r - player.y);
            if (dist > (config.lightRadius / config.cellSize)/1.5) { 
                ctx.beginPath();
                ctx.arc((c * cs) + (cs/2), (r * cs) + (cs/2), cs/5, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }
}

// --- MOVEMENT ---
function movePlayer(dx, dy) {
    if (!gameActive) return;
    let curr = grid[index(player.x, player.y)];
    let nextX = player.x + dx;
    let nextY = player.y + dy;
    
    // Check Walls/Bounds
    let hitWall = false;
    if (nextX < 0 || nextY < 0 || nextX >= config.cols || nextY >= config.rows) hitWall = true;
    else if (dx === 1 && curr.walls[1]) hitWall = true;
    else if (dx === -1 && curr.walls[3]) hitWall = true;
    else if (dy === 1 && curr.walls[2]) hitWall = true;
    else if (dy === -1 && curr.walls[0]) hitWall = true;

    if (hitWall) {
        playSound('bump');
        shakeScreen(); // Visual feedback
        return;
    }

    // Move
    player.x = nextX;
    player.y = nextY;
    explored.add(index(player.x, player.y)); // Add to breadcrumbs
    playSound('step');
    draw();

    // Win Check
    if (player.x === goal.x && player.y === goal.y) {
        playSound('win');
        gameActive = false;
        isDark = false;
        draw();
        overlay.classList.remove('hidden');
        messageEl.innerText = "You Escaped! 🏆";
        restartBtn.innerText = "Menu";
    }
}

function shakeScreen() {
    canvas.style.transform = "translate(4px, 0)";
    setTimeout(() => { canvas.style.transform = "translate(-4px, 0)"; }, 50);
    setTimeout(() => { canvas.style.transform = "translate(0, 0)"; }, 100);
}

// --- CONTROLS ---
window.addEventListener('keydown', (e) => {
    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key)) e.preventDefault();
    if(e.key === 'ArrowUp' || e.key === 'w') movePlayer(0, -1);
    if(e.key === 'ArrowRight' || e.key === 'd') movePlayer(1, 0);
    if(e.key === 'ArrowDown' || e.key === 's') movePlayer(0, 1);
    if(e.key === 'ArrowLeft' || e.key === 'a') movePlayer(-1, 0);
    if(e.key === ' ' && gameActive && canPulse) triggerPulse();
});

function triggerPulse() {
    canPulse = false;
    pulseBtn.disabled = true;
    isDark = false; 
    playSound('pulse');
    draw();
    pulseBtn.innerText = "Recharging...";
    
    setTimeout(() => {
        if (gameActive) {
            isDark = true;
            draw();
            setTimeout(() => {
                canPulse = true;
                pulseBtn.disabled = false;
                pulseBtn.innerText = "💡 Pulse (Space)";
            }, 3000); 
        }
    }, 500); 
}

pulseBtn.addEventListener('click', () => { if (gameActive && canPulse) triggerPulse(); });
restartBtn.addEventListener('click', () => { location.reload(); });