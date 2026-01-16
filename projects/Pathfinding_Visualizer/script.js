const gridContainer = document.getElementById('grid-container');
const visualizeBtn = document.getElementById('visualize-btn');
const clearBoardBtn = document.getElementById('clear-board-btn');
const clearPathBtn = document.getElementById('clear-path-btn');
const generateMazeBtn = document.getElementById('generate-maze-btn');
const algoSelect = document.getElementById('algorithm-select');
const speedRange = document.getElementById('speed-range');

// Config
const ROWS = 25; // Adjustable grid size
const COLS = 50;
let grid = [];
let startNode = { row: 10, col: 5 };
let targetNode = { row: 10, col: 44 };
let isMousePressed = false;
let draggedNode = null; // 'start', 'target', or null
let isRunning = false;

// Initialize
function initGrid() {
    gridContainer.style.gridTemplateColumns = `repeat(${COLS}, 25px)`;
    grid = [];
    gridContainer.innerHTML = '';

    for (let r = 0; r < ROWS; r++) {
        const row = [];
        for (let c = 0; c < COLS; c++) {
            const node = {
                row: r,
                col: c,
                isWall: false,
                isVisited: false,
                distance: Infinity,
                totalDistance: Infinity, // For A* (f = g + h)
                heuristic: 0,           // For A* (h)
                previousNode: null,
                element: null
            };

            const div = document.createElement('div');
            div.classList.add('grid-node', 'node');
            div.id = `node-${r}-${c}`;

            // Mouse Events
            div.addEventListener('mousedown', (e) => handleMouseDown(r, c));
            div.addEventListener('mouseenter', (e) => handleMouseEnter(r, c));
            div.addEventListener('mouseup', () => handleMouseUp());

            node.element = div;
            gridContainer.appendChild(div);
            row.push(node);
        }
        grid.push(row);
    }
    updateStartTargetVisuals();
}

// Visual Updates
function updateStartTargetVisuals() {
    // Clear previous start/target classes
    document.querySelectorAll('.node.start').forEach(el => el.classList.remove('start'));
    document.querySelectorAll('.node.target').forEach(el => el.classList.remove('target'));

    const startEl = grid[startNode.row][startNode.col].element;
    const targetEl = grid[targetNode.row][targetNode.col].element;

    startEl.classList.add('start');
    targetEl.classList.add('target');
}

// Interaction Handlers
function handleMouseDown(row, col) {
    if (isRunning) return;

    isMousePressed = true;
    const node = grid[row][col];

    if (row === startNode.row && col === startNode.col) {
        draggedNode = 'start';
    } else if (row === targetNode.row && col === targetNode.col) {
        draggedNode = 'target';
    } else {
        // Toggle wall
        toggleWall(node);
    }
}

function handleMouseEnter(row, col) {
    if (!isMousePressed || isRunning) return;

    if (draggedNode === 'start') {
        const prevStart = grid[startNode.row][startNode.col];
        // Don't overwrite target or wall (visual check logic could be stricter)
        if (row !== targetNode.row || col !== targetNode.col) {
            startNode = { row, col };
            updateStartTargetVisuals();
        }
    } else if (draggedNode === 'target') {
        if (row !== startNode.row || col !== startNode.col) {
            targetNode = { row, col };
            updateStartTargetVisuals();
        }
    } else {
        toggleWall(grid[row][col]);
    }
}

function handleMouseUp() {
    isMousePressed = false;
    draggedNode = null;
}

function toggleWall(node) {
    // Don't make start or target a wall
    if ((node.row === startNode.row && node.col === startNode.col) ||
        (node.row === targetNode.row && node.col === targetNode.col)) {
        return;
    }
    node.isWall = !node.isWall;
    if (node.isWall) {
        node.element.classList.add('wall');
        node.element.classList.remove('visited', 'path'); // Wall overrides visited
    } else {
        node.element.classList.remove('wall');
    }
}

// Reset functions
function clearBoard() {
    isRunning = false; // Force stop any running animation
    grid.forEach(row => row.forEach(node => {
        node.isWall = false;
        node.element.classList.remove('wall', 'visited', 'path', 'start', 'target');
    }));
    // Re-add start/target visuals since we wiped classes
    updateStartTargetVisuals();
    clearPath();
}

function clearPath() {
    // If we just want to clear path but keep walls, we don't necessarily need to stop running
    // but usually user clicks this to reset.
    // Let's NOT force stop here if strictly clearing path, 
    // BUT for stability let's allow it to reset state if used manually.
    // If called internally by visualize(), isRunning is true.
    // So we need to distinct internal vs external call.
    // For simplicity, let's keep internal clearPath mostly pure state reset.

    grid.forEach(row => row.forEach(node => {
        node.isVisited = false;
        node.distance = Infinity;
        node.totalDistance = Infinity;
        node.previousNode = null;
        node.element.classList.remove('visited', 'path');
    }));
}

