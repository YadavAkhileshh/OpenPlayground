
class Matrix {
    constructor(rows, cols) {
        this.rows = rows; this.cols = cols;
        this.data = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
    }

    randomize() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                this.data[i][j] = Math.random() * 2 - 1;
            }
        }
    }

    static fromArray(arr) {
        let m = new Matrix(arr.length, 1);
        for (let i = 0; i < arr.length; i++) m.data[i][0] = arr[i];
        return m;
    }

    toArray() {
        let arr = [];
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) arr.push(this.data[i][j]);
        }
        return arr;
    }

    static multiply(a, b) {
        let result = new Matrix(a.rows, b.cols);
        for (let i = 0; i < result.rows; i++) {
            for (let j = 0; j < result.cols; j++) {
                let sum = 0;
                for (let k = 0; k < a.cols; k++) sum += a.data[i][k] * b.data[k][j];
                result.data[i][j] = sum;
            }
        }
        return result;
    }

    multiply(n) {
        if (n instanceof Matrix) {
            for (let i = 0; i < this.rows; i++) {
                for (let j = 0; j < this.cols; j++) this.data[i][j] *= n.data[i][j];
            }
        } else {
            for (let i = 0; i < this.rows; i++) {
                for (let j = 0; j < this.cols; j++) this.data[i][j] *= n;
            }
        }
    }

    add(n) {
        if (n instanceof Matrix) {
            for (let i = 0; i < this.rows; i++) {
                for (let j = 0; j < this.cols; j++) this.data[i][j] += n.data[i][j];
            }
        } else {
            for (let i = 0; i < this.rows; i++) {
                for (let j = 0; j < this.cols; j++) this.data[i][j] += n;
            }
        }
    }

    static subtract(a, b) {
        let result = new Matrix(a.rows, a.cols);
        for (let i = 0; i < result.rows; i++) {
            for (let j = 0; j < result.cols; j++) result.data[i][j] = a.data[i][j] - b.data[i][j];
        }
        return result;
    }

    static transpose(m) {
        let result = new Matrix(m.cols, m.rows);
        for (let i = 0; i < m.rows; i++) {
            for (let j = 0; j < m.cols; j++) result.data[j][i] = m.data[i][j];
        }
        return result;
    }

    map(func) {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) this.data[i][j] = func(this.data[i][j], i, j);
        }
    }

    static map(m, func) {
        let result = new Matrix(m.rows, m.cols);
        for (let i = 0; i < m.rows; i++) {
            for (let j = 0; j < m.cols; j++) result.data[i][j] = func(m.data[i][j], i, j);
        }
        return result;
    }
}

function sigmoid(x) { return 1 / (1 + Math.exp(-x)); }
function dsigmoid(y) { return y * (1 - y); } // Derivative for backprop

class NeuralNetwork {
    constructor(inputNodes, hiddenNodes, outputNodes) {
        this.inputNodes = inputNodes;
        this.hiddenNodes = hiddenNodes;
        this.outputNodes = outputNodes;

        this.weights_ih = new Matrix(this.hiddenNodes, this.inputNodes);
        this.weights_ho = new Matrix(this.outputNodes, this.hiddenNodes);
        this.weights_ih.randomize();
        this.weights_ho.randomize();

        this.bias_h = new Matrix(this.hiddenNodes, 1);
        this.bias_o = new Matrix(this.outputNodes, 1);
        this.bias_h.randomize();
        this.bias_o.randomize();
        
        this.learningRate = 0.1;
    }

    predict(inputArray) {
        let inputs = Matrix.fromArray(inputArray);
        let hidden = Matrix.multiply(this.weights_ih, inputs);
        hidden.add(this.bias_h);
        hidden.map(sigmoid);

        let output = Matrix.multiply(this.weights_ho, hidden);
        output.add(this.bias_o);
        output.map(sigmoid);

        return output.toArray();
    }

