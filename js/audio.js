// ===============================
// Audio Feedback System
// Uses Web Audio API for synthesized sounds
// ===============================

class AudioManager {
    constructor() {
        this.context = null;
        this.isEnabled = true;
        this.masterGain = null;
        this.init();
    }

    init() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.context = new AudioContext();
                this.masterGain = this.context.createGain();
                this.masterGain.gain.value = 0.1; // Low volume by default
                this.masterGain.connect(this.context.destination);
                console.log('🔊 Audio Manager Initialized');
            }
        } catch (e) {
            console.warn('AudioContext not supported', e);
            this.isEnabled = false;
        }

        // Resume audio context on first user interaction
        ['click', 'keydown', 'touchstart'].forEach(event => {
            document.addEventListener(event, () => this.resumeContext(), { once: true });
        });
    }

    resumeContext() {
        if (this.context && this.context.state === 'suspended') {
            this.context.resume();
        }
    }

    toggle(enabled) {
        this.isEnabled = enabled;
        console.log(`Audio ${enabled ? 'enabled' : 'disabled'}`);
    }

    // Play a short high-pitched beep for hover
    playHover() {
        if (!this.isEnabled || !this.context) return;
        this.resumeContext();

        const osc = this.context.createOscillator();
        const gain = this.context.createGain();

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, this.context.currentTime); // Start freq
        osc.frequency.exponentialRampToValueAtTime(600, this.context.currentTime + 0.05); // Slide up

        gain.gain.setValueAtTime(0.05, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.05);

        osc.start();
        osc.stop(this.context.currentTime + 0.05);
    }

    // Play a distinct click sound
    playClick() {
        if (!this.isEnabled || !this.context) return;
        this.resumeContext();

        const osc = this.context.createOscillator();
        const gain = this.context.createGain();

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, this.context.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.context.currentTime + 0.1);

        gain.gain.setValueAtTime(0.1, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.1);

        osc.start();
        osc.stop(this.context.currentTime + 0.1);
    }

    // Play a success chime (e.g., for bookmark)
    playSuccess() {
        if (!this.isEnabled || !this.context) return;
        this.resumeContext();

        const now = this.context.currentTime;

        // Note 1
        const osc1 = this.context.createOscillator();
        const gain1 = this.context.createGain();
        osc1.connect(gain1);
        gain1.connect(this.masterGain);

        osc1.type = 'sine';
        osc1.frequency.value = 523.25; // C5
        gain1.gain.setValueAtTime(0.1, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc1.start(now);
        osc1.stop(now + 0.3);

        // Note 2
        const osc2 = this.context.createOscillator();
        const gain2 = this.context.createGain();
        osc2.connect(gain2);
        gain2.connect(this.masterGain);

        osc2.type = 'sine';
        osc2.frequency.value = 659.25; // E5
        gain2.gain.setValueAtTime(0.1, now + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc2.start(now + 0.1);
        osc2.stop(now + 0.4);
    }

    // Play an error/cancel sound
    playError() {
        if (!this.isEnabled || !this.context) return;
        this.resumeContext();

        const osc = this.context.createOscillator();
        const gain = this.context.createGain();

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, this.context.currentTime);
        osc.frequency.linearRampToValueAtTime(100, this.context.currentTime + 0.15);

        gain.gain.setValueAtTime(0.1, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.15);

        osc.start();
        osc.stop(this.context.currentTime + 0.15);
    }
}

// Global instance
window.audioManager = new AudioManager();
