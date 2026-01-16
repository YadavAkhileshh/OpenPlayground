// ==================== NEURAL NETWORK ENGINE ====================

class NeuralNetwork {
    constructor(layers, activation = 'relu', learningRate = 0.1) {
        this.layers = layers; // [2, 4, 4, 1]
        this.activation = activation;
        this.learningRate = learningRate;
        this.weights = [];
        this.biases = [];
        this.activations = [];
        this.zValues = [];
        this.gradients = [];
        this.initWeights();
    }

    initWeights() {
        for (let i = 0; i < this.layers.length - 1; i++) {
            const rows = this.layers[i + 1];
            const cols = this.layers[i];
            const scale = Math.sqrt(2.0 / cols); // He initialization
            
            const W = Array(rows).fill(0).map(() => 
                Array(cols).fill(0).map(() => (Math.random() - 0.5) * 2 * scale)
            );
            const b = Array(rows).fill(0).map(() => Math.random() * 0.01);
            
            this.weights.push(W);
            this.biases.push(b);
        }
    }

    activationFn(z, derivative = false) {
        if (this.activation === 'relu') {
            return derivative ? (z > 0 ? 1 : 0) : Math.max(0, z);
        } else if (this.activation === 'sigmoid') {
            const s = 1 / (1 + Math.exp(-z));
            return derivative ? s * (1 - s) : s;
        } else if (this.activation === 'tanh') {
            const t = Math.tanh(z);
            return derivative ? 1 - t * t : t;
        }
    }

    forward(input) {
        this.activations = [input];
        this.zValues = [];
        let current = input;

        for (let i = 0; i < this.weights.length; i++) {
            const z = [];
            for (let j = 0; j < this.weights[i].length; j++) {
                let sum = this.biases[i][j];
                for (let k = 0; k < current.length; k++) {
                    sum += this.weights[i][j][k] * current[k];
                }
                z.push(sum);
            }
            this.zValues.push(z);

            // Use sigmoid for output layer, chosen activation for hidden
            const a = z.map((val, idx) => {
                if (i === this.weights.length - 1) {
                    return 1 / (1 + Math.exp(-val)); // Sigmoid output
                }
                return this.activationFn(val, false);
            });
            
            current = a;
            this.activations.push(a);
        }

        return current;
    }

    backward(input, target) {
        const output = this.activations[this.activations.length - 1];
        this.gradients = [];
        
        // Output layer error (gradient of loss w.r.t output)
        let delta = output.map((o, i) => 2 * (o - target[i]));
        
        // Backpropagate through layers
        for (let i = this.weights.length - 1; i >= 0; i--) {
            const z = this.zValues[i];
            const a = this.activations[i];
            
            const layerGradients = {
                weights: [],
                biases: []
            };

            // Apply activation derivative to delta
            const deltaPrime = delta.map((d, j) => {
                if (i === this.weights.length - 1) {
                    // Sigmoid derivative for output layer
                    const sig = 1 / (1 + Math.exp(-z[j]));
                    return d * sig * (1 - sig);
                } else {
                    // Hidden layer activation derivative
                    return d * this.activationFn(z[j], true);
                }
            });

            // Calculate weight and bias gradients
            for (let j = 0; j < this.weights[i].length; j++) {
                const wGrad = a.map(av => deltaPrime[j] * av);
                layerGradients.weights.push(wGrad);
                layerGradients.biases.push(deltaPrime[j]);
            }

            // Calculate delta for previous layer (before activation derivative)
            if (i > 0) {
                const newDelta = Array(a.length).fill(0);
                for (let j = 0; j < this.weights[i].length; j++) {
                    for (let k = 0; k < a.length; k++) {
                        newDelta[k] += this.weights[i][j][k] * deltaPrime[j];
                    }
                }
                delta = newDelta;
            }

            this.gradients.unshift(layerGradients);
        }

        // Update weights and biases
        for (let i = 0; i < this.weights.length; i++) {
            for (let j = 0; j < this.weights[i].length; j++) {
                for (let k = 0; k < this.weights[i][j].length; k++) {
                    this.weights[i][j][k] -= this.learningRate * this.gradients[i].weights[j][k];
                }
                this.biases[i][j] -= this.learningRate * this.gradients[i].biases[j];
            }
        }
    }

