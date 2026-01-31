import { BaseModule } from './base.js';
import { audioCtx } from '../core/audio.js';

/**
 * Voltage Controlled Amplifier
 * Acts as a Gate/Envelope shaper.
 * Note: A real ADSR is complex to code from scratch in a simple node.
 * We will implement a simple VCA Gain node controlled by a Gain Knob.
 */
export class VCA extends BaseModule {
    constructor(id) {
        super(id, 'VCA', 'VCA');

        this.gain = audioCtx.context.createGain();
        this.gain.gain.value = 0; // Silent by default

        this.inputs = { 
            'IN': this.gain,
            'CV': this.gain.gain // Control Voltage for amplitude
        };
        this.outputs = { 'OUT': this.gain };

        this.addKnob('LEVEL', 0, 1, 0.5, (val) => {
            // Bias the gain. If CV is plugged in, this acts as offset or max
            this.gain.gain.value = val;
        });

        this.addJacks(['IN', 'CV'], ['OUT']);
    }

    cleanup() {
        this.gain.disconnect();
    }
}