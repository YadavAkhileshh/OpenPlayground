// --- Game State & Configuration ---
let currentMode = 'SLL'; 
let nodesData = []; 
let actionCounter = 1;

// --- Logger System ---
function logAction(message, type = "normal") {
    const logBox = document.getElementById('action-log');
    const time = new Date().toLocaleTimeString([], { hour12: false });
    const logEntry = document.createElement('div');
    
    if (type === "error") logEntry.className = "log-error";
    if (type === "search") logEntry.className = "log-search";
    
    logEntry.innerText = `[${time}] > ${message}`;
    logBox.appendChild(logEntry);
    logBox.scrollTop = logBox.scrollHeight; // Auto-scroll to bottom
}

// --- UI & Utility Functions ---
function toggleGuide() {
    document.getElementById('guide-modal').classList.toggle('hidden');
}

function updateSpeed() {
    const speed = document.getElementById('speed-select').value;
    document.documentElement.style.setProperty('--anim-speed', speed);
    logAction(`Animation speed set to ${speed}.`);
}

function setMode(mode) {
    currentMode = mode;
    document.querySelectorAll('.type-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-${mode.toLowerCase()}`).classList.add('active');

    const btnAdd = document.getElementById('btn-add');
    const btnDelete = document.getElementById('btn-delete');
    const infoPanel = document.getElementById('mode-info');

    if (mode === 'QUEUE') {
        btnAdd.innerText = 'Enqueue'; btnDelete.innerText = 'Dequeue';
        infoPanel.innerHTML = 'Mode: <strong>Queue (FIFO)</strong><br>First-In, First-Out.';
    } else if (mode === 'STACK') {
        btnAdd.innerText = 'Push'; btnDelete.innerText = 'Pop';
        infoPanel.innerHTML = 'Mode: <strong>Stack (LIFO)</strong><br>Last-In, First-Out.';
    } else {
        btnAdd.innerText = 'Add Node'; btnDelete.innerText = 'Delete Last';
        const llInfo = {
            'SLL': 'Mode: <strong>Singly Linked List</strong><br>Nodes point only to next.',
            'DLL': 'Mode: <strong>Doubly Linked List</strong><br>Nodes point to previous and next.',
            'CLL': 'Mode: <strong>Circular Linked List</strong><br>Last node points to first.'
        };
        infoPanel.innerHTML = llInfo[mode];
    }
    
    logAction(`Switched structure to ${mode}.`);
    document.getElementById('canvas').innerHTML = '<div class="empty-state">Mode changed. Press "Start Visualization" to redraw.</div>';
}

function updateDataDisplay() {
    document.getElementById('data-queue').innerText = `[${nodesData.join(', ')}]`;
}

// --- Core Data Operations ---
function addData() {
    const input = document.getElementById('node-value');
    const val = input.value.trim();
    if (val === '') { logAction("Input error: No value provided.", "error"); return; }
    
    nodesData.push(val);
    input.value = ''; input.focus();
    updateDataDisplay();
    
    let verb = currentMode === 'STACK' ? 'Pushed' : currentMode === 'QUEUE' ? 'Enqueued' : 'Added';
    logAction(`${verb} value '${val}' into memory array.`);
}

function removeData() {
    if (nodesData.length === 0) { logAction("Deletion error: Memory is empty.", "error"); return; }

    let removed;
    if (currentMode === 'QUEUE') {
        removed = nodesData.shift(); 
        logAction(`Dequeued '${removed}' from the front.`);
    } else {
        removed = nodesData.pop(); 
        logAction(`Removed '${removed}' from the end.`);
    }
    updateDataDisplay();
}

function clearAllData() {
    nodesData = [];
    updateDataDisplay();
    document.getElementById('canvas').innerHTML = '<div class="empty-state">Canvas cleared.</div>';
    logAction("System memory purged. All data cleared.");
}

function generateRandomData() {
    const count = Math.floor(Math.random() * 3) + 3; // Add 3 to 5 nodes
    for(let i=0; i<count; i++) {
        nodesData.push(Math.floor(Math.random() * 99) + 1);
    }
    updateDataDisplay();
    logAction(`Generated ${count} random data points.`);
    startVisualization(); // Auto-start to look cool
}

// --- Search Engine ---
function searchData() {
    const val = document.getElementById('search-value').value.trim();
    if(val === '') { logAction("Search aborted: Query empty.", "error"); return; }
    
    const elements = document.querySelectorAll('.data-cell, .q-node, .s-node');
    let found = false;

    // Remove old highlights
    elements.forEach(el => {
        el.classList.remove('node-highlight');
        // Parent node-box highlight for Linked Lists
        if(el.parentElement.classList.contains('node-box')) el.parentElement.classList.remove('node-highlight');
    });

    // Add new highlights
    elements.forEach(el => {
        if (el.innerText === val) {
            found = true;
            el.classList.add('node-highlight');
            if(el.parentElement.classList.contains('node-box')) el.parentElement.classList.add('node-highlight');
        }
    });

    if (found) logAction(`Search successful: Found value '${val}'. Highlighted on canvas.`, "search");
    else logAction(`Search failed: Value '${val}' not found in current structure.`, "error");
}

// --- Visualization Engine ---
function startVisualization() {
    const canvas = document.getElementById('canvas');
    canvas.innerHTML = ''; 
    
    if (nodesData.length === 0) {
        canvas.innerHTML = '<div class="empty-state">No data to render!</div>';
        logAction("Render aborted: No data in memory.", "error");
        return;
    }

    logAction(`Rendering ${currentMode} with ${nodesData.length} items...`);

    // 1. DRAW QUEUE
    if (currentMode === 'QUEUE') {
        canvas.innerHTML = `
            <div class="queue-board">
                <div class="queue-main">
                    <div class="q-action out">Dequeue</div>
                    <div class="q-blocks-wrapper">
                        <div class="q-labels"><span>Front / Head</span><span>Back / Tail</span></div>
                        <div class="q-blocks" id="q-container"></div>
                    </div>
                    <div class="q-action in">Enqueue</div>
                </div>
                <div class="queue-title">Queue Data Structure</div>
            </div>`;
        
        const container = document.getElementById('q-container');
        nodesData.forEach((data, i) => {
            const block = document.createElement('div');
            block.className = 'q-node';
            block.innerText = data;
            block.style.animationDelay = `${i * 0.1}s`; 
            container.appendChild(block);
        });
        return;
    }

    // 2. DRAW STACK
    if (currentMode === 'STACK') {
        canvas.innerHTML = `
            <div class="stack-board">
                <div class="stack-header"><div class="s-action-push">Push</div><h2>LIFO</h2><div class="s-action-pop">Pop</div></div>
                <div class="stack-container" id="s-container"></div>
                <div class="stack-footer">Stack</div>
            </div>`;

        const container = document.getElementById('s-container');
        nodesData.forEach((data, i) => {
            const block = document.createElement('div');
            block.className = 's-node';
            block.innerText = data;
            block.style.animationDelay = `${i * 0.1}s`;
            container.appendChild(block);
        });
        return;
    }

    // 3. DRAW LINKED LISTS
    const wrapper = document.createElement('div');
    wrapper.className = 'list-wrapper';

    nodesData.forEach((data, index) => {
        const isFirst = index === 0;
        const isLast = index === nodesData.length - 1;
        const nodeDiv = document.createElement('div');
        nodeDiv.className = 'node-container';

        if (isFirst) nodeDiv.innerHTML += `<div class="head-pointer">head node</div>`;

        let innerHTML = '';
        if (currentMode === 'SLL') {
            innerHTML = `
                <div class="node-box" style="animation-delay: ${index * 0.1}s">
                    <div class="data-cell">${data}</div>
                    <div class="ptr-cell ${isLast ? 'null-cross' : ''}">${!isLast ? '<div class="arrow-right"></div>' : ''}</div>
                </div>`;
        } else if (currentMode === 'DLL') {
            innerHTML = `
                <div class="node-box" style="animation-delay: ${index * 0.1}s">
                    <div class="prev-ptr-cell ${isFirst ? 'null-cross' : ''}"></div>
                    <div class="data-cell">${data}</div>
                    <div class="ptr-cell ${isLast ? 'null-cross' : ''}">${!isLast ? `<div class="arrow-double"><div class="arrow-double-top"></div><div class="arrow-double-bottom"></div></div>` : ''}</div>
                </div>`;
        } else if (currentMode === 'CLL') {
            innerHTML = `
                <div class="node-box" style="animation-delay: ${index * 0.1}s">
                    <div class="data-cell">${data}</div>
                    <div class="ptr-cell">${!isLast ? '<div class="arrow-right"></div>' : ''}</div>
                </div>`;
        }

        nodeDiv.innerHTML += innerHTML;
        wrapper.appendChild(nodeDiv);
    });

    if (currentMode === 'CLL' && nodesData.length > 0) {
        const widthCalc = `calc(100% - 90px)`; 
        wrapper.innerHTML += `<div class="circular-return" style="width: ${widthCalc}"></div>`;
    }

    canvas.appendChild(wrapper);
    logAction("Render complete.");
}
