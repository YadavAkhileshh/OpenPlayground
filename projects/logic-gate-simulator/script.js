// Logic Gate Simulator
class LogicGateSimulator {
    constructor() {
        this.canvas = document.getElementById('circuit-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.gates = [];
        this.wires = [];
        this.selectedGate = null;
        this.draggedGate = null;
        this.wireStart = null;
        this.mouse = { x: 0, y: 0 };
        this.nextId = 1;
        this.clockSpeed = 1000;
        this.clocks = [];
        
        this.init();
    }

    init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        this.setupEventListeners();
        this.setupPaletteListeners();
        this.setupModalListeners();
        
        // Start simulation loop
        this.simulate();
        
        // Start clock tick
        setInterval(() => this.tickClocks(), this.clockSpeed);
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        this.draw();
    }

    setupEventListeners() {
        // Canvas mouse events
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.canvas.addEventListener('dblclick', (e) => this.onDoubleClick(e));
        
        // Toolbar buttons
        document.getElementById('btn-clear').addEventListener('click', () => this.clearCircuit());
        document.getElementById('btn-save').addEventListener('click', () => this.saveCircuit());
        document.getElementById('btn-load').addEventListener('click', () => this.showLoadModal());
        document.getElementById('btn-truth-table').addEventListener('click', () => this.showTruthTable());
        document.getElementById('btn-presets').addEventListener('click', () => this.showPresetsModal());
    }

    setupPaletteListeners() {
        const paletteItems = document.querySelectorAll('.gate-item');
        paletteItems.forEach(item => {
            item.addEventListener('mousedown', (e) => {
                const type = item.dataset.type;
                this.createGate(type, 100, 100);
            });
        });
    }

