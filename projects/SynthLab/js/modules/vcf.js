import { BaseModule } from './base.js';
import { audioCtx } from '../core/audio.js';

export class VCF extends BaseModule {
    constructor(id) {
        super(id, 'VCF', 'VCF');

        this.filter = audioCtx.context.createBiquadFilter();
        this.filter.type = 'lowpass';

        this.inputs = { 
            'IN': this.filter,
            'FREQ': this.filter.frequency 
        };
        this.outputs = { 'OUT': this.filter };

        this.addKnob('CUTOFF', 20, 10000, 2000, (val) => {
            this.filter.frequency.value = val;
        });

        this.addKnob('RES', 0, 20, 1, (val) => {
            this.filter.Q.value = val;
        });

        this.addJacks(['IN', 'FREQ'], ['OUT']);
    }

    cleanup() {
        this.filter.disconnect();
    }
}