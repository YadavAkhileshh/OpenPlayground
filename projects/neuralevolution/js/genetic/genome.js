import { NeuralNetwork } from '../neural/network.js';

/**
 * Wrapper for Neural Network that handles genetic operations.
 * Represents a single individual's genetic code.
 */
export class Genome {
    /**
     * Create a new Genome.
     * @param {NeuralNetwork} network 
     */
    constructor(network) {
        this.network = network;
        this.fitness = 0;
        this.genes = network.toGenome(); // Cache genes if needed, or just use network
    }

    /**
     * Mutate the genome's genes.
     * @param {number} rate - Mutation probability per gene
     */
    mutate(rate) {
        const genes = this.network.toGenome();
        let mutated = false;

        for (let i = 0; i < genes.length; i++) {
            if (Math.random() < rate) {
                // Add Gaussian noise
                const noise = (Math.random() * 2 - 1) * 0.5; // shift by up to +/- 0.5
                genes[i] += noise;

                // Clamp to legal range
                if (genes[i] > 1) genes[i] = 1;
                if (genes[i] < -1) genes[i] = -1;

                mutated = true;
            }
        }

        if (mutated) {
            this.network.fromGenome(genes);
        }
    }

    /**
     * Create a copy of this genome.
     */
    copy() {
        const netCopy = this.network.copy();
        const genomeCopy = new Genome(netCopy);
        genomeCopy.fitness = this.fitness;
        return genomeCopy;
    }
}
