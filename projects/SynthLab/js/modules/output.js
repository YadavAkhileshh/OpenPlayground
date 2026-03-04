import { BaseModule } from './base.js';
import { audioCtx } from '../core/audio.js';

export class OutputModule extends BaseModule {
    constructor(id) {
        super(id, 'MASTER', 'OUTPUT');

        // Input connects to global master gain
        this.inputs = { 'L': audioCtx.masterGain, 'R': audioCtx.masterGain }; 
        
        // Add Scope Canvas
        const container = document.getElementById(`content-${this.id}`);
        const canvas = document.createElement('canvas');
        canvas.width = 120;
        canvas.height = 60;
        canvas.style.background = '#000';
        canvas.style.border = '1px solid #444';
        container.appendChild(canvas);
        
        this.canvasCtx = canvas.getContext('2d');
        this.bufferLength = audioCtx.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);

        this.addKnob('VOL', 0, 1, 0.8, (val) => {
            audioCtx.masterGain.gain.value = val;
        });

        this.addJacks(['L', 'R'], []);

        this.draw();
    }

    draw() {
        if (!audioCtx.isRunning) {
            requestAnimationFrame(() => this.draw());
            return;
        }

        const ctx = this.canvasCtx;
        const w = 120;
        const h = 60;

        audioCtx.analyser.getByteTimeDomainData(this.dataArray);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // Fade effect
        ctx.fillRect(0, 0, w, h);

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#4caf50';
        ctx.beginPath();

        const sliceWidth = w * 1.0 / this.bufferLength;
        let x = 0;

        for (let i = 0; i < this.bufferLength; i++) {
            const v = this.dataArray[i] / 128.0;
            const y = v * h / 2;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);

            x += sliceWidth;
        }

        ctx.lineTo(w, h / 2);
        ctx.stroke();

        requestAnimationFrame(() => this.draw());
    }
}