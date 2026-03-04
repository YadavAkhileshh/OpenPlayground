/**
 * Reusable Knob Component Logic
 */
export class Knob {
    constructor(element, min, max, initial, callback) {
        this.element = element;
        this.min = min;
        this.max = max;
        this.value = initial;
        this.callback = callback;
        
        // State
        this.isDragging = false;
        this.startY = 0;
        this.sensitivity = 0.005; // Value change per pixel

        this.init();
        this.updateUI();
    }

    init() {
        this.element.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.startY = e.clientY;
            document.body.style.cursor = 'ns-resize';
            
            // Add global listeners
            window.addEventListener('mousemove', this.handleDrag);
            window.addEventListener('mouseup', this.stopDrag);
        });
    }

    handleDrag = (e) => {
        if (!this.isDragging) return;
        e.preventDefault();

        const deltaY = this.startY - e.clientY;
        this.startY = e.clientY;

        const range = this.max - this.min;
        const deltaVal = deltaY * (range * this.sensitivity);

        this.value = Math.min(Math.max(this.value + deltaVal, this.min), this.max);
        
        this.updateUI();
        this.callback(this.value);
    }

    stopDrag = () => {
        this.isDragging = false;
        document.body.style.cursor = 'default';
        window.removeEventListener('mousemove', this.handleDrag);
        window.removeEventListener('mouseup', this.stopDrag);
    }

    updateUI() {
        // Calculate rotation (-135deg to +135deg standard synth knob range)
        const pct = (this.value - this.min) / (this.max - this.min);
        const deg = -135 + (pct * 270);
        
        this.element.style.setProperty('--r', `${deg}deg`);
        this.element.style.setProperty('--p', `${pct * 100}%`);
    }
}