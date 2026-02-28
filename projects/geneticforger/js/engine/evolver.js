import { Genome } from './genome.js';
import { Renderer } from './engine/renderer.js';
import { FitnessCalculator } from './fitness.js';
import { CONFIG } from './types.js';

/**
 * Manages the evolutionary process (Hill Climbing algorithm).
 * Orchestrates the cycle of Mutation -> Assessment -> Selection.
 */
export class Evolver {
    /**
     * Creates a new Evolver instance.
     * @param {HTMLCanvasElement} targetCanvas - Canvas containing the target image.
     */
    constructor(targetCanvas) {
        // Internal canvas for testing mutations without flickering the main screen
        // This 'work' canvas is where we render the candidates to calculate their fitness.
        this.workCanvas = document.createElement('canvas');
        this.workCanvas.width = CONFIG.CANVAS_SIZE;
        this.workCanvas.height = CONFIG.CANVAS_SIZE;
        this.workCtx = this.workCanvas.getContext('2d', { alpha: false }); // Optimization: alpha false

        // Helper classes
        this.renderer = new Renderer(this.workCtx, CONFIG.CANVAS_SIZE, CONFIG.CANVAS_SIZE);
        this.fitnessCalculator = new FitnessCalculator();

        this.targetCtx = targetCanvas.getContext('2d');

        // State
        this.bestGenome = new Genome();
        this.bestFitness = Infinity;
        this.generation = 0;
        this.isRunning = false;

        // Current mutation configuration
        this.mutationRates = {
            mutationChance: CONFIG.MUTATION.RATE,
            vertexShift: CONFIG.MUTATION.VERTEX_SHIFT,
            colorShift: CONFIG.MUTATION.COLOR_SHIFT,
            opacityShift: CONFIG.MUTATION.OPACITY_SHIFT
        };
    }

    /**
     * Initializes the evolver with the current state of the target canvas.
     * This must be called whenever the target image changes.
     */
    initTarget() {
        // Draw the visual target canvas into our working scale internal canvas to get data
        // This handles cases where visual canvas is css-sized different or we want downsampling.
        this.workCtx.drawImage(this.targetCtx.canvas, 0, 0, CONFIG.CANVAS_SIZE, CONFIG.CANVAS_SIZE);
        const targetData = this.workCtx.getImageData(0, 0, CONFIG.CANVAS_SIZE, CONFIG.CANVAS_SIZE);
        this.fitnessCalculator.setTarget(targetData);

        // Reset state
        this.bestGenome = new Genome();
        this.generation = 0;

        // Calculate initial fitness of the random start
        this.renderer.render(this.bestGenome);
        const currentData = this.workCtx.getImageData(0, 0, CONFIG.CANVAS_SIZE, CONFIG.CANVAS_SIZE);
        this.bestFitness = this.fitnessCalculator.calculateFitness(currentData);
    }

    /**
     * Performs one evolutionary step (Hill Climbing).
     * 1. Clone current best.
     * 2. Mutate clone.
     * 3. Calculate fitness.
     * 4. If better, replace best.
     * 
     * @returns {boolean} True if improvement found, False otherwise.
     */
    step() {
        this.generation++;

        // 1. Mutate
        const mutant = this.bestGenome.clone();
        mutant.mutate(this.mutationRates);

        // 2. Render Mutant to offscreen canvas
        this.renderer.render(mutant);

        // 3. Check Fitness
        const mutantData = this.workCtx.getImageData(0, 0, CONFIG.CANVAS_SIZE, CONFIG.CANVAS_SIZE);
        const mutantFitness = this.fitnessCalculator.calculateFitness(mutantData);

        // 4. Select
        // Determines if the mutation was beneficial (lower fitness is better)
        if (mutantFitness < this.bestFitness) {
            this.bestGenome = mutant;
            this.bestFitness = mutantFitness;
            return true; // Improvement
        } else {
            return false; // No improvement, discard mutant
        }
    }

    /**
     * Returns the current best genome.
     * @returns {Genome} The best genome found so far.
     */
    getBestGenome() {
        return this.bestGenome;
    }
}
