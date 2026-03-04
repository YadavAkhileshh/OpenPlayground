/**
 * ============================================
 * RadioRipple - Grid Manager Module
 * ============================================
 * 
 * Handles grid creation, cell management, and neighbor calculations.
 * Provides mathematical foundation for wave propagation.
 */

class GridManager {
    constructor(containerElement) {
        this.container = containerElement;
        this.gridSize = 20;
        this.cells = [];
        this.cellMap = new Map(); // For O(1) lookup by coordinates
        this.generationInProgress = false;
    }

    /**
     * Initialize or regenerate the grid
     * @param {number} size - Grid dimension (size x size)
     */
    async generateGrid(size) {
        if (this.generationInProgress) {
            console.warn('Grid generation already in progress');
            return;
        }

        this.generationInProgress = true;
        this.gridSize = size;
        
        // Show loading state
        this._showLoading(true);
        
        // Clear existing grid
        this._clearGrid();
        
        // Generate new grid
        await this._createGridCells();
        
        // Hide loading state
        this._showLoading(false);
        
        this.generationInProgress = false;
        
        // Dispatch grid ready event
        this._dispatchEvent('gridReady', { 
            size: this.gridSize, 
            totalCells: this.cells.length 
        });
    }

    /**
     * Create grid cells and populate the DOM
     * @private
     */
    async _createGridCells() {
        const fragment = document.createDocumentFragment();
        
        // Set grid template columns
        this.container.style.gridTemplateColumns = `repeat(${this.gridSize}, var(--cell-size))`;
        
        // Create cells in batches for better performance
        const batchSize = 50;
        let cellIndex = 0;
        
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const cell = this._createCell(row, col, cellIndex);
                this.cells.push(cell);
                this.cellMap.set(`${row},${col}`, cell);
                fragment.appendChild(cell.element);
                
                cellIndex++;
                
                // Yield to browser after each batch
                if (cellIndex % batchSize === 0) {
                    await this._sleep(0);
                }
            }
        }
        
        this.container.appendChild(fragment);
    }

    /**
     * Create a single grid cell
     * @private
     */
    _createCell(row, col, index) {
        const cellWrapper = document.createElement('div');
        cellWrapper.className = 'radio-cell';
        cellWrapper.dataset.row = row;
        cellWrapper.dataset.col = col;
        cellWrapper.dataset.index = index;
        
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'grid-radio';
        radio.id = `radio-${row}-${col}`;
        radio.value = `${row},${col}`;
        radio.setAttribute('aria-label', `Radio at row ${row + 1}, column ${col + 1}`);
        
        cellWrapper.appendChild(radio);
        
        return {
            element: cellWrapper,
            radio: radio,
            row: row,
            col: col,
            index: index,
            checked: false,
            waveGeneration: -1, // Track which wave generation this cell belongs to
            isWaveActive: false,
            isWaveOrigin: false
        };
    }

    /**
     * Get cell by coordinates
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @returns {Object|null} Cell object or null if not found
     */
    getCell(row, col) {
        return this.cellMap.get(`${row},${col}`) || null;
    }

    /**
     * Get cell by index
     * @param {number} index - Cell index
     * @returns {Object|null} Cell object or null if not found
     */
    getCellByIndex(index) {
        return this.cells[index] || null;
    }

    /**
     * Get all neighbors of a cell within a given radius
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @param {number} radius - Search radius
     * @param {string} mode - 'all', 'orthogonal', 'diagonal'
     * @returns {Array} Array of neighbor cells
     */
    getNeighbors(row, col, radius = 1, mode = 'all') {
        const neighbors = [];
        
        for (let r = -radius; r <= radius; r++) {
            for (let c = -radius; c <= radius; c++) {
                // Skip center cell
                if (r === 0 && c === 0) continue;
                
                // Apply mode filter
                if (mode === 'orthogonal' && r !== 0 && c !== 0) continue;
                if (mode === 'diagonal' && (r === 0 || c === 0)) continue;
                
                const neighborRow = row + r;
                const neighborCol = col + c;
                
                // Check bounds
                if (this._isInBounds(neighborRow, neighborCol)) {
                    const neighbor = this.getCell(neighborRow, neighborCol);
                    if (neighbor) {
                        neighbors.push(neighbor);
                    }
                }
            }
        }
        
        return neighbors;
    }

    /**
     * Get cells at a specific distance from origin
     * @param {number} originRow - Origin row
     * @param {number} originCol - Origin column
     * @param {number} distance - Distance from origin
     * @param {string} algorithm - Distance calculation method
     * @returns {Array} Array of cells at the specified distance
     */
    getCellsAtDistance(originRow, originCol, distance, algorithm = 'circular') {
        const cells = [];
        
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const dist = this._calculateDistance(
                    originRow, originCol, 
                    row, col, 
                    algorithm
                );
                
                if (Math.round(dist) === distance) {
                    const cell = this.getCell(row, col);
                    if (cell) {
                        cells.push(cell);
                    }
                }
            }
        }
        
        return cells;
    }

    /**
     * Calculate distance between two cells
     * @private
     */
    _calculateDistance(row1, col1, row2, col2, algorithm) {
        const dr = row2 - row1;
        const dc = col2 - col1;
        
        switch (algorithm) {
            case 'circular':
                // Euclidean distance
                return Math.sqrt(dr * dr + dc * dc);
            
            case 'diamond':
                // Manhattan distance
                return Math.abs(dr) + Math.abs(dc);
            
            case 'cross':
                // Only orthogonal cells
                if (dr === 0) return Math.abs(dc);
                if (dc === 0) return Math.abs(dr);
                return Infinity;
            
            case 'spiral':
                // Spiral distance (angle-based)
                const angle = Math.atan2(dr, dc);
                const euclidean = Math.sqrt(dr * dr + dc * dc);
                return euclidean + Math.abs(angle) * 0.5;
            
            default:
                return Math.sqrt(dr * dr + dc * dc);
        }
    }

    /**
     * Check if cell at given coordinates is a neighbor of origin
     * @param {number} originRow - Origin row
     * @param {number} originCol - Origin column
     * @param {number} targetRow - Target row
     * @param {number} targetCol - Target column
     * @param {number} maxDistance - Maximum distance to consider
     * @param {string} algorithm - Distance algorithm
     * @returns {boolean} True if neighbor within distance
     */
    isNeighbor(originRow, originCol, targetRow, targetCol, maxDistance, algorithm) {
        const distance = this._calculateDistance(
            originRow, originCol, 
            targetRow, targetCol, 
            algorithm
        );
        return distance <= maxDistance && distance > 0;
    }

    /**
     * Check if coordinates are within grid bounds
     * @private
     */
    _isInBounds(row, col) {
        return row >= 0 && row < this.gridSize && 
               col >= 0 && col < this.gridSize;
    }

    /**
     * Clear all cell states
     */
    clearAllStates() {
        this.cells.forEach(cell => {
            cell.checked = false;
            cell.radio.checked = false;
            cell.waveGeneration = -1;
            cell.isWaveActive = false;
            cell.isWaveOrigin = false;
            
            cell.element.classList.remove(
                'wave-active', 
                'wave-trail', 
                'wave-origin'
            );
        });
        
        this._dispatchEvent('statesCleared');
    }

    /**
     * Reset grid (regenerate)
     */
    async reset() {
        await this.generateGrid(this.gridSize);
    }

    /**
     * Get grid statistics
     * @returns {Object} Grid statistics
     */
    getStats() {
        const checkedCount = this.cells.filter(cell => cell.checked).length;
        const activeWaveCount = this.cells.filter(cell => cell.isWaveActive).length;
        
        return {
            gridSize: this.gridSize,
            totalCells: this.cells.length,
            checkedCells: checkedCount,
            activeCells: activeWaveCount,
            checkedPercentage: (checkedCount / this.cells.length * 100).toFixed(1)
        };
    }

    /**
     * Get a random cell
     * @returns {Object} Random cell
     */
    getRandomCell() {
        const randomIndex = Math.floor(Math.random() * this.cells.length);
        return this.cells[randomIndex];
    }

    /**
     * Clear the grid
     * @private
     */
    _clearGrid() {
        this.cells = [];
        this.cellMap.clear();
        this.container.innerHTML = '';
    }

    /**
     * Show/hide loading state
     * @private
     */
    _showLoading(show) {
        const loadingElement = document.getElementById('loadingState');
        if (loadingElement) {
            loadingElement.classList.toggle('active', show);
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
        this.container.dispatchEvent(event);
    }

    /**
     * Utility: Sleep function for async operations
     * @private
     */
    _sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Add click listener to grid
     * @param {Function} callback - Callback function
     */
    onCellClick(callback) {
        this.container.addEventListener('click', (event) => {
            const cellElement = event.target.closest('.radio-cell');
            if (!cellElement) return;
            
            const row = parseInt(cellElement.dataset.row);
            const col = parseInt(cellElement.dataset.col);
            const cell = this.getCell(row, col);
            
            if (cell && typeof callback === 'function') {
                callback(cell, event);
            }
        });
    }

    /**
     * Update cell visual state
     * @param {Object} cell - Cell object
     * @param {string} state - State class to add
     */
    setCellState(cell, state) {
        if (!cell) return;
        
        switch (state) {
            case 'wave-active':
                cell.isWaveActive = true;
                cell.element.classList.add('wave-active');
                break;
            
            case 'wave-trail':
                cell.element.classList.add('wave-trail');
                break;
            
            case 'wave-origin':
                cell.isWaveOrigin = true;
                cell.element.classList.add('wave-origin');
                break;
            
            case 'checked':
                cell.checked = true;
                cell.radio.checked = true;
                break;
            
            default:
                cell.element.classList.add(state);
        }
    }

    /**
     * Remove cell visual state
     * @param {Object} cell - Cell object
     * @param {string} state - State class to remove
     */
    removeCellState(cell, state) {
        if (!cell) return;
        
        switch (state) {
            case 'wave-active':
                cell.isWaveActive = false;
                cell.element.classList.remove('wave-active');
                break;
            
            case 'wave-trail':
                cell.element.classList.remove('wave-trail');
                break;
            
            case 'wave-origin':
                cell.isWaveOrigin = false;
                cell.element.classList.remove('wave-origin');
                break;
            
            default:
                cell.element.classList.remove(state);
        }
    }

    /**
     * Destroy grid manager and cleanup
     */
    destroy() {
        this._clearGrid();
        this.container = null;
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.GridManager = GridManager;
}
