/**
 * ============================================
 * RadioRipple - Ripple Engine Module
 * ============================================
 * 
 * Handles wave propagation algorithms, animation timing,
 * and ripple effects across the grid.
 */

class RippleEngine {
    constructor(gridManager) {
        this.grid = gridManager;
        this.activeWaves = [];
        this.waveIdCounter = 0;
        this.isAnimating = false;
        this.animationFrameId = null;
        
        // Configuration
        this.config = {
            speed: 50,              // ms delay between wave steps
            maxRadius: 15,          // maximum wave radius
            algorithm: 'circular',  // wave propagation algorithm
            intensity: 0.8,         // wave intensity (0-1)
            enableTrails: false,    // show wave trails
            trailDuration: 1000,    // trail fade duration
            preventDoubleCheck: true // prevent checking already checked cells
        };
    }

    /**
     * Trigger a ripple wave from a specific cell
     * @param {Object} originCell - Cell to start wave from
     */
    triggerWave(originCell) {
        if (!originCell) return;
        
        // Check already checked cell
        if (this.config.preventDoubleCheck && originCell.checked) {
            return;
        }
        
        // Mark origin as checked
        this.grid.setCellState(originCell, 'checked');
        this.grid.setCellState(originCell, 'wave-origin');
        
        // Create new wave
        const wave = {
            id: this.waveIdCounter++,
            originRow: originCell.row,
            originCol: originCell.col,
            currentRadius: 0,
            maxRadius: this.config.maxRadius,
            algorithm: this.config.algorithm,
            speed: this.config.speed,
            intensity: this.config.intensity,
            cellsAffected: new Set(),
            isComplete: false,
            startTime: Date.now()
        };
        
        wave.cellsAffected.add(`${originCell.row},${originCell.col}`);
        this.activeWaves.push(wave);
        
        // Start animation if not already running
        if (!this.isAnimating) {
            this._startAnimation();
        }
        
        // Dispatch wave start event
        this._dispatchEvent('waveStarted', { 
            wave: wave,
            origin: originCell 
        });
    }

    /**
     * Start the animation loop
     * @private
     */
    _startAnimation() {
        this.isAnimating = true;
        this._animationLoop();
    }

    /**
     * Main animation loop
     * @private
     */
    async _animationLoop() {
        if (!this.isAnimating || this.activeWaves.length === 0) {
            this.isAnimating = false;
            return;
        }
        
        // Process all active waves
        const wavesToRemove = [];
        
        for (const wave of this.activeWaves) {
            const shouldContinue = await this._propagateWave(wave);
            
            if (!shouldContinue) {
                wave.isComplete = true;
                wavesToRemove.push(wave.id);
                this._dispatchEvent('waveCompleted', { wave: wave });
            }
        }
        
        // Remove completed waves
        this.activeWaves = this.activeWaves.filter(
            wave => !wavesToRemove.includes(wave.id)
        );
        
        // Schedule next frame
        if (this.activeWaves.length > 0) {
            setTimeout(() => this._animationLoop(), this.config.speed);
        } else {
            this.isAnimating = false;
        }
    }

    /**
     * Propagate a single wave step
     * @private
     */
    async _propagateWave(wave) {
        wave.currentRadius++;
        
        // Check if wave has reached max radius
        if (wave.currentRadius > wave.maxRadius) {
            return false;
        }
        
        // Get cells at current radius using selected algorithm
        const cells = this._getCellsForWave(wave);
        
        // Apply wave effect to cells
        for (const cell of cells) {
            await this._applyCellEffect(cell, wave);
        }
        
        return true;
    }

    /**
     * Get cells affected by wave at current radius
     * @private
     */
    _getCellsForWave(wave) {
        switch (wave.algorithm) {
            case 'circular':
                return this._getCircularWaveCells(wave);
            
            case 'diamond':
                return this._getDiamondWaveCells(wave);
            
            case 'cross':
                return this._getCrossWaveCells(wave);
            
            case 'random':
                return this._getRandomWaveCells(wave);
            
            case 'spiral':
                return this._getSpiralWaveCells(wave);
            
            default:
                return this._getCircularWaveCells(wave);
        }
    }

    /**
     * Circular wave algorithm (Euclidean distance)
     * @private
     */
    _getCircularWaveCells(wave) {
        return this.grid.getCellsAtDistance(
            wave.originRow,
            wave.originCol,
            wave.currentRadius,
            'circular'
        );
    }

    /**
     * Diamond wave algorithm (Manhattan distance)
     * @private
     */
    _getDiamondWaveCells(wave) {
        return this.grid.getCellsAtDistance(
            wave.originRow,
            wave.originCol,
            wave.currentRadius,
            'diamond'
        );
    }

    /**
     * Cross wave algorithm (orthogonal only)
     * @private
     */
    _getCrossWaveCells(wave) {
        const cells = [];
        const r = wave.currentRadius;
        
        // Four directions: up, down, left, right
        const positions = [
            [wave.originRow - r, wave.originCol],     // up
            [wave.originRow + r, wave.originCol],     // down
            [wave.originRow, wave.originCol - r],     // left
            [wave.originRow, wave.originCol + r]      // right
        ];
        
        for (const [row, col] of positions) {
            const cell = this.grid.getCell(row, col);
            if (cell) {
                cells.push(cell);
            }
        }
        
        return cells;
    }

    /**
     * Random decay algorithm (probabilistic spread)
     * @private
     */
    _getRandomWaveCells(wave) {
        const allCells = this.grid.getCellsAtDistance(
            wave.originRow,
            wave.originCol,
            wave.currentRadius,
            'circular'
        );
        
        // Apply probability decay based on distance
        const probability = Math.max(0.2, 1 - (wave.currentRadius / wave.maxRadius));
        
        return allCells.filter(() => Math.random() < probability);
    }