    train(inputs, targets) {
        let totalLoss = 0;
        for (let i = 0; i < inputs.length; i++) {
            const output = this.forward(inputs[i]);
            this.backward(inputs[i], targets[i]);
            
            // MSE loss
            const loss = output.reduce((sum, o, j) => 
                sum + Math.pow(o - targets[i][j], 2), 0
            ) / output.length;
            totalLoss += loss;
        }
        return totalLoss / inputs.length;
    }

    predict(input) {
        return this.forward(input);
    }
}

// ==================== DATASETS ====================

const datasets = {
    xor: {
        inputs: [[0, 0], [0, 1], [1, 0], [1, 1]],
        targets: [[0], [1], [1], [0]]
    },
    and: {
        inputs: [[0, 0], [0, 1], [1, 0], [1, 1]],
        targets: [[0], [0], [0], [1]]
    },
    or: {
        inputs: [[0, 0], [0, 1], [1, 0], [1, 1]],
        targets: [[0], [1], [1], [1]]
    }
};

// ==================== STATE ====================

let network = null;
let isTraining = false;
let epoch = 0;
let lossHistory = [];
let hiddenLayers = [4, 4];
let trainingLoop = null;
let vizMode = 'network';
let animationFrame = 0;

// Drawing state
let drawPoints = [];
let currentClass = 0;
let isDrawing = false;

// Training analysis state
let previousWeights = null;
let weightsChanged = false;
let lossWindowSize = 10;
let stuckCounter = 0;
let stuckThreshold = 20; // epochs without significant loss change
let convergenceThreshold = 0.001; // loss below this is considered converged

// ==================== CANVAS SETUP ====================

const netCanvas = document.getElementById('network-canvas');
const netCtx = netCanvas.getContext('2d');
const lossCanvas = document.getElementById('loss-canvas');
const lossCtx = lossCanvas.getContext('2d');
const drawCanvas = document.getElementById('draw-canvas');
const drawCtx = drawCanvas.getContext('2d');

function resizeCanvases() {
    netCanvas.width = netCanvas.offsetWidth;
    netCanvas.height = netCanvas.offsetHeight;
    lossCanvas.width = lossCanvas.offsetWidth;
    lossCanvas.height = lossCanvas.offsetHeight;
    drawCanvas.width = drawCanvas.offsetWidth;
    drawCanvas.height = drawCanvas.offsetHeight;
}
resizeCanvases();
window.addEventListener('resize', resizeCanvases);

// ==================== LAYER MANAGEMENT ====================

function renderLayers() {
    const list = document.getElementById('layer-list');
    list.innerHTML = '';
    
    hiddenLayers.forEach((neurons, idx) => {
        const div = document.createElement('div');
        div.className = 'layer-item';
        div.innerHTML = `
            <div class="layer-neurons">
                <span>Layer ${idx + 1}:</span>
                <input type="number" min="1" max="20" value="${neurons}" 
                       onchange="updateLayerNeurons(${idx}, this.value)">
                <span>neurons</span>
            </div>
            <span class="remove-btn" onclick="removeLayer(${idx})">✕</span>
        `;
        list.appendChild(div);
    });
}

function addLayer() {
    hiddenLayers.push(4);
    renderLayers();
    if (network) initNetwork();
}

function removeLayer(idx) {
    if (hiddenLayers.length > 1) {
        hiddenLayers.splice(idx, 1);
        renderLayers();
        if (network) initNetwork();
    }
}

function updateLayerNeurons(idx, value) {
    hiddenLayers[idx] = parseInt(value) || 1;
    if (network) initNetwork();
}

// ==================== NETWORK INITIALIZATION ====================

function initNetwork() {
    pauseTraining();
    
    const problemType = document.getElementById('problem-type').value;
    const inputSize = problemType === 'draw' ? 2 : 2;
    const outputSize = 1;
    const layers = [inputSize, ...hiddenLayers, outputSize];
    const activation = document.getElementById('activation').value;
    const lr = parseFloat(document.getElementById('learning-rate').value);
    
    network = new NeuralNetwork(layers, activation, lr);
    epoch = 0;
    lossHistory = [];
    stuckCounter = 0;
    previousWeights = null;
    weightsChanged = false;
    
    updateMetrics();
    renderNetwork();
    
    // Show reset feedback
    showResetFeedback();
}

// ==================== TRAINING CONTROL ====================

