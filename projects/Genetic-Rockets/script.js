/**
 * Genetic Rockets Engine
 * Implements Genetic Algorithm (Selection, Crossover, Mutation).
 */

const canvas = document.getElementById('sim-canvas');
const ctx = canvas.getContext('2d');

// --- Config ---
const POPULATION_SIZE = 50;
const LIFESPAN = 400; // Frames per generation
let MUTATION_RATE = 0.01;
let SPEED_MULTIPLIER = 1;

// --- State ---
let width, height;
let population;
let target = { x: 0, y: 0, r: 16 };
let obstacle = { x: 0, y: 0, w: 200, h: 20 };
let count = 0; // Current frame in lifespan
let generation = 1;

// --- Classes ---

class DNA {
    constructor(genes) {
        if (genes) {
            this.genes = genes;
        } else {
            this.genes = [];
            for (let i = 0; i < LIFESPAN; i++) {
                // Random vector
                this.genes[i] = p5VectorRandom2D(); // Helper needed
            }
        }
    }

    crossover(partner) {
        const newGenes = [];
        const mid = Math.floor(Math.random() * this.genes.length);
        for (let i = 0; i < this.genes.length; i++) {
            if (i > mid) {
                newGenes[i] = this.genes[i];
            } else {
                newGenes[i] = partner.genes[i];
            }
        }
        return new DNA(newGenes);
    }

    mutation() {
        for (let i = 0; i < this.genes.length; i++) {
            if (Math.random() < MUTATION_RATE) {
                this.genes[i] = p5VectorRandom2D();
            }
        }
    }
}

class Rocket {
    constructor(dna) {
        this.pos = { x: width / 2, y: height - 50 };
        this.vel = { x: 0, y: 0 };
        this.acc = { x: 0, y: 0 };
        this.dna = dna || new DNA();
        this.fitness = 0;
        this.completed = false;
        this.crashed = false;
        this.timeFinished = 0; // Reward faster completion
    }

    applyForce(force) {
        this.acc.x += force.x;
        this.acc.y += force.y;
    }

    calcFitness() {
        // Distance to target
        const d = dist(this.pos.x, this.pos.y, target.x, target.y);
        
        // Inverse distance mapping
        this.fitness = 1 / (d * d); // Exponential reward for closeness
        
        if (this.completed) {
            this.fitness *= 10; // Big bonus
            // Speed bonus
            this.fitness *= (1 + (LIFESPAN - this.timeFinished) / LIFESPAN);
        }
        if (this.crashed) {
            this.fitness /= 10; // Penalty
        }
    }

    update() {
        const d = dist(this.pos.x, this.pos.y, target.x, target.y);
        
        // Check Success
        if (d < target.r) {
            this.completed = true;
            this.pos = { ...target }; // Snap to center
            if (this.timeFinished === 0) this.timeFinished = count;
        }

        // Check Obstacle Hit
        if (
            this.pos.x > obstacle.x && 
            this.pos.x < obstacle.x + obstacle.w &&
            this.pos.y > obstacle.y && 
            this.pos.y < obstacle.y + obstacle.h
        ) {
            this.crashed = true;
        }

        // Check Walls
        if (this.pos.x > width || this.pos.x < 0 || this.pos.y > height || this.pos.y < 0) {
            this.crashed = true;
        }

        if (!this.completed && !this.crashed) {
            this.applyForce(this.dna.genes[count]);
            
            this.vel.x += this.acc.x;
            this.vel.y += this.acc.y;
            this.pos.x += this.vel.x;
            this.pos.y += this.vel.y;
            
            this.acc.x = 0; 
            this.acc.y = 0;
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(Math.atan2(this.vel.y, this.vel.x));
        
        // Rocket Shape
        ctx.fillStyle = this.completed ? '#4cc9f0' : (this.crashed ? '#e94560' : 'rgba(255, 255, 255, 0.6)');
        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(-10, -5);
        ctx.lineTo(-10, 5);
        ctx.fill();
        
        ctx.restore();
    }
}

class Population {
    constructor() {
        this.rockets = [];
        this.popSize = POPULATION_SIZE;
        this.matingPool = [];

        for (let i = 0; i < this.popSize; i++) {
            this.rockets[i] = new Rocket();
        }
    }

