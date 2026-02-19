/**
 * Hex Empire Engine
 * Handles Hexagonal Grid logic (Axial/Offset), Turn State, and AI.
 */

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// --- Config ---
const HEX_SIZE = 35;
const GRID_W = 12; // Cols
const GRID_H = 8;  // Rows
const COLORS = {
    water: '#4fc3f7',
    land: '#aed581',
    p1: '#42a5f5', // Blue
    p2: '#ef5350', // Red
    highlight: 'rgba(255, 255, 255, 0.4)',
    selected: 'rgba(255, 215, 0, 0.5)'
};

// --- State ---
let tiles = []; // 2D array [col][row]
let width, height;
let selectedTile = null;
let playerGold = 50;
let turn = 1;
let isPlayerTurn = true;
let gameOver = false;

// --- Hex Math Helpers ---

// Convert Offset (col, row) to Pixel (x, y)
// "Odd-q" vertical layout: odd columns shoved down
function hexToPixel(col, row) {
    const x = HEX_SIZE * 3/2 * col + HEX_SIZE;
    const y = HEX_SIZE * Math.sqrt(3) * (row + 0.5 * (col & 1)) + HEX_SIZE;
    return { x, y };
}

// Get neighbors in Offset Coords (Odd-q)
// Directions vary based on even or odd column
const DIRECTIONS_EVEN = [
    [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [0, 1]
];
const DIRECTIONS_ODD = [
    [1, 1], [1, 0], [0, -1], [-1, 0], [-1, 1], [0, 1]
];

function getNeighbors(col, row) {
    const dirs = (col % 2 === 0) ? DIRECTIONS_EVEN : DIRECTIONS_ODD;
    const neighbors = [];
    
    for (let d of dirs) {
        const nc = col + d[0];
        const nr = row + d[1];
        if (nc >= 0 && nc < GRID_W && nr >= 0 && nr < GRID_H) {
            neighbors.push(tiles[nc][nr]);
        }
    }
    return neighbors;
}

// --- Init ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    canvas.addEventListener('mousedown', handleClick);
    initGame();
}

function resizeCanvas() {
    // Calculate required size based on grid
    const reqW = HEX_SIZE * 3/2 * GRID_W + HEX_SIZE * 2;
    const reqH = HEX_SIZE * Math.sqrt(3) * GRID_H + HEX_SIZE * 2;
    
    // Fit to container or fixed? Fixed is easier for strategy
    canvas.width = reqW;
    canvas.height = reqH;
    
    // Draw initial if resizing during play
    if (tiles.length > 0) draw();
}

function initGame() {
    tiles = [];
    playerGold = 50;
    turn = 1;
    isPlayerTurn = true;
    gameOver = false;
    selectedTile = null;
    
    document.getElementById('game-over').classList.add('hidden');
    updateUI();

    // 1. Generate Grid
    for (let c = 0; c < GRID_W; c++) {
        tiles[c] = [];
        for (let r = 0; r < GRID_H; r++) {
            tiles[c][r] = {
                c, r,
                type: 'land', // 'water', 'capital', 'land'
                owner: 0,     // 0: Neutral, 1: P1, 2: P2
                army: 0,      // Strength
                ...hexToPixel(c, r) // Cache pixel center
            };
            
            // Random water holes
            if (Math.random() < 0.15) tiles[c][r].type = 'water';
        }
    }

    // 2. Place Capitals
    // P1 (Left)
    let p1c = tiles[1][Math.floor(GRID_H/2)];
    p1c.type = 'capital';
    p1c.owner = 1;
    p1c.army = 10;
    
    // P2 (Right)
    let p2c = tiles[GRID_W-2][Math.floor(GRID_H/2)];
    p2c.type = 'capital';
    p2c.owner = 2;
    p2c.army = 10;

    // Ensure connectivity? (Simple maps mostly work)
    draw();
}

// --- Logic ---

function handleClick(e) {
    if (!isPlayerTurn || gameOver) return;

    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // Find clicked hex (Brute force distance check is fast enough for <100 tiles)
    let clicked = null;
    let minDst = HEX_SIZE * 0.9;

    for (let c = 0; c < GRID_W; c++) {
        for (let r = 0; r < GRID_H; r++) {
            const t = tiles[c][r];
            const dist = Math.hypot(t.x - mx, t.y - my);
            if (dist < minDst) {
                clicked = t;
                break;
            }
        }
    }

    if (!clicked || clicked.type === 'water') {
        selectedTile = null;
        updatePanel(null);
        draw();
        return;
    }

    // Logic
    if (selectedTile && selectedTile.owner === 1) {
        // We have a selection, trying to move/attack
        if (clicked === selectedTile) {
            // Deselect
            selectedTile = null;
            updatePanel(null);
        } else {
            // Check adjacency
            const neighbors = getNeighbors(selectedTile.c, selectedTile.r);
            if (neighbors.includes(clicked)) {
                performMove(selectedTile, clicked);
            } else {
                // Select different tile
                if (clicked.owner === 1) {
                    selectedTile = clicked;
                    updatePanel(clicked);
                }
            }
        }
    } else {
        // Select new tile
        if (clicked.owner === 1) {
            selectedTile = clicked;
            updatePanel(clicked);
        }
    }
    draw();
}

