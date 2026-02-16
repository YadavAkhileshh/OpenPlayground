/**
 * Knob UI Component.
 * A rotary control that handles vertical drag interactions.
 * Maps mouse movement to a value range and updates visual rotation.
 */
export class Knob {
    constructor(parentElement, label, initialValue, min, max, callback) {
        this.value = initialValue;
        this.min = min;
        this.max = max;
        this.callback = callback;
        this.isDragging = false;
        this.startY = 0;
        this.sensitivity = 0.005;

        this.element = this.render(parentElement, label);
        this.updateRotation();
        this.attachEvents();
    }

    render(parent, label) {
        const container = document.createElement('div');
        container.className = 'knob-container';

        if (label) {
            const labelEl = document.createElement('span');
            labelEl.className = 'knob-label';
            labelEl.textContent = label;
            container.appendChild(labelEl);
        }

        const outer = document.createElement('div');
        outer.className = 'knob-outer';

        const indicator = document.createElement('div');
        indicator.className = 'knob-indicator';
        outer.appendChild(indicator);

        container.appendChild(outer);
        parent.appendChild(container);

        this.indicator = indicator;
        return outer;
    }

    attachEvents() {
        this.element.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.startY = e.clientY;
            this.startValue = this.value;
            document.body.style.cursor = 'ns-resize';

            // Prevent text selection
            e.preventDefault();

            window.addEventListener('mousemove', this.onMouseMove);
            window.addEventListener('mouseup', this.onMouseUp);
        });
    }

    onMouseMove = (e) => {
        if (!this.isDragging) return;

        const deltaY = this.startY - e.clientY;
        const range = this.max - this.min;
        const deltaValue = deltaY * this.sensitivity * range;

        this.value = Math.max(this.min, Math.min(this.max, this.startValue + deltaValue));
        this.updateRotation();

        if (this.callback) this.callback(this.value);
    }

    onMouseUp = () => {
        this.isDragging = false;
        document.body.style.cursor = 'default';
        window.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('mouseup', this.onMouseUp);
    }

    updateRotation() {
        // Map min-max to -135deg to +135deg (270 degree range)
        const pct = (this.value - this.min) / (this.max - this.min);
        const angle = -135 + (pct * 270);
        this.indicator.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
    }

    setValue(val) {
        this.value = Math.max(this.min, Math.min(this.max, val));
        this.updateRotation();
    }
}
