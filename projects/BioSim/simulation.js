/**
 * BIOSIM MAIN CONTROLLER
 * Orchestrates the game loop, physics integration, and rendering.
 * Manages the "Epoch" cycle of generations.
 * @author saiusesgithub
 */

class Simulation {
    constructor() {
        this.canvas = document.getElementById('world-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.brainCanvas = document.getElementById('brain-canvas');
        this.brainCtx = this.brainCanvas.getContext('2d');
        
        // Configuration
        this.width = this.canvas.width = this.canvas.parentElement.clientWidth;
        this.height = this.canvas.height = this.canvas.parentElement.clientHeight;
        
        this.config = {
            popSize: 50,
            foodCount: 80,
            mutationRate: 0.05,
            stepsPerFrame: 1
        };

        // Systems
        this.physics = new SpatialHash({ width: this.width, height: this.height }, 50); // 50px buckets
        this.genetics = new GeneticEngine(this.config.mutationRate);
        
        // Entities
        this.population = [];
        this.food = [];
        
        // State
        this.running = false;
        this.selectedCreature = null;
        this.epochTimer = 0;
        this.maxEpochTime = 2000; // Frames per generation
        
        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        this.initPopulation();
        this.initFood();
        
        // Start Loop
        this.running = true;
        this.loop();
    }

    resize() {
        this.width = this.canvas.width = this.canvas.parentElement.clientWidth;
        this.height = this.canvas.height = this.canvas.parentElement.clientHeight;
        
        // Update physics bounds
        this.physics.bounds = { width: this.width, height: this.height };
        this.physics.clear();
    }

    initPopulation(newPop = null) {
        this.population = [];
        this.physics.clear();

        if (newPop) {
            this.population = newPop;
            // Place them randomly but keep brains
            this.population.forEach(c => {
                c.pos = new Vec2(Math.random() * this.width, Math.random() * this.height);
                c.energy = 100;
                c.age = 0;
                c.alive = true;
                this.physics.insert(c);
            });
        } else {
            // Fresh Start
            for (let i = 0; i < this.config.popSize; i++) {
                const c = new Creature(
                    Math.random() * this.width, 
                    Math.random() * this.height
                );
                this.population.push(c);
                this.physics.insert(c);
            }
        }
    }

    initFood() {
        this.food = [];
        for (let i = 0; i < this.config.foodCount; i++) {
            this.food.push(new Food(
                Math.random() * this.width, 
                Math.random() * this.height
            ));
        }
    }

    update() {
        // Replenish food occasionally
        if (Math.random() < 0.05 && this.food.length < this.config.foodCount) {
             this.food.push(new Food(
                Math.random() * this.width, 
                Math.random() * this.height
            ));
        }

        let aliveCount = 0;

        for (let creature of this.population) {
            if (!creature.alive) continue;

            aliveCount++;

            // 1. Get Local Environment (Spatial Hash)
            // Instead of checking all food, query the grid
            // Note: Food isn't in the spatial hash in this simplified version for performance logic 
            // (since food is static, we could, but brute force O(M) is okay for food if N is small)
            // But strict "Expert" implementation would hash food too. 
            // We pass ALL food for now as sensor range is large.
            
            creature.think(this.food, { width: this.width, height: this.height });
            creature.update({ width: this.width, height: this.height });
            
            // Update Physics Grid
            this.physics.updateClient(creature);

            // 2. Eat Food
            // Optimized: Only check food collision if distance is small
            // Here we iterate backwards to allow splicing
            for (let i = this.food.length - 1; i >= 0; i--) {
                const f = this.food[i];
                if (!f.active) continue;
                
                const d = creature.pos.dist(f.pos);
                if (d < creature.r + f.r) {
                    creature.eat(f);
                    this.food.splice(i, 1); // Remove eaten food
                }
            }
        }

        // Epoch Control
        this.epochTimer++;
        if (aliveCount === 0 || this.epochTimer > this.maxEpochTime) {
            this.startNextGeneration();
        }
    }

    startNextGeneration() {
        this.epochTimer = 0;
        
        // 1. Evolution
        const newPop = this.genetics.nextGeneration(this.population, { width: this.width, height: this.height });
        
        // 2. Reset
        this.initPopulation(newPop);
        this.initFood();
        
        // 3. Notify UI
        const stats = this.genetics.getStats();
        if (window.uiApp) window.uiApp.updateStats(stats);
    }

    draw() {
        // Clear
        this.ctx.fillStyle = '#1e1e1e';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Debug Grid (Optional)
        // this.physics.debugRender(this.ctx);

        // Draw Food
        for (let f of this.food) {
            f.draw(this.ctx);
        }

        // Draw Creatures
        for (let c of this.population) {
            const isSelected = this.selectedCreature === c;
            c.draw(this.ctx, isSelected);
        }

        // Render Brain of selected
        if (this.selectedCreature && this.selectedCreature.alive) {
            this.drawBrain(this.selectedCreature.brain);
        } else if (this.selectedCreature && !this.selectedCreature.alive) {
            this.brainCtx.clearRect(0,0,300,200);
            this.brainCtx.fillStyle = '#666';
            this.brainCtx.fillText("Subject Deceased", 100, 100);
        }
    }

    drawBrain(brain) {
        const ctx = this.brainCtx;
        const w = this.brainCanvas.width;
        const h = this.brainCanvas.height;
        ctx.clearRect(0, 0, w, h);

        const nodeRadius = 6;
        const layerGap = w / 3;
        
        // Helper to get Y position
        const getY = (i, total) => (h / (total + 1)) * (i + 1);

        // Draw Connections First
        // IH Weights
        for (let i = 0; i < brain.input_nodes; i++) {
            for (let j = 0; j < brain.hidden_nodes; j++) {
                const weight = brain.weights_ih.data[j][i];
                ctx.strokeStyle = weight > 0 ? 'rgba(0, 255, 0, ' + Math.abs(weight) + ')' : 'rgba(255, 0, 0, ' + Math.abs(weight) + ')';
                ctx.beginPath();
                ctx.moveTo(30, getY(i, brain.input_nodes));
                ctx.lineTo(30 + layerGap, getY(j, brain.hidden_nodes));
                ctx.stroke();
            }
        }
        // HO Weights
        for (let i = 0; i < brain.hidden_nodes; i++) {
            for (let j = 0; j < brain.output_nodes; j++) {
                const weight = brain.weights_ho.data[j][i];
                ctx.strokeStyle = weight > 0 ? 'rgba(0, 255, 0, ' + Math.abs(weight) + ')' : 'rgba(255, 0, 0, ' + Math.abs(weight) + ')';
                ctx.beginPath();
                ctx.moveTo(30 + layerGap, getY(i, brain.hidden_nodes));
                ctx.lineTo(30 + layerGap * 2, getY(j, brain.output_nodes));
                ctx.stroke();
            }
        }

        // Draw Nodes
        ctx.fillStyle = '#fff';
        // Input
        for(let i=0; i<brain.input_nodes; i++) {
            ctx.beginPath(); ctx.arc(30, getY(i, brain.input_nodes), nodeRadius, 0, Math.PI*2); ctx.fill();
        }
        // Hidden
        for(let i=0; i<brain.hidden_nodes; i++) {
            ctx.beginPath(); ctx.arc(30 + layerGap, getY(i, brain.hidden_nodes), nodeRadius, 0, Math.PI*2); ctx.fill();
        }
        // Output
        for(let i=0; i<brain.output_nodes; i++) {
            ctx.beginPath(); ctx.arc(30 + layerGap * 2, getY(i, brain.output_nodes), nodeRadius, 0, Math.PI*2); ctx.fill();
        }
    }

    loop() {
        if (!this.running) return;

        // "Time Scale" - Run logic multiple times per frame
        for (let i = 0; i < this.config.stepsPerFrame; i++) {
            this.update();
        }
        
        this.draw();
        
        requestAnimationFrame(() => this.loop());
    }

    // Interaction
    handleClick(x, y) {
        // Find clicked creature
        // Simple search
        let found = null;
        for(let c of this.population) {
            if(c.pos.dist({x,y}) < 20) {
                found = c;
                break;
            }
        }
        this.selectedCreature = found;
        return found;
    }
}

// Export global for UI
window.Simulation = Simulation;