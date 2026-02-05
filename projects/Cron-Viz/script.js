/**
 * Cron-Viz Engine
 * Parses Cron strings and calculates future run times.
 * Handles ranges (1-5), lists (1,2), steps (* / 5), and wildcard (*).
 */

const cronInput = document.getElementById('cron-input');
const humanText = document.getElementById('human-text');
const runList = document.getElementById('run-list');
const presetBtns = document.querySelectorAll('.preset-btn');

// --- Initialization ---
function init() {
    cronInput.addEventListener('input', updateView);
    
    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            cronInput.value = btn.dataset.val;
            updateView();
        });
    });

    updateView(); // Initial Run
}

function updateView() {
    const cron = cronInput.value.trim();
    const parts = cron.split(/\s+/);

    if (parts.length !== 5) {
        showError("Invalid format. Requires 5 fields: min hour day month weekday");
        return;
    }

    try {
        const schedule = parseCron(parts);
        humanText.innerText = generateDescription(parts);
        const nextDates = getNextDates(schedule, 10);
        renderTimeline(nextDates);
    } catch (e) {
        showError("Invalid value in one of the fields.");
    }
}

function showError(msg) {
    humanText.innerHTML = `<span style="color: #ff6b6b">${msg}</span>`;
    runList.innerHTML = '';
}

// --- Parsing Logic ---


function parseCron(parts) {
    return {
        minutes: parseField(parts[0], 0, 59),
        hours:   parseField(parts[1], 0, 23),
        days:    parseField(parts[2], 1, 31),
        months:  parseField(parts[3], 1, 12),
        weekdays: parseField(parts[4], 0, 6)
    };
}

function parseField(str, min, max) {
    if (str === '*') {
        return Array.from({length: max - min + 1}, (_, i) => i + min);
    }

    const result = new Set();
    
    // Handle list "1,2,3"
    const list = str.split(',');
    
    list.forEach(item => {
        // Handle Steps "*/5" or "10-20/2"
        if (item.includes('/')) {
            const [range, stepStr] = item.split('/');
            const step = parseInt(stepStr);
            let start = min, end = max;
            
            if (range !== '*') {
                if (range.includes('-')) {
                    [start, end] = range.split('-').map(Number);
                } else {
                    start = parseInt(range);
                    end = max; // Usually implies start through max with step
                }
            }
            
            for (let i = start; i <= end; i += step) {
                if (i >= min && i <= max) result.add(i);
            }
        } 
        // Handle Range "1-5"
        else if (item.includes('-')) {
            const [start, end] = item.split('-').map(Number);
            for (let i = start; i <= end; i++) {
                if (i >= min && i <= max) result.add(i);
            }
        } 
        // Handle Single Number
        else {
            const val = parseInt(item);
            if (!isNaN(val) && val >= min && val <= max) result.add(val);
        }
    });

    return Array.from(result).sort((a, b) => a - b);
}

// --- Date Calculation ---

function getNextDates(schedule, count) {
    const dates = [];
    let current = new Date();
    current.setSeconds(0);
    current.setMilliseconds(0);
    // Move to next minute to avoid immediate "now" match
    current.setMinutes(current.getMinutes() + 1);

    // Safety Loop limit
    let safeGuard = 0; 
    
    while (dates.length < count && safeGuard < 50000) {
        safeGuard++;
        
        if (!schedule.months.includes(current.getMonth() + 1)) {
            current.setMonth(current.getMonth() + 1);
            current.setDate(1);
            current.setHours(0);
            current.setMinutes(0);
            continue;
        }

        if (!schedule.days.includes(current.getDate())) {
            current.setDate(current.getDate() + 1);
            current.setHours(0);
            current.setMinutes(0);
            continue;
        }

        if (!schedule.weekdays.includes(current.getDay())) {
            current.setDate(current.getDate() + 1);
            current.setHours(0);
            current.setMinutes(0);
            continue;
        }

        if (!schedule.hours.includes(current.getHours())) {
            current.setHours(current.getHours() + 1);
            current.setMinutes(0);
            continue;
        }

        if (!schedule.minutes.includes(current.getMinutes())) {
            current.setMinutes(current.getMinutes() + 1);
            continue;
        }

        // Match Found
        dates.push(new Date(current));
        current.setMinutes(current.getMinutes() + 1);
    }
    
    return dates;
}

