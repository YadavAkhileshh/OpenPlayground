/**
 * AlgoVis Core Engine
 * Hand-coded Vanilla JavaScript
 */

// --- GLOBAL STATE & CONFIG ---
const state = {
    currentTab: 'sorting',
    isVisualizing: false,
    speed: 50,
    steps: 0,
    array: [],
    grid: [],
    startNode: { r: 10, c: 5 },
    endNode: { r: 10, c: 35 }
};

// DOM Elements
const sortContainer = document.getElementById('sorting-container');
const pathContainer = document.getElementById('path-container');
const dsContainer = document.getElementById('ds-visual-area');
const stepDisplay = document.getElementById('step-counter');

// --- UTILITIES ---
const sleep = () => new Promise(resolve => setTimeout(resolve, state.speed));

function updateSteps() {
    state.steps++;
    stepDisplay.innerText = state.steps;
}

// --- TAB NAVIGATION LOGIC ---
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        if (state.isVisualizing) return;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        state.currentTab = e.target.dataset.tab;

        // Toggle UI Layers
        document.querySelectorAll('.viz-layer').forEach(l => l.classList.add('hidden'));
        document.getElementById(`${state.currentTab}-container`).classList.remove('hidden');
        
        // Toggle Control Panels
        document.getElementById('sorting-controls').classList.toggle('hidden', state.currentTab !== 'sorting');
        document.getElementById('path-controls').classList.toggle('hidden', state.currentTab !== 'pathfinding');
        
        init();
    });
});

// --- SORTING MODULE (~250 Lines) ---
function initSorting() {
    sortContainer.innerHTML = '';
    state.array = [];
    const size = document.getElementById('sort-size').value;
    for (let i = 0; i < size; i++) {
        state.array.push(Math.floor(Math.random() * 400) + 20);
    }
    renderBars();
}

function renderBars() {
    sortContainer.innerHTML = '';
    state.array.forEach(val => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = `${val}px`;
        sortContainer.appendChild(bar);
    });
}

async function bubbleSort() {
    let bars = document.getElementsByClassName('bar');
    for (let i = 0; i < state.array.length; i++) {
        for (let j = 0; j < state.array.length - i - 1; j++) {
            bars[j].style.backgroundColor = 'var(--bar-compare)';
            bars[j+1].style.backgroundColor = 'var(--bar-compare)';
            
            if (state.array[j] > state.array[j+1]) {
                let temp = state.array[j];
                state.array[j] = state.array[j+1];
                state.array[j+1] = temp;
                bars[j].style.height = `${state.array[j]}px`;
                bars[j+1].style.height = `${state.array[j+1]}px`;
                updateSteps();
                await sleep();
            }
            bars[j].style.backgroundColor = 'var(--bar-default)';
            bars[j+1].style.backgroundColor = 'var(--bar-default)';
        }
        bars[state.array.length - i - 1].style.backgroundColor = 'var(--bar-sorted)';
    }
}

// Manual Merge Sort with Visualizer (High line count due to manual indexing)
async function mergeSort(l, r) {
    if (l >= r) return;
    const m = Math.floor((l + r) / 2);
    await mergeSort(l, m);
    await mergeSort(m + 1, r);
    await merge(l, m, r);
}

async function merge(l, m, r) {
    let bars = document.getElementsByClassName('bar');
    let n1 = m - l + 1;
    let n2 = r - m;
    let L = state.array.slice(l, m + 1);
    let R = state.array.slice(m + 1, r + 1);

    let i = 0, j = 0, k = l;
    while (i < n1 && j < n2) {
        bars[k].style.backgroundColor = 'var(--bar-compare)';
        if (L[i] <= R[j]) {
            state.array[k] = L[i];
            i++;
        } else {
            state.array[k] = R[j];
            j++;
        }
        bars[k].style.height = `${state.array[k]}px`;
        updateSteps();
        await sleep();
        bars[k].style.backgroundColor = 'var(--bar-sorted)';
        k++;
    }
    while (i < n1) {
        state.array[k] = L[i];
        bars[k].style.height = `${state.array[k]}px`;
        i++; k++; updateSteps(); await sleep();
    }
    while (j < n2) {
        state.array[k] = R[j];
        bars[k].style.height = `${state.array[k]}px`;
        j++; k++; updateSteps(); await sleep();
    }
}

// --- PATHFINDING MODULE (~300 Lines) ---

