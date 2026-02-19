/**
 * Handles extra visual feedback like the fitness graph.
 * Dynamically creates a canvas overlay in the stats panel.
 */
export class Visualizer {
    /**
     * Creates a new Visualizer.
     * Initializes the fitness history graph canvas.
     */
    constructor() {
        this.fitnessHistory = [];
        this.maxHistory = 100;

        // Append a graph canvas to the stats panel
        this.container = document.querySelector('.stats-panel');
        this.canvas = document.createElement('canvas');
        this.canvas.width = 300;
        this.canvas.height = 60;

        // Style injection
        this.canvas.style.gridColumn = "span 4";
        this.canvas.style.width = "100%";
        this.canvas.style.height = "60px";
        this.canvas.style.background = "var(--color-bg-secondary)";
        this.canvas.style.border = "1px solid var(--color-border)";
        this.canvas.style.borderRadius = "4px";

        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
    }

    /**
     * Adds a fitness point to the history and redraws the graph.
     * @param {number} fitness - Current fitness score.
     */
    pushFitness(fitness) {
        this.fitnessHistory.push(fitness);
        if (this.fitnessHistory.length > this.maxHistory) {
            this.fitnessHistory.shift();
        }
        this.drawGraph();
    }

    /**
     * Resets the visualizer state.
     */
    reset() {
        this.fitnessHistory = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Draws the fitness history graph.
     * Auto-scales to the min/max values in history.
     */
    drawGraph() {
        const w = this.canvas.width;
        const h = this.canvas.height;

        this.ctx.clearRect(0, 0, w, h);

        if (this.fitnessHistory.length < 2) return;

        // Auto-scale range
        let min = Math.min(...this.fitnessHistory);
        let max = Math.max(...this.fitnessHistory);

        // Prevent division by zero if flatline
        if (min === max) {
            min -= 1;
            max += 1;
        }

        const range = max - min;

        this.ctx.beginPath();
        this.ctx.strokeStyle = '#58a6ff'; // Accent color
        this.ctx.lineWidth = 2;

        for (let i = 0; i < this.fitnessHistory.length; i++) {
            const val = this.fitnessHistory[i];
            const x = (i / (this.maxHistory - 1)) * w;

            // Render lower error (better fitness) as LOWER on the graph?
            // "Fitness" here is actually "Error". Usually we want graphs to go UP for good things.
            // But strict error graphs usually go down.
            // Let's implement it such that the line goes DOWN as error decreases.
            // So 0 error is at y = h. Max error is at y = 0.

            // Normalize to 0-1 (0 = min error in history, 1 = max error in history)
            // But we want to see the trend relative to recent history.

            const normalized = (val - min) / range;
            // y = h - (normalized * h) -> maps min error to bottom, max error to top.
            // This means if error drops, line drops.

            const padding = 5;
            const drawHeight = h - (padding * 2);
            const y = h - padding - (normalized * drawHeight);

            if (i === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
        }

        this.ctx.stroke();
    }
}
