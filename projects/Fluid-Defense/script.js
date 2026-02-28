/**
 * Fluid Defense Engine
 * Grid-based Cellular Automata simulating water flow with pressure.
 */

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// --- Config ---
const GRID_SIZE = 15; // Pixel size of each cell
let cols, rows;
let grid = []; // The map
let flowRate = 0.5; // Water added per frame
let maxPressure = 4.0; // How much water can stack in a cell
let money = 500;
let health = 100;
let isPlaying = false;
let currentTool = 'wall';
let frameCount = 0;

// Cell Types
const TYPE = {
    EMPTY: 0,
    WALL: 1,
    SOURCE: 2,
    BASE: 3,
    DRAIN: 4,
    SPONGE: 5
};

// Costs
const COSTS = {
    wall: 10,
    drain: 50,
    sponge: 30
};

// --- Initialization ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupInput();
    
    // Don't start until button pressed
}

function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    cols = Math.floor(canvas.width / GRID_SIZE);
    rows = Math.floor(canvas.height / GRID_SIZE);
    resetGrid();
}

function resetGrid() {
    grid = [];
    for (let i = 0; i < cols * rows; i++) {
        grid.push({
            type: TYPE.EMPTY,
            liquid: 0, // 0.0 to maxPressure
            settled: false // Optimization flag
        });
    }

    // Setup Level
    // Source Top Center
    const sourceIdx = getIdx(Math.floor(cols/2), 1);
    grid[sourceIdx].type = TYPE.SOURCE;
    
    // Base Bottom Center (Platform)
    const baseX = Math.floor(cols/2);
    const baseY = rows - 5;
    
    // Build Base structure
    for(let x = baseX - 3; x <= baseX + 3; x++) {
        for(let y = baseY; y < rows; y++) {
            const idx = getIdx(x, y);
            grid[idx].type = TYPE.BASE;
        }
    }
}

function startGame() {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-over').classList.add('hidden');
    resetGame();
    isPlaying = true;
    loop();
}

function resetGame() {
    money = 500;
    health = 100;
    flowRate = 0.5;
    updateUI();
    resetGrid();
}

// --- Fluid Simulation Logic (Cellular Automata) ---

function update() {
    if (!isPlaying) return;
    frameCount++;

    // 1. Add Liquid at Source
    const source = grid.find(c => c.type === TYPE.SOURCE);
    if (source) source.liquid = Math.min(source.liquid + flowRate, maxPressure);

    // 2. Process Flow
    // Iterate bottom-up to simulate gravity properly
    for (let y = rows - 2; y >= 0; y--) { // Skip bottom row
        for (let x = 0; x < cols; x++) {
            const idx = getIdx(x, y);
            const cell = grid[idx];
            
            // Skip dry or solid cells
            if (cell.liquid <= 0 || cell.type === TYPE.WALL || cell.type === TYPE.BASE) continue;
            if (cell.liquid < 0.01) { cell.liquid = 0; continue; } // Cull tiny amounts

            // Check Down
            const downIdx = getIdx(x, y + 1);
            const downCell = grid[downIdx];
            
            // Check Base Damage
            if (downCell.type === TYPE.BASE) {
                damageBase(0.2); // Liquid touching base
            }

            // Flow Down
            if (downCell.type === TYPE.EMPTY || downCell.type === TYPE.DRAIN || downCell.type === TYPE.SPONGE) {
                const space = maxPressure - downCell.liquid;
                if (space > 0) {
                    const flow = Math.min(cell.liquid, space);
                    cell.liquid -= flow;
                    downCell.liquid += flow;
                }
            } 
            
            // If still liquid, Flow Sideways (Pressure)
            if (cell.liquid > 0) {
                // Try Left
                if (x > 0) {
                    const leftIdx = getIdx(x - 1, y);
                    const leftCell = grid[leftIdx];
                    if (leftCell.type === TYPE.EMPTY && leftCell.liquid < cell.liquid) {
                        const flow = (cell.liquid - leftCell.liquid) / 4; // Equalize
                        if (flow > 0) {
                            cell.liquid -= flow;
                            leftCell.liquid += flow;
                        }
                    }
                }
                // Try Right
                if (x < cols - 1) {
                    const rightIdx = getIdx(x + 1, y);
                    const rightCell = grid[rightIdx];
                    if (rightCell.type === TYPE.EMPTY && rightCell.liquid < cell.liquid) {
                        const flow = (cell.liquid - rightCell.liquid) / 4;
                        if (flow > 0) {
                            cell.liquid -= flow;
                            rightCell.liquid += flow;
                        }
                    }
                }
            }
        }
    }

    // 3. Process Drains & Sponges
    for (let i = 0; i < grid.length; i++) {
        const c = grid[i];
        if (c.type === TYPE.DRAIN) {
            c.liquid -= 0.8; // Removes liquid
            if(c.liquid < 0) c.liquid = 0;
        }
        else if (c.type === TYPE.SPONGE) {
            // Absorbs neighbors
            const x = i % cols;
            const y = Math.floor(i / cols);
            absorb(x+1, y); absorb(x-1, y); absorb(x, y-1); absorb(x, y+1);
            c.liquid = 0; // Sponge stays dry (magic sponge)
        }
    }

    // Difficulty ramp
    if (frameCount % 600 === 0) {
        flowRate += 0.1; // Increase flood over time
        document.getElementById('pressure-val').innerText = "RISING";
        document.getElementById('pressure-val').style.color = "#ff4757";
    }
}

