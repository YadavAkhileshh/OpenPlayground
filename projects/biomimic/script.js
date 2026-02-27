const canvas = document.getElementById("worldCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 1000;
canvas.height = 600;

let agents = [];
let running = false;
let generation = 0;

class Agent {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = Math.random() * 2 - 1;
        this.vy = Math.random() * 2 - 1;

        this.speedFactor = Math.random() * 2;
        this.perception = 50 + Math.random() * 50;
        this.fitness = 0;
    }

    update() {
        const neighbors = agents.filter(a =>
            a !== this &&
            distance(this, a) < this.perception
        );

        let alignX = 0, alignY = 0;
        let cohesionX = 0, cohesionY = 0;
        let separationX = 0, separationY = 0;

        neighbors.forEach(n => {
            alignX += n.vx;
            alignY += n.vy;

            cohesionX += n.x;
            cohesionY += n.y;

            separationX += this.x - n.x;
            separationY += this.y - n.y;
        });

        if (neighbors.length > 0) {
            alignX /= neighbors.length;
            alignY /= neighbors.length;

            cohesionX = (cohesionX / neighbors.length) - this.x;
            cohesionY = (cohesionY / neighbors.length) - this.y;

            separationX /= neighbors.length;
            separationY /= neighbors.length;
        }

        this.vx += alignX * 0.01 + cohesionX * 0.0005 + separationX * 0.02;
        this.vy += alignY * 0.01 + cohesionY * 0.0005 + separationY * 0.02;

        const mag = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
        this.vx = (this.vx / mag) * this.speedFactor;
        this.vy = (this.vy / mag) * this.speedFactor;

        this.x += this.vx;
        this.y += this.vy;

        wrap(this);

        this.fitness += 0.01;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 4, 0, 2*Math.PI);
        ctx.fillStyle = "#6c5ce7";
        ctx.fill();
    }
}

function spawnPopulation(size = 100) {
    agents = [];
    for (let i = 0; i < size; i++) {
        agents.push(new Agent());
    }
    generation = 1;
    updateStats();
}

function toggleSimulation() {
    running = !running;
    if (running) loop();
}

function loop() {
    if (!running) return;

    ctx.clearRect(0,0,canvas.width,canvas.height);

    agents.forEach(a => {
        a.update();
        a.draw();
    });

    updateStats();
    requestAnimationFrame(loop);
}

function evolve() {
    agents.sort((a,b)=>b.fitness-a.fitness);

    const survivors = agents.slice(0, agents.length/2);

    const newGen = [];

    survivors.forEach(parent => {
        const child = new Agent();
        child.speedFactor = parent.speedFactor + (Math.random()-0.5)*0.2;
        child.perception = parent.perception + (Math.random()-0.5)*5;
        newGen.push(child);
    });

    agents = survivors.concat(newGen);
    generation++;
    updateStats();
}

function updateStats() {
    document.getElementById("generation").innerText = generation;
    document.getElementById("population").innerText = agents.length;

    const avg = agents.reduce((sum,a)=>sum+a.fitness,0)/agents.length || 0;
    document.getElementById("fitness").innerText = avg.toFixed(2);
}

function distance(a,b){
    return Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2);
}

function wrap(a){
    if(a.x<0) a.x=canvas.width;
    if(a.x>canvas.width) a.x=0;
    if(a.y<0) a.y=canvas.height;
    if(a.y>canvas.height) a.y=0;
}