import { BaseModule } from './BaseModule.js';
import { audioCtx } from '../core/AudioEngine.js';
import { Knob } from '../ui/Knob.js';

/**
 * VCF Module (Voltage Controlled Filter).
 * Implements a Biquad lowpass filter.
 * Features Cutoff Frequency and Resonance (Q) controls.
 * Accepts Control Voltage (CV) for cutoff modulation.
 */
export class VCF extends BaseModule {
    constructor(container) {
        super("VCF");
        this.container = container;
        this.initAudio();
        this.renderUI();
    }

    initAudio() {
        this.filter = audioCtx.createBiquadFilter();
        this.filter.type = 'lowpass';
        this.filter.frequency.value = 1000;
        this.filter.Q.value = 1;

        // CV Input for Cutoff
        this.cvGain = audioCtx.createGain();
        this.cvGain.gain.value = 0;
        this.cvGain.connect(this.filter.frequency);

        this.inputs['in'] = this.filter;
        this.inputs['cv'] = this.cvGain;
        this.outputs['out'] = this.filter;
        this.params['cutoff'] = this.filter.frequency;
        this.params['res'] = this.filter.Q;
        this.params['cvAmt'] = this.cvGain.gain;
    }

    renderUI() {
        const panel = document.createElement('div');
        panel.className = 'module';
        panel.dataset.width = "12";
        this.id = "VCF_" + Math.floor(Math.random() * 10000);
        panel.id = this.id;

        const header = document.createElement('div');
        header.className = 'module-header';
        header.textContent = "VCF";
        panel.appendChild(header);

        const content = document.createElement('div');
        content.className = 'module-content';

        // Frequency Knob
        const controlBox = document.createElement('div');
        new Knob(controlBox, "FREQ", 1000, 20, 10000, (val) => {
            this.filter.frequency.setValueAtTime(val, audioCtx.time);
        });

        // Resonance Knob
        new Knob(controlBox, "RES", 1, 0, 20, (val) => {
            this.filter.Q.setValueAtTime(val, audioCtx.time);
        });

        // CV Amount
        new Knob(controlBox, "CV AMT", 0, 0, 5000, (val) => {
            this.cvGain.gain.setValueAtTime(val, audioCtx.time);
        });

        content.appendChild(controlBox);

        // Jacks
        const jackBox = document.createElement('div');
        jackBox.style.display = "flex";
        jackBox.style.justifyContent = "space-around";
        jackBox.style.width = "100%";

        const createJack = (name, type, label) => {
            const div = document.createElement('div');
            div.className = 'jack-container';
            div.innerHTML = `<span class="jack-label">${label}</span><div class="jack" data-module-id="${this.id}" data-port="${name}" data-type="${type}"></div>`;
            return div;
        };

        jackBox.appendChild(createJack('in', 'in', 'IN'));
        jackBox.appendChild(createJack('cv', 'in', 'CV'));
        jackBox.appendChild(createJack('out', 'out', 'OUT'));

        content.appendChild(jackBox);
        panel.appendChild(content);
        this.container.appendChild(panel);
    }
}
