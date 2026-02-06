/**
 * Neuro-Flappy Engine
 * Custom Neural Network & Genetic Algorithm Implementation.
 */

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const netCanvas = document.getElementById('net-canvas');
const netCtx = netCanvas.getContext('2d');

// --- Config ---
const TOTAL_BIRDS = 50;
const GRAVITY = 0.6;
const LIFT = -10;
const PIPE_SPEED = 3;
const PIPE_SPAWN_RATE = 100; // Frames
const GAP_SIZE = 120; // Easy gap for training

// --- State ---
let width, height;
let birds = [];
let savedBirds = [];
let pipes = [];
let frameCount = 0;
let generation = 1;
let speedMult = 1;
let highScore = 0;
let bestBird = null; // For visualization

// --- Neural Network Class (Simple Feedforward) ---
class NeuralNetwork {
    constructor(a, b, c, d) {
        if (a instanceof NeuralNetwork) {
            this.input_nodes = a.input_nodes;
            this.hidden_nodes = a.hidden_nodes;
            this.output_nodes = a.output_nodes;
            // Deep copy weights
            this.weights_ih = a.weights_ih.map(row => [...row]);
            this.weights_ho = a.weights_ho.map(row => [...row]);
            this.bias_h = [...a.bias_h];
            this.bias_o = [...a.bias_o];
        } else {
            this.input_nodes = a;
            this.hidden_nodes = b;
            this.output_nodes = c;
            // Initialize random weights -1 to 1
            this.weights_ih = this.createMatrix(this.hidden_nodes, this.input_nodes);
            this.weights_ho = this.createMatrix(this.output_nodes, this.hidden_nodes);
            this.bias_h = new Array(this.hidden_nodes).fill(0).map(() => Math.random() * 2 - 1);
            this.bias_o = new Array(this.output_nodes).fill(0).map(() => Math.random() * 2 - 1);
        }
    }

    createMatrix(rows, cols) {
        return new Array(rows).fill(0).map(() => new Array(cols).fill(0).map(() => Math.random() * 2 - 1));
    }

    predict(input_array) {
        // Input -> Hidden
        let hidden = this.matrixMap(this.weights_ih, input_array, this.bias_h);
        hidden = hidden.map(val => this.sigmoid(val)); // Activation

        // Hidden -> Output
        let output = this.matrixMap(this.weights_ho, hidden, this.bias_o);
        output = output.map(val => this.sigmoid(val));

        return output;
    }

    // Helper: Matrix * Vector + Bias
    matrixMap(weights, inputs, bias) {
        return weights.map((row, i) => {
            let sum = 0;
            for (let j = 0; j < row.length; j++) {
                sum += row[j] * inputs[j];
            }
            return sum + bias[i];
        });
    }

    sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }

    mutate(rate) {
        const mutateVal = (val) => {
            if (Math.random() < rate) {
                // Add random gaussian noise
                return val + (Math.random() * 0.2 - 0.1); 
            }
            return val;
        };

        this.weights_ih = this.weights_ih.map(row => row.map(mutateVal));
        this.weights_ho = this.weights_ho.map(row => row.map(mutateVal));
        this.bias_h = this.bias_h.map(mutateVal);
        this.bias_o = this.bias_o.map(mutateVal);
    }
}

// --- Game Entities ---

class Bird {
    constructor(brain) {
        this.y = height / 2;
        this.x = 60;
        this.velocity = 0;
        this.gravity = GRAVITY;
        this.lift = LIFT;
        this.score = 0;
        this.fitness = 0;
        this.dead = false;
        
        // Brain: 5 Inputs, 8 Hidden, 1 Output
        // Inputs: y, vel, pipeDist, topPipeY, bottomPipeY
        if (brain) {
            this.brain = brain.copy();
        } else {
            this.brain = new NeuralNetwork(5, 8, 1);
        }
    }

