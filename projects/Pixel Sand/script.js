/**
 * Pixel-Sand Physics Engine
 * Implements cellular automata rules for falling sand, fluids, and reactions.
 */

// --- Configuration ---
const COLS = 150; // Grid Resolution Width
const ROWS = 100; // Grid Resolution Height
const SCALE = 6;  // Pixel visual size (zoom)

// Element Types (IDs)
const TYPES = {
    EMPTY: 0,
    SAND: 1,
    WATER: 2,
    STONE: 3,
    WOOD: 4,
    FIRE: 5,
    SMOKE: 6
};

// Colors (R, G, B) for rendering
const COLORS = {
    [TYPES.EMPTY]: [0, 0, 0],
    [TYPES.SAND]: [246, 215, 80],
    [TYPES.WATER]: [79, 172, 254],
    [TYPES.STONE]: [128, 128, 128],
    [TYPES.WOOD]: [139, 69, 19],
    [TYPES.FIRE]: [255, 69, 0],
    [TYPES.SMOKE]: [105, 105, 105]
};

// --- State ---
let grid = new Array(COLS * ROWS).fill(TYPES.EMPTY); // 1D Array for performance
let nextGrid = new Array(COLS * ROWS).fill(TYPES.EMPTY); // Buffer
let currentTool = TYPES.SAND;
let brushSize = 2;
let isMouseDown = false;
let mouseX = 0;
let mouseY = 0;
let simSpeed = 1;
let particleCount = 0;

// --- DOM Elements ---
const canvas = document.getElementById('sim-canvas');
const ctx = canvas.getContext('2d');
const fpsEl = document.getElementById('fps-counter');
const countEl = document.getElementById('particle-counter');

// Setup Canvas Resolution
canvas.width = COLS * SCALE;
canvas.height = ROWS * SCALE;

// Image Data Buffer for fast rendering
const imgData = ctx.createImageData(COLS, ROWS);

// --- Initialization ---
function init() {
    setupControls();
    requestAnimationFrame(loop);
}

function setupControls() {
    // Element Selection
    document.querySelectorAll('.el-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.el-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const typeStr = btn.dataset.type;
            currentTool = typeStr === 'ERASER' ? TYPES.EMPTY : TYPES[typeStr];
        });
    });

    // Sliders
    document.getElementById('brush-size').addEventListener('input', (e) => {
        brushSize = parseInt(e.target.value);
        document.getElementById('size-val').innerText = brushSize;
    });
    
    document.getElementById('sim-speed').addEventListener('input', (e) => {
        simSpeed = parseInt(e.target.value);
        document.getElementById('speed-val').innerText = simSpeed + 'x';
    });

    // Mouse Events
    canvas.addEventListener('mousedown', () => isMouseDown = true);
    canvas.addEventListener('mouseup', () => isMouseDown = false);
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = Math.floor((e.clientX - rect.left) / SCALE);
        mouseY = Math.floor((e.clientY - rect.top) / SCALE);
    });

    // Buttons
    document.getElementById('btn-clear').addEventListener('click', () => grid.fill(TYPES.EMPTY));
    
    document.getElementById('btn-save').addEventListener('click', () => {
        localStorage.setItem('pixelSandState', JSON.stringify(grid));
        alert('State Saved!');
    });
    
    document.getElementById('btn-load').addEventListener('click', () => {
        const data = localStorage.getItem('pixelSandState');
        if(data) grid = JSON.parse(data);
    });
}

// --- Main Loop ---
let lastTime = 0;
function loop(timestamp) {
    const dt = timestamp - lastTime;
    lastTime = timestamp;
    
    fpsEl.innerText = Math.round(1000 / dt);

    // Apply Brush
    if (isMouseDown) {
        paint(mouseX, mouseY, currentTool, brushSize);
    }

    // Update Physics (run multiple times per frame for speed)
    for(let i=0; i<simSpeed; i++) {
        updatePhysics();
    }

    // Render
    draw();
    
    requestAnimationFrame(loop);
}

// --- Physics Logic ---
function updatePhysics() {
    // Create a copy of the grid to read from, write to 'grid' directly to allow cascading
    // Or strictly use a buffer. For simple sand, strictly reading from a copy is safer.
    // However, fast sand usually reads from current frame but iterates Bottom-Up.
    
    // We iterate from Bottom to Top to prevent particles "teleporting" to the floor
    let count = 0;
    
    for (let y = ROWS - 1; y >= 0; y--) {
        // Randomize X direction to prevent bias
        const startX = Math.random() > 0.5 ? 0 : COLS - 1;
        const step = startX === 0 ? 1 : -1;
        
        for (let i = 0; i < COLS; i++) {
            const x = startX === 0 ? i : COLS - 1 - i;
            const idx = y * COLS + x;
            const type = grid[idx];

            if (type === TYPES.EMPTY) continue;
            count++;

            // Pass to specific handlers
            if (type === TYPES.SAND) updateSand(x, y, idx);
            else if (type === TYPES.WATER) updateWater(x, y, idx);
            else if (type === TYPES.FIRE) updateFire(x, y, idx);
            else if (type === TYPES.SMOKE) updateSmoke(x, y, idx);
        }
    }
    particleCount = count;
    countEl.innerText = count;
}

