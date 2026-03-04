const canvas = document.getElementById('factoryCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');

const TILE_SIZE = 40;
const COLS = canvas.width / TILE_SIZE;
const ROWS = canvas.height / TILE_SIZE;

// Grid to store belt directions ('R', 'L', 'U', 'D', 'E' for empty)
let grid = Array(ROWS).fill().map(() => Array(COLS).fill('E'));

// Game state
let currentTool = 'R';
let score = 0;
let items = [];
let frameCount = 0;

// Hardcoded structures
const spawner = { c: 1, r: 1, type: 'S' }; // Blue Spawner
const bin = { c: 13, r: 13, type: 'B' };   // Green Bin

// UI Listeners
const tools = {
    'btnRight': 'R',
    'btnDown': 'D',
    'btnLeft': 'L',
    'btnUp': 'U',
    'btnErase': 'E'
};

for (const [id, tool] of Object.entries(tools)) {
    document.getElementById(id).onclick = (e) => {
        currentTool = tool;
        document.querySelectorAll('.toolbar button').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
    };
}

// Mouse interaction for placing belts
canvas.addEventListener('mousedown', placeBelt);
canvas.addEventListener('mousemove', (e) => {
    if (e.buttons === 1) placeBelt(e);
});

function placeBelt(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const c = Math.floor(x / TILE_SIZE);
    const r = Math.floor(y / TILE_SIZE);

    // Prevent overwriting spawner and bin
    if ((c === spawner.c && r === spawner.r) || (c === bin.c && r === bin.r)) return;

    if (c >= 0 && c < COLS && r >= 0 && r < ROWS) {
        grid[r][c] = currentTool;
    }
}

class Item {
    constructor(c, r) {
        this.x = c * TILE_SIZE + TILE_SIZE / 2;
        this.y = r * TILE_SIZE + TILE_SIZE / 2;
        this.speed = 2;
        this.active = true;
    }

    update() {
        const c = Math.floor(this.x / TILE_SIZE);
        const r = Math.floor(this.y / TILE_SIZE);

        // Check if in bin
        if (c === bin.c && r === bin.r) {
            this.active = false;
            score++;
            scoreEl.innerText = score;
            return;
        }

        // Move based on belt direction
        const currentTile = grid[r] ? grid[r][c] : 'E';
        
        if (currentTile === 'R') this.x += this.speed;
        else if (currentTile === 'L') this.x -= this.speed;
        else if (currentTile === 'U') this.y -= this.speed;
        else if (currentTile === 'D') this.y += this.speed;
        
        // Destroy if out of bounds (falling off edge)
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
            this.active = false;
        }
    }

    draw() {
        ctx.fillStyle = '#ff5555'; // Red raw material
        ctx.beginPath();
        ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#222';
        ctx.stroke();
    }
}

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Belts
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const tile = grid[r][c];
            const x = c * TILE_SIZE;
            const y = r * TILE_SIZE;

            ctx.strokeStyle = '#444';
            ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);

            if (tile !== 'E') {
                ctx.fillStyle = '#44475a';
                ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
                ctx.fillStyle = '#f8f8f2';
                ctx.font = '20px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                let arrow = '';
                if (tile === 'R') arrow = '➡️';
                if (tile === 'L') arrow = '⬅️';
                if (tile === 'U') arrow = '⬆️';
                if (tile === 'D') arrow = '⬇️';
                
                ctx.fillText(arrow, x + TILE_SIZE / 2, y + TILE_SIZE / 2);
            }
        }
    }

    // Draw Spawner
    ctx.fillStyle = '#8be9fd'; // Cyan spawner
    ctx.fillRect(spawner.c * TILE_SIZE, spawner.r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    
    // Draw Bin
    ctx.fillStyle = '#50fa7b'; // Green bin
    ctx.fillRect(bin.c * TILE_SIZE, bin.r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
}

function gameLoop() {
    frameCount++;

    // Spawn new item every 60 frames
    if (frameCount % 60 === 0) {
        items.push(new Item(spawner.c, spawner.r));
    }

    drawGrid();

    // Update and draw items
    items = items.filter(item => item.active);
    items.forEach(item => {
        item.update();
        item.draw();
    });

    requestAnimationFrame(gameLoop);
}

// Start game
gameLoop();