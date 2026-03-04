/**
 * SlimeNet - UI Controls
 * 
 * Generates the UI panel based on Config structure.
 */

class UIControls {
    constructor() {
        this.panel = document.getElementById('controls-panel');
        this.tooltip = document.getElementById('tooltip');
        this.init();
    }

    init() {
        // Agent Settings
        this.createGroup('Agents', [
            { type: 'slider', label: 'Speed', obj: Config.agents, prop: 'speed', min: 0.1, max: 5.0, step: 0.1 },
            { type: 'slider', label: 'Sensor Dist', obj: Config.agents, prop: 'sensorDist', min: 1, max: 50, step: 1 },
            { type: 'slider', label: 'Sensor Angle', obj: Config.agents, prop: 'sensorAngle', min: 1, max: 90, step: 1 },
            // Feature 1
            { type: 'slider', label: 'Repulsion', obj: Config.agents, prop: 'interSpeciesRepulsion', min: 0, max: 2, step: 0.1 }
        ]);

        // Grid Settings
        this.createGroup('Environment', [
            { type: 'slider', label: 'Decay Rate', obj: Config.grid, prop: 'decayRate', min: 0.80, max: 0.999, step: 0.001 },
            { type: 'slider', label: 'Diffusion', obj: Config.grid, prop: 'diffuseRate', min: 0.01, max: 1.0, step: 0.01 },
            // Feature 5
            { type: 'slider', label: 'Flow X', obj: Config.grid, prop: 'flowX', min: -2, max: 2, step: 0.1 },
            { type: 'slider', label: 'Flow Y', obj: Config.grid, prop: 'flowY', min: -2, max: 2, step: 0.1 }
        ]);

        // Visuals & Tools
        this.createGroup('Tools', [
            // Feature 8
            { type: 'select', label: 'Brush Type', obj: window.app.input, prop: 'brushType', options: ['food', 'obstacle', 'eraser'] },
            { type: 'slider', label: 'Brush Size', obj: window.app.input, prop: 'brushSize', min: 5, max: 100, step: 5 },
            { type: 'select', label: 'Color Mode', obj: Config.render, prop: 'colorMode', options: ['bio', 'fire', 'neon'] }
        ]);

        // Actions
        this.createActionGroup([
            { label: 'Clear Grid', action: () => window.resetGrid && window.resetGrid() },
            { label: 'Respawn Agents', action: () => window.respawnAgents && window.respawnAgents() },
            // Feature 7
            { label: 'Screenshot', action: () => this.takeScreenshot() },
            // Feature 9
            { label: 'Procedural Map', action: () => this.generateMap() }
        ]);
    }

    takeScreenshot() {
        const link = document.createElement('a');
        link.download = 'slimenet_' + Date.now() + '.png';
        link.href = document.getElementById('sim-canvas').toDataURL();
        link.click();
    }

    generateMap() {
        // Feature 9: Simple random map
        // Randomly place obstacles and food
        window.resetGrid();
        const w = window.innerWidth;
        const h = window.innerHeight;
        // 10 random obstacles
        for (let i = 0; i < 10; i++) {
            window.app.input.grid.addObstacle(Math.random() * w, Math.random() * h, 30 + Math.random() * 50);
        }
        // 20 random food sources (Using FoodSystem)
        if (window.app && window.app.food) {
            window.app.food.generateRandom(20, w, h);
        }
    }

    createGroup(title, controls) {
        const group = document.createElement('div');
        group.className = 'control-group';

        const h = document.createElement('div');
        h.className = 'control-group-title';
        h.innerText = title;
        group.appendChild(h);

        controls.forEach(c => {
            if (c.type === 'slider') this.addSlider(group, c);
            if (c.type === 'toggle') this.addToggle(group, c);
            if (c.type === 'select') this.addSelect(group, c);
        });

        this.panel.appendChild(group);
    }

    createActionGroup(actions) {
        const group = document.createElement('div');
        group.className = 'control-group';

        actions.forEach(a => {
            const btn = document.createElement('button');
            btn.className = 'control-button';
            btn.innerText = a.label;
            btn.addEventListener('click', a.action);
            group.appendChild(btn);
        });

        this.panel.appendChild(group);
    }

    addSlider(parent, conf) {
        const div = document.createElement('div');
        div.className = 'control-slider';

        const header = document.createElement('div');
        header.className = 'slider-header';

        const label = document.createElement('span');
        label.className = 'slider-label';
        label.innerText = conf.label;

        const valDisplay = document.createElement('span');
        valDisplay.className = 'slider-value';
        valDisplay.innerText = conf.obj[conf.prop];

        header.appendChild(label);
        header.appendChild(valDisplay);
        div.appendChild(header);

        const wrap = document.createElement('div');
        wrap.className = 'range-input-wrapper';

        const input = document.createElement('input');
        input.type = 'range';
        input.min = conf.min;
        input.max = conf.max;
        input.step = conf.step;
        input.value = conf.obj[conf.prop];

        input.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            conf.obj[conf.prop] = val;
            valDisplay.innerText = val;
        });

        wrap.appendChild(input);
        div.appendChild(wrap);
        parent.appendChild(div);
    }

    addToggle(parent, conf) {
        const div = document.createElement('div');
        div.className = `control-toggle ${conf.obj[conf.prop] ? 'active' : ''}`;

        // Function to update visual state based on external changes
        const updateState = () => {
            if (conf.obj[conf.prop]) div.classList.add('active');
            else div.classList.remove('active');
        };

        const label = document.createElement('span');
        label.className = 'toggle-label';
        label.innerText = conf.label;

        const sw = document.createElement('div');
        sw.className = 'toggle-switch';

        div.appendChild(label);
        div.appendChild(sw);

        div.addEventListener('click', () => {
            conf.obj[conf.prop] = !conf.obj[conf.prop];
            updateState();
        });

        updateState();
        parent.appendChild(div);
    }

    addSelect(parent, conf) {
        const div = document.createElement('div');
        div.className = 'control-select';

        const label = document.createElement('span');
        label.className = 'select-label';
        label.innerText = conf.label;

        const sel = document.createElement('select');
        conf.options.forEach(opt => {
            const o = document.createElement('option');
            o.value = opt;
            o.innerText = opt.toUpperCase();
            if (opt === conf.obj[conf.prop]) o.selected = true;
            sel.appendChild(o);
        });

        sel.addEventListener('change', (e) => {
            conf.obj[conf.prop] = e.target.value;
        });

        div.appendChild(label);
        div.appendChild(sel);
        parent.appendChild(div);
    }
}

window.UIControls = UIControls;
