import { BaseModule } from './BaseModule.js';
import { audioCtx } from '../core/AudioEngine.js';
import { Knob } from '../ui/Knob.js';

/**
 * VCO Module (Voltage Controlled Oscillator).
 * Generates waveforms (Sine, Tri, Saw, Square) with frequency control.
 * Supports Frequency Modulation (FM) via input jack.
 */
export class VCO extends BaseModule {
    constructor(container) {
        super("VCO");
        this.container = container;

        this.initAudio();
        this.renderUI();
    }

    initAudio() {
        // Oscillator core
        this.osc = audioCtx.createOscillator();
        this.osc.type = 'sawtooth';
        this.osc.frequency.value = 440;
        this.osc.start();

        // FM Input Gain (attentuator)
        this.fmGain = audioCtx.createGain();
        this.fmGain.gain.value = 0;

        // Connections: FM Input -> FM Gain -> Frequency
        this.fmGain.connect(this.osc.frequency);

        // Expose inputs/outputs/params
        this.inputs['fm'] = this.fmGain;
        this.outputs['out'] = this.osc;
        this.params['freq'] = this.osc.frequency;
        this.params['fmAmt'] = this.fmGain.gain;
    }

    renderUI() {
        const panel = document.createElement('div');
        panel.className = 'module';
        panel.dataset.width = "12";

        const header = document.createElement('div');
        header.className = 'module-header';
        header.textContent = "VCO";
        panel.appendChild(header);

        const content = document.createElement('div');
        content.className = 'module-content';
        panel.appendChild(content);

        // Controls Area
        const controlsFn = document.createElement('div');

        // Coarse Tune Knob
        new Knob(controlsFn, "Coarse", 440, 20, 2000, (val) => {
            this.osc.frequency.setValueAtTime(val, audioCtx.time);
        });

        // FM Amount Knob
        new Knob(controlsFn, "FM Amt", 0, 0, 1000, (val) => {
            this.fmGain.gain.setValueAtTime(val, audioCtx.time);
        });

        // Waveform Selector (Simple implementation for now)
        const waveBox = document.createElement('div');
        waveBox.className = "jack-container";
        const waveLabel = document.createElement('span');
        waveLabel.className = "knob-label";
        waveLabel.textContent = "WAVE";
        waveBox.appendChild(waveLabel);

        const select = document.createElement('select');
        ['sine', 'square', 'sawtooth', 'triangle'].forEach(type => {
            const opt = document.createElement('option');
            opt.value = type;
            opt.textContent = type;
            if (type === 'sawtooth') opt.selected = true;
            select.appendChild(opt);
        });
        select.addEventListener('change', (e) => {
            this.osc.type = e.target.value;
        });
        select.style.width = "80px";
        select.style.background = "#333";
        select.style.color = "#fff";
        select.style.border = "none";
        waveBox.appendChild(select);
        controlsFn.appendChild(waveBox);


        content.appendChild(controlsFn);

        // Jacks Area
        const jacksFn = document.createElement('div');
        jacksFn.style.width = "100%";
        jacksFn.style.display = "flex";
        jacksFn.style.justifyContent = "space-around";
        jacksFn.style.paddingBottom = "10px";

        // Helper to create Jack
        const createJack = (name, type, label) => {
            const div = document.createElement('div');
            div.className = 'jack-container';
            const span = document.createElement('span');
            span.className = 'jack-label';
            span.textContent = label;

            const jack = document.createElement('div');
            jack.className = 'jack';
            jack.dataset.module = this.name; // ID reference
            jack.dataset.type = type; // 'in' or 'out'
            jack.dataset.port = name;

            div.appendChild(span);
            div.appendChild(jack);
            return div;
        };

        jacksFn.appendChild(createJack('fm', 'in', 'FM IN'));
        jacksFn.appendChild(createJack('out', 'out', 'OUT'));

        content.appendChild(jacksFn);
        this.container.appendChild(panel);

        // Store unique ID for patch referencing
        this.id = "VCO_" + Math.floor(Math.random() * 10000);
        panel.id = this.id;
        // Update dataset on jacks to use the real DOM ID
        panel.querySelectorAll('.jack').forEach(j => j.dataset.moduleId = this.id);
    }
}
