/**
 * js/app/InputHandler.js
 * Binds DOM events (buttons, sliders, drags) to the StateManager
 */

class InputHandler {
    /**
     * @param {StateManager} state 
     * @param {UIManager} ui 
     */
    constructor(state, ui) {
        this.state = state;
        this.ui = ui;

        this.dragManager = new window.DraggableManager({
            onClickDrag: () => {
                this.state.pause();
            },
            onDrop: this.handleDrop.bind(this)
        });
    }

    init() {
        this.dragManager.attachListeners();

        // Top controls
        document.getElementById('btn-run').addEventListener('click', () => {
            if (this.state.isPlaying) {
                this.state.pause();
                document.getElementById('btn-run').innerText = 'RUN EVOLUTION';
                document.getElementById('btn-run').classList.remove('active');
            } else {
                this.state.play();
                document.getElementById('btn-run').innerText = 'PAUSE';
                document.getElementById('btn-run').classList.add('active');
            }
        });

        document.getElementById('btn-clear').addEventListener('click', () => {
            this.state.clearCircuit();
        });

        document.getElementById('btn-measure').addEventListener('click', () => {
            // Fake a measure gate at the end
            let targetWire = 0; // just put it on 0
            let endStep = this.state.circuit.getLastActiveStep() + 1;
            this.state.addGate('M', targetWire, endStep);
            this.state.setPlaybackStep(endStep);
        });

        const qubitInput = document.getElementById('qubit-count');
        qubitInput.addEventListener('change', (e) => {
            this.state.setNumQubits(parseInt(e.target.value, 10));
        });

        // Timeline Scrubber
        this.ui.timelineRenderer.onScrub((step) => {
            this.state.pause();
            document.getElementById('btn-run').innerText = 'RUN EVOLUTION';
            document.getElementById('btn-run').classList.remove('active');
            this.state.setPlaybackStep(step);
        });

        // Add double-click deletion for gates on grid
        document.getElementById('circuit-grid').addEventListener('dblclick', (e) => {
            const tempGate = e.target.closest('.grid-gate');
            if (tempGate) {
                let id = tempGate.dataset.instanceId;
                if (id) {
                    this.state.deleteGate(id);
                }
            }
        });
    }

    /**
     * Logic when a drag finishes.
     * @param {Object} dropInfo 
     * @returns {boolean} True if dropped on a valid grid slot, false if cancelled/invalid.
     */
    handleDrop(dropInfo) {
        let logicalCoords = this.ui.gridRenderer.resolveDropCoordinates(dropInfo.clientX, dropInfo.clientY);

        if (!logicalCoords) {
            // Check if dropped back into palette for deletion if it came from grid
            if (dropInfo.sourceType === 'grid') {
                this.state.deleteGate(dropInfo.sourceInstanceId);
                return true; // we handled it (by deleting)
            }
            return false;
        }

        let w = parseInt(logicalCoords.slotDOM.dataset.wire, 10);
        let s = parseInt(logicalCoords.slotDOM.dataset.step, 10);

        if (dropInfo.sourceType === 'palette') {
            // New gate instantiation
            this.state.addGate(dropInfo.type, w, s);
        } else if (dropInfo.sourceType === 'grid') {
            // Move existing gate
            let gate = this.state.circuit.gates.find(g => g.id === dropInfo.sourceInstanceId);
            if (gate) {
                window.AppLogger && window.AppLogger.log(`Moved gate to [w:${w}, s:${s}]`);
                // Check collision
                if (this.state.circuit.getGateAt(w, s)) {
                    window.AppLogger && window.AppLogger.warn(`Slot occupied. Cancelled move.`);
                    return false;
                }
                gate.target = w;
                gate.step = s;
                this.state.compileCircuit();
            }
        }

        return true;
    }
}

window.InputHandler = InputHandler;
