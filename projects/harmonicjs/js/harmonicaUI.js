/**
 * HARMONICA JS v2.0 - HARMONICA UI
 * Instrument rendering and visual interaction
 */

class HarmonicaUI {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.holes = new Map();
        this.selectedHole = null;
        this.initialize();
    }

    /**
     * Initialize harmonica UI
     */
    initialize() {
        if (!this.container) {
            console.error('Harmonica container not found');
            return;
        }

        this.createHoles();
        this.attachEventListeners();
        console.log('✓ Harmonica UI initialized');
    }

    /**
     * Create all 10 harmonica holes
     */
    createHoles() {
        for (let holeNum = 1; holeNum <= 10; holeNum++) {
            const hole = this.createHole(holeNum);
            this.container.appendChild(hole);
            this.holes.set(holeNum, hole);
        }
    }

    /**
     * Create a single hole element
     */
    createHole(holeNum) {
        const hole = document.createElement('div');
        hole.className = 'hole';
        hole.dataset.hole = holeNum;

        // Hole number
        const number = document.createElement('div');
        number.className = 'hole-number';
        number.textContent = holeNum;
        hole.appendChild(number);

        // Keyboard key indicator
        const keyIndicator = document.createElement('div');
        keyIndicator.className = 'keyboard-key';
        keyIndicator.textContent = holeNum === 10 ? '0' : holeNum;
        hole.appendChild(keyIndicator);

        // Note labels container
        const notesContainer = document.createElement('div');
        notesContainer.className = 'hole-notes';

        // Blow note
        const blowLabel = document.createElement('div');
        blowLabel.className = 'note-label blow-note';
        blowLabel.textContent = `↑ ${HARMONICA_NOTES[holeNum].blowName}`;
        notesContainer.appendChild(blowLabel);

        // Draw note
        const drawLabel = document.createElement('div');
        drawLabel.className = 'note-label draw-note';
        drawLabel.textContent = `↓ ${HARMONICA_NOTES[holeNum].drawName}`;
        notesContainer.appendChild(drawLabel);

        hole.appendChild(notesContainer);

        return hole;
    }

    /**
     * Attach mouse/touch event listeners
     */
    attachEventListeners() {
        this.holes.forEach((holeElement, holeNum) => {
            // Mouse events
            holeElement.addEventListener('mousedown', () => {
                this.selectHole(holeNum);
            });

            holeElement.addEventListener('mouseenter', () => {
                if (!this.selectedHole) {
                    holeElement.style.transform = 'translateY(-5px) rotateY(5deg)';
                }
            });

            holeElement.addEventListener('mouseleave', () => {
                if (this.selectedHole !== holeNum) {
                    holeElement.style.transform = '';
                }
            });

            // Touch events
            holeElement.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.selectHole(holeNum);
            });
        });
    }

    /**
     * Select a hole
     */
    selectHole(holeNum) {
        this.selectedHole = holeNum;
        this.updateHoleHighlight();
        this.updateStatus(holeNum, null, null);
    }

    /**
     * Update visual highlight for selected hole
     */
    updateHoleHighlight() {
        this.holes.forEach((hole, num) => {
            if (num === this.selectedHole) {
                hole.style.borderColor = 'rgba(79, 172, 254, 0.8)';
                hole.style.transform = 'translateY(-3px)';
            } else {
                hole.style.borderColor = '';
                hole.style.transform = '';
            }
        });
    }

    /**
     * Activate hole for playing (blow or draw)
     */
    activateHole(holeNum, isBlow) {
        const hole = this.holes.get(holeNum);
        if (!hole) return;

        hole.classList.remove('active-blow', 'active-draw');
        hole.classList.add(isBlow ? 'active-blow' : 'active-draw');

        const noteName = isBlow
            ? HARMONICA_NOTES[holeNum].blowName
            : HARMONICA_NOTES[holeNum].drawName;

        this.updateStatus(holeNum, noteName, isBlow ? 'Blow' : 'Draw');
        this.highlightNoteChart(holeNum, isBlow);
    }

    /**
     * Deactivate hole
     */
    deactivateHole(holeNum) {
        const hole = this.holes.get(holeNum);
        if (!hole) return;

        hole.classList.remove('active-blow', 'active-draw');
        this.updateStatus(this.selectedHole, '—', 'Ready');
        this.clearNoteChartHighlight();
    }

    /**
     * Deactivate all holes
     */
    deactivateAll() {
        this.holes.forEach(hole => {
            hole.classList.remove('active-blow', 'active-draw');
        });
        this.updateStatus(null, '—', 'Ready');
        this.clearNoteChartHighlight();
    }

    /**
     * Get currently selected hole
     */
    getSelectedHole() {
        return this.selectedHole;
    }

    /**
     * Clear selection
     */
    clearSelection() {
        this.selectedHole = null;
        this.holes.forEach(hole => {
            hole.style.borderColor = '';
            hole.style.transform = '';
        });
    }

    /**
     * Update status display
     */
    updateStatus(holeNum, noteName, mode) {
        const activeHoleElement = document.getElementById('activeHole');
        const currentNoteElement = document.getElementById('currentNote');
        const currentModeElement = document.getElementById('currentMode');

        if (activeHoleElement) {
            activeHoleElement.textContent = holeNum || '—';
        }

        if (currentNoteElement && noteName) {
            currentNoteElement.textContent = noteName;
        }

        if (currentModeElement && mode) {
            currentModeElement.textContent = mode;

            // Color coding
            if (mode === 'Blow') {
                currentModeElement.style.color = COLORS.blow;
            } else if (mode === 'Draw') {
                currentModeElement.style.color = COLORS.draw;
            } else {
                currentModeElement.style.color = COLORS.primary;
            }
        }
    }

    /**
     * Highlight note in the note chart
     */
    highlightNoteChart(holeNum, isBlow) {
        // Remove previous highlights
        this.clearNoteChartHighlight();

        // Add new highlight
        const chartRow = document.querySelector(`.chart-row[data-hole="${holeNum}"]`);
        if (chartRow) {
            chartRow.style.background = isBlow
                ? 'rgba(255, 107, 107, 0.2)'
                : 'rgba(78, 205, 196, 0.2)';
            chartRow.style.transform = 'scale(1.02)';
        }
    }

    /**
     * Clear note chart highlights
     */
    clearNoteChartHighlight() {
        const chartRows = document.querySelectorAll('.chart-row[data-hole]');
        chartRows.forEach(row => {
            row.style.background = '';
            row.style.transform = '';
        });
    }
}

console.log('✓ Harmonica UI loaded');