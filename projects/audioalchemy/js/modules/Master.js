import { BaseModule } from './BaseModule.js';
import { audioCtx } from '../core/AudioEngine.js';
import { Knob } from '../ui/Knob.js';

export class Master extends BaseModule {
    constructor(container) {
        super("MASTER");
        this.container = container;

        // This module connects directly to AudioEngine.masterGain
        this.inputs['in'] = audioCtx.masterGain;
    }

    init() {
        this.renderUI();
        this.startScope();
    }

    renderUI() {
        const panel = document.createElement('div');
        panel.className = 'module';
        panel.dataset.width = "16";
        this.id = "MASTER_OUT"; // Fixed ID
        panel.id = this.id;

        panel.innerHTML = `<div class="module-header">OUTPUT</div>`;
        const content = document.createElement('div');
        content.className = 'module-content';

        // Scope Canvas
        const scopeContainer = document.createElement('div');
        scopeContainer.className = 'scope-display';
        const canvas = document.createElement('canvas');
        this.canvas = canvas;
        scopeContainer.appendChild(canvas);
        content.appendChild(scopeContainer);

        // Volume Knob
        new Knob(content, "VOLUME", 0.5, 0, 1, v => {
            audioCtx.masterGain.gain.setValueAtTime(v, audioCtx.time);
        });

        // Jacks
        const jackBox = document.createElement('div');
        jackBox.innerHTML = `
            <div class="jack-container"><span class="jack-label">L/R IN</span><div class="jack" data-module-id="${this.id}" data-port="in" data-type="in"></div></div>
        `;
        content.appendChild(jackBox);

        panel.appendChild(content);
        this.container.appendChild(panel);
    }

    startScope() {
        const ctx = this.canvas.getContext('2d');
        const bufferLength = audioCtx.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            requestAnimationFrame(draw);

            if (!audioCtx.isRunning) return;

            // Resize if needed
            if (this.canvas.width !== this.canvas.clientWidth) {
                this.canvas.width = this.canvas.clientWidth;
                this.canvas.height = this.canvas.clientHeight;
            }

            const w = this.canvas.width;
            const h = this.canvas.height;

            requestAnimationFrame(draw);

            audioCtx.analyser.getByteTimeDomainData(dataArray);

            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, w, h);

            ctx.lineWidth = 2;
            ctx.strokeStyle = '#2ec4b6'; // Teal
            ctx.beginPath();

            const sliceWidth = w * 1.0 / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = v * h / 2;

                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);

                x += sliceWidth;
            }

            ctx.lineTo(w, h / 2);
            ctx.stroke();
        };

        draw();
    }
}
