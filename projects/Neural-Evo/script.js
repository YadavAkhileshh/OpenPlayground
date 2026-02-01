/**
 * Neural-Evo Engine
 * A Genetic Algorithm implementation for autonomous agents.
 */

const canvas = document.getElementById('evo-canvas');
const ctx = canvas.getContext('2d');

// --- Config ---
const GOAL_RADIUS = 15;
const DOT_RADIUS = 4;
const MAX_STEPS = 800; // Lifespan
const MUTATION_RATE = 0.01;

// --- State ---
let width, height;
let population;
let goal;
let obstacles = []; // Array of {x, y, w, h}
let generation = 1;
let speedMultiplier = 1;

let isDrawing = false;
let drawStart = { x: 0, y: 0 };

// --- Vector Class ---
class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    add(v) { this.x += v.x; this.y += v.y; }
    static dist(v1, v2) { return Math.sqrt((v1.x-v2.x)**2 + (v1.y-v2.y)**2); }
    static random() {
        const angle = Math.random() * 2 * Math.PI;
        return new Vector(Math.cos(angle), Math.sin(angle));
    }
    clone() { return new Vector(this.x, this.y); }
}

// --- DNA Class (Genes) ---
class DNA {
    constructor(genes) {
        if (genes) {
            this.genes = genes;
        } else {
            this.genes = new Array(MAX_STEPS);
            for (let i = 0; i < MAX_STEPS; i++) {
                this.genes[i] = Vector.random();
            }
        }
    }

    crossover(partner) {
        const newGenes = [];
        const mid = Math.floor(Math.random() * this.genes.length);
        for (let i = 0; i < this.genes.length; i++) {
            if (i > mid) newGenes[i] = this.genes[i];
            else newGenes[i] = partner.genes[i];
        }
        return new DNA(newGenes);
    }

    mutation() {
        for (let i = 0; i < this.genes.length; i++) {
            if (Math.random() < MUTATION_RATE) {
                this.genes[i] = Vector.random();
            }
        }
    }
}

// --- Dot Agent ---
class Dot {
    constructor(dna) {
        this.pos = new Vector(width / 2, height - 50);
        this.vel = new Vector(0, 0);
        this.acc = new Vector(0, 0);
        this.dna = dna || new DNA();
        
        this.fitness = 0;
        this.dead = false;
        this.reachedGoal = false;
        this.stepIndex = 0;
        this.isBest = false;
    }

    update() {
        if (this.dead || this.reachedGoal) return;

        // Move based on genes
        if (this.stepIndex < this.dna.genes.length) {
            this.acc = this.dna.genes[this.stepIndex];
            this.stepIndex++;
        } else {
            this.dead = true;
        }

        // Physics
        this.vel.add(this.acc);
        this.vel.x = Math.min(Math.max(this.vel.x, -5), 5); // Limit speed
        this.vel.y = Math.min(Math.max(this.vel.y, -5), 5);
        this.pos.add(this.vel);

        // Collision: Walls
        if (this.pos.x < 2 || this.pos.y < 2 || this.pos.x > width - 2 || this.pos.y > height - 2) {
            this.dead = true;
        }

        // Collision: Obstacles
        for (let obs of obstacles) {
            if (this.pos.x > obs.x && this.pos.x < obs.x + obs.w &&
                this.pos.y > obs.y && this.pos.y < obs.y + obs.h) {
                this.dead = true;
            }
        }

        // Check Goal
        const d = Vector.dist(this.pos, goal);
        if (d < GOAL_RADIUS) {
            this.reachedGoal = true;
        }
    }

    calculateFitness() {
        const d = Vector.dist(this.pos, goal);
        
        // Base fitness is inverse of distance
        this.fitness = 1.0 / (d * d);

        if (this.dead) {
            this.fitness *= 0.1; // Penalty for dying
        }
        if (this.reachedGoal) {
            this.fitness *= 10.0; // Huge reward
            // Reward for speed (fewer steps)
            this.fitness *= 1.0 + (100.0 / (this.stepIndex * 0.5)); 
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, DOT_RADIUS, 0, Math.PI * 2);
        
        if (this.isBest) {
            ctx.fillStyle = '#38bdf8';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#38bdf8';
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        } else {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.fill();
        }
    }
}

// --- Population Manager ---
class Population {
    constructor(size) {
        this.dots = [];
        this.size = size;
        this.matingPool = [];
        this.minStep = MAX_STEPS;
        
        for (let i = 0; i < size; i++) {
            this.dots.push(new Dot());
        }
    }

    update() {
        for (let dot of this.dots) {
            dot.update();
        }
    }

    allDead() {
        for (let dot of this.dots) {
            if (!dot.dead && !dot.reachedGoal) return false;
        }
        return true;
    }

