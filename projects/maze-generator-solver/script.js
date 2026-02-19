// Maze Generator & Solver - JavaScript Logic

// Canvas and Context
const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');

// Controls
const mazeSizeSelect = document.getElementById('mazeSize');
const genAlgorithmSelect = document.getElementById('genAlgorithm');
const solveAlgorithmSelect = document.getElementById('solveAlgorithm');
const speedSlider = document.getElementById('speed');
const generateBtn = document.getElementById('generateBtn');
const solveBtn = document.getElementById('solveBtn');
const resetBtn = document.getElementById('resetBtn');

// Stats
const genTimeDisplay = document.getElementById('genTime');
const solveStepsDisplay = document.getElementById('solveSteps');
const pathLengthDisplay = document.getElementById('pathLength');

// Maze State
let mazeSize = 15;
let cellSize;
let maze = [];
let startCell = { x: 0, y: 0 };
let endCell = { x: 0, y: 0 };
let isGenerating = false;
let isSolving = false;
let animationId = null;

// Colors
const COLORS = {
    wall: '#1a1a2e',
    path: '#16213e',
    start: '#00ff88',
    end: '#ff006e',
    visited: '#0f3460',
    solution: '#ffd700',
    grid: '#0a0a1a'
};

// Initialize
function init() {
    resizeCanvas();
    generateMaze();
}

// Resize canvas based on container
function resizeCanvas() {
    const container = canvas.parentElement;
    const size = Math.min(container.clientWidth - 40, 600);
    canvas.width = size;
    canvas.height = size;
    cellSize = size / mazeSize;
}

// Set up event listeners
generateBtn.addEventListener('click', generateMaze);
solveBtn.addEventListener('click', solveMaze);
resetBtn.addEventListener('click', resetMaze);
mazeSizeSelect.addEventListener('change', () => {
    mazeSize = parseInt(mazeSizeSelect.value);
    resetMaze();
});

// Generate Maze
async function generateMaze() {
    if (isGenerating || isSolving) return;
    
    isGenerating = true;
    generateBtn.disabled = true;
    solveBtn.disabled = true;
    
    // Reset stats
    genTimeDisplay.textContent = '-';
    solveStepsDisplay.textContent = '-';
    pathLengthDisplay.textContent = '-';
    
    const startTime = performance.now();
    
    // Initialize maze with walls
    maze = [];
    for (let y = 0; y < mazeSize; y++) {
        maze[y] = [];
        for (let x = 0; x < mazeSize; x++) {
            maze[y][x] = {
                x, y,
                walls: { top: true, right: true, bottom: true, left: true },
                visited: false,
                isPath: false
            };
        }
    }
    
    const algorithm = genAlgorithmSelect.value;
    
    // Generate maze based on selected algorithm
    switch (algorithm) {
        case 'recursive':
            await recursiveBacktracking();
            break;
        case 'prim':
            await primAlgorithm();
            break;
        case 'kruskal':
            await kruskalAlgorithm();
            break;
    }
    
    const endTime = performance.now();
    genTimeDisplay.textContent = `${(endTime - startTime).toFixed(2)}ms`;
    
    // Set start and end points
    startCell = { x: 0, y: 0 };
    endCell = { x: mazeSize - 1, y: mazeSize - 1 };
    
    drawMaze();
    
    isGenerating = false;
    generateBtn.disabled = false;
    solveBtn.disabled = false;
}

// Recursive Backtracking Algorithm
async function recursiveBacktracking() {
    const stack = [];
    const startX = Math.floor(Math.random() * mazeSize);
    const startY = Math.floor(Math.random() * mazeSize);
    let current = maze[startY][startX];
    current.visited = true;
    stack.push(current);
    
    while (stack.length > 0) {
        current = stack[stack.length - 1];
        const neighbors = getUnvisitedNeighbors(current);
        
        if (neighbors.length > 0) {
            const next = neighbors[Math.floor(Math.random() * neighbors.length)];
            removeWalls(current, next);
            next.visited = true;
            stack.push(next);
            
            // Animation
            drawMaze();
            await sleep(getSpeed());
        } else {
            stack.pop();
        }
    }
}