function startTraining() {
    if (!network) initNetwork();
    if (isTraining) return;
    
    isTraining = true;
    updateStatus('training');
    hideHint();
    
    trainingLoop = setInterval(() => {
        const problemType = document.getElementById('problem-type').value;
        let data;
        
        if (problemType === 'draw') {
            if (drawPoints.length < 2) return;
            data = {
                inputs: drawPoints.map(p => [p.x, p.y]),
                targets: drawPoints.map(p => [p.class])
            };
        } else {
            data = datasets[problemType];
        }
        
        // Save previous weights to detect changes
        saveWeights();
        
        const loss = network.train(data.inputs, data.targets);
        epoch++;
        lossHistory.push(loss);
        
        // Detect weight changes
        detectWeightChanges();
        
        // Update learning rate if changed
        network.learningRate = parseFloat(document.getElementById('learning-rate').value);
        
        // Analyze training progress
        analyzeTraining();
        
        updateMetrics();
        renderNetwork();
        renderLossChart();
        
        animationFrame++;
    }, 50);
}

function pauseTraining() {
    isTraining = false;
    if (trainingLoop) {
        clearInterval(trainingLoop);
        trainingLoop = null;
    }
    updateStatus('paused');
}

function resetAll() {
    pauseTraining();
    network = null;
    epoch = 0;
    lossHistory = [];
    drawPoints = [];
    stuckCounter = 0;
    previousWeights = null;
    weightsChanged = false;
    
    netCtx.clearRect(0, 0, netCanvas.width, netCanvas.height);
    lossCtx.clearRect(0, 0, lossCanvas.width, lossCanvas.height);
    drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
    
    updateMetrics();
    updateStatus('ready');
    hideHint();
    
    // Show reset feedback
    showResetFeedback();
}

function updateStatus(status) {
    const dot = document.getElementById('status-dot');
    const text = document.getElementById('status-text');
    
    dot.className = 'status-indicator status-' + status;
    text.textContent = status.charAt(0).toUpperCase() + status.slice(1);
}

function updateMetrics() {
    document.getElementById('epoch-count').textContent = epoch;
    const lossDisplay = lossHistory.length > 0 ? lossHistory[lossHistory.length - 1].toFixed(6) : '-';
    document.getElementById('loss-value').textContent = lossDisplay;
    document.getElementById('lr-status').textContent = parseFloat(document.getElementById('learning-rate').value).toFixed(3);
    
    // Update loss trend indicator
    updateLossTrend();
}

// ==================== TRAINING ANALYSIS ====================

function saveWeights() {
    if (!network) return;
    previousWeights = network.weights.map(layerWeights => 
        layerWeights.map(neuronWeights => [...neuronWeights])
    );
}

function detectWeightChanges() {
    if (!network || !previousWeights) {
        weightsChanged = false;
        return;
    }
    
    weightsChanged = false;
    const threshold = 1e-10;
    
    for (let i = 0; i < network.weights.length; i++) {
        for (let j = 0; j < network.weights[i].length; j++) {
            for (let k = 0; k < network.weights[i][j].length; k++) {
                const diff = Math.abs(network.weights[i][j][k] - previousWeights[i][j][k]);
                if (diff > threshold) {
                    weightsChanged = true;
                    return;
                }
            }
        }
    }
}

function updateLossTrend() {
    const trendEl = document.getElementById('loss-trend');
    
    if (lossHistory.length < 5) {
        trendEl.textContent = '';
        trendEl.className = 'trend-indicator';
        return;
    }
    
    const recentLosses = lossHistory.slice(-lossWindowSize);
    const avgRecent = recentLosses.reduce((a, b) => a + b, 0) / recentLosses.length;
    const olderLosses = lossHistory.slice(-lossWindowSize * 2, -lossWindowSize);
    
    if (olderLosses.length > 0) {
        const avgOlder = olderLosses.reduce((a, b) => a + b, 0) / olderLosses.length;
        const changePercent = ((avgRecent - avgOlder) / avgOlder) * 100;
        
        if (changePercent < -1) {
            trendEl.textContent = '↓ Decreasing';
            trendEl.className = 'trend-indicator trend-decreasing';
        } else if (changePercent > 1) {
            trendEl.textContent = '↑ Increasing';
            trendEl.className = 'trend-indicator trend-increasing';
        } else {
            trendEl.textContent = '→ Flat';
            trendEl.className = 'trend-indicator trend-flat';
        }
    }
}

