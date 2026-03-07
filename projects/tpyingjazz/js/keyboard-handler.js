/**
 * typing-jazz/js/keyboard-handler.js
 * 
 * Manages user input, maps keys to notes, and tracks typing rhythm.
 */

import { audioEngine } from './audio-engine.js';
import { getFrequencyFromScale, PROGRESSIONS } from './scales.js';

class KeyboardHandler {
    constructor() {
        this.progressionIndex = 0;
        this.noteIndex = 0;
        this.lastPressTime = 0;
        this.typingSpeed = 0; // ms between keys

        this.keyMap = this.generateKeyMap();
        this.onKeyPress = null;

        this.init();
    }

    init() {
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }

    handleKeyDown(e) {
        // Ignore meta keys
        if (e.repeat || e.ctrlKey || e.altKey || e.metaKey) return;

        const now = performance.now();
        if (this.lastPressTime > 0) {
            this.typingSpeed = now - this.lastPressTime;
        }
        this.lastPressTime = now;

        // Map key to scale index
        const key = e.key.toLowerCase();
        if (this.keyMap.hasOwnProperty(key)) {
            this.playNote(this.keyMap[key]);
            if (this.onKeyPress) this.onKeyPress(key, this.keyMap[key]);
        }

        // Spacebar triggers progression change
        if (e.code === 'Space') {
            this.progressionIndex = (this.progressionIndex + 1) % PROGRESSIONS.length;
            this.noteIndex = 0; // Reset note sequence on segment change
            console.log('Progression changed to:', PROGRESSIONS[this.progressionIndex].scale);
        }
    }

    generateKeyMap() {
        // Simple mapping of QWERTY rows to notes
        const rows = [
            '1234567890'.split(''),
            'qwertyuiop'.split(''),
            'asdfghjkl'.split(''),
            'zxcvbnm'.split('')
        ];

        const map = {};
        rows.forEach((row, rowIndex) => {
            row.forEach((key, keyIndex) => {
                // Map each row to a roughly different octave or part of the scale
                // Lower rows = lower notes
                map[key] = (3 - rowIndex) * 5 + keyIndex;
            });
        });

        return map;
    }

    playNote(index) {
        const currentProg = PROGRESSIONS[this.progressionIndex];
        const root = currentProg.baseNote + '3'; // Base octave 3

        // Add some "jazz" randomness/variation
        const jitter = Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0;
        const finalIndex = index + jitter;

        const freq = getFrequencyFromScale(currentProg.scale, root, finalIndex);

        // Determine synth type based on typing speed or row
        let type = 'triangle';
        if (this.typingSpeed < 100) type = 'sine'; // Fast typing = softer notes
        if (index > 15) type = 'sine'; // High notes = soft

        audioEngine.triggerNote(freq, type);
    }
}

export const keyboardHandler = new KeyboardHandler();
