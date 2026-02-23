export class Inspector {
    constructor(elementId) {
        this.element = document.getElementById(elementId);
    }

    update(comp) {
        this.element.innerHTML = '';

        if (!comp) {
            this.element.innerHTML = '<div class="empty-state">Select a component to edit properties</div>';
            return;
        }

        // Common properties
        this.createPropParams('Rotation (deg)',
            Math.round(comp.rotation * (180 / Math.PI)),
            (val) => comp.rotate(val * (Math.PI / 180)),
            0, 360
        );

        if (comp.type === 'laser') {
            this.createColorPicker('Color', comp.color, (val) => comp.color = val);
            this.createToggle('Power', comp.isOn, (val) => comp.isOn = val);
        }

        if (comp.type === 'gate') {
            const row = document.createElement('div');
            row.className = 'property-row';
            row.innerHTML = `<span class="property-label">Logic Type</span>`;
            const select = document.createElement('select');
            select.className = 'property-input';
            ['AND', 'OR', 'NOT', 'NAND'].forEach(op => {
                const opt = document.createElement('option');
                opt.value = op;
                opt.textContent = op;
                opt.selected = comp.op === op;
                select.appendChild(opt);
            });
            select.onchange = (e) => comp.op = e.target.value;
            row.appendChild(select);
            this.element.appendChild(row);
        }

        if (comp.type === 'splitter') {
            this.createPropParams('Ratio',
                comp.ratio,
                (val) => comp.ratio = val,
                0, 1
            );
        }

        if (comp.type === 'filter') {
            this.createColorPicker('Color', comp.color, (val) => comp.color = val);
        }

        if (comp.type === 'prism') {
            this.createPropParams('Refraction Index (IOR)',
                comp.ior,
                (val) => comp.ior = val,
                1.0, 3.0
            );
        }
    }

    createPropParams(label, value, onChange, min, max) {
        const row = document.createElement('div');
        row.className = 'property-row';

        const lbl = document.createElement('span');
        lbl.className = 'property-label';
        lbl.textContent = label;

        const input = document.createElement('input');
        input.type = 'range';
        input.min = min;
        input.max = max;
        input.step = (max - min) / 100;
        input.value = value;
        input.oninput = (e) => onChange(parseFloat(e.target.value));

        row.appendChild(lbl);
        row.appendChild(input);
        this.element.appendChild(row);
    }

    createColorPicker(label, value, onChange) {
        const row = document.createElement('div');
        row.className = 'property-row';
        const lbl = document.createElement('span');
        lbl.className = 'property-label';
        lbl.textContent = label;
        const input = document.createElement('input');
        input.type = 'color';
        input.value = value;
        input.oninput = (e) => onChange(e.target.value);
        row.appendChild(lbl);
        row.appendChild(input);
        this.element.appendChild(row);
    }

    createToggle(label, value, onChange) {
        const row = document.createElement('div');
        row.className = 'property-row';
        const lbl = document.createElement('span');
        lbl.className = 'property-label';
        lbl.textContent = label;
        const btn = document.createElement('button');
        btn.className = 'btn secondary';
        btn.textContent = value ? 'ON' : 'OFF';
        btn.onclick = () => {
            const newState = !btn.textContent.includes('ON');
            btn.textContent = newState ? 'ON' : 'OFF';
            onChange(newState);
        };
        row.appendChild(lbl);
        row.appendChild(btn);
        this.element.appendChild(row);
    }
}
