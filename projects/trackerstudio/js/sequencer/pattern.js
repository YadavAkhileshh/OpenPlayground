/**
 * pattern.js
 * Pattern data structure for the tracker.
 * Each cell: { note, inst, vol, effect, effectParam }
 * Feature: Copy/Paste row, Clear, Export/Import JSON.
 */
export class Pattern {
    constructor(rows = 64, channels = 4) {
        this.rows = rows;
        this.channels = channels;
        this.data = [];
        this._clipboard = null; // For copy/paste
        this._init();
    }

    _init() {
        this.data = [];
        for (let r = 0; r < this.rows; r++) {
            const row = [];
            for (let c = 0; c < this.channels; c++) {
                row.push(this._emptyCell());
            }
            this.data.push(row);
        }
    }

    _emptyCell() {
        return { note: null, inst: null, vol: null, effect: null, effectParam: null };
    }

    resize(newRows) {
        if (newRows === this.rows) return;
        if (newRows > this.rows) {
            for (let r = this.rows; r < newRows; r++) {
                const row = [];
                for (let c = 0; c < this.channels; c++) row.push(this._emptyCell());
                this.data.push(row);
            }
        } else {
            this.data = this.data.slice(0, newRows);
        }
        this.rows = newRows;
    }

    getCell(row, channel) {
        if (row >= 0 && row < this.rows && channel >= 0 && channel < this.channels) {
            return this.data[row][channel];
        }
        return null;
    }

    setCell(row, channel, data) {
        const cell = this.getCell(row, channel);
        if (cell) Object.assign(cell, data);
    }

    clearCell(row, channel) {
        const cell = this.getCell(row, channel);
        if (cell) Object.assign(cell, this._emptyCell());
    }

    /** Copy an entire row to clipboard */
    copyRow(row) {
        if (row < 0 || row >= this.rows) return;
        this._clipboard = this.data[row].map(cell => ({ ...cell }));
    }

    /** Paste clipboard to a row */
    pasteRow(row) {
        if (!this._clipboard || row < 0 || row >= this.rows) return;
        this.data[row] = this._clipboard.map(cell => ({ ...cell }));
    }

    clear() {
        this._init();
    }

    /** Export pattern as JSON string */
    toJSON() {
        return JSON.stringify({
            rows: this.rows,
            channels: this.channels,
            data: this.data
        }, null, 2);
    }

    /** Import pattern from JSON string */
    fromJSON(jsonStr) {
        try {
            const obj = JSON.parse(jsonStr);
            this.rows = obj.rows || 64;
            this.channels = obj.channels || 4;
            this.data = obj.data || [];
            // Ensure all cells have all fields
            for (let r = 0; r < this.rows; r++) {
                for (let c = 0; c < this.channels; c++) {
                    if (!this.data[r]) this.data[r] = [];
                    if (!this.data[r][c]) this.data[r][c] = this._emptyCell();
                    else this.data[r][c] = { ...this._emptyCell(), ...this.data[r][c] };
                }
            }
            return true;
        } catch (e) {
            console.error('Pattern import failed:', e);
            return false;
        }
    }
}