function analyzeTraining() {
    if (lossHistory.length < 10) return;
    
    const currentLoss = lossHistory[lossHistory.length - 1];
    const recentLosses = lossHistory.slice(-stuckThreshold);
    
    // Check for convergence
    if (currentLoss < convergenceThreshold) {
        updateStatus('converged');
        return;
    }
    
    // Check if loss is stuck (not changing significantly)
    if (recentLosses.length >= stuckThreshold) {
        const maxRecent = Math.max(...recentLosses);
        const minRecent = Math.min(...recentLosses);
        const lossRange = maxRecent - minRecent;
        const avgLoss = recentLosses.reduce((a, b) => a + b, 0) / recentLosses.length;
        
        // If loss variation is very small relative to the loss value
        if (lossRange / avgLoss < 0.01 && weightsChanged === false) {
            stuckCounter++;
            if (stuckCounter > 3) {
                updateStatus('stuck');
                showStuckHint();
            }
        } else {
            stuckCounter = 0;
            if (isTraining) {
                updateStatus('training');
                hideHint();
            }
        }
    }
}

function showStuckHint() {
    const hintBox = document.getElementById('hint-box');
    const problemType = document.getElementById('problem-type').value;
    const currentLR = parseFloat(document.getElementById('learning-rate').value);
    
    let message = '<strong>⚠️ Learning appears stuck</strong>';
    
    // Provide context-specific hints
    if (currentLR < 0.01) {
        message += '<br>💡 Try increasing the learning rate';
    } else if (problemType === 'xor' && hiddenLayers.length === 0) {
        message += '<br>💡 XOR requires at least one hidden layer';
    } else if (problemType === 'xor' && hiddenLayers.reduce((a, b) => a + b, 0) < 2) {
        message += '<br>💡 XOR needs more neurons in hidden layers';
    } else if (currentLR > 0.5) {
        message += '<br>💡 Learning rate might be too high, causing instability';
    } else {
        message += '<br>💡 Try adjusting the architecture or learning rate';
    }
    
    hintBox.innerHTML = message;
    hintBox.style.display = 'block';
}

function hideHint() {
    const hintBox = document.getElementById('hint-box');
    hintBox.style.display = 'none';
}

function showResetFeedback() {
    const hintBox = document.getElementById('hint-box');
    hintBox.innerHTML = '<strong>🔄 Model reset</strong><br>No learning yet. Click "Start Training" to begin.';
    hintBox.style.display = 'block';
    hintBox.style.background = 'rgba(100, 200, 255, 0.2)';
    hintBox.style.borderColor = 'rgba(100, 200, 255, 0.5)';
    
    // Hide after 3 seconds
    setTimeout(() => {
        if (epoch === 0 && !isTraining) {
            hideHint();
            hintBox.style.background = 'rgba(255, 170, 0, 0.2)';
            hintBox.style.borderColor = 'rgba(255, 170, 0, 0.5)';
        }
    }, 3000);
}

// ==================== VISUALIZATION ====================

