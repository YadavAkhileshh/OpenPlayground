// Global state
let blockCounter = 0;
let connections = [];
let connectingFrom = null;
let draggedBlock = null;
let offset = { x: 0, y: 0 };
let executionContext = {}; // Variables during execution
let isExecuting = false;

// DOM elements
const canvas = document.getElementById('canvasContent');
const canvasContainer = canvas.parentElement;
const svg = document.getElementById('connectionSvg');

// Add scroll listener to update connections
if (canvasContainer) {
    canvasContainer.addEventListener('scroll', () => {
        updateConnections();
    });
}

/**
 * Initialize drag and drop for sidebar blocks
 */
function initializeSidebarBlocks() {
    document.querySelectorAll('.sidebar .block').forEach(block => {
        block.addEventListener('dragstart', handleSidebarDragStart);
    });
}

/**
 * Handle drag start from sidebar
 */
function handleSidebarDragStart(e) {
    e.dataTransfer.setData('blockType', this.dataset.type);
    e.dataTransfer.setData('blockText', this.textContent.trim());
}

/**
 * Initialize canvas drop zone
 */
function initializeCanvas() {
    canvas.addEventListener('dragover', handleCanvasDragOver);
    canvas.addEventListener('drop', handleCanvasDrop);
    canvasContainer.addEventListener('scroll', updateConnections);
}

/**
 * Handle drag over canvas
 */
function handleCanvasDragOver(e) {
    e.preventDefault();
}

/**
 * Handle drop on canvas
 */
function handleCanvasDrop(e) {
    e.preventDefault();
    const type = e.dataTransfer.getData('blockType');
    const text = e.dataTransfer.getData('blockText');
    
    if (!type || !text) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left + canvasContainer.scrollLeft;
    const y = e.clientY - rect.top + canvasContainer.scrollTop;
    
    createBlock(type, text, x, y);
}

/**
 * Create a new block on the canvas
 */
function createBlock(type, text, x, y, data = {}) {
    const block = document.createElement('div');
    const blockId = `block-${blockCounter++}`;
    
    block.className = `dropped-block ${type}`;
    block.id = blockId;
    block.style.left = `${x}px`;
    block.style.top = `${y}px`;
    block.dataset.type = type;
    
    // Build block content based on type
    let contentHTML = '';
    
    if (type === 'logic') {
        // Logic blocks have condition input and TRUE/FALSE outputs
        contentHTML = `
            <input type="text" class="condition-input" placeholder="condition (e.g., x > 10)" 
                   value="${data.condition || ''}" 
                   onmousedown="event.stopPropagation()">
            <div class="connection-point output true-branch" data-block="${blockId}" data-type="output" data-branch="true">
                <span class="branch-label">TRUE</span>
            </div>
            <div class="connection-point output false-branch" data-block="${blockId}" data-type="output" data-branch="false">
                <span class="branch-label">FALSE</span>
            </div>
        `;
    } else if (type === 'action') {
        // Action blocks have action input
        contentHTML = `
            <input type="text" class="action-input" placeholder="action (e.g., result = x + 5)" 
                   value="${data.action || ''}"
                   onmousedown="event.stopPropagation()">
        `;
    }
    
    block.innerHTML = `
        <div class="block-header">
            <div class="block-title">${text}</div>
            <button class="delete-btn" onclick="deleteBlock('${blockId}')">×</button>
        </div>
        <div class="block-content">
            ${contentHTML}
        </div>
        ${type !== 'start' ? `<div class="connection-point input" data-block="${blockId}" data-type="input"></div>` : ''}
        ${type !== 'end' && type !== 'logic' ? `<div class="connection-point output" data-block="${blockId}" data-type="output"></div>` : ''}
    `;
    
    canvas.appendChild(block);
    
    // Add event listeners
    block.addEventListener('mousedown', startDrag);
    
    block.querySelectorAll('.connection-point').forEach(point => {
        point.addEventListener('click', handleConnection);
    });
    
    return blockId;
}

/**
 * Start dragging a block
 */
