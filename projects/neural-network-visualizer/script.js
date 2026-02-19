// Neural Network Visualizer - Main Script
// A complete neural network implementation from scratch with real-time visualization

// =====================
// DATA STRUCTURES
// =====================

// Neural Network Class
class NeuralNetwork {
    constructor(inputNodes, hiddenLayers, hiddenNodes, outputNodes, activation = 'sigmoid') {
        this.inputNodes = inputNodes;
        this.hiddenLayers = hiddenLayers;
        this.hiddenNodes = hiddenNodes;
        this.outputNodes = outputNodes;
        this.activationType = activation;
        
        this.weights = [];
        this.biases = [];
        this.activations = [];
        this.zValues = []; // Pre-activation values
        
        this.initializeNetwork();
    }
    
    initializeNetwork() {
        this.weights = [];
        this.biases = [];
        this.activations = [];
        this.zValues = [];
        
        // Input layer
        this.activations.push(new Array(this.inputNodes).fill(0));
        
        // Hidden layers
        let prevNodes = this.inputNodes;
        for (let i = 0; i < this.hiddenLayers; i++) {
            this.weights.push(this.randomMatrix(this.hiddenNodes, prevNodes));
            this.biases.push(new Array(this.hiddenNodes).fill(0));
            this.activations.push(new Array(this.hiddenNodes).fill(0));
            this.zValues.push(new Array(this.hiddenNodes).fill(0));
            prevNodes = this.hiddenNodes;
        }
        
        // Output layer
        this.weights.push(this.randomMatrix(this.outputNodes, prevNodes));
        this.biases.push(new Array(this.outputNodes).fill(0));
        this.activations.push(new Array(this.outputNodes).fill(0));
        this.zValues.push(new Array(this.outputNodes).fill(0));
    }
    
    randomMatrix(rows, cols) {
        const matrix = [];
        const scale = Math.sqrt(2.0 / (rows + cols));
        for (let i = 0; i < rows; i++) {
            matrix[i] = [];
            for (let j = 0; j < cols; j++) {
                matrix[i][j] = (Math.random() * 2 - 1) * scale;
            }
        }
        return matrix;
    }
    
