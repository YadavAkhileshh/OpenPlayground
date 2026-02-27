/**
 * InterfaceManager
 * Coordinates UI events, playback scheduling, and visual updates.
 */
import { DNAEncoder } from './encoder.js';
import { MusicTheory } from './theory.js';
import { BioSynth } from './synth.js';
import { HelixVisualizer } from './visualizer.js';
import { CONFIG } from './constants.js';

export class InterfaceManager {
    constructor() {
        // DOM Elements
        this.els = {
            input: document.getElementById('TextInput'),
            playBtn: document.getElementById('PlayBtn'),
            stopBtn: document.getElementById('StopBtn'),
            tempoSlider: document.getElementById('TempoSlider'),
            tempoValue: document.getElementById('TempoValue'),
            binaryOutput: document.getElementById('BinaryOutput'),
            currentCodon: document.getElementById('CurrentCodon'),
            aminoAcid: document.getElementById('AminoAcid'),
            chordDisplayName: document.querySelector('#ChordDisplay .chord-name'),
            chordDisplayNotes: document.querySelector('#ChordDisplay .chord-notes'),
            sequenceStrip: document.getElementById('SequenceStrip'),
            charCount: document.querySelector('.char-count'),
            statusDot: document.querySelector('.status-dot'),
            statusText: document.querySelector('.status-text'),
            canvas: document.getElementById('HelixCanvas'),
            themeToggle: document.getElementById('ThemeToggle')
        };

        // State
        this.isPlaying = false;
        this.bpm = 120;
        this.sequence = [];
        this.currentIndex = 0;
        this.nextNoteTime = 0;
        this.lookahead = 25.0; // ms
        this.scheduleAheadTime = 0.1; // seconds
        this.timerID = null;
        this.themeIndex = 0;
        this.themes = ['', 'theme-light', 'theme-matrix'];

        // Modules
        this.encoder = new DNAEncoder();
        this.theory = new MusicTheory();
        this.synth = new BioSynth();
        this.visualizer = new HelixVisualizer(this.els.canvas);

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateCharCount();
        console.log("Interface Manager Initialized");
    }

    setupEventListeners() {
        // Play Button
        this.els.playBtn.addEventListener('click', async () => {
            if (this.isPlaying) return;

            const text = this.els.input.value.trim();
            if (!text) {
                alert("Please enter some genetic source text.");
                return;
            }

            await this.synth.init();
            await this.synth.resume();

            this.prepareSequence(text);
            this.startPlayback();
        });

        // Stop Button
        this.els.stopBtn.addEventListener('click', () => {
            this.stopPlayback();
        });

        // Tempo Slider
        this.els.tempoSlider.addEventListener('input', (e) => {
            this.bpm = parseInt(e.target.value);
            this.els.tempoValue.textContent = this.bpm;
        });

        // Theme Toggle
        if (this.els.themeToggle) {
            this.els.themeToggle.addEventListener('click', () => {
                this.cycleTheme();
            });
        }

        // Input Handling
        this.els.input.addEventListener('input', () => {
            this.updateCharCount();

            // Real-time binary preview (optional optimization: debounce this)
            const text = this.els.input.value;
            if (text.length > 0) {
                const bin = text.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
                this.els.binaryOutput.textContent = bin.substring(0, 50) + (bin.length > 50 ? '...' : '');
            } else {
                this.els.binaryOutput.textContent = '--';
            }
        });
    }

    cycleTheme() {
        // Remove current theme class
        if (this.themes[this.themeIndex]) {
            document.body.classList.remove(this.themes[this.themeIndex]);
        }

        // Next theme
        this.themeIndex = (this.themeIndex + 1) % this.themes.length;

        // Add new theme class
        if (this.themes[this.themeIndex]) {
            document.body.classList.add(this.themes[this.themeIndex]);
        }
    }

    updateCharCount() {
        const len = this.els.input.value.length;
        this.els.charCount.textContent = `${len} / 500`;
    }

    prepareSequence(text) {
        // 1. Encode Text -> Codons
        const rawSequence = this.encoder.encode(text);

        // 2. Map Codons -> Musical Chords
        this.sequence = rawSequence.map(step => {
            const chord = this.theory.getChord(step.note, step.quality, 3); // Base octave 3
            return {
                ...step,
                chordData: chord
            };
        });

        console.log("Sequence Prepared:", this.sequence);

        // 3. Update Visualizer
        this.visualizer.updateSequence(this.sequence);
        this.renderSequenceStrip();
    }

