export class AudioEngine {
    constructor() {
        this.context = null;
        this.analyzer = null;
        this.dataArray = null;
        this.isInitialized = false;
        this.synthOscillators = [];
        this.micSource = null;
        this.inputType = 'NONE'; // 'MIC' or 'SYNTH'
    }

    async init() {
        if (this.isInitialized) return;

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.context = new AudioContext();

        if (this.context.state === 'suspended') {
            await this.context.resume();
        }

        this.analyzer = this.context.createAnalyser();
        // fftSize 2048 gives us 1024 bins. at 44.1kHz, each bin is ~21.5Hz
        this.analyzer.fftSize = 2048;
        this.analyzer.smoothingTimeConstant = 0.85; // Smooths out the data

        const bufferLength = this.analyzer.frequencyBinCount;
        this.dataArray = new Uint8Array(bufferLength);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.micSource = this.context.createMediaStreamSource(stream);
            this.micSource.connect(this.analyzer);
            this.isInitialized = true;
            this.inputType = 'MIC';
            console.log('Audio Engine: Microphone Connected');
        } catch (err) {
            console.warn('Microphone access denied or unavailable. Switching to Synth Mode.', err);
            this.initSynthMode();
        }
    }

    initSynthMode() {
        this.inputType = 'SYNTH';
        this.isInitialized = true;
        // Create a GainNode to control master volume of synth
        this.masterGain = this.context.createGain();
        this.masterGain.gain.value = 0.3;
        this.masterGain.connect(this.analyzer);
        this.analyzer.connect(this.context.destination); // Connect to speakers so we can hear it

        console.log('Audio Engine: Synth Mode Active. Use Keyboard to play.');

        // Simple Keyboard binding for testing
        window.addEventListener('keydown', (e) => this.playSynthNote(e.key.toLowerCase()));
        window.addEventListener('keyup', (e) => this.stopSynthNote(e.key.toLowerCase()));
    }

    playSynthNote(key) {
        if (this.synthOscillators[key]) return; // Already playing

        const osc = this.context.createOscillator();
        const gain = this.context.createGain();

        // Map keys to frequencies
        // Z,X,C = Bass (Push)
        // I,O,P = High (Lift)
        let freq = 0;

        // Bass keys
        if (key === 'z') freq = 60; // Low bass
        if (key === 'x') freq = 100;
        if (key === 'c') freq = 150;

        // Treble keys
        if (key === 'i') freq = 2000;
        if (key === 'o') freq = 3000;
        if (key === 'p') freq = 4000;

        // Mids/Harmonics
        if (key === 'a') freq = 440; // A4

        if (freq === 0) return;

        osc.type = freq < 200 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, this.context.currentTime);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();

        // Envelope
        gain.gain.setValueAtTime(0, this.context.currentTime);
        gain.gain.linearRampToValueAtTime(1, this.context.currentTime + 0.1);

        this.synthOscillators[key] = { osc, gain };
    }

    stopSynthNote(key) {
        if (!this.synthOscillators[key]) return;

        const { osc, gain } = this.synthOscillators[key];

        // Release envelope
        gain.gain.cancelScheduledValues(this.context.currentTime);
        gain.gain.setValueAtTime(gain.gain.value, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.1);

        osc.stop(this.context.currentTime + 0.1);

        delete this.synthOscillators[key];
    }

    analyze() {
        if (!this.isInitialized) return { bass: 0, treble: 0, mids: 0 };

        this.analyzer.getByteFrequencyData(this.dataArray);

        // Analyze frequency bins
        // 0-200Hz. Bin resolution ~21.5Hz. So bins 0 to ~9
        let bassEnergy = 0;
        for (let i = 0; i < 10; i++) {
            bassEnergy += this.dataArray[i];
        }
        bassEnergy = bassEnergy / 10 / 255; // Normalize 0-1

        // 2000Hz+. 2000/21.5 ~= 93. 
        let trebleEnergy = 0;
        let trebleCount = 0;
        for (let i = 93; i < 300; i++) { // Analyze up to ~6kHz
            trebleEnergy += this.dataArray[i];
            trebleCount++;
        }
        trebleEnergy = trebleEnergy / trebleCount / 255;

        // Mids Check (optional for now)

        // Thresholds to cut out noise
        if (bassEnergy < 0.02) bassEnergy = 0;
        if (trebleEnergy < 0.02) trebleEnergy = 0;

        return {
            bass: Math.min(bassEnergy * 3.0, 1.0), // Boost signal
            treble: Math.min(trebleEnergy * 3.0, 1.0)
        };
    }
}
