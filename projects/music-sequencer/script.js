// Music Pattern Sequencer - Main Script
// Uses Web Audio API for sound synthesis and precise timing

class MusicSequencer {
    constructor() {
        this.audioContext = null;
        this.isPlaying = false;
        this.currentStep = 0;
        this.tempo = 120;
        this.swing = 0;
        this.steps = 16;
        this.numChannels = 6;
        
        // Channels configuration
        this.channels = [
            { name: 'Kick', sound: 'kick', color: 'kick', volume: 1, pan: 0, muted: false, solo: false },
            { name: 'Snare', sound: 'snare', color: 'snare', volume: 1, pan: 0, muted: false, solo: false },
            { name: 'Hi-Hat', sound: 'hihat', color: 'hihat', volume: 0.8, pan: 0, muted: false, solo: false },
            { name: 'Open Hat', sound: 'openhat', color: 'openhat', volume: 0.7, pan: 0, muted: false, solo: false },
            { name: 'Clap', sound: 'clap', color: 'clap', volume: 0.9, pan: 0, muted: false, solo: false },
            { name: 'Perc', sound: 'perc', color: 'perc', volume: 0.8, pan: 0, muted: false, solo: false }
        ];
        
        // Pattern storage (8 patterns, each with 16 steps x 6 channels)
        this.patterns = this.createEmptyPatterns();
        
        // Effects
        this.reverbMix = 0.2;
        this.delayMix = 0;
        this.delayTime = 0.25;
        this.masterVolume = 0.8;
        
        // Audio nodes
        this.masterGain = null;
        this.reverbNode = null;
        this.delayNode = null;
        this.compressor = null;
        
        this.init();
    }
    
    createEmptyPatterns() {
        const patterns = [];
        for (let p = 0; p < 8; p++) {
            const pattern = [];
            for (let c = 0; c < this.numChannels; c++) {
                pattern.push(new Array(this.steps).fill(false));
            }
            patterns.push(pattern);
        }
        return patterns;
    }
    
    init() {
        this.initUI();
        this.initAudio();
        this.renderGrid();
        this.bindEvents();
    }
    
    initUI() {
        this.channelLabels = document.getElementById('channelLabels');
        this.stepGrid = document.getElementById('stepGrid');
        this.channelControls = document.getElementById('channelControls');
        this.playBtn = document.getElementById('playBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.tempoSlider = document.getElementById('tempoSlider');
        this.tempoValue = document.getElementById('tempoValue');
        this.swingSlider = document.getElementById('swingSlider');
        this.swingValue = document.getElementById('swingValue');
    }
    
    async initAudio() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create master gain
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = this.masterVolume;
        
        // Create compressor for better sound
        this.compressor = this.audioContext.createDynamicsCompressor();
        this.compressor.threshold.value = -24;
        this.compressor.knee.value = 30;
        this.compressor.ratio.value = 12;
        this.compressor.attack.value = 0.003;
        this.compressor.release.value = 0.25;
        
        // Create reverb (convolution)
        this.reverbNode = this.audioContext.createConvolver();
        await this.createReverbImpulse();
        
        // Create delay
        this.delayNode = this.audioContext.createDelay(1);
        this.delayNode.delayTime.value = this.delayTime;
        
        // Create dry/wet mix for reverb
        this.reverbDryGain = this.audioContext.createGain();
        this.reverbWetGain = this.audioContext.createGain();
        this.reverbDryGain.gain.value = 1 - this.reverbMix;
        this.reverbWetGain.gain.value = this.reverbMix;
        
        // Create dry/wet mix for delay
        this.delayDryGain = this.audioContext.createGain();
        this.delayWetGain = this.audioContext.createGain();
        this.delayDryGain.gain.value = 1 - this.delayMix;
        this.delayWetGain.gain.value = this.delayMix;
        
        // Connect audio graph
        this.masterGain.connect(this.compressor);
        this.compressor.connect(this.audioContext.destination);
        
        // Reverb routing
        this.masterGain.connect(this.reverbDryGain);
        this.masterGain.connect(this.reverbNode);
        this.reverbNode.connect(this.reverbWetGain);
        this.reverbDryGain.connect(this.audioContext.destination);
        this.reverbWetGain.connect(this.audioContext.destination);
        
        // Delay routing
        this.masterGain.connect(this.delayDryGain);
        this.masterGain.connect(this.delayNode);
        this.delayNode.connect(this.delayWetGain);
        this.delayWetGain.connect(this.audioContext.destination);
        this.delayDryGain.connect(this.audioContext.destination);
        this.delayNode.connect(this.delayNode); // Feedback
    }
    