    renderSequenceStrip() {
        this.els.sequenceStrip.innerHTML = '';
        this.sequence.forEach((step, index) => {
            const span = document.createElement('span');
            span.textContent = step.codon;
            span.className = 'nucleotide';
            span.dataset.index = index;
            // Colorize letters
            // This is simplified, usually we'd color each base
            span.style.color = '#fff'; // Default
            this.els.sequenceStrip.appendChild(span);
        });
    }

    startPlayback() {
        this.isPlaying = true;
        this.currentIndex = 0;
        this.nextNoteTime = this.synth.ctx.currentTime + 0.1;

        this.updateUIState(true);
        this.scheduler(); // Start the loop
    }

    stopPlayback() {
        this.isPlaying = false;
        clearTimeout(this.timerID);
        this.synth.stopAll();
        this.updateUIState(false);
        this.resetVisuals();
    }

    updateUIState(playing) {
        this.els.playBtn.disabled = playing;
        this.els.stopBtn.disabled = !playing;
        this.els.input.disabled = playing;
        document.body.classList.toggle('playing', playing);

        if (playing) {
            this.els.statusText.textContent = "SEQUENCING...";
        } else {
            this.els.statusText.textContent = "SYSTEM READY";
        }
    }

    resetVisuals() {
        this.els.currentCodon.textContent = '---';
        this.els.aminoAcid.textContent = '---';
        this.els.chordDisplayName.textContent = 'WAITING FOR INPUT';
        this.els.chordDisplayNotes.textContent = '-- -- --';

        // Remove active classes
        const active = this.els.sequenceStrip.querySelector('.active');
        if (active) active.classList.remove('active');
    }

    /**
     * The Scheduler Loop
     * Use "Apply Lookahead" pattern from Web Audio API.
     */
    scheduler() {
        if (!this.isPlaying) return;

        // While there are notes that will need to play before the next interval,
        // schedule them and advance the pointer.
        while (this.nextNoteTime < this.synth.ctx.currentTime + this.scheduleAheadTime) {
            this.scheduleNote(this.currentIndex, this.nextNoteTime);
            this.advanceNote();
        }

        this.timerID = setTimeout(() => this.scheduler(), this.lookahead);
    }

    scheduleNote(index, time) {
        if (index >= this.sequence.length) {
            // End of sequence, loop or stop? Let's stop.
            // But we need to do it nicely.
            setTimeout(() => this.stopPlayback(), (time - this.synth.ctx.currentTime) * 1000 + 1000); // Wait for last note
            return;
        }

        const step = this.sequence[index];
        const duration = 60.0 / this.bpm; // Quarter note duration

        // Play Sound
        this.synth.playChord(step.chordData, duration, time);

        // Schedule Visual Updates (using draw callback synchronization is tricky, 
        // so we just use setTimeout to match audio time roughly)
        const timeUntilPlay = (time - this.synth.ctx.currentTime) * 1000;

        setTimeout(() => {
            if (!this.isPlaying) return;
            this.updateVisualsForStep(step, index);
        }, Math.max(0, timeUntilPlay));
    }

    advanceNote() {
        const secondsPerBeat = 60.0 / this.bpm;
        this.nextNoteTime += secondsPerBeat;
        this.currentIndex++;
    }

    updateVisualsForStep(step, index) {
        // Update Text Readouts
        this.els.currentCodon.textContent = step.codon;
        this.els.aminoAcid.textContent = `${step.amino} (${step.type})`;

        // Update Chord Display
        this.els.chordDisplayName.textContent = step.chordData.name;
        this.els.chordDisplayNotes.textContent = step.chordData.notes.join(' - ');

        // Update Sequence Strip
        const prev = this.els.sequenceStrip.querySelector(`.nucleotide[data-index="${index - 1}"]`);
        if (prev) prev.classList.remove('active');

        const current = this.els.sequenceStrip.querySelector(`.nucleotide[data-index="${index}"]`);
        if (current) {
            current.classList.add('active');
            current.scrollIntoView({ behavior: 'smooth', inline: 'center' });
        }

        // Update Canvas Visualizer
        this.visualizer.setActiveIndex(index);
        this.visualizer.setActivityLevel(1.0); // Pulse
    }
}
