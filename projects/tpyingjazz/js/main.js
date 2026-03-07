/**
 * typing-jazz/js/main.js
 * 
 * Orchestrates the application logic, UI updates, and initialization.
 */

import { audioEngine } from './audio-engine.js';
import { keyboardHandler } from './keyboard-handler.js';
import { PROGRESSIONS, SENTIMENT_MAP } from './scales.js';
import { Visualizer } from './visualizer.js';
import { Recorder } from './recorder.js';
import { ThemeManager } from './theme-manager.js';

class TypingJazzApp {
    constructor() {
        this.dom = {
            overlay: document.getElementById('overlay'),
            initBtn: document.getElementById('init-audio'),
            textInput: document.getElementById('jazz-input'),
            scaleDisplay: document.getElementById('current-scale'),
            bpmDisplay: document.getElementById('typing-bpm'),
            moodDisplay: document.getElementById('current-mood'),
            canvas: document.getElementById('audio-visualizer'),
            piano: document.getElementById('piano-view'),

            // New Controls
            resetBtn: document.getElementById('start-btn'),
            themeBtn: document.getElementById('theme-toggle'),
            recordBtn: document.getElementById('record-toggle'),
            playBtn: document.getElementById('playback-btn'),
            exportBtn: document.getElementById('export-btn')
        };

        this.ctx = this.dom.canvas.getContext('2d');
        this.visualizer = new Visualizer(this.dom.canvas, this.ctx);
        this.recorder = new Recorder();
        this.themeManager = new ThemeManager();

        this.charCount = 0;
        this.startTime = null;
        this.metronomeInterval = null;
        this.bpm = 120;

        this.init();
    }

    init() {
        this.dom.initBtn.addEventListener('click', () => this.startApp());

        // Control Listeners
        this.dom.resetBtn?.addEventListener('click', () => this.resetSession());
        this.dom.themeBtn?.addEventListener('click', () => this.themeManager.cycle());
        this.dom.recordBtn?.addEventListener('click', () => this.toggleRecording());
        this.dom.playBtn?.addEventListener('click', () => this.startPlayback());
        this.dom.exportBtn?.addEventListener('click', () => this.exportSession());

        // Generate piano keys
        this.renderPiano();

        // Setup keyboard handler callbacks
        keyboardHandler.onKeyPress = (key, index) => this.handleKeyPress(key, index);

        // Responsive canvas
        window.addEventListener('resize', () => this.resizeCanvas());
        this.resizeCanvas();
    }

    toggleRecording() {
        if (this.recorder.isRecording) {
            this.recorder.stop();
            this.dom.recordBtn.textContent = 'Record Jam';
            this.dom.recordBtn.classList.remove('recording');
        } else {
            this.recorder.start();
            this.dom.recordBtn.textContent = 'Stop Recording';
            this.dom.recordBtn.classList.add('recording');
        }
    }

    startPlayback() {
        if (this.recorder.isPlaying) return;
        this.recorder.play((event) => {
            if (event.type === 'note') {
                audioEngine.triggerNote(event.data.freq);
                this.handleVisualFeedback(event.data.index);
            }
        });
    }

    exportSession() {
        const data = this.recorder.export();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `jazz-session-${Date.now()}.json`;
        a.click();
    }

    renderPiano() {
        this.dom.piano.innerHTML = '';
        for (let i = 0; i < 40; i++) {
            const key = document.createElement('div');
            key.className = 'piano-key';
            key.id = `key-${i}`;
            this.dom.piano.appendChild(key);
        }
    }

    async startApp() {
        await audioEngine.init();
        this.dom.overlay.classList.remove('visible');
        this.dom.textInput.focus();

        if (!this.startTime) this.startTime = performance.now();

        // Start Metronome
        this.metronomeInterval = setInterval(() => this.pulseMetronome(), (60 / this.bpm) * 1000);

        this.loop();
    }

    pulseMetronome() {
        this.visualizer.triggerPulse();
        // Optional: play a soft percussive click? 
        // audioEngine.triggerPercussion(); 
    }

    resizeCanvas() {
        this.dom.canvas.width = this.dom.canvas.offsetWidth * window.devicePixelRatio;
        this.dom.canvas.height = this.dom.canvas.offsetHeight * window.devicePixelRatio;
    }

    handleKeyPress(key, index) {
        this.charCount++;

        // Sentiment Analysis logic
        this.checkSentiment(this.dom.textInput.value);

        this.updateStats();

        // Execute Audio
        const currentProg = PROGRESSIONS[keyboardHandler.progressionIndex];
        const root = currentProg.baseNote + '3';
        const freq = getFrequencyFromScale(currentProg.scale, root, index);

        audioEngine.triggerNote(freq);

        // Record
        this.recorder.recordEvent('note', { key, index, freq });

        // Visuals
        this.handleVisualFeedback(index);
    }

    resetSession() {
        this.dom.textInput.value = '';
        this.charCount = 0;
        this.startTime = performance.now();
        this.updateStats();
        console.log('Session Reset');
    }

    checkSentiment(text) {
        const words = text.toLowerCase().split(/\s+/);
        const lastWord = words[words.length - 1];

        if (SENTIMENT_MAP[lastWord]) {
            const newScale = SENTIMENT_MAP[lastWord];
            this.dom.moodDisplay.textContent = lastWord.charAt(0).toUpperCase() + lastWord.slice(1);
            // We could override the scale here if we wanted
            // keyboardHandler.overrideScale = newScale;
        }
    }

    handleVisualFeedback(index) {
        this.triggerKeyAnimation(index);

        const x = (index / 40) * this.dom.canvas.width;
        const y = this.dom.canvas.height - 40;
        this.visualizer.addParticle(x, y);
        this.visualizer.addWave(y - 100, Math.random() * 50 + 20);
    }

    triggerKeyAnimation(index) {
        const keyEl = document.getElementById(`key-${index}`);
        if (keyEl) {
            keyEl.classList.add('active');
            setTimeout(() => keyEl.classList.remove('active'), 150);
        }
    }

    updateStats() {
        const currentProg = PROGRESSIONS[keyboardHandler.progressionIndex];
        this.dom.scaleDisplay.textContent = currentProg.scale.charAt(0).toUpperCase() + currentProg.scale.slice(1);

        if (this.startTime) {
            const elapsedMins = (performance.now() - this.startTime) / 60000;
            if (elapsedMins > 0) {
                const cpm = Math.floor(this.charCount / elapsedMins);
                this.dom.bpmDisplay.textContent = cpm;
            }
        }
    }

    triggerSpark(index) {
        // To be implemented in visualizer.js or here
        // For now, just log
    }

    loop() {
        // Clear background with trail effect
        const w = this.dom.canvas.width;
        const h = this.dom.canvas.height;

        this.ctx.fillStyle = 'rgba(13, 13, 15, 0.4)';
        this.ctx.fillRect(0, 0, w, h);

        this.visualizer.update();
        this.visualizer.draw();

        requestAnimationFrame(() => this.loop());
    }
}

// Global start
window.addEventListener('DOMContentLoaded', () => {
    window.app = new TypingJazzApp();
});
