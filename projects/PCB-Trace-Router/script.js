const canvas = document.getElementById('pcbCanvas');
const ctx = canvas.getContext('2d');
const connectionStatus = document.getElementById('connectionStatus');
const btnClear = document.getElementById('btnClear');
const btnNext = document.getElementById('btnNext');
const integrityStatus = document.getElementById('integrityStatus');

const GRID_SIZE = 10;
const TILE_SIZE = canvas.width / GRID_SIZE;

// Node Definitions (Colors act as IDs)
const COLORS = {
    A: '#00f3ff', // Cyan
    B: '#ff003c', // Magenta/Red
    C: '#39ff14', // Green
    D: '#ffaa00'  // Orange
};

// Level Design: Start and End coordinates for each color pair
const levelConfig = [
    { id: 'A', start: {c: 1, r: 1}, end: {c: 8, r: 8}, color: COLORS.A },
    { id: 'B', start: {c: 1, r: 8}, end: {c: 8, r: 1}, color: COLORS.B },
    { id: 'C', start: {c: 4, r: 0}, end: {c: 4, r: 9}, color: COLORS.C },
    { id: 'D', start: {c: 0, r: 4}, end: {c: 9, r: 5}, color: COLORS.D }
];

// State arrays
let grid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(null));
let currentPath = [];
let activeId = null;
let completedPaths = {}; // Stores { 'A': [{c, r}, ...], ... }

let isDrawing = false;

// Initialize board with nodes
function initBoard() {
    levelConfig.forEach(node => {
        grid[node.start.r][node.start.c] = { type: 'node', id: node.id };
        grid[node.end.r][node.end.c] = { type: 'node', id: node.id };
    });
}

// --- Interaction Logic ---
canvas.addEventListener('mousedown', startRouting);
window.addEventListener('mousemove', routeTrace);
window.addEventListener('mouseup', stopRouting);
btnClear.addEventListener('click', resetBoard);

function getGridPos(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return {
        c: Math.floor(x / TILE_SIZE),
        r: Math.floor(y / TILE_SIZE)
    };
}

function startRouting(e) {
    const pos = getGridPos(e);
    if (pos.c < 0 || pos.c >= GRID_SIZE || pos.r < 0 || pos.r >= GRID_SIZE) return;

    const cell = grid[pos.r][pos.c];
    
    // If clicking on a starting node
    if (cell && cell.type === 'node') {
        activeId = cell.id;
        isDrawing = true;
        
        // If re-drawing, clear old path
        if (completedPaths[activeId]) {
            clearPath(activeId);
        }
        
        currentPath = [{c: pos.c, r: pos.r}];
        integrityStatus.innerText = "ROUTING...";
        integrityStatus.className = "highlight";
    }
}

function routeTrace(e) {
    if (!isDrawing || !activeId) return;

    const pos = getGridPos(e);
    if (pos.c < 0 || pos.c >= GRID_SIZE || pos.r < 0 || pos.r >= GRID_SIZE) return;

    const lastPos = currentPath[currentPath.length - 1];
    
    // Only allow adjacent cardinal movement (no diagonals)
    const isAdjacent = (Math.abs(pos.c - lastPos.c) === 1 && pos.r === lastPos.r) || 
                       (Math.abs(pos.r - lastPos.r) === 1 && pos.c === lastPos.c);

    if (isAdjacent) {
        const cell = grid[pos.r][pos.c];

        // Check for collisions
        if (cell && cell.type === 'trace') return; // Hit a trace
        if (cell && cell.type === 'node' && cell.id !== activeId) return; // Hit wrong node

        // Prevent looping back on current path
        if (!currentPath.some(p => p.c === pos.c && p.r === pos.r)) {
            currentPath.push({c: pos.c, r: pos.r});

            // Check if we hit the destination node
            if (cell && cell.type === 'node' && cell.id === activeId) {
                commitPath();
            }
        }
    }
}