    setupModalListeners() {
        // Close modal buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').classList.add('hidden');
            });
        });

        // Preset cards
        document.querySelectorAll('.preset-card').forEach(card => {
            card.addEventListener('click', () => {
                const preset = card.dataset.preset;
                this.loadPreset(preset);
                document.getElementById('presets-modal').classList.add('hidden');
            });
        });

        // Load circuit button
        document.getElementById('btn-load-confirm').addEventListener('click', () => {
            const json = document.getElementById('circuit-json').value;
            if (json) {
                this.loadFromJson(json);
                document.getElementById('load-modal').classList.add('hidden');
            }
        });
    }

    createGate(type, x, y) {
        const gate = new Gate(this.nextId++, type, x, y);
        this.gates.push(gate);
        
        if (type === 'clock') {
            this.clocks.push(gate);
        }
        
        this.draw();
        return gate;
    }

    onMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;

        // Check for gate selection
        const clickedGate = this.getGateAt(this.mouse.x, this.mouse.y);
        
        if (clickedGate) {
            // Check if clicking on input/output node
            const node = clickedGate.getNodeAt(this.mouse.x, this.mouse.y);
            
            if (node) {
                if (node.type === 'output') {
                    // Start wire from output
                    this.wireStart = { gate: clickedGate, nodeIndex: node.index };
                } else if (node.type === 'input') {
                    // Check if input already has a wire
                    const existingWire = this.wires.find(w => 
                        w.targetGate === clickedGate && w.targetInput === node.index
                    );
                    
                    if (existingWire) {
                        // Remove existing connection
                        this.wires = this.wires.filter(w => w !== existingWire);
                    }
                }
            } else {
                // Start dragging gate
                this.draggedGate = clickedGate;
                this.dragOffset = {
                    x: this.mouse.x - clickedGate.x,
                    y: this.mouse.y - clickedGate.y
                };
            }
        } else {
            // Clicked on empty space - deselect
            this.selectedGate = null;
        }
        
        this.draw();
    }

    onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;

        if (this.draggedGate) {
            this.draggedGate.x = this.mouse.x - this.dragOffset.x;
            this.draggedGate.y = this.mouse.y - this.dragOffset.y;
            this.draw();
        }
    }

    onMouseUp(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;

        if (this.wireStart) {
            // Check if released on a gate input
            const targetGate = this.getGateAt(this.mouse.x, this.mouse.y);
            
            if (targetGate && targetGate !== this.wireStart.gate) {
                const node = targetGate.getNodeAt(this.mouse.x, this.mouse.y);
                
                if (node && node.type === 'input') {
                    // Create wire connection
                    // Remove any existing connection to this input
                    this.wires = this.wires.filter(w => 
                        !(w.targetGate === targetGate && w.targetInput === node.index)
                    );
                    
                    this.wires.push({
                        sourceGate: this.wireStart.gate,
                        sourceOutput: this.wireStart.nodeIndex,
                        targetGate: targetGate,
                        targetInput: node.index
                    });
                }
            }
            
            this.wireStart = null;
        }

        this.draggedGate = null;
        this.draw();
    }

    onDoubleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const gate = this.getGateAt(x, y);
        
        if (gate && gate.type === 'input') {
            // Toggle input value
            gate.value = gate.value ? 0 : 1;
            this.evaluateCircuit();
            this.draw();
        } else if (gate) {
            // Delete gate on double click (except inputs/outputs)
            if (gate.type !== 'input' && gate.type !== 'output') {
                this.deleteGate(gate);
            }
        }
    }

    getGateAt(x, y) {
        // Search in reverse to select top-most gate
        for (let i = this.gates.length - 1; i >= 0; i--) {
            if (this.gates[i].contains(x, y)) {
                return this.gates[i];
            }
        }
        return null;
    }

    deleteGate(gate) {
        // Remove wires connected to this gate
        this.wires = this.wires.filter(w => 
            w.sourceGate !== gate && w.targetGate !== gate
        );
        
        // Remove from clocks array if it's a clock
        this.clocks = this.clocks.filter(c => c !== gate);
        
        // Remove gate
        this.gates = this.gates.filter(g => g !== gate);
        this.draw();
    }

    evaluateCircuit() {
        // Reset all gate values (except inputs)
        this.gates.forEach(gate => {
            if (gate.type !== 'input' && gate.type !== 'clock') {
                gate.value = 0;
                gate.evaluated = false;
            }
        });

        // Evaluate gates in topological order
        let changed = true;
        let iterations = 0;
        const maxIterations = this.gates.length * 2;

        while (changed && iterations < maxIterations) {
            changed = false;
            iterations++;

            this.gates.forEach(gate => {
                if (gate.type === 'input' || gate.type === 'clock') return;

                const inputValues = [];
                
                // Get input values from connected wires
                for (let i = 0; i < gate.inputCount; i++) {
                    const wire = this.wires.find(w => 
                        w.targetGate === gate && w.targetInput === i
                    );
                    
                    if (wire) {
                        inputValues.push(wire.sourceGate.value);
                    } else {
                        inputValues.push(0);
                    }
                }

                const newValue = gate.computeOutput(inputValues);
                
                if (gate.value !== newValue) {
                    gate.value = newValue;
                    changed = true;
                }
                gate.evaluated = true;
            });
        }
    }

    tickClocks() {
        this.clocks.forEach(clock => {
            clock.value = clock.value ? 0 : 1;
        });
        this.evaluateCircuit();
        this.draw();
    }

    simulate() {
        this.evaluateCircuit();
        this.draw();
        requestAnimationFrame(() => this.simulate());
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw wires
        this.wires.forEach(wire => this.drawWire(wire));

        // Draw active wire being created
        if (this.wireStart) {
            const startNode = this.wireStart.gate.getOutputPosition(this.wireStart.nodeIndex);
            this.ctx.beginPath();
            this.ctx.moveTo(startNode.x, startNode.y);
            this.ctx.lineTo(this.mouse.x, this.mouse.y);
            this.ctx.strokeStyle = '#00d4ff';
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([5, 5]);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }

        // Draw gates
        this.gates.forEach(gate => gate.draw(this.ctx));
    }

    drawWire(wire) {
        const start = wire.sourceGate.getOutputPosition(wire.sourceOutput);
        const end = wire.targetGate.getInputPosition(wire.targetInput);

        // Determine wire color based on value
        const color = wire.sourceGate.value ? '#10b981' : '#ef4444';

        this.ctx.beginPath();
        this.ctx.moveTo(start.x, start.y);
        
        // Draw curved wire
        const midX = (start.x + end.x) / 2;
        this.ctx.bezierCurveTo(
            midX, start.y,
            midX, end.y,
            end.x, end.y
        );
        
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        // Draw connection points
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(start.x, start.y, 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(end.x, end.y, 4, 0, Math.PI * 2);
        this.ctx.fill();
    }

    clearCircuit() {
        this.gates = [];
        this.wires = [];
        this.clocks = [];
        this.nextId = 1;
        this.draw();
    }

    saveCircuit() {
        const data = {
            gates: this.gates.map(g => ({
                id: g.id,
                type: g.type,
                x: g.x,
                y: g.y,
                value: g.value
            })),
            wires: this.wires.map(w => ({
                sourceId: w.sourceGate.id,
                sourceOutput: w.sourceOutput,
                targetId: w.targetGate.id,
                targetInput: w.targetInput
            }))
        };
        
        const json = JSON.stringify(data, null, 2);
        
        // Copy to clipboard
        navigator.clipboard.writeText(json).then(() => {
            this.showStatus('Circuit copied to clipboard!');
        });
    }

    showLoadModal() {
        document.getElementById('circuit-json').value = '';
        document.getElementById('load-modal').classList.remove('hidden');
    }

    loadFromJson(json) {
        try {
            const data = JSON.parse(json);
            this.clearCircuit();
            
            // Recreate gates
            const gateMap = new Map();
            data.gates.forEach(g => {
                const gate = this.createGate(g.type, g.x, g.y);
                gate.id = g.id;
                gate.value = g.value || 0;
                gateMap.set(g.id, gate);
            });
            
            // Update nextId
            this.nextId = Math.max(...data.gates.map(g => g.id)) + 1;
            
            // Recreate wires
            data.wires.forEach(w => {
                const sourceGate = gateMap.get(w.sourceId);
                const targetGate = gateMap.get(w.targetId);
                
                if (sourceGate && targetGate) {
                    this.wires.push({
                        sourceGate: sourceGate,
                        sourceOutput: w.sourceOutput,
                        targetGate: targetGate,
                        targetInput: w.targetInput
                    });
                }
            });
            
            this.evaluateCircuit();
            this.draw();
            this.showStatus('Circuit loaded successfully!');
        } catch (e) {
            alert('Invalid circuit JSON');
        }
    }

    showTruthTable() {
        // Find input and output gates
        const inputs = this.gates.filter(g => g.type === 'input');
        const outputs = this.gates.filter(g => g.type === 'output');
        
        if (inputs.length === 0 || outputs.length === 0) {
            alert('Circuit needs at least one input and one output for truth table');
            return;
        }

        // Generate all combinations
        const rows = [];
        const numCombinations = Math.pow(2, inputs.length);
        
        for (let i = 0; i < numCombinations; i++) {
            // Set input values
            inputs.forEach((input, index) => {
                input.value = (i >> index) & 1;
            });
            
            this.evaluateCircuit();
            
            const row = {
                inputs: inputs.map(g => g.value),
                outputs: outputs.map(g => g.value)
            };
            rows.push(row);
        }

        // Build table HTML
        let tableHTML = '<table class="truth-table"><thead><tr>';
        inputs.forEach((g, i) => tableHTML += `<th>Input ${i + 1}</th>`);
        outputs.forEach((g, i) => tableHTML += `<th>Output ${i + 1}</th>`);
        tableHTML += '</tr></thead><tbody>';
        
        rows.forEach(row => {
            tableHTML += '<tr>';
            row.inputs.forEach(val => {
                tableHTML += `<td class="value-${val}">${val}</td>`;
            });
            row.outputs.forEach(val => {
                tableHTML += `<td class="value-${val}">${val}</td>`;
            });
            tableHTML += '</tr>';
        });
        
        tableHTML += '</tbody></table>';
        
        document.getElementById('truth-table-container').innerHTML = tableHTML;
        document.getElementById('truth-table-modal').classList.remove('hidden');
    }

    showPresetsModal() {
        document.getElementById('presets-modal').classList.remove('hidden');
    }

    loadPreset(preset) {
        this.clearCircuit();
        
        switch (preset) {
            case 'half-adder':
                this.createHalfAdder();
                break;
            case 'full-adder':
                this.createFullAdder();
                break;
            case 'sr-latch':
                this.createSRLatch();
                break;
            case 'binary-counter':
                this.createBinaryCounter();
                break;
        }
        
        this.evaluateCircuit();
        this.draw();
    }

    createHalfAdder() {
        const input1 = this.createGate('input', 100, 150);
        const input2 = this.createGate('input', 100, 250);
        const xorGate = this.createGate('xor', 300, 150);
        const andGate = this.createGate('and', 300, 250);
        const sumOutput = this.createGate('output', 500, 150);
        const carryOutput = this.createGate('output', 500, 250);
        
        this.wires.push(
            { sourceGate: input1, sourceOutput: 0, targetGate: xorGate, targetInput: 0 },
            { sourceGate: input2, sourceOutput: 0, targetGate: xorGate, targetInput: 1 },
            { sourceGate: input1, sourceOutput: 0, targetGate: andGate, targetInput: 0 },
            { sourceGate: input2, sourceOutput: 0, targetGate: andGate, targetInput: 1 },
            { sourceGate: xorGate, sourceOutput: 0, targetGate: sumOutput, targetInput: 0 },
            { sourceGate: andGate, sourceOutput: 0, targetGate: carryOutput, targetInput: 0 }
        );
    }

    createFullAdder() {
        const a = this.createGate('input', 50, 100);
        const b = this.createGate('input', 50, 200);
        const cin = this.createGate('input', 50, 300);
        
        const xor1 = this.createGate('xor', 200, 130);
        const xor2 = this.createGate('xor', 350, 180);
        const and1 = this.createGate('and', 200, 220);
        const and2 = this.createGate('and', 350, 280);
        const or1 = this.createGate('or', 500, 250);
        
        const sum = this.createGate('output', 550, 180);
        const cout = this.createGate('output', 650, 250);
        
        this.wires.push(
            { sourceGate: a, sourceOutput: 0, targetGate: xor1, targetInput: 0 },
            { sourceGate: b, sourceOutput: 0, targetGate: xor1, targetInput: 1 },
            { sourceGate: xor1, sourceOutput: 0, targetGate: xor2, targetInput: 0 },
            { sourceGate: cin, sourceOutput: 0, targetGate: xor2, targetInput: 1 },
            { sourceGate: a, sourceOutput: 0, targetGate: and1, targetInput: 0 },
            { sourceGate: b, sourceOutput: 0, targetGate: and1, targetInput: 1 },
            { sourceGate: cin, sourceOutput: 0, targetGate: and2, targetInput: 0 },
            { sourceGate: xor1, sourceOutput: 0, targetGate: and2, targetInput: 1 },
            { sourceGate: and1, sourceOutput: 0, targetGate: or1, targetInput: 0 },
            { sourceGate: and2, sourceOutput: 0, targetGate: or1, targetInput: 1 },
            { sourceGate: xor2, sourceOutput: 0, targetGate: sum, targetInput: 0 },
            { sourceGate: or1, sourceOutput: 0, targetGate: cout, targetInput: 0 }
        );
    }

    createSRLatch() {
        const s = this.createGate('input', 100, 150);
        const r = this.createGate('input', 100, 250);
        
        const nor1 = this.createGate('nor', 300, 150);
        const nor2 = this.createGate('nor', 300, 250);
        
        const q = this.createGate('output', 500, 150);
        const qBar = this.createGate('output', 500, 250);
        
        this.wires.push(
            { sourceGate: s, sourceOutput: 0, targetGate: nor1, targetInput: 0 },
            { sourceGate: r, sourceOutput: 0, targetGate: nor2, targetInput: 1 },
            { sourceGate: nor1, sourceOutput: 0, targetGate: nor2, targetInput: 0 },
            { sourceGate: nor2, sourceOutput: 0, targetGate: nor1, targetInput: 1 },
            { sourceGate: nor1, sourceOutput: 0, targetGate: q, targetInput: 0 },
            { sourceGate: nor2, sourceOutput: 0, targetGate: qBar, targetInput: 0 }
        );
    }

    createBinaryCounter() {
        const clock = this.createGate('clock', 50, 200);
        
        // T flip-flops (using XOR as T input)
        const xor1 = this.createGate('xor', 200, 100);
        const xor2 = this.createGate('xor', 350, 150);
        const xor3 = this.createGate('xor', 500, 200);
        const xor4 = this.createGate('xor', 650, 250);
        
        // Outputs
        const out1 = this.createGate('output', 800, 100);
        const out2 = this.createGate('output', 800, 150);
        const out3 = this.createGate('output', 800, 200);
        const out4 = this.createGate('output', 800, 250);
        
        this.wires.push(
            { sourceGate: clock, sourceOutput: 0, targetGate: xor1, targetInput: 0 },
            { sourceGate: xor1, sourceOutput: 0, targetGate: xor1, targetInput: 1 },
            { sourceGate: xor1, sourceOutput: 0, targetGate: xor2, targetInput: 0 },
            { sourceGate: xor2, sourceOutput: 0, targetGate: xor2, targetInput: 1 },
            { sourceGate: xor2, sourceOutput: 0, targetGate: xor3, targetInput: 0 },
            { sourceGate: xor3, sourceOutput: 0, targetGate: xor3, targetInput: 1 },
            { sourceGate: xor3, sourceOutput: 0, targetGate: xor4, targetInput: 0 },
            { sourceGate: xor4, sourceOutput: 0, targetGate: xor4, targetInput: 1 },
            { sourceGate: xor1, sourceOutput: 0, targetGate: out1, targetInput: 0 },
            { sourceGate: xor2, sourceOutput: 0, targetGate: out2, targetInput: 0 },
            { sourceGate: xor3, sourceOutput: 0, targetGate: out3, targetInput: 0 },
            { sourceGate: xor4, sourceOutput: 0, targetGate: out4, targetInput: 0 }
        );
    }

    showStatus(message) {
        document.getElementById('status-text').textContent = message;
        setTimeout(() => {
            document.getElementById('status-text').textContent = 'Ready - Drag gates from palette, click to toggle inputs';
        }, 3000);
    }
}

