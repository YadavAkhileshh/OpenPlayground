/**
 * js/ui/GateUI.js
 * Visual factory for quantum gates (HTML Nodes).
 */

class GateUI {
    /**
     * Builds the visual DOM element for a gate based on its library config.
     * @param {Object} gateConfig 
     * @param {boolean} isPaletteItem True if rendering for sidebar, false if on grid
     * @param {string} instanceId 
     * @returns {HTMLElement}
     */
    static createDOMElement(gateConfig, isPaletteItem = true, instanceId = null) {
        const el = document.createElement('div');
        el.className = `quantum-gate gate-${gateConfig.id}`;
        if (isPaletteItem) {
            el.classList.add('palette-gate');
            el.dataset.type = gateConfig.id;
        } else {
            el.classList.add('grid-gate');
            el.dataset.instanceId = instanceId;
            el.dataset.type = gateConfig.id;
        }

        // Apply style via CSS variables
        el.style.setProperty('--gate-color', gateConfig.color);

        // Content
        const symbol = document.createElement('span');
        symbol.className = 'gate-symbol';
        symbol.textContent = gateConfig.symbol;
        el.appendChild(symbol);

        // Tooltip hover trigger hook
        el.dataset.tooltip = gateConfig.name;
        el.dataset.desc = gateConfig.description;

        return el;
    }

    /**
     * Creates a connection line UI connecting Control dot to Target Gate
     * @returns {HTMLElement}
     */
    static createControlWireUI() {
        const wire = document.createElement('div');
        wire.className = 'control-wire-visual hidden';
        return wire;
    }

    /**
     * Creates the control dot node user can drag to set controls
     * @returns {HTMLElement}
     */
    static createControlDot() {
        const dot = document.createElement('div');
        dot.className = 'control-dot';
        return dot;
    }
}

window.GateUI = GateUI;
