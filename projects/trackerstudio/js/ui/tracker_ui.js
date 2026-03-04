/**
 * tracker_ui.js
 * Handles all UI rendering and user interaction for the tracker grid.
 * Features:
 *   - Vertical hex-style tracker grid
 *   - Keyboard note entry with octave control
 *   - Arrow key navigation
 *   - Copy/Paste row (Ctrl+C / Ctrl+V)
 *   - Delete cell
 *   - Instrument selection
 *   - Channel mute/solo
 *   - Pattern length control
 *   - Export/Import JSON
 *   - VU meter updates
 *   - Live step highlight
 */
export class TrackerUI {
    constructor(sequencer, mixer) {
        this.sequencer = sequencer;
        this.mixer = mixer;

        this.gridEl = document.getElementById('tracker-grid');
        this.statusEl = document.getElementById('status-bar');
        this.stepCounterEl = document.getElementById('step-counter');

        // Cursor position
        this.cursorRow = 0;
        this.cursorCh = 0;

        // Current playing row (for highlight)
        this.playingRow = -1;

        // Current octave (feature: octave control)
        this.currentOctave = 4;

        // Current instrument
        this.currentInst = 1;

        // Mute/Solo state mirrors
        this.muteState = [false, false, false, false];
        this.soloState = [false, false, false, false];

        // Keyboard piano layout
        this.keyNoteMap = {
            'z': 'C-', 's': 'C#', 'x': 'D-', 'd': 'D#', 'c': 'E-',
            'v': 'F-', 'g': 'F#', 'b': 'G-', 'h': 'G#', 'n': 'A-',
            'j': 'A#', 'm': 'B-', ',': 'C-'
        };

        // Bind sequencer step callback
        this.sequencer.onStepChange = (step) => this._onStep(step);
    }

    init() {
        this._renderGrid();
        this._bindControls();
        this._bindChannelHeaders();
        this._bindInstrumentList();
        this._bindPatternIO();
        this._bindOctaveControls();
        this._bindPatternLength();
        this._bindChannelVolumes();
        this.gridEl.focus();
        this._setStatus('READY. Use keyboard to enter notes.');
    }

    // ── Grid Rendering ─────────────────────────────────────────────────────────

    _renderGrid() {
        this.gridEl.innerHTML = '';
        const rows = this.sequencer.pattern.rows;

        for (let r = 0; r < rows; r++) {
            const rowEl = this._createRowEl(r);
            this.gridEl.appendChild(rowEl);
        }

        this._updateCursor();
    }

    _createRowEl(r) {
        const rowEl = document.createElement('div');
        rowEl.classList.add('tracker-row');
        rowEl.dataset.row = r;

        // Row number (hex)
        const numEl = document.createElement('div');
        numEl.classList.add('row-number');
        numEl.textContent = r.toString(16).toUpperCase().padStart(2, '0');
        rowEl.appendChild(numEl);

        // 4 channel cells
        for (let c = 0; c < 4; c++) {
            const cellEl = document.createElement('div');
            cellEl.classList.add('tracker-cell');
            cellEl.dataset.row = r;
            cellEl.dataset.ch = c;
            cellEl.innerHTML = this._formatCell(r, c);
            cellEl.onclick = () => this._selectCell(r, c);
            rowEl.appendChild(cellEl);
        }

        return rowEl;
    }

    _formatCell(r, c) {
        const cell = this.sequencer.pattern.getCell(r, c);
        if (!cell) return this._emptyCell();

        const note = cell.note
            ? `<span class="cell-note">${cell.note}</span>`
            : `<span class="cell-note empty">---</span>`;

        const inst = cell.inst !== null
            ? `<span class="cell-inst">${cell.inst.toString(16).toUpperCase().padStart(2, '0')}</span>`
            : `<span class="cell-inst empty">--</span>`;

        const vol = cell.vol !== null
            ? `<span class="cell-vol">${cell.vol.toString(16).toUpperCase().padStart(2, '0')}</span>`
            : `<span class="cell-vol empty">--</span>`;

        const fx = cell.effect
            ? `<span class="cell-fx">${cell.effect}${(cell.effectParam || 0).toString(16).toUpperCase().padStart(2, '0')}</span>`
            : `<span class="cell-fx empty">...</span>`;

        // Volume bar
        const volPct = cell.vol !== null ? (cell.vol / 64 * 100).toFixed(0) : 0;
        const bar = cell.vol !== null
            ? `<div class="cell-vol-bar" style="width:${volPct}%"></div>`
            : '';

        return `${note}${inst}${vol}${fx}${bar}`;
    }

    _emptyCell() {
        return `<span class="cell-note empty">---</span><span class="cell-inst empty">--</span><span class="cell-vol empty">--</span><span class="cell-fx empty">...</span>`;
    }

    _refreshCell(r, c) {
        const rows = this.gridEl.children;
        if (!rows[r]) return;
        const cell = rows[r].children[c + 1]; // +1 for row-number
        if (cell) cell.innerHTML = this._formatCell(r, c);
    }

