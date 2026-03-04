/**
 * js/app/StateManager.js
 * Central nervous system of the app.
 * Ties the DOM inputs to the Circuit data, triggers compilation,
 * and updates UI Manager.
 */

class StateManager {
    constructor(uiManager) {
        this.ui = uiManager;
        this.circuit = new window.Circuit(window.AppConfig.DEFAULT_QUBITS, window.AppConfig.MAX_TIMELINE_STEPS);
        this.engine = new window.EvolutionEngine();

        this.timelineCache = []; // Array of TimelineVectors
        this.currentStep = 0;

        this.isPlaying = false;
        this.playTimer = null;
    }

    init() {
        this._rebuildEnvironment();
        this.compileCircuit();
    }

    setNumQubits(n) {
        n = window.MathUtils.clamp(n, 1, window.AppConfig.MAX_QUBITS);
        if (n === this.circuit.numQubits) return;

        this.circuit.numQubits = n;
        // Purge gates that are now out of bounds
        this.circuit.gates = this.circuit.gates.filter(g => g.target < n && (g.control === null || g.control < n));

        this._rebuildEnvironment();
        this.compileCircuit();
    }

    /**
     * Fired when a gate is dragged onto the grid.
     */
    addGate(type, targetWire, stepCol) {
        try {
            // Check for overlaps implicitly handled by logic via exception
            let gate = new window.QuantumGate(type, targetWire, stepCol);

            // Special initialization for controlled gates
            if (gate.isControlMode) {
                // By default, try to map control to the wire above it.
                // If it's the top wire, map to wire + 1.
                let defaultControl = targetWire > 0 ? targetWire - 1 : targetWire + 1;

                // Ensure the control wire isn't already occupied on this step
                if (this.circuit.getGateAt(defaultControl, stepCol)) {
                    // Try finding any free wire
                    let found = false;
                    for (let w = 0; w < this.circuit.numQubits; w++) {
                        if (w !== targetWire && !this.circuit.getGateAt(w, stepCol)) {
                            defaultControl = w;
                            found = true;
                            break;
                        }
                    }
                    if (!found) defaultControl = null; // Forces it to act as Identity
                }

                if (defaultControl !== null) {
                    gate.setControl(defaultControl);
                }
            }

            this.circuit.addGate(gate);
            window.AppLogger && window.AppLogger.log(`Added ${type} gate to Qubit ${targetWire} at step ${stepCol}`);

            this._expandTimelineIfNeeded(stepCol);
            this.compileCircuit();
        } catch (e) {
            window.AppLogger && window.AppLogger.error(`Drop Error: ${e.message}`);
        }
    }

    /**
     * Delete a specific gate
     * @param {string} id 
     */
    deleteGate(id) {
        this.circuit.removeGateById(id);
        window.AppLogger && window.AppLogger.log(`Gate deleted. Recompiling.`);
        this.compileCircuit();
    }

    clearCircuit() {
        this.circuit.clear();
        this._rebuildEnvironment(); // Shrinks timeline back
        this.compileCircuit();
    }

    /**
     * Forces immediate recompilation of the whole matrix math pipeline
     */
    compileCircuit() {
        this.timelineCache = this.engine.compileAndRun(this.circuit);

        // Sync Visuals
        this.ui.syncCircuit(this.circuit);

        // Push State changes to UI
        this.setPlaybackStep(this.currentStep);
    }

    /**
     * Jump in time
     * @param {number} step 
     */
    setPlaybackStep(step) {
        step = window.MathUtils.clamp(step, 0, this.circuit.numSteps);

        // Handle case where we seek past compiled bounds (e.g. empty trail)
        let simulatedStep = step;
        if (simulatedStep >= this.timelineCache.length) {
            simulatedStep = this.timelineCache.length - 1;
        }

        if (simulatedStep < 0) {
            // Null state (literally nothing compiled, e.g. 0 qubits edge case)
            return;
        }

        let cacheFrame = this.timelineCache[simulatedStep];
        this.currentStep = step;

        this.ui.updateScrubber(step);

        let hasCollapse = (cacheFrame.measuredValue !== null);

        this.ui.syncStateVisuals(cacheFrame.getState(), hasCollapse, this.circuit.numQubits);

        if (hasCollapse && step === simulatedStep) { // only trigger flash if actually at that frame
            let bin = window.MathUtils.toBinaryString(cacheFrame.measuredValue, this.circuit.numQubits);
            this.ui.triggerMeasurement(bin);
        }
    }

    // --- Playback controls ---

    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        if (this.isPlaying) return;
        this.isPlaying = true;

        if (this.currentStep >= this.timelineCache.length - 1) {
            this.currentStep = 0; // Loop back
        }

        this._playNextTick();
    }

    pause() {
        this.isPlaying = false;
        if (this.playTimer) clearTimeout(this.playTimer);
    }

    _playNextTick() {
        if (!this.isPlaying) return;

        this.setPlaybackStep(this.currentStep);

        if (this.currentStep < this.timelineCache.length - 1) {
            this.currentStep++;
            this.playTimer = setTimeout(this._playNextTick.bind(this), window.AppConfig.PLAYBACK_MS_PER_STEP);
        } else {
            this.pause(); // Auto-stop at end
        }
    }

    // --- Internal Helpers ---

    _rebuildEnvironment() {
        // Reset steps to default minimum
        this.circuit.numSteps = window.AppConfig.MAX_TIMELINE_STEPS;
        this._expandTimelineIfNeeded(this.circuit.getLastActiveStep());
        this.ui.rebuildGrid(this.circuit.numQubits, this.circuit.numSteps);
    }

    _expandTimelineIfNeeded(attemptedStep) {
        if (attemptedStep >= this.circuit.numSteps - 1) {
            this.circuit.numSteps = attemptedStep + 3; // buffer
            this.ui.rebuildGrid(this.circuit.numQubits, this.circuit.numSteps);
        }
    }
}

window.StateManager = StateManager;
