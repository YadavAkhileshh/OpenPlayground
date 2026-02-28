import { NeuralNetwork } from '../neural/network.js';
import { Species } from './species.js';
import { Genome } from './genome.js';

/**
 * Manages the collection of creatures and their evolution.
 */
export class Population {
    /**
     * Create a new Population.
     * @param {number} size - Number of creatures
     * @param {Function} createCreatureFunc - Factory function to create a creature given a brain
     */
    constructor(size, createCreatureFunc) {
        this.size = size;
        this.creatures = [];
        this.species = []; // List of active species
        this.generation = 1;

        // Topology config
        this.inputNodes = 0;
        this.hiddenNodes = 0;
        this.outputNodes = 0;

        this.createCreatureFunc = createCreatureFunc;

        // Statistics
        this.stats = {
            best: 0,
            average: 0,
            worst: 0
        };
    }

    /**
     * Initialize the population with random genetics.
     * @param {number} inputNodes 
     * @param {number} hiddenNodes 
     * @param {number} outputNodes 
     */
    init(inputNodes, hiddenNodes, outputNodes) {
        this.inputNodes = inputNodes;
        this.hiddenNodes = hiddenNodes;
        this.outputNodes = outputNodes;

        this.creatures = [];
        for (let i = 0; i < this.size; i++) {
            const net = new NeuralNetwork(inputNodes, hiddenNodes, outputNodes);
            const creature = this.createCreatureFunc(net);
            this.creatures.push(creature);
        }

        // Initial speciation
        this.speciate();
    }

    /**
     * Evolve the population to the next generation.
     * @param {number} mutationRate 
     */
    evolve(mutationRate) {
        this.calculateStats();

        // Calculate species stats (staleness, avg fitness)
        // this.speciate() handles assignment, but we can update logic here if needed.
        // For now, assume species structure is up to date from init/previous gen?
        // No, creatures change fitness every gen, so we might need to re-sort or calc stats.
        // But grouping is genetic, so it stays valid until offspring are made.

        console.log(`Gen ${this.generation} | Best: ${this.stats.best.toFixed(2)} | Species: ${this.species.length}`);

        // Sort by fitness descending (Population level)
        this.creatures.sort((a, b) => b.fitness - a.fitness);

        const newCreatures = [];

        // 1. Elitism: Keep the champions directly
        const elitismCount = 2;
        for (let i = 0; i < elitismCount; i++) {
            if (this.creatures[i]) {
                const eliteBrain = this.creatures[i].brain.copy();
                const elite = this.createCreatureFunc(eliteBrain);
                // Keep color/species info? 
                // Speciate will handle it next time.
                newCreatures.push(elite);
            }
        }

        // 2. Tournament Selection & Crossover
        // (Could use species-based selection here, but sticking to Tournament for robustness)
        while (newCreatures.length < this.size) {
            const parentA = this.tournamentSelection();
            const parentB = this.tournamentSelection();

            // Crossover brains
            const childBrain = this.crossover(parentA.brain, parentB.brain);

            // Mutate
            this.mutateBrain(childBrain, mutationRate);

            newCreatures.push(this.createCreatureFunc(childBrain));
        }

        this.creatures = newCreatures;
        this.generation++;

        // Re-group new population into species
        this.speciate();
    }

    /**
     * Group creatures into species based on genetic similarity.
     */
    speciate() {
        // Clear members from existing species
        for (const s of this.species) {
            s.reset();
        }

        for (const creature of this.creatures) {
            let placed = false;
            for (const s of this.species) {
                if (s.isCompatible(creature.brain)) {
                    s.addMember(creature);
                    placed = true;
                    break;
                }
            }

            if (!placed) {
                // Found no compatible species, create new one
                const newSpecies = new Species(creature);
                newSpecies.addMember(creature);
                this.species.push(newSpecies);
            }
        }

        // Remove empty species
        this.species = this.species.filter(s => s.members.length > 0);

        // Update Stats
        for (const s of this.species) {
            s.calculateAverageFitness();
        }

        // Assign colors to creatures based on species (Visual Feature)
        for (const s of this.species) {
            for (const m of s.members) {
                // m.color = s.color; // Override creature color with species color?
                // Maybe blend them or just use species color to show tracking works.
                m.color = s.color;
            }
        }
    }

    /**
     * Calculate fitness statistics for the current generation.
     */
    calculateStats() {
        let sum = 0;
        let best = -Infinity;
        let worst = Infinity;

        for (const c of this.creatures) {
            sum += c.fitness;
            if (c.fitness > best) best = c.fitness;
            if (c.fitness < worst) worst = c.fitness;
        }

        this.stats.average = sum / this.creatures.length;
        this.stats.best = best;
        this.stats.worst = worst;
    }

    /**
     * Select a creature using Tournament Selection.
     * Returns a fitter individual from a random subset.
     * @returns {Creature}
     */
    tournamentSelection() {
        const k = 4; // Tournament size (tunable)
        let best = null;
        for (let i = 0; i < k; i++) {
            const ind = Math.floor(Math.random() * this.creatures.length);
            const candidate = this.creatures[ind];
            if (best === null || candidate.fitness > best.fitness) {
                best = candidate;
            }
        }
        // Safety fallback
        return best || this.creatures[0];
    }

    /**
     * Perform Uniform Crossover between two neural networks.
     * @param {NeuralNetwork} netA 
     * @param {NeuralNetwork} netB 
     * @returns {NeuralNetwork} New Child Network
     */
    crossover(netA, netB) {
        const genesA = netA.toGenome();
        const genesB = netB.toGenome();
        const childGenes = new Float32Array(genesA.length); // Use TypedArray if possible

        for (let i = 0; i < genesA.length; i++) {
            // 50/50 chance from each parent
            childGenes[i] = Math.random() < 0.5 ? genesA[i] : genesB[i];
        }

        const childNet = new NeuralNetwork(this.inputNodes, this.hiddenNodes, this.outputNodes);
        childNet.fromGenome(childGenes);
        return childNet;
    }

    /**
     * Mutate a neural network in place.
     * @param {NeuralNetwork} net 
     * @param {number} rate 
     */
    mutateBrain(net, rate) {
        const genes = net.toGenome();
        let mutated = false;
        for (let i = 0; i < genes.length; i++) {
            if (Math.random() < rate) {
                // Add jitter
                genes[i] += (Math.random() * 2 - 1) * 0.2;

                // Clamp
                if (genes[i] > 1) genes[i] = 1;
                if (genes[i] < -1) genes[i] = -1;
                mutated = true;
            }
        }
        if (mutated) net.fromGenome(genes);
    }
}
