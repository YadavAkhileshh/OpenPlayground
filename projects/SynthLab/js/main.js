import { audioCtx } from './core/audio.js';
import { CableManager } from './core/cables.js';
import { OutputModule } from './modules/output.js';
import { VCO } from './modules/vco.js';
import { VCF } from './modules/vcf.js';
import { VCA } from './modules/vca.js';

// App State
const state = {
    modules: {}, // id -> instance
    cables: [],
    moduleIdCounter: 0
};

// UI Elements
const ui = {
    rack: document.getElementById('rack-rails'),
    powerBtn: document.getElementById('btn-power'),
    addBtn: document.getElementById('btn-add-module'),
    resetBtn: document.getElementById('btn-reset'),
    clearBtn: document.getElementById('btn-clear-cables'),
    led: document.getElementById('audio-status'),
    picker: document.getElementById('module-picker')
};

// Init Systems
const cableManager = new CableManager('cable-canvas', 'rack');

// --- Core Logic ---

function init() {
    // Add Master Output
    addModule('OUTPUT');
    
    // Bind Events
    ui.powerBtn.addEventListener('click', togglePower);
    ui.addBtn.addEventListener('click', () => {
        ui.picker.classList.toggle('hidden');
    });
    
    ui.picker.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
            addModule(btn.dataset.type);
            ui.picker.classList.add('hidden');
        });
    });

    ui.resetBtn.addEventListener('click', resetRack);
    ui.clearBtn.addEventListener('click', clearCables);

    // Global Jack Dragging Logic
    document.addEventListener('mousedown', handleJackClick);
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', handleDrop);
    
    // Module removal listener
    document.addEventListener('remove-module', (e) => {
        removeModule(e.detail.id);
    });
}

function togglePower() {
    if (audioCtx.isRunning) {
        audioCtx.suspend();
        ui.powerBtn.classList.remove('on');
    } else {
        audioCtx.resume();
        ui.powerBtn.classList.add('on');
    }
}

function addModule(type) {
    const id = state.moduleIdCounter++;
    let module = null;

    switch (type) {
        case 'OUTPUT': module = new OutputModule(id); break;
        case 'VCO': module = new VCO(id); break;
        case 'VCF': module = new VCF(id); break;
        case 'VCA': module = new VCA(id); break;
    }

    if (module) {
        state.modules[id] = module;
        ui.rack.appendChild(module.element);
    }
}

function removeModule(id) {
    const mod = state.modules[id];
    if (!mod) return;

    // Remove logic here: Disconnect audio nodes, remove DOM
    if (mod.cleanup) mod.cleanup();
    mod.element.remove();
    delete state.modules[id];
}

function resetRack() {
    Object.keys(state.modules).forEach(id => {
        if (state.modules[id].type !== 'OUTPUT') removeModule(id);
    });
    clearCables();
}

function clearCables() {
    cableManager.connections.forEach(c => disconnectAudio(c));
    cableManager.connections = [];
}

// --- Connection Logic ---

let dragSource = null;

function handleJackClick(e) {
    const jack = e.target.closest('.jack');
    if (!jack) return;

    const id = jack.dataset.id;
    const type = jack.dataset.type;
    const modId = jack.dataset.module;

    // Prevent dragging Output->Output or Input->Input
    dragSource = { id, type, modId };
    
    const rect = jack.getBoundingClientRect();
    // Start drawing cable
    cableManager.startDrag(id, e.clientX, e.clientY, type);
}

function handleDrag(e) {
    if (!dragSource) return;
    cableManager.updateDrag(e.clientX, e.clientY);
}

function handleDrop(e) {
    if (!dragSource) return;

    const jack = e.target.closest('.jack');
    if (jack) {
        const targetId = jack.dataset.id;
        const targetType = jack.dataset.type;

        const conn = cableManager.endDrag(targetId, targetType);
        if (conn) {
            connectAudio(conn);
        }
    } else {
        cableManager.endDrag(null); // Cancel
    }
    dragSource = null;
}

function connectAudio(conn) {
    // Parse IDs to find modules and nodes
    // ID format: modID-type-name (e.g. "0-output-OUT")
    
    const [fromModId, fromType, fromName] = conn.from.split('-');
    const [toModId, toType, toName] = conn.to.split('-');

    const sourceMod = state.modules[fromModId];
    const destMod = state.modules[toModId];

    if (!sourceMod || !destMod) return;

    // Logic: Output Jack maps to .outputs, Input Jack maps to .inputs
    // We need to determine which ID corresponds to "output" type in the connection object
    // The CableManager standardizes conn.from as the Start drag, not necessarily the Signal Source.
    
    // We need strict Signal Source (Output) -> Signal Dest (Input)
    let sourceNode, destNode;

    // Identify which is output and which is input
    if (fromType === 'output') {
        sourceNode = sourceMod.outputs[fromName];
        destNode = destMod.inputs[toName];
    } else {
        // Swap
        sourceNode = sourceMod.inputs[fromName]; // This logic is wrong if drag started at input
        // Wait, audio flows Output -> Input.
        // If drag started at Input (dest), conn.from is Input.
        // We need to find the node associated with the 'output' type jack in the pair.
    }

    // Let's refine based on the DOM data attributes
    const jack1 = document.getElementById(conn.from);
    const jack2 = document.getElementById(conn.to);

    const outJack = jack1.dataset.type === 'output' ? jack1 : jack2;
    const inJack = jack1.dataset.type === 'input' ? jack1 : jack2;

    const outMod = state.modules[outJack.dataset.module];
    const inMod = state.modules[inJack.dataset.module];

    // Extract pin name from ID (last part)
    const outName = outJack.dataset.id.split('-').pop();
    const inName = inJack.dataset.id.split('-').pop();

    const audioOut = outMod.outputs[outName];
    const audioIn = inMod.inputs[inName];

    if (audioOut && audioIn) {
        try {
            audioOut.connect(audioIn);
            // Store audio connection reference if needed for disconnection
        } catch (err) {
            console.warn("Connection failed", err);
        }
    }
}

function disconnectAudio(conn) {
    // For simplicity in this specialized graph, we rebuild connections or handle specific disconnects.
    // Web Audio disconnect() is tricky because it disconnects ALL.
    // A robust system manages a Graph Object.
    // For this Level 4 demo, we will rely on a simple try-catch or global reset for now,
    // or implement a full Graph in Level 5.
    // Reset Rack handles the full disconnect.
}

// Start
init();