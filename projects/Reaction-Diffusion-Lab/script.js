/**
 * Reaction-Diffusion Engine (Gray-Scott Model)
 * Uses TypedArrays (Float32Array) for high-performance simulation.
 */

const canvas = document.getElementById('sim-canvas');
const ctx = canvas.getContext('2d');

// --- Config ---
const SCALE = 2; // Resolution scale (lower = faster)
let width, height;
let gridA, gridB, nextA, nextB; // Double buffers

// Diffusion Constants
const DA = 1.0;
const DB = 0.5;
let feed = 0.055;
let kill = 0.062;
const dt = 1.0;

// Convolution Weights (Laplacian 3x3)
//  0.05  0.2  0.05
//  0.2  -1.0  0.2
//  0.05  0.2  0.05

// Paint State
let isPainting = true;
let mouse = { x: 0, y: 0, down: false };

// --- Presets ---
const PRESETS = {
    mitosis: { f: 0.0367, k: 0.0649 },
    coral: { f: 0.0545, k: 0.0620 },
    stripes: { f: 0.0220, k: 0.0510 },
    chaos: { f: 0.0260, k: 0.0530 } // Maze-like
};

// --- Initialization ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupInput();

    // Default seed
    seedSquare(width/2, height/2, 20);

    // Controls
    document.getElementById('slider-f').oninput = e => updateParam('f', e.target.value);
    document.getElementById('slider-k').oninput = e => updateParam('k', e.target.value);
    
    document.getElementById('btn-clear').onclick = () => {
        fillGrid(gridA, 1.0);
        fillGrid(gridB, 0.0);
        seedSquare(width/2, height/2, 20);
    };
    
    document.getElementById('btn-paint').onclick = e => {
        isPainting = !isPainting;
        e.target.innerText = `Paint Mode: ${isPainting ? 'ON' : 'OFF'}`;
        e.target.style.opacity = isPainting ? '1' : '0.5';
    };

    updateParam('f', feed);
    updateParam('k', kill);

    loop();
}

function resizeCanvas() {
    // Setup logic grid resolution
    width = Math.floor(canvas.parentElement.clientWidth / SCALE);
    height = Math.floor(canvas.parentElement.clientHeight / SCALE);
    
    // Canvas display resolution
    canvas.width = width;
    canvas.height = height;

    const size = width * height;
    gridA = new Float32Array(size);
    gridB = new Float32Array(size);
    nextA = new Float32Array(size);
    nextB = new Float32Array(size);

    // Init: A=1, B=0
    fillGrid(gridA, 1.0);
    fillGrid(gridB, 0.0);
}

function fillGrid(grid, val) {
    for(let i=0; i<grid.length; i++) grid[i] = val;
}

function seedSquare(cx, cy, r) {
    const startX = Math.floor(cx - r);
    const startY = Math.floor(cy - r);
    for (let y = startY; y < startY + r*2; y++) {
        for (let x = startX; x < startX + r*2; x++) {
            if (x >= 0 && x < width && y >= 0 && y < height) {
                gridB[y * width + x] = 1.0;
            }
        }
    }
}

// --- Simulation Core ---

function update() {
    // Perform multiple steps per frame for speed
    for (let step = 0; step < 8; step++) {
        computeStep();
        swapBuffers();
    }
}

function computeStep() {
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const i = y * width + x;
            
            const a = gridA[i];
            const b = gridB[i];

            // Laplacian (Convolution)
            // Pre-calculated indices for speed
            const lapA = 
                (gridA[i-1] * 0.2 + gridA[i+1] * 0.2 + 
                 gridA[i-width] * 0.2 + gridA[i+width] * 0.2 +
                 gridA[i-width-1] * 0.05 + gridA[i-width+1] * 0.05 +
                 gridA[i+width-1] * 0.05 + gridA[i+width+1] * 0.05) - a;

            const lapB = 
                (gridB[i-1] * 0.2 + gridB[i+1] * 0.2 + 
                 gridB[i-width] * 0.2 + gridB[i+width] * 0.2 +
                 gridB[i-width-1] * 0.05 + gridB[i-width+1] * 0.05 +
                 gridB[i+width-1] * 0.05 + gridB[i+width+1] * 0.05) - b;

            // Reaction (abb)
            const abb = a * b * b;

            // Update Formulas
            // A' = A + (Da * lapA - abb + f * (1-A)) * dt
            nextA[i] = a + (DA * lapA - abb + feed * (1 - a)) * dt;
            
            // B' = B + (Db * lapB + abb - (k + f) * B) * dt
            nextB[i] = b + (DB * lapB + abb - (kill + feed) * b) * dt;

            // Clamp 0-1
            if (nextA[i] < 0) nextA[i] = 0; else if (nextA[i] > 1) nextA[i] = 1;
            if (nextB[i] < 0) nextB[i] = 0; else if (nextB[i] > 1) nextB[i] = 1;
        }
    }
}

function swapBuffers() {
    // Swap references
    let tempA = gridA; gridA = nextA; nextA = tempA;
    let tempB = gridB; gridB = nextB; nextB = tempB;
}

// --- Interaction ---

function setupInput() {
    canvas.addEventListener('mousedown', e => mouse.down = true);
    window.addEventListener('mouseup', e => mouse.down = false);
    canvas.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = Math.floor((e.clientX - rect.left) / SCALE);
        mouse.y = Math.floor((e.clientY - rect.top) / SCALE);
        
        if (mouse.down && isPainting) {
            seedSquare(mouse.x, mouse.y, 5);
        }
    });
}

window.setPreset = (name) => {
    const p = PRESETS[name];
    updateParam('f', p.f);
    updateParam('k', p.k);
}

function updateParam(key, val) {
    val = parseFloat(val);
    if (key === 'f') { feed = val; document.getElementById('slider-f').value = val; }
    if (key === 'k') { kill = val; document.getElementById('slider-k').value = val; }
    document.getElementById(`val-${key}`).innerText = val.toFixed(4);
}

// --- Rendering ---

function draw() {
    // Create ImageData buffer
    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    for (let i = 0; i < width * height; i++) {
        const idx = i * 4;
        const a = gridA[i];
        const b = gridB[i];
        
        // Visualization Logic:
        // We want to visualize B concentration or A-B
        // Standard style: Black = A(1), White = B(1)
        // Or color gradient
        
        const val = Math.floor((a - b) * 255);
        
        // Color mapping
        // Use B for color intensity
        // simple grayscale:
        // data[idx] = val; data[idx+1] = val; data[idx+2] = val; data[idx+3] = 255;

        // Fancy Chemical Color (Cyan/Dark)
        const c = Math.floor(b * 255);
        data[idx] = 0;     // R
        data[idx+1] = c*2; // G (Teal)
        data[idx+2] = c*2; // B
        data[idx+3] = 255; // Alpha
        
        // If 'val' approach (White/Black)
        // data[idx] = val; data[idx+1] = val; data[idx+2] = val; data[idx+3] = 255;
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