function stopRouting() {
    if (!isDrawing) return;
    isDrawing = false;
    
    // If path didn't reach the end node, discard it
    const lastPos = currentPath[currentPath.length - 1];
    const cell = grid[lastPos.r][lastPos.c];
    
    if (!cell || cell.type !== 'node' || cell.id !== activeId) {
        currentPath = [];
        integrityStatus.innerText = "PATH ABORTED";
        integrityStatus.className = "alert";
        setTimeout(() => { if(!isDrawing) integrityStatus.innerText = "STABLE"; integrityStatus.className="highlight-green"; }, 1000);
    }
    
    activeId = null;
}

function commitPath() {
    isDrawing = false;
    completedPaths[activeId] = [...currentPath];
    
    // Write traces to grid for collision detection
    currentPath.forEach(pos => {
        if (!grid[pos.r][pos.c]) {
            grid[pos.r][pos.c] = { type: 'trace', id: activeId };
        }
    });
    
    currentPath = [];
    activeId = null;
    checkWinCondition();
}

function clearPath(id) {
    // Remove from completed
    delete completedPaths[id];
    // Remove from grid
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (grid[r][c] && grid[r][c].type === 'trace' && grid[r][c].id === id) {
                grid[r][c] = null;
            }
        }
    }
    checkWinCondition();
}

function resetBoard() {
    grid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(null));
    completedPaths = {};
    currentPath = [];
    activeId = null;
    btnNext.classList.add('disabled');
    integrityStatus.innerText = "MEMORY FLUSHED";
    initBoard();
    checkWinCondition();
}

function checkWinCondition() {
    const connected = Object.keys(completedPaths).length;
    const total = levelConfig.length;
    
    connectionStatus.innerText = `${connected} / ${total}`;
    
    if (connected === total) {
        connectionStatus.className = "highlight-green";
        integrityStatus.innerText = "CIRCUIT COMPLETE";
        integrityStatus.className = "highlight-green";
        btnNext.classList.remove('disabled');
    } else {
        connectionStatus.className = "alert";
    }
}

// --- Rendering Engine ---
function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Grid Lines (Subtle)
    ctx.strokeStyle = 'rgba(57, 255, 20, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath(); ctx.moveTo(i * TILE_SIZE, 0); ctx.lineTo(i * TILE_SIZE, canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i * TILE_SIZE); ctx.lineTo(canvas.width, i * TILE_SIZE); ctx.stroke();
    }

    // Helper function to draw continuous paths
    const drawTraceLine = (pathArray, color, isGlow) => {
        if (pathArray.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(pathArray[0].c * TILE_SIZE + TILE_SIZE/2, pathArray[0].r * TILE_SIZE + TILE_SIZE/2);
        for (let i = 1; i < pathArray.length; i++) {
            ctx.lineTo(pathArray[i].c * TILE_SIZE + TILE_SIZE/2, pathArray[i].r * TILE_SIZE + TILE_SIZE/2);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        if (isGlow) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = color;
        } else {
            ctx.shadowBlur = 0;
        }
        
        ctx.stroke();
        ctx.shadowBlur = 0; // Reset
    };

    // Draw Completed Paths
    Object.keys(completedPaths).forEach(id => {
        drawTraceLine(completedPaths[id], COLORS[id], true);
    });

    // Draw Active Dragging Path
    if (currentPath.length > 0 && activeId) {
        drawTraceLine(currentPath, COLORS[activeId], true);
    }

    // Draw Hardware Nodes (Pins)
    levelConfig.forEach(node => {
        const drawPin = (pos) => {
            const x = pos.c * TILE_SIZE + TILE_SIZE / 2;
            const y = pos.r * TILE_SIZE + TILE_SIZE / 2;
            
            // Outer casing
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(x - 12, y - 12, 24, 24);
            
            // Inner glowing core
            ctx.fillStyle = node.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = node.color;
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        };
        drawPin(node.start);
        drawPin(node.end);
    });

    requestAnimationFrame(drawBoard);
}

// Boot up
initBoard();
requestAnimationFrame(drawBoard);