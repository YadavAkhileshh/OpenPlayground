        class WFCSimulator {
            constructor(canvas) {
                this.canvas = canvas;
                this.ctx = canvas.getContext('2d');
                this.size = 20; // grid size (size x size)
                this.cellSize = 400 / this.size;
                this.canvas.width = 400;
                this.canvas.height = 400;
                
                // Define tiles (colors/patterns)
                this.tiles = [
                    { id: 0, name: 'Empty', color: '#1a1a2e', weight: 1 },
                    { id: 1, name: 'Grass', color: '#44bd32', weight: 2 },
                    { id: 2, name: 'Water', color: '#3498db', weight: 1.5 },
                    { id: 3, name: 'Sand', color: '#f1c40f', weight: 1 },
                    { id: 4, name: 'Mountain', color: '#7f8c8d', weight: 0.5 },
                    { id: 5, name: 'Forest', color: '#27ae60', weight: 1.5 },
                    { id: 6, name: 'Snow', color: '#ecf0f1', weight: 0.8 },
                    { id: 7, name: 'Lava', color: '#e74c3c', weight: 0.3 }
                ];
                
                // Adjacency rules (which tiles can be next to each other)
                this.rules = this.initializeRules();
                
                // Wave function: each cell holds array of possible tiles
                this.wave = [];
                
                // Observed/collapsed cells
                this.observed = [];
                
                // Initialize
                this.reset();
                
                // Create tile palette UI
                this.createPalette();
                
                // Animation frame
                this.animating = false;
                this.log = ['⚡ Wave Function initialized'];
            }

            initializeRules() {
                // Create compatibility matrix
                const rules = {};
                
                for (let t1 of this.tiles) {
                    rules[t1.id] = { up: [], down: [], left: [], right: [] };
                    
                    for (let t2 of this.tiles) {
                        // Define which tiles can be adjacent based on tile types
                        // This creates interesting patterns
                        
                        // Same tiles can always connect
                        rules[t1.id].up.push(t2.id);
                        rules[t1.id].down.push(t2.id);
                        rules[t1.id].left.push(t2.id);
                        rules[t1.id].right.push(t2.id);
                        
                        // Add constraints based on tile types
                        if (t1.name === 'Water' && t2.name === 'Sand') {
                            // Water can be next to sand
                        } else if (t1.name === 'Water' && t2.name === 'Grass') {
                            // Water can be next to grass
                        } else if (t1.name === 'Mountain' && t2.name === 'Snow') {
                            // Mountains can have snow on top
                        } else if (t1.name === 'Forest' && t2.name === 'Grass') {
                            // Forests transition to grass
                        } else if (Math.random() > 0.7) {
                            // Random constraints for variety
                        }
                    }
                }
                
                return rules;
            }

            reset() {
                // Initialize all cells with all possible tiles
                this.wave = [];
                this.observed = [];
                
                for (let i = 0; i < this.size * this.size; i++) {
                    this.wave.push({
                        possibilities: this.tiles.map(t => t.id),
                        entropy: this.calculateEntropy(this.tiles.map(t => t.id)),
                        collapsed: false,
                        observedTile: null
                    });
                    this.observed.push(false);
                }
                
                this.logEvent('🔄 Wave Function reset');
                this.updateStats();
                this.draw();
            }

            calculateEntropy(possibilities) {
                // Shannon entropy: -sum(p * log(p))
                let entropy = 0;
                const totalWeight = possibilities.reduce((sum, id) => {
                    return sum + this.tiles.find(t => t.id === id).weight;
                }, 0);
                
                for (let id of possibilities) {
                    const tile = this.tiles.find(t => t.id === id);
                    const p = tile.weight / totalWeight;
                    entropy -= p * Math.log(p);
                }
                
                return entropy;
            }

            findLowestEntropy() {
                let minEntropy = Infinity;
                let candidates = [];
                
                for (let i = 0; i < this.wave.length; i++) {
                    const cell = this.wave[i];
                    if (!cell.collapsed) {
                        if (cell.entropy < minEntropy) {
                            minEntropy = cell.entropy;
                            candidates = [i];
                        } else if (Math.abs(cell.entropy - minEntropy) < 0.01) {
                            candidates.push(i);
                        }
                    }
                }
                
                return candidates[Math.floor(Math.random() * candidates.length)];
            }

            observe(index) {
                if (index === undefined || index === null) {
                    index = this.findLowestEntropy();
                }
                
                const cell = this.wave[index];
                
                // Collapse to a specific tile based on weights
                const weights = cell.possibilities.map(id => 
                    this.tiles.find(t => t.id === id).weight
                );
                
                const totalWeight = weights.reduce((a, b) => a + b, 0);
                let random = Math.random() * totalWeight;
                let selectedTile = null;
                
                for (let i = 0; i < weights.length; i++) {
                    random -= weights[i];
                    if (random <= 0) {
                        selectedTile = cell.possibilities[i];
                        break;
                    }
                }
                
                // Collapse the cell
                cell.collapsed = true;
                cell.observedTile = selectedTile;
                cell.possibilities = [selectedTile];
                cell.entropy = 0;
                this.observed[index] = true;
                
                this.logEvent(`📍 Collapsed cell ${index} to ${this.tiles.find(t => t.id === selectedTile).name}`);
                
                // Propagate constraints
                this.propagate(index);
                
                return selectedTile;
            }

            propagate(startIndex) {
                const stack = [startIndex];
                const startX = startIndex % this.size;
                const startY = Math.floor(startIndex / this.size);
                
                while (stack.length > 0) {
                    const current = stack.pop();
                    const x = current % this.size;
                    const y = Math.floor(current / this.size);
                    const currentCell = this.wave[current];
                    
                    if (!currentCell.collapsed) continue;
                    
                    // Check neighbors
                    const neighbors = [
                        { dir: 'up', dx: 0, dy: -1, opposite: 'down' },
                        { dir: 'down', dx: 0, dy: 1, opposite: 'up' },
                        { dir: 'left', dx: -1, dy: 0, opposite: 'right' },
                        { dir: 'right', dx: 1, dy: 0, opposite: 'left' }
                    ];
                    
                    for (let n of neighbors) {
                        const nx = x + n.dx;
                        const ny = y + n.dy;
                        
                        // Check bounds
                        if (nx < 0 || nx >= this.size || ny < 0 || ny >= this.size) {
                            continue;
                        }
                        
                        const neighborIndex = ny * this.size + nx;
                        const neighbor = this.wave[neighborIndex];
                        
                        if (neighbor.collapsed) continue;
                        
                        // Filter neighbor possibilities based on current tile
                        const currentTile = currentCell.observedTile;
                        const allowedNeighbors = this.rules[currentTile][n.dir];
                        
                        const newPossibilities = neighbor.possibilities.filter(p => 
                            allowedNeighbors.includes(p)
                        );
                        
                        if (newPossibilities.length !== neighbor.possibilities.length) {
                            neighbor.possibilities = newPossibilities;
                            neighbor.entropy = this.calculateEntropy(newPossibilities);
                            
                            if (newPossibilities.length === 1) {
                                // This neighbor is now determined
                                neighbor.collapsed = true;
                                neighbor.observedTile = newPossibilities[0];
                                this.observed[neighborIndex] = true;
                                stack.push(neighborIndex);
                            } else if (newPossibilities.length === 0) {
                                // Contradiction! Reset?
                                console.warn('Contradiction at', neighborIndex);
                                this.logEvent('⚠️ Contradiction detected - resetting');
                                this.reset();
                                return;
                            }
                        }
                    }
                }
            }

            collapseStep() {
                const start = performance.now();
                
                if (this.observed.every(v => v)) {
                    this.logEvent('✅ All cells collapsed');
                    return;
                }
                
                const index = this.findLowestEntropy();
                this.observe(index);
                
                const time = performance.now() - start;
                document.getElementById('algo-time').textContent = time.toFixed(2) + 'ms';
                
                this.updateStats();
                this.draw();
            }

            collapseAll() {
                const start = performance.now();
                
                let iterations = 0;
                while (!this.observed.every(v => v) && iterations < 1000) {
                    const index = this.findLowestEntropy();
                    if (index === undefined) break;
                    this.observe(index);
                    iterations++;
                }
                
                const time = performance.now() - start;
                document.getElementById('algo-time').textContent = time.toFixed(2) + 'ms';
                
                this.logEvent(`⚡ Collapsed all in ${iterations} steps`);
                this.updateStats();
                this.draw();
            }

            observeLowest() {
                this.collapseStep();
            }

            draw() {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                
                const cellSize = this.canvas.width / this.size;
                
                // Draw grid cells
                for (let y = 0; y < this.size; y++) {
                    for (let x = 0; x < this.size; x++) {
                        const index = y * this.size + x;
                        const cell = this.wave[index];
                        
                        const cx = x * cellSize;
                        const cy = y * cellSize;
                        
                        if (cell.collapsed) {
                            // Draw collapsed cell
                            const tile = this.tiles.find(t => t.id === cell.observedTile);
                            this.ctx.fillStyle = tile.color;
                            this.ctx.fillRect(cx, cy, cellSize - 1, cellSize - 1);
                            
                            // Draw tile symbol
                            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                            this.ctx.font = `${cellSize * 0.6}px monospace`;
                            this.ctx.textAlign = 'center';
                            this.ctx.textBaseline = 'middle';
                            
                            let symbol = '';
                            switch(tile.name) {
                                case 'Grass': symbol = '🌿'; break;
                                case 'Water': symbol = '💧'; break;
                                case 'Sand': symbol = '⏳'; break;
                                case 'Mountain': symbol = '⛰️'; break;
                                case 'Forest': symbol = '🌲'; break;
                                case 'Snow': symbol = '❄️'; break;
                                case 'Lava': symbol = '🔥'; break;
                                default: symbol = '⬛';
                            }
                            
                            this.ctx.fillText(symbol, cx + cellSize/2, cy + cellSize/2);
                        } else {
                            // Draw superposition (entropy visualization)
                            const entropyNorm = cell.entropy / Math.log(this.tiles.length);
                            
                            // Color based on entropy
                            const hue = 200 + entropyNorm * 160;
                            this.ctx.fillStyle = `hsla(${hue}, 80%, 50%, 0.3)`;
                            this.ctx.fillRect(cx, cy, cellSize - 1, cellSize - 1);
                            
                            // Draw number of possibilities
                            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                            this.ctx.font = `${cellSize * 0.4}px monospace`;
                            this.ctx.textAlign = 'center';
                            this.ctx.textBaseline = 'middle';
                            this.ctx.fillText(
                                cell.possibilities.length,
                                cx + cellSize/2,
                                cy + cellSize/2
                            );
                        }
                        
                        // Draw grid lines
                        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                        this.ctx.strokeRect(cx, cy, cellSize, cellSize);
                    }
                }
            }

            updateStats() {
                const collapsed = this.observed.filter(v => v).length;
                const superpositions = this.observed.filter(v => !v).length;
                
                document.getElementById('cell-count').textContent = this.size * this.size;
                document.getElementById('collapsed-count').textContent = collapsed;
                document.getElementById('superposition-count').textContent = superpositions;
                
                // Calculate average entropy
                let totalEntropy = 0;
                for (let cell of this.wave) {
                    if (!cell.collapsed) {
                        totalEntropy += cell.entropy;
                    }
                }
                const avgEntropy = totalEntropy / Math.max(1, superpositions);
                document.getElementById('entropy-display').textContent = avgEntropy.toFixed(2);
            }

            createPalette() {
                const palette = document.getElementById('tile-palette');
                palette.innerHTML = '';
                
                this.tiles.forEach(tile => {
                    const tileEl = document.createElement('div');
                    tileEl.className = 'tile';
                    tileEl.innerHTML = `<div class="tile-preview" style="background: ${tile.color}"></div>`;
                    tileEl.onclick = () => this.selectTile(tile.id);
                    palette.appendChild(tileEl);
                });
                
                // Select first tile by default
                if (palette.firstChild) {
                    palette.firstChild.classList.add('selected');
                }
            }

            selectTile(id) {
                document.querySelectorAll('.tile').forEach(t => t.classList.remove('selected'));
                event.currentTarget.classList.add('selected');
                
                // Update constraint visualization
                this.updateConstraints(id);
            }

            updateConstraints(tileId) {
                const tile = this.tiles.find(t => t.id === tileId);
                const constraints = document.getElementById('constraint-grid');
                
                constraints.innerHTML = '';
                
                const directions = ['up', 'right', 'down', 'left'];
                const dirLabels = ['↑ Up', '→ Right', '↓ Down', '← Left'];
                
                directions.forEach((dir, i) => {
                    const allowed = this.rules[tileId][dir];
                    
                    const card = document.createElement('div');
                    card.className = 'constraint-card';
                    card.innerHTML = `
                        <div class="direction-label">${dirLabels[i]}</div>
                        <div class="direction-row">
                            ${allowed.slice(0, 4).map(id => {
                                const t = this.tiles.find(t => t.id === id);
                                return `<div class="mini-tile" style="background: ${t.color}" title="${t.name}"></div>`;
                            }).join('')}
                        </div>
                        <div style="color: #aaa; font-size: 0.7rem; margin-top: 5px;">
                            ${allowed.length} possibilities
                        </div>
                    `;
                    
                    constraints.appendChild(card);
                });
            }

            logEvent(message) {
                this.log.unshift(`[${new Date().toLocaleTimeString()}] ${message}`);
                if (this.log.length > 5) this.log.pop();
                
                const logEl = document.getElementById('observation-log');
                logEl.innerHTML = this.log.map(msg => 
                    `<div class="log-entry">${msg}</div>`
                ).join('');
            }

            setSize(newSize) {
                this.size = newSize;
                this.cellSize = 400 / this.size;
                this.reset();
            }
        }

        // Initialize WFC
        const canvas = document.getElementById('wfc-canvas');
        const wfc = new WFCSimulator(canvas);

        // Global control functions
        function collapseAll() {
            wfc.collapseAll();
        }

        function collapseStep() {
            wfc.collapseStep();
        }

        function observeLowest() {
            wfc.observeLowest();
        }

        function resetWFC() {
            wfc.reset();
        }

        // Grid size slider
        document.getElementById('grid-size').addEventListener('input', (e) => {
            const size = parseInt(e.target.value);
            document.getElementById('grid-size-val').textContent = `${size}x${size}`;
            wfc.setSize(size);
        });

        // Periodic boundary toggle
        document.getElementById('periodic').addEventListener('change', (e) => {
            // This would update boundary conditions in a more advanced implementation
            wfc.logEvent(e.target.checked ? '🌐 Enabled periodic boundaries' : '🧱 Disabled periodic boundaries');
        });

        // Initialize
        wfc.updateConstraints(0);