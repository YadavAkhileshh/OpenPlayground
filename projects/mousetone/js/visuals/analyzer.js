/**
 * File: js/visuals/analyzer.js
 * MouseTone Module
 * Copyright (c) 2026
 * 
 * Real-time spectrum analyzer visualizer.
 * Draws a frequency bar graph overlay on the canvas.
 */
export class SpectrumAnalyzer {
    /**
     * @param {CanvasRenderingContext2D} ctx - The canvas context to draw on.
     * @param {AudioContext} audioCtx - The audio context.
     * @param {AudioNode} sourceNode - The audio node to analyze (usually Master Out).
     */
    constructor(ctx, audioCtx, sourceNode) {
        this.ctx = ctx; // Canvas 2D context
        this.audioCtx = audioCtx;

        // Create AnalyserNode
        this.analyser = audioCtx.createAnalyser();
        this.analyser.fftSize = 256; // Trade-off between resolution and performance

        // Connect source to analyzer (non-destructive)
        sourceNode.connect(this.analyser);

        this.bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);

        this.width = ctx.canvas.width;
        this.height = ctx.canvas.height;
        this.isEnabled = true; // Enabled by default? No, let's toggle it.
    }

    /**
     * Renders the frequency bars to the canvas.
     * Should be called in the main animation loop.
     */
    render() {
        if (!this.isEnabled) return;

        // Get frequency data
        this.analyser.getByteFrequencyData(this.dataArray);

        const barWidth = (this.width / this.bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        // Draw overlay at bottom of screen
        const bottomOffset = 0;

        for (let i = 0; i < this.bufferLength; i++) {
            barHeight = this.dataArray[i] / 2; // Scale down to fit nicely

            // Color based on frequency index (HSL rainbow)
            // Shifted by 200 to start in blue/purple range
            this.ctx.fillStyle = `hsl(${i * 2 + 200}, 100%, 50%, 0.5)`;

            // Draw bar
            this.ctx.fillRect(x, this.height - barHeight - bottomOffset, barWidth, barHeight);

            x += barWidth + 1; // 1px gap
        }
    }

    /**
     * Toggles the visibility of the visualizer.
     */
    toggle() {
        this.isEnabled = !this.isEnabled;
    }
}
