/**
 * HARMONICA JS v2.0 - VISUALIZER
 * Real-time audio visualization and breath intensity display
 */

class Visualizer {
    constructor(audioEngine) {
        this.audioEngine = audioEngine;
        this.canvas = document.getElementById('waveformCanvas');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.breathFill = document.getElementById('breathFill');
        this.breathPeak = document.getElementById('breathPeak');

        this.breathIntensity = 0;
        this.breathTarget = 0;
        this.peakValue = 0;
        this.animationId = null;
        this.isActive = false;
    }

    /**
     * Start visualization
     */
    start() {
        if (this.isActive) return;
        this.isActive = true;
        this.breathTarget = 100;
        this.animate();
    }

    /**
     * Stop visualization
     */
    stop() {
        this.isActive = false;
        this.breathTarget = 0;

        // Smooth fade out
        const fadeOut = () => {
            if (this.breathIntensity > 0) {
                this.breathIntensity = Math.max(0, this.breathIntensity - 2);
                this.updateBreathDisplay();
                requestAnimationFrame(fadeOut);
            } else {
                this.reset();
            }
        };
        fadeOut();
    }

    /**
     * Reset visualizations
     */
    reset() {
        this.breathIntensity = 0;
        this.breathTarget = 0;
        this.peakValue = 0;
        this.updateBreathDisplay();
        this.clearWaveform();
    }

    /**
     * Main animation loop
     */
    animate() {
        if (!this.isActive) return;

        this.updateBreathIntensity();
        this.drawWaveform();

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    /**
     * Update breath intensity with smooth interpolation
     */
    updateBreathIntensity() {
        // Smooth approach to target
        const delta = this.breathTarget - this.breathIntensity;
        this.breathIntensity += delta * 0.1;

        // Update peak value
        if (this.breathIntensity > this.peakValue) {
            this.peakValue = this.breathIntensity;
        } else {
            this.peakValue = Math.max(0, this.peakValue - 0.5);
        }

        this.updateBreathDisplay();
    }

    /**
     * Update breath display elements
     */
    updateBreathDisplay() {
        if (this.breathFill) {
            this.breathFill.style.width = `${this.breathIntensity}%`;
        }

        if (this.breathPeak) {
            this.breathPeak.style.right = `${100 - this.peakValue}%`;
            this.breathPeak.classList.toggle('active', this.peakValue > 0);
        }
    }

    /**
     * Draw waveform visualization
     */
    drawWaveform() {
        if (!this.ctx || !this.canvas) return;

        const analyserData = this.audioEngine.getAnalyserData();
        if (!analyserData) {
            this.clearWaveform();
            return;
        }

        const { dataArray, bufferLength } = analyserData;
        const width = this.canvas.width;
        const height = this.canvas.height;

        // Clear canvas
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, width, height);

        // Draw waveform
        this.ctx.lineWidth = 2;

        // Create gradient for waveform
        const gradient = this.ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, COLORS.primary);
        gradient.addColorStop(0.5, COLORS.secondary);
        gradient.addColorStop(1, COLORS.primary);

        this.ctx.strokeStyle = gradient;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = COLORS.primary;

        this.ctx.beginPath();

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = (v * height) / 2;

            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        this.ctx.stroke();

        // Reset shadow
        this.ctx.shadowBlur = 0;
    }

    /**
     * Clear waveform canvas
     */
    clearWaveform() {
        if (!this.ctx || !this.canvas) return;

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw center line
        this.ctx.strokeStyle = 'rgba(79, 172, 254, 0.2)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height / 2);
        this.ctx.lineTo(this.canvas.width, this.canvas.height / 2);
        this.ctx.stroke();
    }

    /**
     * Update mode indicators
     */
    updateModeIndicator(isBlow) {
        const blowIndicator = document.getElementById('blowIndicator');
        const drawIndicator = document.getElementById('drawIndicator');

        if (blowIndicator && drawIndicator) {
            blowIndicator.classList.toggle('active', isBlow);
            drawIndicator.classList.toggle('active', !isBlow);
        }
    }

    /**
     * Clear mode indicators
     */
    clearModeIndicators() {
        const blowIndicator = document.getElementById('blowIndicator');
        const drawIndicator = document.getElementById('drawIndicator');

        if (blowIndicator) blowIndicator.classList.remove('active');
        if (drawIndicator) drawIndicator.classList.remove('active');
    }
}

console.log('✓ Visualizer loaded');