    /**
     * Spiral wave algorithm (angle-based propagation)
     * @private
     */
    _getSpiralWaveCells(wave) {
        const cells = [];
        const radius = wave.currentRadius;
        const angleOffset = (wave.currentRadius * 0.5) % (Math.PI * 2);
        
        // Create spiral pattern
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
            const adjustedAngle = angle + angleOffset;
            const row = Math.round(wave.originRow + radius * Math.sin(adjustedAngle));
            const col = Math.round(wave.originCol + radius * Math.cos(adjustedAngle));
            
            const cell = this.grid.getCell(row, col);
            if (cell && !wave.cellsAffected.has(`${row},${col}`)) {
                cells.push(cell);
            }
        }
        
        return cells;
    }

    /**
     * Apply wave effect to a cell
     * @private
     */
    async _applyCellEffect(cell, wave) {
        const cellKey = `${cell.row},${cell.col}`;
        
        // Skip if already affected by this wave
        if (wave.cellsAffected.has(cellKey)) {
            return;
        }
        
        // Skip if cell is already checked and double-check prevention is on
        if (this.config.preventDoubleCheck && cell.checked) {
            return;
        }
        
        // Mark cell as affected
        wave.cellsAffected.add(cellKey);
        
        // Apply visual effect
        this.grid.setCellState(cell, 'wave-active');
        
        // Check the radio button with animation delay
        setTimeout(() => {
            this.grid.setCellState(cell, 'checked');
            this.grid.removeCellState(cell, 'wave-active');
            
            // Add trail effect if enabled
            if (this.config.enableTrails) {
                this.grid.setCellState(cell, 'wave-trail');
                
                // Remove trail after duration
                setTimeout(() => {
                    this.grid.removeCellState(cell, 'wave-trail');
                }, this.config.trailDuration);
            }
        }, this.config.speed * 0.5);
    }

    /**
     * Update ripple configuration
     * @param {Object} newConfig - Configuration updates
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }

    /**
     * Get current configuration
     * @returns {Object} Current configuration
     */
    getConfig() {
        return { ...this.config };
    }

    /**
     * Stop all active waves
     */
    stopAllWaves() {
        this.activeWaves = [];
        this.isAnimating = false;
        
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        // Clear all wave states
        this.grid.cells.forEach(cell => {
            this.grid.removeCellState(cell, 'wave-active');
            this.grid.removeCellState(cell, 'wave-trail');
            this.grid.removeCellState(cell, 'wave-origin');
        });
        
        this._dispatchEvent('allWavesStopped');
    }

    /**
     * Get active wave count
     * @returns {number} Number of active waves
     */
    getActiveWaveCount() {
        return this.activeWaves.length;
    }

    /**
     * Check if any waves are active
     * @returns {boolean} True if waves are active
     */
    hasActiveWaves() {
        return this.activeWaves.length > 0;
    }

    /**
     * Trigger a random wave
     */
    triggerRandomWave() {
        const randomCell = this.grid.getRandomCell();
        if (randomCell && !randomCell.checked) {
            this.triggerWave(randomCell);
        }
    }

    /**
     * Create a pattern of waves
     * @param {string} pattern - Pattern type
     */
    async createPattern(pattern) {
        const centerRow = Math.floor(this.grid.gridSize / 2);
        const centerCol = Math.floor(this.grid.gridSize / 2);
        
        switch (pattern) {
            case 'center':
                const centerCell = this.grid.getCell(centerRow, centerCol);
                this.triggerWave(centerCell);
                break;
            
            case 'corners':
                const corners = [
                    this.grid.getCell(0, 0),
                    this.grid.getCell(0, this.grid.gridSize - 1),
                    this.grid.getCell(this.grid.gridSize - 1, 0),
                    this.grid.getCell(this.grid.gridSize - 1, this.grid.gridSize - 1)
                ];
                
                for (const cell of corners) {
                    if (cell) {
                        this.triggerWave(cell);
                        await this._sleep(100);
                    }
                }
                break;
            
            case 'cross':
                const crossCells = [
                    this.grid.getCell(centerRow, 0),
                    this.grid.getCell(centerRow, this.grid.gridSize - 1),
                    this.grid.getCell(0, centerCol),
                    this.grid.getCell(this.grid.gridSize - 1, centerCol)
                ];
                
                for (const cell of crossCells) {
                    if (cell) {
                        this.triggerWave(cell);
                        await this._sleep(80);
                    }
                }
                break;
            
            case 'random-burst':
                const count = Math.floor(this.grid.gridSize / 4);
                for (let i = 0; i < count; i++) {
                    this.triggerRandomWave();
                    await this._sleep(150);
                }
                break;
        }
    }

    /**
     * Dispatch custom event
     * @private
     */
    _dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, { 
            detail: detail,
            bubbles: true 
        });
        document.dispatchEvent(event);
    }

    /**
     * Utility: Sleep function
     * @private
     */
    _sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Calculate wave statistics
     * @returns {Object} Wave statistics
     */
    getStats() {
        const totalAffected = this.activeWaves.reduce(
            (sum, wave) => sum + wave.cellsAffected.size, 
            0
        );
        
        return {
            activeWaves: this.activeWaves.length,
            totalCellsAffected: totalAffected,
            isAnimating: this.isAnimating,
            currentAlgorithm: this.config.algorithm,
            waveSpeed: this.config.speed,
            maxRadius: this.config.maxRadius
        };
    }

    /**
     * Cleanup and destroy
     */
    destroy() {
        this.stopAllWaves();
        this.grid = null;
        this.activeWaves = [];
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.RippleEngine = RippleEngine;
}