function setVizMode(mode) {
    vizMode = mode;
    document.querySelectorAll('.viz-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    renderNetwork();
}

function renderNetwork() {
    if (!network) return;
    
    netCtx.clearRect(0, 0, netCanvas.width, netCanvas.height);
    
    const layers = network.layers;
    const spacing = netCanvas.width / (layers.length + 1);
    const positions = [];
    
    // Calculate positions
    for (let i = 0; i < layers.length; i++) {
        const layerPos = [];
        const vSpacing = netCanvas.height / (layers[i] + 1);
        for (let j = 0; j < layers[i]; j++) {
            layerPos.push({
                x: spacing * (i + 1),
                y: vSpacing * (j + 1)
            });
        }
        positions.push(layerPos);
    }
    
    // Draw connections
    for (let i = 0; i < layers.length - 1; i++) {
        for (let j = 0; j < positions[i + 1].length; j++) {
            for (let k = 0; k < positions[i].length; k++) {
                const weight = network.weights[i][j][k];
                const strength = Math.min(Math.abs(weight), 1);
                
                let color, width;
                if (vizMode === 'backward' && network.gradients.length > 0) {
                    const grad = network.gradients[i].weights[j][k];
                    const gradStrength = Math.min(Math.abs(grad) * 10, 1);
                    color = `rgba(255, 200, 0, ${gradStrength})`;
                    width = gradStrength * 3;
                } else {
                    // Highlight if weights changed
                    let alpha = strength;
                    if (weightsChanged && previousWeights && previousWeights[i]) {
                        const weightDiff = Math.abs(weight - previousWeights[i][j][k]);
                        if (weightDiff > 1e-6) {
                            // Weight changed - make it more visible
                            alpha = Math.min(strength + 0.3, 1);
                            width = strength * 2.5;
                        } else {
                            // Weight didn't change - make it dimmer
                            alpha = strength * 0.4;
                            width = strength * 1.5;
                        }
                    }
                    
                    color = weight > 0 ? 
                        `rgba(100, 200, 255, ${alpha})` : 
                        `rgba(255, 100, 100, ${alpha})`;
                    width = width || strength * 2;
                }
                
                netCtx.strokeStyle = color;
                netCtx.lineWidth = width;
                netCtx.beginPath();
                netCtx.moveTo(positions[i][k].x, positions[i][k].y);
                netCtx.lineTo(positions[i + 1][j].x, positions[i + 1][j].y);
                netCtx.stroke();
            }
        }
    }
    
    // Draw neurons
    for (let i = 0; i < layers.length; i++) {
        for (let j = 0; j < positions[i].length; j++) {
            const pos = positions[i][j];
            const activation = network.activations[i] ? network.activations[i][j] || 0 : 0;
            
            let color, radius;
            if (vizMode === 'forward' && i > 0) {
                const intensity = Math.min(Math.abs(activation), 1);
                color = `rgba(100, 255, 100, ${0.3 + intensity * 0.7})`;
                radius = 12 + intensity * 5;
            } else if (vizMode === 'backward' && network.gradients.length > 0 && i < layers.length - 1) {
                color = `rgba(255, 200, 0, 0.6)`;
                radius = 12;
            } else {
                const intensity = Math.min(Math.abs(activation), 1);
                color = `rgba(150, 150, 255, ${0.4 + intensity * 0.6})`;
                radius = 12;
            }
            
            netCtx.fillStyle = color;
            netCtx.beginPath();
            netCtx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
            netCtx.fill();
            
            netCtx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            netCtx.lineWidth = 2;
            netCtx.stroke();
        }
    }
    
    // Draw labels
    netCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    netCtx.font = '12px sans-serif';
    netCtx.textAlign = 'center';
    
    const labels = ['Input', ...Array(layers.length - 2).fill(0).map((_, i) => `Hidden ${i + 1}`), 'Output'];
    labels.forEach((label, i) => {
        netCtx.fillText(label, spacing * (i + 1), 20);
    });
}

function renderLossChart() {
    lossCtx.clearRect(0, 0, lossCanvas.width, lossCanvas.height);
    
    if (lossHistory.length < 2) return;
    
    const maxLoss = Math.max(...lossHistory.slice(-100));
    const minLoss = Math.min(...lossHistory.slice(-100));
    const range = maxLoss - minLoss || 0.1;
    
    const padding = 40;
    const chartWidth = lossCanvas.width - padding * 2;
    const chartHeight = lossCanvas.height - padding * 2;
    
    // Draw axes
    lossCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    lossCtx.lineWidth = 1;
    lossCtx.beginPath();
    lossCtx.moveTo(padding, padding);
    lossCtx.lineTo(padding, lossCanvas.height - padding);
    lossCtx.lineTo(lossCanvas.width - padding, lossCanvas.height - padding);
    lossCtx.stroke();
    
    // Draw grid
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight * i / 5);
        lossCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        lossCtx.beginPath();
        lossCtx.moveTo(padding, y);
        lossCtx.lineTo(lossCanvas.width - padding, y);
        lossCtx.stroke();
    }
    
    // Draw loss curve
    const displayData = lossHistory.slice(-100);
    const step = chartWidth / (displayData.length - 1);
    
    lossCtx.strokeStyle = '#00ffaa';
    lossCtx.lineWidth = 2;
    lossCtx.beginPath();
    
    displayData.forEach((loss, i) => {
        const x = padding + i * step;
        const normalized = (loss - minLoss) / range;
        const y = lossCanvas.height - padding - normalized * chartHeight;
        
        if (i === 0) {
            lossCtx.moveTo(x, y);
        } else {
            lossCtx.lineTo(x, y);
        }
    });
    lossCtx.stroke();
    
    // Draw labels
    lossCtx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    lossCtx.font = '11px sans-serif';
    lossCtx.textAlign = 'right';
    lossCtx.fillText(maxLoss.toFixed(4), padding - 5, padding + 5);
    lossCtx.fillText(minLoss.toFixed(4), padding - 5, lossCanvas.height - padding + 5);
    
    lossCtx.textAlign = 'center';
    lossCtx.fillText('Loss over time', lossCanvas.width / 2, lossCanvas.height - 10);
}

