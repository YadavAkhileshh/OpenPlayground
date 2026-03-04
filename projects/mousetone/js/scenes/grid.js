/**
 * File: js/scenes/grid.js
 * MouseTone Scene
 * Copyright (c) 2026
 * 
 * "Grid" Mode (Sequencer).
 * A rhythmic step sequencer where visual cells trigger notes.
 * Uses the Transport class for timing.
 */
import { Scene } from '../core/scene.js';
import { AudioEffects } from '../audio/effects.js';
import { Transport } from '../audio/transport.js';

export class GridScene extends Scene {
    /**
     * @param {CanvasRenderingContext2D} ctx 
     * @param {AudioContext} audioCtx 
     */
    constructor(ctx, audioCtx) {
        super(ctx, audioCtx);
        this.gridSize = 8;
        this.cells = [];
        this.activeCells = [];
        this.transport = new Transport(audioCtx);
        this.effects = new AudioEffects(audioCtx);

        // Callback for each 16th note
        this.transport.addCallback((beat, time) => this.onBeat(beat, time));
        this.effects.input.connect(audioCtx.destination);

        this.initGrid();
    }

    initGrid() {
        // Create an 8x8 grid of cells
        for (let x = 0; x < this.gridSize; x++) {
            for (let y = 0; y < this.gridSize; y++) {
                this.cells.push({
                    x, y,
                    active: false,
                    // Rainbow grid
                    color: `hsl(${(x / this.gridSize) * 360}, 50%, 50%)`
                });
            }
        }
    }

    async enter() {
        this.transport.start();
        this.effects.setDelay(0.2, 0.3, 0.2); // Rhythmic delay
    }

    async exit() {
        this.transport.stop();
    }

    /**
     * Plays a single short blip (square wave).
     * @param {number} freq - Frequency in Hz.
     * @param {number} time - Audio context time to start.
     */
    playNote(freq, time) {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.frequency.value = freq;
        osc.type = 'square';
        osc.connect(gain);
        gain.connect(this.effects.input);

        osc.start(time);
        osc.stop(time + 0.1);

        // Sharp pluck envelope
        gain.gain.setValueAtTime(0.1, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
    }

    onBeat(beat, time) {
        // Sequencer logic: Iterate one column per beat
        const col = beat % this.gridSize;

        // Trigger all active cells in this column
        this.cells.filter(c => c.x === col && c.active).forEach(cell => {
            // Pentatonic-ish scale mapping based on Y position
            const freq = 220 * Math.pow(2, (this.gridSize - cell.y) / 12 * 2);
            this.playNote(freq, time);
        });

        this.currentCol = col;
    }

    handleInput(type, data) {
        if (type === 'mousemove') {
            // Activate cell under mouse cursor
            const cellWidth = this.width / this.gridSize;
            const cellHeight = this.height / this.gridSize;

            const cx = Math.floor(data.rawX / cellWidth);
            const cy = Math.floor(data.rawY / cellHeight);

            this.hoverCell = { x: cx, y: cy };

            // "Paint" active cells that stay active for a short duration
            const cellIndex = this.cells.findIndex(c => c.x === cx && c.y === cy);
            if (cellIndex !== -1) {
                this.cells[cellIndex].active = true;

                // Auto-deactivate after 2 seconds (echo effect)
                clearTimeout(this.cells[cellIndex].timeout);
                this.cells[cellIndex].timeout = setTimeout(() => {
                    this.cells[cellIndex].active = false;
                }, 2000);
            }
        }
    }

    render() {
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(0, 0, this.width, this.height);

        const cw = this.width / this.gridSize;
        const ch = this.height / this.gridSize;

        // Draw Grid
        this.cells.forEach(c => {
            // Draw active cells or hovered cells
            if (c.active || (this.hoverCell && this.hoverCell.x === c.x && this.hoverCell.y === c.y)) {
                this.ctx.fillStyle = c.color;
                this.ctx.globalAlpha = c.active ? 0.8 : 0.3;
                this.ctx.fillRect(c.x * cw, c.y * ch, cw - 2, ch - 2);
            } else {
                this.ctx.strokeStyle = '#222';
                this.ctx.strokeRect(c.x * cw, c.y * ch, cw, ch);
            }
        });

        // Draw Sequencer Playhead Line
        if (this.currentCol !== undefined) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            this.ctx.fillRect(this.currentCol * cw, 0, cw, this.height);
        }

        this.ctx.globalAlpha = 1.0;
    }
}
