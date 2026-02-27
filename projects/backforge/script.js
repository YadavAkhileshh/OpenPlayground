const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const hotbarUI = document.getElementById('hotbar');

// Game Constants
const TILE_SIZE = 40;
const COLS = canvas.width / TILE_SIZE; // 20
const ROWS = canvas.height / TILE_SIZE; // 15

// Block Definitions
const BLOCKS = {
    0: { name: 'Erase', color: '#87CEEB' }, // Sky
    1: { name: 'Grass', color: '#556B2F', accent: '#8B4513' },
    2: { name: 'Dirt', color: '#8B4513' },
    3: { name: 'Stone', color: '#808080' },
    4: { name: 'Wood', color: '#5C4033' },
    5: { name: 'Leaves', color: '#228B22' }
};

let world = [];
let activeBlock = 1; // Default to Grass
let isDragging = false;

// --- Initialization ---

function generateWorld() {
    world = new Array(COLS).fill(0).map(() => new Array(ROWS).fill(0));
    
    // Simple 1D Noise algorithm for hills
    let heightMap = [];
    let currentHeight = Math.floor(ROWS / 2);
    
    for (let x = 0; x < COLS; x++) {
        // Randomly change elevation
        let change = Math.random();
        if (change < 0.3 && currentHeight > 4) currentHeight--;
        else if (change > 0.7 && currentHeight < ROWS - 4) currentHeight++;
        
        heightMap.push(currentHeight);
    }

    // Populate matrix based on heightmap
    for (let x = 0; x < COLS; x++) {
        let h = heightMap[x];
        for (let y = 0; y < ROWS; y++) {
            if (y < h) {
                world[x][y] = 0; // Air
            } else if (y === h) {
                world[x][y] = 1; // Grass Surface
            } else if (y < h + 3) {
                world[x][y] = 2; // Dirt Sublayer
            } else {
                world[x][y] = 3; // Stone Foundation
            }
        }
    }
    drawWorld();
}

function buildUI() {
    hotbarUI.innerHTML = '';
    Object.keys(BLOCKS).forEach((id, index) => {
        const slot = document.createElement('div');
        slot.className = `slot ${parseInt(id) === activeBlock ? 'active' : ''}`;
        slot.onclick = () => selectBlock(parseInt(id));
        
        let previewClass = `block-preview bg-${id}`;
        let innerHTML = `<div class="slot-num">${index + 1}</div>`;
        
        if (id == 0) innerHTML += `<div class="${previewClass}">⛏️</div>`;
        else innerHTML += `<div class="${previewClass}"></div>`;
        
        slot.innerHTML = innerHTML;
        hotbarUI.appendChild(slot);
    });
}

// --- Interaction Logic ---

function selectBlock(id) {
    activeBlock = id;
    buildUI(); // Re-render to update active class
}

function interact(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const gridX = Math.floor(mouseX / TILE_SIZE);
    const gridY = Math.floor(mouseY / TILE_SIZE);

    // Bounds check
    if (gridX >= 0 && gridX < COLS && gridY >= 0 && gridY < ROWS) {
        if (world[gridX][gridY] !== activeBlock) {
            world[gridX][gridY] = activeBlock;
            drawWorld();
        }
    }
}

// Mouse Events for drag-to-build
canvas.addEventListener('mousedown', (e) => { isDragging = true; interact(e); });
canvas.addEventListener('mousemove', (e) => { if (isDragging) interact(e); });
canvas.addEventListener('mouseup', () => { isDragging = false; });
canvas.addEventListener('mouseleave', () => { isDragging = false; });

// Keyboard Hotkeys (1-6)
window.addEventListener('keydown', (e) => {
    const keyNum = parseInt(e.key);
    if (keyNum >= 1 && keyNum <= 6) {
        selectBlock(keyNum - 1);
    }
    if (e.key.toLowerCase() === 'r') {
        generateWorld();
    }
});

// --- Rendering ---

function drawWorld() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let x = 0; x < COLS; x++) {
        for (let y = 0; y < ROWS; y++) {
            let blockID = world[x][y];
            
            if (blockID !== 0) {
                let pX = x * TILE_SIZE;
                let pY = y * TILE_SIZE;
                
                // Draw Base Block
                ctx.fillStyle = BLOCKS[blockID].color;
                ctx.fillRect(pX, pY, TILE_SIZE, TILE_SIZE);

                // Special Grass Texture (Accent on top)
                if (blockID === 1) {
                    ctx.fillStyle = BLOCKS[1].color;
                    ctx.fillRect(pX, pY, TILE_SIZE, TILE_SIZE * 0.3);
                    ctx.fillStyle = BLOCKS[1].accent;
                    ctx.fillRect(pX, pY + (TILE_SIZE * 0.3), TILE_SIZE, TILE_SIZE * 0.7);
                }

                // Inner Shadow / Border for 3D grid effect
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.lineWidth = 2;
                ctx.strokeRect(pX, pY, TILE_SIZE, TILE_SIZE);
                
                // Light highlight on top edge
                ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.fillRect(pX, pY, TILE_SIZE, 4);
            }
        }
    }
}

// Boot up
generateWorld();
buildUI();