// Prim's Algorithm
async function primAlgorithm() {
    // Start from random cell
    const startX = Math.floor(Math.random() * mazeSize);
    const startY = Math.floor(Math.random() * mazeSize);
    const start = maze[startY][startX];
    start.visited = true;
    
    const walls = [];
    
    // Add walls of start cell to wall list
    addPrimWalls(start, walls);
    
    while (walls.length > 0) {
        // Pick random wall
        const wallIndex = Math.floor(Math.random() * walls.length);
        const wall = walls[wallIndex];
        walls.splice(wallIndex, 1);
        
        const cell1 = maze[wall.from.y][wall.from.x];
        const cell2 = maze[wall.to.y][wall.to.x];
        
        if (!cell2.visited) {
            // Remove wall between cells
            removeWalls(cell1, cell2);
            cell2.visited = true;
            
            // Add walls of new cell
            addPrimWalls(cell2, walls);
            
            // Animation
            drawMaze();
            await sleep(getSpeed());
        }
    }
}

function addPrimWalls(cell, walls) {
    const directions = [
        { dx: 0, dy: -1, wall: 'top' },
        { dx: 1, dy: 0, wall: 'right' },
        { dx: 0, dy: 1, wall: 'bottom' },
        { dx: -1, dy: 0, wall: 'left' }
    ];
    
    for (const dir of directions) {
        const nx = cell.x + dir.dx;
        const ny = cell.y + dir.dy;
        
        if (nx >= 0 && nx < mazeSize && ny >= 0 && ny < mazeSize && !maze[ny][nx].visited) {
            walls.push({
                from: { x: cell.x, y: cell.y },
                to: { x: nx, y: ny },
                wall: dir.wall
            });
        }
    }
}

// Kruskal's Algorithm
async function kruskalAlgorithm() {
    // Initialize disjoint set
    const parent = [];
    const rank = [];
    
    for (let y = 0; y < mazeSize; y++) {
        parent[y] = [];
        rank[y] = [];
        for (let x = 0; x < mazeSize; x++) {
            parent[y][x] = { x, y };
            rank[y][x] = 0;
        }
    }
    
    function find(x, y) {
        if (parent[y][x].x !== x || parent[y][x].y !== y) {
            parent[y][x] = find(parent[y][x].x, parent[y][x].y);
        }
        return parent[y][x];
    }
    
    function union(x1, y1, x2, y2) {
        const root1 = find(x1, y1);
        const root2 = find(x2, y2);
        
        if (root1.x !== root2.x || root1.y !== root2.y) {
            if (rank[root1.y][root1.x] < rank[root2.y][root2.x]) {
                parent[root1.y][root1.x] = root2;
            } else if (rank[root1.y][root1.x] > rank[root2.y][root2.x]) {
                parent[root2.y][root2.x] = root1;
            } else {
                parent[root2.y][root2.x] = root1;
                rank[root1.y][root1.x]++;
            }
            return true;
        }
        return false;
    }
    
    // Create list of all edges
    const edges = [];
    for (let y = 0; y < mazeSize; y++) {
        for (let x = 0; x < mazeSize; x++) {
            if (x < mazeSize - 1) {
                edges.push({ from: { x, y }, to: { x: x + 1, y } });
            }
            if (y < mazeSize - 1) {
                edges.push({ from: { x, y }, to: { x, y: y + 1 } });
            }
        }
    }
    
    // Shuffle edges
    for (let i = edges.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [edges[i], edges[j]] = [edges[j], edges[i]];
    }
    
    // Process edges
    for (const edge of edges) {
        if (union(edge.from.x, edge.from.y, edge.to.x, edge.to.y)) {
            const cell1 = maze[edge.from.y][edge.from.x];
            const cell2 = maze[edge.to.y][edge.to.x];
            removeWalls(cell1, cell2);
            cell1.visited = true;
            cell2.visited = true;
            
            // Animation (show every few edges for speed)
            drawMaze();
            await sleep(getSpeed());
        }
    }
}

