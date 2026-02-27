/**
 * Audio System
 * 
 * A robust, library-free audio engine using the Web Audio API.
 * Handles both sound effects (SFX) and generative background music.
 * 
 * FEATURES:
 * - Oscillator-based sound synthesis (no external assets required).
 * - Gain node management for volume control.
 * - Procedural Music Generation:
 *   - Uses a pentatonic scale for pleasant randomness.
 *   - Implements a precise scheduling system (lookahead) to keep rhythm.
 *   - Generates bass drones and melody lines dynamically.
 */

class AudioSystem {
    /**
     * Create an AudioSystem instance.
     * Sets up the audio context and scheduling parameters.
     */
    constructor() {
        this.ctx = null;
        this.isMuted = false;

        // Master Volume Node
        this.masterGain = null;

        // Music State
        this.musicGain = null;
        this.nextNoteTime = 0; // When the next note is due.
        this.isPlayingMusic = false;
        this.tempo = 120; // Beats per minute
        this.lookahead = 25.0; // How frequently to call scheduling function (in milliseconds)
        this.scheduleAheadTime = 0.1; // How far ahead to schedule audio (in seconds)

        this.notesInQueue = [];
        this.currentNote = 0;

        // Scale: C Major Pentatonic (approx)
        // C4, D4, E4, G4, A4, C5
        this.scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];
    }

    /**
     * Initialize the Web Audio Context.
     * Must be called after a user interaction to unlock audio on modern browsers.
     */
    init() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();

            // Master Gain Setup
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = CONFIG.VOLUME;
            this.masterGain.connect(this.ctx.destination);

            // Music Sub-mix Setup
            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.value = 0.3; // Background level
            this.musicGain.connect(this.masterGain);

            console.log("Audio system initialized.");
        } catch (e) {
            console.warn("Web Audio API not supported", e);
        }
    }

    /**
     * Resume the audio context.
     * Browser autoplay policies often suspend contexts until user gesture.
     */
    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().then(() => {
                this.startMusic();
            });
        } else if (this.ctx && !this.isPlayingMusic) {
            this.startMusic();
        }
    }

    /**
     * Start the procedural music generator.
     */
    startMusic() {
        if (this.isPlayingMusic) return;
        this.isPlayingMusic = true;
        this.nextNoteTime = this.ctx.currentTime;
        this.scheduler();
    }

    /**
     * The scheduling loop.
     * Looks ahead and schedules notes for the near future.
     */
    scheduler() {
        if (!this.isPlayingMusic) return;

        // precise timing logic
        while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
            this.scheduleNote(this.currentNote, this.nextNoteTime);
            this.nextNote();
        }

        // Recursive call with setTimeout
        setTimeout(() => this.scheduler(), this.lookahead);
    }

    /**
     * Advance the beat pointer.
     */
    nextNote() {
        const secondsPerBeat = 60.0 / this.tempo;
        this.nextNoteTime += secondsPerBeat; // Add beat length to last beat time
        this.currentNote++;
        if (this.currentNote === 4) {
            this.currentNote = 0;
        }
    }

    /**
     * Play a specific note at a specific time.
     * Generates random variations for variety.
     * @param {number} beatNumber - 0 to 3
     * @param {number} time - AudioContext time to play at
     */
    scheduleNote(beatNumber, time) {
        // Procedural melody generation
        if (Math.random() > 0.3) { // 70% chance to play a note
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.connect(gain);
            gain.connect(this.musicGain);

            // Random note from scale
            const noteIdx = Math.floor(Math.random() * this.scale.length);
            const freq = this.scale[noteIdx];

            // Random octave shift for range
            const octave = Math.random() > 0.8 ? 2 : (Math.random() > 0.5 ? 1 : 0.5);

            osc.frequency.value = freq * octave;
            osc.type = Math.random() > 0.5 ? 'sine' : 'triangle';

            // Envelope (ADS)
            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(0.1, time + 0.05); // Attack
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5); // Decay

            osc.start(time);
            osc.stop(time + 0.6);
        }

        // Bass drone on the downbeat (beat 0)
        if (beatNumber === 0) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.musicGain);

            osc.frequency.value = 65.41; // C2 (Deep Bass)
            osc.type = 'sawtooth';

            // Filter envelope simulation
            gain.gain.setValueAtTime(0.05, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 1.5);

            osc.start(time);
            osc.stop(time + 1.5);
        }
    }

    /**
     * Play a one-shot sound effect.
     * @param {string} type - 'move', 'collision', 'goal', 'ui_hover', 'ui_click'
     */
    play(type) {
        if (!this.ctx || this.isMuted) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.masterGain);

        const now = this.ctx.currentTime;

        // Sound Synthesis Definitions
        switch (type) {
            case 'move':
                // Subtle high-pitch blip for movement feedback
                osc.type = 'sine';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);

                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

                osc.start(now);
                osc.stop(now + 0.1);
                break;

            case 'collision':
                // Low thud/crunch for walls
                osc.type = 'square';
                osc.frequency.setValueAtTime(100, now);
                osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);

                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

                osc.start(now);
                osc.stop(now + 0.2);
                break;

            case 'goal':
                // Success Arpeggio
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(440, now); // A4
                osc.frequency.setValueAtTime(554.37, now + 0.1); // C#5
                osc.frequency.setValueAtTime(659.25, now + 0.2); // E5

                gain.gain.setValueAtTime(0.1, now);
                gain.gain.linearRampToValueAtTime(0.2, now + 0.2); // Swell
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6); // Fade

                osc.start(now);
                osc.stop(now + 0.6);
                break;

            case 'ui_hover':
                // Tiny blip
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, now);
                gain.gain.setValueAtTime(0.05, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                osc.start(now);
                osc.stop(now + 0.05);
                break;

            case 'ui_click':
                // Confirm ping
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(1200, now);
                osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;
        }
    }
}
