/**
 * js/ui/CircuitGridRenderer.js
 * Manages the layout of the primary dragging grid.
 * Configures the matrix of div slots and maps screen coordinates.
 */

class CircuitGridRenderer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.wires = []; // Array of wire container DOMs
        this.slotMatrix = []; // 2D array [wire][step] of DOM slot refs

        this.numWires = 0;
        this.numSteps = 12; // Static visualization depth initially
    }

    /**
     * Rebuilds the DOM framework based on qubit count.
     * @param {number} numWires 
     * @param {number} numSteps 
     */
    buildGrid(numWires, numSteps) {
        this.numWires = numWires;
        this.numSteps = numSteps;
        this.container.innerHTML = '';
        this.wires = [];
        this.slotMatrix = [];

        for (let i = 0; i < numWires; i++) {
            let row = document.createElement('div');
            row.className = 'qubit-wire-row';
            row.dataset.wireIndex = i;

            // Wire label
            let label = document.createElement('div');
            label.className = 'qubit-label';
            label.innerHTML = `|0⟩<sub>q${i}</sub>`;
            row.appendChild(label);

            let wireLine = document.createElement('div');
            wireLine.className = 'wire-line';
            row.appendChild(wireLine);

            let slotRow = [];
            for (let j = 0; j < numSteps; j++) {
                let slot = document.createElement('div');
                slot.className = 'circuit-slot';
                slot.dataset.wire = i;
                slot.dataset.step = j;
                row.appendChild(slot);
                slotRow.push(slot);
            }

            this.container.appendChild(row);
            this.wires.push(row);
            this.slotMatrix.push(slotRow);
        }
    }

    /**
     * Given an absolute PageX/Y, resolves to grid logical coordinates if hovered.
     * @param {number} x 
     * @param {number} y 
     * @returns {Object|null} { wire: number, step: number, slotDOM: HTMLElement } 
     */
    resolveDropCoordinates(x, y) {
        // Iterate over slots to find hit box bounding rects.
        // O(W*S) check isn't bad for e.g. 5x12 grid.
        for (let w = 0; w < this.numWires; w++) {
            for (let s = 0; s < this.numSteps; s++) {
                let slot = this.slotMatrix[w][s];
                let rect = slot.getBoundingClientRect();

                // Slight padding leniency
                if (x >= rect.left && x <= rect.right &&
                    y >= rect.top && y <= rect.bottom) {
                    return { wire: w, step: s, slotDOM: slot };
                }
            }
        }
        return null;
    }

    /**
     * Puts a specific DOM gate onto a logical slot.
     * @param {HTMLElement} gateDOM 
     * @param {number} wire 
     * @param {number} step 
     */
    placeGateVisually(gateDOM, wire, step) {
        let slot = this.slotMatrix[wire][step];
        if (slot) {
            slot.appendChild(gateDOM);
        }

        // Remove 'dragging' absolute positioning physics
        gateDOM.style.position = 'relative';
        gateDOM.style.left = '0';
        gateDOM.style.top = '0';
        gateDOM.style.zIndex = '1';
    }

    /**
     * Removes all gates visually from grid.
     */
    clearVisually() {
        for (let w = 0; w < this.numWires; w++) {
            for (let s = 0; s < this.numSteps; s++) {
                this.slotMatrix[w][s].innerHTML = ''; // Nuke gates
            }
        }
    }
}

window.CircuitGridRenderer = CircuitGridRenderer;
