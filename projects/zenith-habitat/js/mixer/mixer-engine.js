import AudioContextManager from './audio-context.js';
import NoiseNode from './noise-node.js';
import FileNode from './file-node.js';
import BinauralNode from './binaural-node.js';
import { SOUND_LIBRARY, PRESETS } from './presets.js';

export default class MixerEngine {
    constructor() {
        this.ctxManager = AudioContextManager.getInstance();
        this.channels = {};
        this.masterGain = null;
        this.isReady = false;
        this.binaural = null;

        // Setup Master Gain
        const ctx = this.ctxManager.context;
        this.masterGain = ctx.createGain();
        this.masterGain.connect(ctx.destination);
    }

    async init() {
        if (this.isReady) return;

        // Instantiate all potential channels (lazy load inside nodes)
        const ctx = this.ctxManager.context;

        // Binaural setup
        this.binaural = new BinauralNode(ctx);
        this.binaural.connect(this.masterGain);

        for (const [key, config] of Object.entries(SOUND_LIBRARY)) {
            let node;
            if (config.type === 'noise') {
                node = new NoiseNode(ctx, config.subtype);
            } else {
                node = new FileNode(ctx, config.url);
            }

            node.connect(this.masterGain);
            this.channels[key] = {
                node: node,
                config: config,
                volume: 0,
                isMuted: false
            };
        }

        this.isReady = true;
    }

    async resume() {
        // Must be called from user interaction
        await this.ctxManager.resume();
    }

    setChannelVolume(key, volume0to100) {
        if (!this.channels[key]) return;

        // Auto-resume context if user touches slider
        if (this.ctxManager.context.state === 'suspended') {
            this.resume();
        }

        const channel = this.channels[key];
        channel.volume = volume0to100;

        if (!channel.isMuted) {
            channel.node.setVolume(volume0to100 / 100);
        }
    }

    toggleMute(key) {
        if (!this.channels[key]) return;

        const channel = this.channels[key];
        channel.isMuted = !channel.isMuted;

        const targetVol = channel.isMuted ? 0 : (channel.volume / 100);
        channel.node.setVolume(targetVol);

        return channel.isMuted;
    }

    loadPreset(presetName) {
        const preset = PRESETS[presetName];
        if (!preset) return;

        // Reset all
        Object.keys(this.channels).forEach(k => this.setChannelVolume(k, 0));

        // Apply Preset
        Object.entries(preset.channels).forEach(([key, vol]) => {
            this.setChannelVolume(key, vol);
        });

        return preset;
    }
}