// Wrapper for the button specifically
function handleClearPath() {
    isRunning = false;
    clearPath();
}

function generateRandomMaze() {
    isRunning = false; // Force stop
    clearBoard();
    const density = 0.3; // 30% walls
    grid.forEach(row => row.forEach(node => {
        // Skip start and target
        if ((node.row === startNode.row && node.col === startNode.col) ||
            (node.row === targetNode.row && node.col === targetNode.col)) return;

        if (Math.random() < density) {
            node.isWall = true;
            node.element.classList.add('wall');
        }
    }));
}

// Algorithms
async function visualize() {
    if (isRunning) return;
    isRunning = true;
    clearPath();

    const algorithm = algoSelect.value;
    const start = grid[startNode.row][startNode.col];
    const target = grid[targetNode.row][targetNode.col];

    let visitedNodesInOrder = [];

    if (algorithm === 'dijkstra') {
        visitedNodesInOrder = dijkstra(grid, start, target);
    } else if (algorithm === 'astar') {
        visitedNodesInOrder = aStar(grid, start, target);
    } else if (algorithm === 'bfs') {
        visitedNodesInOrder = bfs(grid, start, target);
    } else if (algorithm === 'dfs') {
        visitedNodesInOrder = dfs(grid, start, target);
    }

    await animateAlgorithm(visitedNodesInOrder, target);
    isRunning = false;
}

// Dijkstra's Algorithm
function dijkstra(grid, startNode, finishNode) {
    const visitedNodesInOrder = [];
    startNode.distance = 0;
    const unvisitedNodes = getAllNodes(grid);

    while (unvisitedNodes.length) {
        sortNodesByDistance(unvisitedNodes);
        const closestNode = unvisitedNodes.shift();

        // If we hit a wall, skip
        if (closestNode.isWall) continue;
        // If the closest node is at a distance of infinity, we're trapped
        if (closestNode.distance === Infinity) return visitedNodesInOrder;

        closestNode.isVisited = true;
        visitedNodesInOrder.push(closestNode);

        if (closestNode === finishNode) return visitedNodesInOrder;

        updateUnvisitedNeighbors(closestNode, grid);
    }
    return visitedNodesInOrder;
}

// A* Algorithm
function aStar(grid, startNode, finishNode) {
    const visitedNodesInOrder = [];
    startNode.distance = 0; // g-score
    startNode.totalDistance = 0; // f-score

    // Simple priority queue (array)
    let openSet = [startNode];

    while (openSet.length > 0) {
        // Find node with lowest f-score
        sortNodesByTotalDistance(openSet);
        let currentNode = openSet.shift();

        // If closed (already visited), skip
        if (currentNode.isVisited) continue;
        if (currentNode.isWall) continue;

        currentNode.isVisited = true;
        visitedNodesInOrder.push(currentNode);

        if (currentNode === finishNode) return visitedNodesInOrder;

        const neighbors = getUnvisitedNeighbors(currentNode, grid);
        for (const neighbor of neighbors) {
            if (neighbor.isWall || neighbor.isVisited) continue;

            let tempG = currentNode.distance + 1; // Assuming weight 1
            if (tempG < neighbor.distance) {
                neighbor.previousNode = currentNode;
                neighbor.distance = tempG;
                // Manhattan Distance Heuristic
                neighbor.heuristic = Math.abs(neighbor.row - finishNode.row) + Math.abs(neighbor.col - finishNode.col);
                neighbor.totalDistance = neighbor.distance + neighbor.heuristic;

                if (!openSet.includes(neighbor)) {
                    openSet.push(neighbor);
                }
            }
        }
    }
    return visitedNodesInOrder;
}

// BFS
function bfs(grid, startNode, finishNode) {
    const visitedNodesInOrder = [];
    const queue = [startNode];
    startNode.isVisited = true;
    startNode.distance = 0;

    while (queue.length) {
        const currentNode = queue.shift();
        if (currentNode.isWall) continue;

        visitedNodesInOrder.push(currentNode);
        if (currentNode === finishNode) return visitedNodesInOrder;

        const neighbors = getUnvisitedNeighbors(currentNode, grid);
        for (const neighbor of neighbors) {
            if (!neighbor.isVisited && !neighbor.isWall) {
                neighbor.isVisited = true;
                neighbor.previousNode = currentNode;
                neighbor.distance = currentNode.distance + 1;
                queue.push(neighbor);
            }
        }
    }
    return visitedNodesInOrder;
}

// DFS
function dfs(grid, startNode, finishNode) {
    const visitedNodesInOrder = [];
    const stack = [startNode];
    // Reset visited for DFS specifically or reuse generic
    // Note: DFS is tricky with 'isVisited' if you want to allow backtracking, 
    // but for simple visualization, standard stack DFS works.

    while (stack.length) {
        const currentNode = stack.pop();
        if (currentNode.isVisited) continue; // Skip if visited
        if (currentNode.isWall) continue;

        currentNode.isVisited = true;
        visitedNodesInOrder.push(currentNode);

        if (currentNode === finishNode) return visitedNodesInOrder;

        const neighbors = getUnvisitedNeighbors(currentNode, grid);
        for (const neighbor of neighbors) {
            if (!neighbor.isVisited && !neighbor.isWall) {
                neighbor.previousNode = currentNode;
                stack.push(neighbor);
            }
        }
    }
    return visitedNodesInOrder;
}