    _refreshAllCells() {
        const rows = this.gridEl.children;
        for (let r = 0; r < rows.length; r++) {
            for (let c = 0; c < 4; c++) {
                const cell = rows[r].children[c + 1];
                if (cell) cell.innerHTML = this._formatCell(r, c);
            }
        }
    }

    // ── Cursor ─────────────────────────────────────────────────────────────────

    _selectCell(r, c) {
        this.cursorRow = r;
        this.cursorCh = c;
        this._updateCursor();
    }

    _updateCursor() {
        // Remove old
        const prev = this.gridEl.querySelector('.selected');
        if (prev) prev.classList.remove('selected');

        const rows = this.gridEl.children;
        if (rows[this.cursorRow]) {
            const cell = rows[this.cursorRow].children[this.cursorCh + 1];
            if (cell) {
                cell.classList.add('selected');
                // Scroll into view
                const rowTop = rows[this.cursorRow].offsetTop;
                const container = this.gridEl;
                const ch = container.clientHeight;
                if (rowTop < container.scrollTop || rowTop > container.scrollTop + ch - 30) {
                    container.scrollTop = rowTop - ch / 2;
                }
            }
        }
    }

    // ── Step Highlight ─────────────────────────────────────────────────────────

    _onStep(step) {
        const rows = this.gridEl.children;

        if (rows[this.playingRow]) {
            rows[this.playingRow].classList.remove('playing');
        }

        this.playingRow = step;

        if (rows[step]) {
            rows[step].classList.add('playing');
            // Auto-scroll to keep playing row visible
            const rowTop = rows[step].offsetTop;
            const container = this.gridEl;
            const ch = container.clientHeight;
            if (rowTop < container.scrollTop || rowTop > container.scrollTop + ch - 30) {
                container.scrollTop = rowTop - ch / 2;
            }
        }

        // Update step counter
        if (this.stepCounterEl) {
            this.stepCounterEl.textContent = `STEP: ${step.toString(16).toUpperCase().padStart(2, '0')}`;
        }
    }

    // ── Keyboard Input ─────────────────────────────────────────────────────────

    _bindControls() {
        document.addEventListener('keydown', (e) => this._handleKey(e));
    }

    _handleKey(e) {
        const tag = e.target.tagName.toLowerCase();
        // Don't intercept when typing in inputs
        if (tag === 'input' || tag === 'select') return;

        // Navigation
        if (e.key === 'ArrowDown') { this.cursorRow = (this.cursorRow + 1) % this.sequencer.pattern.rows; this._updateCursor(); e.preventDefault(); return; }
        if (e.key === 'ArrowUp') { this.cursorRow = (this.cursorRow - 1 + this.sequencer.pattern.rows) % this.sequencer.pattern.rows; this._updateCursor(); e.preventDefault(); return; }
        if (e.key === 'ArrowRight') { this.cursorCh = (this.cursorCh + 1) % 4; this._updateCursor(); e.preventDefault(); return; }
        if (e.key === 'ArrowLeft') { this.cursorCh = (this.cursorCh - 1 + 4) % 4; this._updateCursor(); e.preventDefault(); return; }

        // Octave control: < and >
        if (e.key === '<' || e.key === ',') { this.currentOctave = Math.max(0, this.currentOctave - 1); document.getElementById('octave-label').textContent = this.currentOctave; e.preventDefault(); return; }
        if (e.key === '>' || e.key === '.') { this.currentOctave = Math.min(8, this.currentOctave + 1); document.getElementById('octave-label').textContent = this.currentOctave; e.preventDefault(); return; }

        // Delete / Backspace
        if (e.key === 'Delete' || e.key === 'Backspace') {
            this.sequencer.pattern.clearCell(this.cursorRow, this.cursorCh);
            this._refreshCell(this.cursorRow, this.cursorCh);
            e.preventDefault();
            return;
        }

        // Copy row
        if (e.ctrlKey && e.key === 'c') {
            this.sequencer.pattern.copyRow(this.cursorRow);
            this._setStatus(`Row ${this.cursorRow.toString(16).toUpperCase()} copied.`);
            e.preventDefault();
            return;
        }

        // Paste row
        if (e.ctrlKey && e.key === 'v') {
            this.sequencer.pattern.pasteRow(this.cursorRow);
            for (let c = 0; c < 4; c++) this._refreshCell(this.cursorRow, c);
            this._setStatus(`Pasted to row ${this.cursorRow.toString(16).toUpperCase()}.`);
            e.preventDefault();
            return;
        }

        // Space = Play/Stop
        if (e.key === ' ') {
            const playBtn = document.getElementById('btn-play');
            playBtn.click();
            e.preventDefault();
            return;
        }

        // Note entry
        const noteBase = this.keyNoteMap[e.key.toLowerCase()];
        if (noteBase && !e.ctrlKey && !e.altKey) {
            const note = `${noteBase}${this.currentOctave}`;
            this.sequencer.pattern.setCell(this.cursorRow, this.cursorCh, {
                note, inst: this.currentInst, vol: 64
            });
            this._refreshCell(this.cursorRow, this.cursorCh);

            // Preview sound
            this.sequencer.previewNote(this.cursorCh, note, this.currentInst);

            // Advance cursor down
            this.cursorRow = (this.cursorRow + 1) % this.sequencer.pattern.rows;
            this._updateCursor();
            e.preventDefault();
        }
    }