// ==================== DRAWING INTERFACE ====================

function setDrawClass(cls) {
    currentClass = cls;
    document.querySelectorAll('.class-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i === cls);
    });
}

drawCanvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    addDrawPoint(e);
});

drawCanvas.addEventListener('mousemove', (e) => {
    if (isDrawing) addDrawPoint(e);
});

drawCanvas.addEventListener('mouseup', () => {
    isDrawing = false;
});

drawCanvas.addEventListener('mouseleave', () => {
    isDrawing = false;
});

// Touch support for mobile
drawCanvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isDrawing = true;
    const touch = e.touches[0];
    addDrawPoint(touch);
});

drawCanvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (isDrawing && e.touches.length > 0) {
        const touch = e.touches[0];
        addDrawPoint(touch);
    }
});

drawCanvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    isDrawing = false;
});

drawCanvas.addEventListener('touchcancel', (e) => {
    e.preventDefault();
    isDrawing = false;
});

function addDrawPoint(e) {
    const rect = drawCanvas.getBoundingClientRect();
    // Handle both mouse and touch events
    const clientX = e.clientX !== undefined ? e.clientX : e.pageX || 0;
    const clientY = e.clientY !== undefined ? e.clientY : e.pageY || 0;
    
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;
    
    // Ensure coordinates are within bounds
    if (x >= 0 && x <= 1 && y >= 0 && y <= 1) {
        drawPoints.push({ x, y, class: currentClass });
        renderDrawCanvas();
    }
}

function renderDrawCanvas() {
    drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
    
    // Draw decision boundary if network exists
    if (network && drawPoints.length > 0) {
        const resolution = 50;
        for (let i = 0; i < resolution; i++) {
            for (let j = 0; j < resolution; j++) {
                const x = i / resolution;
                const y = j / resolution;
                const pred = network.predict([x, y])[0];
                
                const alpha = Math.abs(pred - 0.5) * 0.3;
                const color = pred > 0.5 ? 
                    `rgba(245, 87, 108, ${alpha})` : 
                    `rgba(102, 126, 234, ${alpha})`;
                
                drawCtx.fillStyle = color;
                drawCtx.fillRect(
                    i * drawCanvas.width / resolution,
                    j * drawCanvas.height / resolution,
                    drawCanvas.width / resolution + 1,
                    drawCanvas.height / resolution + 1
                );
            }
        }
    }
    
    // Draw points
    drawPoints.forEach(point => {
        drawCtx.fillStyle = point.class === 0 ? 
            'rgba(102, 126, 234, 0.8)' : 
            'rgba(245, 87, 108, 0.8)';
        drawCtx.beginPath();
        drawCtx.arc(
            point.x * drawCanvas.width,
            point.y * drawCanvas.height,
            5, 0, Math.PI * 2
        );
        drawCtx.fill();
        
        drawCtx.strokeStyle = '#fff';
        drawCtx.lineWidth = 2;
        drawCtx.stroke();
    });
}

function clearDrawing() {
    drawPoints = [];
    drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
}

function generateGrid() {
    clearDrawing();
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            const x = (i + 0.5) / 5;
            const y = (j + 0.5) / 5;
            const cls = (i + j) % 2;
            drawPoints.push({ x, y, class: cls });
        }
    }
    renderDrawCanvas();
}

// ==================== EVENT LISTENERS ====================

document.getElementById('learning-rate').addEventListener('input', (e) => {
    document.getElementById('lr-display').textContent = parseFloat(e.target.value).toFixed(3);
});

document.getElementById('problem-type').addEventListener('change', (e) => {
    const drawSection = document.getElementById('draw-section');
    drawSection.style.display = e.target.value === 'draw' ? 'block' : 'none';
    resetAll();
});

document.getElementById('activation').addEventListener('change', () => {
    if (network) initNetwork();
});

// ==================== INITIALIZATION ====================

renderLayers();
initNetwork();

// Animation loop for smooth visualization
function animate() {
    if (isTraining && vizMode !== 'network') {
        renderNetwork();
    }
    requestAnimationFrame(animate);
}
animate();