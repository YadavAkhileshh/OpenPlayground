import { Genome } from '../genetic/genome.js';

/**
 * Represents a distinct evolutionary branch in the population.
 * Species are grouped by genetic similarity.
 */
export class Species {
    constructor(mascot) {
        this.mascot = mascot; // The representative genome
        this.members = [];
        this.averageFitness = 0;
        this.staleness = 0; // Generations without improvement
        this.bestFitness = 0;

        // Color for visualization
        this.color = this.generateColor();
    }

    /**
     * Add a member to this species.
     * @param {Creature} creature 
     */
    addMember(creature) {
        this.members.push(creature);
        creature.species = this;
    }

    /**
     * Clear members for next generation.
     */
    reset() {
        this.members = [];
    }

    /**
     * Calculate average fitness of this species.
     */
    calculateAverageFitness() {
        if (this.members.length === 0) {
            this.averageFitness = 0;
            return;
        }

        let sum = 0;
        for (const m of this.members) {
            sum += m.fitness;
        }
        this.averageFitness = sum / this.members.length;

        // Update staleness
        if (this.averageFitness > this.bestFitness) {
            this.bestFitness = this.averageFitness;
            this.staleness = 0;
        } else {
            this.staleness++;
        }
    }

    /**
     * Cull the weak members of the species.
     * @param {number} percentage - Percentage to keep (0.5 = top 50%)
     */
    cull(percentage = 0.5) {
        if (this.members.length <= 1) return;

        // Sort by fitness descending
        this.members.sort((a, b) => b.fitness - a.fitness);

        // Keep top N
        const keep = Math.ceil(this.members.length * percentage);
        this.members = this.members.slice(0, keep);
    }

    /**
     * Produce a child from this species.
     * @param {Function} mutationRate 
     */
    reproduce(mutationRate) {
        // Select parent(s)
        // If only 1 member, clone it
        if (this.members.length === 1) {
            const childBrain = this.members[0].brain.copy();
            childBrain.mutate(mutationRate);
            return childBrain;
        }

        // Tournament or random selection within species
        const p1 = this.selectMember();
        const p2 = this.selectMember();

        // Crossover
        const childBrain = this.crossover(p1.brain, p2.brain);
        childBrain.mutate(mutationRate);
        return childBrain;
    }

    selectMember() {
        // Simple random linear probability or just random
        // Since we culled, random is okay
        const r = Math.floor(Math.random() * this.members.length);
        return this.members[r];
    }

    crossover(brainA, brainB) {
        // Use existing network crossover logic (need to expose it or reimplement)
        // We'll reimplement simple uniform crossover here for now
        const genesA = brainA.toGenome();
        const genesB = brainB.toGenome();
        const childGenes = new Float32Array(genesA.length);

        for (let i = 0; i < genesA.length; i++) {
            childGenes[i] = Math.random() < 0.5 ? genesA[i] : genesB[i];
        }

        const child = brainA.copy(); // To get structure
        child.fromGenome(childGenes);
        return child;
    }

    generateColor() {
        // Random pastel color
        const h = Math.floor(Math.random() * 360);
        return `hsl(${h}, 80%, 60%)`;
    }

    /**
     * Check if a genome is compatible with this species.
     * @param {NeuralNetwork} brain 
     * @param {number} threshold 
     */
    isCompatible(brain, threshold = 3.0) {
        // Calculate genetic distance
        const g1 = this.mascot.brain.toGenome();
        const g2 = brain.toGenome();

        let diff = 0;
        for (let i = 0; i < g1.length; i++) {
            diff += Math.abs(g1[i] - g2[i]);
        }

        // Normalize by gene count?
        // simple euclidean-ish distance
        return diff < threshold; // Threshold needs tuning
    }
}
