import { BaseModule } from './BaseModule.js';
import { audioCtx } from '../core/AudioEngine.js';
import { Knob } from '../ui/Knob.js';

export class Delay extends BaseModule {
    constructor(container) {
        super("DELAY");
        this.container = container;
        this.initAudio();
        this.renderUI();
    }

    initAudio() {
        this.input = audioCtx.createGain();
        this.output = audioCtx.createGain();

        this.delayNode = audioCtx.ctx.createDelay(5.0); // Max 5 seconds
        this.delayNode.delayTime.value = 0.3; // Default 300ms

        this.feedback = audioCtx.createGain();
        this.feedback.gain.value = 0.4;

        // Routing: Input -> Output (Dry)
        //          Input -> Delay -> Output (Wet)
        //          Delay -> Feedback -> Delay

        // We need a Dry/Wet mix.
        // Let's keep it simple: Input goes to Delay. Delay goes to Output.
        // Input also goes to Output directly? 
        // In modular, usually we patch explicitly. 
        // Let's provide a MIX knob using two gains.

        this.dryGain = audioCtx.createGain();
        this.wetGain = audioCtx.createGain();
        this.dryGain.gain.value = 1;
        this.wetGain.gain.value = 0.5;

        this.input.connect(this.dryGain);
        this.dryGain.connect(this.output);

        this.input.connect(this.delayNode);
        this.delayNode.connect(this.wetGain);
        this.wetGain.connect(this.output);

        this.delayNode.connect(this.feedback);
        this.feedback.connect(this.delayNode);

        // CV for Time and Feedback
        this.inputs['in'] = this.input;
        this.outputs['out'] = this.output;
        this.params['time'] = this.delayNode.delayTime;
        this.params['feedback'] = this.feedback.gain;
        this.params['mix'] = this.wetGain.gain; // Simplified mix control
    }

    renderUI() {
        const panel = document.createElement('div');
        panel.className = 'module';
        panel.dataset.width = "12";
        this.id = "DELAY_" + Math.floor(Math.random() * 10000);
        panel.id = this.id;

        panel.innerHTML = `<div class="module-header">DELAY</div>`;
        const content = document.createElement('div');
        content.className = 'module-content';

        new Knob(content, "TIME", 0.3, 0.01, 2.0, v => this.delayNode.delayTime.setValueAtTime(v, audioCtx.time));
        new Knob(content, "FDBK", 0.4, 0, 0.95, v => this.feedback.gain.setValueAtTime(v, audioCtx.time));
        new Knob(content, "MIX", 0.5, 0, 1, v => {
            this.wetGain.gain.setValueAtTime(v, audioCtx.time);
            this.dryGain.gain.setValueAtTime(1.0 - v, audioCtx.time);
        });

        const jackBox = document.createElement('div');
        jackBox.innerHTML = `
            <div class="jack-container"><span class="jack-label">IN</span><div class="jack" data-module-id="${this.id}" data-port="in" data-type="in"></div></div>
            <div class="jack-container"><span class="jack-label">OUT</span><div class="jack" data-module-id="${this.id}" data-port="out" data-type="out"></div></div>
        `;
        content.appendChild(jackBox);
        panel.appendChild(content);
        this.container.appendChild(panel);
    }
}
