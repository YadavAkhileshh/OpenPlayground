/**
 * Controls.js
 * Manages UI sliders, buttons, and connecting them to the simulation.
 */

export class Controls {
    constructor(app) {
        this.app = app;
        this.container = document.getElementById('dynamic-params');
        this.initGlobalInputs();
    }

    initGlobalInputs() {
        // Attractor Select
        const sel = document.getElementById('attractor-select');
        sel.addEventListener('change', (e) => {
            this.app.setAttractor(e.target.value);
            // Reset camera on switch? Optional.
            // this.app.camera.reset();
        });

        // Speed Slider
        document.getElementById('speed-slider').addEventListener('input', (e) => {
            this.app.speed = parseFloat(e.target.value);
        });

        // Reset Button
        document.getElementById('btn-reset').addEventListener('click', () => {
            // Reset Params of current attractor
            this.app.currentAttractor.resetParams();
            // Re-generate sliders to show reset values
            this.generateSliders(this.app.currentAttractor);
            // Clear points
            this.app.points = [];
            // Reset position
            this.app.currentPos = this.app.currentAttractor.startPoint.clone();
        });

        // Pause/Play
        const btnPause = document.getElementById('btn-pause');
        btnPause.addEventListener('click', () => {
            this.app.isRunning = !this.app.isRunning;
            btnPause.innerText = this.app.isRunning ? 'Pause' : 'Resume';
        });

        // Snapshot
        document.getElementById('btn-snapshot').addEventListener('click', () => {
            this.app.recorder.takeSnapshot();
        });

        // Record
        const btnRecord = document.getElementById('btn-record');
        btnRecord.addEventListener('click', () => {
            const isRec = this.app.recorder.toggleRecording();
            btnRecord.innerText = isRec ? 'Stop Recording' : 'Record Video';
            btnRecord.classList.toggle('recording', isRec);
        });

        // Theme Toggle
        document.getElementById('btn-theme-toggle').addEventListener('click', () => {
            // We need access to ThemeManager. 
            // Ideally Controls has access to main app, which has themeManager.
            if (this.app.themeManager) {
                const newTheme = this.app.themeManager.cycle();
                // Update button text?
                // e.target.innerText = `Theme: ${newTheme}`; 
                // But the button text is "Toggle High Contrast" originally.
            }
            // For legacy support or if no ThemeManager:
            document.body.classList.toggle('high-contrast');
        });

        // Hide Controls
        document.getElementById('toggle-controls').addEventListener('click', () => {
            const panel = document.getElementById('controls-panel');
            panel.classList.toggle('minimized');
        });
    }

    generateSliders(attractor) {
        this.container.innerHTML = ''; // Clear existing
        const params = attractor.params;

        for (const [key, value] of Object.entries(params)) {
            const wrapper = document.createElement('div');
            wrapper.className = 'control-group';

            const labelObj = document.createElement('label');
            labelObj.innerHTML = `<span>${key}</span> <span>${value.toFixed(3)}</span>`;

            // Heuristic for slider range
            // If value is small (<1), assume range 0-2? 
            // If value is around 10, range 0-30?
            let min = 0;
            let max = value * 2 + 1;
            if (value < 0) min = value * 2;

            // Special cases
            if (key === 'rho' && value > 20) max = 100;

            const slider = document.createElement('input');
            slider.type = 'range';
            slider.min = min;
            slider.max = max;
            slider.step = 0.01;
            slider.value = value;

            slider.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                attractor.params[key] = val;
                labelObj.querySelector('span:last-child').innerText = val.toFixed(3);
            });

            wrapper.appendChild(labelObj);
            wrapper.appendChild(slider);
            this.container.appendChild(wrapper);
        }
    }
}
