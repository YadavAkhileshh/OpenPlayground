/**
 * Manages the population of cars and handles the evolutionary process.
 * Implements Selection, Crossover, and Mutation.
 */
class GeneticAlgorithm {
    /**
     * @param {number} populationSize - Number of cars per generation
     */
    constructor(populationSize) {
        this.populationSize = populationSize;
        this.cars = [];
        this.bestCar = null;
        this.generation = 1;
    }

    /**
     * Core evolutionary step.
     * If first gen, creates random brains.
     * Otherwise, evolves from the previous generation.
     * @param {Array<Car>|null} oldCars - Scored cars from previous generation
     * @param {Road} road - Road object to spawn cars on
     * @returns {Array<Car>} New generation of cars
     */
    createNextGeneration(oldCars, road) {
        if (!oldCars || oldCars.length === 0) {
            this.cars = this.#generateInitialPopulation(road);
        } else {
            // Calculate fitness
            this.#calculateFitness(oldCars);

            // Sort by fitness
            oldCars.sort((a, b) => b.fitness - a.fitness);
            this.bestCar = oldCars[0]; // Keep track of best for visualization/saving

            const newCars = [];

            // Elitism: Keep the best car unchanged
            // This ensures we never lose the best solution found so far.
            const bestBrain = JSON.parse(JSON.stringify(this.bestCar.brain));
            const champion = new Car(road.getLaneCenter(1), 100, 30, 50, "AI");
            champion.brain = bestBrain;
            newCars.push(champion);

            // Generate rest of population
            for (let i = 1; i < this.populationSize; i++) {
                // Selection (can be Tournament or Roulette, using simple top-heavy random for now)
                const parent1 = this.#selectParent(oldCars);
                const parent2 = this.#selectParent(oldCars);

                const child = new Car(road.getLaneCenter(1), 100, 30, 50, "AI");

                // Crossover
                child.brain = this.#crossover(parent1.brain, parent2.brain);

                // Mutation
                NeuralNetwork.mutate(child.brain, 0.1); // 10% mutation rate

                newCars.push(child);
            }
            this.cars = newCars;
            this.generation++;
        }
        return this.cars;
    }

    /**
     * Creates a totally random start population.
     * @param {Road} road 
     * @returns {Array<Car>}
     */
    #generateInitialPopulation(road) {
        const cars = [];
        for (let i = 0; i < this.populationSize; i++) {
            cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, "AI"));
        }
        return cars;
    }

    /**
     * Calculates fitness score for each car.
     * Fitness = Distance Traveled (negative Y)
     * Penalty applied for damage.
     * @param {Array<Car>} cars 
     */
    #calculateFitness(cars) {
        cars.forEach(car => {
            // Fitness is primarily distance traveled negatively (y coordinates decrease as we go up)
            // We use -car.y because in canvas up is negative. 
            // We can also reward speed or punish damage.
            // Simple fitness: Distance
            car.fitness = -car.y;
            if (car.damaged) {
                car.fitness *= 0.9; // Penalty for crashing
            }
        });
    }

    /**
     * Selects a parent using Tournament Selection.
     * Picks K random individuals and returns the best one.
     * @param {Array<Car>} cars 
     * @returns {Car} The selected parent
     */
    #selectParent(cars) {
        // Simple Tournament Selection
        const tournamentSize = 5;
        let best = null;
        for (let i = 0; i < tournamentSize; i++) {
            const ind = Math.floor(Math.random() * cars.length);
            const candidate = cars[ind];
            if (best === null || candidate.fitness > best.fitness) {
                best = candidate;
            }
        }
        return best;
    }

    /**
     * Mixes two brains to create a child brain.
     * Uniform Crossover: Each weight has 50% chance coming from either parent.
     * @param {NeuralNetwork} brain1 
     * @param {NeuralNetwork} brain2 
     * @returns {NeuralNetwork}
     */
    #crossover(brain1, brain2) {
        // Create a new brain structure based on brain1
        const childBrain = new NeuralNetwork(brain1.levels.map(l => l.inputs.length).concat([brain1.levels[brain1.levels.length - 1].outputs.length]));

        // Copy structure is already done by new NeuralNetwork constructor essentially (it creates random weights)
        // We need to overwrite weights with mixed values from parents

        for (let i = 0; i < brain1.levels.length; i++) {
            const level1 = brain1.levels[i];
            const level2 = brain2.levels[i];
            const childLevel = childBrain.levels[i];

            for (let j = 0; j < level1.biases.length; j++) {
                // 50% chance from either parent
                if (Math.random() > 0.5) {
                    childLevel.biases[j] = level1.biases[j];
                } else {
                    childLevel.biases[j] = level2.biases[j];
                }
            }

            for (let j = 0; j < level1.weights.length; j++) {
                for (let k = 0; k < level1.weights[j].length; k++) {
                    if (Math.random() > 0.5) {
                        childLevel.weights[j][k] = level1.weights[j][k];
                    } else {
                        childLevel.weights[j][k] = level2.weights[j][k];
                    }
                }
            }
        }
        return childBrain;
    }
}
