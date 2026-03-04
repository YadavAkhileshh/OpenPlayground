const draggables = document.querySelectorAll('.instruction-block');
const dropZone = document.getElementById('dropZone');
const emptyState = document.getElementById('emptyState');
const codeOutput = document.getElementById('codeOutput');
const btnClear = document.getElementById('btnClear');
const btnCopy = document.getElementById('btnCopy');

let workspaceBlocks = [];

// --- Drag & Drop Initialization ---
draggables.forEach(draggable => {
    draggable.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', draggable.getAttribute('data-cmd'));
    });
});

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    
    const cmd = e.dataTransfer.getData('text/plain');
    if (cmd) {
        addBlockToWorkspace(cmd);
    }
});

// --- Workspace Management ---
function addBlockToWorkspace(cmd) {
    emptyState.style.display = 'none';

    // Create unique ID for state tracking
    const blockId = Date.now().toString();
    const blockData = { id: blockId, cmd: cmd, args: '' };
    workspaceBlocks.push(blockData);

    // Create DOM element
    const blockEl = document.createElement('div');
    blockEl.className = 'workspace-item';
    blockEl.id = `block-${blockId}`;
    
    // Placeholder hints based on command
    let placeholder = 'Arguments...';
    if (cmd === 'FROM') placeholder = 'e.g., node:18-alpine';
    if (cmd === 'COPY') placeholder = 'e.g., package*.json ./';
    if (cmd === 'RUN') placeholder = 'e.g., npm install';
    if (cmd === 'EXPOSE') placeholder = 'e.g., 3000';
    if (cmd === 'CMD') placeholder = 'e.g., ["npm", "start"]';

    blockEl.innerHTML = `
        <div class="cmd-label">${cmd}</div>
        <input type="text" placeholder="${placeholder}" autocomplete="off" spellcheck="false">
        <button class="btn-remove" title="Remove">&times;</button>
    `;

    // Event Listeners for this specific block
    const inputField = blockEl.querySelector('input');
    inputField.addEventListener('input', (e) => {
        blockData.args = e.target.value;
        generateDockerfile();
    });

    const removeBtn = blockEl.querySelector('.btn-remove');
    removeBtn.addEventListener('click', () => {
        workspaceBlocks = workspaceBlocks.filter(b => b.id !== blockId);
        blockEl.remove();
        if (workspaceBlocks.length === 0) emptyState.style.display = 'block';
        generateDockerfile();
    });

    dropZone.appendChild(blockEl);
    
    // Auto-focus the new input
    setTimeout(() => inputField.focus(), 50);
    generateDockerfile();
}

// --- Generator & Parser ---
function generateDockerfile() {
    if (workspaceBlocks.length === 0) {
        codeOutput.innerHTML = '# Your Dockerfile will generate here...';
        return;
    }

    let codeHTML = '';
    
    workspaceBlocks.forEach((block, index) => {
        // Warning logic: FROM should ideally be first
        if (index === 0 && block.cmd !== 'FROM') {
            codeHTML += `<span style="color:#ef4444;"># WARNING: Dockerfiles usually start with FROM</span>\n`;
        }
        
        const args = block.args ? block.args : '<span style="color:#64748b; font-style:italic;">&lt;arguments required&gt;</span>';
        codeHTML += `<span class="kw">${block.cmd}</span> ${args}\n`;
    });

    codeOutput.innerHTML = codeHTML;
}

// --- UI Actions ---
btnClear.addEventListener('click', () => {
    workspaceBlocks = [];
    dropZone.innerHTML = '';
    dropZone.appendChild(emptyState);
    emptyState.style.display = 'block';
    generateDockerfile();
});

btnCopy.addEventListener('click', () => {
    if (workspaceBlocks.length === 0) return;
    
    // Generate clean raw text without HTML tags for clipboard
    let rawText = '';
    workspaceBlocks.forEach(block => {
        rawText += `${block.cmd} ${block.args}\n`;
    });

    navigator.clipboard.writeText(rawText).then(() => {
        const originalText = btnCopy.innerText;
        btnCopy.innerText = 'Copied!';
        btnCopy.style.background = '#10b981';
        setTimeout(() => {
            btnCopy.innerText = originalText;
            btnCopy.style.background = 'var(--docker-blue)';
        }, 1500);
    });
});