function startDrag(e) {
    // Don't drag if clicking delete button or connection point
    if (e.target.classList.contains('delete-btn') || 
        e.target.classList.contains('connection-point')) {
        return;
    }
    
    draggedBlock = e.currentTarget;
    const rect = draggedBlock.getBoundingClientRect();
    
    offset.x = e.clientX - rect.left;
    offset.y = e.clientY - rect.top;
    
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
    
    e.preventDefault();
}

/**
 * Drag the block
 */
function drag(e) {
    if (!draggedBlock) return;
    
    const canvasRect = canvasContainer.getBoundingClientRect();
    const x = e.clientX - canvasRect.left - offset.x + canvasContainer.scrollLeft;
    const y = e.clientY - canvasRect.top - offset.y + canvasContainer.scrollTop;
    
    draggedBlock.style.left = `${x}px`;
    draggedBlock.style.top = `${y}px`;
    
    updateConnections();
}

/**
 * Stop dragging
 */
function stopDrag() {
    draggedBlock = null;
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDrag);
}

/**
 * Handle connection point clicks
 */
function handleConnection(e) {
    const point = e.currentTarget;
    const blockId = point.dataset.block;
    const pointType = point.dataset.type;
    const branch = point.dataset.branch || null;
    
    if (!connectingFrom) {
        // Start connection from output point
        if (pointType === 'output') {
            connectingFrom = { blockId, pointType, branch };
            point.classList.add('active');
            console.log('Start connection from:', blockId, 'branch:', branch);
        }
    } else {
        // Complete connection to input point
        if (pointType === 'input' && connectingFrom.blockId !== blockId) {
            // Check if connection already exists
            const exists = connections.some(conn => 
                conn.from === connectingFrom.blockId && 
                conn.to === blockId &&
                conn.branch === connectingFrom.branch
            );
            
            if (!exists) {
                const newConnection = {
                    from: connectingFrom.blockId,
                    to: blockId,
                    branch: connectingFrom.branch
                };
                connections.push(newConnection);
                console.log('✓ Connection created:', JSON.stringify(newConnection));
                console.log('Total connections:', connections.length);
                updateConnections();
            } else {
                console.log('Connection already exists');
            }
        }
        
        // Reset connection state
        document.querySelectorAll('.connection-point').forEach(p => {
            p.classList.remove('active');
        });
        connectingFrom = null;
    }
}

/**
 * Update all connection lines
 */
function updateConnections() {
    svg.innerHTML = '';
    
    connections.forEach(conn => {
        const fromBlock = document.getElementById(conn.from);
        const toBlock = document.getElementById(conn.to);
        
        if (!fromBlock || !toBlock) return;
        
        // Use block positions directly (they're already in canvas-content coordinates)
        const fromX = parseFloat(fromBlock.style.left) + fromBlock.offsetWidth / 2;
        const fromY = parseFloat(fromBlock.style.top) + fromBlock.offsetHeight;
        const toX = parseFloat(toBlock.style.left) + toBlock.offsetWidth / 2;
        const toY = parseFloat(toBlock.style.top);
        
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', fromX);
        line.setAttribute('y1', fromY);
        line.setAttribute('x2', toX);
        line.setAttribute('y2', toY);
        
        // Color code branches
        if (conn.branch === 'true') {
            line.setAttribute('stroke', '#4CAF50');
            line.setAttribute('stroke-width', '3');
        } else if (conn.branch === 'false') {
            line.setAttribute('stroke', '#f44336');
            line.setAttribute('stroke-width', '3');
        }
        
        svg.appendChild(line);
    });
}

/**
 * Delete a block
 */
function deleteBlock(blockId) {
    const block = document.getElementById(blockId);
    if (block) {
        block.remove();
    }
    
    // Remove all connections involving this block
    connections = connections.filter(conn => 
        conn.from !== blockId && conn.to !== blockId
    );
    
    updateConnections();
}

/**
 * Clear the entire canvas
 */
