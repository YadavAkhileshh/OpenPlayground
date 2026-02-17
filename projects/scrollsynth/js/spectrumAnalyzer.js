// ============================================
// SPECTRUM ANALYZER
// ============================================

/**
 * SpectrumAnalyzer renders real-time frequency spectrum
 */
class SpectrumAnalyzer {
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
     * Draw spectrum
     */
    draw() {
        if (!this.isActive) return;

        this.animationId = requestAnimationFrame(() => this.draw());

        const analyser = this.audio.getAnalyser();
        if (!analyser) return;

        // Get frequency data
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        // Clear canvas
        this.ctx.fillStyle = 'rgba(10, 10, 15, 0.3)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Calculate bar dimensions
        const barCount = CONFIG.VISUALIZATION.SPECTRUM_BAR_COUNT;
        const barWidth = (this.width / barCount) - CONFIG.VISUALIZATION.SPECTRUM_BAR_GAP;

        // Draw bars
        for (let i = 0; i < barCount; i++) {
            // Sample from frequency data
            const index = Math.floor((i / barCount) * bufferLength);
            const value = dataArray[index];

            // Normalize to 0-1
            const normalized = value / 255;

            // Calculate bar height
            const barHeight = normalized * this.height;

            // Calculate position
            const x = i * (barWidth + CONFIG.VISUALIZATION.SPECTRUM_BAR_GAP);
            const y = this.height - barHeight;

            // Create gradient for bar
            const gradient = this.ctx.createLinearGradient(x, y, x, this.height);
            gradient.addColorStop(0, '#00ffcc');
            gradient.addColorStop(0.5, '#00ccff');
            gradient.addColorStop(1, '#0088ff');

            // Draw bar
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x, y, barWidth, barHeight);

            // Add glow effect for high values
            if (normalized > 0.7) {
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = '#00ffcc';
                this.ctx.fillRect(x, y, barWidth, barHeight);
                this.ctx.shadowBlur = 0;
            }
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SpectrumAnalyzer;
}
