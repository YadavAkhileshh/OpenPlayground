/**
 * Logic-Gate-Sim Engine
 * Handles component rendering, drag-and-drop, wiring (Bézier curves), 
 * and logic signal propagation.
 */

// --- Constants ---
const GRID_SIZE = 20;
const COMP_WIDTH = 80;
const COMP_HEIGHT = 50;
const PORT_RADIUS = 6;

// --- Config ---
const COLORS = {
    bg: '#1e1e24',
    compBg: '#2a2a35',
    compBorder: '#4cc9f0',
    text: '#fff',
    wireOff: '#4a4e69',
    wireOn: '#fee440',
    selected: '#f72585'
};

// Component Definitions (Inputs/Outputs positions)
const COMP_DEFS = {
    AND: { inputs: 2, outputs: 1, label: 'AND' },
    OR:  { inputs: 2, outputs: 1, label: 'OR' },
    XOR: { inputs: 2, outputs: 1, label: 'XOR' },
    NAND:{ inputs: 2, outputs: 1, label: 'NAND' },
    NOT: { inputs: 1, outputs: 1, label: 'NOT' },
    SWITCH: { inputs: 0, outputs: 1, label: 'SW', type: 'source' },
    BUTTON: { inputs: 0, outputs: 1, label: 'BTN', type: 'source' },
    BULB:   { inputs: 1, outputs: 0, label: 'OUT', type: 'sink' }
};

// --- State ---
let components = [];
let wires = [];
let nextId = 1;

let isDragging = false;
let draggedComp = null;
let dragOffset = { x: 0, y: 0 };

let isWiring = false;
let wireStartComp = null;
let wireStartPort = null; // {type: 'in'|'out', index: 0}
let mousePos = { x: 0, y: 0 };

let selectedComp = null;

// --- DOM ---
const canvas = document.getElementById('circuit-canvas');
const ctx = canvas.getContext('2d');
const dropZone = document.getElementById('drop-zone');

// --- Initialization ---
function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupInteractions();
    loop();
}

function resizeCanvas() {
    canvas.width = dropZone.clientWidth;
    canvas.height = dropZone.clientHeight;
}

// --- Component Class ---
class Component {
    constructor(type, x, y) {
        this.id = nextId++;
        this.type = type;
        this.x = x;
        this.y = y;
        this.w = COMP_WIDTH;
        this.h = COMP_HEIGHT;
        this.def = COMP_DEFS[type];
        
        this.state = false; // For switches/bulbs
        this.output = false; // Logic level
        
        // Input logic states (array of boolean)
        this.inputStates = new Array(this.def.inputs).fill(false);
    }

    update() {
        // Logic Processing
        const inp = this.inputStates;
        
        switch (this.type) {
            case 'AND': this.output = inp[0] && inp[1]; break;
            case 'OR':  this.output = inp[0] || inp[1]; break;
            case 'XOR': this.output = inp[0] !== inp[1]; break; // JS XOR
            case 'NAND':this.output = !(inp[0] && inp[1]); break;
            case 'NOT': this.output = !inp[0]; break;
            case 'SWITCH': this.output = this.state; break;
            case 'BUTTON': this.output = this.state; break;
            case 'BULB': this.state = inp[0]; break; // Bulb reflects input
        }
    }

    draw() {
        const x = this.x; 
        const y = this.y;

        // Body
        ctx.fillStyle = (selectedComp === this) ? '#3a3a45' : COLORS.compBg;
        ctx.strokeStyle = (selectedComp === this) ? COLORS.selected : COLORS.compBorder;
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.roundRect(x, y, this.w, this.h, 6);
        ctx.fill();
        ctx.stroke();

        // Label / Icon
        ctx.fillStyle = COLORS.text;
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        if (this.type === 'BULB') {
            ctx.fillStyle = this.state ? COLORS.wireOn : '#444';
            ctx.beginPath();
            ctx.arc(x + this.w/2, y + this.h/2, 10, 0, Math.PI*2);
            ctx.fill();
        } else if (this.type === 'SWITCH') {
            ctx.fillText(this.state ? 'ON' : 'OFF', x + this.w/2, y + this.h/2);
        } else {
            ctx.fillText(this.def.label, x + this.w/2, y + this.h/2);
        }

        // Draw Ports
        this.drawPorts();
    }

