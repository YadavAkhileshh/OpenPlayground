/**
 * Generates binaural beats using two oscillators with a frequency offset.
 * Left ear: freq
 * Right ear: freq + offset
 */
export default class BinauralNode {
    constructor(ctx) {
        this.ctx = ctx;
        this.oscL = null;
        this.oscR = null;
        this.merger = null;
        this.gainNode = this.ctx.createGain();
        this.gainNode.gain.value = 0;

        this.pannerL = this.ctx.createStereoPanner();
        this.pannerR = this.ctx.createStereoPanner();
        this.pannerL.pan.value = -1;
        this.pannerR.pan.value = 1;

        this.isPlaying = false;
        this.baseFreq = 200; // Comfortable base frequency
    }

    setup() {
        if (this.oscL) return;

        this.oscL = this.ctx.createOscillator();
        this.oscR = this.ctx.createOscillator();
        this.oscL.type = 'sine';
        this.oscR.type = 'sine';

        this.oscL.connect(this.pannerL).connect(this.gainNode);
        this.oscR.connect(this.pannerR).connect(this.gainNode);

        this.oscL.start();
        this.oscR.start();
    }

    connect(destination) {
        this.gainNode.connect(destination);
    }

    setType(type) {
        this.setup();
        let offset = 10;
        switch (type) {
            case 'alpha': offset = 10; break; // Focus
            case 'beta': offset = 20; break; // Alert
            case 'theta': offset = 5; break; // Relax
            case 'delta': offset = 2; break; // Sleep
        }

        const now = this.ctx.currentTime;
        this.oscL.frequency.setTargetAtTime(this.baseFreq, now, 0.1);
        this.oscR.frequency.setTargetAtTime(this.baseFreq + offset, now, 0.1);
    }

    setVolume(value) {
        this.setup();
        this.gainNode.gain.setTargetAtTime(value, this.ctx.currentTime, 0.1);
        this.isPlaying = value > 0;
    }
}