function clearCanvas() {
    if (confirm('Are you sure you want to clear all blocks?')) {
        // Clear blocks from canvas
        canvas.innerHTML = '';
        
        // Clear connections array
        connections = [];
        
        // Clear SVG paths
        svg.innerHTML = '';
        
        // Reset counter
        blockCounter = 0;
        
        console.log('Canvas cleared: blocks and connections removed');
    }
}

/**
 * Export logic to JSON
 */
function exportLogic() {
    const blocks = Array.from(document.querySelectorAll('.dropped-block')).map(block => ({
        id: block.id,
        type: block.classList[1],
        text: block.querySelector('.block-title').textContent,
        x: parseInt(block.style.left),
        y: parseInt(block.style.top)
    }));
    
    const data = {
        blocks,
        connections,
        metadata: {
            created: new Date().toISOString(),
            blockCount: blocks.length,
            connectionCount: connections.length
        }
    };
    
    console.log('Exported Logic:', JSON.stringify(data, null, 2));
    
    // Copy to clipboard
    const jsonString = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(jsonString).then(() => {
        alert('Logic exported to clipboard and console!');
    }).catch(err => {
        alert('Logic exported to console! Check browser console (F12)');
    });
}

/**
 * Import logic from JSON
 */
function importLogic() {
    // Create import panel if it doesn't exist
    let importPanel = document.getElementById('importPanel');
    if (!importPanel) {
        importPanel = document.createElement('div');
        importPanel.id = 'importPanel';
        importPanel.className = 'input-panel';
        importPanel.innerHTML = `
            <div class="panel-header">
                <h3>Import Logic</h3>
                <button onclick="closeImportPanel()" class="close-btn">×</button>
            </div>
            <div class="panel-content">
                <p class="help-text">Paste your JSON logic here:</p>
                <textarea id="jsonImportInput" placeholder="Paste JSON here..."></textarea>
                <div class="panel-buttons">
                    <button onclick="processImport()" class="primary-btn">Import</button>
                    <button onclick="closeImportPanel()" class="secondary-btn">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(importPanel);
    }
    
    document.getElementById('jsonImportInput').value = '';
    importPanel.style.display = 'block';
}

function closeImportPanel() {
    document.getElementById('importPanel').style.display = 'none';
}

function processImport() {
    const jsonInput = document.getElementById('jsonImportInput').value;
    
    if (!jsonInput || !jsonInput.trim()) {
        closeImportPanel();
        return;
    }
    
    try {
        const data = JSON.parse(jsonInput);
        
        // Clear current canvas
        canvas.innerHTML = '<svg id="connectionSvg"></svg>';
        connections = [];
        
        // Import blocks
        if (data.blocks && Array.isArray(data.blocks)) {
            data.blocks.forEach(blockData => {
                createBlock(blockData.type, blockData.text, blockData.x, blockData.y, blockData.data || {});
            });
        }
        
        // Import connections
        if (data.connections && Array.isArray(data.connections)) {
            connections = data.connections;
            updateConnections();
        }
        
        console.log('Logic imported successfully!');
        closeImportPanel();
    } catch (error) {
        console.error('Import error:', error.message);
        showError('Error importing logic: ' + error.message);
        closeImportPanel();
    }
}

/**
 * Save logic to file
 */
function saveToFile() {
    const blocks = Array.from(document.querySelectorAll('.dropped-block')).map(block => ({
        id: block.id,
        type: block.classList[1],
        text: block.querySelector('.block-title').textContent,
        x: parseInt(block.style.left),
        y: parseInt(block.style.top)
    }));
    
    const data = {
        blocks,
        connections,
        metadata: {
            created: new Date().toISOString(),
            blockCount: blocks.length,
            connectionCount: connections.length
        }
    };
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `logic-flow-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Load logic from file
 */
function loadFromFile() {
    const fileInput = document.getElementById('fileInput');
    
    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                
                // Clear current canvas
                canvas.innerHTML = '<svg id="connectionSvg"></svg>';
                connections = [];
                
                // Import blocks
                if (data.blocks && Array.isArray(data.blocks)) {
                    data.blocks.forEach(blockData => {
                        createBlock(blockData.type, blockData.text, blockData.x, blockData.y);
                    });
                }
                
                // Import connections
                if (data.connections && Array.isArray(data.connections)) {
                    connections = data.connections;
                    updateConnections();
                }
                
                console.log('Logic loaded successfully!');
            } catch (error) {
                console.error('Error loading file:', error.message);
                showError('Error loading file: ' + error.message);
            }
        };
        
        reader.readAsText(file);
    };
    
    fileInput.click();
}

