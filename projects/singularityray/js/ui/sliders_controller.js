/**
 * SingularityRay JS - UI - Sliders Controller
 * Binds the HTML inputs to engine state parameters and visually updates 
 * the custom filled track width.
 */

export class SlidersController {
    /**
     * @param {import('../core/event_bus.js').CoreEventBus} uiBus 
     */
    constructor(uiBus) {
        this.uiBus = uiBus;

        // Cache DOM elements
        this.sliders = {
            mass: {
                input: document.getElementById('slider-mass'),
                display: document.getElementById('val-mass'),
                fill: document.getElementById('fill-mass'),
                event: 'massChanged',
                format: (v) => parseFloat(v).toFixed(1)
            },
            diskIntensity: {
                input: document.getElementById('slider-disk-intensity'),
                display: document.getElementById('val-disk-intensity'),
                fill: document.getElementById('fill-disk-intensity'),
                event: 'diskIntensityChanged',
                format: (v) => parseFloat(v).toFixed(2)
            },
            raySteps: {
                input: document.getElementById('slider-ray-steps'),
                display: document.getElementById('val-ray-steps'),
                fill: document.getElementById('fill-ray-steps'),
                event: 'rayStepsChanged',
                format: (v) => parseInt(v).toString()
            }
        };

        this._bindAll();

        // Initialize visuals on boot
        this._updateVisuals(this.sliders.mass);
        this._updateVisuals(this.sliders.diskIntensity);
        this._updateVisuals(this.sliders.raySteps);
    }

    _bindAll() {
        // Generic binding function for all configured sliders
        Object.keys(this.sliders).forEach(key => {
            const config = this.sliders[key];
            if (!config.input) return;

            config.input.addEventListener('input', (e) => {
                const val = e.target.value;
                // Update text readout
                if (config.display) config.display.textContent = config.format(val);
                // Update track styling
                this._updateVisuals(config);
                // Notify system
                this.uiBus.emit(config.event, parseFloat(val));
            });
        });
    }

    /**
     * Computes percentage and updates custom fill width CSS
     */
    _updateVisuals(config) {
        if (!config.input || !config.fill) return;

        const min = parseFloat(config.input.min) || 0;
        const max = parseFloat(config.input.max) || 100;
        const val = parseFloat(config.input.value);

        // Calculate percentage for CSS width
        const percentage = ((val - min) / (max - min)) * 100;

        config.fill.style.width = `${percentage}%`;
    }

    /**
     * Programmatically set a slider value matching config constraints
     * @param {string} sliderKey 
     * @param {number} value 
     */
    setValue(sliderKey, value) {
        const config = this.sliders[sliderKey];
        if (config && config.input) {
            config.input.value = value;
            if (config.display) config.display.textContent = config.format(value);
            this._updateVisuals(config);
            this.uiBus.emit(config.event, value);
        }
    }
}
