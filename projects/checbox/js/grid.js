/**
 * CHECKBOXSCREEN - GRID MANAGER
 * Handles checkbox grid creation, updates, and DOM operations
 */

class CheckboxGrid {
    constructor(containerElement) {
        this.container = containerElement;
        this.checkboxes = [];
        this.rows = 0;
        this.cols = 0;
        this.totalCheckboxes = 0;
        this.smoothTransitions = true;
        
        // Performance tracking
        this.updateQueue = new Set();
        this.batchUpdateScheduled = false;
        
        // Resolution presets (rows x cols targeting ~4000 checkboxes)
        this.resolutionPresets = [
            { name: 'Tiny', rows: 40, cols: 40 },      // 1,600
            { name: 'Low', rows: 50, cols: 60 },       // 3,000
            { name: 'Medium', rows: 60, cols: 70 },    // 4,200
            { name: 'High', rows: 70, cols: 80 },      // 5,600
            { name: 'Ultra', rows: 80, cols: 90 }      // 7,200
        ];
        
        this.currentResolution = 2; // Medium by default
    }
    
    /**
     * Initialize the grid with a specific resolution
     */
    initialize(resolutionIndex = 2) {
        this.currentResolution = resolutionIndex;
        const preset = this.resolutionPresets[resolutionIndex];
        this.createGrid(preset.rows, preset.cols);
        return preset;
    }
    
    /**
     * Create the checkbox grid
     */
    createGrid(rows, cols) {
        // Clear existing grid
        this.container.innerHTML = '';
        this.checkboxes = [];
        
        this.rows = rows;
        this.cols = cols;
        this.totalCheckboxes = rows * cols;
        
        // Set grid template
        this.container.style.gridTemplateColumns = `repeat(${cols}, var(--checkbox-size))`;
        this.container.style.gridTemplateRows = `repeat(${rows}, var(--checkbox-size))`;
        
        // Create checkboxes using DocumentFragment for better performance
        const fragment = document.createDocumentFragment();
        
        for (let row = 0; row < rows; row++) {
            const rowArray = [];
            for (let col = 0; col < cols; col++) {
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.dataset.row = row;
                checkbox.dataset.col = col;
                checkbox.dataset.index = row * cols + col;
                
                // Disable default user interaction during animations
                checkbox.addEventListener('click', (e) => {
                    if (this.animationActive) {
                        e.preventDefault();
                    }
                });
                
                fragment.appendChild(checkbox);
                rowArray.push(checkbox);
            }
            this.checkboxes.push(rowArray);
        }
        
        this.container.appendChild(fragment);
        
        // Update smooth transitions class
        this.setSmoothTransitions(this.smoothTransitions);
        
        return {
            rows: this.rows,
            cols: this.cols,
            total: this.totalCheckboxes
        };
    }
    
    /**
     * Rebuild grid with new resolution
     */
    changeResolution(resolutionIndex) {
        if (resolutionIndex < 0 || resolutionIndex >= this.resolutionPresets.length) {
            return null;
        }
        
        this.currentResolution = resolutionIndex;
        const preset = this.resolutionPresets[resolutionIndex];
        this.createGrid(preset.rows, preset.cols);
        
        return preset;
    }
    
    /**
     * Get current resolution preset
     */
    getResolutionInfo() {
        return {
            ...this.resolutionPresets[this.currentResolution],
            index: this.currentResolution,
            total: this.totalCheckboxes
        };
    }
    
    /**
     * Set checkbox state at specific coordinates
     */
    setCheckbox(row, col, checked) {
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
            return false;
        }
        
        const checkbox = this.checkboxes[row][col];
        if (checkbox.checked !== checked) {
            this.updateQueue.add(checkbox);
            this.scheduleUpdate();
        }
        
