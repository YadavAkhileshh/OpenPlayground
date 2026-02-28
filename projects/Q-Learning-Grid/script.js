/**
 * Q-Learning Grid Engine
 * Implements Reinforcement Learning (Q-Learning)
 */

const canvas = document.getElementById('grid-canvas');
const ctx = canvas.getContext('2d');

// --- Configuration ---
const COLS = 10;
const ROWS = 10;
let TILE_SIZE = 50;

// Hyperparameters
const ALPHA = 0.1; // Learning Rate
const GAMMA = 0.9; // Discount Factor
let EPSILON = 1.0; // Exploration Rate
const EPSILON_DECAY = 0.995;
const MIN_EPSILON = 0.01;

// Rewards
const R_GOAL = 100;
const R_FIRE = -100;
const R_STEP = -1;

// --- State ---
let qTable = []; // 3D Array [col][row][action]
let grid = []; // 2D Array (0: Empty, 1: Wall, 2: Start, 3: Goal, 4: Fire)
let agent = { x: 0, y: 0 };
let startPos = { x: 0, y: 0 };
let episode = 0;
let isTraining = false;
let animationId;
let speed = 5;

// Actions: 0: Up, 1: Right, 2: Down, 3: Left
const ACTIONS = [
    { dx: 0, dy: -1 }, // Up
    { dx: 1, dy: 0 },  // Right
    { dx: 0, dy: 1 },  // Down
    { dx: -1, dy: 0 }  // Left
];

// --- Maps ---
const MAPS = {
    easy: [
        [2,0,0,0,0,0,0,0,0,0],
        [0,1,1,1,0,1,1,1,1,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,1,1,1,4,1,1,1,1,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,1,1,1,1,1,1,1,1,0],
        [0,0,0,0,0,4,0,0,0,0],
        [0,1,1,1,1,1,1,1,1,0],
        [0,0,0,0,0,0,0,0,0,3]
    ],
    medium: [
        [2,0,0,4,0,0,0,0,0,0],
        [0,1,1,1,0,1,1,1,1,0],
        [0,0,4,0,0,0,4,0,0,0],
        [0,1,1,1,1,1,1,0,1,1],
        [0,0,0,0,0,0,0,0,0,0],
        [1,1,0,1,1,1,1,1,1,0],
        [0,0,0,4,0,0,0,0,4,0],
        [0,1,1,1,1,1,0,1,1,1],
        [0,0,0,0,0,0,0,0,0,3]
    ],
    hard: [
        [2,0,0,4,0,4,0,0,0,0],
        [0,1,1,1,0,1,1,1,1,0],
        [0,0,4,0,0,0,4,0,4,0],
        [0,1,1,1,4,1,1,0,1,1],
        [0,0,0,0,0,0,0,0,0,0],
        [1,1,0,1,1,1,1,4,1,0],
        [0,4,0,4,0,0,0,0,4,0],
        [0,1,1,1,1,1,0,1,1,1],
        [0,0,0,0,0,0,0,0,0,3]
    ]
};

// --- Initialization ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // UI Events
    document.getElementById('btn-reset').onclick = resetSimulation;
    document.getElementById('btn-train').onclick = toggleTraining;
    document.getElementById('map-select').onchange = (e) => loadMap(e.target.value);
    document.getElementById('speed-slider').oninput = (e) => speed = parseInt(e.target.value);
    
    loadMap('medium');
    loop();
}

function resizeCanvas() {
    const size = Math.min(document.querySelector('.viz-area').clientWidth - 40, 600);
    canvas.width = size;
    canvas.height = size;
    TILE_SIZE = size / COLS;
}

function loadMap(difficulty) {
    // Pad or trim map to 10x10 if needed, here we assume maps are correct
    let rawMap = MAPS[difficulty];
    grid = [];
    
    // Deep copy and normalize
    for(let r=0; r<ROWS; r++) {
        let row = [];
        for(let c=0; c<COLS; c++) {
            let val = (rawMap[r] && rawMap[r][c] !== undefined) ? rawMap[r][c] : 0;
            row.push(val);
            if(val === 2) startPos = {x: c, y: r};
        }
        grid.push(row);
    }
    
    resetQTable();
    resetAgent();
}

function resetQTable() {
    qTable = [];
    for(let c=0; c<COLS; c++) {
        qTable[c] = [];
        for(let r=0; r<ROWS; r++) {
            // 4 Actions initialized to 0
            qTable[c][r] = [0, 0, 0, 0];
        }
    }
    episode = 0;
    EPSILON = 1.0;
    updateStats(0);
}

function resetAgent() {
    agent = { ...startPos };
}

function resetSimulation() {
    isTraining = false;
    document.getElementById('btn-train').innerText = "Train (Fast)";
    loadMap(document.getElementById('map-select').value);
}

