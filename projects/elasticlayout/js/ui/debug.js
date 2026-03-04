/**
 * Custom Minimal Debug UI
 * Allows tweaking physics parameters in real-time.
 */
export class DebugUI {
    constructor(world) {
        this.world = world;
        this.container = document.createElement('div');
        this.container.style.position = 'absolute';
        this.container.style.top = '10px';
        this.container.style.right = '10px';
        this.container.style.width = '200px';
        this.container.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        this.container.style.color = '#fff';
        this.container.style.padding = '10px';
        this.container.style.borderRadius = '8px';
        this.container.style.fontFamily = 'monospace';
        this.container.style.fontSize = '12px';
        this.container.style.zIndex = '1000';

        document.body.appendChild(this.container);

        this.addTitle('Physics Debug');
        this.addValueDisplay('Particles', () => this.world.particles.length);
        this.addValueDisplay('Constraints', () => this.world.constraints.length);

        this.addSlider('Gravity', 0, 2, 0.5, (v) => {
            this.world.particles.forEach(p => p.gravity.y = parseFloat(v));
        });

        this.addSlider('Friction', 0.9, 1.0, 0.96, (v) => {
            this.world.particles.forEach(p => p.friction = parseFloat(v));
        });

        this.addCheckbox('Show Constraints', true, (v) => {
            // This requires modifying render logic to check this flag
            // For now, we interact with global CSS or direct object props?
            // Let's toggle a class on the canvas
            const canvas = document.getElementById('physics-canvas');
            canvas.style.opacity = v ? '1' : '0';
        });

        this.fpsEl = this.addValueDisplay('FPS', () => 0);
        this.lastTime = performance.now();
        this.frameCount = 0;
    }

    update() {
        const now = performance.now();
        this.frameCount++;
        if (now - this.lastTime >= 1000) {
            const fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = now;
            // Update displays
            this.updateDisplays(fps);
        }
    }

    updateDisplays(fps) {
        // Hacky way to update text content of value displays
        // In a real system we'd map IDs
        // But here we'll just re-render or select?
        // Let's store references.
        if (this.fpsEl) this.fpsEl.textContent = fps;
    }

    addTitle(text) {
        const el = document.createElement('div');
        el.textContent = text;
        el.style.fontWeight = 'bold';
        el.style.marginBottom = '5px';
        el.style.borderBottom = '1px solid #555';
        this.container.appendChild(el);
    }

    addValueDisplay(label, getValueFn) {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.marginBottom = '4px';

        const labelEl = document.createElement('span');
        labelEl.textContent = label;

        const valEl = document.createElement('span');
        valEl.textContent = getValueFn();

        row.appendChild(labelEl);
        row.appendChild(valEl);
        this.container.appendChild(row);

        if (label === 'FPS') return valEl;
        return null;
    }

    addSlider(label, min, max, val, onChange) {
        const row = document.createElement('div');
        row.style.marginBottom = '5px';

        const labelRow = document.createElement('div');
        labelRow.style.display = 'flex';
        labelRow.style.justifyContent = 'space-between';

        const labelEl = document.createElement('span');
        labelEl.textContent = label;

        const valEl = document.createElement('span');
        valEl.textContent = val;

        labelRow.appendChild(labelEl);
        labelRow.appendChild(valEl);

        const input = document.createElement('input');
        input.type = 'range';
        input.min = min;
        input.max = max;
        input.step = 0.01;
        input.value = val;
        input.style.width = '100%';

        input.addEventListener('input', (e) => {
            valEl.textContent = e.target.value;
            onChange(e.target.value);
        });

        row.appendChild(labelRow);
        row.appendChild(input);
        this.container.appendChild(row);
    }

    addCheckbox(label, val, onChange) {
        const row = document.createElement('div');
        row.style.marginBottom = '5px';
        row.style.display = 'flex';
        row.style.alignItems = 'center';

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = val;
        input.style.marginRight = '8px';

        input.addEventListener('change', (e) => {
            onChange(e.target.checked);
        });

        const labelEl = document.createElement('span');
        labelEl.textContent = label;

        row.appendChild(input);
        row.appendChild(labelEl);
        this.container.appendChild(row);
    }
}