// Get unvisited neighbors
function getUnvisitedNeighbors(cell) {
    const neighbors = [];
    const directions = [
        { dx: 0, dy: -1, wall: 'top', opposite: 'bottom' },
        { dx: 1, dy: 0, wall: 'right', opposite: 'left' },
        { dx: 0, dy: 1, wall: 'bottom', opposite: 'top' },
        { dx: -1, dy: 0, wall: 'left', opposite: 'right' }
    ];
    
    for (const dir of directions) {
        const nx = cell.x + dir.dx;
        const ny = cell.y + dir.dy;
        
        if (nx >= 0 && nx < mazeSize && ny >= 0 && ny < mazeSize && !maze[ny][nx].visited) {
            neighbors.push(maze[ny][nx]);
        }
    }
    
    return neighbors;
}

// Remove walls between two cells
function removeWalls(cell1, cell2) {
    const dx = cell2.x - cell1.x;
    const dy = cell2.y - cell1.y;
    
    if (dx === 1) {
        cell1.walls.right = false;
        cell2.walls.left = false;
    } else if (dx === -1) {
        cell1.walls.left = false;
        cell2.walls.right = false;
    } else if (dy === 1) {
        cell1.walls.bottom = false;
        cell2.walls.top = false;
    } else if (dy === -1) {
        cell1.walls.top = false;
        cell2.walls.bottom = false;
    }
}

// Solve Maze
async function solveMaze() {
    if (isSolving || isGenerating || maze.length === 0) return;
    
    isSolving = true;
    solveBtn.disabled = true;
    generateBtn.disabled = true;
    
    // Reset visited status for solving
    for (let y = 0; y < mazeSize; y++) {
        for (let x = 0; x < mazeSize; x++) {
            maze[y][x].solved = false;
            maze[y][x].inPath = false;
            maze[y][x].visitedForSolve = false;
        }
    }
    
    const algorithm = solveAlgorithmSelect.value;
    let path = [];
    let visitedCount = 0;
    
    switch (algorithm) {
        case 'bfs':
            path = await bfs();
            break;
        case 'dfs':
            path = await dfs();
            break;
        case 'astar':
            path = await aStar();
            break;
        case 'dijkstra':
            path = await dijkstra();
            break;
    }
    
    visitedCount = countVisited();
    
    if (path.length > 0) {
        // Draw solution path
        for (const cell of path) {
            maze[cell.y][cell.x].inPath = true;
            drawMaze();
            await sleep(getSpeed() * 2);
        }
        
        pathLengthDisplay.textContent = path.length;
    }
    
    solveStepsDisplay.textContent = visitedCount;
    
    isSolving = false;
    solveBtn.disabled = false;
    generateBtn.disabled = false;
}

// BFS Algorithm
async function bfs() {
    const queue = [startCell];
    const visited = new Set();
    const parent = new Map();
    
    visited.add(`${startCell.x},${startCell.y}`);
    maze[startCell.y][startCell.x].visitedForSolve = true;
    
    while (queue.length > 0) {
        const current = queue.shift();
        
        if (current.x === endCell.x && current.y === endCell.y) {
            return reconstructPath(parent, current);
        }
        
        const neighbors = getValidNeighbors(current);
        
        for (const neighbor of neighbors) {
            const key = `${neighbor.x},${neighbor.y}`;
            
            if (!visited.has(key)) {
                visited.add(key);
                parent.set(key, current);
                queue.push(neighbor);
                maze[neighbor.y][neighbor.x].visitedForSolve = true;
                
                drawMaze();
                await sleep(getSpeed());
            }
        }
    }
    
    return [];
}