function toggleTraining() {
    isTraining = !isTraining;
    document.getElementById('btn-train').innerText = isTraining ? "Pause" : "Train (Fast)";
}


// --- Q-Learning Logic ---

function chooseAction() {
    // Exploration
    if (Math.random() < EPSILON) {
        return Math.floor(Math.random() * 4);
    }
    // Exploitation (ArgMax)
    let actions = qTable[agent.x][agent.y];
    let maxVal = Math.max(...actions);
    // If multiple max values, pick random among them
    let bestActions = [];
    actions.forEach((val, idx) => {
        if(val === maxVal) bestActions.push(idx);
    });
    return bestActions[Math.floor(Math.random() * bestActions.length)];
}

function step(action) {
    const move = ACTIONS[action];
    let nx = agent.x + move.dx;
    let ny = agent.y + move.dy;
    
    let reward = R_STEP;
    let done = false;

    // Bounds & Wall check
    if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS || grid[ny][nx] === 1) {
        // Hit wall/bound: stay in place
        nx = agent.x;
        ny = agent.y;
        // Optional: extra penalty for hitting wall?
    } else if (grid[ny][nx] === 3) { // Goal
        reward = R_GOAL;
        done = true;
    } else if (grid[ny][nx] === 4) { // Fire
        reward = R_FIRE;
        done = true;
    }

    // Bellman Update
    // Q(s,a) = Q(s,a) + alpha * [R + gamma * max(Q(s', a')) - Q(s,a)]
    let currentQ = qTable[agent.x][agent.y][action];
    let maxNextQ = Math.max(...qTable[nx][ny]);
    let newQ = currentQ + ALPHA * (reward + GAMMA * maxNextQ - currentQ);
    
    qTable[agent.x][agent.y][action] = newQ;

    agent.x = nx;
    agent.y = ny;

    return { reward, done };
}

function runEpisodeStep() {
    const action = chooseAction();
    const { reward, done } = step(action);

    if (done) {
        episode++;
        if(EPSILON > MIN_EPSILON) EPSILON *= EPSILON_DECAY;
        updateStats(reward);
        resetAgent();
    }
}

function updateStats(lastReward) {
    document.getElementById('ep-count').innerText = episode;
    document.getElementById('epsilon-val').innerText = EPSILON.toFixed(3);
    document.getElementById('reward-val').innerText = lastReward;
}

// --- Rendering ---

function loop() {
    // If training, run multiple steps per frame based on speed
    if (isTraining) {
        for(let i=0; i<speed; i++) runEpisodeStep();
    }

    draw();
    animationId = requestAnimationFrame(loop);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const showHeatmap = document.getElementById('toggle-heatmap').checked;

    for(let r=0; r<ROWS; r++) {
        for(let c=0; c<COLS; c++) {
            const x = c * TILE_SIZE;
            const y = r * TILE_SIZE;
            const type = grid[r][c];

            // Base Tile
            ctx.fillStyle = '#fff';
            
            // Heatmap logic
            if (showHeatmap && type !== 1) {
                const maxQ = Math.max(...qTable[c][r]);
                // Map Q value to color
                // Goal is around 100, Fire is around -100
                if (maxQ > 0) {
                    const intensity = Math.min(maxQ / 100, 1);
                    ctx.fillStyle = `rgba(34, 197, 94, ${intensity * 0.5})`; // Green tint
                } else if (maxQ < 0) {
                    const intensity = Math.min(Math.abs(maxQ) / 100, 1);
                    ctx.fillStyle = `rgba(239, 68, 68, ${intensity * 0.5})`; // Red tint
                }
            }
            
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = '#e2e8f0';
            ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);

            // Draw Items 
            if (type === 1) { // Wall
                ctx.fillStyle = '#1e293b';
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            } else if (type === 2) { // Start
                ctx.fillStyle = '#3b82f6';
                ctx.fillRect(x+10, y+10, TILE_SIZE-20, TILE_SIZE-20);
            } else if (type === 3) { // Goal
                ctx.fillStyle = '#22c55e';
                ctx.fillRect(x+10, y+10, TILE_SIZE-20, TILE_SIZE-20);
            } else if (type === 4) { // Fire
                ctx.fillStyle = '#ef4444';
                drawFire(x, y);
            }
        }
    }

    // Draw Agent
    const ax = agent.x * TILE_SIZE + TILE_SIZE/2;
    const ay = agent.y * TILE_SIZE + TILE_SIZE/2;
    
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(ax, ay, TILE_SIZE/3, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.lineWidth = 1;
}

function drawFire(x, y) {
    ctx.beginPath();
    const pad = TILE_SIZE * 0.2;
    const size = TILE_SIZE - pad*2;
    ctx.moveTo(x + pad + size/2, y + pad);
    ctx.lineTo(x + pad + size, y + pad + size);
    ctx.lineTo(x + pad, y + pad + size);
    ctx.fill();
}

// Start
init();