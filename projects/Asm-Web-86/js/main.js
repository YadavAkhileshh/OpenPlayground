import { Memory } from './memory.js';
import { RegisterFile } from './registers.js';
import { CPU } from './cpu.js';
import { Assembler } from './assembler.js';
import { toHex16, toHex8 } from './utils.js';
import { REGISTERS } from './isa.js';

// DOM Elements
const els = {
    editor: document.getElementById('code-editor'),
    console: document.getElementById('console-output'),
    memView: document.getElementById('memory-view'),
    stackView: document.getElementById('stack-view'),
    lineNumbers: document.getElementById('line-numbers'),
    status: document.getElementById('cpu-status'),
    
    // Buttons
    btnAssemble: document.getElementById('btn-assemble'),
    btnStep: document.getElementById('btn-step'),
    btnRun: document.getElementById('btn-run'),
    btnStop: document.getElementById('btn-stop'),
    btnReset: document.getElementById('btn-reset'),
    btnClearConsole: document.getElementById('clear-console'),
    
    exampleSelector: document.getElementById('example-selector')
};

// System Components
const memory = new Memory();
const registers = new RegisterFile();
const assembler = new Assembler();
const cpu = new CPU(memory, registers, logToConsole);

let runInterval = null;

// --- Helper Functions ---

function logToConsole(msg, type = 'info') {
    const div = document.createElement('div');
    div.className = `log-entry ${type}`;
    div.innerText = `> ${msg}`;
    els.console.appendChild(div);
    els.console.scrollTop = els.console.scrollHeight;
}

function updateUI() {
    const ip = registers.get(REGISTERS.IP);
    const sp = registers.get(REGISTERS.SP);
    
    // Update Hex View (Center around IP if possible)
    // Simple lazy scroll logic: if IP moves out of current view window
    if (ip < memory.viewStart || ip > memory.viewStart + 128) {
        memory.viewStart = Math.max(0, ip - 64);
    }
    memory.render('memory-view', ip, sp);
    
    // Update Registers (Handled internally by RegisterFile setter, but ensure flags)
    registers.updateUI();
    
    // Update Stack View
    renderStackView(sp);
    
    // Update Status
    if (cpu.halted) {
        els.status.innerText = "HALTED";
        els.status.className = "status-badge halted";
        clearInterval(runInterval);
        toggleRunControls(false);
    } else if (runInterval) {
        els.status.innerText = "RUNNING";
        els.status.className = "status-badge running";
    } else {
        els.status.innerText = "IDLE";
        els.status.className = "status-badge idle";
    }
}

function renderStackView(sp) {
    let html = '';
    // Show top 8 words of stack
    for(let i=0; i<8; i++) {
        const addr = sp + (i*2);
        if(addr > 0xFFFF) break;
        const val = memory.getWord(addr);
        html += `<div class="stack-item">
            <span class="addr">${toHex16(addr)}</span>
            <span class="val">${toHex16(val)}</span>
        </div>`;
    }
    if (sp >= 0xFFFE) html += `<div class="stack-empty">Stack Empty</div>`;
    els.stackView.innerHTML = html;
}

function toggleRunControls(canRun) {
    els.btnStep.disabled = !canRun;
    els.btnRun.disabled = !canRun;
    els.btnStop.disabled = canRun;
    els.btnAssemble.disabled = !canRun && runInterval; // Lock assemble while running
}

// --- Event Handlers ---

els.btnAssemble.addEventListener('click', () => {
    cpu.reset();
    const source = els.editor.value;
    const result = assembler.assemble(source);
    
    if (result.success) {
        memory.loadProgram(0, result.code); // Load at 0x0000
        logToConsole(`Assembly successful. ${result.code.length} bytes loaded.`, 'success');
        updateUI();
        toggleRunControls(true);
    } else {
        logToConsole(`Assembly Error: ${result.error}`, 'error');
        toggleRunControls(false);
    }
});

els.btnStep.addEventListener('click', () => {
    cpu.step();
    updateUI();
});

els.btnRun.addEventListener('click', () => {
    if (cpu.halted) return;
    els.btnRun.disabled = true;
    els.btnStep.disabled = true;
    els.btnStop.disabled = false;
    
    runInterval = setInterval(() => {
        // Execute a burst of instructions per frame for speed
        for(let i=0; i<5; i++) {
            if(!cpu.step()) {
                clearInterval(runInterval);
                runInterval = null;
                break;
            }
        }
        updateUI();
    }, 50); // 20Hz UI refresh
});

els.btnStop.addEventListener('click', () => {
    clearInterval(runInterval);
    runInterval = null;
    els.btnRun.disabled = false;
    els.btnStep.disabled = false;
    els.btnStop.disabled = true;
    updateUI();
});

els.btnReset.addEventListener('click', () => {
    clearInterval(runInterval);
    cpu.reset();
    updateUI();
    toggleRunControls(false);
    logToConsole("System reset.");
});

els.btnClearConsole.addEventListener('click', () => {
    els.console.innerHTML = '';
});

// Line Numbers Sync
els.editor.addEventListener('input', updateLineNumbers);
els.editor.addEventListener('scroll', () => {
    els.lineNumbers.scrollTop = els.editor.scrollTop;
});

function updateLineNumbers() {
    const lines = els.editor.value.split('\n').length;
    els.lineNumbers.innerHTML = Array(lines).fill(0).map((_, i) => i + 1).join('<br>');
}

// Load Examples
const EXAMPLES = {
    math: `; Simple Math\nMOV AX, 10\nMOV BX, 20\nADD AX, BX\nSUB AX, 5\nHLT`,
    loop: `; Counter Loop\nMOV CX, 5\nMOV AX, 0\nstart:\nADD AX, 1\nDEC CX\nJNZ start\nHLT`,
    stack: `; Stack Demo\nMOV AX, 0xAABB\nPUSH AX\nMOV AX, 0\nPOP BX\nHLT`,
    fib: `; Fibonacci\nMOV AX, 0\nMOV BX, 1\nMOV CX, 10\nloop:\nMOV DX, AX\nADD DX, BX\nMOV AX, BX\nMOV BX, DX\nDEC CX\nJNZ loop\nHLT`
};

els.exampleSelector.addEventListener('change', (e) => {
    const key = e.target.value;
    if (EXAMPLES[key]) {
        els.editor.value = EXAMPLES[key];
        updateLineNumbers();
    }
});

// Initial Render
cpu.reset();
updateUI();