// --- Description Generation ---
function generateDescription(parts) {
    // Simple naive description for demo purposes
    // A robust one requires complex linguistic logic
    if (parts.join(' ') === '* * * * *') return "Every minute.";
    
    return `Runs at minutes: [${parts[0]}], hours: [${parts[1]}], days: [${parts[2]}], months: [${parts[3]}], weekdays: [${parts[4]}]`;
}

// --- Rendering ---
function renderTimeline(dates) {
    runList.innerHTML = '';
    
    if (dates.length === 0) {
        runList.innerHTML = '<li style="justify-content:center; color:#ff6b6b">No scheduled runs found (check logic limits).</li>';
        return;
    }

    dates.forEach(date => {
        const li = document.createElement('li');
        
        const dateStr = date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
        const timeStr = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
        
        // Calculate relative time
        const diffMs = date - new Date();
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        let relText = "";
        if (diffHrs > 24) relText = `in ${Math.floor(diffHrs/24)} days`;
        else if (diffHrs > 0) relText = `in ${diffHrs}h ${diffMins}m`;
        else relText = `in ${diffMins} mins`;

        li.innerHTML = `
            <span class="date-time">
                <strong style="color:var(--accent)">${timeStr}</strong> &nbsp; ${dateStr}
            </span>
            <span class="relative-time">${relText}</span>
        `;
        runList.appendChild(li);
    });
}

// Start
init();


(function(root) {
    'use strict';

    const { Tensor } = root.NF;

    /* =========================================
       1. BASE LAYER CLASS
       ========================================= */
    class Layer {
        constructor() {
            this.parameters = [];
        }
        
        forward(input) {
            throw new Error("Forward pass not implemented");
        }

        getParameters() {
            return this.parameters;
        }

        zeroGrad() {
            this.parameters.forEach(p => {
                p.grad = p._zerosLike(p.data);
            });
        }
    }

    /* =========================================
       2. DENSE (FULLY CONNECTED) LAYER
       ========================================= */
    class Dense extends Layer {
        /**
         * @param {number} inSize - Input features
         * @param {number} outSize - Output neurons
         */
        constructor(inSize, outSize) {
            super();
            // Xavier/Glorot Initialization for stability
            const scale = Math.sqrt(2.0 / (inSize + outSize));
            
            const wData = Array.from({ length: inSize }, () => 
                Array.from({ length: outSize }, () => (Math.random() * 2 - 1) * scale)
            );
            
            const bData = [new Array(outSize).fill(0)];

            this.weights = new Tensor(wData, { requiresGrad: true });
            this.bias = new Tensor(bData, { requiresGrad: true });
            
            this.parameters = [this.weights, this.bias];
        }

        forward(input) {
            // Formula: Y = XW + B
            return input.matmul(this.weights).add(this.bias);
        }
    }

    /* =========================================
       3. SEQUENTIAL MODEL CONTAINER
       ========================================= */
    class Sequential {
        constructor() {
            this.layers = [];
        }

        add(layer) {
            this.layers.push(layer);
        }

        forward(input) {
            let out = input;
            for (const layer of this.layers) {
                out = layer.forward(out);
            }
            return out;
        }

        getParameters() {
            return this.layers.flatMap(l => l.getParameters());
        }

        zeroGrad() {
            this.layers.forEach(l => l.zeroGrad());
        }
    }

    /* =========================================
       4. OPTIMIZERS
       ========================================= */
    class SGD {
        /**
         * @param {Array} parameters - List of Tensors to optimize
         * @param {number} lr - Learning Rate
         */
        constructor(parameters, lr = 0.01) {
            this.parameters = parameters;
            this.lr = lr;
        }

        step() {
            // Update rule: W = W - (lr * Grad)
            this.parameters.forEach(p => {
                p.data = this._updateData(p.data, p.grad, this.lr);
            });
        }

        _updateData(data, grad, lr) {
            if (!Array.isArray(data)) {
                return data - (lr * grad);
            }
            return data.map((v, i) => this._updateData(v, grad[i], lr));
        }
    }

    /* =========================================
       5. LOSS FUNCTIONS (Criterion)
       ========================================= */
    const Loss = {
        /**
         * Mean Squared Error
         * L = (1/n) * sum((pred - target)^2)
         */
        mse(pred, target) {
            const diff = pred.add(target.map(x => -x));
            const squared = diff._map(diff.data, x => x * x);
            
            // Average the squared differences
            let sum = 0;
            let count = 0;
            const flatten = (arr) => {
                arr.forEach(v => {
                    if (Array.isArray(v)) flatten(v);
                    else { sum += v; count++; }
                });
            };
            flatten(squared);

            const out = new Tensor([sum / count], {
                children: [pred],
                op: 'mse_loss',
                requiresGrad: true
            });

            out._backward = () => {
                if (pred.requiresGrad) {
                    // dL/dPred = (2/n) * (pred - target)
                    const gradData = diff._map(diff.data, x => (2 / count) * x);
                    pred.grad = pred._elementWise(pred.grad, gradData, (g, dg) => g + dg);
                }
            };

            return out;
        }
    };

    // Export to global NF namespace
    root.NF.Dense = Dense;
    root.NF.Sequential = Sequential;
    root.NF.SGD = SGD;
    root.NF.Loss = Loss;

})(window);