function initPathfinding() {
    pathContainer.innerHTML = '';
    state.grid = [];
    for (let r = 0; r < 25; r++) {
        let row = [];
        for (let c = 0; c < 40; c++) {
            const node = document.createElement('div');
            node.className = 'node';
            node.id = `node-${r}-${c}`;
            node.onmousedown = () => toggleWall(r, c);
            pathContainer.appendChild(node);
            row.push({ r, c, wall: false, visited: false, dist: Infinity, prev: null });
        }
        state.grid.push(row);
    }
    document.getElementById(`node-${state.startNode.r}-${state.startNode.c}`).classList.add('node-start');
    document.getElementById(`node-${state.endNode.r}-${state.endNode.c}`).classList.add('node-end');
}

function toggleWall(r, c) {
    if (state.isVisualizing) return;
    state.grid[r][c].wall = !state.grid[r][c].wall;
    document.getElementById(`node-${r}-${c}`).classList.toggle('node-wall');
}

async function dijkstra() {
    let unvisited = [];
    for (let r = 0; r < 25; r++) {
        for (let c = 0; c < 40; c++) {
            state.grid[r][c].dist = Infinity;
            state.grid[r][c].visited = false;
            state.grid[r][c].prev = null;
            unvisited.push(state.grid[r][c]);
        }
    }
    state.grid[state.startNode.r][state.startNode.c].dist = 0;

    while (unvisited.length > 0) {
        unvisited.sort((a, b) => a.dist - b.dist);
        let current = unvisited.shift();
        if (current.wall) continue;
        if (current.dist === Infinity) break;

        current.visited = true;
        updateSteps();
        if (current.r === state.endNode.r && current.c === state.endNode.c) break;

        const nodeEl = document.getElementById(`node-${current.r}-${current.c}`);
        if (!nodeEl.classList.contains('node-start')) nodeEl.classList.add('node-visited');

        // Update Neighbors
        const neighbors = getNeighbors(current);
        for (let neighbor of neighbors) {
            let alt = current.dist + 1;
            if (alt < neighbor.dist) {
                neighbor.dist = alt;
                neighbor.prev = current;
            }
        }
        await sleep();
    }
    await drawPath();
}

function getNeighbors(n) {
    let neighbors = [];
    const { r, c } = n;
    if (r > 0) neighbors.push(state.grid[r-1][c]);
    if (r < 24) neighbors.push(state.grid[r+1][c]);
    if (c > 0) neighbors.push(state.grid[r][c-1]);
    if (c < 39) neighbors.push(state.grid[r][c+1]);
    return neighbors.filter(neigh => !neigh.visited);
}

async function drawPath() {
    let curr = state.grid[state.endNode.r][state.endNode.c].prev;
    while (curr && !(curr.r === state.startNode.r && curr.c === state.startNode.c)) {
        document.getElementById(`node-${curr.r}-${curr.c}`).className = 'node node-path';
        curr = curr.prev;
        await sleep();
    }
}

// --- DATA STRUCTURES MODULE ---
const dsData = [];
function renderDS() {
    dsContainer.innerHTML = '';
    dsData.forEach(val => {
        const item = document.createElement('div');
        item.className = 'ds-item';
        item.innerText = val;
        dsContainer.appendChild(item);
    });
}

document.getElementById('stack-push').onclick = () => {
    const val = document.getElementById('ds-input').value;
    if (val) {
        dsData.push(val);
        renderDS();
    } else {
        alert('Please enter a value to push.');
    }
};

document.getElementById('stack-pop').onclick = () => {
    if (dsData.length > 0) {
        dsData.pop();
        renderDS();
    } else {
        alert('Stack is empty. Cannot pop.');
    }
};

document.getElementById('queue-enq').onclick = () => {
    const val = document.getElementById('ds-input').value;
    if (val) {
        dsData.push(val);
        renderDS();
    } else {
        alert('Please enter a value to enqueue.');
    }
};

document.getElementById('queue-deq').onclick = () => {
    if (dsData.length > 0) {
        dsData.shift();
        renderDS();
    } else {
        alert('Queue is empty. Cannot dequeue.');
    }
};