// Gate Class
class Gate {
    constructor(id, type, x, y) {
        this.id = id;
        this.type = type;
        this.x = x;
        this.y = y;
        this.value = 0;
        this.width = 80;
        this.height = 50;
        this.evaluated = false;
        
        // Set input/output counts based on type
        switch (type) {
            case 'input':
            case 'clock':
                this.inputCount = 0;
                this.outputCount = 1;
                this.height = 40;
                this.width = 60;
                break;
            case 'output':
                this.inputCount = 1;
                this.outputCount = 0;
                this.height = 40;
                this.width = 60;
                break;
            case 'not':
                this.inputCount = 1;
                this.outputCount = 1;
                break;
            default:
                this.inputCount = 2;
                this.outputCount = 1;
        }
    }

    computeOutput(inputs) {
        switch (this.type) {
            case 'and':
                return inputs.every(v => v) ? 1 : 0;
            case 'or':
                return inputs.some(v => v) ? 1 : 0;
            case 'not':
                return inputs[0] ? 0 : 1;
            case 'xor':
                return inputs.filter(v => v).length === 1 ? 1 : 0;
            case 'nand':
                return inputs.every(v => v) ? 0 : 1;
            case 'nor':
                return inputs.some(v => v) ? 0 : 1;
            case 'seven-segment':
                // Just pass through first input for visualization
                return inputs[0] || 0;
            default:
                return 0;
        }
    }

