/**
 * Handles the visualization of the neural network.
 * Draws neurons, synapses, and biased activations.
 */
class Visualizer {
    /**
     * Draws the entire neural network on the given canvas context.
     * @param {CanvasRenderingContext2D} ctx 
     * @param {NeuralNetwork} network 
     */
    static drawNetwork(ctx, network) {
        const margin = 50;
        const left = margin;
        const top = margin;
        const width = ctx.canvas.width - margin * 2;
        const height = ctx.canvas.height - margin * 2;

        const levelHeight = height / network.levels.length;

        for (let i = network.levels.length - 1; i >= 0; i--) {
            const levelTop = top +
                Utils.lerp(
                    height - levelHeight,
                    0,
                    network.levels.length == 1
                        ? 0.5
                        : i / (network.levels.length - 1)
                );

            ctx.setLineDash([7, 3]);
            Visualizer.drawLevel(ctx, network.levels[i],
                left, levelTop,
                width, levelHeight,
                i == network.levels.length - 1
                    ? ['\u21E7', '\u21E6', '\u21E8', '\u21E9'] // Symbols for Up, Left, Right, Down
                    : []
            );
        }
    }

    /**
     * Draws a single level of the network.
     * @param {CanvasRenderingContext2D} ctx 
     * @param {Level} level 
     * @param {number} left 
     * @param {number} top 
     * @param {number} width 
     * @param {number} height 
     * @param {Array<string>} outputLabels 
     */
    static drawLevel(ctx, level, left, top, width, height, outputLabels) {
        const right = left + width;
        const bottom = top + height;

        const { inputs, outputs, weights, biases } = level;

        // Draw connections
        for (let i = 0; i < inputs.length; i++) {
            for (let j = 0; j < outputs.length; j++) {
                ctx.beginPath();
                ctx.moveTo(
                    Visualizer.#getNodeX(inputs, i, left, right),
                    bottom
                );
                ctx.lineTo(
                    Visualizer.#getNodeX(outputs, j, left, right),
                    top
                );
                ctx.lineWidth = 2;
                ctx.strokeStyle = Utils.getRGBA(weights[i][j]);
                ctx.stroke();
            }
        }

        // Draw inputs
        const nodeRadius = 18;
        for (let i = 0; i < inputs.length; i++) {
            const x = Visualizer.#getNodeX(inputs, i, left, right);
            ctx.beginPath();
            ctx.arc(x, bottom, nodeRadius, 0, Math.PI * 2);
            ctx.fillStyle = "black";
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x, bottom, nodeRadius * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = Utils.getRGBA(inputs[i]);
            ctx.fill();
        }

        // Draw outputs
        for (let i = 0; i < outputs.length; i++) {
            const x = Visualizer.#getNodeX(outputs, i, left, right);
            ctx.beginPath();
            ctx.arc(x, top, nodeRadius, 0, Math.PI * 2);
            ctx.fillStyle = "black";
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x, top, nodeRadius * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = Utils.getRGBA(outputs[i]);
            ctx.fill();

            // Draw Biases (ring around output)
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.arc(x, top, nodeRadius * 0.8, 0, Math.PI * 2);
            ctx.strokeStyle = Utils.getRGBA(biases[i]);
            ctx.setLineDash([3, 3]);
            ctx.stroke();
            ctx.setLineDash([]);

            if (outputLabels[i]) {
                ctx.beginPath();
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle = "white"; // "black"
                ctx.strokeStyle = "black";
                ctx.lineWidth = 0.5;
                ctx.font = (nodeRadius * 1.0) + "px Arial";
                ctx.fillText(outputLabels[i], x, top + nodeRadius * 0.1);
                ctx.strokeText(outputLabels[i], x, top + nodeRadius * 0.1);
            }
        }
    }

    /**
     * Helper to get X position of a node.
     * @param {Array} nodes 
     * @param {number} index 
     * @param {number} left 
     * @param {number} right 
     * @returns {number}
     */
    static #getNodeX(nodes, index, left, right) {
        return Utils.lerp(
            left,
            right,
            nodes.length == 1
                ? 0.5
                : index / (nodes.length - 1)
        );
    }
}