    async createReverbImpulse() {
        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * 2; // 2 seconds reverb
        const impulse = this.audioContext.createBuffer(2, length, sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
            }
        }
        
        this.reverbNode.buffer = impulse;
    }
    
    renderGrid() {
        const pattern = this.patterns[0];
        
        // Render channel labels
        this.channelLabels.innerHTML = '';
        this.channels.forEach((channel, index) => {
            const label = document.createElement('div');
            label.className = 'channel-label';
            label.innerHTML = `
                <span class="name"><i class="ri-volume-up-fill"></i> ${channel.name}</span>
                <div class="controls">
                    <button class="mute-btn ${channel.muted ? 'active' : ''}" data-channel="${index}">M</button>
                    <button class="solo-btn ${channel.solo ? 'active' : ''}" data-channel="${index}">S</button>
                </div>
            `;
            this.channelLabels.appendChild(label);
        });
        
        // Render step grid
        this.stepGrid.innerHTML = '';
        for (let channelIndex = 0; channelIndex < this.numChannels; channelIndex++) {
            for (let stepIndex = 0; stepIndex < this.steps; stepIndex++) {
                const step = document.createElement('div');
                step.className = `step ${this.channels[channelIndex].color}`;
                if (pattern[channelIndex][stepIndex]) {
                    step.classList.add('active');
                }
                step.dataset.channel = channelIndex;
                step.dataset.step = stepIndex;
                step.addEventListener('click', () => this.toggleStep(channelIndex, stepIndex));
                this.stepGrid.appendChild(step);
            }
        }
        
        // Bind mute/solo buttons
        this.bindMuteSoloButtons();
    }
    
    bindMuteSoloButtons() {
        document.querySelectorAll('.mute-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const channelIndex = parseInt(e.target.dataset.channel);
                this.channels[channelIndex].muted = !this.channels[channelIndex].muted;
                e.target.classList.toggle('active');
            });
        });
        
        document.querySelectorAll('.solo-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const channelIndex = parseInt(e.target.dataset.channel);
                this.channels[channelIndex].solo = !this.channels[channelIndex].solo;
                e.target.classList.toggle('active');
            });
        });
    }
    
    toggleStep(channelIndex, stepIndex) {
        const pattern = this.patterns[0];
        pattern[channelIndex][stepIndex] = !pattern[channelIndex][stepIndex];
        
        const stepElement = this.stepGrid.querySelector(
            `.step[data-channel="${channelIndex}"][data-step="${stepIndex}"]`
        );
        stepElement.classList.toggle('active');
    }
    
    bindEvents() {
        this.playBtn.addEventListener('click', () => this.togglePlay());
        this.stopBtn.addEventListener('click', () => this.stop());
        this.clearBtn.addEventListener('click', () => this.clearPattern());
        
        this.tempoSlider.addEventListener('input', (e) => {
            this.tempo = parseInt(e.target.value);
            this.tempoValue.textContent = `${this.tempo} BPM`;
            if (this.isPlaying) {
                this.stop();
                this.play();
            }
        });
        
        this.swingSlider.addEventListener('input', (e) => {
            this.swing = parseInt(e.target.value);
            this.swingValue.textContent = `${this.swing}%`;
        });
        
        // Effects controls
        document.getElementById('reverbMix').addEventListener('input', (e) => {
            this.reverbMix = parseInt(e.target.value) / 100;
            document.getElementById('reverbMixValue').textContent = `${e.target.value}%`;
            this.reverbDryGain.gain.value = 1 - this.reverbMix;
            this.reverbWetGain.gain.value = this.reverbMix;
        });
        
        document.getElementById('delayMix').addEventListener('input', (e) => {
            this.delayMix = parseInt(e.target.value) / 100;
            document.getElementById('delayMixValue').textContent = `${e.target.value}%`;
            this.delayDryGain.gain.value = 1 - this.delayMix;
            this.delayWetGain.gain.value = this.delayMix;
        });
        
        document.getElementById('delayTime').addEventListener('input', (e) => {
            this.delayTime = parseInt(e.target.value) / 1000;
            document.getElementById('delayTimeValue').textContent = `${e.target.value}ms`;
            this.delayNode.delayTime.value = this.delayTime;
        });
        
        document.getElementById('masterVolume').addEventListener('input', (e) => {
            this.masterVolume = parseInt(e.target.value) / 100;
            document.getElementById('masterVolumeValue').textContent = `${e.target.value}%`;
            this.masterGain.gain.value = this.masterVolume;
        });
        
        // Pattern controls
        document.getElementById('patternSelect').addEventListener('change', (e) => {
            this.loadPattern(parseInt(e.target.value));
        });
        
        document.getElementById('savePatternBtn').addEventListener('click', () => {
            this.saveCurrentPattern();
        });
        
        document.getElementById('loadPatternBtn').addEventListener('click', () => {
            this.loadPattern(parseInt(document.getElementById('patternSelect').value));
        });
        
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportPattern();
        });
    }
    
    togglePlay() {
        if (this.isPlaying) {
            this.stop();
        } else {
            this.play();
        }
    }
    
    play() {
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        this.isPlaying = true;
        this.playBtn.innerHTML = '<i class="ri-pause-fill"></i> Pause';
        this.scheduleNextStep();
    }
    
    stop() {
        this.isPlaying = false;
        this.currentStep = 0;
        this.playBtn.innerHTML = '<i class="ri-play-fill"></i> Play';
        this.clearPlaybackCursor();
    }
    
    clearPattern() {
        const pattern = this.patterns[0];
        for (let c = 0; c < this.numChannels; c++) {
            for (let s = 0; s < this.steps; s++) {
                pattern[c][s] = false;
            }
        }
        this.renderGrid();
    }
    
    scheduleNextStep() {
        if (!this.isPlaying) return;
        
        const secondsPerBeat = 60 / this.tempo;
        const secondsPerStep = secondsPerBeat / 4; // 16th notes
        
        // Apply swing
        let stepDelay = secondsPerStep;
        if (this.currentStep % 2 === 1) {
            stepDelay += (this.swing / 100) * secondsPerStep;
        }
        
        const nextStepTime = this.audioContext.currentTime + stepDelay;
        
        // Schedule the step
        this.scheduleStep(this.currentStep, nextStepTime);
        
        // Update UI
        setTimeout(() => {
            this.updatePlaybackCursor(this.currentStep);
        }, (stepDelay - 0.05) * 1000);
        
        // Schedule next step
        this.currentStep = (this.currentStep + 1) % this.steps;
        
        setTimeout(() => {
            this.scheduleNextStep();
        }, stepDelay * 1000);
    }
    
    scheduleStep(step, time) {
        const pattern = this.patterns[0];
        
        // Check if any channel is soloed
        const anySolo = this.channels.some(ch => ch.solo);
        
        this.channels.forEach((channel, channelIndex) => {
            // Skip if muted, or if solo is active and this channel isn't soloed
            if (channel.muted) return;
            if (anySolo && !channel.solo) return;
            
            if (pattern[channelIndex][step]) {
                this.playSound(channel.sound, time, channel.volume, channel.pan);
            }
        });
    }
    
    playSound(soundType, time, volume = 1, pan = 0) {
        switch (soundType) {
            case 'kick':
                this.playKick(time, volume, pan);
                break;
            case 'snare':
                this.playSnare(time, volume, pan);
                break;
            case 'hihat':
                this.playHiHat(time, volume, pan);
                break;
            case 'openhat':
                this.playOpenHat(time, volume, pan);
                break;
            case 'clap':
                this.playClap(time, volume, pan);
                break;
            case 'perc':
                this.playPerc(time, volume, pan);
                break;
        }
    }
    
    playKick(time, volume, pan) {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const panner = this.audioContext.createStereoPanner();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(30, time + 0.15);
        
        gain.gain.setValueAtTime(volume, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
        
        panner.pan.value = pan;
        
        osc.connect(gain);
        gain.connect(panner);
        panner.connect(this.masterGain);
        
        osc.start(time);
        osc.stop(time + 0.3);
    }
    
    playSnare(time, volume, pan) {
        // Noise component
        const bufferSize = this.audioContext.sampleRate * 0.2;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;
        
        const noiseFilter = this.audioContext.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.value = 1000;
        
        const noiseGain = this.audioContext.createGain();
        noiseGain.gain.setValueAtTime(volume * 0.7, time);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
        
        const panner = this.audioContext.createStereoPanner();
        panner.pan.value = pan;
        
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(panner);
        panner.connect(this.masterGain);
        
        // Tone component
        const osc = this.audioContext.createOscillator();
        const oscGain = this.audioContext.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, time);
        osc.frequency.exponentialRampToValueAtTime(100, time + 0.05);
        
        oscGain.gain.setValueAtTime(volume * 0.5, time);
        oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
        
        osc.connect(oscGain);
        oscGain.connect(panner);
        
        noise.start(time);
        noise.stop(time + 0.2);
        osc.start(time);
        osc.stop(time + 0.1);
    }
    
    playHiHat(time, volume, pan) {
        const bufferSize = this.audioContext.sampleRate * 0.05;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;
        
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 7000;
        
        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(volume * 0.5, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
        
        const panner = this.audioContext.createStereoPanner();
        panner.pan.value = pan;
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(panner);
        panner.connect(this.masterGain);
        
        noise.start(time);
        noise.stop(time + 0.05);
    }
    
    playOpenHat(time, volume, pan) {
        const bufferSize = this.audioContext.sampleRate * 0.3;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;
        
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 6000;
        
        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(volume * 0.4, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
        
        const panner = this.audioContext.createStereoPanner();
        panner.pan.value = pan;
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(panner);
        panner.connect(this.masterGain);
        
        noise.start(time);
        noise.stop(time + 0.3);
    }
    
    playClap(time, volume, pan) {
        // Multiple noise bursts for clap effect
        for (let i = 0; i < 3; i++) {
            const bufferSize = this.audioContext.sampleRate * 0.02;
            const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const data = buffer.getChannelData(0);
            
            for (let j = 0; j < bufferSize; j++) {
                data[j] = Math.random() * 2 - 1;
            }
            
            const noise = this.audioContext.createBufferSource();
            noise.buffer = buffer;
            
            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 2500;
            filter.Q.value = 1;
            
            const gain = this.audioContext.createGain();
            const startTime = time + i * 0.01;
            gain.gain.setValueAtTime(volume * (i === 2 ? 0.8 : 0.4), startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.02);
            
            const panner = this.audioContext.createStereoPanner();
            panner.pan.value = pan;
            
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(panner);
            panner.connect(this.masterGain);
            
            noise.start(startTime);
            noise.stop(startTime + 0.02);
        }
        
        // Reverb tail
        const reverbTime = time + 0.03;
        const bufferSize = this.audioContext.sampleRate * 0.15;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;
        
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1500;
        
        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(volume * 0.3, reverbTime);
        gain.gain.exponentialRampToValueAtTime(0.001, reverbTime + 0.15);
        
        const panner = this.audioContext.createStereoPanner();
        panner.pan.value = pan;
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(panner);
        panner.connect(this.masterGain);
        
        noise.start(reverbTime);
        noise.stop(reverbTime + 0.15);
    }
    
    playPerc(time, volume, pan) {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        const panner = this.audioContext.createStereoPanner();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, time);
        osc.frequency.exponentialRampToValueAtTime(200, time + 0.1);
        
        filter.type = 'lowpass';
        filter.frequency.value = 3000;
        
        gain.gain.setValueAtTime(volume * 0.6, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
        
        panner.pan.value = pan;
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(panner);
        panner.connect(this.masterGain);
        
        osc.start(time);
        osc.stop(time + 0.15);
    }
    
    updatePlaybackCursor(step) {
        // Remove previous cursor
        this.clearPlaybackCursor();
        
        // Add playing class to current step column
        const steps = this.stepGrid.querySelectorAll(`.step[data-step="${step}"]`);
        steps.forEach(s => s.classList.add('playing'));
    }
    
    clearPlaybackCursor() {
        const playingSteps = this.stepGrid.querySelectorAll('.step.playing');
        playingSteps.forEach(s => s.classList.remove('playing'));
    }
    
    saveCurrentPattern() {
        const patternIndex = parseInt(document.getElementById('patternSelect').value);
        this.patterns[patternIndex] = JSON.parse(JSON.stringify(this.patterns[0]));
        alert('Pattern saved!');
    }
    
    loadPattern(patternIndex) {
        this.patterns[0] = JSON.parse(JSON.stringify(this.patterns[patternIndex]));
        this.renderGrid();
    }
    
    exportPattern() {
        const data = {
            tempo: this.tempo,
            swing: this.swing,
            channels: this.channels.map(ch => ({
                name: ch.name,
                volume: ch.volume,
                pan: ch.pan,
                muted: ch.muted,
                solo: ch.solo
            })),
            pattern: this.patterns[0],
            effects: {
                reverbMix: this.reverbMix,
                delayMix: this.delayMix,
                delayTime: this.delayTime,
                masterVolume: this.masterVolume
            }
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'music-pattern.json';
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Initialize the sequencer when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.sequencer = new MusicSequencer();
});