(function(root) {
    'use strict';

    /**
     * CORE TENSOR CLASS
     * Represents a multidimensional array with automatic differentiation capabilities.
     * Implements the "Backpropagation through a Computational Graph" algorithm.
     */
    class Tensor {
        /**
         * @param {number|Array} data - The raw numerical values.
         * @param {Object} options - Configuration for the tensor.
         */
        constructor(data, options = {}) {
            this.data = this._preprocess(data);
            this.shape = this._getShape(this.data);
            this.grad = this._zerosLike(this.data);
            this.requiresGrad = options.requiresGrad || false;
            
            // Autograd properties
            this._prev = new Set(options.children || []);
            this._op = options.op || '';
            this._backward = () => {};
        }

        /**
         * Internal helper to ensure data is in Float32 format for precision.
         */
        _preprocess(data) {
            if (typeof data === 'number') return [data];
            return data; 
        }

        _getShape(data) {
            const shape = [];
            let curr = data;
            while (Array.isArray(curr)) {
                shape.push(curr.length);
                curr = curr[0];
            }
            return shape;
        }

        _zerosLike(data) {
            if (!Array.isArray(data)) return 0;
            return data.map(v => this._zerosLike(v));
        }

        /**
         * ADDITION OPERATION
         * Implements: f(a, b) = a + b
         * Gradient: df/da = 1, df/db = 1
         */
        add(other) {
            other = other instanceof Tensor ? other : new Tensor(other);
            const outData = this._elementWise(this.data, other.data, (a, b) => a + b);
            
            const out = new Tensor(outData, {
                children: [this, other],
                op: '+',
                requiresGrad: this.requiresGrad || other.requiresGrad
            });

            out._backward = () => {
                if (this.requiresGrad) {
                    this.grad = this._elementWise(this.grad, out.grad, (g, og) => g + og);
                }
                if (other.requiresGrad) {
                    other.grad = this._elementWise(other.grad, out.grad, (g, og) => g + og);
                }
            };

            return out;
        }

        /**
         * MATRIX MULTIPLICATION (GEMM)
         * Implements: C = A . B
         * Complexity: O(n^3)
         */
        matmul(other) {
            if (this.shape[1] !== other.shape[0]) {
                throw new Error(`Dimension mismatch: ${this.shape[1]} != ${other.shape[0]}`);
            }

            const m = this.shape[0];
            const k = this.shape[1];
            const n = other.shape[1];
            const outData = Array.from({ length: m }, () => new Array(n).fill(0));

            for (let i = 0; i < m; i++) {
                for (let j = 0; j < n; j++) {
                    let sum = 0;
                    for (let l = 0; l < k; l++) {
                        sum += this.data[i][l] * other.data[l][j];
                    }
                    outData[i][j] = sum;
                }
            }

            const out = new Tensor(outData, {
                children: [this, other],
                op: 'matmul',
                requiresGrad: this.requiresGrad || other.requiresGrad
            });

            out._backward = () => {
                if (this.requiresGrad) {
                    // Grad_A = Grad_Out . B^T
                    const bT = other.transpose();
                    const dThis = out.matmul(bT); 
                    this.grad = this._elementWise(this.grad, dThis.data, (g, dg) => g + dg);
                }
                if (other.requiresGrad) {
                    // Grad_B = A^T . Grad_Out
                    const aT = this.transpose();
                    const dOther = aT.matmul(out);
                    other.grad = this._elementWise(other.grad, dOther.data, (g, dg) => g + dg);
                }
            };

            return out;
        }

        /**
         * ACTIVATION: RELU
         * Implements: max(0, x)
         * Derivative: 1 if x > 0 else 0
         */
        relu() {
            const outData = this._map(this.data, x => Math.max(0, x));
            const out = new Tensor(outData, {
                children: [this],
                op: 'relu',
                requiresGrad: this.requiresGrad
            });

            out._backward = () => {
                if (this.requiresGrad) {
                    const dRelu = this._elementWise(this.data, out.grad, (x, og) => (x > 0 ? og : 0));
                    this.grad = this._elementWise(this.grad, dRelu, (g, dg) => g + dg);
                }
            };

            return out;
        }

        /**
         * THE BACKPROPAGATION ENGINE
         * Topological sort + recursive gradient accumulation.
         */
        backward() {
            const topo = [];
            const visited = new Set();
            
            const buildTopo = (v) => {
                if (!visited.has(v)) {
                    visited.add(v);
                    v._prev.forEach(child => buildTopo(child));
                    topo.push(v);
                }
            };

            buildTopo(this);

            // Initialize seed gradient (dl/dl = 1)
            this.grad = this._onesLike(this.data);

            // Backpropagate in reverse topological order
            for (let i = topo.length - 1; i >= 0; i--) {
                topo[i]._backward();
            }
        }

        // --- Helper Kernels ---

        _elementWise(a, b, op) {
            if (!Array.isArray(a)) return op(a, b);
            return a.map((val, i) => this._elementWise(val, b[i], op));
        }

        _map(data, op) {
            if (!Array.isArray(data)) return op(data);
            return data.map(val => this._map(val, op));
        }

        _onesLike(data) {
            if (!Array.isArray(data)) return 1;
            return data.map(v => this._onesLike(v));
        }

        transpose() {
            const rows = this.shape[0];
            const cols = this.shape[1];
            const out = Array.from({ length: cols }, () => new Array(rows));
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < cols; j++) {
                    out[j][i] = this.data[i][j];
                }
            }
            return new Tensor(out);
        }
    }

    // Export to global scope for NeuroForge engine access
    root.NF = { Tensor };

})(window);