    calculateFitness() {
        for (let dot of this.dots) {
            dot.calculateFitness();
        }
    }

    naturalSelection() {
        this.matingPool = [];
        
        // Find max fitness to normalize
        let maxFit = 0;
        let bestIndex = 0;
        
        for (let i = 0; i < this.dots.length; i++) {
            if (this.dots[i].fitness > maxFit) {
                maxFit = this.dots[i].fitness;
                bestIndex = i;
            }
        }

        // Update Stats UI
        if (this.dots[bestIndex].reachedGoal) {
            this.minStep = Math.min(this.minStep, this.dots[bestIndex].stepIndex);
            document.getElementById('stat-best').innerText = this.minStep;
        }
        
        // Preserve Champion (Elitism)
        const champion = this.dots[bestIndex].dna;

        // Create Mating Pool (Wheel of Fortune)
        for (let dot of this.dots) {
            const fitnessNormal = dot.fitness / maxFit;
            const n = Math.floor(fitnessNormal * 100); 
            for (let j = 0; j < n; j++) {
                this.matingPool.push(dot);
            }
        }
        
        return champion;
    }

    generate(championDNA) {
        const newDots = [];
        
        // Elitism: Champion lives on
        const champ = new Dot(championDNA);
        champ.isBest = true;
        newDots.push(champ);

        for (let i = 1; i < this.size; i++) {
            const indexA = Math.floor(Math.random() * this.matingPool.length);
            const indexB = Math.floor(Math.random() * this.matingPool.length);
            const partnerA = this.matingPool[indexA];
            const partnerB = this.matingPool[indexB];
            
            const childDNA = partnerA.dna.crossover(partnerB.dna);
            childDNA.mutation();
            newDots.push(new Dot(childDNA));
        }
        this.dots = newDots;
        generation++;
        document.getElementById('stat-gen').innerText = generation;
    }
}

// --- Main Loop ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupEvents();
    
    goal = new Vector(width / 2, 50);
    population = new Population(200);
    
    animate();
}

function resizeCanvas() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
    if(goal) goal.x = width/2; // Re-center goal
}

function setupEvents() {
    // Mouse Interaction for Walls
    canvas.addEventListener('mousedown', e => {
        isDrawing = true;
        drawStart = { x: e.offsetX, y: e.offsetY };
    });
    
    canvas.addEventListener('mousemove', e => {
        if (!isDrawing) return;
        // Visual feedback handled in draw loop
    });

    canvas.addEventListener('mouseup', e => {
        if (!isDrawing) return;
        isDrawing = false;
        const w = e.offsetX - drawStart.x;
        const h = e.offsetY - drawStart.y;
        if (Math.abs(w) > 5 && Math.abs(h) > 5) {
            // Normalize Rect
            obstacles.push({
                x: w < 0 ? e.offsetX : drawStart.x,
                y: h < 0 ? e.offsetY : drawStart.y,
                w: Math.abs(w),
                h: Math.abs(h)
            });
        }
    });

    // Controls
    document.getElementById('speed-slider').addEventListener('input', e => {
        speedMultiplier = parseInt(e.target.value);
    });

    document.getElementById('pop-slider').addEventListener('input', e => {
        document.getElementById('pop-val').innerText = e.target.value;
    });

    document.getElementById('btn-reset').addEventListener('click', () => {
        obstacles = [];
    });

    document.getElementById('btn-restart').addEventListener('click', () => {
        const size = parseInt(document.getElementById('pop-slider').value);
        population = new Population(size);
        generation = 1;
        document.getElementById('stat-gen').innerText = 1;
        document.getElementById('stat-best').innerText = '--';
    });
}

function animate() {
    // Logic Loop (Speed Control)
    for (let n = 0; n < speedMultiplier; n++) {
        if (population.allDead()) {
            population.calculateFitness();
            const champion = population.naturalSelection();
            population.generate(champion);
        } else {
            population.update();
        }
    }

    // Render Loop
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Draw Goal 
    ctx.beginPath();
    ctx.arc(goal.x, goal.y, GOAL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#4ade80';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#4ade80';
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw Obstacles
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#94a3b8';
    for (let obs of obstacles) {
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
        ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
    }

    // Draw Drawing Preview
    if (isDrawing) {
        // We need current mouse pos, simplified here for briefness
        // Real implementation would track mousemove globally or within canvas
    }

    // Draw Dots
    for (let dot of population.dots) {
        if (!dot.dead) dot.draw();
    }
    
    // Update Alive Stat
    const aliveCount = population.dots.filter(d => !d.dead && !d.reachedGoal).length;
    document.getElementById('stat-alive').innerText = aliveCount;

    requestAnimationFrame(animate);
}

// Start
init();