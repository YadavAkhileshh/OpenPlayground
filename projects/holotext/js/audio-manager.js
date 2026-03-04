/**
 * AudioManager
 * Synthesizes simple UI sounds using Web Audio API.
 * Adds a low hum for the hologram "power" effect.
 */
class AudioManager {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.humOsc = null;
        this.humGain = null;
        this.isMuted = false;
        this.initialized = false;
    }

    init() {
        // AudioContext must be resumed on user interaction
        document.addEventListener('click', () => {
            if (!this.initialized) {
                this.setupAudio();
            }
        }, { once: true });
    }

    setupAudio() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.3; // Low volume
        this.masterGain.connect(this.ctx.destination);

        // Start ambient hum
        this.startHum();

        this.initialized = true;
        console.log('Audio System Initialized');
    }

    startHum() {
        // Create a low frequency drone
        this.humOsc = this.ctx.createOscillator();
        this.humOsc.type = 'sawtooth';
        this.humOsc.frequency.value = 50;

        // Filter it
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 120;

        this.humGain = this.ctx.createGain();
        this.humGain.gain.value = 0.05;

        this.humOsc.connect(filter);
        filter.connect(this.humGain);
        this.humGain.connect(this.masterGain);

        this.humOsc.start();

        // Modulate pitch slightly based on mouse Y later?
    }

    playClick() {
        if (!this.initialized || this.isMuted) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    playHover() {
        if (!this.initialized || this.isMuted) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(600, this.ctx.currentTime + 0.05);

        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.05);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    }

    update() {
        // Optional: Modulate hum based on glitch state
        if (this.initialized && this.humOsc) {
            if (State.runtime.isGlitching) {
                this.humOsc.frequency.setValueAtTime(Utils.randomInt(40, 150), this.ctx.currentTime);
            } else {
                // Smooth return to 50
                this.humOsc.frequency.setTargetAtTime(50, this.ctx.currentTime, 0.1);
            }
        }
    }
}