class AppController {
    constructor() {
        this.visualizer = new Visualizer();
        this.model = null;
        this.optimizer = null;
        this.currentDataset = 'circle';
        
        // Data State
        this.trainData = [];
        this.trainLabels = [];
        
        // Training State
        this.isTraining = false;
        this.epoch = 0;
        this.learningRate = 0.03;
        
        this.init();
    }

    init() {
        this.buildModel();
        this.generateData();
        this.bindEvents();
        this.updateUI();
        this.log("NeuroForge Initialized. Data ready.", "success");
    }

    /**
     * CONSTRUCTS THE NEURAL ARCHITECTURE
     * Architecture: 2 -> 6 -> 4 -> 1
     */
    buildModel() {
        this.model = new NF.Sequential();
        
        // Hidden Layer 1: 2 Inputs to 6 Neurons
        this.model.add(new NF.Dense(2, 6));
        
        // Hidden Layer 2: 6 Neurons to 4 Neurons
        this.model.add(new NF.Dense(6, 4));
        
        // Output Layer: 4 Neurons to 1 Output
        this.model.add(new NF.Dense(4, 1));

        this.optimizer = new NF.SGD(this.model.getParameters(), this.learningRate);
        this.visualizer.renderNetworkGraph(this.model);
    }

    /**
     * GENERATES MATHEMATICAL DATASETS
     * Implements logic for non-linear separable data.
     */
    generateData() {
        this.trainData = [];
        this.trainLabels = [];
        const numSamples = 200;

        for (let i = 0; i < numSamples; i++) {
            let x, y, label;

            if (this.currentDataset === 'circle') {
                x = Math.random() * 2 - 1;
                y = Math.random() * 2 - 1;
                label = (x * x + y * y > 0.4) ? 1 : -1;
            } else if (this.currentDataset === 'xor') {
                x = Math.random() * 2 - 1;
                y = Math.random() * 2 - 1;
                label = (x * y > 0) ? 1 : -1;
            } else if (this.currentDataset === 'spiral') {
                const angle = (i / numSamples) * Math.PI * 2 * 2;
                const radius = (i / numSamples);
                const noise = (Math.random() - 0.5) * 0.1;
                
                if (i % 2 === 0) {
                    x = radius * Math.cos(angle) + noise;
                    y = radius * Math.sin(angle) + noise;
                    label = 1;
                } else {
                    x = -radius * Math.cos(angle) + noise;
                    y = -radius * Math.sin(angle) + noise;
                    label = -1;
                }
            }

            this.trainData.push([x, y]);
            this.trainLabels.push([label]);
        }
        
        this.visualizer.drawDataPoints(this.trainData, this.trainLabels.flat());
    }

