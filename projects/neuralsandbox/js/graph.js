/**
 * Simple graph renderer for visualizing data over time.
 * Used for fitness history on the dashboard.
 */
class Graph {
    /**
     * @param {string} canvasId - HTML ID of the canvas element
     */
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            return;
        }
        this.ctx = this.canvas.getContext("2d");
        this.data = [];
        this.maxDataPoints = 50;
    }

    /**
     * Adds a new data point to the graph.
     * Shifts old data if limit reached.
     * @param {number} value 
     */
    addData(value) {
        this.data.push(value);
        if (this.data.length > this.maxDataPoints) {
            this.data.shift();
        }
    }

    /**
     * Renders the graph.
     */
    draw() {
        if (!this.ctx) return;

        const w = this.canvas.width;
        const h = this.canvas.height;

        this.ctx.clearRect(0, 0, w, h);

        // Draw background grid
        this.ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        for (let i = 0; i < w; i += 20) {
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, h);
        }
        for (let i = 0; i < h; i += 20) {
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(w, i);
        }
        this.ctx.stroke();

        if (this.data.length < 2) return;

        const maxVal = Math.max(...this.data, 100); // Scale based on max, min 100
        const minVal = 0;

        this.ctx.beginPath();
        this.ctx.strokeStyle = "#58a6ff";
        this.ctx.lineWidth = 2;

        for (let i = 0; i < this.data.length; i++) {
            const x = (i / (this.maxDataPoints - 1)) * w;
            const y = h - ((this.data[i] - minVal) / (maxVal - minVal)) * h;

            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.stroke();

        // Fill area
        this.ctx.lineTo(w, h);
        this.ctx.lineTo(0, h);
        this.ctx.fillStyle = "rgba(88, 166, 255, 0.2)";
        this.ctx.fill();

        // Draw Text
        this.ctx.fillStyle = "white";
        this.ctx.font = "10px Arial";
        this.ctx.fillText("Fitness History", 5, 12);
        this.ctx.fillText(Math.floor(maxVal), w - 25, 12);
    }
}