    // Activation functions
    sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }
    
    sigmoidDerivative(x) {
        const s = this.sigmoid(x);
        return s * (1 - s);
    }
    
    tanh(x) {
        return Math.tanh(x);
    }
    
    tanhDerivative(x) {
        const t = Math.tanh(x);
        return 1 - t * t;
    }
    
    relu(x) {
        return Math.max(0, x);
    }
    
    reluDerivative(x) {
        return x > 0 ? 1 : 0;
    }
    
    activate(x) {
        switch (this.activationType) {
            case 'sigmoid': return this.sigmoid(x);
            case 'tanh': return this.tanh(x);
            case 'relu': return this.relu(x);
            default: return this.sigmoid(x);
        }
    }
    
    activateDerivative(x) {
        switch (this.activationType) {
            case 'sigmoid': return this.sigmoidDerivative(x);
            case 'tanh': return this.tanhDerivative(x);
            case 'relu': return this.reluDerivative(x);
            default: return this.sigmoidDerivative(x);
        }
    }
    
    // Matrix operations
    dotProduct(matrix, vector) {
        const result = [];
        for (let i = 0; i < matrix.length; i++) {
            let sum = 0;
            for (let j = 0; j < vector.length; j++) {
                sum += matrix[i][j] * vector[j];
            }
            result.push(sum);
        }
        return result;
    }
    
    // Forward pass
    forward(input) {
        // Set input layer
        this.activations[0] = [...input];
        
        // Hidden layers
        let prevActivations = input;
        for (let l = 0; l < this.hiddenLayers + 1; l++) {
            const z = this.dotProduct(this.weights[l], prevActivations).map((val, i) => val + this.biases[l][i]);
            this.zValues[l] = z;
            this.activations[l + 1] = z.map(val => this.activate(val));
            prevActivations = this.activations[l + 1];
        }
        
        return this.activations[this.activations.length - 1];
    }
    
    // Backpropagation
    backward(input, target, learningRate) {
        const output = this.forward(input);
        const m = input.length;
        
        // Calculate output error
        let errors = [];
        for (let i = 0; i < output.length; i++) {
            errors[i] = output[i] - target[i];
        }
        
        // Backpropagate through layers
        let delta = errors;
        
        for (let l = this.weights.length - 1; l >= 0; l--) {
            // Calculate gradients
            const gradients = this.activations[l + 1].map((val, i) => 
                delta[i] * this.activateDerivative(this.zValues[l][i])
            );
            
            // Store activations for visualization
            if (l < this.weights.length - 1) {
                // Propagate error to previous layer
                const newDelta = [];
                for (let j = 0; j < this.weights[l].length; j++) {
                    let sum = 0;
                    for (let i = 0; i < delta.length; i++) {
                        sum += delta[i] * this.weights[l][i][j];
                    }
                    newDelta.push(sum);
                }
                delta = newDelta;
            }
            
            // Update weights and biases
            for (let i = 0; i < this.weights[l].length; i++) {
                for (let j = 0; j < this.weights[l][i].length; j++) {
                    this.weights[l][i][j] -= learningRate * gradients[i] * this.activations[l][j];
                }
                this.biases[l][i] -= learningRate * gradients[i];
            }
        }
        
        // Calculate loss (MSE)
        let loss = 0;
        for (let i = 0; i < output.length; i++) {
            loss += Math.pow(output[i] - target[i], 2);
        }
        return loss / output.length;
    }
    
    // Get total parameters
    getTotalParams() {
        let params = 0;
        for (let w of this.weights) {
            params += w.length * w[0].length;
        }
        for (let b of this.biases) {
            params += b.length;
        }
        return params;
    }
    
    // Get layer info
    getLayerInfo() {
        const layers = [this.inputNodes];
        for (let i = 0; i < this.hiddenLayers; i++) {
            layers.push(this.hiddenNodes);
        }
        layers.push(this.outputNodes);
        return layers;
    }
}

// =====================
// DATASETS
// =====================

const datasets = {
    xor: {
        name: 'XOR',
        inputs: [[0, 0], [0, 1], [1, 0], [1, 1]],
        outputs: [[0], [1], [1], [0]]
    },
    and: {
        name: 'AND',
        inputs: [[0, 0], [0, 1], [1, 0], [1, 1]],
        outputs: [[0], [0], [0], [1]]
    },
    or: {
        name: 'OR',
        inputs: [[0, 0], [0, 1], [1, 0], [1, 1]],
        outputs: [[0], [1], [1], [1]]
    },
    nand: {
        name: 'NAND',
        inputs: [[0, 0], [0, 1], [1, 0], [1, 1]],
        outputs: [[1], [1], [1], [0]]
    }
};

// =====================
// VISUALIZATION
// =====================

