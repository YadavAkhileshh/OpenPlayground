/**
 * BIOSIM GENETIC ENGINE
 * Handles the evolutionary cycle: Selection, Reproduction, and Replacement.
 * Implements Roulette Wheel Selection for parent choices.
 * @author saiusesgithub
 */

class GeneticEngine {
    constructor(mutationRate = 0.05) {
        this.mutationRate = mutationRate;
        this.generation = 1;
        this.bestFitness = 0;
        this.avgFitness = 0;
    }

    /**
     * Evolve the population to the next generation
     * @param {Array<Creature>} oldPopulation 
     * @param {Object} worldConfig - Start positions etc
     * @returns {Array<Creature>} New Generation
     */
    nextGeneration(oldPopulation, worldConfig) {
        this.calculateMetrics(oldPopulation);
        
        const newPopulation = [];
        
        // 1. ELITISM: Keep the absolute best creature unchanged
        // This guarantees we never lose the best solution found so far
        const bestCreature = oldPopulation.reduce((prev, current) => 
            (prev.fitness > current.fitness) ? prev : current
        );
        
        const elite = new Creature(
            Math.random() * worldConfig.width, 
            Math.random() * worldConfig.height, 
            bestCreature.brain
        );
        elite.color = '#ffd700'; // Gold color for the champion
        elite.isElite = true;
        newPopulation.push(elite);

        // 2. REPRODUCTION LOOP
        // Fill the rest of the population
        while (newPopulation.length < oldPopulation.length) {
            // A. Selection
            const parentA = this.pickOne(oldPopulation);
            const parentB = this.pickOne(oldPopulation);

            // B. Crossover
            const childBrain = parentA.brain.crossover(parentB.brain);

            // C. Mutation
            childBrain.mutate(this.mutationRate);

            // D. Creation
            const child = new Creature(
                Math.random() * worldConfig.width, 
                Math.random() * worldConfig.height,
                childBrain
            );
            newPopulation.push(child);
        }

        this.generation++;
        return newPopulation;
    }

    /**
     * ROULETTE WHEEL SELECTION
     * Probability of selection is proportional to fitness.
     */
    pickOne(population) {
        let index = 0;
        let r = Math.random();

        // If total fitness is 0, pick random
        // Normalize probabilities handled here implicitly by accumulating normalized fitness
        // But simpler approach: Subtract from r until 0
        
        while (r > 0 && index < population.length) {
            r -= population[index].prob;
            index++;
        }
        index--;
        if (index < 0) index = 0;
        return population[index];
    }

    /**
     * Pre-calculate fitness metrics and normalize values for selection
     */
    calculateMetrics(population) {
        let maxFit = 0;
        let totalFit = 0;

        // Find max
        for (let c of population) {
            // Fitness function: Age + (Energy gained)
            // Ensure fitness is at least 0.01 to avoid div by zero
            c.fitness = Math.max(0.1, c.fitness + (c.age * 0.1)); 
            
            if (c.fitness > maxFit) maxFit = c.fitness;
            totalFit += c.fitness;
        }

        this.bestFitness = maxFit;
        this.avgFitness = totalFit / population.length;

        // Normalize fitness (0 to 1) for probability
        for (let c of population) {
            c.prob = c.fitness / totalFit;
        }
    }

    getStats() {
        return {
            generation: this.generation,
            bestFitness: this.bestFitness.toFixed(2),
            avgFitness: this.avgFitness.toFixed(2)
        };
    }
}