// --- ADDITIONAL SORTING ALGORITHMS ---
async function selectionSort() {
    let bars = document.getElementsByClassName('bar');
    for (let i = 0; i < state.array.length; i++) {
        let minIdx = i;
        for (let j = i + 1; j < state.array.length; j++) {
            bars[j].style.backgroundColor = 'var(--bar-compare)';
            bars[minIdx].style.backgroundColor = 'var(--bar-compare)';

            if (state.array[j] < state.array[minIdx]) {
                minIdx = j;
            }
            await sleep();
            bars[j].style.backgroundColor = 'var(--bar-default)';
        }
        if (minIdx !== i) {
            let temp = state.array[i];
            state.array[i] = state.array[minIdx];
            state.array[minIdx] = temp;
            bars[i].style.height = `${state.array[i]}px`;
            bars[minIdx].style.height = `${state.array[minIdx]}px`;
            updateSteps();
        }
        bars[i].style.backgroundColor = 'var(--bar-sorted)';
    }
}

async function insertionSort() {
    let bars = document.getElementsByClassName('bar');
    for (let i = 1; i < state.array.length; i++) {
        let key = state.array[i];
        let j = i - 1;
        bars[i].style.backgroundColor = 'var(--bar-compare)';
        while (j >= 0 && state.array[j] > key) {
            bars[j].style.backgroundColor = 'var(--bar-compare)';
            state.array[j + 1] = state.array[j];
            bars[j + 1].style.height = `${state.array[j + 1]}px`;
            updateSteps();
            await sleep();
            bars[j].style.backgroundColor = 'var(--bar-default)';
            j--;
        }
        state.array[j + 1] = key;
        bars[j + 1].style.height = `${key}px`;
        bars[i].style.backgroundColor = 'var(--bar-default)';
        bars[j + 1].style.backgroundColor = 'var(--bar-sorted)';
    }
}

async function quickSort(low, high) {
    if (low < high) {
        let pi = await partition(low, high);
        await quickSort(low, pi - 1);
        await quickSort(pi + 1, high);
    }
}

async function partition(low, high) {
    let bars = document.getElementsByClassName('bar');
    let pivot = state.array[high];
    bars[high].style.backgroundColor = 'var(--bar-sorted)';
    let i = low - 1;

    for (let j = low; j < high; j++) {
        bars[j].style.backgroundColor = 'var(--bar-compare)';
        if (state.array[j] < pivot) {
            i++;
            [state.array[i], state.array[j]] = [state.array[j], state.array[i]];
            bars[i].style.height = `${state.array[i]}px`;
            bars[j].style.height = `${state.array[j]}px`;
            updateSteps();
            await sleep();
        }
        bars[j].style.backgroundColor = 'var(--bar-default)';
    }
    [state.array[i + 1], state.array[high]] = [state.array[high], state.array[i + 1]];
    bars[i + 1].style.height = `${state.array[i + 1]}px`;
    bars[high].style.height = `${state.array[high]}px`;
    updateSteps();
    await sleep();
    bars[high].style.backgroundColor = 'var(--bar-default)';
    bars[i + 1].style.backgroundColor = 'var(--bar-sorted)';
    return i + 1;
}

// Update start button to include new algorithms
document.getElementById('start-btn').onclick = async () => {
    state.isVisualizing = true;
    state.steps = 0;
    if (state.currentTab === 'sorting') {
        const algo = document.getElementById('sort-algo').value;
        if (algo === 'bubble') await bubbleSort();
        if (algo === 'merge') await mergeSort(0, state.array.length - 1);
        if (algo === 'selection') await selectionSort();
        if (algo === 'insertion') await insertionSort();
        if (algo === 'quick') await quickSort(0, state.array.length - 1);
    } else if (state.currentTab === 'pathfinding') {
        const algo = document.getElementById('path-algo').value;
        if (algo === 'dijkstra') await dijkstra();
        if (algo === 'bfs') await bfs();
        if (algo === 'dfs') await dfs(state.grid[state.startNode.r][state.startNode.c]);
    }
    state.isVisualizing = false;
};

document.getElementById('reset-btn').onclick = () => {
    if (state.isVisualizing) return;
    init();
};

document.getElementById('speed').oninput = (e) => {
    state.speed = 1001 - e.target.value;
};

function init() {
    if (state.currentTab === 'sorting') initSorting();
    if (state.currentTab === 'pathfinding') {
        console.log('Debug: initPathfinding called');
        initPathfinding();
    }
    state.steps = 0;
    stepDisplay.innerText = '0';
}

init();