class NetworkVisualizer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.animationFrame = null;
        this.forwardAnimation = false;
        this.backwardAnimation = false;
        this.animationProgress = 0;
        this.highlightedLayer = -1;
    }
    
    draw(network, highlightLayer = -1, animationProgress = 1) {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Clear canvas
        ctx.fillStyle = '#16213e';
        ctx.fillRect(0, 0, width, height);
        
        if (!network || network.weights.length === 0) return;
        
        const layers = network.getLayerInfo();
        const numLayers = layers.length;
        
        // Calculate positions
        const layerSpacing = width / (numLayers + 1);
        const positions = [];
        
        for (let l = 0; l < numLayers; l++) {
            const nodesInLayer = layers[l];
            const nodeSpacing = Math.min(40, (height - 80) / nodesInLayer);
            const startY = (height - (nodesInLayer - 1) * nodeSpacing) / 2;
            
            positions[l] = [];
            for (let n = 0; n < nodesInLayer; n++) {
                positions[l][n] = {
                    x: layerSpacing * (l + 1),
                    y: startY + n * nodeSpacing
                };
            }
        }
        
        // Draw connections
        for (let l = 0; l < numLayers - 1; l++) {
            const currentLayer = positions[l];
            const nextLayer = positions[l + 1];
            const weights = network.weights[l];
            
            for (let i = 0; i < weights.length; i++) {
                for (let j = 0; j < weights[i].length; j++) {
                    const weight = weights[i][j];
                    const isHighlighted = highlightLayer === l;
                    
                    // Determine color based on weight
                    const absWeight = Math.abs(weight);
                    const alpha = Math.min(0.8, 0.2 + absWeight * 2);
                    
                    if (weight >= 0) {
                        ctx.strokeStyle = `rgba(74, 222, 128, ${alpha})`;
                    } else {
                        ctx.strokeStyle = `rgba(248, 113, 113, ${alpha})`;
                    }
                    
                    // Highlight animation
                    if (isHighlighted && animationProgress < 1) {
                        const animAlpha = alpha * animationProgress;
                        if (weight >= 0) {
                            ctx.strokeStyle = `rgba(74, 222, 128, ${animAlpha})`;
                        } else {
                            ctx.strokeStyle = `rgba(248, 113, 113, ${animAlpha})`;
                        }
                    }
                    
                    ctx.lineWidth = 1 + Math.abs(weight) * 3;
                    
                    ctx.beginPath();
                    ctx.moveTo(currentLayer[j].x, currentLayer[j].y);
                    ctx.lineTo(nextLayer[i].x, nextLayer[i].y);
                    ctx.stroke();
                }
            }
        }
        
        // Draw nodes
        for (let l = 0; l < numLayers; l++) {
            const nodes = positions[l];
            const activations = network.activations[l];
            
            for (let n = 0; n < nodes.length; n++) {
                const node = nodes[n];
                const activation = activations[n];
                
                // Node background
                ctx.beginPath();
                ctx.arc(node.x, node.y, 15, 0, Math.PI * 2);
                ctx.fillStyle = '#0f3460';
                ctx.fill();
                
                // Node border
                ctx.strokeStyle = highlightLayer === l ? '#f093fb' : '#00d4ff';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // Activation color
                const intensity = Math.min(1, Math.abs(activation));
                const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 15);
                
                if (activation >= 0) {
                    gradient.addColorStop(0, `rgba(0, 212, 255, ${intensity})`);
                    gradient.addColorStop(1, 'rgba(0, 212, 255, 0.2)');
                } else {
                    gradient.addColorStop(0, `rgba(248, 113, 113, ${intensity})`);
                    gradient.addColorStop(1, 'rgba(248, 113, 113, 0.2)');
                }
                
                ctx.beginPath();
                ctx.arc(node.x, node.y, 14, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();
                
                // Node label
                ctx.fillStyle = '#e8e8e8';
                ctx.font = '10px Inter';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                let label;
                if (l === 0) {
                    label = `I${n}`;
                } else if (l === numLayers - 1) {
                    label = `O${n}`;
                } else {
                    label = `H${n}`;
                }
                ctx.fillText(label, node.x, node.y + 25);
                
                // Show activation value on hover or during animation
                if (highlightLayer === l || this.forwardAnimation || this.backwardAnimation) {
                    ctx.fillStyle = '#a0a0a0';
                    ctx.font = '9px Inter';
                    ctx.fillText(activation.toFixed(2), node.x, node.y);
                }
            }
        }
        
        // Layer labels
        ctx.fillStyle = '#a0a0a0';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        
        for (let l = 0; l < numLayers; l++) {
            let label;
            if (l === 0) label = 'Input';
            else if (l === numLayers - 1) label = 'Output';
            else label = `Hidden ${l}`;
            
            const x = positions[l][0].x;
            ctx.fillText(label, x, 25);
        }
    }
    
    animateForwardPass(network, callback) {
        this.forwardAnimation = true;
        this.backwardAnimation = false;
        
        const layers = network.getLayerInfo();
        let currentLayer = 0;
        
        const animate = () => {
            this.draw(network, currentLayer, 1);
            currentLayer++;
            
            if (currentLayer < layers.length) {
                setTimeout(() => requestAnimationFrame(animate), 300);
            } else {
                this.forwardAnimation = false;
                this.highlightedLayer = -1;
                if (callback) callback();
            }
        };
        
        animate();
    }
    
    animateBackwardPass(network, callback) {
        this.forwardAnimation = false;
        this.backwardAnimation = true;
        
        const layers = network.getLayerInfo();
        let currentLayer = layers.length - 1;
        
        const animate = () => {
            this.draw(network, currentLayer, 1);
            currentLayer--;
            
            if (currentLayer >= 0) {
                setTimeout(() => requestAnimationFrame(animate), 300);
            } else {
                this.backwardAnimation = false;
                this.highlightedLayer = -1;
                if (callback) callback();
            }
        };
        
        animate();
    }
}

