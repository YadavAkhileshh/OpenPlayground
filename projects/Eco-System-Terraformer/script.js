const canvas = document.getElementById('simCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 50;
const cellSize = canvas.width / gridSize;

// 0: Empty, 1: Grass, 2: Rabbit, 3: Wolf
let grid = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
let energyGrid = Array(gridSize).fill().map(() => Array(gridSize).fill(0));

let currentTool = 1;
let isPaused = false;
let timeStep = 0;

// Chart Setup
const ctxChart = document.getElementById('popChart').getContext('2d');
const popChart = new Chart(ctxChart, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            { label: 'Grass', borderColor: '#a6e3a1', data: [], fill: false, tension: 0.4, pointRadius: 0 },
            { label: 'Rabbits', borderColor: '#89b4fa', data: [], fill: false, tension: 0.4, pointRadius: 0 },
            { label: 'Wolves', borderColor: '#f38ba8', data: [], fill: false, tension: 0.4, pointRadius: 0 }
        ]
    },
    options: {
        responsive: true,
        animation: false,
        scales: { x: { display: false }, y: { beginAtZero: true } }
    }
});

// UI Controls
document.getElementById('btnGrass').onclick = (e) => setTool(1, e.target);
document.getElementById('btnRabbit').onclick = (e) => setTool(2, e.target);
document.getElementById('btnWolf').onclick = (e) => setTool(3, e.target);
document.getElementById('btnPause').onclick = () => isPaused = !isPaused;

function setTool(tool, btn) {
    currentTool = tool;
    document.querySelectorAll('.controls button').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
}

// Draw on Canvas
canvas.addEventListener('mousedown', handleDraw);
canvas.addEventListener('mousemove', (e) => {
    if (e.buttons === 1) handleDraw(e);
});

function handleDraw(e) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);
    if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
        grid[x][y] = currentTool;
        if (currentTool > 1) energyGrid[x][y] = 10; 
        drawGrid();
    }
}

function getNeighbors(x, y) {
    const neighbors = [];
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;
            const nx = (x + dx + gridSize) % gridSize; // Wraparound grid
            const ny = (y + dy + gridSize) % gridSize;
            neighbors.push({x: nx, y: ny, type: grid[nx][ny]});
        }
    }
    return neighbors;
}

// Core Cellular Automaton Logic
function updateSimulation() {
    if (isPaused) return;

    let newGrid = grid.map(arr => [...arr]);
    let newEnergy = energyGrid.map(arr => [...arr]);
    let stats = { grass: 0, rabbits: 0, wolves: 0 };

    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            const type = grid[x][y];
            if (type === 0) continue;

            const neighbors = getNeighbors(x, y);
            const emptyCells = neighbors.filter(n => newGrid[n.x][n.y] === 0);

            if (type === 1) { // Grass logic
                stats.grass++;
                if (Math.random() < 0.05 && emptyCells.length > 0) {
                    const target = emptyCells[Math.floor(Math.random() * emptyCells.length)];
                    newGrid[target.x][target.y] = 1;
                }
            } else if (type === 2 || type === 3) { // Animal logic
                if (type === 2) stats.rabbits++;
                else stats.wolves++;

                let energy = energyGrid[x][y] - 1;
                const preyType = type === 2 ? 1 : 2; // Rabbits eat grass(1), Wolves eat rabbits(2)
                const preyCells = neighbors.filter(n => grid[n.x][n.y] === preyType);

                if (preyCells.length > 0) {
                    // Eat prey and move
                    const target = preyCells[Math.floor(Math.random() * preyCells.length)];
                    energy += (type === 2 ? 3 : 6); 
                    newGrid[target.x][target.y] = type;
                    newEnergy[target.x][target.y] = energy;
                    
                    // Reproduce if high energy
                    if (energy > 15 && emptyCells.length > 0) { 
                        const spawn = emptyCells[Math.floor(Math.random() * emptyCells.length)];
                        newGrid[spawn.x][spawn.y] = type;
                        newEnergy[spawn.x][spawn.y] = 10;
                        energy -= 10;
                    }
                } else if (emptyCells.length > 0 && energy > 0) {
                    // Move to empty space
                    const target = emptyCells[Math.floor(Math.random() * emptyCells.length)];
                    newGrid[target.x][target.y] = type;
                    newEnergy[target.x][target.y] = energy;
                }
                
                // Clear old position and check starvation
                newGrid[x][y] = 0; 
                if (energy <= 0) newGrid[x][y] = 0; 
            }
        }
    }

    grid = newGrid;
    energyGrid = newEnergy;
    drawGrid();
    updateChart(stats);
}

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            if (grid[x][y] === 1) ctx.fillStyle = '#a6e3a1'; 
            else if (grid[x][y] === 2) ctx.fillStyle = '#89b4fa'; 
            else if (grid[x][y] === 3) ctx.fillStyle = '#f38ba8'; 
            else continue;
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }
}

function updateChart(stats) {
    timeStep++;
    if (timeStep % 3 !== 0) return; // Update chart every 3 frames

    popChart.data.labels.push(timeStep);
    popChart.data.datasets[0].data.push(stats.grass);
    popChart.data.datasets[1].data.push(stats.rabbits);
    popChart.data.datasets[2].data.push(stats.wolves);

    if (popChart.data.labels.length > 50) {
        popChart.data.labels.shift();
        popChart.data.datasets.forEach(d => d.data.shift());
    }
    popChart.update();
}

setInterval(updateSimulation, 150);