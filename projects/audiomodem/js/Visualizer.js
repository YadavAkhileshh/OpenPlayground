/**
 * Visualizer.js
 * Handles canvas-based rendering for spectrum and waveform analysis.
 * Provides real-time visual feedback for the modem's activities.
 * 
 * Part of the AudioModem Project.
 */

class Visualizer {
    constructor(audioEngine, spectrumCanvasId, waterfallCanvasId, waveformCanvasId) {
        this.audioEngine = audioEngine;
        this.spectrumCanvas = document.getElementById(spectrumCanvasId);
        this.waterfallCanvas = document.getElementById(waterfallCanvasId);
        this.waveformCanvas = document.getElementById(waveformCanvasId);

        this.spectrumCtx = this.spectrumCanvas.getContext('2d');
        this.waterfallCtx = this.waterfallCanvas.getContext('2d');
        this.waveformCtx = this.waveformCanvas.getContext('2d');

        // Waterfall buffer for persistence
        this.waterfallTempCanvas = document.createElement('canvas');
        this.waterfallTempCtx = this.waterfallTempCanvas.getContext('2d');

        this.isActive = false;
        this.animationFrame = null;

        // Colors from theme.css - Modern Scientific Palette
        this.colors = {
            primary: '#00f2ff',
            accent: '#ff9d00',
            success: '#00ff88',
            bg: '#05070a',
            grid: '#1a3a4a'
        };

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    /**
     * Scales canvases to match display size for high resolution.
     */
    resize() {
        const dpr = window.devicePixelRatio || 1;
        [this.spectrumCanvas, this.waveformCanvas].forEach(canvas => {
            const rect = canvas.parentElement.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            canvas.style.width = rect.width + 'px';
            canvas.style.height = rect.height + 'px';
        });
    }

    /**
     * Starts the rendering loop.
     */
    start() {
        this.isActive = true;
        this.render();
    }

    /**
     * Main render loop.
     */
    render() {
        if (!this.isActive) return;

        this.drawSpectrum();
        this.drawWaveform();
        this.drawWaterfall();

        this.animationFrame = requestAnimationFrame(() => this.render());
    }

    /**
     * Renders the waterfall spectrogram by shifting canvas content.
     */
    drawWaterfall() {
        const ctx = this.waterfallCtx;
        const canvas = this.waterfallCanvas;
        const data = this.audioEngine.getFrequencyData();
        const width = canvas.width;
        const height = canvas.height;

        if (this.waterfallTempCanvas.width !== width || this.waterfallTempCanvas.height !== height) {
            this.waterfallTempCanvas.width = width;
            this.waterfallTempCanvas.height = height;
        }

        // Copy current to temp
        this.waterfallTempCtx.drawImage(canvas, 0, 0);

        // Clear canvas
        ctx.fillStyle = this.colors.bg;
        ctx.fillRect(0, 0, width, height);

        // Draw temp shifted down
        ctx.drawImage(this.waterfallTempCanvas, 0, 2);

        // Draw new top line
        const barWidth = width / (data.length / 4); // Focus on lower frequencies
        for (let i = 0; i < data.length / 4; i++) {
            const val = data[i];
            const hue = 180 + (val / 255) * 60; // Blue to Cyan
            const lum = (val / 255) * 50;
            ctx.fillStyle = `hsl(${hue}, 100%, ${lum}%)`;
            ctx.fillRect(i * barWidth, 0, barWidth + 1, 2);
        }
    }

    /**
     * Renders the frequency spectrum.
     */
    drawSpectrum() {
        const ctx = this.spectrumCtx;
        const canvas = this.spectrumCanvas;
        const data = this.audioEngine.getFrequencyData();
        const width = canvas.width;
        const height = canvas.height;

        ctx.fillStyle = this.colors.bg;
        ctx.fillRect(0, 0, width, height);

        // Draw grid lines
        ctx.strokeStyle = this.colors.grid;
        ctx.lineWidth = 1;
        for (let i = 1; i < 5; i++) {
            const y = (height / 5) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        const barWidth = (width / data.length) * 2.5;
        let x = 0;

        for (let i = 0; i < data.length; i++) {
            const barHeight = (data[i] / 255) * height;

            // Gradient for "scientific" look
            const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
            gradient.addColorStop(0, this.colors.primary);
            gradient.addColorStop(1, 'rgba(0, 242, 255, 0.1)');

            ctx.fillStyle = gradient;
            ctx.fillRect(x, height - barHeight, barWidth, barHeight);

            x += barWidth + 1;
        }

        // Highlight modem frequencies focal points
        this.drawFreqMarker(ctx, 1200, "0", width, height);
        this.drawFreqMarker(ctx, 2200, "1", width, height);
    }

    /**
     * Helper to draw frequency marker on spectrum.
     */
    drawFreqMarker(ctx, freq, label, width, height) {
        const sampleRate = this.audioEngine.context ? this.audioEngine.context.sampleRate : 44100;
        const binSize = sampleRate / this.audioEngine.fftSize;
        const bin = freq / binSize;
        const x = (bin / (this.audioEngine.fftSize / 2)) * width * (this.audioEngine.fftSize / 1024); // Approximation for visible range

        ctx.strokeStyle = this.colors.accent;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = this.colors.accent;
        ctx.font = 'bold 10px Orbitron';
        ctx.fillText(label, x + 5, 20);
    }

    /**
     * Renders the time-domain waveform.
     */
    drawWaveform() {
        const ctx = this.waveformCtx;
        const canvas = this.waveformCanvas;
        const data = this.audioEngine.getTimeData();
        const width = canvas.width;
        const height = canvas.height;

        ctx.fillStyle = this.colors.bg;
        ctx.fillRect(0, 0, width, height);

        ctx.lineWidth = 2;
        ctx.strokeStyle = this.colors.primary;
        ctx.beginPath();

        const sliceWidth = width / data.length;
        let x = 0;

        for (let i = 0; i < data.length; i++) {
            const v = data[i] / 128.0;
            const y = (v * height) / 2;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        ctx.lineTo(width, height / 2);
        ctx.stroke();

        // Scanline highlight
        ctx.fillStyle = 'rgba(0, 242, 255, 0.05)';
        ctx.fillRect(0, (height / 2) - 2, width, 4);
    }

    /**
     * Stops the rendering loop.
     */
    stop() {
        this.isActive = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
}

window.visualizer = null; // Initialized in App.js
