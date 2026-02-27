/**
 * A Feedforward Neural Network implementation.
 * Uses a single hidden layer and Tanh activation.
 */
export class NeuralNetwork {
    /**
     * Create a new Neural Network.
     * @param {number} inputNodes 
     * @param {number} hiddenNodes 
     * @param {number} outputNodes 
     */
    constructor(inputNodes, hiddenNodes, outputNodes) {
        this.inputNodes = inputNodes;
        this.hiddenNodes = hiddenNodes;
        this.outputNodes = outputNodes;

        // Weights
        this.weightsIH = new Float32Array(inputNodes * hiddenNodes); // Input -> Hidden
        this.weightsHO = new Float32Array(hiddenNodes * outputNodes); // Hidden -> Output

        // Biases
        this.biasH = new Float32Array(hiddenNodes);
        this.biasO = new Float32Array(outputNodes);

        this.randomize();
    }

    /**
     * Randomize all weights and biases.
     */
    randomize() {
        for (let i = 0; i < this.weightsIH.length; i++) this.weightsIH[i] = Math.random() * 2 - 1;
        for (let i = 0; i < this.weightsHO.length; i++) this.weightsHO[i] = Math.random() * 2 - 1;
        for (let i = 0; i < this.biasH.length; i++) this.biasH[i] = Math.random() * 2 - 1;
        for (let i = 0; i < this.biasO.length; i++) this.biasO[i] = Math.random() * 2 - 1;
    }

    /**
     * Feed inputs through the network to get outputs.
     * @param {Array<number>} inputArray 
     * @returns {Float32Array} Output values
     */
    predict(inputArray) {
        if (inputArray.length !== this.inputNodes) {
            console.error("Incorrect input size");
            return null;
        }

        // Hidden Layer
        let hidden = new Float32Array(this.hiddenNodes);
        for (let j = 0; j < this.hiddenNodes; j++) {
            let sum = this.biasH[j];
            for (let i = 0; i < this.inputNodes; i++) {
                sum += inputArray[i] * this.weightsIH[i * this.hiddenNodes + j];
            }
            hidden[j] = Math.tanh(sum);
        }

        // Output Layer
        let output = new Float32Array(this.outputNodes);
        for (let k = 0; k < this.outputNodes; k++) {
            let sum = this.biasO[k];
            for (let j = 0; j < this.hiddenNodes; j++) {
                sum += hidden[j] * this.weightsHO[j * this.outputNodes + k];
            }
            output[k] = Math.tanh(sum); // Tanh gives -1 to 1, good for muscles
        }

        return output;
    }

    /**
     * Export weights/biases as a flat array (Genome).
     */
    toGenome() {
        const genome = [];
        // Helper to push array
        const pushArray = (arr) => {
            for (let i = 0; i < arr.length; i++) genome.push(arr[i]);
        };

        pushArray(this.weightsIH);
        pushArray(this.weightsHO);
        pushArray(this.biasH);
        pushArray(this.biasO);

        return genome;
    }

    /**
     * Import genome from a flat array.
     * @param {Array<number>} genome 
     */
    fromGenome(genome) {
        let idx = 0;
        const readArray = (arr) => {
            for (let i = 0; i < arr.length; i++) {
                arr[i] = genome[idx++];
            }
        };

        readArray(this.weightsIH);
        readArray(this.weightsHO);
        readArray(this.biasH);
        readArray(this.biasO);
    }

    /**
     * Create a deep copy of this neural network.
     * @returns {NeuralNetwork}
     */
    copy() {
        const copy = new NeuralNetwork(this.inputNodes, this.hiddenNodes, this.outputNodes);
        // Deep copy arrays
        copy.weightsIH.set(this.weightsIH);
        copy.weightsHO.set(this.weightsHO);
        copy.biasH.set(this.biasH);
        copy.biasO.set(this.biasO);
        return copy;
    }
}