// Helpers
function getAllNodes(grid) {
    const nodes = [];
    for (const row of grid) {
        for (const node of row) {
            nodes.push(node);
        }
    }
    return nodes;
}

function sortNodesByDistance(unvisitedNodes) {
    unvisitedNodes.sort((nodeA, nodeB) => nodeA.distance - nodeB.distance);
}

function sortNodesByTotalDistance(nodes) {
    nodes.sort((nodeA, nodeB) => nodeA.totalDistance - nodeB.totalDistance);
}

function getUnvisitedNeighbors(node, grid) {
    const neighbors = [];
    const { col, row } = node;
    if (row > 0) neighbors.push(grid[row - 1][col]);
    if (row < ROWS - 1) neighbors.push(grid[row + 1][col]);
    if (col > 0) neighbors.push(grid[row][col - 1]);
    if (col < COLS - 1) neighbors.push(grid[row][col + 1]);
    return neighbors.filter(neighbor => !neighbor.isVisited); // For BFS/Dijkstra logic
}

function updateUnvisitedNeighbors(node, grid) {
    const neighbors = getUnvisitedNeighbors(node, grid);
    for (const neighbor of neighbors) {
        neighbor.distance = node.distance + 1;
        neighbor.previousNode = node;
    }
}

function getNodesInShortestPathOrder(finishNode) {
    const nodesInShortestPathOrder = [];
    let currentNode = finishNode;
    while (currentNode !== null) {
        nodesInShortestPathOrder.unshift(currentNode);
        currentNode = currentNode.previousNode;
    }
    return nodesInShortestPathOrder;
}

// Animation
function animateAlgorithm(visitedNodesInOrder, finishNode) {
    return new Promise((resolve) => {
        const speedValue = parseInt(speedRange.value);
        // Speed Mapping:
        // Low value (1) -> Slow animation (1 node per few frames)
        // High value (100) -> Fast animation (multiple nodes per frame)

        let nodesPerFrame = 1;
        // let frameInterval = 1; // This variable is no longer used

        if (speedValue > 90) { nodesPerFrame = 20; }
        else if (speedValue > 70) { nodesPerFrame = 10; }
        else if (speedValue > 50) { nodesPerFrame = 5; }
        else if (speedValue > 30) { nodesPerFrame = 2; }

        // Invert for interval (lower speed val = higher interval)
        // For very slow speeds, we add delay between frames

        let i = 0;

        function step() {
            if (!isRunning) {
                resolve();
                return;
            }

            // Process a batch of nodes
            for (let j = 0; j < nodesPerFrame; j++) {
                if (i >= visitedNodesInOrder.length) {
                    animateShortestPath(getNodesInShortestPathOrder(finishNode)).then(resolve);
                    return;
                }

                const node = visitedNodesInOrder[i];
                if (!node.isWall) {
                    const isStart = (node.row === startNode.row && node.col === startNode.col);
                    const isTarget = (node.row === targetNode.row && node.col === targetNode.col);

                    if (!isStart && !isTarget) {
                        node.element.classList.add('visited');
                    }
                }
                i++;
            }

            // Loop
            if (speedValue < 30) {
                setTimeout(() => requestAnimationFrame(step), (30 - speedValue) * 2);
            } else {
                requestAnimationFrame(step);
            }
        }

        step();
    });
}

function animateShortestPath(nodesInShortestPathOrder) {
    return new Promise((resolve) => {
        let i = 0;
        function step() {
            if (!isRunning) {
                resolve();
                return;
            }

            // Path is usually shorter, so we can animate slightly faster or 1 by 1
            // Let's do 1 per frame for nice effect

            if (i >= nodesInShortestPathOrder.length) {
                resolve(); // Animation completely done
                return;
            }

            const node = nodesInShortestPathOrder[i];
            const isStart = (node.row === startNode.row && node.col === startNode.col);
            const isTarget = (node.row === targetNode.row && node.col === targetNode.col);

            if (!isStart && !isTarget) {
                node.element.classList.remove('visited');
                node.element.classList.add('path');
            }
            i++;
            requestAnimationFrame(step);
        }
        step();
    });
}

// Bind Events
visualizeBtn.addEventListener('click', visualize);
clearBoardBtn.addEventListener('click', clearBoard);
clearPathBtn.addEventListener('click', handleClearPath);
generateMazeBtn.addEventListener('click', generateRandomMaze);
window.onload = initGrid;
window.addEventListener('mouseup', handleMouseUp); // Global mouse up
