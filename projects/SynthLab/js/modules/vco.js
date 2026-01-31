import { BaseModule } from './base.js';
import { audioCtx } from '../core/audio.js';

export class VCO extends BaseModule {
    constructor(id) {
        super(id, 'VCO', 'VCO');
        
        // Audio Node
        this.osc = audioCtx.context.createOscillator();
        this.osc.start();
        
        // Define I/O
        // 1V/Oct input is frequency audioParam
        // Output is the oscillator node
        this.inputs = { 'CV': this.osc.frequency }; 
        this.outputs = { 'OUT': this.osc };

        // UI
        this.addKnob('FREQ', 20, 2000, 440, (val) => {
            this.osc.frequency.value = val;
        });

        this.addKnob('WAVE', 0, 3, 0, (val) => {
            const types = ['sine', 'square', 'sawtooth', 'triangle'];
            this.osc.type = types[Math.round(val)];
        });

        this.addJacks(['CV'], ['OUT']);
    }

    cleanup() {
        this.osc.stop();
        this.osc.disconnect();
    }
}