    train(inputArray, targetArray) {
        // 1. Forward Pass
        let inputs = Matrix.fromArray(inputArray);
        let hidden = Matrix.multiply(this.weights_ih, inputs);
        hidden.add(this.bias_h);
        hidden.map(sigmoid);

        let outputs = Matrix.multiply(this.weights_ho, hidden);
        outputs.add(this.bias_o);
        outputs.map(sigmoid);

        
        let targets = Matrix.fromArray(targetArray);
        let outputErrors = Matrix.subtract(targets, outputs);

        let gradients = Matrix.map(outputs, dsigmoid);
        gradients.multiply(outputErrors);
        gradients.multiply(this.learningRate);

        
        let hidden_T = Matrix.transpose(hidden);
        let weight_ho_deltas = Matrix.multiply(gradients, hidden_T);

    
        this.weights_ho.add(weight_ho_deltas);
        this.bias_o.add(gradients);

        // 6. Calculate Hidden Errors
        let who_T = Matrix.transpose(this.weights_ho);
        let hiddenErrors = Matrix.multiply(who_T, outputErrors);

        // 7. Calculate Hidden Gradients
        let hiddenGradient = Matrix.map(hidden, dsigmoid);
        hiddenGradient.multiply(hiddenErrors);
        hiddenGradient.multiply(this.learningRate);

        // 8. Calculate Input->Hidden Deltas
        let inputs_T = Matrix.transpose(inputs);
        let weight_ih_deltas = Matrix.multiply(hiddenGradient, inputs_T);

        // 9. Adjust Weights & Biases for Hidden Layer
        this.weights_ih.add(weight_ih_deltas);
        this.bias_h.add(hiddenGradient);
    }
}


class DrawingApp {
    constructor() {
        this.canvas = document.getElementById('drawCanvas');
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        this.hiddenCanvas = document.getElementById('hiddenCanvas');
        this.hiddenCtx = this.hiddenCanvas.getContext('2d', { willReadFrequently: true });
        
        this.nn = new NeuralNetwork(784, 64, 10);
        this.isDrawing = false;
        
        this.ctx.lineWidth = 20;
        this.ctx.lineCap = 'round';
        this.ctx.strokeStyle = 'white';
        
        this.initUI();
        this.clearCanvas();
        this.setupEvents();
    }

    initUI() {
        const barsContainer = document.getElementById('confidence-bars');
        const btnsContainer = document.getElementById('train-buttons');
        barsContainer.innerHTML = '';
        btnsContainer.innerHTML = '';
        
        for (let i = 0; i < 10; i++) {
            barsContainer.innerHTML += `
                <div class="bar-row">
                    <div class="bar-label">${i}</div>
                    <div class="bar-track"><div class="bar-fill" id="bar-${i}"></div></div>
                </div>
            `;
            btnsContainer.innerHTML += `<button class="train-btn" onclick="app.trainNetwork(${i})">${i}</button>`;
        }
    }

    setupEvents() {
        this.canvas.addEventListener('mousedown', (e) => {
            this.isDrawing = true;
            this.ctx.beginPath();
            this.ctx.moveTo(e.offsetX, e.offsetY);
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isDrawing) {
                this.ctx.lineTo(e.offsetX, e.offsetY);
                this.ctx.stroke();
            }
        });

        this.canvas.addEventListener('mouseup', () => this.isDrawing = false);
        this.canvas.addEventListener('mouseout', () => this.isDrawing = false);
    }

    clearCanvas() {
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        document.getElementById('prediction-output').innerText = "?";
        this.updateBars(Array(10).fill(0));
    }

    updateBars(probabilities) {
        for (let i = 0; i < 10; i++) {
            document.getElementById(`bar-${i}`).style.width = `${probabilities[i] * 100}%`;
        }
    }

    getPixelData() {
        this.hiddenCtx.drawImage(this.canvas, 0, 0, 28, 28);
        let imgData = this.hiddenCtx.getImageData(0, 0, 28, 28);
        let inputs = [];
        for (let i = 0; i < imgData.data.length; i += 4) {
            inputs.push((imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2]) / 3 / 255);
        }
        return inputs;
    }

    predict() {
        let inputs = this.getPixelData();
        let outputs = this.nn.predict(inputs);
        
        // Normalize for visual display
        let sum = outputs.reduce((a, b) => a + b, 0);
        let normalized = outputs.map(val => sum === 0 ? 0 : val / sum);
        
        let highestIndex = 0; let highestValue = 0;
        for (let i = 0; i < normalized.length; i++) {
            if (normalized[i] > highestValue) { highestValue = normalized[i]; highestIndex = i; }
        }

        this.updateBars(normalized);
        document.getElementById('prediction-output').innerText = highestIndex;
    }

    trainNetwork(targetNumber) {
        let inputs = this.getPixelData();
        
        // Create the target array (e.g. if target is 3, array is [0,0,0,1,0,0,0,0,0,0])
        let targets = Array(10).fill(0);
        targets[targetNumber] = 1;
        
        // Train it multiple times on this one image to drill it in quickly
        for(let i = 0; i < 15; i++) {
            this.nn.train(inputs, targets);
        }
        
        alert(`Network learned this image as a ${targetNumber}!`);
        this.clearCanvas();
    }
}

const app = new DrawingApp();