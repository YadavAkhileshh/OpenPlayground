export class UIManager {
    constructor(simulation) {
        this.sim = simulation;
        this.elements = {};

        // Cache DOM elements
        this.initElements();

        // Bind events
        this.bindEvents();

        // Create dynamic tabs
        this.createTabs();
    }

    /**
     * Cache all necessary DOM elements for quick access.
     */
    initElements() {
        this.elements = {
            gen: document.getElementById('gen-count'),
            pop: document.getElementById('pop-count'),
            best: document.getElementById('best-fitness'),
            time: document.getElementById('sim-time'),
            active: document.getElementById('active-genomes'),

            speed: document.getElementById('speed-slider'),
            valSpeed: document.getElementById('speed-val'),
            mut: document.getElementById('mutation-rate'),
            valMut: document.getElementById('mutation-val'),
            popSize: document.getElementById('pop-size'),
            valPop: document.getElementById('pop-val'),

            resetBtn: document.getElementById('reset-btn'),

            // Container for dynamic buttons
            controlsPanel: document.getElementById('controls-panel')
        };

        // Initialize values
        this.updateLabels();
    }

    /**
     * Bind event listeners to UI controls.
     */
    bindEvents() {
        // Speed Slider
        this.elements.speed.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            this.sim.simSpeed = val;
            this.elements.valSpeed.innerText = val + 'x';
            this.sim.isWarping = false; // Disable warp if slider moved
        });

        // Mutation Rate Slider
        this.elements.mut.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            this.sim.mutationRate = val;
            this.elements.valMut.innerText = val.toFixed(2);
        });

        // Population Size Slider
        this.elements.popSize.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            this.elements.valPop.innerText = val;
            // Note: Does not apply immediately, requires reset usually
            // But main.js handles this property directly on the population object if linked.
            // We need to update the sim's population target size
            this.sim.population.size = val;
        });

        // Reset Button
        this.elements.resetBtn.addEventListener('click', () => {
            this.sim.reset();
        });
    }

    /**
     * Create additional UI controls dynamically.
     */
    createTabs() {
        const container = this.elements.controlsPanel;

        // Separator
        const hr = document.createElement('hr');
        hr.style.borderColor = '#333';
        hr.style.margin = '10px 0';
        container.appendChild(hr);

        // Advanced Controls Group
        const advancedGroup = document.createElement('div');
        advancedGroup.className = 'control-group';

        // Clone Best Button
        const cloneBtn = this.createButton('Clone Best', () => this.sim.cloneBest());
        advancedGroup.appendChild(cloneBtn);

        // Save Best Button
        const saveBtn = this.createButton('Save Best', () => this.sim.saveBest());
        advancedGroup.appendChild(saveBtn);

        // Load Best Button
        const loadBtn = this.createButton('Load Best', () => this.sim.loadBest());
        advancedGroup.appendChild(loadBtn);

        // Warp Speed Button
        const warpBtn = this.createButton('Warp Speed', () => this.sim.toggleWarp());
        advancedGroup.appendChild(warpBtn);

        container.appendChild(advancedGroup);
    }

    /**
     * Helper to create a styled button.
     * @param {string} text 
     * @param {Function} onClick 
     */
    createButton(text, onClick) {
        const btn = document.createElement('button');
        btn.innerText = text;
        btn.onclick = onClick;
        btn.style.marginBottom = '5px';
        return btn;
    }

    /**
     * Update all statistical labels on the UI.
     */
    updateStats() {
        // Time
        this.elements.time.innerText = (this.sim.timer / 60).toFixed(1) + 's';

        // Generation
        this.elements.gen.innerText = this.sim.population.generation;

        // Population
        this.elements.pop.innerText = this.sim.population.creatures.length;

        // Best Fitness
        // Find best in current population
        let best = 0;
        for (const c of this.sim.population.creatures) {
            if (c.fitness > best) best = c.fitness;
        }
        this.elements.best.innerText = best.toFixed(1) + 'm';

        // Active Genomes (dummy stat for now, could be species count)
        if (this.elements.active) {
            this.elements.active.innerText = this.sim.population.creatures.filter(c => c.alive).length;
        }
    }

    /**
     * Force update of input labels (e.g. after load).
     */
    updateLabels() {
        this.elements.valSpeed.innerText = this.sim.simSpeed + 'x';
        this.elements.valMut.innerText = this.sim.mutationRate;
        this.elements.valPop.innerText = this.sim.population.size;
    }

    /**
     * Display a temporary notification message.
     * @param {string} msg 
     */
    notify(msg) {
        // TODO: Implement toggleable toast notification
        alert(msg);
    }
}