// DFS Algorithm
async function dfs() {
    const stack = [startCell];
    const visited = new Set();
    const parent = new Map();
    
    visited.add(`${startCell.x},${startCell.y}`);
    maze[startCell.y][startCell.x].visitedForSolve = true;
    
    while (stack.length > 0) {
        const current = stack.pop();
        
        if (current.x === endCell.x && current.y === endCell.y) {
            return reconstructPath(parent, current);
        }
        
        const neighbors = getValidNeighbors(current);
        
        for (const neighbor of neighbors) {
            const key = `${neighbor.x},${neighbor.y}`;
            
            if (!visited.has(key)) {
                visited.add(key);
                parent.set(key, current);
                stack.push(neighbor);
                maze[neighbor.y][neighbor.x].visitedForSolve = true;
                
                drawMaze();
                await sleep(getSpeed());
            }
        }
    }
    
    return [];
}

// A* Algorithm
async function aStar() {
    const openSet = [startCell];
    const closedSet = new Set();
    const gScore = new Map();
    const fScore = new Map();
    const parent = new Map();
    
    const startKey = `${startCell.x},${startCell.y}`;
    gScore.set(startKey, 0);
    fScore.set(startKey, heuristic(startCell, endCell));
    
    maze[startCell.y][startCell.x].visitedForSolve = true;
    
    while (openSet.length > 0) {
        // Get node with lowest fScore
        openSet.sort((a, b) => {
            const fA = fScore.get(`${a.x},${a.y}`) || Infinity;
            const fB = fScore.get(`${b.x},${b.y}`) || Infinity;
            return fA - fB;
        });
        
        const current = openSet.shift();
        
        if (current.x === endCell.x && current.y === endCell.y) {
            return reconstructPath(parent, current);
        }
        
        closedSet.add(`${current.x},${current.y}`);
        
        const neighbors = getValidNeighbors(current);
        
        for (const neighbor of neighbors) {
            const neighborKey = `${neighbor.x},${neighbor.y}`;
            
            if (closedSet.has(neighborKey)) continue;
            
            const tentativeG = (gScore.get(`${current.x},${current.y}`) || 0) + 1;
            
            if (!openSet.find(n => n.x === neighbor.x && n.y === neighbor.y)) {
                openSet.push(neighbor);
            } else if (tentativeG >= (gScore.get(neighborKey) || Infinity)) {
                continue;
            }
            
            parent.set(neighborKey, current);
            gScore.set(neighborKey, tentativeG);
            fScore.set(neighborKey, tentativeG + heuristic(neighbor, endCell));
            
            maze[neighbor.y][neighbor.x].visitedForSolve = true;
            
            drawMaze();
            await sleep(getSpeed());
        }
    }
    
    return [];
}

// Dijkstra's Algorithm
async function dijkstra() {
    const distances = new Map();
    const parent = new Map();
    const visited = new Set();
    const pq = [{ cell: startCell, dist: 0 }];
    
    distances.set(`${startCell.x},${startCell.y}`, 0);
    maze[startCell.y][startCell.x].visitedForSolve = true;
    
    while (pq.length > 0) {
        // Get node with smallest distance
        pq.sort((a, b) => a.dist - b.dist);
        const { cell: current, dist: currentDist } = pq.shift();
        
        const currentKey = `${current.x},${current.y}`;
        
        if (visited.has(currentKey)) continue;
        visited.add(currentKey);
        
        if (current.x === endCell.x && current.y === endCell.y) {
            return reconstructPath(parent, current);
        }
        
        const neighbors = getValidNeighbors(current);
        
        for (const neighbor of neighbors) {
            const neighborKey = `${neighbor.x},${neighbor.y}`;
            
            if (visited.has(neighborKey)) continue;
            
            const newDist = currentDist + 1;
            const oldDist = distances.get(neighborKey);
            
            if (oldDist === undefined || newDist < oldDist) {
                distances.set(neighborKey, newDist);
                parent.set(neighborKey, current);
                pq.push({ cell: neighbor, dist: newDist });
                
                maze[neighbor.y][neighbor.x].visitedForSolve = true;
                
                drawMaze();
                await sleep(getSpeed());
            }
        }
    }
    
    return [];
}