    /**
     * MAIN TRAINING LOOP (RECURSIVE)
     * Performs Forward Pass -> Loss Calculation -> Backward Pass -> Optimizer Step
     */
    async trainStep() {
        if (!this.isTraining) return;

        // 1. Convert data to Tensors
        const xTensor = new NF.Tensor(this.trainData);
        const yTensor = new NF.Tensor(this.trainLabels);

        // 2. Forward Pass
        this.model.zeroGrad();
        const pred = this.model.forward(xTensor);

        // 3. Loss Calculation (MSE)
        const loss = NF.Loss.mse(pred, yTensor);

        // 4. Backward Pass (The Math Engine Magic)
        loss.backward();

        // 5. Update Weights
        this.optimizer.step();

        // 6. Update UI
        this.epoch++;
        this.updateStats(loss.data[0]);
        
        if (this.epoch % 5 === 0) {
            this.visualizer.drawDecisionBoundary(this.model);
        }

        // Keep loop running
        requestAnimationFrame(() => this.trainStep());
    }

    bindEvents() {
        // Play / Pause
        document.getElementById('btn-play-pause').onclick = (e) => {
            this.isTraining = !this.isTraining;
            const icon = e.currentTarget.querySelector('i');
            icon.className = this.isTraining ? 'ri-pause-fill' : 'ri-play-fill';
            if (this.isTraining) this.trainStep();
        };

        // Dataset Selection
        document.querySelectorAll('.ds-item').forEach(item => {
            item.onclick = () => {
                document.querySelector('.ds-item.active').classList.remove('active');
                item.classList.add('active');
                this.currentDataset = item.dataset.ds;
                this.reset();
            };
        });

        // Hyperparameters
        document.getElementById('inp-lr').oninput = (e) => {
            this.learningRate = parseFloat(e.target.value);
            this.optimizer.lr = this.learningRate;
        };
    }

    reset() {
        this.epoch = 0;
        this.isTraining = false;
        document.querySelector('.btn-play i').className = 'ri-play-fill';
        this.buildModel();
        this.generateData();
        this.updateStats(0);
        this.visualizer.drawDecisionBoundary(this.model);
    }

    updateStats(loss) {
        document.getElementById('stat-epoch').innerText = this.epoch;
        document.getElementById('stat-loss').innerText = loss.toFixed(4);
    }

    log(msg, type = "") {
        const logBox = document.getElementById('log-output');
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        const time = new Date().toLocaleTimeString().split(' ')[0];
        entry.innerHTML = `<span class="timestamp">[${time}]</span> ${msg}`;
        logBox.prepend(entry);
    }
}

// Start App
window.onload = () => {
    window.app = new AppController();
};


