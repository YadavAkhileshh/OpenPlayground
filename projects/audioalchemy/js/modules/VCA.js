import { BaseModule } from './BaseModule.js';
import { audioCtx } from '../core/AudioEngine.js';
import { Knob } from '../ui/Knob.js';

/**
 * VCA Module (Voltage Controlled Amplifier) with ADSR Envelope.
 * Controls the amplitude of the signal.
 * integrated ADSR (Attack, Decay, Sustain, Release) envelope generator
 * triggered by Gate signals for shaping sound dynamics.
 */
export class VCA extends BaseModule {
    constructor(container) {
        super("VCA");
        this.container = container;

        // ADSR Params
        this.attack = 0.01;
        this.decay = 0.1;
        this.sustain = 0.5;
        this.release = 0.3;

        this.initAudio();
        this.renderUI();
    }

    initAudio() {
        this.gain = audioCtx.createGain();
        this.gain.gain.value = 0;

        // Envelope Trigger Input (Not an AudioNode, but a logic trigger)
        // We'll simulate this by handling 'gate' connections in PatchManager specially usually,
        // but here we can also accept a trigger signal if we assume CV gate.
        // For simplicity, we'll expose a dummy parameter for the patch system to latch onto,
        // but the actual logic happens when the gate signal rises.

        // Actually, to keep it pure Web Audio, we can use a ConstantSourceNode as a gate, 
        // but detecting edges is hard. 
        // We will implement a `trigger()` method that the Sequencer calls directly or via an Event.

        this.inputs['in'] = this.gain;
        this.outputs['out'] = this.gain;

        // We need a way to receive Gate signals.
        // In this modular system, if we connect Sequencer Gate -> VCA Gate,
        // The sequencer will send a message.
        this.gateInput = {
            isGate: true,
            trigger: (time, type) => this.handleGate(time, type)
        };
        // Register it in inputs map with a special flag/object if needed, 
        // or just handle it in PatchManager.
    }

    handleGate(time, type) {
        // type: 1 = Note On, 0 = Note Off
        const t = time || audioCtx.time;

        if (type === 1) {
            // Attack
            this.gain.gain.cancelScheduledValues(t);
            this.gain.gain.setValueAtTime(0, t);
            this.gain.gain.linearRampToValueAtTime(1, t + this.attack);
            // Decay
            this.gain.gain.linearRampToValueAtTime(this.sustain, t + this.attack + this.decay);
        } else {
            // Release
            this.gain.gain.cancelScheduledValues(t);
            this.gain.gain.setValueAtTime(this.gain.gain.value, t); // Current value
            this.gain.gain.exponentialRampToValueAtTime(0.001, t + this.release);
        }
    }

    renderUI() {
        const panel = document.createElement('div');
        panel.className = 'module';
        panel.dataset.width = "16"; // Wider for 4 knobs
        this.id = "VCA_" + Math.floor(Math.random() * 10000);
        panel.id = this.id;

        panel.innerHTML = `<div class="module-header">ADS-VCA</div>`;
        const content = document.createElement('div');
        content.className = 'module-content';

        const knobs = document.createElement('div');
        knobs.style.display = 'grid';
        knobs.style.gridTemplateColumns = '1fr 1fr';
        knobs.style.gap = '5px';

        new Knob(knobs, "A", 0.01, 0.001, 2, v => this.attack = v);
        new Knob(knobs, "D", 0.1, 0.001, 2, v => this.decay = v);
        new Knob(knobs, "S", 0.5, 0, 1, v => this.sustain = v);
        new Knob(knobs, "R", 0.3, 0.001, 5, v => this.release = v);

        content.appendChild(knobs);

        const jackBox = document.createElement('div');
        jackBox.style.display = "flex";
        jackBox.style.justifyContent = "space-around";
        jackBox.style.width = "100%";
        jackBox.innerHTML = `
            <div class="jack-container"><span class="jack-label">IN</span><div class="jack" data-module-id="${this.id}" data-port="in" data-type="in"></div></div>
            <div class="jack-container"><span class="jack-label">GATE</span><div class="jack" data-module-id="${this.id}" data-port="gate" data-type="in"></div></div>
            <div class="jack-container"><span class="jack-label">OUT</span><div class="jack" data-module-id="${this.id}" data-port="out" data-type="out"></div></div>
        `;

        content.appendChild(jackBox);
        panel.appendChild(content);
        this.container.appendChild(panel);
    }
}