    drawPorts() {
        // Inputs (Left)
        const inCount = this.def.inputs;
        for(let i=0; i<inCount; i++) {
            const py = this.y + (this.h * (i+1)) / (inCount+1);
            this.drawPort(this.x, py, this.inputStates[i]); // Color based on active wire?
        }

        // Outputs (Right)
        const outCount = this.def.outputs;
        for(let i=0; i<outCount; i++) {
            const py = this.y + (this.h * (i+1)) / (outCount+1);
            this.drawPort(this.x + this.w, py, this.output);
        }
    }

    drawPort(x, y, isActive) {
        ctx.beginPath();
        ctx.arc(x, y, PORT_RADIUS, 0, Math.PI*2);
        ctx.fillStyle = isActive ? COLORS.wireOn : '#888';
        ctx.fill();
        ctx.stroke();
    }

    // Helper to get exact coordinate of a port
    getPortPos(isInput, index) {
        const count = isInput ? this.def.inputs : this.def.outputs;
        const px = isInput ? this.x : this.x + this.w;
        const py = this.y + (this.h * (index+1)) / (count+1);
        return {x: px, y: py};
    }
}

// --- Interaction Logic ---
function setupInteractions() {
    // 1. Drag from Toolbox
    document.querySelectorAll('.component-btn').forEach(btn => {
        btn.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('type', btn.dataset.type);
        });
    });

    dropZone.addEventListener('dragover', (e) => e.preventDefault());
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        const type = e.dataTransfer.getData('type');
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left - COMP_WIDTH/2;
        const y = e.clientY - rect.top - COMP_HEIGHT/2;
        
        // Snap to grid
        const snapX = Math.round(x / GRID_SIZE) * GRID_SIZE;
        const snapY = Math.round(y / GRID_SIZE) * GRID_SIZE;

        components.push(new Component(type, snapX, snapY));
    });

    // 2. Canvas Interactions (Click, Drag, Wire)
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    
    // Keyboard (Delete)
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Delete' && selectedComp) {
            deleteComponent(selectedComp);
            selectedComp = null;
        }
    });

    // Toolbar Buttons
    document.getElementById('btn-clear').addEventListener('click', () => {
        components = [];
        wires = [];
    });
    document.getElementById('btn-delete').addEventListener('click', () => {
        if(selectedComp) deleteComponent(selectedComp);
    });
}

function onMouseDown(e) {
    const {x, y} = getMousePos(e);
    mousePos = {x, y};

    // Check for Port click (Start Wiring)
    const portHit = getHitPort(x, y);
    if (portHit) {
        isWiring = true;
        wireStartComp = portHit.comp;
        wireStartPort = portHit.port;
        return;
    }

    // Check for Component click (Select / Drag / Toggle)
    const compHit = getHitComponent(x, y);
    if (compHit) {
        if (compHit.type === 'SWITCH') {
            compHit.state = !compHit.state; // Toggle switch
        } else if (compHit.type === 'BUTTON') {
            compHit.state = true; // Press button
        }
        
        selectedComp = compHit;
        isDragging = true;
        draggedComp = compHit;
        dragOffset = { x: x - compHit.x, y: y - compHit.y };
        return;
    }

    // Clicked empty space
    selectedComp = null;
}

function onMouseMove(e) {
    const {x, y} = getMousePos(e);
    mousePos = {x, y};

    if (isDragging && draggedComp) {
        draggedComp.x = Math.round((x - dragOffset.x) / GRID_SIZE) * GRID_SIZE;
        draggedComp.y = Math.round((y - dragOffset.y) / GRID_SIZE) * GRID_SIZE;
    }
}