    think(pipes) {
        // Find closest pipe
        let closest = null;
        let closestD = Infinity;
        for (let i = 0; i < pipes.length; i++) {
            let d = (pipes[i].x + pipes[i].w) - this.x;
            if (d > 0 && d < closestD) {
                closestD = d;
                closest = pipes[i];
            }
        }

        if (closest) {
            // Normalize inputs 0-1 for Neural Net stability
            let inputs = [];
            inputs[0] = this.y / height;
            inputs[1] = this.velocity / 10; 
            inputs[2] = closest.x / width;
            inputs[3] = closest.top / height;
            inputs[4] = (closest.top + GAP_SIZE) / height;

            let output = this.brain.predict(inputs);
            
            // Output node > 0.5 means JUMP
            if (output[0] > 0.5) {
                this.jump();
            }
        }
    }

    update() {
        this.score++;
        this.velocity += this.gravity;
        this.y += this.velocity;
    }

    jump() {
        this.velocity = this.lift;
    }
}

// Fake copy method for NN
NeuralNetwork.prototype.copy = function() {
    return new NeuralNetwork(this);
};

class Pipe {
    constructor() {
        this.x = width;
        this.w = 50;
        this.top = Math.random() * (height / 2);
        this.bottom = height - (this.top + GAP_SIZE);
        this.speed = PIPE_SPEED;
    }

    update() {
        this.x -= this.speed;
    }

    offscreen() {
        return this.x < -this.w;
    }

    hits(bird) {
        if (bird.y < this.top || bird.y > height - this.bottom) {
            if (bird.x > this.x && bird.x < this.x + this.w) {
                return true;
            }
        }
        return false;
    }
}

// --- Genetic Algorithm ---

function nextGeneration() {
    calculateFitness();
    
    birds = [];
    
    // Elitism: Keep the absolute best one unchanged
    let bestBrain = savedBirds[savedBirds.length - 1].brain.copy(); // Saved is sorted
    let champion = new Bird(bestBrain);
    champion.isChamp = true;
    birds.push(champion);

    // Generate rest
    for (let i = 1; i < TOTAL_BIRDS; i++) {
        let parent = pickOne();
        let childBrain = parent.brain.copy();
        childBrain.mutate(0.1); // 10% mutation rate
        birds.push(new Bird(childBrain));
    }
    
    savedBirds = [];
    generation++;
    log(`Generation ${generation} started.`);
}

function calculateFitness() {
    let sum = 0;
    for (let bird of savedBirds) {
        sum += bird.score;
    }
    for (let bird of savedBirds) {
        bird.fitness = bird.score / sum;
    }
    // Sort by fitness (for Elitism)
    savedBirds.sort((a, b) => a.fitness - b.fitness);
}

function pickOne() {
    let index = 0;
    let r = Math.random();
    while (r > 0) {
        r = r - savedBirds[index].fitness;
        index++;
    }
    index--;
    return savedBirds[index];
}

// --- Core Loop ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // UI
    document.getElementById('speed-slider').addEventListener('input', e => {
        speedMult = parseInt(e.target.value);
        document.getElementById('speed-val').innerText = speedMult + 'x';
    });
    
    document.getElementById('btn-reset').addEventListener('click', () => {
        generation = 1;
        highScore = 0;
        birds = [];
        savedBirds = [];
        pipes = [];
        spawnPopulation();
        log("Population reset.");
    });

    spawnPopulation();
    loop();
}

function spawnPopulation() {
    for (let i = 0; i < TOTAL_BIRDS; i++) {
        birds.push(new Bird());
    }
}

function resizeCanvas() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
}

function log(msg) {
    const box = document.getElementById('info-log');
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerText = `> ${msg}`;
    box.appendChild(entry);
    box.scrollTop = box.scrollHeight;
}

