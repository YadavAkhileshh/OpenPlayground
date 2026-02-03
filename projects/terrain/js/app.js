/**
 * App.js - Main Application Controller
 * Coordinates UI, terrain generation, erosion simulation, and rendering
 */

class TerrainErosionApp {
    constructor() {
        // Core components
        this.terrain = null;
        this.erosion = null;
        this.renderer = null;
        
        // Simulation state
        this.isSimulating = false;
        this.simulationInterval = null;
        this.totalYears = 0;
        this.totalIterations = 0;
        
        // Parameters
        this.params = {
            terrainSize: 128,
            terrainScale: 50,
            octaves: 4,
            roughness: 0.5,
            erosionStrength: 0.5,
            rainAmount: 1.0,
            evaporationRate: 0.05,
            simulationSpeed: 500 // years per second
        };
        
        // Initialize
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        // Get canvas
        const canvas = document.getElementById('terrainCanvas');
        if (!canvas) {
            console.error('Canvas not found');
            return;
        }

        // Create terrain and renderer
        this.terrain = new TerrainGenerator(this.params.terrainSize);
        this.renderer = new TerrainRenderer(canvas, this.terrain);
        this.erosion = new HydraulicErosion(this.terrain);

        // Generate initial terrain
        this.generateTerrain();

        // Setup UI event listeners
        this.setupEventListeners();

        // Handle window resize
        window.addEventListener('resize', () => {
            this.renderer.handleResize();
        });

        // Update stats display
        this.updateStats();
    }

    /**
     * Setup all UI event listeners
     */
    setupEventListeners() {
        // Terrain generation controls
        this.setupRangeInput('terrainSize', (value) => {
            this.params.terrainSize = parseInt(value);
        });

        this.setupRangeInput('terrainScale', (value) => {
            this.params.terrainScale = parseFloat(value);
        });

        this.setupRangeInput('octaves', (value) => {
            this.params.octaves = parseInt(value);
        });

        this.setupRangeInput('roughness', (value) => {
            this.params.roughness = parseFloat(value);
        });

        // Erosion controls
        this.setupRangeInput('erosionStrength', (value) => {
            this.params.erosionStrength = parseFloat(value);
            this.erosion.setParameters({ erosionStrength: this.params.erosionStrength });
        });

        this.setupRangeInput('rainAmount', (value) => {
            this.params.rainAmount = parseFloat(value);
        });

        this.setupRangeInput('evaporationRate', (value) => {
            this.params.evaporationRate = parseFloat(value);
            this.erosion.setParameters({ evaporationRate: this.params.evaporationRate });
        });

        this.setupRangeInput('simulationSpeed', (value) => {
            this.params.simulationSpeed = parseFloat(value);
            if (this.isSimulating) {
                this.stopSimulation();
                this.startSimulation();
            }
        });

        // Buttons
        document.getElementById('generateBtn').addEventListener('click', () => {
            this.generateTerrain();
        });

        document.getElementById('startBtn').addEventListener('click', () => {
            this.startSimulation();
        });

        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.pauseSimulation();
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetTerrain();
        });

        // Visualization controls
        document.getElementById('colorScheme').addEventListener('change', (e) => {
            this.renderer.setColorScheme(e.target.value);
        });

        document.getElementById('showRivers').addEventListener('change', (e) => {
            this.renderer.setShowRivers(e.target.checked);
        });

        document.getElementById('show3D').addEventListener('change', (e) => {
            this.renderer.setShow3D(e.target.checked);
        });
    }

    /**
     * Setup range input with value display
     */
    setupRangeInput(id, callback) {
        const input = document.getElementById(id);
        const display = document.getElementById(id + 'Value');
        
        if (input && display) {
            input.addEventListener('input', (e) => {
                const value = e.target.value;
                display.textContent = value;
                callback(value);
            });
        }
    }

    /**
     * Generate new terrain
     */
    generateTerrain() {
        // Stop simulation if running
        if (this.isSimulating) {
            this.stopSimulation();
        }

        // Show loading state
        this.setStatus('Generating terrain...');
        const canvas = document.querySelector('.canvas-wrapper');
        canvas.classList.add('loading');

        // Use setTimeout to allow UI to update
        setTimeout(() => {
            // Resize if needed
            if (this.terrain.size !== this.params.terrainSize) {
                this.terrain.resize(
                    this.params.terrainSize,
                    this.params.terrainScale,
                    this.params.octaves,
                    this.params.roughness
                );
            } else {
                this.terrain.generate(
                    this.params.terrainScale,
                    this.params.octaves,
                    this.params.roughness
                );
            }

            // Reset stats
            this.totalYears = 0;
            this.totalIterations = 0;

            // Render
            this.renderer.render();

            // Remove loading state
            canvas.classList.remove('loading');
            this.setStatus('Ready');
            this.updateStats();
        }, 50);
    }

    /**
     * Start erosion simulation
     */
    startSimulation() {
        if (this.isSimulating) return;

        this.isSimulating = true;
        this.setStatus('Eroding...');
        
        // Update buttons
        document.getElementById('startBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;
        document.getElementById('generateBtn').disabled = true;

        // Calculate iterations per frame
        const fps = 30;
        const iterationsPerFrame = Math.floor((this.params.simulationSpeed * this.params.rainAmount) / fps);

        // Start simulation loop
        this.simulationInterval = setInterval(() => {
            // Run erosion
            this.erosion.erode(iterationsPerFrame, this.params.erosionStrength);
            
            // Update stats
            this.totalIterations += iterationsPerFrame;
            this.totalYears += this.params.simulationSpeed / fps;
            this.updateStats();
            
            // Render
            this.renderer.render();
        }, 1000 / fps);
    }

    /**
     * Pause simulation
     */
    pauseSimulation() {
        this.stopSimulation();
        this.setStatus('Paused');
    }

    /**
     * Stop simulation
     */
    stopSimulation() {
        if (!this.isSimulating) return;

        this.isSimulating = false;
        
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
            this.simulationInterval = null;
        }

        // Update buttons
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('generateBtn').disabled = false;
    }

    /**
     * Reset terrain to original state
     */
    resetTerrain() {
        // Stop simulation
        if (this.isSimulating) {
            this.stopSimulation();
        }

        // Reset terrain
        this.terrain.reset();
        
        // Reset stats
        this.totalYears = 0;
        this.totalIterations = 0;
        
        // Render and update
        this.renderer.render();
        this.setStatus('Reset to original');
        this.updateStats();
        
        // Auto-clear status after delay
        setTimeout(() => {
            this.setStatus('Ready');
        }, 2000);
    }

    /**
     * Update statistics display
     */
    updateStats() {
        const yearsElement = document.getElementById('yearsSimulated');
        const iterationsElement = document.getElementById('iterationCount');
        
        if (yearsElement) {
            yearsElement.textContent = Math.floor(this.totalYears).toLocaleString();
        }
        
        if (iterationsElement) {
            iterationsElement.textContent = this.totalIterations.toLocaleString();
        }
    }

    /**
     * Set status message
     */
    setStatus(message) {
        const statusElement = document.getElementById('simulationStatus');
        if (statusElement) {
            statusElement.textContent = message;
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TerrainErosionApp();
});
