/**
 * Color-Cascade Engine
 * Implements Breadth-First Search (BFS) Flood Fill Algorithm.
 */

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// --- Config ---
const GRID_SIZE = 14; // 14x14 Grid
const MAX_MOVES = 25;
const TILE_SIZE = 30; // Scaled dynamically later
const COLORS = [
    '#e74c3c', // Red
    '#3498db', // Blue
    '#2ecc71', // Green
    '#f1c40f', // Yellow
    '#9b59b6', // Purple
    '#e67e22'  // Orange
];

// --- State ---
let grid = []; // 2D Array
let moves = 0;
let isAnimating = false;
let gameStatus = 'playing'; // playing, won, lost

// --- Initialization ---

function init() {
    // Setup UI
    const palette = document.getElementById('palette');
    palette.innerHTML = '';
    COLORS.forEach(color => {
        const btn = document.createElement('div');
        btn.className = 'color-btn';
        btn.style.backgroundColor = color;
        btn.onclick = () => handleMove(color);
        palette.appendChild(btn);
    });

    document.getElementById('btn-restart').onclick = initGame;
    
    // Canvas Sizing
    const containerW = document.querySelector('.game-area').clientWidth - 40;
    const size = Math.floor(containerW / GRID_SIZE) * GRID_SIZE;
    canvas.width = size;
    canvas.height = size;
    
    initGame();
}

function initGame() {
    grid = [];
    moves = 0;
    isAnimating = false;
    gameStatus = 'playing';
    
    document.getElementById('message-overlay').classList.add('hidden');
    updateUI();

    // Generate Random Grid 
    for (let r = 0; r < GRID_SIZE; r++) {
        let row = [];
        for (let c = 0; c < GRID_SIZE; c++) {
            const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
            // Optimization: Prevent huge clusters at start? 
            // Nah, random is fine for this game type.
            row.push({ color: randomColor, active: false });
        }
        grid.push(row);
    }

    // Mark top-left as "Active" (Flooded area)
    floodScan(0, 0, grid[0][0].color);
    
    draw();
}

// --- Core Algorithm: Flood Fill (BFS) ---

function handleMove(newColor) {
    if (isAnimating || gameStatus !== 'playing') return;
    
    const currentColor = grid[0][0].color;
    if (newColor === currentColor) return; // No change

    moves++;
    updateUI();

    // BFS to find all tiles reachable from (0,0) that match the CURRENT color
    // We actually already maintain the "active" flag on tiles that are part of the flood.
    // So we just need to expand the frontier.

    // 1. Update all currently active tiles to new color immediately?
    // No, let's animate a ripple.
    
    // Perform Logic Update
    const changedTiles = applyFloodFill(newColor);
    
    if (changedTiles.length > 0) {
        animateRipple(changedTiles, newColor);
    } else {
        // Just change color of existing block without expansion
        updateGridColor(newColor); 
        draw();
    }
}

// Scans grid to mark tiles as 'active' if they are connected to (0,0)
// This is a re-scan helper.
function floodScan(r, c, targetColor) {
    // Standard DFS/BFS to mark connected components
    let queue = [{r, c}];
    let visited = new Set();
    const key = (r, c) => `${r},${c}`;

    // Helper to get logic color (handles animation delay state)
    const getColor = (r, c) => grid[r][c].color;

    while(queue.length > 0) {
        const {r, c} = queue.pop();
        if (visited.has(key(r, c))) continue;
        visited.add(key(r,c));

        grid[r][c].active = true;

        // Neighbors
        const neighbors = [
            {r: r+1, c: c}, {r: r-1, c: c},
            {r: r, c: c+1}, {r: r, c: c-1}
        ];

        for (let n of neighbors) {
            if (n.r >= 0 && n.r < GRID_SIZE && n.c >= 0 && n.c < GRID_SIZE) {
                if (getColor(n.r, n.c) === targetColor && !visited.has(key(n.r, n.c))) {
                    queue.push(n);
                }
            }
        }
    }
}

