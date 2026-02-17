/**
 * @file graph.js
 * @description Real-time scrolling line graph for sensor data (Drag/Lift).
 */

export class RealTimeGraph {
    /**
     * @param {HTMLCanvasElement} canvas 
     */
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.data = [];
        this.maxPoints = 200;
        this.minVal = -0.1;
        this.maxVal = 0.1;

        // Auto-scale buffer
        this.autoScale = true;

        // Resize observer? Or just fixed size.
        this.width = canvas.width;
        this.height = canvas.height;
    }

    /**
     * Add a data point.
     * @param {number} val 
     */
    addPoint(val) {
        this.data.push(val);
        if (this.data.length > this.maxPoints) {
            this.data.shift();
        }
    }

    render() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Clear
        ctx.fillStyle = "#161b22"; // Panel BG
        ctx.fillRect(0, 0, w, h);

        if (this.data.length < 2) return;

        // Determine Range
        if (this.autoScale) {
            let min = Infinity;
            let max = -Infinity;
            for (let v of this.data) {
                if (v < min) min = v;
                if (v > max) max = v;
            }
            // Add padding
            const range = max - min;
            if (range < 0.001) {
                this.minVal = min - 0.1;
                this.maxVal = max + 0.1;
            } else {
                this.minVal = min - range * 0.1;
                this.maxVal = max + range * 0.1;
            }
        }

        // Draw Grid
        ctx.strokeStyle = "#30363d";
        ctx.lineWidth = 1;
        ctx.beginPath();
        // Zero line
        const y0 = map(0, this.minVal, this.maxVal, h, 0);
        ctx.moveTo(0, y0);
        ctx.lineTo(w, y0);
        ctx.stroke();

        // Draw Line
        ctx.strokeStyle = "#58a6ff"; // Accent
        ctx.lineWidth = 2;
        ctx.beginPath();

        for (let i = 0; i < this.data.length; i++) {
            const x = (i / (this.maxPoints - 1)) * w;
            const y = map(this.data[i], this.minVal, this.maxVal, h, 0); // Invert Y
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Draw value text
        ctx.fillStyle = "#8b949e";
        ctx.font = "10px monospace";
        ctx.fillText(this.maxVal.toFixed(3), 2, 10);
        ctx.fillText(this.minVal.toFixed(3), 2, h - 2);
    }
}

function map(val, inMin, inMax, outMin, outMax) {
    return (val - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}
