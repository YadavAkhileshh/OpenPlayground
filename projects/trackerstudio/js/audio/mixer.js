/**
 * mixer.js
 * Manages 4 channel strips, mute/solo, per-channel volume,
 * and routes audio through the DSP processor.
 * Feature: Channel Mute/Solo, per-channel volume control.
 */
import { DSPProcessor } from '../dsp/effects.js';

export class Mixer {
    constructor(audioEngine) {
        this.ctx = audioEngine.ctx;
        this.output = audioEngine.masterGain;

        // DSP insert on master bus
        this.dsp = new DSPProcessor(this.ctx);

        // Pre-DSP bus
        this.preDspBus = this.ctx.createGain();
        this.preDspBus.gain.value = 1.0;

        // Signal chain: ChannelStrips -> PreDspBus -> DSP -> MasterGain
        this.preDspBus.connect(this.dsp.node);
        this.dsp.connect(this.output);

        // 4 channel strips
        this.channels = [];
        for (let i = 0; i < 4; i++) {
            this.channels.push(this._createChannel(i));
        }

        // Mute/Solo state
        this.muteState = [false, false, false, false];
        this.soloState = [false, false, false, false];
        this.hasSolo = false;

        // Per-channel analyser for VU meters
        this.channelAnalysers = this.channels.map(ch => {
            const a = this.ctx.createAnalyser();
            a.fftSize = 256;
            ch.node.connect(a);
            return a;
        });
    }

    _createChannel(index) {
        const gain = this.ctx.createGain();
        gain.gain.value = 1.0;
        gain.connect(this.preDspBus);
        return { id: index, node: gain, volume: 1.0 };
    }

    setChannelVolume(ch, vol) {
        if (this.channels[ch]) {
            this.channels[ch].volume = vol;
            this._updateChannelGain(ch);
        }
    }

    toggleMute(ch) {
        this.muteState[ch] = !this.muteState[ch];
        this._updateChannelGain(ch);
        return this.muteState[ch];
    }

    toggleSolo(ch) {
        this.soloState[ch] = !this.soloState[ch];
        this.hasSolo = this.soloState.some(s => s);
        // Update all channels
        for (let i = 0; i < 4; i++) {
            this._updateChannelGain(i);
        }
        return this.soloState[ch];
    }

    _updateChannelGain(ch) {
        const channel = this.channels[ch];
        if (!channel) return;

        let effective = channel.volume;

        if (this.muteState[ch]) {
            effective = 0;
        } else if (this.hasSolo && !this.soloState[ch]) {
            effective = 0;
        }

        channel.node.gain.setTargetAtTime(effective, this.ctx.currentTime, 0.005);
    }

    /**
     * Read VU level for a channel (0..1).
     */
    getChannelLevel(ch) {
        const analyser = this.channelAnalysers[ch];
        if (!analyser) return 0;
        const buf = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteTimeDomainData(buf);
        let max = 0;
        for (let i = 0; i < buf.length; i++) {
            const v = Math.abs(buf[i] - 128) / 128;
            if (v > max) max = v;
        }
        return max;
    }
}
