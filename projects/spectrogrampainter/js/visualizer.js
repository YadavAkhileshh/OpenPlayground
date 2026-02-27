/**
 * Handles Audio Visualization (Oscilloscope / Spectrum)
 * Feature: CRT/Glitch effect overlay
 */
export class Visualizer {
    constructor(canvasId, audioEngine) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.engine = audioEngine;
        this.isPlaying = false;
        this.animationId = null;

        // Resize observer to handle flex layout
        const resizeObserver = new ResizeObserver(() => {
            this.resize();
        });
        resizeObserver.observe(this.canvas.parentElement);

        this.resize();

        // CRT Aesthetics
        this.phosphorColor = '#00f3ff';
        this.gridColor = 'rgba(0, 243, 255, 0.1)';
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    start() {
        this.isPlaying = true;
        this.draw();
    }

    stop() {
        this.isPlaying = false;
        if (this.animationId) cancelAnimationFrame(this.animationId);
        // Clear logic if needed, but keeping the last frame is cool
        this.clear();
        this.drawGrid();
    }

    clear() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawGrid() {
        // Draw retro grid
        this.ctx.strokeStyle = this.gridColor;
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();

        const w = this.canvas.width;
        const h = this.canvas.height;

        // Vertical lines
        for (let x = 0; x < w; x += 40) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, h);
        }
        // Horizontal lines
        for (let y = 0; y < h; y += 40) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(w, y);
        }
        this.ctx.stroke();
    }

    draw() {
        if (!this.isPlaying) return;

        this.animationId = requestAnimationFrame(() => this.draw());

        if (!this.engine.analyser) return;

        const bufferLength = this.engine.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.engine.analyser.getByteTimeDomainData(dataArray);

        // Fade effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawGrid();

        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = this.phosphorColor;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = this.phosphorColor;

        this.ctx.beginPath();

        const sliceWidth = this.canvas.width * 1.0 / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = v * this.canvas.height / 2;

            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        this.ctx.lineTo(this.canvas.width, this.canvas.height / 2);
        this.ctx.stroke();

        // Reset Shadow for performance
        this.ctx.shadowBlur = 0;

        // Add random glitch lines (Feature: CRT Effect)
        if (Math.random() > 0.95) {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.1})`;
            const h = Math.random() * 10;
            const y = Math.random() * this.canvas.height;
            this.ctx.fillRect(0, y, this.canvas.width, h);
        }
    }
}
