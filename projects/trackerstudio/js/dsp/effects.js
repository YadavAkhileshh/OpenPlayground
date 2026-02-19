/**
 * effects.js
 * Manual DSP implementations using ScriptProcessorNode.
 * Features:
 *   - BitCrusher: Reduces bit depth AND sample rate (downsampling).
 *   - Delay: Circular buffer with feedback and wet/dry mix.
 *   - Reverb: Simple Feedback Delay Network (FDN) with 4 comb filters.
 */

export class DSPProcessor {
    constructor(ctx) {
        this.ctx = ctx;
        this.bufferSize = 4096;

        // ScriptProcessorNode: 2 in, 2 out (stereo)
        this.node = this.ctx.createScriptProcessor(this.bufferSize, 2, 2);

        // ── BitCrusher params ──────────────────────────────
        this.bitDepth = 16;       // 1-16 bits
        this.sampleRateDiv = 1;   // 1 = no reduction, 2 = half rate, etc.
        this._srCounter = 0;
        this._srHeldL = 0;
        this._srHeldR = 0;

        // ── Delay params ───────────────────────────────────
        this.delayTime = 0.3;     // seconds
        this.delayFeedback = 0.4;
        this.delayMix = 0.3;      // wet/dry (0=dry, 1=wet)
        const maxDelaySamples = Math.ceil(ctx.sampleRate * 2.0); // 2s max
        this.delayBufL = new Float32Array(maxDelaySamples);
        this.delayBufR = new Float32Array(maxDelaySamples);
        this.delayHead = 0;

        // ── Reverb params (4-comb FDN) ─────────────────────
        this.reverbMix = 0.2;
        this.reverbSize = 0.5;    // 0..1 scales comb lengths
        // Comb filter delay lengths (prime-ish, in samples at 44100)
        this._combLengths = [1557, 1617, 1491, 1422];
        this._combBufsL = this._combLengths.map(l => new Float32Array(Math.ceil(l * 2)));
        this._combBufsR = this._combLengths.map(l => new Float32Array(Math.ceil(l * 2)));
        this._combHeads = new Int32Array(4);
        // Allpass filter
        this._apBuf = new Float32Array(556);
        this._apHead = 0;
        this._apGain = 0.7;

        this.node.onaudioprocess = (e) => this._process(e);
    }

    setParams(params) {
        if (params.bitDepth !== undefined) this.bitDepth = Math.max(1, Math.min(16, params.bitDepth));
        if (params.sampleRateDiv !== undefined) this.sampleRateDiv = Math.max(1, Math.min(16, params.sampleRateDiv));
        if (params.delayTime !== undefined) this.delayTime = Math.max(0.01, Math.min(1.9, params.delayTime));
        if (params.delayFeedback !== undefined) this.delayFeedback = Math.max(0, Math.min(0.95, params.delayFeedback));
        if (params.delayMix !== undefined) this.delayMix = Math.max(0, Math.min(1, params.delayMix));
        if (params.reverbMix !== undefined) this.reverbMix = Math.max(0, Math.min(1, params.reverbMix));
        if (params.reverbSize !== undefined) this.reverbSize = Math.max(0.1, Math.min(1, params.reverbSize));
    }

    _process(e) {
        const inL = e.inputBuffer.getChannelData(0);
        const inR = e.inputBuffer.getChannelData(1);
        const outL = e.outputBuffer.getChannelData(0);
        const outR = e.outputBuffer.getChannelData(1);
        const len = inL.length;

        const delaySamples = Math.floor(this.delayTime * this.ctx.sampleRate);
        const delayLen = this.delayBufL.length;
        const bitStep = this.bitDepth < 16 ? Math.pow(0.5, this.bitDepth - 1) : 0;
        const combFeedback = 0.84 * this.reverbSize;

        for (let i = 0; i < len; i++) {
            let l = inL[i];
            let r = inR[i];

            // ── 1. BitCrusher ──────────────────────────────
            if (this.bitDepth < 16) {
                l = bitStep > 0 ? Math.round(l / bitStep) * bitStep : l;
                r = bitStep > 0 ? Math.round(r / bitStep) * bitStep : r;
            }

            // Sample rate reduction (hold sample for N frames)
            if (this.sampleRateDiv > 1) {
                if (this._srCounter === 0) {
                    this._srHeldL = l;
                    this._srHeldR = r;
                }
                l = this._srHeldL;
                r = this._srHeldR;
                this._srCounter = (this._srCounter + 1) % this.sampleRateDiv;
            }

            // ── 2. Delay (Circular Buffer) ─────────────────
            const readIdx = (this.delayHead - delaySamples + delayLen) % delayLen;
            const dL = this.delayBufL[readIdx];
            const dR = this.delayBufR[readIdx];

            this.delayBufL[this.delayHead] = l + dL * this.delayFeedback;
            this.delayBufR[this.delayHead] = r + dR * this.delayFeedback;

            this.delayHead = (this.delayHead + 1) % delayLen;

            const wetL = l * (1 - this.delayMix) + dL * this.delayMix;
            const wetR = r * (1 - this.delayMix) + dR * this.delayMix;

            // ── 3. Reverb (4-Comb FDN + 1 Allpass) ────────
            let revL = 0;
            let revR = 0;

            for (let c = 0; c < 4; c++) {
                const cLen = Math.ceil(this._combLengths[c] * this.reverbSize) || 1;

                const hL = this._combHeads[c] % this._combBufsL[c].length;
                const hR = hL; // same head for simplicity

                const cOutL = this._combBufsL[c][hL];
                const cOutR = this._combBufsR[c][hR];

                this._combBufsL[c][hL] = wetL + cOutL * combFeedback;
                this._combBufsR[c][hR] = wetR + cOutR * combFeedback;

                this._combHeads[c] = (this._combHeads[c] + 1) % cLen;

                revL += cOutL;
                revR += cOutR;
            }

            revL *= 0.25;
            revR *= 0.25;

            // Allpass filter
            const apOut = this._apBuf[this._apHead];
            this._apBuf[this._apHead] = revL + apOut * this._apGain;
            revL = apOut - this._apGain * this._apBuf[this._apHead];
            this._apHead = (this._apHead + 1) % this._apBuf.length;

            // Mix reverb
            const finalL = wetL + revL * this.reverbMix;
            const finalR = wetR + revR * this.reverbMix;

            // Soft clip to prevent clipping
            outL[i] = Math.tanh(finalL);
            outR[i] = Math.tanh(finalR);
        }
    }

    connect(destination) {
        this.node.connect(destination);
    }
}
