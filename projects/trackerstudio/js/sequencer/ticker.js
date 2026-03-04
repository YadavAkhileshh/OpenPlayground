/**
 * ticker.js
 * Lookahead scheduler for precise audio timing.
 * Uses setTimeout + AudioContext.currentTime for sub-millisecond accuracy.
 */
export class Ticker {
    constructor(ctx, callback) {
        this.ctx = ctx;
        this.callback = callback; // fn(stepIndex, audioTime)

        this.isPlaying = false;
        this.bpm = 130;
        this.patternLength = 64; // rows

        // Lookahead scheduling parameters
        this.lookaheadMs = 25.0;       // How often to call scheduler (ms)
        this.scheduleAheadSec = 0.1;   // How far ahead to schedule (sec)

        this.nextNoteTime = 0.0;
        this.currentStep = 0;
        this._timerID = null;
    }

    start() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.currentStep = 0;
        this.nextNoteTime = this.ctx.currentTime + 0.05;
        this._schedule();
    }

    stop() {
        this.isPlaying = false;
        if (this._timerID) {
            clearTimeout(this._timerID);
            this._timerID = null;
        }
        this.currentStep = 0;
    }

    _schedule() {
        while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadSec) {
            this.callback(this.currentStep, this.nextNoteTime);
            this._advance();
        }
        if (this.isPlaying) {
            this._timerID = setTimeout(() => this._schedule(), this.lookaheadMs);
        }
    }

    _advance() {
        // 16th note duration = (60 / bpm) / 4
        const secPer16th = (60.0 / this.bpm) / 4.0;
        this.nextNoteTime += secPer16th;
        this.currentStep = (this.currentStep + 1) % this.patternLength;
    }

    setBpm(bpm) {
        this.bpm = Math.max(40, Math.min(300, bpm));
    }

    setPatternLength(len) {
        this.patternLength = len;
        if (this.currentStep >= len) this.currentStep = 0;
    }
}