function loop() {
    // Speed control loop
    for (let n = 0; n < speedMult; n++) {
        if (birds.length === 0) {
            nextGeneration();
            pipes = [];
            frameCount = 0;
        }

        // Logic
        if (frameCount % PIPE_SPAWN_RATE === 0) {
            pipes.push(new Pipe());
        }

        // Update Pipes
        for (let i = pipes.length - 1; i >= 0; i--) {
            pipes[i].update();
            
            // Check Collision
            for (let j = birds.length - 1; j >= 0; j--) {
                if (pipes[i].hits(birds[j])) {
                    savedBirds.push(birds.splice(j, 1)[0]);
                }
            }

            if (pipes[i].offscreen()) {
                pipes.splice(i, 1);
            }
        }

        // Update Birds
        let currentBest = birds[0];
        for (let i = birds.length - 1; i >= 0; i--) {
            let bird = birds[i];
            
            // Floor/Ceiling check
            if (bird.y > height || bird.y < 0) {
                savedBirds.push(birds.splice(i, 1)[0]);
                continue;
            }

            bird.think(pipes);
            bird.update();

            // Track current best for viz
            if (bird.score > (currentBest ? currentBest.score : 0)) {
                currentBest = bird;
            }
        }
        
        bestBird = currentBest;
        frameCount++;
    }

    // --- Rendering (Only once per frame) ---
    
    // Background
    ctx.fillStyle = '#70c5ce';
    ctx.fillRect(0, 0, width, height);

    // Pipes
    ctx.fillStyle = '#2ecc71';
    ctx.strokeStyle = '#27ae60';
    ctx.lineWidth = 2;
    for (let pipe of pipes) {
        // Top
        ctx.fillRect(pipe.x, 0, pipe.w, pipe.top);
        ctx.strokeRect(pipe.x, 0, pipe.w, pipe.top);
        // Bottom
        ctx.fillRect(pipe.x, height - pipe.bottom, pipe.w, pipe.bottom);
        ctx.strokeRect(pipe.x, height - pipe.bottom, pipe.w, pipe.bottom);
    }

    // Birds
    for (let bird of birds) {
        ctx.fillStyle = bird.isChamp ? '#f1c40f' : 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(bird.x, bird.y, 12, 0, Math.PI * 2);
        ctx.fill();
    }

    // Stats UI Update
    if (bestBird) {
        if (bestBird.score > highScore) highScore = bestBird.score;
        document.getElementById('stat-score').innerText = highScore;
        drawBrainViz(bestBird.brain);
    }
    document.getElementById('stat-gen').innerText = generation;
    document.getElementById('stat-alive').innerText = birds.length;

    requestAnimationFrame(loop);
}

// --- Visualizer ---

function drawBrainViz(brain) {
    if (!brain) return;
    
    const w = netCanvas.width;
    const h = netCanvas.height;
    netCtx.clearRect(0, 0, w, h);
    
    // Coords
    const inputX = 30;
    const hiddenX = w / 2;
    const outputX = w - 30;
    
    const drawNodes = (count, x, color) => {
        const gap = h / (count + 1);
        let pos = [];
        for (let i = 0; i < count; i++) {
            const y = gap * (i + 1);
            netCtx.beginPath();
            netCtx.arc(x, y, 6, 0, Math.PI*2);
            netCtx.fillStyle = color;
            netCtx.fill();
            pos.push({x, y});
        }
        return pos;
    };

    const inputs = drawNodes(5, inputX, '#3498db');
    const hiddens = drawNodes(8, hiddenX, '#9b59b6');
    const outputs = drawNodes(1, outputX, '#e74c3c');

    // Draw weights (connections)
    // Input -> Hidden
    netCtx.lineWidth = 1;
    for (let i = 0; i < inputs.length; i++) {
        for (let j = 0; j < hiddens.length; j++) {
            const weight = brain.weights_ih[j][i];
            const alpha = Math.abs(weight);
            netCtx.strokeStyle = weight > 0 ? `rgba(46, 204, 113, ${alpha})` : `rgba(231, 76, 60, ${alpha})`;
            netCtx.beginPath();
            netCtx.moveTo(inputs[i].x, inputs[i].y);
            netCtx.lineTo(hiddens[j].x, hiddens[j].y);
            netCtx.stroke();
        }
    }

    // Hidden -> Output
    for (let i = 0; i < hiddens.length; i++) {
        for (let j = 0; j < outputs.length; j++) {
            const weight = brain.weights_ho[j][i];
            const alpha = Math.abs(weight);
            netCtx.strokeStyle = weight > 0 ? `rgba(46, 204, 113, ${alpha})` : `rgba(231, 76, 60, ${alpha})`;
            netCtx.beginPath();
            netCtx.moveTo(hiddens[i].x, hiddens[i].y);
            netCtx.lineTo(outputs[j].x, outputs[j].y);
            netCtx.stroke();
        }
    }
}

// Start
init();