// ============================================
// WAVEFORM VISUALIZER
// ============================================

/**
 * WaveformVisualizer renders real-time waveform display
 */
class WaveformVisualizer {
    constructor(canvasId, audioEngine) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.audio = audioEngine;
        this.animationId = null;
        this.isActive = false;

        // Set canvas resolution
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    /**
     * Resize canvas to match display size
     */
    resize() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        this.width = rect.width;
        this.height = rect.height;
    }

    /**
     * Start visualization
     */
    start() {
        if (this.isActive) return;
        this.isActive = true;
        this.draw();
    }

    /**
     * Stop visualization
     */
    stop() {
        this.isActive = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    /**
     * Draw waveform
     */
    draw() {
        if (!this.isActive) return;

        this.animationId = requestAnimationFrame(() => this.draw());

        const analyser = this.audio.getAnalyser();
        if (!analyser) return;

        // Get time domain data
        const bufferLength = analyser.fftSize;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(dataArray);

        // Clear canvas
        this.ctx.fillStyle = 'rgba(10, 10, 15, 0.3)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw waveform
        this.ctx.lineWidth = CONFIG.VISUALIZATION.WAVEFORM_LINE_WIDTH;
        this.ctx.strokeStyle = CONFIG.VISUALIZATION.WAVEFORM_COLOR;
        this.ctx.shadowBlur = CONFIG.VISUALIZATION.WAVEFORM_GLOW;
        this.ctx.shadowColor = CONFIG.VISUALIZATION.WAVEFORM_COLOR;

        this.ctx.beginPath();

        const sliceWidth = this.width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = (v * this.height) / 2;

            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        this.ctx.lineTo(this.width, this.height / 2);
        this.ctx.stroke();

        // Reset shadow
        this.ctx.shadowBlur = 0;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WaveformVisualizer;
}
