// main.js

class Simulation {
    constructor() {
        this.canvas = document.getElementById('simulationCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Set canvas size
        this.canvas.width = CONFIG.CANVAS_WIDTH;
        this.canvas.height = CONFIG.CANVAS_HEIGHT;

        // Create world
        this.world = new World(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

        // Simulation state
        this.running = false;
        this.lastTime = 0;
        this.speedMultiplier = 1;

        // UI elements
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.speedBtn = document.getElementById('speedBtn');

        this.preyCountEl = document.getElementById('preyCount');
        this.predatorCountEl = document.getElementById('predatorCount');
        this.foodCountEl = document.getElementById('foodCount');
        this.timeElapsedEl = document.getElementById('timeElapsed');

        // Setup event listeners
        this.setupControls();

        // Start render loop
        this.render();
    }

    setupControls() {
        this.startBtn.addEventListener('click', () => {
            this.start();
        });

        this.pauseBtn.addEventListener('click', () => {
            this.pause();
        });

        this.resetBtn.addEventListener('click', () => {
            this.reset();
        });

        this.speedBtn.addEventListener('click', () => {
            this.toggleSpeed();
        });
    }

    start() {
        this.running = true;
        this.lastTime = performance.now();
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
    }

    pause() {
        this.running = false;
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
    }

    reset() {
        this.running = false;
        this.world.reset();
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.updateStats();
    }

    toggleSpeed() {
        if (this.speedMultiplier === 1) {
            this.speedMultiplier = 2;
            this.speedBtn.textContent = 'Speed: 2x';
        } else {
            this.speedMultiplier = 1;
            this.speedBtn.textContent = 'Speed: 1x';
        }
    }

    update(deltaTime) {
        if (!this.running) return;

        const adjustedDelta = deltaTime * this.speedMultiplier;
        this.world.update(adjustedDelta);
        this.updateStats();
    }

    updateStats() {
        const stats = this.world.getStats();
        this.preyCountEl.textContent = stats.preyCount;
        this.predatorCountEl.textContent = stats.predatorCount;
        this.foodCountEl.textContent = stats.foodCount;
        this.timeElapsedEl.textContent = Utils.formatTime(stats.time / 1000) + ` (${stats.isNight === "Yes" ? "🌙 Night" : "☀️ Day"})`;
    }

    render() {
        const currentTime = performance.now();
        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1) * 1000;
        this.lastTime = currentTime;

        if (this.running) {
            this.update(deltaTime);
        }

        this.world.draw(this.ctx);

        requestAnimationFrame(() => this.render());
    }
}

// Initialize simulation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.simulation = new Simulation();
    } catch (error) {
        console.error("Simulation Start Error:", error);
        alert("Error starting simulation: " + error.message + "\nCheck console for details.");
    }
});