    // ── Channel Headers: Mute / Solo ───────────────────────────────────────────

    _bindChannelHeaders() {
        document.querySelectorAll('.btn-mute').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const ch = parseInt(btn.dataset.ch);
                const isMuted = this.mixer.toggleMute(ch);
                btn.classList.toggle('active', isMuted);
                this.muteState[ch] = isMuted;
                this._updateMutedCells(ch, isMuted);
                this._setStatus(`CH${ch + 1} ${isMuted ? 'MUTED' : 'UNMUTED'}`);
            });
        });

        document.querySelectorAll('.btn-solo').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const ch = parseInt(btn.dataset.ch);
                const isSolo = this.mixer.toggleSolo(ch);
                btn.classList.toggle('active', isSolo);
                this.soloState[ch] = isSolo;
                this._setStatus(`CH${ch + 1} ${isSolo ? 'SOLO' : 'UNSOLO'}`);
            });
        });
    }

    _updateMutedCells(ch, isMuted) {
        const cells = this.gridEl.querySelectorAll(`.tracker-cell[data-ch="${ch}"]`);
        cells.forEach(c => c.classList.toggle('ch-muted', isMuted));
    }

    // ── Instrument List ────────────────────────────────────────────────────────

    _bindInstrumentList() {
        document.querySelectorAll('.inst-item').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.inst-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                this.currentInst = parseInt(item.dataset.inst);
                this._setStatus(`Instrument ${this.currentInst} selected.`);
            });
        });
    }

    // ── Pattern I/O ────────────────────────────────────────────────────────────

    _bindPatternIO() {
        document.getElementById('btn-export').addEventListener('click', () => {
            const json = this.sequencer.pattern.toJSON();
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'pattern.json';
            a.click();
            URL.revokeObjectURL(url);
            this._setStatus('Pattern exported as JSON.');
        });

        document.getElementById('btn-import').addEventListener('click', () => {
            document.getElementById('import-file').click();
        });

        document.getElementById('import-file').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                const ok = this.sequencer.pattern.fromJSON(ev.target.result);
                if (ok) {
                    this._renderGrid();
                    this._setStatus('Pattern imported successfully.');
                } else {
                    this._setStatus('ERROR: Invalid pattern file.');
                }
            };
            reader.readAsText(file);
            e.target.value = ''; // Reset
        });

        document.getElementById('btn-clear').addEventListener('click', () => {
            if (confirm('Clear entire pattern?')) {
                this.sequencer.pattern.clear();
                this._refreshAllCells();
                this._setStatus('Pattern cleared.');
            }
        });
    }

    // ── Octave Controls ────────────────────────────────────────────────────────

    _bindOctaveControls() {
        document.getElementById('oct-up').addEventListener('click', () => {
            this.currentOctave = Math.min(8, this.currentOctave + 1);
            document.getElementById('octave-label').textContent = this.currentOctave;
        });
        document.getElementById('oct-down').addEventListener('click', () => {
            this.currentOctave = Math.max(0, this.currentOctave - 1);
            document.getElementById('octave-label').textContent = this.currentOctave;
        });
    }

    // ── Pattern Length ─────────────────────────────────────────────────────────

    _bindPatternLength() {
        document.getElementById('pattern-len').addEventListener('change', (e) => {
            const len = parseInt(e.target.value);
            this.sequencer.setPatternLength(len);
            this._renderGrid();
            this._setStatus(`Pattern length set to ${len} rows.`);
        });
    }

    // ── Channel Volumes ────────────────────────────────────────────────────────

    _bindChannelVolumes() {
        document.querySelectorAll('.ch-vol-slider').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const ch = parseInt(e.target.dataset.ch);
                const vol = parseFloat(e.target.value);
                this.mixer.setChannelVolume(ch, vol);
            });
        });
    }

    // ── VU Meters (called from main loop) ─────────────────────────────────────

    updateVuMeters() {
        for (let ch = 0; ch < 4; ch++) {
            const level = this.mixer.getChannelLevel(ch);
            const bar = document.getElementById(`vu-${ch}`);
            if (bar) bar.style.height = `${Math.min(100, level * 100 * 3)}%`;
        }
    }

    // ── Status Bar ─────────────────────────────────────────────────────────────

    _setStatus(msg) {
        if (!this.statusEl) return;
        this.statusEl.textContent = msg;
        this.statusEl.classList.remove('status-flash');
        void this.statusEl.offsetWidth; // reflow
        this.statusEl.classList.add('status-flash');
    }
}