function updateSand(x, y, idx) {
    if (y >= ROWS - 1) return; // Bottom

    const belowIdx = idx + COLS;
    const belowLeftIdx = idx + COLS - 1;
    const belowRightIdx = idx + COLS + 1;

    // 1. Try to move down
    if (grid[belowIdx] === TYPES.EMPTY || grid[belowIdx] === TYPES.WATER) {
        swap(idx, belowIdx);
    } 
    // 2. Try move down-left
    else if (x > 0 && (grid[belowLeftIdx] === TYPES.EMPTY || grid[belowLeftIdx] === TYPES.WATER)) {
        swap(idx, belowLeftIdx);
    } 
    // 3. Try move down-right
    else if (x < COLS - 1 && (grid[belowRightIdx] === TYPES.EMPTY || grid[belowRightIdx] === TYPES.WATER)) {
        swap(idx, belowRightIdx);
    }
}

function updateWater(x, y, idx) {
    if (y >= ROWS - 1) return;

    const belowIdx = idx + COLS;
    const leftIdx = idx - 1;
    const rightIdx = idx + 1;

    // 1. Move Down
    if (grid[belowIdx] === TYPES.EMPTY) {
        swap(idx, belowIdx);
    } 
    // 2. Move Sideways (Randomly)
    else {
        const dir = Math.random() > 0.5 ? 1 : -1;
        const targetIdx = idx + dir;
        
        if (targetIdx >= 0 && targetIdx < grid.length && 
            grid[targetIdx] === TYPES.EMPTY) {
             // Basic boundary check for wrapping
             if (dir === 1 && x < COLS - 1) swap(idx, targetIdx);
             if (dir === -1 && x > 0) swap(idx, targetIdx);
        }
    }
}

function updateFire(x, y, idx) {
    // Fire rises and burns wood
    // Randomly disappear (burn out)
    if (Math.random() < 0.1) {
        grid[idx] = Math.random() < 0.5 ? TYPES.SMOKE : TYPES.EMPTY;
        return;
    }

    // Burn Neighbors
    const neighbors = [idx-1, idx+1, idx-COLS, idx+COLS];
    neighbors.forEach(n => {
        if (grid[n] === TYPES.WOOD) {
            if (Math.random() < 0.05) grid[n] = TYPES.FIRE; // Ignite wood
        }
    });

    // Rise
    if (y > 0) {
        const aboveIdx = idx - COLS;
        if (grid[aboveIdx] === TYPES.EMPTY) {
            swap(idx, aboveIdx);
        }
    }
}

function updateSmoke(x, y, idx) {
    if (Math.random() < 0.1) {
        grid[idx] = TYPES.EMPTY; // Dissipate
        return;
    }
    // Rise
    if (y > 0) {
        const aboveIdx = idx - COLS;
        if (grid[aboveIdx] === TYPES.EMPTY && Math.random() > 0.5) {
            swap(idx, aboveIdx);
        }
        // Jitter
        const dir = Math.random() > 0.5 ? 1 : -1;
        const sideIdx = idx + dir;
        if (grid[sideIdx] === TYPES.EMPTY && Math.random() > 0.8) {
             if (dir === 1 && x < COLS - 1) swap(idx, sideIdx);
             if (dir === -1 && x > 0) swap(idx, sideIdx);
        }
    }
}

// Helper to swap two pixels
function swap(i, j) {
    const temp = grid[i];
    grid[i] = grid[j];
    grid[j] = temp;
}

// --- Painting ---
function paint(cx, cy, type, r) {
    for (let y = -r; y <= r; y++) {
        for (let x = -r; x <= r; x++) {
            if (x*x + y*y <= r*r) { // Circle brush
                const drawX = cx + x;
                const drawY = cy + y;
                if (drawX >= 0 && drawX < COLS && drawY >= 0 && drawY < ROWS) {
                    const idx = drawY * COLS + drawX;
                    // Don't overwrite unless empty or erasing
                    if (type === TYPES.EMPTY || grid[idx] === TYPES.EMPTY || grid[idx] === TYPES.WATER) {
                        grid[idx] = type;
                    }
                }
            }
        }
    }
}

// --- Rendering ---
function draw() {
    const data = imgData.data;
    
    for (let i = 0; i < grid.length; i++) {
        const type = grid[i];
        const [r, g, b] = COLORS[type];
        
        const idx = i * 4;
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255; // Alpha
        
        // Add some noise/variation for texture
        if (type !== TYPES.EMPTY) {
            const noise = (Math.random() - 0.5) * 20;
            data[idx] += noise;
            data[idx + 1] += noise;
            data[idx + 2] += noise;
        }
    }
    
    // Create a temporary canvas to scale up the pixel art
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = COLS;
    tempCanvas.height = ROWS;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.putImageData(imgData, 0, 0);
    
    // Draw scaled up to main canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(tempCanvas, 0, 0, COLS * SCALE, ROWS * SCALE);
}

// Start
init();