// =====================
// LOSS CHART
// =====================

class LossChart {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.lossHistory = [];
        this.maxLoss = 1;
    }
    
    addLoss(loss) {
        this.lossHistory.push(loss);
        if (this.lossHistory.length > 100) {
            this.lossHistory.shift();
        }
        if (loss > this.maxLoss) {
            this.maxLoss = loss * 1.2;
        }
        this.draw();
    }
    
    reset() {
        this.lossHistory = [];
        this.maxLoss = 1;
        this.draw();
    }
    
    draw() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Clear
        ctx.fillStyle = '#0f3460';
        ctx.fillRect(0, 0, width, height);
        
        if (this.lossHistory.length < 2) return;
        
        // Draw grid
        ctx.strokeStyle = '#2a2a4a';
        ctx.lineWidth = 1;
        
        // Horizontal lines
        for (let i = 0; i <= 4; i++) {
            const y = (height / 4) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        // Draw loss line
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        const stepX = width / (this.lossHistory.length - 1);
        
        for (let i = 0; i < this.lossHistory.length; i++) {
            const x = i * stepX;
            const y = height - (this.lossHistory[i] / this.maxLoss) * height;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.stroke();
        
        // Draw current loss point
        if (this.lossHistory.length > 0) {
            const lastX = (this.lossHistory.length - 1) * stepX;
            const lastY = height - (this.lossHistory[this.lossHistory.length - 1] / this.maxLoss) * height;
            
            ctx.beginPath();
            ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#667eea';
            ctx.fill();
        }
    }
}

// =====================
// MAIN APPLICATION
// =====================

// Global state
let neuralNetwork = null;
let visualizer = null;
let lossChart = null;
let currentDataset = datasets.xor;
let trainingInterval = null;
let isTraining = false;
let trainingData = [];

// DOM Elements
const canvas = document.getElementById('networkCanvas');
const lossCanvas = document.getElementById('lossChart');

// Initialize
function init() {
    visualizer = new NetworkVisualizer(canvas);
    lossChart = new LossChart(lossCanvas);
    
    // Build initial network
    buildNetwork();
    
    // Load initial dataset
    loadDataset();
    
    // Set up event listeners
    setupEventListeners();
    
    // Draw empty network
    visualizer.draw(null);
    lossChart.draw();
}

