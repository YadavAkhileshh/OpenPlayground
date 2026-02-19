import { BaseModule } from './BaseModule.js';
import { audioCtx } from '../core/AudioEngine.js';
import { Knob } from '../ui/Knob.js';

export class LFO extends BaseModule {
    constructor(container) {
        super("LFO");
        this.container = container;
        this.initAudio();
        this.renderUI();
    }

    initAudio() {
        this.osc = audioCtx.createOscillator();
        this.osc.frequency.value = 1; // 1Hz

        this.gain = audioCtx.createGain();
        this.gain.gain.value = 100; // Output amplitude

        this.osc.connect(this.gain);
        this.osc.start();

        this.outputs['out'] = this.gain;
        this.params['rate'] = this.osc.frequency;
        this.params['amt'] = this.gain.gain;
    }

    renderUI() {
        const panel = document.createElement('div');
        panel.className = 'module';
        panel.dataset.width = "8";
        this.id = "LFO_" + Math.floor(Math.random() * 10000);
        panel.id = this.id;

        panel.innerHTML = `<div class="module-header">LFO</div>`;
        const content = document.createElement('div');
        content.className = 'module-content';

        new Knob(content, "RATE", 1, 0.1, 20, v => this.osc.frequency.setValueAtTime(v, audioCtx.time));
        new Knob(content, "LEVEL", 100, 0, 1000, v => this.gain.gain.setValueAtTime(v, audioCtx.time));

        const jackBox = document.createElement('div');
        jackBox.innerHTML = `
            <div class="jack-container"><span class="jack-label">OUT</span><div class="jack" data-module-id="${this.id}" data-port="out" data-type="out"></div></div>
        `;
        content.appendChild(jackBox);
        panel.appendChild(content);
        this.container.appendChild(panel);
    }
}
