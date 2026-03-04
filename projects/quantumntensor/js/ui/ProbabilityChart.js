/**
 * js/ui/ProbabilityChart.js
 * Visualizes the 2^N length probability array as an interactive bar chart.
 */

class ProbabilityChart {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = window.CanvasUtils.setupHighDPI(this.canvas);

        this.probabilities = [];
        this.labels = []; // e.g. "00", "01"
        this.numQubits = 2;

        // Settings
        this.barColor = '#00ddff';
        this.maxBarHeight = 200;
        this.paddingBottom = 40;

        // Resizing
        window.addEventListener('resize', this.handleResize.bind(this));
        // Need to wait 1 frame for CSS to settle
        setTimeout(() => this.handleResize(), 100);
    }

    handleResize() {
        this.ctx = window.CanvasUtils.setupHighDPI(this.canvas);
        this.render();
    }

    /**
     * Pushes new state data into the chart.
     * @param {number[]} probs 
     * @param {number} numQubits 
     */
    updateData(probs, numQubits) {
        this.probabilities = probs;
        this.numQubits = numQubits;

        let numStates = Math.pow(2, numQubits);
        this.labels = [];
        for (let i = 0; i < numStates; i++) {
            this.labels.push(`|${window.MathUtils.toBinaryString(i, numQubits)}⟩`);
        }

        this.render();
    }

    render() {
        let w = this.canvas.clientWidth;
        let h = this.canvas.clientHeight;

        this.ctx.clearRect(0, 0, w, h);

        let len = this.probabilities.length;
        if (len === 0) return;

        let availableWidth = w - 20; // Padding
        let barWidth = availableWidth / len - window.MathConstants.CHART_BAR_GAP;
        if (barWidth < 2) barWidth = 2; // Min width

        let startX = 10;
        let groundY = h - this.paddingBottom;

        // Draw ground line
        window.CanvasUtils.drawLine(this.ctx, 0, groundY, w, groundY, '#334455', 1);

        for (let i = 0; i < len; i++) {
            let p = this.probabilities[i];
            let barH = p * this.maxBarHeight;
            let x = startX + i * (barWidth + window.MathConstants.CHART_BAR_GAP) + (barWidth / 2);

            if (p > window.MathConstants.TOLERANCE) {
                // Draw Bar
                this.ctx.fillStyle = this.barColor;
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = this.barColor;

                // Animate logic isn't here, it's external, so just draw instantaneous
                this.ctx.fillRect(x - barWidth / 2, groundY - barH, barWidth, barH);
                this.ctx.shadowBlur = 0; // reset

                // Draw Prob Text (if enough space)
                if (barWidth > 20) {
                    let pText = (p * 100).toFixed(1) + '%';
                    window.CanvasUtils.drawText(this.ctx, pText, x, groundY - barH - 10, '#ffffff', '10px monospace');
                }
            }

            // Draw Label
            if (barWidth > 15 || len <= 16 || i % 2 === 0) { // Culling labels if too dense
                this.ctx.save();
                this.ctx.translate(x, groundY + 8);
                this.ctx.rotate(Math.PI / 4);
                window.CanvasUtils.drawText(this.ctx, this.labels[i], 0, 0, '#99aabb', '10px monospace', 'left');
                this.ctx.restore();
            }
        }
    }
}

window.ProbabilityChart = ProbabilityChart;
