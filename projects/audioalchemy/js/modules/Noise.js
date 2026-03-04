import { BaseModule } from './BaseModule.js';
import { audioCtx } from '../core/AudioEngine.js';

export class Noise extends BaseModule {
    constructor(container) {
        super("NOISE");
        this.container = container;
        this.initAudio();
        this.renderUI();
    }

    initAudio() {
        const bufferSize = 2 * audioCtx.ctx.sampleRate;
        const buffer = audioCtx.ctx.createBuffer(1, bufferSize, audioCtx.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        // White Noise
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        this.whiteSrc = audioCtx.ctx.createBufferSource();
        this.whiteSrc.buffer = buffer;
        this.whiteSrc.loop = true;
        this.whiteSrc.start();

        this.output = audioCtx.createGain();
        this.output.gain.value = 1.0;

        this.whiteSrc.connect(this.output);

        this.outputs['white'] = this.output;
    }

    renderUI() {
        const panel = document.createElement('div');
        panel.className = 'module';
        panel.dataset.width = "8"; // Narrow
        this.id = "NOISE_" + Math.floor(Math.random() * 10000);
        panel.id = this.id;

        panel.innerHTML = `<div class="module-header">NOISE</div>`;
        const content = document.createElement('div');
        content.className = 'module-content';

        // Visual decoration: A static noise graphic?
        const canvas = document.createElement('canvas');
        canvas.width = 60;
        canvas.height = 60;
        const ctx = canvas.getContext('2d');
        for (let i = 0; i < 1000; i++) {
            ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#222';
            ctx.fillRect(Math.random() * 60, Math.random() * 60, 2, 2);
        }
        content.appendChild(canvas);

        const jackBox = document.createElement('div');
        jackBox.innerHTML = `
            <div class="jack-container"><span class="jack-label">WHITE</span><div class="jack" data-module-id="${this.id}" data-port="white" data-type="out"></div></div>
        `;
        content.appendChild(jackBox);
        panel.appendChild(content);
        this.container.appendChild(panel);
    }
}