        return true;
    }
    
    /**
     * Batch update multiple checkboxes
     */
    setCheckboxes(updates) {
        for (const update of updates) {
            const { row, col, checked } = update;
            if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
                const checkbox = this.checkboxes[row][col];
                if (checkbox.checked !== checked) {
                    checkbox.checked = checked;
                }
            }
        }
    }
    
    /**
     * Schedule batched DOM update
     */
    scheduleUpdate() {
        if (!this.batchUpdateScheduled) {
            this.batchUpdateScheduled = true;
            requestAnimationFrame(() => this.processBatchUpdate());
        }
    }
    
    /**
     * Process queued checkbox updates
     */
    processBatchUpdate() {
        // Use DocumentFragment for smoother batch updates
        const fragment = document.createDocumentFragment();
        let batchSize = 0;
        const maxBatchSize = 100;
        
        this.updateQueue.forEach(checkbox => {
            batchSize++;
            // Batch updates in chunks to prevent jank
            if (batchSize >= maxBatchSize) {
                batchSize = 0;
            }
        });
        
        this.updateQueue.clear();
        this.batchUpdateScheduled = false;
    }
    
    /**
     * Apply a frame buffer to the grid with staggered updates
     */
    applyFrame(frameBuffer) {
        if (!frameBuffer || frameBuffer.length !== this.rows) {
            return false;
        }
        
        // Staggered updates for ultra-smooth visual flow
        const staggerDelay = this.smoothTransitions ? 0.3 : 0;
        const updates = [];
        
        for (let row = 0; row < this.rows; row++) {
            if (frameBuffer[row].length !== this.cols) {
                return false;
            }
            for (let col = 0; col < this.cols; col++) {
                const checkbox = this.checkboxes[row][col];
                const newState = frameBuffer[row][col];
                if (checkbox.checked !== newState) {
                    updates.push({ checkbox, newState, row, col });
                }
            }
        }
        
        // Apply updates in optimized batches
        if (staggerDelay > 0 && updates.length > 0) {
            const chunkSize = Math.ceil(updates.length / 3);
            for (let i = 0; i < updates.length; i += chunkSize) {
                const chunk = updates.slice(i, i + chunkSize);
                const delay = (i / updates.length) * staggerDelay;
                
                setTimeout(() => {
                    requestAnimationFrame(() => {
                        chunk.forEach(({ checkbox, newState }) => {
                            checkbox.classList.add('transitioning');
                            checkbox.checked = newState;
                            setTimeout(() => checkbox.classList.remove('transitioning'), 50);
                        });
                    });
                }, delay);
            }
        } else {
            // Fast path for non-smooth mode
            requestAnimationFrame(() => {
                updates.forEach(({ checkbox, newState }) => {
                    checkbox.checked = newState;
                });
            });
        }
        
        return true;
    }
    
    /**
     * Clear all checkboxes
     */
    clear() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.checkboxes[row][col].checked = false;
            }
        }
    }
    
    /**
     * Fill all checkboxes
     */
    fill() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.checkboxes[row][col].checked = true;
            }
        }
    }
    
    /**
     * Toggle all checkboxes
     */
    invert() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const checkbox = this.checkboxes[row][col];
                checkbox.checked = !checkbox.checked;
            }
        }
    }
    
    /**
     * Get current state as 2D array
     */
    getState() {
        const state = [];
        for (let row = 0; row < this.rows; row++) {
            const rowState = [];
            for (let col = 0; col < this.cols; col++) {
                rowState.push(this.checkboxes[row][col].checked);
            }
            state.push(rowState);
        }
        return state;
    }
    
    /**
     * Set state from 2D array
     */
    setState(state) {
        if (!state || state.length !== this.rows) {
            return false;
        }
        
        for (let row = 0; row < this.rows; row++) {
            if (state[row].length !== this.cols) {
                return false;
            }
            for (let col = 0; col < this.cols; col++) {
                this.checkboxes[row][col].checked = state[row][col];
            }
        }
        
        return true;
    }
    
    /**
     * Enable/disable smooth transitions
     */
    setSmoothTransitions(enabled) {
        this.smoothTransitions = enabled;
        if (enabled) {
            this.container.classList.add('smooth-transitions');
        } else {
            this.container.classList.remove('smooth-transitions');
        }
    }
    
    /**
     * Get checkbox at coordinates
     */
    getCheckbox(row, col) {
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
            return null;
        }
        return this.checkboxes[row][col];
    }
    
    /**
     * Get grid dimensions
     */
    getDimensions() {
        return {
            rows: this.rows,
            cols: this.cols,
            total: this.totalCheckboxes
        };
    }
    
    /**
     * Check if coordinates are valid
     */
    isValidCoordinate(row, col) {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
    }
    
    /**
     * Get random coordinates
     */
    getRandomCoordinate() {
        return {
            row: Math.floor(Math.random() * this.rows),
            col: Math.floor(Math.random() * this.cols)
        };
    }
    
    /**
     * Iterate over all checkboxes
     */
    forEach(callback) {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                callback(this.checkboxes[row][col], row, col);
            }
        }
    }
    
    /**
     * Set animation active state (prevents user clicks)
     */
    setAnimationActive(active) {
        this.animationActive = active;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CheckboxGrid;
}