/**
 * Initialize the application
 */
function init() {
    initializeSidebarBlocks();
    initializeCanvas();
    
    console.log('Visual Logic Builder initialized!');
    console.log('Instructions:');
    console.log('1. Drag blocks from sidebar to canvas');
    console.log('2. Click output point (bottom) then input point (top) to connect');
    console.log('3. Drag blocks to move them');
    console.log('4. Click × to delete blocks');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// ===== EXECUTION ENGINE =====

/**
 * Run the flow from start block
 */
function runFlow() {
    if (isExecuting) {
        showError('Execution already in progress');
        return;
    }
    
    // Check if start block exists
    const startBlock = Array.from(document.querySelectorAll('.dropped-block.start'))[0];
    if (!startBlock) {
        showError('No Start block found!');
        return;
    }
    
    // Show variable input panel
    const panel = document.getElementById('varInputPanel');
    const input = document.getElementById('varInput');
    input.value = '';
    panel.style.display = 'block';
}

function closeVarPanel() {
    document.getElementById('varInputPanel').style.display = 'none';
}

function startExecution() {
    const varInput = document.getElementById('varInput').value;
    executionContext = {};
    
    if (varInput && varInput.trim()) {
        const pairs = varInput.split(',');
        pairs.forEach(pair => {
            const [key, value] = pair.split('=').map(s => s.trim());
            if (key && value !== undefined) {
                // Parse value
                if (value === 'true') executionContext[key] = true;
                else if (value === 'false') executionContext[key] = false;
                else if (value.startsWith('"') && value.endsWith('"')) {
                    executionContext[key] = value.slice(1, -1);
                } else if (!isNaN(value)) {
                    executionContext[key] = parseFloat(value);
                } else {
                    executionContext[key] = value;
                }
            }
        });
    }
    
    // Clear previous execution results
    document.querySelectorAll('.condition-result').forEach(el => el.remove());
    document.querySelectorAll('.dropped-block').forEach(b => b.classList.remove('executing'));
    
    closeVarPanel();
    
    const startBlock = Array.from(document.querySelectorAll('.dropped-block.start'))[0];
    if (!startBlock) {
        showError('No Start block found!');
        return;
    }
    
    isExecuting = true;
    executeFrom(startBlock.id);
}

/**
 * Execute flow from a specific block
 */
function executeFrom(blockId, visited = new Set()) {
    if (visited.has(blockId)) {
        console.error('Loop detected at block:', blockId);
        isExecuting = false;
        showError('Loop detected in flow!');
        return;
    }
    visited.add(blockId);
    
    const block = document.getElementById(blockId);
    if (!block) {
        console.error('Block not found:', blockId);
        isExecuting = false;
        showError('Block not found: ' + blockId);
        return;
    }
    
    const type = block.dataset.type;
    
    // Highlight current block
    document.querySelectorAll('.dropped-block').forEach(b => b.classList.remove('executing'));
    block.classList.add('executing');
    
    console.log(`\u25B6 Executing ${type} block:`, blockId);
    
    // Process block based on type
    if (type === 'start') {
        console.log('START - Variables:', executionContext);
        setTimeout(() => {
            const next = findNextBlock(blockId);
            if (next) executeFrom(next, visited);
            else { isExecuting = false; showResult(); }
        }, 500);
    } else if (type === 'logic') {
        const input = block.querySelector('.condition-input');
        const condition = input ? input.value.trim() : '';
        
        if (!condition) {
            showError('Condition is empty in logic block!');
            isExecuting = false;
            return;
        }
        
        const result = evaluateCondition(condition);
        const resultText = result ? 'TRUE' : 'FALSE';
        const resultColor = result ? '#4CAF50' : '#f44336';
        
        // Show condition result visually on the block
        const blockContent = block.querySelector('.block-content');
        let resultLabel = blockContent.querySelector('.condition-result');
        if (!resultLabel) {
            resultLabel = document.createElement('div');
            resultLabel.className = 'condition-result';
            blockContent.appendChild(resultLabel);
        }
        resultLabel.textContent = `✓ ${resultText}`;
        resultLabel.style.color = resultColor;
        resultLabel.style.fontWeight = 'bold';
        resultLabel.style.fontSize = '14px';
        resultLabel.style.marginTop = '8px';
        resultLabel.style.padding = '5px';
        resultLabel.style.borderRadius = '3px';
        resultLabel.style.backgroundColor = result ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)';
        
        console.log(`CONDITION: "${condition}" = ${resultText}`);
        console.log(`Following ${resultText} path...`);
        console.log('Variables:', executionContext);
        
        setTimeout(() => {
            const branch = result ? 'true' : 'false';
            console.log(`Looking for ${branch.toUpperCase()} branch from ${blockId}`);
            console.log('All connections:', JSON.stringify(connections, null, 2));
            const next = findNextBlock(blockId, branch);
            if (next) {
                console.log(`✓ Continuing to next block: ${next}`);
                executeFrom(next, visited);
            } else {
                console.error(`✗ No ${branch.toUpperCase()} path connected from this logic block`);
                console.error(`Please connect the ${branch.toUpperCase()} output to another block`);
                isExecuting = false;
                showResult();
            }
        }, 800);
    } else if (type === 'action') {
        const input = block.querySelector('.action-input');
        const action = input ? input.value.trim() : '';
        
        console.log(`ACTION BLOCK: ${blockId}`);
        console.log(`Action content: "${action}"`);
        
        if (action) {
            executeAction(action);
            console.log(`✓ Action executed: ${action}`);
            console.log('Updated variables:', executionContext);
        } else {
            console.log('Action block is empty (no action to execute)');
        }
        
        // Show action executed on block
        const blockContent = block.querySelector('.block-content');
        let actionResult = blockContent.querySelector('.action-result');
        if (!actionResult) {
            actionResult = document.createElement('div');
            actionResult.className = 'action-result';
            blockContent.appendChild(actionResult);
        }
        actionResult.textContent = '✓ Executed';
        actionResult.style.color = '#4CAF50';
        actionResult.style.fontWeight = 'bold';
        actionResult.style.fontSize = '12px';
        actionResult.style.marginTop = '5px';
        
        setTimeout(() => {
            console.log(`Looking for next block after action ${blockId}...`);
            const next = findNextBlock(blockId);
            if (next) {
                console.log(`✓ Continuing to: ${next}`);
                executeFrom(next, visited);
            } else {
                console.log('No more blocks after action - ending execution');
                isExecuting = false;
                showResult();
            }
        }, 500);
    } else if (type === 'end') {
        console.log('END - Final:', executionContext);
        isExecuting = false;
        showResult();
    } else {
        setTimeout(() => {
            const next = findNextBlock(blockId);
            if (next) executeFrom(next, visited);
            else { isExecuting = false; showResult(); }
        }, 500);
    }
}