function onMouseUp(e) {
    const {x, y} = getMousePos(e);

    // Finish Wiring
    if (isWiring) {
        const portHit = getHitPort(x, y);
        if (portHit) {
            // Validate Connection (Must be Output -> Input or Input -> Output)
            // And different components
            const startIsInput = wireStartPort.type === 'in';
            const endIsInput = portHit.port.type === 'in';

            if (startIsInput !== endIsInput && wireStartComp !== portHit.comp) {
                // Determine Source and Target
                const source = !startIsInput ? wireStartComp : portHit.comp;
                const sourcePort = !startIsInput ? wireStartPort.index : portHit.port.index;
                
                const target = startIsInput ? wireStartComp : portHit.comp;
                const targetPort = startIsInput ? wireStartPort.index : portHit.port.index;

                // Create Wire
                wires.push({
                    fromComp: source, fromPort: sourcePort,
                    toComp: target, toPort: targetPort
                });
            }
        }
    }

    // Release Button
    if (draggedComp && draggedComp.type === 'BUTTON') {
        draggedComp.state = false;
    }

    isDragging = false;
    draggedComp = null;
    isWiring = false;
    wireStartComp = null;
}

// --- Logic Propagation Loop ---
function simulate() {
    // 1. Reset all inputs (assume default low)
    components.forEach(c => c.inputStates.fill(false));

    // 2. Pass signals through wires
    wires.forEach(w => {
        // Source component calculated its output in previous step
        // We pass that value to the target component's input slot
        const signal = w.fromComp.output;
        w.toComp.inputStates[w.toPort] = signal;
        w.isActive = signal; // Store state for rendering wire color
    });

    // 3. Update components based on new inputs
    components.forEach(c => c.update());
}

function loop() {
    simulate();
    draw();
    requestAnimationFrame(loop);
}

// --- Rendering ---
function draw() {
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Wires
    wires.forEach(w => {
        const p1 = w.fromComp.getPortPos(false, w.fromPort);
        const p2 = w.toComp.getPortPos(true, w.toPort);
        
        drawWire(p1, p2, w.isActive);
    });

    // Draw Temp Wire (Dragging)
    if (isWiring) {
        const startIsInput = wireStartPort.type === 'in';
        const p1 = wireStartComp.getPortPos(startIsInput, wireStartPort.index);
        drawWire(p1, mousePos, false, true);
    }

    // Draw Components
    components.forEach(c => c.draw());
}

function drawWire(p1, p2, isActive, isDashed = false) {
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    
    // Bézier Curve for smooth wires
    const cp1 = { x: p1.x + 50, y: p1.y };
    const cp2 = { x: p2.x - 50, y: p2.y };
    
    ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, p2.x, p2.y);
    
    ctx.lineWidth = 4;
    ctx.strokeStyle = isActive ? COLORS.wireOn : COLORS.wireOff;
    if (isDashed) ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
}

// --- Helpers ---
function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

function getHitComponent(x, y) {
    // Reverse iterate to grab top-most
    for (let i = components.length - 1; i >= 0; i--) {
        const c = components[i];
        if (x >= c.x && x <= c.x + c.w && y >= c.y && y <= c.y + c.h) {
            return c;
        }
    }
    return null;
}

function getHitPort(x, y) {
    for (let c of components) {
        // Check Inputs
        for (let i=0; i<c.def.inputs; i++) {
            const p = c.getPortPos(true, i);
            if (dist(x, y, p.x, p.y) < 10) return { comp: c, port: {type:'in', index:i} };
        }
        // Check Outputs
        for (let i=0; i<c.def.outputs; i++) {
            const p = c.getPortPos(false, i);
            if (dist(x, y, p.x, p.y) < 10) return { comp: c, port: {type:'out', index:i} };
        }
    }
    return null;
}

function dist(x1, y1, x2, y2) {
    return Math.sqrt((x1-x2)**2 + (y1-y2)**2);
}

function deleteComponent(comp) {
    // Remove component
    components = components.filter(c => c !== comp);
    // Remove associated wires
    wires = wires.filter(w => w.fromComp !== comp && w.toComp !== comp);
}

// Start
init();