// main.js
class App {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.world = new World(this.canvas);
        this.simulation = new Simulation();
        
        this.isRunning = true;
        this.speedMultiplier = 1.0;
        this.showTrails = true;
        this.lastTime = performance.now();

        this.setupUI();
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        this.run();
    }

    setupUI() {
        const playPauseBtn = document.getElementById('playPause');
        const resetBtn = document.getElementById('reset');
        const spawnBtn = document.getElementById('spawn');
        const speedSlider = document.getElementById('speed');
        const speedValue = document.getElementById('speedValue');
        const showTrailsCheckbox = document.getElementById('showTrails');

        playPauseBtn.addEventListener('click', () => {
            this.isRunning = !this.isRunning;
            playPauseBtn.textContent = this.isRunning ? 'Pause' : 'Play';
        });

        resetBtn.addEventListener('click', () => {
            this.simulation.reset();
        });

        spawnBtn.addEventListener('click', () => {
            if (this.simulation.organisms.length < this.simulation.maxPopulation) {
                this.simulation.spawnOrganism();
            }
        });

        speedSlider.addEventListener('input', (e) => {
            this.speedMultiplier = parseFloat(e.target.value);
            speedValue.textContent = this.speedMultiplier.toFixed(1);
        });

        showTrailsCheckbox.addEventListener('change', (e) => {
            this.showTrails = e.target.checked;
        });
    }

    resize() {
        this.world.resize();
    }

    updateStats() {
        const stats = this.simulation.getStats();
        
        document.getElementById('population').textContent = stats.population;
        document.getElementById('births').textContent = stats.births;
        document.getElementById('deaths').textContent = stats.deaths;
        document.getElementById('avgEnergy').textContent = stats.avgEnergy;
        document.getElementById('generation').textContent = stats.generation;
    }

    run() {
        const currentTime = performance.now();
        const dt = Math.min((currentTime - this.lastTime) / 16.67, 2);
        this.lastTime = currentTime;

        if (this.isRunning) {
            this.simulation.update(dt, this.speedMultiplier);
        }

        this.world.render(this.simulation.organisms, this.showTrails);
        this.updateStats();

        requestAnimationFrame(() => this.run());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new App();
});