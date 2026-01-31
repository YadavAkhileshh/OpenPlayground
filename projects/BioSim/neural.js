/**
 * BIOSIM NEURAL NETWORK
 * A simple Multi-Layer Perceptron (MLP) designed for Neuroevolution.
 * Features genetic operators: Crossover (Breeding) and Mutation.
 * @author saiusesgithub
 */

class ActivationFunction {
    static sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }

    static tanh(x) {
        return Math.tanh(x);
    }
    
    static relu(x) {
        return Math.max(0, x);
    }
}

class NeuralNetwork {
    /**
     * @param {number|NeuralNetwork} input_nodes - Number of inputs OR parent Network to copy
     * @param {number} hidden_nodes 
     * @param {number} output_nodes 
     */
    constructor(input_nodes, hidden_nodes, output_nodes) {
        if (input_nodes instanceof NeuralNetwork) {
            const a = input_nodes;
            this.input_nodes = a.input_nodes;
            this.hidden_nodes = a.hidden_nodes;
            this.output_nodes = a.output_nodes;

            this.weights_ih = a.weights_ih.copy();
            this.weights_ho = a.weights_ho.copy();
            this.bias_h = a.bias_h.copy();
            this.bias_o = a.bias_o.copy();
        } else {
            this.input_nodes = input_nodes;
            this.hidden_nodes = hidden_nodes;
            this.output_nodes = output_nodes;

            // Weights between Input and Hidden
            this.weights_ih = new Matrix(this.hidden_nodes, this.input_nodes);
            this.weights_ih.randomize();

            // Weights between Hidden and Output
            this.weights_ho = new Matrix(this.output_nodes, this.hidden_nodes);
            this.weights_ho.randomize();

            // Biases for Hidden and Output
            this.bias_h = new Matrix(this.hidden_nodes, 1);
            this.bias_h.randomize();

            this.bias_o = new Matrix(this.output_nodes, 1);
            this.bias_o.randomize();
        }
        
        this.learning_rate = 0.1;
    }

    /**
     * Predict output based on input array
     * @param {Array} input_array 
     * @returns {Array} Output values
     */
    predict(input_array) {
        // 1. Prepare Input
        let inputs = Matrix.fromArray(input_array);

        // 2. Hidden Layer
        let hidden = Matrix.multiply(this.weights_ih, inputs);
        hidden.add(this.bias_h);
        // Activation: Tanh allows -1 to 1 range (useful for steering)
        hidden.map(ActivationFunction.tanh);

        // 3. Output Layer
        let output = Matrix.multiply(this.weights_ho, hidden);
        output.add(this.bias_o);
        // Activation: Sigmoid for outputs 0-1 (e.g., speed), Tanh for -1 to 1 (steering)
        // Here we use Tanh for versatility
        output.map(ActivationFunction.tanh);

        return output.toArray();
    }

    /**
     * GENETIC OPERATOR: MUTATION
     * Randomly adjusts weights based on rate.
     * @param {number} rate - Probability (0.0 - 1.0)
     */
    mutate(rate) {
        const mutationFn = (val) => {
            if (Math.random() < rate) {
                // Add random gaussian noise OR fully replace
                // Here we add noise for "Gradient-like" evolution
                return val + (Math.random() * 0.5 - 0.25); 
            }
            return val;
        };

        this.weights_ih.map(mutationFn);
        this.weights_ho.map(mutationFn);
        this.bias_h.map(mutationFn);
        this.bias_o.map(mutationFn);
    }

    /**
     * GENETIC OPERATOR: CROSSOVER
     * Mixes this network's DNA with a partner's.
     * @param {NeuralNetwork} partner 
     */
    crossover(partner) {
        const child = new NeuralNetwork(this.input_nodes, this.hidden_nodes, this.output_nodes);

        // Helper to mix two matrices
        const mix = (m1, m2) => {
            let result = new Matrix(m1.rows, m1.cols);
            // Random split point
            const split = Math.floor(Math.random() * (m1.rows * m1.cols));
            
            let count = 0;
            for (let i = 0; i < m1.rows; i++) {
                for (let j = 0; j < m1.cols; j++) {
                    if (count < split) {
                        result.data[i][j] = m1.data[i][j];
                    } else {
                        result.data[i][j] = m2.data[i][j];
                    }
                    count++;
                }
            }
            return result;
        };

        child.weights_ih = mix(this.weights_ih, partner.weights_ih);
        child.weights_ho = mix(this.weights_ho, partner.weights_ho);
        child.bias_h = mix(this.bias_h, partner.bias_h);
        child.bias_o = mix(this.bias_o, partner.bias_o);

        return child;
    }

    copy() {
        return new NeuralNetwork(this);
    }

    /**
     * Serialize to JSON for saving best brains
     */
    serialize() {
        return JSON.stringify(this);
    }

    static deserialize(data) {
        if (typeof data == 'string') {
            data = JSON.parse(data);
        }
        const nn = new NeuralNetwork(data.input_nodes, data.hidden_nodes, data.output_nodes);
        nn.weights_ih = Matrix.deserialize(data.weights_ih);
        nn.weights_ho = Matrix.deserialize(data.weights_ho);
        nn.bias_h = Matrix.deserialize(data.bias_h);
        nn.bias_o = Matrix.deserialize(data.bias_o);
        return nn;
    }
}