/**
 * js/ui/MeasurementOverlay.js
 * Triggered when a measurement gate collapses the system.
 */

class MeasurementOverlay {
    constructor() {
        this.element = document.getElementById('measurement-overlay');
        this.textNode = document.getElementById('final-measurement');
    }

    trigger(binaryResultStr) {
        this.textNode.innerText = `|${binaryResultStr}⟩`;
        this.element.classList.remove('hidden');

        // Add CSS keyframe class
        this.element.classList.add('glitch-active');

        window.ThemeManager.setMeasuredMode();

        setTimeout(() => {
            this.element.classList.remove('hidden'); // keep it visible but faded
            this.element.classList.remove('glitch-active');
            this.element.classList.add('measured');
        }, 1500);
    }

    hide() {
        this.element.classList.add('hidden');
        this.element.classList.remove('measured', 'glitch-active');
        window.ThemeManager.setSuperpositionMode();
    }
}

window.MeasurementOverlay = MeasurementOverlay;