function setupEventListeners() {
    // Build network button
    document.getElementById('buildBtn').addEventListener('click', buildNetwork);
    
    // Load dataset button
    document.getElementById('loadDatasetBtn').addEventListener('click', loadDataset);
    
    // Dataset selector
    document.getElementById('datasetSelect').addEventListener('change', loadDataset);
    
    // Learning rate slider
    const lrSlider = document.getElementById('learningRate');
    const lrValue = document.getElementById('lrValue');
    lrSlider.addEventListener('input', () => {
        lrValue.textContent = lrSlider.value;
    });
    
    // Activation function selector
    document.getElementById('activationFn').addEventListener('change', () => {
        if (neuralNetwork) {
            neuralNetwork.activationType = document.getElementById('activationFn').value;
            document.getElementById('activationInfo').textContent = 
                document.getElementById('activationFn').value.charAt(0).toUpperCase() + 
                document.getElementById('activationFn').value.slice(1);
        }
    });
    
    // Train buttons
    document.getElementById('trainBtn').addEventListener('click', startTraining);
    document.getElementById('stepBtn').addEventListener('click', trainStep);
    document.getElementById('stopBtn').addEventListener('click', stopTraining);
    
    // Predict button
    document.getElementById('predictBtn').addEventListener('click', makePrediction);
    
    // Visualization controls
    document.getElementById('forwardPassBtn').addEventListener('click', () => {
        if (neuralNetwork) {
            visualizer.animateForwardPass(neuralNetwork);
        }
    });
    
    document.getElementById('backwardPassBtn').addEventListener('click', () => {
        if (neuralNetwork) {
            visualizer.animateBackwardPass(neuralNetwork);
        }
    });
    
    document.getElementById('resetVizBtn').addEventListener('click', () => {
        if (neuralNetwork) {
            visualizer.draw(neuralNetwork);
        }
    });
}

function buildNetwork() {
    const inputNodes = parseInt(document.getElementById('inputNeurons').value);
    const hiddenLayers = parseInt(document.getElementById('hiddenLayers').value);
    const hiddenNodes = parseInt(document.getElementById('hiddenNeurons').value);
    const outputNodes = parseInt(document.getElementById('outputNeurons').value);
    const activation = document.getElementById('activationFn').value;
    
    neuralNetwork = new NeuralNetwork(inputNodes, hiddenLayers, hiddenNodes, outputNodes, activation);
    
    // Update info
    updateNetworkInfo();
    
    // Redraw
    visualizer.draw(neuralNetwork);
    
    // Reset test inputs
    updateTestInputs();
}

function updateNetworkInfo() {
    if (!neuralNetwork) return;
    
    document.getElementById('totalParams').textContent = neuralNetwork.getTotalParams();
    document.getElementById('layerCount').textContent = neuralNetwork.getLayerInfo().length;
    document.getElementById('activationInfo').textContent = 
        neuralNetwork.activationType.charAt(0).toUpperCase() + 
        neuralNetwork.activationType.slice(1);
}

function loadDataset() {
    const datasetName = document.getElementById('datasetSelect').value;
    currentDataset = datasets[datasetName];
    
    // Display dataset
    const dataPreview = document.getElementById('dataPreview');
    let html = '<table><thead><tr><th>Input 1</th><th>Input 2</th><th>Output</th></tr></thead><tbody>';
    
    for (let i = 0; i < currentDataset.inputs.length; i++) {
        html += `<tr>
            <td>${currentDataset.inputs[i][0]}</td>
            <td>${currentDataset.inputs[i][1]}</td>
            <td>${currentDataset.outputs[i][0].toFixed(2)}</td>
        </tr>`;
    }
    
    html += '</tbody></table>';
    dataPreview.innerHTML = html;
    
    // Reset training
    stopTraining();
    lossChart.reset();
    document.getElementById('currentEpoch').textContent = '0';
    document.getElementById('currentLoss').textContent = '-';
    document.getElementById('currentAccuracy').textContent = '-';
    
    // Update test inputs
    updateTestInputs();
}

function updateTestInputs() {
    const testInputs = document.getElementById('testInputs');
    const numInputs = parseInt(document.getElementById('inputNeurons').value);
    
    let html = '';
    for (let i = 0; i < numInputs; i++) {
        html += `<div class="test-input">
            <label>X${i}:</label>
            <input type="number" id="testInput${i}" value="0" min="0" max="1" step="0.1">
        </div>`;
    }
    testInputs.innerHTML = html;
}

