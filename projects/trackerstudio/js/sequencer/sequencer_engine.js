/**
 * sequencer_engine.js
 * Coordinates Ticker, Pattern, and Mixer to trigger notes.
 * Features:
 *   - Note-to-playbackRate mapping (pitch shifting via resampling)
 *   - Arpeggio effect (effect code 'A': rapid note cycling)
 *   - Vibrato effect (effect code 'V': pitch wobble via LFO)
 *   - Per-channel voice management (new note cuts old)
 */
import { Ticker } from './ticker.js';
import { Pattern } from './pattern.js';

export class Sequencer {
    constructor(audioEngine, mixer, sampleLoader) {
        this.audio = audioEngine;
        this.mixer = mixer;
        this.loader = sampleLoader;

        this.pattern = new Pattern();
        this.ticker = new Ticker(this.audio.ctx, (step, time) => this._onTick(step, time));

        // Callbacks for UI
        this.onStepChange = null;

        // Active sources per channel (for note cutting)
        this._activeSources = [null, null, null, null];
        this._activeGains = [null, null, null, null];

        // Vibrato LFO state per channel
        this._vibratoPhase = [0, 0, 0, 0];

        // Arpeggio state per channel
        this._arpeggioStep = [0, 0, 0, 0];

        // Build note -> playbackRate map
        this.noteMap = this._buildNoteMap();
    }

    _buildNoteMap() {
        const noteNames = ['C-', 'C#', 'D-', 'D#', 'E-', 'F-', 'F#', 'G-', 'G#', 'A-', 'A#', 'B-'];
        const map = new Map();
        for (let oct = 0; oct < 9; oct++) {
            for (let n = 0; n < 12; n++) {
                const name = `${noteNames[n]}${oct}`;
                // Semitones relative to C4 (index 48)
                const semitones = (oct * 12 + n) - 48;
                map.set(name, Math.pow(2, semitones / 12));
            }
        }
        return map;
    }

    start() { this.ticker.start(); }
    stop() { this.ticker.stop(); this._stopAllVoices(); }

    setBpm(bpm) { this.ticker.setBpm(bpm); }
    setPatternLength(len) { this.ticker.setPatternLength(len); this.pattern.resize(len); }

    _onTick(step, time) {
        // Notify UI
        if (this.onStepChange) this.onStepChange(step);

        const row = this.pattern.data[step];
        if (!row) return;

        row.forEach((cell, ch) => {
            if (!cell.note || cell.note === '---') return;
            this._triggerCell(ch, cell, time);
        });
    }

    _triggerCell(ch, cell, time) {
        // Cut existing voice on this channel
        this._cutVoice(ch);

        const sampleName = `inst${cell.inst || 1}`;
        const buffer = this.loader.get(sampleName);
        if (!buffer) return;

        let rate = this.noteMap.get(cell.note) || 1.0;
        const vol = cell.vol !== null ? (cell.vol / 64) : 1.0;

        // ── Effect: Vibrato (V) ──────────────────────────────
        // Modulates playbackRate with a sine LFO
        if (cell.effect === 'V' && cell.effectParam) {
            const depth = (cell.effectParam & 0xF) / 15 * 0.05; // 0..5% pitch
            const speed = ((cell.effectParam >> 4) & 0xF) / 15 * 8; // 0..8 Hz
            const lfoVal = Math.sin(this._vibratoPhase[ch] * 2 * Math.PI) * depth;
            rate *= (1 + lfoVal);
            this._vibratoPhase[ch] = (this._vibratoPhase[ch] + speed / 64) % 1;
        }

        // ── Effect: Arpeggio (A) ─────────────────────────────
        // Cycles through note, note+semitone1, note+semitone2
        if (cell.effect === 'A' && cell.effectParam) {
            const semi1 = (cell.effectParam >> 4) & 0xF;
            const semi2 = cell.effectParam & 0xF;
            const arps = [0, semi1, semi2];
            const arpOffset = arps[this._arpeggioStep[ch] % 3];
            rate *= Math.pow(2, arpOffset / 12);
            this._arpeggioStep[ch]++;
        } else {
            this._arpeggioStep[ch] = 0;
        }

        // Create source
        const source = this.audio.ctx.createBufferSource();
        source.buffer = buffer;
        source.playbackRate.value = Math.max(0.01, rate);

        const gain = this.audio.ctx.createGain();
        gain.gain.value = Math.max(0, Math.min(1, vol));

        source.connect(gain);
        gain.connect(this.mixer.channels[ch].node);

        source.start(time);
        source.onended = () => {
            if (this._activeSources[ch] === source) {
                this._activeSources[ch] = null;
                this._activeGains[ch] = null;
            }
        };

        this._activeSources[ch] = source;
        this._activeGains[ch] = gain;
    }

    _cutVoice(ch) {
        if (this._activeSources[ch]) {
            try { this._activeSources[ch].stop(); } catch (e) { /* ok */ }
            this._activeSources[ch] = null;
            this._activeGains[ch] = null;
        }
    }

    _stopAllVoices() {
        for (let ch = 0; ch < 4; ch++) this._cutVoice(ch);
    }

    /**
     * Preview a note immediately (for keyboard input feedback).
     */
    previewNote(ch, note, instNum) {
        const sampleName = `inst${instNum}`;
        const buffer = this.loader.get(sampleName);
        if (!buffer) return;
        const rate = this.noteMap.get(note) || 1.0;
        const cell = { note, inst: instNum, vol: 64, effect: null, effectParam: null };
        this._triggerCell(ch, cell, this.audio.ctx.currentTime);
    }
}
