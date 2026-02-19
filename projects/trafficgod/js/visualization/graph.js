/**
 * @file graph.js
 * @description Real-time scrolling graph for simulation statistics.
 */

import { CONFIG } from '../utils/constants.js';

export class Graph {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');

        // Data buffer
        this.maxPoints = 200;
        this.data = [];

        this.resize();
    }

    resize() {
        this.width = this.canvas.parentElement.clientWidth;
        this.height = this.canvas.parentElement.clientHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    addValue(val) {
        this.data.push(val);
        if (this.data.length > this.maxPoints) {
            this.data.shift();
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        if (this.data.length < 2) return;

        // Draw grid lines
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.height / 2);
        this.ctx.lineTo(this.width, this.height / 2);
        this.ctx.stroke();

        // Draw graph
        this.ctx.beginPath();
        this.ctx.strokeStyle = CONFIG.COLOR_FAST;
        this.ctx.lineWidth = 2;

        const xStep = this.width / (this.maxPoints - 1);

        // Find min/max for auto-scaling or fixed scale?
        // Let's use fixed scale 0 to 60 (max speed)
        const minVal = 0;
        const maxVal = 60;

        for (let i = 0; i < this.data.length; i++) {
            const val = this.data[i];
            const x = i * xStep;
            // Invert y (0 at bottom)
            const y = this.height - ((val - minVal) / (maxVal - minVal)) * this.height;

            if (i === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
        }

        this.ctx.stroke();

        // Draw fill
        this.ctx.lineTo(this.data.length * xStep, this.height);
        this.ctx.lineTo(0, this.height);
        this.ctx.closePath();
        this.ctx.fillStyle = 'rgba(0, 255, 170, 0.1)';
        this.ctx.fill();
    }
}
