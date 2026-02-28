/**
 * BIOSIM UI CONTROLLER
 * Manages DOM interactions, real-time charts, and simulation controls.
 * @author saiusesgithub
 */

class LineGraph {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.data = {
            maxFit: [],
            avgFit: []
        };
        this.maxDataPoints = 100;
        this.resize();
    }

    resize() {
        this.width = this.canvas.width = this.canvas.parentElement.clientWidth;
        this.height = this.canvas.height = this.canvas.parentElement.clientHeight;
    }

    push(stats) {
        this.data.maxFit.push(parseFloat(stats.bestFitness));
        this.data.avgFit.push(parseFloat(stats.avgFitness));

        if (this.data.maxFit.length > this.maxDataPoints) {
            this.data.maxFit.shift();
            this.data.avgFit.shift();
        }
        this.draw();
    }

    draw() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;
        const pad = 20;

        // Clear
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, w, h);

        // Find Scale
        const maxVal = Math.max(...this.data.maxFit, 10); // Min scale 10
        const yScale = (h - pad * 2) / maxVal;
        const xScale = (w - pad * 2) / (this.maxDataPoints - 1);

        // Grid
        ctx.strokeStyle = '#333';
        ctx.beginPath();
        ctx.moveTo(pad, pad); ctx.lineTo(pad, h - pad);
        ctx.lineTo(w - pad, h - pad);
        ctx.stroke();

        // Helper to draw line
        const drawPath = (arr, color) => {
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let i = 0; i < arr.length; i++) {
                const x = pad + i * xScale;
                const y = (h - pad) - (arr[i] * yScale);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        };

        drawPath(this.data.avgFit, '#2196f3'); // Blue for Avg
        drawPath(this.data.maxFit, '#4caf50'); // Green for Best
    }
}

class UIController {
    constructor() {
        this.sim = new Simulation();
        this.graph = new LineGraph('graph-canvas');
        
        this.dom = {
            popSize: document.getElementById('param-pop-size'),
            mutation: document.getElementById('param-mutation'),
            food: document.getElementById('param-food'),
            speed: document.getElementById('param-speed'),
            
            valPop: document.getElementById('val-pop-size'),
            valMut: document.getElementById('val-mutation'),
            valFood: document.getElementById('val-food'),
            valSpeed: document.getElementById('val-speed'),
            
            statGen: document.getElementById('stat-gen'),
            statAlive: document.getElementById('stat-alive'),
            statFitness: document.getElementById('stat-fitness'),
            statEnergy: document.getElementById('stat-energy'),
            
            btnPlay: document.getElementById('btn-playpause'),
            btnStep: document.getElementById('btn-step'),
            btnReset: document.getElementById('btn-reset'),
            
            console: document.getElementById('sim-logs')
        };

        this.initListeners();
        this.startStatLoop();
    }

    initListeners() {
        // Sliders
        this.dom.popSize.oninput = (e) => {
            const val = parseInt(e.target.value);
            this.dom.valPop.innerText = val;
            this.sim.config.popSize = val;
        };

        this.dom.mutation.oninput = (e) => {
            const val = parseFloat(e.target.value);
            this.dom.valMut.innerText = Math.round(val * 100) + '%';
            this.sim.config.mutationRate = val;
            this.sim.genetics.mutationRate = val;
        };

        this.dom.food.oninput = (e) => {
            const val = parseInt(e.target.value);
            this.dom.valFood.innerText = val;
            this.sim.config.foodCount = val;
        };

        this.dom.speed.oninput = (e) => {
            const val = parseInt(e.target.value);
            this.dom.valSpeed.innerText = val + 'x';
            this.sim.config.stepsPerFrame = val;
        };

        // Buttons
        this.dom.btnPlay.onclick = () => {
            this.sim.running = !this.sim.running;
            this.dom.btnPlay.innerHTML = this.sim.running ? '<i class="ri-pause-fill"></i>' : '<i class="ri-play-fill"></i>';
            if(this.sim.running) this.sim.loop();
        };

        this.dom.btnReset.onclick = () => {
            this.sim.genetics.generation = 1;
            this.sim.initPopulation();
            this.sim.initFood();
            this.log("Simulation Reset.");
            this.graph.data.maxFit = [];
            this.graph.data.avgFit = [];
            this.graph.draw();
        };

        // Canvas Click (Selection)
        this.sim.canvas.onclick = (e) => {
            const rect = this.sim.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const creature = this.sim.handleClick(x, y);
            
            if (creature) {
                document.getElementById('hover-info').style.display = 'block';
                document.getElementById('info-id').innerText = creature.id;
                document.getElementById('brain-status-text').innerText = "Scanning Subject " + creature.id + "...";
            } else {
                document.getElementById('hover-info').style.display = 'none';
                document.getElementById('brain-status-text').innerText = "Select a creature";
            }
        };

        window.addEventListener('resize', () => this.graph.resize());
    }

    startStatLoop() {
        setInterval(() => {
            if (!this.sim.running) return;

            // Live Stats
            const alive = this.sim.population.filter(c => c.alive).length;
            const avgEnergy = this.sim.population.reduce((a, b) => a + (b.alive ? b.energy : 0), 0) / (alive || 1);
            
            this.dom.statAlive.innerText = alive;
            this.dom.statEnergy.innerText = Math.floor(avgEnergy);
            this.dom.statGen.innerText = this.sim.genetics.generation;
            this.dom.statFitness.innerText = this.sim.genetics.bestFitness.toFixed(1);

            // Update Brain Bars
            if (this.sim.selectedCreature && this.sim.selectedCreature.alive) {
                // Mock visualizer for outputs
                // Ideally we grab last output from creature.think()
                // But for now we just animate slightly to show "Activity"
                document.getElementById('bar-thrust').style.width = Math.random() * 100 + '%';
                document.getElementById('bar-turn').style.width = Math.random() * 100 + '%';
            }

        }, 100);
    }

    updateStats(stats) {
        this.log(`Generation ${stats.generation} Complete. Best: ${stats.bestFitness}`);
        this.graph.push(stats);
    }

    log(msg) {
        const div = document.createElement('div');
        div.className = 'log';
        div.innerText = `> ${msg}`;
        this.dom.console.prepend(div);
        if(this.dom.console.children.length > 20) this.dom.console.lastChild.remove();
    }
}

// Boot
window.onload = () => {
    window.uiApp = new UIController();
};