function applyFloodFill(newColor) {
    // 1. Change all currently active tiles to new color
    // 2. Scan neighbors of active tiles. If neighbor matches newColor, activate it.
    // Return list of newly activated tiles for animation.
    
    // We need to calculate distance from top-left for ripple effect
    let queue = [{r: 0, c: 0, dist: 0}];
    let visited = new Set();
    visited.add("0,0");
    
    let updates = []; // Array of layers [{r,c, color}, ...]

    // BFS to get all CURRENTLY active tiles + NEWLY merging tiles
    // We reconstruct the flood area to assign ripple distances
    
    while(queue.length > 0) {
        const {r, c, dist} = queue.shift();
        
        // Add to update list
        if (!updates[dist]) updates[dist] = [];
        updates[dist].push({r, c});

        const neighbors = [
            {r: r+1, c: c}, {r: r-1, c: c},
            {r: r, c: c+1}, {r: r, c: c-1}
        ];

        for (let n of neighbors) {
            if (n.r >= 0 && n.r < GRID_SIZE && n.c >= 0 && n.c < GRID_SIZE) {
                const k = `${n.r},${n.c}`;
                if (!visited.has(k)) {
                    const tile = grid[n.r][n.c];
                    // Valid path if it IS active OR it matches the new target color
                    if (tile.active || tile.color === newColor) {
                        visited.add(k);
                        tile.active = true; // Mark as part of flood
                        queue.push({r: n.r, c: n.c, dist: dist + 1});
                    }
                }
            }
        }
    }
    
    return updates;
}

// --- Animation ---

function animateRipple(layers, newColor) {
    isAnimating = true;
    let currentLayer = 0;

    function step() {
        if (currentLayer >= layers.length) {
            isAnimating = false;
            checkWinCondition(newColor);
            return;
        }

        const nodes = layers[currentLayer];
        nodes.forEach(node => {
            grid[node.r][node.c].color = newColor;
        });
        
        draw();
        currentLayer++;
        requestAnimationFrame(step);
    }
    
    step();
}

function updateGridColor(color) {
    for (let r=0; r<GRID_SIZE; r++) {
        for (let c=0; c<GRID_SIZE; c++) {
            if (grid[r][c].active) grid[r][c].color = color;
        }
    }
}

// --- Game Logic ---

function checkWinCondition(lastColor) {
    // Check if all tiles match
    let allMatch = true;
    for (let r=0; r<GRID_SIZE; r++) {
        for (let c=0; c<GRID_SIZE; c++) {
            if (grid[r][c].color !== lastColor) {
                allMatch = false;
                break;
            }
        }
    }

    if (allMatch) {
        gameOver(true);
    } else if (moves >= MAX_MOVES) {
        gameOver(false);
    }
}

function gameOver(win) {
    gameStatus = win ? 'won' : 'lost';
    const overlay = document.getElementById('message-overlay');
    const title = document.getElementById('msg-title');
    const desc = document.getElementById('msg-desc');
    
    overlay.classList.remove('hidden');
    if (win) {
        title.innerText = "You Won!";
        title.style.color = '#2ecc71';
        desc.innerText = `Board cleared in ${moves} moves.`;
    } else {
        title.innerText = "Game Over";
        title.style.color = '#e74c3c';
        desc.innerText = "Out of moves! Try a different strategy.";
    }
}

// --- Rendering ---

function draw() {
    const ts = canvas.width / GRID_SIZE; // Tile Size
    
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            ctx.fillStyle = grid[r][c].color;
            ctx.fillRect(c * ts, r * ts, ts, ts); // No gaps
            
            // Optional: Draw subtle border for non-active tiles
            // to help player see grid
            // if (!grid[r][c].active) {
            //     ctx.strokeStyle = "rgba(0,0,0,0.05)";
            //     ctx.lineWidth = 1;
            //     ctx.strokeRect(c*ts, r*ts, ts, ts);
            // }
        }
    }
}

function updateUI() {
    document.getElementById('moves-val').innerText = moves;
}

// Start
init();