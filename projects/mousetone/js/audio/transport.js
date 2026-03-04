/**
 * File: transport.js
 * MouseTone Module
 * Copyright (c) 2026
 */
export class Transport {
    constructor(ctx) {
        this.ctx = ctx;
        this.bpm = 120;
        this.lookahead = 25.0; // ms
        this.scheduleAheadTime = 0.1; // s
        this.nextNoteTime = 0.0;
        this.noteResolution = 16; // 16th notes
        this.currentNote = 0;
        this.callbacks = [];
        this.isPlaying = false;
        this.timerID = null;
    }

    start() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.nextNoteTime = this.ctx.currentTime;
        this.scheduler();
    }

    stop() {
        this.isPlaying = false;
        clearTimeout(this.timerID);
    }

    scheduler() {
        while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
            this.scheduleNote(this.currentNote, this.nextNoteTime);
            this.nextNote();
        }
        if (this.isPlaying) {
            this.timerID = setTimeout(() => this.scheduler(), this.lookahead);
        }
    }

    scheduleNote(beatNumber, time) {
        this.callbacks.forEach(cb => cb(beatNumber, time));
    }

    nextNote() {
        const secondsPerBeat = 60.0 / this.bpm;
        this.nextNoteTime += 0.25 * secondsPerBeat; // 16th note
        this.currentNote++;
        if (this.currentNote === 16) {
            this.currentNote = 0;
        }
    }

    addCallback(cb) {
        this.callbacks.push(cb);
    }
}