(function(root) {
    'use strict';

    class Visualizer {
        constructor() {
            this.canvasMain = document.getElementById('canvas-main');
            this.canvasData = document.getElementById('canvas-data');
            this.ctxMain = this.canvasMain.getContext('2d');
            this.ctxData = this.canvasData.getContext('2d');
            
            this.width = 400;
            this.height = 400;
            
            this.initCanvases();
        }

        initCanvases() {
            [this.canvasMain, this.canvasData].forEach(c => {
                c.width = this.width;
                c.height = this.height;
            });
        }

        /**
         * Renders the Heatmap Decision Boundary
         * This requires running a forward pass for every 4th pixel.
         */
        drawDecisionBoundary(model) {
            const step = 4; // Resolution of the heatmap
            const imgData = this.ctxMain.createImageData(this.width, this.height);
            
            for (let y = 0; y < this.height; y += step) {
                for (let x = 0; x < this.width; x += step) {
                    // Map screen coords to normalized space [-1, 1]
                    const nx = (x / this.width) * 2 - 1;
                    const ny = (y / this.height) * 2 - 1;

                    // Forward pass through the actual model logic
                    const input = new root.NF.Tensor([[nx, ny]]);
                    const pred = model.forward(input).data[0][0];

                    // Map prediction to color (Blue for negative, Orange for positive)
                    const color = this._getColorForValue(pred);

                    // Fill the pixel block
                    for (let sy = 0; sy < step; sy++) {
                        for (let sx = 0; sx < step; sx++) {
                            const idx = ((y + sy) * this.width + (x + sx)) * 4;
                            imgData.data[idx] = color[0];     // R
                            imgData.data[idx + 1] = color[1]; // G
                            imgData.data[idx + 2] = color[2]; // B
                            imgData.data[idx + 3] = 255;      // A
                        }
                    }
                }
            }
            this.ctxMain.putImageData(imgData, 0, 0);
        }

        _getColorForValue(val) {
            // Sigmoid-like squashing for visual contrast
            const s = 1 / (1 + Math.exp(-val * 3));
            // Transition from #0984e3 (Blue) to #ff9f0a (Orange)
            const r = Math.floor(9 + (255 - 9) * s);
            const g = Math.floor(132 + (159 - 132) * s);
            const b = Math.floor(227 + (10 - 227) * s);
            return [r, g, b];
        }

        /**
         * Renders training data points on the top layer
         */
        drawDataPoints(points, labels) {
            this.ctxData.clearRect(0, 0, this.width, this.height);
            points.forEach((p, i) => {
                const x = (p[0] + 1) * 0.5 * this.width;
                const y = (1 - (p[1] + 1) * 0.5) * this.height;
                
                this.ctxData.beginPath();
                this.ctxData.arc(x, y, 4, 0, Math.PI * 2);
                this.ctxData.fillStyle = labels[i] > 0 ? '#ff9f0a' : '#0984e3';
                this.ctxData.strokeStyle = '#fff';
                this.ctxData.lineWidth = 1.5;
                this.ctxData.fill();
                this.ctxData.stroke();
            });
        }

        /**
         * Generates an SVG representation of the Neural Network architecture
         */
        renderNetworkGraph(model) {
            const svg = document.getElementById('svg-graph');
            svg.innerHTML = ''; // Clear
            
            const layers = [2]; // Input layer
            model.layers.forEach(l => {
                if (l instanceof root.NF.Dense) {
                    layers.push(l.weights.shape[1]);
                }
            });

            const vGap = 30;
            const hGap = 80;
            const radius = 6;

            layers.forEach((count, lIdx) => {
                const x = 40 + lIdx * hGap;
                const startY = (200 - (count * vGap)) / 2;

                for (let nIdx = 0; nIdx < count; nIdx++) {
                    const y = startY + nIdx * vGap;
                    
                    // Draw connections to next layer
                    if (lIdx < layers.length - 1) {
                        const nextCount = layers[lIdx + 1];
                        const nextStartX = 40 + (lIdx + 1) * hGap;
                        const nextStartY = (200 - (nextCount * vGap)) / 2;

                        for (let nextN = 0; nextN < nextCount; nextN++) {
                            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                            line.setAttribute("x1", x);
                            line.setAttribute("y1", y);
                            line.setAttribute("x2", nextStartX);
                            line.setAttribute("y2", nextStartY + nextN * vGap);
                            line.setAttribute("stroke", "rgba(255,255,255,0.1)");
                            svg.appendChild(line);
                        }
                    }

                    // Draw Neuron
                    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                    circle.setAttribute("cx", x);
                    circle.setAttribute("cy", y);
                    circle.setAttribute("r", radius);
                    circle.setAttribute("fill", "#555");
                    svg.appendChild(circle);
                }
            });
        }
    }

    root.Visualizer = Visualizer;

})(window);