    evaluate() {
        let maxFit = 0;
        // Calc fitness
        for (let i = 0; i < this.popSize; i++) {
            this.rockets[i].calcFitness();
            if (this.rockets[i].fitness > maxFit) {
                maxFit = this.rockets[i].fitness;
            }
        }
        
        // Normalize fitness 0-1
        for (let i = 0; i < this.popSize; i++) {
            this.rockets[i].fitness /= maxFit;
        }

        // Build Mating Pool (Weighted)
        this.matingPool = [];
        for (let i = 0; i < this.popSize; i++) {
            const n = this.rockets[i].fitness * 100; // Multiplier for prob
            for (let j = 0; j < n; j++) {
                this.matingPool.push(this.rockets[i]);
            }
        }
        
        // Update UI stats
        const successes = this.rockets.filter(r => r.completed).length;
        document.getElementById('success-val').innerText = `${successes}/${this.popSize}`;
        document.getElementById('fit-val').innerText = (maxFit * 100000).toFixed(0); // Arbitrary scale
    }

    selection() {
        const newRockets = [];
        for (let i = 0; i < this.rockets.length; i++) {
            // Pick parents
            const parentA = this.matingPool[Math.floor(Math.random() * this.matingPool.length)].dna;
            const parentB = this.matingPool[Math.floor(Math.random() * this.matingPool.length)].dna;
            
            const childDNA = parentA.crossover(parentB);
            childDNA.mutation();
            newRockets[i] = new Rocket(childDNA);
        }
        this.rockets = newRockets;
        generation++;
        document.getElementById('gen-val').innerText = generation;
    }

    run() {
        for (let i = 0; i < this.popSize; i++) {
            this.rockets[i].update();
            this.rockets[i].draw();
        }
    }
}

// --- Helpers ---

function p5VectorRandom2D() {
    const angle = Math.random() * Math.PI * 2;
    // Magnitude limit (0.2)
    const mag = 0.2;
    return { x: Math.cos(angle) * mag, y: Math.sin(angle) * mag };
}

function dist(x1, y1, x2, y2) {
    return Math.sqrt((x1-x2)**2 + (y1-y2)**2);
}

// --- Initialization ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Set Target & Obstacle relative to screen
    target = { x: width/2, y: 50, r: 16 };
    obstacle = { x: width/2 - 100, y: height/2, w: 200, h: 20 };

    population = new Population();
    
    // UI
    document.getElementById('mut-slider').oninput = e => {
        MUTATION_RATE = parseFloat(e.target.value) / 100;
        document.getElementById('mut-disp').innerText = e.target.value + '%';
    };
    document.getElementById('speed-slider').oninput = e => SPEED_MULTIPLIER = parseInt(e.target.value);
    
    document.getElementById('btn-reset').onclick = () => {
        generation = 1;
        population = new Population();
        count = 0;
    };
    document.getElementById('btn-obstacle').onclick = () => {
        obstacle.x = Math.random() * (width - 200);
        obstacle.y = Math.random() * (height - 200) + 100;
    };

    loop();
}

function resizeCanvas() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
    
    // Re-center if mid-game resize
    if (population) {
        target = { x: width/2, y: 50, r: 16 };
    }
}

function loop() {
    // Speed multiplier loop
    for(let n=0; n<SPEED_MULTIPLIER; n++) {
        if (count < LIFESPAN) {
            // Logic only
            population.run(); // Note: population.run calls draw() inside update, which is inefficient for high speed
            // Refactor: split update and draw
            // For now, simpler structure:
            // Since we need to draw the LAST step of the loop, we should clear canvas outside
            count++;
        } else {
            population.evaluate();
            population.selection();
            count = 0;
        }
    }
    
    // Render once per frame
    ctx.clearRect(0, 0, width, height);
    
    // Draw Target
    ctx.fillStyle = '#4cc9f0';
    ctx.beginPath();
    ctx.arc(target.x, target.y, target.r, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.stroke();

    // Draw Obstacle
    ctx.fillStyle = '#e94560';
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.w, obstacle.h);

    // Re-draw rockets (since loop logic might have drawn them multiple times on uncleared canvas)
    // Actually, to support speed up, we should decouple update/draw.
    // Quick fix: Just let the last update call handle drawing or separate render
    // For this simple demo, we redraw all rockets at current pos
    for(let r of population.rockets) r.draw();

    requestAnimationFrame(loop);
}

// Start
init();