function findNextBlock(blockId, branch = null) {
    if (branch) {
        console.log(`Searching connections for: from=${blockId}, branch=${branch}`);
    } else {
        console.log(`Searching connections for: from=${blockId} (any branch)`);
    }
    
    const matchingConns = connections.filter(c => c.from === blockId);
    console.log(`Found ${matchingConns.length} connection(s) from ${blockId}:`, matchingConns);
    
    const conn = connections.find(c => c.from === blockId && (!branch || c.branch === branch));
    
    if (conn) {
        console.log(`✓ Match found: ${conn.to}`);
    } else {
        console.log(`✗ No matching connection`);
    }
    
    return conn ? conn.to : null;
}

function evaluateCondition(expr) {
    try {
        const varNames = Object.keys(executionContext);
        const varValues = Object.values(executionContext);
        const func = new Function(...varNames, `return (${expr}) ? true : false;`);
        const result = func(...varValues);
        return result === true;
    } catch (error) {
        console.error('Condition evaluation error:', error.message);
        console.error('Expression:', expr);
        console.error('Variables:', executionContext);
        return false;
    }
}

function executeAction(action) {
    console.log(`Executing action: "${action}"`);
    try {
        if (action.includes('=')) {
            const [left, right] = action.split('=').map(s => s.trim());
            console.log(`Assignment: ${left} = ${right}`);
            const varNames = Object.keys(executionContext);
            const varValues = Object.values(executionContext);
            const func = new Function(...varNames, `return ${right};`);
            const value = func(...varValues);
            executionContext[left] = value;
            console.log(`✓ Set ${left} = ${value}`);
        } else {
            console.log(`Expression: ${action}`);
            const varNames = Object.keys(executionContext);
            const varValues = Object.values(executionContext);
            const func = new Function(...varNames, `return ${action};`);
            const result = func(...varValues);
            console.log(`✓ Result: ${result}`);
        }
    } catch (error) {
        console.error('✗ Action execution error:', error.message);
        console.error('Action was:', action);
    }
}

