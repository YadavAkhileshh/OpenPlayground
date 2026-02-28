import { PhysicsWorld } from './physics/engine.js';
import { Population } from './genetic/population.js';
import { Creature } from './simulation/creature.js';
import { Renderer } from './render/renderer.js';
import { UIManager } from './ui/ui_manager.js';

class Simulation {
    constructor() {
        // Initialize Core Systems
        this.renderer = new Renderer('sim-canvas');
        this.physics = new PhysicsWorld();

        // Simulation Parameters
        this.simSpeed = 1;
        this.mutationRate = 0.05;
        this.generationDuration = 600; // Frames (10 seconds at 60fps)
        this.timer = 0;
        this.isWarping = false;
        this.fitnessHistory = [];
        this.audioCtx = null;

        // Initialize Population
        this.population = new Population(50, (neuralNet) => {
            return new Creature(0, 400, neuralNet);
        });
        this.population.init(13, 8, 7); // 13 inputs: 6 sensors + 7 muscle lengths

        // Initialize UI Manager
        this.ui = new UIManager(this);
        // Hook up graph canvas context for legacy graph drawing (moved to UI manager later?)
        // For now, keep graph drawing in main loop but use UI canvas
        this.graphCanvas = document.getElementById('graph-canvas');
        this.graphCtx = this.graphCanvas.getContext('2d');

        // Interaction Limits
        this.draggedParticle = null;
        this.initInteraction();

        // Start Loop
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);
    }

    // External Control Methods (Called by UI)
    reset() {
        this.population.init(13, 8, 7);
        this.timer = 0;
        this.resetPhysics();
        this.fitnessHistory = [];
        this.ui.updateStats();
    }

    toggleWarp() {
        this.isWarping = !this.isWarping;
        if (this.isWarping) {
            this.simSpeed = 100;
            this.ui.elements.valSpeed.innerText = "WARP";
        } else {
            this.simSpeed = parseInt(this.ui.elements.speed.value);
            this.ui.elements.valSpeed.innerText = this.simSpeed + 'x';
        }
    }

    resetPhysics() {
        this.physics.clear();
        for (const c of this.population.creatures) {
            for (const p of c.particles) this.physics.addParticle(p);
            for (const cons of c.constraints) this.physics.addConstraint(cons);
        }
    }

    initInteraction() {
        const canvas = this.renderer.canvas;
        canvas.addEventListener('mousedown', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left + this.renderer.cameraX;
            const y = e.clientY - rect.top;

            let closest = null;
            let minDist = 50;
            for (const p of this.physics.particles) {
                const d = p.pos.dist({ x: x, y: y });
                if (d < minDist) {
                    minDist = d;
                    closest = p;
                }
            }
            if (closest) {
                this.draggedParticle = closest;
                this.draggedParticle.fixed = true;
            }
        });

        canvas.addEventListener('mousemove', (e) => {
            if (this.draggedParticle) {
                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left + this.renderer.cameraX;
                const y = e.clientY - rect.top;
                this.draggedParticle.pos.x = x;
                this.draggedParticle.pos.y = y;
                this.draggedParticle.oldPos.x = x;
                this.draggedParticle.oldPos.y = y;
            }
        });

        window.addEventListener('mouseup', () => {
            if (this.draggedParticle) {
                this.draggedParticle.fixed = false;
                this.draggedParticle = null;
            }
        });
    }

    loop() {
        try {
            // Physics update
            for (let s = 0; s < this.simSpeed; s++) {
                if (this.timer === 0) this.resetPhysics();

                for (const c of this.population.creatures) {
                    if (c.alive) {
                        c.think(this.timer);
                        c.updateFitness();
                    }
                }

                this.physics.update(0.016);
                this.timer++;

                if (this.timer >= this.generationDuration) {
                    this.nextGeneration();
                }
            }

            // Render
            this.renderer.clear();

            // Follow best
            let best = this.population.creatures[0];
            for (const c of this.population.creatures) if (c.fitness > best.fitness) best = c;
            this.renderer.setCamera(best.particles[1].pos.x);

            this.renderer.drawWorld(this.physics.getGroundHeight.bind(this.physics));
            this.renderer.drawCreatures(this.population.creatures);

            // UI Updates
            this.ui.updateStats();

            // Draw Graph
            // Ensure we use the correct context
            if (this.graphCtx) {
                this.graphCtx.clearRect(0, 0, 300, 100);
                this.drawFitnessGraph();
            }

            // Draw Brain Overlay (top-right corner)
            this.renderer.ctx.save();
            this.renderer.ctx.setTransform(1, 0, 0, 1, 0, 0);
            if (best && best.brain) {
                const bx = this.renderer.width - 270;
                const by = 10;
                const bw = 255;
                const bh = 200;
                this.renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
                this.renderer.ctx.fillRect(bx - 5, by - 5, bw + 10, bh + 10);
                this.renderer.ctx.strokeStyle = 'rgba(0, 255, 204, 0.3)';
                this.renderer.ctx.lineWidth = 1;
                this.renderer.ctx.strokeRect(bx - 5, by - 5, bw + 10, bh + 10);
                this.renderer.drawBrain(best.brain, this.renderer.ctx, bx, by + 15, bw, bh - 15);
            }
            this.renderer.ctx.restore();

            requestAnimationFrame(this.loop);
        } catch (e) {
            console.error(e);
            alert("Simulation Loop Error: " + e.message);
        }
    }

    drawFitnessGraph() {
        if (!this.fitnessHistory || this.fitnessHistory.length < 2) return;
        const ctx = this.graphCtx;
        const w = 300;
        const h = 100;

        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(0, 0, w, h);

        const maxFit = Math.max(...this.fitnessHistory, 10);

        ctx.beginPath();
        ctx.strokeStyle = '#00ffcc';
        ctx.lineWidth = 2;
        for (let i = 0; i < this.fitnessHistory.length; i++) {
            const x = (i / (this.fitnessHistory.length - 1)) * w;
            const y = h - (this.fitnessHistory[i] / maxFit) * (h - 10) - 5;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    nextGeneration() {
        this.playGenSound();

        let best = 0;
        for (const c of this.population.creatures) if (c.fitness > best) best = c.fitness;
        this.fitnessHistory.push(best);
        if (this.fitnessHistory.length > 50) this.fitnessHistory.shift();

        this.population.evolve(this.mutationRate);
        this.timer = 0;
    }

    playGenSound() {
        // Simple Audio Context check
        if (!window.AudioContext && !window.webkitAudioContext) return;

        if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.frequency.setValueAtTime(440 + this.population.generation * 20, this.audioCtx.currentTime);
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.5);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.5);
    }

    cloneBest() {
        let best = this.population.creatures[0];
        for (const c of this.population.creatures) if (c.fitness > best.fitness) best = c;
        const bestGenome = best.brain.toGenome();
        for (const c of this.population.creatures) {
            c.brain.fromGenome(bestGenome);
            c.brain.mutate(0.01);
            c.fitness = 0;
            c.alive = true;
        }
        this.nextGeneration();
    }

    saveBest() {
        let best = this.population.creatures[0];
        for (const c of this.population.creatures) if (c.fitness > best.fitness) best = c;
        const json = JSON.stringify(best.brain.toGenome());
        localStorage.setItem('best_creature', json);
        alert("Best creature saved!");
    }

    loadBest() {
        const json = localStorage.getItem('best_creature');
        if (!json) { alert("No saved creature found."); return; }
        const genome = JSON.parse(json);
        for (const c of this.population.creatures) c.brain.fromGenome(genome);
        this.timer = 0;
        this.resetPhysics();
        alert("Creature loaded!");
    }
}

window.onload = () => {
    try {
        new Simulation();
    } catch (e) {
        alert("Startup Error: " + e.message);
        console.error(e);
    }
};