function performMove(from, to) {
    if (from.army <= 1) return; // Cannot move if army 1

    if (to.owner === 1) {
        // Merge armies
        to.army += (from.army - 1);
        from.army = 1;
        selectedTile = null;
        updatePanel(null);
    } else {
        // Attack/Expand
        // Simple combat: Attacker - Defender
        const attackPower = from.army - 1;
        const defensePower = to.army; // Neutral might have 0

        if (attackPower > defensePower) {
            // Win
            to.owner = 1;
            to.army = attackPower - defensePower;
            from.army = 1;
            
            // Capture Capital Logic
            if (to.type === 'capital' && to.owner === 1) {
                // Game Over handled in check
            }
        } else {
            // Lose
            to.army -= attackPower;
            from.army = 1;
        }
        selectedTile = null;
        updatePanel(null);
    }
    
    checkWinCondition();
}

function recruit() {
    if (selectedTile && selectedTile.owner === 1 && playerGold >= 10) {
        playerGold -= 10;
        selectedTile.army += 5;
        updateUI();
        updatePanel(selectedTile);
        draw();
    }
}

function endTurn() {
    if (!isPlayerTurn || gameOver) return;
    
    isPlayerTurn = false;
    selectedTile = null;
    updatePanel(null);
    draw();

    // Income
    calculateIncome(1);

    // Show Enemy Turn Toast
    const toast = document.getElementById('turn-indicator');
    toast.classList.remove('hidden');
    toast.style.animation = 'none';
    toast.offsetHeight; /* trigger reflow */
    toast.style.animation = null;

    // AI Logic delay
    setTimeout(() => {
        aiTurn();
    }, 1000);
}

function aiTurn() {
    // 1. Gather AI tiles
    let aiTiles = [];
    for (let c = 0; c < GRID_W; c++) {
        for (let r = 0; r < GRID_H; r++) {
            if (tiles[c][r].owner === 2) aiTiles.push(tiles[c][r]);
        }
    }

    // 2. Simple AI Logic
    // Sort by strength descending
    aiTiles.sort((a, b) => b.army - a.army);

    // Try to attack or expand
    for (let t of aiTiles) {
        if (t.army > 1) {
            const neighbors = getNeighbors(t.c, t.r);
            // Prioritize Player tiles, then Neutral land
            let target = null;
            
            // Look for killable player tile
            target = neighbors.find(n => n.owner === 1 && n.army < t.army - 1 && n.type !== 'water');
            
            // Or Expand
            if (!target) {
                target = neighbors.find(n => n.owner === 0 && n.type !== 'water');
            }
            
            if (target) {
                // Execute Attack
                const atk = t.army - 1;
                const def = target.army;
                
                if (atk > def) {
                    target.owner = 2;
                    target.army = atk - def;
                    t.army = 1;
                }
            }
        }
    }

    // 3. Recruit (Randomly boost weak tiles or capital)
    // AI has infinite money effectively for balance, or simplified growth
    // Let's just give AI +1 army on every tile + bonus on capital
    aiTiles.forEach(t => {
        if (t.type === 'capital') t.army += 2;
        else if (Math.random() > 0.5) t.army += 1;
    });

    isPlayerTurn = true;
    turn++;
    updateUI();
    checkWinCondition();
    draw();
}

function calculateIncome(player) {
    let income = 0;
    for (let c = 0; c < GRID_W; c++) {
        for (let r = 0; r < GRID_H; r++) {
            if (tiles[c][r].owner === player) {
                income += (tiles[c][r].type === 'capital' ? 10 : 2);
            }
        }
    }
    playerGold += income;
    updateUI();
}

function checkWinCondition() {
    let p1Cap = false;
    let p2Cap = false;
    
    for (let c = 0; c < GRID_W; c++) {
        for (let r = 0; r < GRID_H; r++) {
            const t = tiles[c][r];
            if (t.type === 'capital') {
                if (t.owner === 1) p1Cap = true;
                if (t.owner === 2) p2Cap = true;
            }
        }
    }
    
    if (!p2Cap) endGame(true);
    else if (!p1Cap) endGame(false);
}

function endGame(win) {
    gameOver = true;
    const overlay = document.getElementById('game-over');
    overlay.classList.remove('hidden');
    document.getElementById('end-title').innerText = win ? "VICTORY" : "DEFEAT";
    document.getElementById('end-desc').innerText = win ? "The empire is yours." : "Your capital has fallen.";
}

function updateUI() {
    document.getElementById('turn-val').innerText = "Turn " + turn;
    document.getElementById('gold-val').innerText = playerGold;
}

function updatePanel(tile) {
    const panel = document.getElementById('tile-info');
    if (!tile) {
        panel.classList.add('hidden');
        return;
    }
    panel.classList.remove('hidden');
    document.getElementById('owner-txt').innerText = tile.owner === 1 ? "Player" : (tile.owner === 2 ? "Enemy" : "Neutral");
    document.getElementById('army-txt').innerText = tile.army;
}

// --- Draw ---

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let c = 0; c < GRID_W; c++) {
        for (let r = 0; r < GRID_H; r++) {
            drawHex(tiles[c][r]);
        }
    }
}

function drawHex(t) {
    const { x, y } = t;
    
    // Path
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = 2 * Math.PI / 6 * i;
        const px = x + HEX_SIZE * Math.cos(angle);
        const py = y + HEX_SIZE * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
    
    // Fill
    if (t.type === 'water') ctx.fillStyle = COLORS.water;
    else if (t.owner === 1) ctx.fillStyle = COLORS.p1;
    else if (t.owner === 2) ctx.fillStyle = COLORS.p2;
    else ctx.fillStyle = COLORS.land;
    
    if (t === selectedTile) ctx.fillStyle = COLORS.selected;
    
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#222';
    
    // Highlight Capital
    if (t.type === 'capital') {
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#ffd700';
    }
    ctx.stroke();
    
    // Draw Army Count
    if (t.type !== 'water') {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(t.army, x, y);
    }
}

// Start
init();