/**
 * CHECKBOXSCREEN - PATTERN LIBRARY
 * Collection of animation patterns and frame generators
 */

class PatternLibrary {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.patterns = new Map();
        this.registerAllPatterns();
    }
    
    /**
     * Update dimensions when grid changes
     */
    setDimensions(rows, cols) {
        this.rows = rows;
        this.cols = cols;
    }
    
    /**
     * Register all available patterns
     */
    registerAllPatterns() {
        this.registerPattern('waves', this.createWavesPattern.bind(this));
        this.registerPattern('spiral', this.createSpiralPattern.bind(this));
        this.registerPattern('rain', this.createRainPattern.bind(this));
        this.registerPattern('noise', this.createNoisePattern.bind(this));
        this.registerPattern('pulse', this.createPulsePattern.bind(this));
        this.registerPattern('scanner', this.createScannerPattern.bind(this));
        this.registerPattern('conway', this.createConwayPattern.bind(this));
        this.registerPattern('text', this.createTextPattern.bind(this));
    }
    
    /**
     * Register a pattern generator
     */
    registerPattern(name, generator) {
        this.patterns.set(name, generator);
    }
    
    /**
     * Get a pattern generator
     */
    getPattern(name) {
        return this.patterns.get(name);
    }
    
    /**
     * Create empty frame
     */
    createEmptyFrame() {
        return Array(this.rows).fill(null).map(() => Array(this.cols).fill(false));
    }
    
    /**
     * PATTERN: Waves
     * Animated sine waves moving across the screen
     */
    createWavesPattern() {
        const frames = [];
        const totalFrames = 120;
        
        for (let f = 0; f < totalFrames; f++) {
            const frame = this.createEmptyFrame();
            const offset = (f / totalFrames) * Math.PI * 2;
            
            for (let row = 0; row < this.rows; row++) {
                for (let col = 0; col < this.cols; col++) {
                    // Multi-wave interference pattern
                    const wave1 = Math.sin((col / this.cols) * Math.PI * 4 + offset);
                    const wave2 = Math.sin((row / this.rows) * Math.PI * 3 + offset * 1.5);
                    const wave3 = Math.sin(((row + col) / (this.rows + this.cols)) * Math.PI * 5 + offset * 0.8);
                    
                    const combined = (wave1 + wave2 + wave3) / 3;
                    frame[row][col] = combined > 0;
                }
            }
            frames.push(frame);
        }
        
        return frames;
    }
    
    /**
     * PATTERN: Spiral
     * Hypnotic spiral expanding from center
     */
    createSpiralPattern() {
        const frames = [];
        const totalFrames = 90;
        const centerRow = this.rows / 2;
        const centerCol = this.cols / 2;
        
        for (let f = 0; f < totalFrames; f++) {
            const frame = this.createEmptyFrame();
            const spiralSpeed = (f / totalFrames) * Math.PI * 4;
            
            for (let row = 0; row < this.rows; row++) {
                for (let col = 0; col < this.cols; col++) {
                    const dx = col - centerCol;
                    const dy = row - centerRow;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const angle = Math.atan2(dy, dx);
                    
                    const spiral = Math.sin(angle * 5 + distance * 0.3 - spiralSpeed);
                    frame[row][col] = spiral > 0;
                }
            }
            frames.push(frame);
        }
        
        return frames;
    }
    
    /**
     * PATTERN: Rain
     * Matrix-style digital rain effect
     */
    createRainPattern() {
        const frames = [];
        const totalFrames = 100;
        const drops = [];
        
        // Initialize rain drops
        for (let i = 0; i < this.cols; i++) {
            drops.push({
                col: i,
                row: Math.floor(Math.random() * this.rows),
                speed: 1 + Math.random() * 2,
                length: 5 + Math.floor(Math.random() * 10)
            });
        }
        
        for (let f = 0; f < totalFrames; f++) {
            const frame = this.createEmptyFrame();
            
            drops.forEach(drop => {
                // Draw drop trail
                for (let i = 0; i < drop.length; i++) {
                    const row = Math.floor(drop.row - i);
                    if (row >= 0 && row < this.rows) {
                        const intensity = 1 - (i / drop.length);
                        frame[row][drop.col] = Math.random() < intensity;
                    }
                }
                
                // Move drop
                drop.row += drop.speed;
                if (drop.row > this.rows + drop.length) {
                    drop.row = -drop.length;
                    drop.speed = 1 + Math.random() * 2;
                    drop.length = 5 + Math.floor(Math.random() * 10);
                }
            });
            
            frames.push(frame);
        }
        
        return frames;
    }
    
    /**
     * PATTERN: Noise
     * Dynamic Perlin-like noise pattern
     */
    createNoisePattern() {
        const frames = [];
        const totalFrames = 80;
        
        for (let f = 0; f < totalFrames; f++) {
            const frame = this.createEmptyFrame();
            const time = f / 20;
            
            for (let row = 0; row < this.rows; row++) {
                for (let col = 0; col < this.cols; col++) {
                    // Multi-octave noise simulation
                    const noise1 = this.pseudoNoise(col * 0.1, row * 0.1, time);
                    const noise2 = this.pseudoNoise(col * 0.2, row * 0.2, time * 1.5) * 0.5;
                    const noise3 = this.pseudoNoise(col * 0.05, row * 0.05, time * 0.8) * 0.25;
                    
                    const combined = noise1 + noise2 + noise3;
                    frame[row][col] = combined > 0.5;
                }
            }
            frames.push(frame);
        }
        
        return frames;
    }
    
    /**
     * PATTERN: Pulse
     * Concentric circles pulsing from center
     */
    createPulsePattern() {
        const frames = [];
        const totalFrames = 60;
        const centerRow = this.rows / 2;
        const centerCol = this.cols / 2;
        const maxDist = Math.sqrt(centerRow * centerRow + centerCol * centerCol);
        
        for (let f = 0; f < totalFrames; f++) {
            const frame = this.createEmptyFrame();
            const pulse = (f / totalFrames) * maxDist * 2;
            
            for (let row = 0; row < this.rows; row++) {
                for (let col = 0; col < this.cols; col++) {
                    const dx = col - centerCol;
                    const dy = row - centerRow;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    // Multiple pulse rings
                    const ring1 = Math.abs((distance - pulse) % (maxDist / 3)) < 3;
                    const ring2 = Math.abs((distance - pulse * 0.7) % (maxDist / 4)) < 2;
                    
                    frame[row][col] = ring1 || ring2;
                }
            }
            frames.push(frame);
        }
        
        return frames;
    }
    
    /**
     * PATTERN: Scanner
     * Horizontal scanning lines with trail effect
     */
    createScannerPattern() {
        const frames = [];
        const totalFrames = this.rows * 2;
        
        for (let f = 0; f < totalFrames; f++) {
            const frame = this.createEmptyFrame();
            const scanRow = f % this.rows;
            const direction = Math.floor(f / this.rows) % 2;
            const actualRow = direction === 0 ? scanRow : this.rows - 1 - scanRow;
            
            // Main scan line
            for (let col = 0; col < this.cols; col++) {
                frame[actualRow][col] = true;
            }
            
            // Trail effect
            for (let i = 1; i <= 5; i++) {
                const trailRow = direction === 0 ? actualRow - i : actualRow + i;
                if (trailRow >= 0 && trailRow < this.rows) {
                    for (let col = 0; col < this.cols; col++) {
                        if (Math.random() < (1 - i / 5)) {
                            frame[trailRow][col] = true;
                        }
                    }
                }
            }
            
            frames.push(frame);
        }
        
        return frames;
    }
    
    /**
     * PATTERN: Conway's Game of Life
     * Classic cellular automaton
     */
    createConwayPattern() {
        const frames = [];
        const totalFrames = 150;
        
        // Initialize with random pattern
        let current = this.createEmptyFrame();
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                current[row][col] = Math.random() < 0.3;
            }
        }
        
        frames.push(this.copyFrame(current));
        
        // Generate evolution
        for (let f = 1; f < totalFrames; f++) {
            const next = this.createEmptyFrame();
            
            for (let row = 0; row < this.rows; row++) {
                for (let col = 0; col < this.cols; col++) {
                    const neighbors = this.countNeighbors(current, row, col);
                    
                    if (current[row][col]) {
                        // Cell is alive
                        next[row][col] = neighbors === 2 || neighbors === 3;
                    } else {
                        // Cell is dead
                        next[row][col] = neighbors === 3;
                    }
                }
            }
            
            // Reset if pattern dies out
            const aliveCount = next.flat().filter(x => x).length;
            if (aliveCount < 10) {
                for (let row = 0; row < this.rows; row++) {
                    for (let col = 0; col < this.cols; col++) {
                        next[row][col] = Math.random() < 0.3;
                    }
                }
            }
            
            current = next;
            frames.push(this.copyFrame(current));
        }
        
        return frames;
    }
    
    /**
     * PATTERN: Scrolling Text
     * Text scrolling across the screen
     */
    createTextPattern() {
        const frames = [];
        const text = "CHECKBOX SCREEN";
        const font = this.getBitmapFont();
        const charSpacing = 6;
        const totalWidth = text.length * charSpacing;
        const totalFrames = this.cols + totalWidth;
        
        for (let f = 0; f < totalFrames; f++) {
            const frame = this.createEmptyFrame();
            const offsetX = this.cols - f;
            
            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                const bitmap = font[char] || font[' '];
                const charX = offsetX + i * charSpacing;
                
                this.drawBitmap(frame, bitmap, Math.floor(this.rows / 2) - 3, charX);
            }
            
            frames.push(frame);
        }
        
        return frames;
    }
    
    /**
     * Helper: Count neighbors for Conway's Game of Life
     */
    countNeighbors(grid, row, col) {
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const r = row + dr;
                const c = col + dc;
                if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
                    if (grid[r][c]) count++;
                }
            }
        }
        return count;
    }
    
    /**
     * Helper: Pseudo noise function
     */
    pseudoNoise(x, y, z) {
        const n = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
        return n - Math.floor(n);
    }
    
    /**
     * Helper: Copy frame
     */
    copyFrame(frame) {
        return frame.map(row => [...row]);
    }
    
    /**
     * Helper: Draw bitmap on frame
     */
    drawBitmap(frame, bitmap, startRow, startCol) {
        for (let r = 0; r < bitmap.length; r++) {
            for (let c = 0; c < bitmap[r].length; c++) {
                const row = startRow + r;
                const col = startCol + c;
                if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
                    if (bitmap[r][c]) {
                        frame[row][col] = true;
                    }
                }
            }
        }
    }
    
    /**
     * Helper: Simple bitmap font (5x5 characters)
     */
    getBitmapFont() {
        return {
            'A': [
                [0,1,1,1,0],
                [1,0,0,0,1],
                [1,1,1,1,1],
                [1,0,0,0,1],
                [1,0,0,0,1]
            ],
            'B': [
                [1,1,1,1,0],
                [1,0,0,0,1],
                [1,1,1,1,0],
                [1,0,0,0,1],
                [1,1,1,1,0]
            ],
            'C': [
                [0,1,1,1,1],
                [1,0,0,0,0],
                [1,0,0,0,0],
                [1,0,0,0,0],
                [0,1,1,1,1]
            ],
            'D': [
                [1,1,1,1,0],
                [1,0,0,0,1],
                [1,0,0,0,1],
                [1,0,0,0,1],
                [1,1,1,1,0]
            ],
            'E': [
                [1,1,1,1,1],
                [1,0,0,0,0],
                [1,1,1,1,0],
                [1,0,0,0,0],
                [1,1,1,1,1]
            ],
            'H': [
                [1,0,0,0,1],
                [1,0,0,0,1],
                [1,1,1,1,1],
                [1,0,0,0,1],
                [1,0,0,0,1]
            ],
            'K': [
                [1,0,0,0,1],
                [1,0,0,1,0],
                [1,1,1,0,0],
                [1,0,0,1,0],
                [1,0,0,0,1]
            ],
            'N': [
                [1,0,0,0,1],
                [1,1,0,0,1],
                [1,0,1,0,1],
                [1,0,0,1,1],
                [1,0,0,0,1]
            ],
            'O': [
                [0,1,1,1,0],
                [1,0,0,0,1],
                [1,0,0,0,1],
                [1,0,0,0,1],
                [0,1,1,1,0]
            ],
            'R': [
                [1,1,1,1,0],
                [1,0,0,0,1],
                [1,1,1,1,0],
                [1,0,0,1,0],
                [1,0,0,0,1]
            ],
            'S': [
                [0,1,1,1,1],
                [1,0,0,0,0],
                [0,1,1,1,0],
                [0,0,0,0,1],
                [1,1,1,1,0]
            ],
            'X': [
                [1,0,0,0,1],
                [0,1,0,1,0],
                [0,0,1,0,0],
                [0,1,0,1,0],
                [1,0,0,0,1]
            ],
            ' ': [
                [0,0,0,0,0],
                [0,0,0,0,0],
                [0,0,0,0,0],
                [0,0,0,0,0],
                [0,0,0,0,0]
            ]
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PatternLibrary;
}
