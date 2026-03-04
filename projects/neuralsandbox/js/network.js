/**
 * Represents a Feedforward Neural Network.
 * The brain of the cars.
 */
class NeuralNetwork {
    /**
     * @param {Array<number>} neuronCounts - Array specifying number of neurons in each layer.
     * e.g. [5, 6, 4] means 5 input neurons, 6 hidden neurons, 4 output neurons.
     */
    constructor(neuronCounts) {
        this.levels = [];
        for (let i = 0; i < neuronCounts.length - 1; i++) {
            this.levels.push(new Level(neuronCounts[i], neuronCounts[i + 1]));
        }
    }

    /**
     * Propagates inputs through the network to produce outputs.
     * @param {Array<number>} givenInputs - Sensor readings
     * @param {NeuralNetwork} network - The network to use
     * @returns {Array<number>} - Binary outputs (1 or 0) for controls
     */
    static feedForward(givenInputs, network) {
        let outputs = Level.feedForward(givenInputs, network.levels[0]);
        for (let i = 1; i < network.levels.length; i++) {
            outputs = Level.feedForward(outputs, network.levels[i]);
        }
        return outputs;
    }

    /**
     * Randomly mutates the weights and biases of the network.
     * This simulates evolutionary mutation.
     * @param {NeuralNetwork} network - The network to mutate
     * @param {number} amount - Mutation strength (0 to 1). Higher = more change.
     */
    static mutate(network, amount = 1) {
        network.levels.forEach(level => {
            for (let i = 0; i < level.biases.length; i++) {
                level.biases[i] = Utils.lerp(
                    level.biases[i],
                    Math.random() * 2 - 1,
                    amount
                )
            }
            for (let i = 0; i < level.weights.length; i++) {
                for (let j = 0; j < level.weights[i].length; j++) {
                    level.weights[i][j] = Utils.lerp(
                        level.weights[i][j],
                        Math.random() * 2 - 1,
                        amount
                    )
                }
            }
        });
    }
}

/**
 * Represents a single layer (level) of the Neural Network.
 * Connects input neurons to output neurons via weights and biases.
 */
class Level {
    /**
     * @param {number} inputCount - Number of input neurons
     * @param {number} outputCount - Number of output neurons
     */
    constructor(inputCount, outputCount) {
        this.inputs = new Array(inputCount);
        this.outputs = new Array(outputCount);
        this.biases = new Array(outputCount);

        this.weights = [];
        for (let i = 0; i < inputCount; i++) {
            this.weights[i] = new Array(outputCount);
        }

        Level.#randomize(this);
    }

    /**
     * Initializes weights and biases with random values between -1 and 1.
     * @param {Level} level 
     */
    static #randomize(level) {
        for (let i = 0; i < level.inputs.length; i++) {
            for (let j = 0; j < level.outputs.length; j++) {
                level.weights[i][j] = Math.random() * 2 - 1;
            }
        }

        for (let i = 0; i < level.biases.length; i++) {
            level.biases[i] = Math.random() * 2 - 1;
        }
    }

    /**
     * Computes the output of this level based on inputs using Hyperplane equation.
     * Output = Activation( Sum(Input * Weight) > Bias )
     * Uses a simple Step Activation Function.
     * 
     * @param {Array<number>} givenInputs 
     * @param {Level} level 
     * @returns {Array<number>} Outputs (0 or 1)
     */
    static feedForward(givenInputs, level) {
        for (let i = 0; i < level.inputs.length; i++) {
            level.inputs[i] = givenInputs[i];
        }

        for (let i = 0; i < level.outputs.length; i++) {
            let sum = 0;
            for (let j = 0; j < level.inputs.length; j++) {
                sum += level.inputs[j] * level.weights[j][i];
            }

            // Step function activation
            if (sum > level.biases[i]) {
                level.outputs[i] = 1;
            } else {
                level.outputs[i] = 0;
            }
        }

        return level.outputs;
    }
}