// Heuristic for A* (Manhattan distance)
function heuristic(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

// Get valid neighbors (not blocked by walls)
function getValidNeighbors(cell) {
    const neighbors = [];
    const current = maze[cell.y][cell.x];
    
    if (!current.walls.top && cell.y > 0) {
        neighbors.push({ x: cell.x, y: cell.y - 1 });
    }
    if (!current.walls.right && cell.x < mazeSize - 1) {
        neighbors.push({ x: cell.x + 1, y: cell.y });
    }
    if (!current.walls.bottom && cell.y < mazeSize - 1) {
        neighbors.push({ x: cell.x, y: cell.y + 1 });
    }
    if (!current.walls.left && cell.x > 0) {
        neighbors.push({ x: cell.x - 1, y: cell.y });
    }
    
    return neighbors;
}

// Reconstruct path from parent map
function reconstructPath(parent, end) {
    const path = [];
    let current = end;
    
    while (current) {
        path.unshift(current);
        const key = `${current.x},${current.y}`;
        current = parent.get(key);
    }
    
    return path;
}

// Count visited cells
function countVisited() {
    let count = 0;
    for (let y = 0; y < mazeSize; y++) {
        for (let x = 0; x < mazeSize; x++) {
            if (maze[y][x].visitedForSolve) count++;
        }
    }
    return count;
}

// Draw Maze
function drawMaze() {
    // Clear canvas
    ctx.fillStyle = COLORS.grid;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (maze.length === 0) return;
    
    // Draw cells
    for (let y = 0; y < mazeSize; y++) {
        for (let x = 0; x < mazeSize; x++) {
            drawCell(maze[y][x]);
        }
    }
}

// Draw single cell
function drawCell(cell) {
    const x = cell.x * cellSize;
    const y = cell.y * cellSize;
    
    // Determine cell color
    let color = COLORS.path;
    if (cell.x === startCell.x && cell.y === startCell.y) {
        color = COLORS.start;
    } else if (cell.x === endCell.x && cell.y === endCell.y) {
        color = COLORS.end;
    } else if (cell.inPath) {
        color = COLORS.solution;
    } else if (cell.visitedForSolve) {
        color = COLORS.visited;
    }
    
    ctx.fillStyle = color;
    ctx.fillRect(x, y, cellSize, cellSize);
    
    // Draw walls
    ctx.strokeStyle = COLORS.wall;
    ctx.lineWidth = 2;
    
    if (cell.walls.top) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + cellSize, y);
        ctx.stroke();
    }
    if (cell.walls.right) {
        ctx.beginPath();
        ctx.moveTo(x + cellSize, y);
        ctx.lineTo(x + cellSize, y + cellSize);
        ctx.stroke();
    }
    if (cell.walls.bottom) {
        ctx.beginPath();
        ctx.moveTo(x, y + cellSize);
        ctx.lineTo(x + cellSize, y + cellSize);
        ctx.stroke();
    }
    if (cell.walls.left) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + cellSize);
        ctx.stroke();
    }
}

// Reset Maze
function resetMaze() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    maze = [];
    isGenerating = false;
    isSolving = false;
    generateBtn.disabled = false;
    solveBtn.disabled = true;
    
    genTimeDisplay.textContent = '-';
    solveStepsDisplay.textContent = '-';
    pathLengthDisplay.textContent = '-';
    
    resizeCanvas();
    
    // Draw empty grid
    ctx.fillStyle = COLORS.grid;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Get animation speed from slider
function getSpeed() {
    return 55 - speedSlider.value;
}

// Sleep function for animation
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Initialize on load
window.addEventListener('load', init);
window.addEventListener('resize', () => {
    resizeCanvas();
    if (maze.length > 0) {
        drawMaze();
    }
});
