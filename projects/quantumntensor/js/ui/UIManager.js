/**
 * js/ui/UIManager.js
 * The top-level class orchestrating the DOM updates
 * routing internal App state to Graph renderers.
 */

class UIManager {
    constructor() {
        this.gridRenderer = new window.CircuitGridRenderer('circuit-grid');
        this.probChart = new window.ProbabilityChart('probability-chart');
        this.timelineRenderer = new window.TimelineRenderer();
        this.animator = new window.AnimationEngine();
        this.theme = window.ThemeManager;
        this.tooltip = new window.TooltipManager();
        this.measurementOverlay = new window.MeasurementOverlay();

        this.blochSpheres = [];
        this.blochContainer = document.getElementById('bloch-spheres-container');
        this.stateReadout = document.getElementById('state-vector-display');

        this.theme.init();
        this.animator.start();

        this.paletteBuilt = false;
    }

    buildPalette() {
        if (this.paletteBuilt) return;
        const container = document.getElementById('gate-palette');
        const gates = window.GateLibrary.getAvailableGates();

        gates.forEach(g => {
            let el = window.GateUI.createDOMElement(g, true);
            container.appendChild(el);
        });
        this.paletteBuilt = true;
    }

    rebuildGrid(numQubits, timelineLength) {
        this.gridRenderer.buildGrid(numQubits, timelineLength);
        this.timelineRenderer.updateBounds(timelineLength);

        // Rebuild Bloch Spheres
        this.blochContainer.innerHTML = '';
        this.blochSpheres = [];
        for (let i = 0; i < numQubits; i++) {
            this.blochSpheres.push(new window.BlochSphereRenderer(this.blochContainer, i));
        }
    }

    syncStateVisuals(quantumState, isMeasured, numQubits) {
        if (!quantumState) return;

        // 1. Chart
        this.probChart.updateData(quantumState.getProbabilities(), numQubits);

        // 2. Bloch Spheres (requires math calculation per sphere)
        for (let i = 0; i < numQubits; i++) {
            let bData = window.BlochMath.calculateCoordinates(quantumState.getVector(), numQubits, i);
            if (this.blochSpheres[i]) {
                this.blochSpheres[i].updateCoordinates(bData.theta, bData.phi, bData.radius);
            }
        }

        // 3. Vector Readout (Text)
        this._updateVectorText(quantumState);

        // 4. Overlays
        if (!isMeasured) {
            this.measurementOverlay.hide();
        }
    }

    syncCircuit(circuitData) {
        this.gridRenderer.clearVisually();

        // Repopulate DOM
        for (let gate of circuitData.gates) {
            let config = window.GateLibrary.getAvailableGates().find(g => g.id === gate.type);
            let domNode = window.GateUI.createDOMElement(config, false, gate.id);
            this.gridRenderer.placeGateVisually(domNode, gate.target, gate.step);

            // Note: Control lines omitted for simplicity in DOM, just highlighting the gate. 
        }
    }

    triggerMeasurement(binStr) {
        this.measurementOverlay.trigger(binStr);
    }

    updateScrubber(step) {
        this.timelineRenderer.updateUI(step);
    }

    _updateVectorText(qs) {
        let probs = qs.getProbabilities();
        let vector = qs.getVector();
        let html = '';
        let n = qs.numQubits;

        for (let i = 0; i < probs.length; i++) {
            let magSq = probs[i];
            if (magSq > window.MathConstants.TOLERANCE) {
                let amp = vector.get(i);
                let bin = window.MathUtils.toBinaryString(i, n);
                // Clean complex text formatting
                let complexStr = amp.toString(2);
                html += `<div><span class="basis">|${bin}⟩</span> <span class="amp">(${complexStr})</span></div>`;
            }
        }
        this.stateReadout.innerHTML = html;
    }
}

window.UIManager = UIManager;
