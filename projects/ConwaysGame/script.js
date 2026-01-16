// Conway's Game of Life Implementation
class GameOfLife {
    constructor() {
        this.initializeElements();
        this.setupPatterns();
        this.initializeGame();
        this.setupEventListeners();
        this.initializeCanvas();
        this.initializeHistory();
    }

    initializeElements() {
        // Canvas and display elements
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.generationEl = document.getElementById('generation');
        this.livingCellsEl = document.getElementById('livingCells');
        this.gridSizeEl = document.getElementById('gridSize');
        this.speedValueEl = document.getElementById('speedValue');
        this.cellSizeValueEl = document.getElementById('cellSizeValue');
        this.simulationTimeEl = document.getElementById('simulationTime');
        this.generationRateEl = document.getElementById('generationRate');
        this.populationChangeEl = document.getElementById('populationChange');

        // Control buttons
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.stepBtn = document.getElementById('stepBtn');
        this.zoomInBtn = document.getElementById('zoomInBtn');
        this.zoomOutBtn = document.getElementById('zoomOutBtn');
        this.centerBtn = document.getElementById('centerBtn');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');

        // Tools
        this.drawModeBtn = document.getElementById('drawMode');
        this.eraseModeBtn = document.getElementById('eraseMode');
        this.selectModeBtn = document.getElementById('selectMode');

        // Settings
        this.speedSlider = document.getElementById('speedSlider');
        this.cellSizeSlider = document.getElementById('cellSize');
        this.wrapEdges = document.getElementById('wrapEdges');
        this.showGrid = document.getElementById('showGrid');
        this.showNeighbors = document.getElementById('showNeighbors');
        this.colorfulCells = document.getElementById('colorfulCells');

        // Pattern elements
        this.patternBtns = document.querySelectorAll('.pattern-btn');
        this.patternExamples = document.querySelectorAll('.pattern-example');
        this.patternPreview = document.getElementById('patternPreview');
        this.modalPatternPreview = document.getElementById('modalPatternPreview');

        // Modals
        this.patternModal = document.getElementById('patternModal');
        this.helpModal = document.getElementById('helpModal');
        this.themeToggle = document.getElementById('themeToggle');
        this.helpBtn = document.getElementById('helpBtn');
        this.aboutBtn = document.getElementById('aboutBtn');

        // Export/Import
        this.exportBtn = document.getElementById('exportBtn');
        this.importBtn = document.getElementById('importBtn');
        this.saveImageBtn = document.getElementById('saveImageBtn');

        // History
        this.historyList = document.getElementById('historyList');
        this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
    }

    initializeGame() {
        // Game state
        this.isRunning = false;
        this.generation = 0;
        this.livingCells = 0;
        this.previousPopulation = 0;
        this.simulationStartTime = 0;
        this.lastGenerationTime = 0;
        this.generationTimes = [];

        // Grid settings
        this.gridWidth = 80;
        this.gridHeight = 60;
        this.cellSize = 10;
        this.minCellSize = 5;
        this.maxCellSize = 20;

        // Viewport settings
        this.offsetX = 0;
        this.offsetY = 0;
        this.scale = 1;

        // Drawing settings
        this.currentMode = 'draw';
        this.isDrawing = false;
        this.lastCellX = -1;
        this.lastCellY = -1;

        // Pattern placement
        this.selectedPattern = null;
        this.patternPreviewX = 0;
        this.patternPreviewY = 0;

        // Performance
        this.speed = 50; // ms between generations
        this.animationFrame = null;

        // Create grid arrays
        this.currentGrid = this.createEmptyGrid();
        this.nextGrid = this.createEmptyGrid();

        // Initialize grid with some patterns
        this.initializeWithPatterns();
    }

    initializeCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        this.draw();
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        this.draw();
    }

    createEmptyGrid() {
        const grid = new Array(this.gridHeight);
        for (let y = 0; y < this.gridHeight; y++) {
            grid[y] = new Array(this.gridWidth).fill(0);
        }
        return grid;
    }

    initializeWithPatterns() {
        // Add some initial patterns for demonstration
        this.addPattern(10, 10, this.patterns.glider);
        this.addPattern(40, 10, this.patterns.blinker);
        this.addPattern(60, 10, this.patterns.toad);
        this.addPattern(20, 30, this.patterns.beehive);
        this.addPattern(50, 30, this.patterns.block);
        this.addPattern(70, 30, this.patterns.beacon);

        this.updateStatistics();
        this.draw();
    }

    setupEventListeners() {
        // Control buttons
        this.startBtn.addEventListener('click', () => this.startSimulation());
        this.pauseBtn.addEventListener('click', () => this.pauseSimulation());
        this.resetBtn.addEventListener('click', () => this.resetSimulation());
        this.clearBtn.addEventListener('click', () => this.clearGrid());
        this.stepBtn.addEventListener('click', () => this.step());
        this.zoomInBtn.addEventListener('click', () => this.zoom(1.2));
        this.zoomOutBtn.addEventListener('click', () => this.zoom(0.8));
        this.centerBtn.addEventListener('click', () => this.centerView());
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());

        // Tool buttons
        this.drawModeBtn.addEventListener('click', () => this.setMode('draw'));
        this.eraseModeBtn.addEventListener('click', () => this.setMode('erase'));
        this.selectModeBtn.addEventListener('click', () => this.setMode('select'));

        // Sliders
        this.speedSlider.addEventListener('input', (e) => this.updateSpeed(e.target.value));
        this.cellSizeSlider.addEventListener('input', (e) => this.updateCellSize(e.target.value));

        // Settings
        this.wrapEdges.addEventListener('change', () => this.draw());
        this.showGrid.addEventListener('change', () => this.draw());
        this.showNeighbors.addEventListener('change', () => this.draw());
        this.colorfulCells.addEventListener('change', () => this.draw());

        // Canvas events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));

        // Pattern buttons
        this.patternBtns.forEach(btn => {
            btn.addEventListener('click', () => this.selectPattern(btn.dataset.pattern));
        });

        this.patternExamples.forEach(example => {
            example.addEventListener('click', () => this.selectPatternExample(example.dataset.pattern));
        });

        // Modals
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => this.closeAllModals());
        });

        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.helpBtn.addEventListener('click', () => this.showHelp());
        this.aboutBtn.addEventListener('click', () => this.showAbout());

        // Export/Import
        this.exportBtn.addEventListener('click', () => this.exportPattern());
        this.importBtn.addEventListener('click', () => this.importPattern());
        this.saveImageBtn.addEventListener('click', () => this.saveAsImage());

        // History
        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));

        // Pattern modal actions
        document.getElementById('placePatternBtn')?.addEventListener('click', () => this.placePattern());
        document.getElementById('cancelPatternBtn')?.addEventListener('click', () => this.cancelPattern());
    }

    setupPatterns() {
        this.patterns = {
            // Still lifes
            block: {
                name: 'Block',
                type: 'still',
                period: 1,
                pattern: [
                    [1, 1],
                    [1, 1]
                ],
                description: 'A simple 2×2 still life that doesn\'t change.'
            },
            beehive: {
                name: 'Beehive',
                type: 'still',
                period: 1,
                pattern: [
                    [0, 1, 1, 0],
                    [1, 0, 0, 1],
                    [0, 1, 1, 0]
                ],
                description: 'A common still life resembling a honeycomb.'
            },
            loaf: {
                name: 'Loaf',
                type: 'still',
                period: 1,
                pattern: [
                    [0, 1, 1, 0],
                    [1, 0, 0, 1],
                    [0, 1, 0, 1],
                    [0, 0, 1, 0]
                ],
                description: 'A still life that looks like a loaf of bread.'
            },
            boat: {
                name: 'Boat',
                type: 'still',
                period: 1,
                pattern: [
                    [1, 1, 0],
                    [1, 0, 1],
                    [0, 1, 0]
                ],
                description: 'A small still life shaped like a boat.'
            },

            // Oscillators
            blinker: {
                name: 'Blinker',
                type: 'oscillator',
                period: 2,
                pattern: [
                    [1, 1, 1]
                ],
                description: 'Period 2 oscillator that alternates between horizontal and vertical.'
            },
            toad: {
                name: 'Toad',
                type: 'oscillator',
                period: 2,
                pattern: [
                    [0, 1, 1, 1],
                    [1, 1, 1, 0]
                ],
                description: 'Period 2 oscillator that resembles a toad.'
            },
            beacon: {
                name: 'Beacon',
                type: 'oscillator',
                period: 2,
                pattern: [
                    [1, 1, 0, 0],
                    [1, 1, 0, 0],
                    [0, 0, 1, 1],
                    [0, 0, 1, 1]
                ],
                description: 'Period 2 oscillator consisting of two blocks.'
            },
            pulsar: {
                name: 'Pulsar',
                type: 'oscillator',
                period: 3,
                pattern: [
                    [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
                    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
                    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
                    [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
                    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
                    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
                    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0]
                ],
                description: 'A famous period 3 oscillator with pulsating arms.'
            },

            // Spaceships
            glider: {
                name: 'Glider',
                type: 'spaceship',
                period: 4,
                pattern: [
                    [0, 1, 0],
                    [0, 0, 1],
                    [1, 1, 1]
                ],
                description: 'The smallest and most common spaceship that moves diagonally.'
            },
            lwss: {
                name: 'Lightweight Spaceship',
                type: 'spaceship',
                period: 4,
                pattern: [
                    [0, 1, 0, 0, 1],
                    [1, 0, 0, 0, 0],
                    [1, 0, 0, 0, 1],
                    [1, 1, 1, 1, 0]
                ],
                description: 'A small spaceship that moves horizontally.'
            },
            mwss: {
                name: 'Middleweight Spaceship',
                type: 'spaceship',
                period: 4,
                pattern: [
                    [0, 0, 1, 1, 0, 0],
                    [1, 1, 0, 1, 1, 0],
                    [1, 1, 1, 1, 0, 0],
                    [0, 1, 1, 0, 0, 0]
                ],
                description: 'Medium-sized spaceship.'
            },
            hwss: {
                name: 'Heavyweight Spaceship',
                type: 'spaceship',
                period: 4,
                pattern: [
                    [0, 0, 1, 1, 1, 1, 0],
                    [1, 1, 0, 0, 0, 1, 1],
                    [1, 1, 0, 0, 0, 0, 0],
                    [1, 1, 0, 0, 0, 0, 1],
                    [0, 0, 1, 1, 1, 1, 0]
                ],
                description: 'Large spaceship.'
            },

            // Guns
            gosper: {
                name: 'Gosper Glider Gun',
                type: 'gun',
                period: 30,
                pattern: [
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
                    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                ],
                description: 'The first known pattern that produces gliders indefinitely.'
            }
        };
    }

    startSimulation() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.simulationStartTime = Date.now();
            this.lastGenerationTime = Date.now();
            this.startBtn.disabled = true;
            this.pauseBtn.disabled = false;
            this.updateStatistics();
            this.runGeneration();
        }
    }

    pauseSimulation() {
        this.isRunning = false;
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    resetSimulation() {
        this.pauseSimulation();
        this.generation = 0;
        this.livingCells = 0;
        this.previousPopulation = 0;
        this.currentGrid = this.createEmptyGrid();
        this.nextGrid = this.createEmptyGrid();
        this.initializeWithPatterns();
        this.updateStatistics();
        this.draw();
        this.addHistory('Reset simulation');
    }

    clearGrid() {
        this.currentGrid = this.createEmptyGrid();
        this.nextGrid = this.createEmptyGrid();
        this.livingCells = 0;
        this.updateStatistics();
        this.draw();
        this.addHistory('Cleared grid');
    }

    step() {
        if (!this.isRunning) {
            this.computeNextGeneration();
            this.generation++;
            this.updateStatistics();
            this.draw();
            this.addHistory('Stepped to generation ' + this.generation);
        }
    }

    runGeneration() {
        if (!this.isRunning) return;

        const now = Date.now();
        const elapsed = now - this.lastGenerationTime;

        if (elapsed >= this.speed) {
            this.computeNextGeneration();
            this.generation++;

            // Update timing statistics
            const generationTime = now - this.lastGenerationTime;
            this.generationTimes.push(generationTime);
            if (this.generationTimes.length > 10) {
                this.generationTimes.shift();
            }
            this.lastGenerationTime = now;

            this.updateStatistics();
            this.draw();
        }

        this.animationFrame = requestAnimationFrame(() => this.runGeneration());
    }

    computeNextGeneration() {
        // Store current population for change calculation
        this.previousPopulation = this.livingCells;
        this.livingCells = 0;

        // Compute next generation
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                const neighbors = this.countNeighbors(x, y);
                const isAlive = this.currentGrid[y][x] === 1;

                // Apply Conway's rules
                if (isAlive) {
                    if (neighbors === 2 || neighbors === 3) {
                        this.nextGrid[y][x] = 1;
                        this.livingCells++;
                    } else {
                        this.nextGrid[y][x] = 0;
                    }
                } else {
                    if (neighbors === 3) {
                        this.nextGrid[y][x] = 1;
                        this.livingCells++;
                    } else {
                        this.nextGrid[y][x] = 0;
                    }
                }
            }
        }

        // Swap grids
        [this.currentGrid, this.nextGrid] = [this.nextGrid, this.currentGrid];
    }

    countNeighbors(x, y) {
        let count = 0;
        const wrap = this.wrapEdges.checked;

        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;

                let nx = x + dx;
                let ny = y + dy;

                if (wrap) {
                    nx = (nx + this.gridWidth) % this.gridWidth;
                    ny = (ny + this.gridHeight) % this.gridHeight;
                } else {
                    if (nx < 0 || nx >= this.gridWidth || ny < 0 || ny >= this.gridHeight) {
                        continue;
                    }
                }

                if (this.currentGrid[ny][nx] === 1) {
                    count++;
                }
            }
        }

        return count;
    }

    updateSpeed(value) {
        this.speed = 101 - value; // Invert so higher slider = faster
        this.speedValueEl.textContent = this.speed + ' ms';
    }

    updateCellSize(value) {
        this.cellSize = parseInt(value);
        this.cellSizeValueEl.textContent = this.cellSize + ' px';
        this.draw();
    }

    setMode(mode) {
        this.currentMode = mode;

        // Update button states
        this.drawModeBtn.classList.toggle('active', mode === 'draw');
        this.eraseModeBtn.classList.toggle('active', mode === 'erase');
        this.selectModeBtn.classList.toggle('active', mode === 'select');

        // Clear pattern preview if not in select mode
        if (mode !== 'select' && this.selectedPattern) {
            this.selectedPattern = null;
            this.patternPreview.style.display = 'none';
        }
    }

    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const cellPos = this.screenToGrid(x, y);
        if (!cellPos) return;

        const [cellX, cellY] = cellPos;

        switch (this.currentMode) {
            case 'draw':
            case 'erase':
                this.isDrawing = true;
                this.lastCellX = cellX;
                this.lastCellY = cellY;
                this.toggleCell(cellX, cellY);
                break;

            case 'select':
                if (this.selectedPattern) {
                    this.placeSelectedPattern(cellX, cellY);
                }
                break;
        }
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const cellPos = this.screenToGrid(x, y);
        if (!cellPos) return;

        const [cellX, cellY] = cellPos;

        // Update pattern preview position
        if (this.selectedPattern && this.currentMode === 'select') {
            this.patternPreviewX = cellX;
            this.patternPreviewY = cellY;
            this.updatePatternPreview();
        }

        // Handle drawing/erasing
        if (this.isDrawing && (cellX !== this.lastCellX || cellY !== this.lastCellY)) {
            this.lastCellX = cellX;
            this.lastCellY = cellY;
            this.toggleCell(cellX, cellY);
        }
    }

    handleMouseUp() {
        this.isDrawing = false;
    }

    handleWheel(e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        this.zoom(delta, e.clientX, e.clientY);
    }

    handleKeyDown(e) {
        switch (e.key.toLowerCase()) {
            case ' ': // Space
                e.preventDefault();
                if (this.isRunning) {
                    this.pauseSimulation();
                } else {
                    this.startSimulation();
                }
                break;

            case 'r': // Reset
                if (e.ctrlKey || e.metaKey) return;
                e.preventDefault();
                this.resetSimulation();
                break;

            case 'c': // Clear
                if (e.ctrlKey || e.metaKey) return;
                e.preventDefault();
                this.clearGrid();
                break;

            case 's': // Step
                if (e.ctrlKey || e.metaKey) return;
                e.preventDefault();
                this.step();
                break;

            case 'd': // Draw mode
                if (e.ctrlKey || e.metaKey) return;
                e.preventDefault();
                this.setMode('draw');
                break;

            case 'e': // Erase mode
                if (e.ctrlKey || e.metaKey) return;
                e.preventDefault();
                this.setMode('erase');
                break;

            case '+': // Zoom in
            case '=':
                e.preventDefault();
                this.zoom(1.2);
                break;

            case '-': // Zoom out
                e.preventDefault();
                this.zoom(0.8);
                break;

            case '0': // Reset zoom
                e.preventDefault();
                this.scale = 1;
                this.centerView();
                break;
        }
    }

    screenToGrid(screenX, screenY) {
        // Convert screen coordinates to grid coordinates
        const gridX = Math.floor((screenX / this.scale - this.offsetX) / this.cellSize);
        const gridY = Math.floor((screenY / this.scale - this.offsetY) / this.cellSize);

        // Check bounds
        if (gridX < 0 || gridX >= this.gridWidth || gridY < 0 || gridY >= this.gridHeight) {
            return null;
        }

        return [gridX, gridY];
    }

    toggleCell(x, y) {
        if (this.currentMode === 'draw') {
            if (this.currentGrid[y][x] !== 1) {
                this.currentGrid[y][x] = 1;
                this.livingCells++;
            }
        } else if (this.currentMode === 'erase') {
            if (this.currentGrid[y][x] !== 0) {
                this.currentGrid[y][x] = 0;
                this.livingCells--;
            }
        }

        this.updateStatistics();
        this.draw();
    }

    zoom(factor, centerX = null, centerY = null) {
        const oldScale = this.scale;
        this.scale *= factor;
        this.scale = Math.max(0.1, Math.min(5, this.scale));

        if (centerX !== null && centerY !== null) {
            // Zoom towards mouse position
            const rect = this.canvas.getBoundingClientRect();
            const x = centerX - rect.left;
            const y = centerY - rect.top;

            this.offsetX = x / this.scale - (x / oldScale - this.offsetX);
            this.offsetY = y / this.scale - (y / oldScale - this.offsetY);
        } else {
            // Zoom towards center
            const x = this.canvas.width / 2;
            const y = this.canvas.height / 2;
            this.offsetX = x / this.scale - (x / oldScale - this.offsetX);
            this.offsetY = y / this.scale - (y / oldScale - this.offsetY);
        }

        this.draw();
        this.updatePatternPreview();
    }

    centerView() {
        this.scale = 1;
        // Center the grid
        const gridPixelWidth = this.gridWidth * this.cellSize;
        const gridPixelHeight = this.gridHeight * this.cellSize;

        this.offsetX = (this.canvas.width - gridPixelWidth) / 2;
        this.offsetY = (this.canvas.height - gridPixelHeight) / 2;

        this.draw();
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.canvas.parentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    draw() {
        if (!this.ctx) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        this.ctx.scale(this.scale, this.scale);
        this.ctx.translate(this.offsetX, this.offsetY);

        if (this.showGrid.checked) {
            this.drawGrid();
        }

        this.drawCells();

        // Draw pattern preview if selected and in select/paste mode
        if (this.currentMode === 'select' && this.selectedPattern) {
            this.drawPatternPreview();
        }

        this.ctx.restore();
    }

    drawGrid() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        this.ctx.strokeStyle = isDark ? '#333' : '#eee';
        this.ctx.lineWidth = 1 / this.scale;
        this.ctx.beginPath();

        for (let x = 0; x <= this.gridWidth; x++) {
            this.ctx.moveTo(x * this.cellSize, 0);
            this.ctx.lineTo(x * this.cellSize, this.gridHeight * this.cellSize);
        }

        for (let y = 0; y <= this.gridHeight; y++) {
            this.ctx.moveTo(0, y * this.cellSize);
            this.ctx.lineTo(this.gridWidth * this.cellSize, y * this.cellSize);
        }

        this.ctx.stroke();
    }

    drawCells() {
        const colors = {
            primary: getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#4361ee',
            accent: getComputedStyle(document.documentElement).getPropertyValue('--secondary-color').trim() || '#3f37c9'
        };

        this.ctx.fillStyle = colors.primary;

        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                if (this.currentGrid[y][x] === 1) {
                    if (this.colorfulCells.checked) {
                        const hue = (x * 3 + y * 3 + this.generation * 2) % 360;
                        this.ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
                    } else {
                        this.ctx.fillStyle = colors.primary;
                    }

                    this.ctx.fillRect(
                        x * this.cellSize,
                        y * this.cellSize,
                        this.cellSize,
                        this.cellSize
                    );
                }
            }
        }
    }

    drawPatternPreview() {
        if (!this.selectedPattern) return;

        const pattern = this.selectedPattern.pattern;
        const startX = this.patternPreviewX;
        const startY = this.patternPreviewY; // Center the pattern on mouse? Currently top-left based on logic

        this.ctx.globalAlpha = 0.5;
        this.ctx.fillStyle = '#2ec4b6'; // Success color

        for (let y = 0; y < pattern.length; y++) {
            for (let x = 0; x < pattern[y].length; x++) {
                if (pattern[y][x] === 1) {
                    this.ctx.fillRect(
                        (startX + x) * this.cellSize,
                        (startY + y) * this.cellSize,
                        this.cellSize,
                        this.cellSize
                    );
                }
            }
        }

        this.ctx.strokeStyle = '#2ec4b6';
        this.ctx.lineWidth = 2 / this.scale;
        this.ctx.strokeRect(
            startX * this.cellSize,
            startY * this.cellSize,
            pattern[0].length * this.cellSize,
            pattern.length * this.cellSize
        );

        this.ctx.globalAlpha = 1.0;
    }

    updateStatistics() {
        this.generationEl.textContent = this.generation;
        this.livingCellsEl.textContent = this.livingCells;
        this.gridSizeEl.textContent = `${this.gridWidth}×${this.gridHeight}`;

        const change = this.livingCells - this.previousPopulation;
        this.populationChangeEl.textContent = (change > 0 ? '+' : '') + change;

        if (this.changePopClassTimeout) clearTimeout(this.changePopClassTimeout);
        this.populationChangeEl.className = 'stat-value ' + (change > 0 ? 'text-success' : (change < 0 ? 'text-danger' : ''));

        const seconds = Math.floor((this.simulationStartTime > 0 && this.isRunning) ? (Date.now() - this.simulationStartTime) / 1000 : 0);
        // This is just a simple running time since start, logic could be better but sufficient

        // Calculate Generation Rate
        if (this.generationTimes.length > 0) {
            const avgTime = this.generationTimes.reduce((a, b) => a + b, 0) / this.generationTimes.length;
            const fps = Math.round(1000 / avgTime);
            this.generationRateEl.textContent = `${fps}/s`;
        } else {
            this.generationRateEl.textContent = '0/s';
        }
    }

    initializeHistory() {
        this.clearHistory();
        this.addHistory('Welcome to Conway\'s Game of Life!');
    }

    addHistory(message) {
        const item = document.createElement('div');
        item.className = 'history-item';
        const time = new Date().toLocaleTimeString();
        item.innerHTML = `<span style="opacity:0.7; font-size:0.8em">[${time}]</span> ${message}`;
        item.style.padding = '5px 0';
        item.style.borderBottom = '1px solid rgba(128,128,128,0.1)';

        this.historyList.prepend(item);

        if (this.historyList.children.length > 50) {
            this.historyList.lastElementChild.remove();
        }
    }

    clearHistory() {
        this.historyList.innerHTML = '';
    }

    addPattern(x, y, patternData) {
        if (!patternData) return;
        const pattern = patternData.pattern;

        for (let py = 0; py < pattern.length; py++) {
            for (let px = 0; px < pattern[py].length; px++) {
                const targetY = y + py;
                const targetX = x + px;

                // Handle different wrapping/bounds logic if needed, but simple clipping for now
                if (targetY >= 0 && targetY < this.gridHeight && targetX >= 0 && targetX < this.gridWidth) {
                    if (pattern[py][px] === 1) {
                        this.currentGrid[targetY][targetX] = 1;
                    }
                }
            }
        }

        // Recount living cells
        this.livingCells = 0;
        for (let r = 0; r < this.gridHeight; r++) {
            for (let c = 0; c < this.gridWidth; c++) {
                if (this.currentGrid[r][c]) this.livingCells++;
            }
        }
    }

    selectPattern(key) {
        if (this.patterns[key]) {
            this.selectedPattern = this.patterns[key];
            this.showPatternModal(key);
        }
    }

    selectPatternExample(key) {
        if (this.patterns[key]) {
            this.selectedPattern = this.patterns[key];
            this.setMode('select');
            this.addHistory(`Selected ${this.patterns[key].name} for placement`);
        }
    }

    showPatternModal(key) {
        const pattern = this.patterns[key];
        document.getElementById('patternName').textContent = pattern.name;
        document.getElementById('patternDescription').textContent = pattern.description;
        document.getElementById('patternSize').textContent = `${pattern.pattern[0].length}×${pattern.pattern.length}`;
        document.getElementById('patternType').textContent = pattern.type;
        document.getElementById('patternPeriod').textContent = pattern.period;

        this.drawModalPreview(pattern);
        this.patternModal.style.display = 'flex';
    }

    drawModalPreview(patternData) {
        const container = this.modalPatternPreview;
        container.innerHTML = '';
        container.style.display = 'grid';
        container.style.gridTemplateColumns = `repeat(${patternData.pattern[0].length}, 20px)`;
        container.style.gap = '1px';
        container.style.justifyContent = 'center';
        container.style.marginBottom = '1rem';

        patternData.pattern.forEach(row => {
            row.forEach(cell => {
                const div = document.createElement('div');
                div.style.width = '20px';
                div.style.height = '20px';
                div.style.backgroundColor = cell ? '#4361ee' : '#eee';
                container.appendChild(div);
            });
        });
    }

    placePattern() {
        this.closeAllModals();
        this.setMode('select');
        this.addHistory(`Ready to place: ${this.selectedPattern.name}`);
    }

    cancelPattern() {
        this.selectedPattern = null;
        this.closeAllModals();
        this.setMode('draw');
    }

    updatePatternPreview() {
        if (this.currentMode === 'select' && this.selectedPattern) {
            this.draw();
        }
    }

    placeSelectedPattern(x, y) {
        if (this.selectedPattern) {
            this.addPattern(x, y, this.selectedPattern);
            this.updateStatistics();
            this.draw();
            this.addHistory(`Placed ${this.selectedPattern.name} at ${x},${y}`);
        }
    }

    toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', newTheme);

        const icon = this.themeToggle.querySelector('i');
        if (newTheme === 'dark') {
            icon.className = 'ri-sun-line';
        } else {
            icon.className = 'ri-moon-line';
        }

        this.draw();
    }

    showHelp() {
        this.helpModal.style.display = 'flex';
    }

    showAbout() {
        // Simple alert for About as no modal exists in HTML
        alert("Conway's Game of Life\n\nA cellular automaton devised by the British mathematician John Horton Conway in 1970.\n\nBuilt with HTML5 Canvas and Vanilla JS.");
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
    }

    exportPattern() {
        const state = {
            grid: this.currentGrid,
            width: this.gridWidth,
            height: this.gridHeight,
            generation: this.generation
        };
        const data = JSON.stringify(state);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `game-of-life-gen${this.generation}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.addHistory('Exported current game state');
    }

    importPattern() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    // Handle both simple grid array or full state object
                    let grid = data.grid || data;

                    if (Array.isArray(grid) && grid.length > 0) {
                        // Resize if needed or just load into current
                        // For simplicity, we reset to the size of the imported grid or keep current if simpler
                        // Let's blindly load into current size, initializing with 0 if needed
                        this.clearGrid();

                        // We will center the imported grid if sizes differ, or just loop
                        for (let y = 0; y < Math.min(this.gridHeight, grid.length); y++) {
                            for (let x = 0; x < Math.min(this.gridWidth, grid[0].length); x++) {
                                this.currentGrid[y][x] = grid[y][x];
                            }
                        }

                        this.generation = data.generation || 0;

                        // Recount
                        this.livingCells = 0;
                        for (let r = 0; r < this.gridHeight; r++) {
                            for (let c = 0; c < this.gridWidth; c++) {
                                if (this.currentGrid[r][c]) this.livingCells++;
                            }
                        }

                        this.updateStatistics();
                        this.draw();
                        this.addHistory('Imported pattern successfully');
                    } else {
                        alert('Invalid file format');
                    }
                } catch (err) {
                    alert('Error parsing file: ' + err.message);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    saveAsImage() {
        const link = document.createElement('a');
        link.download = `game-of-life-gen${this.generation}.png`;
        link.href = this.canvas.toDataURL('image/png');
        link.click();
        this.addHistory('Saved snapshot as image');
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new GameOfLife();
});