function showResult() {
    document.querySelectorAll('.dropped-block').forEach(b => b.classList.remove('executing'));
    
    const panel = document.getElementById('resultsPanel');
    const status = document.getElementById('executionStatus');
    const variables = document.getElementById('variablesDisplay');
    
    status.textContent = '✓ Execution Complete';
    status.className = 'status-info';
    
    // Show variables
    let displayHTML = '<h4 style="color: #00d4ff; margin-bottom: 10px;">Final Variables:</h4>';
    if (Object.keys(executionContext).length > 0) {
        displayHTML += '<pre>' + JSON.stringify(executionContext, null, 2) + '</pre>';
    } else {
        displayHTML += '<p style="color: #aaa;">No variables</p>';
    }
    
    // Show condition results
    const conditionResults = [];
    document.querySelectorAll('.dropped-block.logic').forEach(block => {
        const condInput = block.querySelector('.condition-input');
        const condResult = block.querySelector('.condition-result');
        if (condInput && condResult) {
            conditionResults.push({
                condition: condInput.value,
                result: condResult.textContent
            });
        }
    });
    
    if (conditionResults.length > 0) {
        displayHTML += '<h4 style="color: #00d4ff; margin: 15px 0 10px;">Condition Results:</h4>';
        conditionResults.forEach(cr => {
            const color = cr.result.includes('TRUE') ? '#4CAF50' : '#f44336';
            displayHTML += `<div style="margin-bottom: 5px; font-family: monospace;">`;
            displayHTML += `<span style="color: #aaa;">${cr.condition}</span> `;
            displayHTML += `<span style="color: ${color}; font-weight: bold;">${cr.result}</span>`;
            displayHTML += `</div>`;
        });
    }
    
    variables.innerHTML = displayHTML;
    panel.style.display = 'block';
    
    console.log('===== EXECUTION COMPLETE =====');
    console.log('Final state:', executionContext);
}

function showError(message) {
    const panel = document.getElementById('resultsPanel');
    const status = document.getElementById('executionStatus');
    const variables = document.getElementById('variablesDisplay');
    
    status.textContent = '✗ ' + message;
    status.className = 'status-info error';
    variables.innerHTML = '';
    
    panel.style.display = 'block';
}

function closeResultsPanel() {
    document.getElementById('resultsPanel').style.display = 'none';
}

// Add run button
setTimeout(() => {
    const toolbar = document.querySelector('.toolbar');
    if (toolbar && !document.getElementById('runFlowBtn')) {
        const runBtn = document.createElement('button');
        runBtn.id = 'runFlowBtn';
        runBtn.textContent = '▶ Run Flow';
        runBtn.onclick = runFlow;
        runBtn.style.background = '#4CAF50';
        runBtn.style.fontWeight = 'bold';
        toolbar.insertBefore(runBtn, toolbar.firstChild);
    }
}, 100);