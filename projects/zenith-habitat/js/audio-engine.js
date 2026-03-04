import { UIRenderer } from './ui-renderer.js';

export default class AudioEngine {
    constructor() {
        this.channels = {};
        this.masterVolume = 1.0;

        // Sound Sources (Public Domain / Creative Commons placeholders)
        this.sources = {
            'rain': 'https://assets.mixkit.co/sfx/preview/mixkit-light-rain-loop-1253.mp3',
            'forest': 'https://assets.mixkit.co/sfx/preview/mixkit-forest-bird-singing-1210.mp3',
            'cafe': 'https://assets.mixkit.co/sfx/preview/mixkit-restaurant-ambience-loop-2139.mp3',
            'white-noise': 'https://actions.google.com/sounds/v1/ambiences/hum_of_room.ogg'
        };

        this.init();
    }

    init() {
        // Initialize Audio objects
        for (const [key, url] of Object.entries(this.sources)) {
            const audio = new Audio(url);
            audio.loop = true;
            audio.volume = 0; // Start silent
            this.channels[key] = {
                audio: audio,
                volume: 0,
                isMuted: false
            };
        }

        this.isPlaying = false;
    }

    setVolume(channel, value) {
        // value is 0-100
        const normalized = value / 100;

        if (this.channels[channel]) {
            this.channels[channel].volume = normalized;
            if (!this.channels[channel].isMuted) {
                this.channels[channel].audio.volume = normalized;
            }

            // Auto-start if user drags slider and engine is paused
            if (!this.isPlaying && normalized > 0) {
                this.resumeAll();
            }
        }
    }

    toggleMute(channel) {
        if (this.channels[channel]) {
            this.channels[channel].isMuted = !this.channels[channel].isMuted;
            this.channels[channel].audio.volume = this.channels[channel].isMuted ? 0 : this.channels[channel].volume;
            return this.channels[channel].isMuted;
        }
        return false;
    }

    resumeAll() {
        this.isPlaying = true;
        UIRenderer.updateMixerStatus('Playing');
        for (const key in this.channels) {
            // Only play if volume > 0 to save resources, or just play all silent?
            // Better to play all so fading in works instantly
            this.channels[key].audio.play().catch(e => console.warn('Autoplay prevented:', e));
        }
    }

    pauseAll() {
        this.isPlaying = false;
        UIRenderer.updateMixerStatus('Paused');
        for (const key in this.channels) {
            this.channels[key].audio.pause();
        }
    }
}