    contains(x, y) {
        return x >= this.x && x <= this.x + this.width &&
               y >= this.y && y <= this.y + this.height;
    }

    getNodeAt(x, y) {
        // Check input nodes
        for (let i = 0; i < this.inputCount; i++) {
            const pos = this.getInputPosition(i);
            const dx = x - pos.x;
            const dy = y - pos.y;
            if (dx * dx + dy * dy < 100) { // 10px radius
                return { type: 'input', index: i };
            }
        }
        
        // Check output nodes
        for (let i = 0; i < this.outputCount; i++) {
            const pos = this.getOutputPosition(i);
            const dx = x - pos.x;
            const dy = y - pos.y;
            if (dx * dx + dy * dy < 100) {
                return { type: 'output', index: i };
            }
        }
        
        return null;
    }

    getInputPosition(index) {
        const spacing = this.height / (this.inputCount + 1);
        return {
            x: this.x,
            y: this.y + spacing * (index + 1)
        };
    }

    getOutputPosition(index) {
        const spacing = this.height / (this.outputCount + 1);
        return {
            x: this.x + this.width,
            y: this.y + spacing * (index + 1)
        };
    }

    draw(ctx) {
        // Gate colors
        const colors = {
            input: '#10b981',
            output: '#f59e0b',
            and: '#3b82f6',
            or: '#8b5cf6',
            not: '#ec4899',
            xor: '#06b6d4',
            nand: '#6366f1',
            nor: '#f43f5e',
            clock: '#f97316',
            'seven-segment': '#14b8a6'
        };

        const color = colors[this.type] || '#6b7280';
        const isActive = this.value === 1;

        // Draw gate body
        ctx.fillStyle = isActive ? color : this.adjustColor(color, -40);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;

        // Draw rounded rectangle
        this.roundRect(ctx, this.x, this.y, this.width, this.height, 6);
        ctx.fill();
        ctx.stroke();

        // Draw gate label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Segoe UI';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        let label = this.type.toUpperCase();
        if (this.type === 'seven-segment') label = '7-SEG';
        if (this.type === 'clock') label = 'CLK';
        
        ctx.fillText(label, this.x + this.width / 2, this.y + this.height / 2);

        // Draw input nodes
        for (let i = 0; i < this.inputCount; i++) {
            const pos = this.getInputPosition(i);
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#374151';
            ctx.fill();
            ctx.strokeStyle = '#6b7280';
            ctx.stroke();
        }

        // Draw output nodes
        for (let i = 0; i < this.outputCount; i++) {
            const pos = this.getOutputPosition(i);
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = isActive ? '#10b981' : '#374151';
            ctx.fill();
            ctx.strokeStyle = isActive ? '#10b981' : '#6b7280';
            ctx.stroke();
        }

        // Draw value indicator for inputs/outputs
        if (this.type === 'input' || this.type === 'output' || this.type === 'clock') {
            ctx.fillStyle = isActive ? '#10b981' : '#ef4444';
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y - 10, 6, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 10px Segoe UI';
            ctx.fillText(this.value.toString(), this.x + this.width / 2, this.y - 10);
        }
    }

    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    adjustColor(hex, amount) {
        const num = parseInt(hex.replace('#', ''), 16);
        const r = Math.max(0, Math.min(255, (num >> 16) + amount));
        const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
        const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
        return `#${(0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1)}`;
    }
}

// Initialize simulator when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.simulator = new LogicGateSimulator();
});