function startTraining() {
    if (isTraining || !neuralNetwork) return;
    
    isTraining = true;
    document.querySelector('.container').classList.add('training');
    
    const learningRate = parseFloat(document.getElementById('learningRate').value);
    const epochs = parseInt(document.getElementById('epochs').value);
    
    // Prepare training data
    trainingData = [];
    for (let i = 0; i < currentDataset.inputs.length; i++) {
        trainingData.push({
            input: currentDataset.inputs[i],
            output: currentDataset.outputs[i]
        });
    }
    
    let epoch = 0;
    const maxEpochs = epochs;
    
    trainingInterval = setInterval(() => {
        // Train one epoch
        let totalLoss = 0;
        
        for (let data of trainingData) {
            const loss = neuralNetwork.backward(data.input, data.output, learningRate);
            totalLoss += loss;
        }
        
        const avgLoss = totalLoss / trainingData.length;
        
        // Calculate accuracy
        let correct = 0;
        for (let data of trainingData) {
            const prediction = neuralNetwork.forward(data.input);
            const predicted = prediction[0] > 0.5 ? 1 : 0;
            const actual = data.output[0] > 0.5 ? 1 : 0;
            if (predicted === actual) correct++;
        }
        const accuracy = (correct / trainingData.length) * 100;
        
        // Update UI
        epoch++;
        document.getElementById('currentEpoch').textContent = epoch;
        document.getElementById('currentLoss').textContent = avgLoss.toFixed(6);
        document.getElementById('currentAccuracy').textContent = accuracy.toFixed(1) + '%';
        
        lossChart.addLoss(avgLoss);
        
        // Update visualization
        visualizer.draw(neuralNetwork);
        
        // Check if training complete
        if (epoch >= maxEpochs || avgLoss < 0.001) {
            stopTraining();
        }
    }, 50);
}

function trainStep() {
    if (!neuralNetwork) return;
    
    const learningRate = parseFloat(document.getElementById('learningRate').value);
    
    // Prepare training data
    trainingData = [];
    for (let i = 0; i < currentDataset.inputs.length; i++) {
        trainingData.push({
            input: currentDataset.inputs[i],
            output: currentDataset.outputs[i]
        });
    }
    
    // Train one step
    let totalLoss = 0;
    
    for (let data of trainingData) {
        const loss = neuralNetwork.backward(data.input, data.output, learningRate);
        totalLoss += loss;
    }
    
    const avgLoss = totalLoss / trainingData.length;
    
    // Calculate accuracy
    let correct = 0;
    for (let data of trainingData) {
        const prediction = neuralNetwork.forward(data.input);
        const predicted = prediction[0] > 0.5 ? 1 : 0;
        const actual = data.output[0] > 0.5 ? 1 : 0;
        if (predicted === actual) correct++;
    }
    const accuracy = (correct / trainingData.length) * 100;
    
    // Update UI
    const currentEpoch = parseInt(document.getElementById('currentEpoch').textContent) || 0;
    document.getElementById('currentEpoch').textContent = currentEpoch + 1;
    document.getElementById('currentLoss').textContent = avgLoss.toFixed(6);
    document.getElementById('currentAccuracy').textContent = accuracy.toFixed(1) + '%';
    
    lossChart.addLoss(avgLoss);
    
    // Update visualization with forward pass animation
    visualizer.animateForwardPass(neuralNetwork);
}

function stopTraining() {
    isTraining = false;
    document.querySelector('.container').classList.remove('training');
    
    if (trainingInterval) {
        clearInterval(trainingInterval);
        trainingInterval = null;
    }
}

function makePrediction() {
    if (!neuralNetwork) return;
    
    const numInputs = parseInt(document.getElementById('inputNeurons').value);
    const input = [];
    
    for (let i = 0; i < numInputs; i++) {
        const val = parseFloat(document.getElementById(`testInput${i}`).value);
        input.push(val);
    }
    
    // Forward pass
    const output = neuralNetwork.forward(input);
    
    // Display prediction
    const predictionResult = document.getElementById('predictionResult');
    predictionResult.innerHTML = `
        <div class="label">Prediction:</div>
        <div class="value">${output[0].toFixed(4)}</div>
    `;
    
    // Animate forward pass
    visualizer.animateForwardPass(neuralNetwork);
}

// Start the application
document.addEventListener('DOMContentLoaded', init);