function absorb(x, y) {
    if (x < 0 || x >= cols || y < 0 || y >= rows) return;
    const idx = getIdx(x, y);
    const cell = grid[idx];
    if (cell.type === TYPE.EMPTY) {
        cell.liquid *= 0.8; // Reduce liquid
    }
}

function damageBase(amount) {
    health -= amount;
    if (health <= 0) {
        health = 0;
        isPlaying = false;
        document.getElementById('game-over').classList.remove('hidden');
    }
    updateUI();
}

function updateUI() {
    document.getElementById('money-val').innerText = money;
    document.getElementById('health-val').innerText = Math.floor(health) + "%";
}

// --- Interaction ---

function setupInput() {
    let isDrawing = false;
    
    canvas.addEventListener('mousedown', e => {
        isDrawing = true;
        handleInteract(e);
    });
    
    canvas.addEventListener('mousemove', e => {
        if (isDrawing) handleInteract(e);
    });
    
    window.addEventListener('mouseup', () => isDrawing = false);
}

function handleInteract(e) {
    if (!isPlaying) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / GRID_SIZE);
    const y = Math.floor((e.clientY - rect.top) / GRID_SIZE);
    const idx = getIdx(x, y);
    
    if (!grid[idx]) return;
    
    // Building Logic
    if (grid[idx].type === TYPE.EMPTY) {
        const cost = COSTS[currentTool];
        if (money >= cost) {
            if (currentTool === 'wall') grid[idx].type = TYPE.WALL;
            if (currentTool === 'drain') grid[idx].type = TYPE.DRAIN;
            if (currentTool === 'sponge') grid[idx].type = TYPE.SPONGE;
            
            money -= cost;
            updateUI();
        }
    }
}

window.selectTool = (tool) => {
    currentTool = tool;
    document.querySelectorAll('.tool').forEach(t => t.classList.remove('active'));
    document.querySelector(`.tool[data-type="${tool}"]`).classList.add('active');
};

window.clearMap = () => {
    // Only clear player structures
    for(let c of grid) {
        if (c.type === TYPE.WALL || c.type === TYPE.DRAIN || c.type === TYPE.SPONGE) {
            c.type = TYPE.EMPTY;
        }
    }
    money = 500; // Reset money partial
    updateUI();
};

// --- Rendering ---

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const idx = getIdx(x, y);
            const cell = grid[idx];
            const px = x * GRID_SIZE;
            const py = y * GRID_SIZE;

            // Draw Liquid
            if (cell.liquid > 0.1) {
                // Opacity based on pressure/depth
                const alpha = Math.min(cell.liquid / 2.0, 0.9);
                ctx.fillStyle = `rgba(0, 168, 255, ${alpha})`;
                ctx.fillRect(px, py, GRID_SIZE, GRID_SIZE);
            }

            // Draw Structures
            if (cell.type === TYPE.WALL) {
                ctx.fillStyle = '#7f8fa6';
                ctx.fillRect(px, py, GRID_SIZE, GRID_SIZE);
                ctx.strokeStyle = '#5f6f86';
                ctx.strokeRect(px, py, GRID_SIZE, GRID_SIZE);
            }
            else if (cell.type === TYPE.BASE) {
                ctx.fillStyle = '#2ed573';
                ctx.fillRect(px, py, GRID_SIZE, GRID_SIZE);
            }
            else if (cell.type === TYPE.SOURCE) {
                ctx.fillStyle = '#ff4757';
                ctx.fillRect(px, py, GRID_SIZE, GRID_SIZE);
                // Glow
                ctx.shadowColor = 'red';
                ctx.shadowBlur = 10;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
            else if (cell.type === TYPE.DRAIN) {
                ctx.fillStyle = '#222';
                ctx.fillRect(px, py, GRID_SIZE, GRID_SIZE);
                ctx.strokeStyle = '#666';
                ctx.setLineDash([2, 2]);
                ctx.strokeRect(px+2, py+2, GRID_SIZE-4, GRID_SIZE-4);
                ctx.setLineDash([]);
            }
            else if (cell.type === TYPE.SPONGE) {
                ctx.fillStyle = '#eccc68';
                ctx.fillRect(px, py, GRID_SIZE, GRID_SIZE);
                ctx.globalAlpha = 0.5;
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(px+GRID_SIZE/2, py+GRID_SIZE/2, 2, 0, Math.PI*2);
                ctx.fill();
                ctx.globalAlpha = 1.0;
            }
        }
    }
}

function getIdx(x, y) {
    return y * cols + x;
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Start
init();