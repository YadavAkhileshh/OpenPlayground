/**
 * RPS-Warzone Engine
 * High-performance Cellular Automata using direct pixel manipulation.
 */

const canvas = document.getElementById('sim-canvas');
const ctx = canvas.getContext('2d');

// --- Config ---
const SCALE = 2; // Resolution scale (lower = faster)
let width, height;
let threshold = 3;
let isPaused = false;

// --- State ---
// 0: Rock, 1: Paper, 2: Scissors
let grid = [];
let nextGrid = [];

// Colors (Integer representations of ABGR for 32-bit array)
// Little Endian: 0xAABBGGRR
const COLORS = {
    0: 0xFF5747FF, // Red (Rock) -> Hex: FF4757
    1: 0xFFDE862E, // Blue (Paper) -> Hex: 2E86DE
    2: 0xFF71CC2E  // Green (Scissors) -> Hex: 2ECC71
};

// --- Initialization ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Controls
    document.getElementById('btn-reset').onclick = resetGrid;
    document.getElementById('btn-pause').onclick = () => {
        isPaused = !isPaused;
        document.getElementById('btn-pause').innerHTML = isPaused ? '<i class="fas fa-play"></i> Play' : '<i class="fas fa-pause"></i> Pause';
    };
    
    const slider = document.getElementById('thresh-slider');
    slider.oninput = (e) => {
        threshold = parseInt(e.target.value);
        document.getElementById('thresh-val').innerText = threshold;
    };

    resetGrid();
    loop();
}

function resizeCanvas() {
    const parent = canvas.parentElement;
    canvas.width = parent.clientWidth / SCALE;
    canvas.height = parent.clientHeight / SCALE;
    width = canvas.width;
    height = canvas.height;
    
    // Re-init arrays
    const size = width * height;
    grid = new Uint8Array(size);
    nextGrid = new Uint8Array(size);
    resetGrid();
}

function resetGrid() {
    for (let i = 0; i < grid.length; i++) {
        grid[i] = Math.floor(Math.random() * 3);
    }
}

// --- Core Logic ---

function update() {
    if (isPaused) return;

    // Iterate every pixel
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            const current = grid[idx];
            
            // Rules:
            // Rock (0) eaten by Paper (1)
            // Paper (1) eaten by Scissors (2)
            // Scissors (2) eaten by Rock (0)
            const predator = (current + 1) % 3;
            
            // Count neighbor predators
            let enemies = 0;
            
            // Moore Neighborhood (8 neighbors)
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (dx === 0 && dy === 0) continue;
                    
                    // Wrap around (Toroidal)
                    let nx = (x + dx + width) % width;
                    let ny = (y + dy + height) % height;
                    
                    const nIdx = ny * width + nx;
                    if (grid[nIdx] === predator) {
                        enemies++;
                    }
                }
            }

            // State Transition
            if (enemies >= threshold) {
                nextGrid[idx] = predator;
            } else {
                nextGrid[idx] = current;
            }
        }
    }

    // Swap Buffers
    // Uint8Array.set is fast
    grid.set(nextGrid);
}

// --- Rendering ---

function draw() {
    // Create ImageData
    const imgData = ctx.createImageData(width, height);
    const data = new Uint32Array(imgData.data.buffer);

    for (let i = 0; i < grid.length; i++) {
        data[i] = COLORS[grid[i]];
    }

    ctx.putImageData(imgData, 0, 0);
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Start
init();