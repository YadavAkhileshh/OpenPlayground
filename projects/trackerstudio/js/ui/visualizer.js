/**
 * visualizer.js
 * Renders oscilloscope waveform and frequency spectrum analyzer.
 * Feature: Dual canvas — oscilloscope + spectrum bar graph.
 */
export class Visualizer {
    constructor(analyser, spectrumAnalyser) {
        this.analyser = analyser;
        this.specAnalyser = spectrumAnalyser;

        this.oscCanvas = document.getElementById('oscilloscope');
        this.specCanvas = document.getElementById('spectrum');

        this.oscCtx = this.oscCanvas.getContext('2d');
        this.specCtx = this.specCanvas.getContext('2d');

        this.oscData = new Uint8Array(analyser.frequencyBinCount);
        this.specData = new Uint8Array(spectrumAnalyser.frequencyBinCount);
    }

    draw() {
        this._drawOscilloscope();
        this._drawSpectrum();
    }

    _drawOscilloscope() {
        const w = this.oscCanvas.width;
        const h = this.oscCanvas.height;
        const ctx = this.oscCtx;

        this.analyser.getByteTimeDomainData(this.oscData);

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, w, h);

        // Grid lines
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();

        // Waveform
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#00ffcc';
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#00ffcc';
        ctx.beginPath();

        const sliceW = w / this.oscData.length;
        let x = 0;

        for (let i = 0; i < this.oscData.length; i++) {
            const v = this.oscData[i] / 128.0;
            const y = (v * h) / 2;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
            x += sliceW;
        }

        ctx.lineTo(w, h / 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    _drawSpectrum() {
        const w = this.specCanvas.width;
        const h = this.specCanvas.height;
        const ctx = this.specCtx;

        this.specAnalyser.getByteFrequencyData(this.specData);

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, w, h);

        const barCount = this.specData.length;
        const barW = w / barCount;

        for (let i = 0; i < barCount; i++) {
            const val = this.specData[i] / 255;
            const barH = val * h;

            // Color gradient: teal -> yellow -> red based on amplitude
            const r = Math.floor(val * 255);
            const g = Math.floor((1 - val * 0.5) * 200);
            const b = Math.floor((1 - val) * 200);
            ctx.fillStyle = `rgb(${r},${g},${b})`;

            ctx.fillRect(i * barW, h - barH, barW - 1, barH);
        }
    }
}
