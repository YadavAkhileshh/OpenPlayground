const Game = {
    selectedTool: 'road',
    paused: false,

    init() {
        try {
            Grid.init();
            Economy.init();
            Cycle.init();
            Cars.init();

            this.bindEvents();
            this.load(); // Try to load saved game
            this.notify("City initialized. Build some roads to start!");
        } catch (e) {
            console.error("Game Initialization Failed:", e);
        }
    },

    bindEvents() {
        // Tool Buttons
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectTool(btn.dataset.tool);
            });
        });

        // Viewport Panning (Mouse + Touch)
        const viewport = document.getElementById('viewport');
        const world = document.getElementById('game-world');
        let isPanning = false;
        let startX, startY;
        let scrollLeft, scrollTop;

        viewport.addEventListener('pointerdown', (e) => {
            if (e.target.classList.contains('tile') && !this.paused) return; // Allow tile clicks
            isPanning = true;
            startX = e.pageX - viewport.offsetLeft;
            startY = e.pageY - viewport.offsetTop;
            scrollLeft = viewport.scrollLeft;
            scrollTop = viewport.scrollTop;
            viewport.setPointerCapture(e.pointerId);
        });

        viewport.addEventListener('pointermove', (e) => {
            if (!isPanning) return;
            e.preventDefault();
            const x = e.pageX - viewport.offsetLeft;
            const y = e.pageY - viewport.offsetTop;
            const walkX = (x - startX);
            const walkY = (y - startY);

            // Adjust scroll position or transform
            // Using scrollTop/Left works if viewport is scrollable, 
            // but we can also adjust game-world transform
            const currentTransform = new WebKitCSSMatrix(window.getComputedStyle(world).transform);
            const newX = currentTransform.m41 + (x - startX);
            const newY = currentTransform.m42 + (y - startY);

            world.style.transform = `translate(${newX}px, ${newY}px)`;
            startX = x;
            startY = y;
        });

        viewport.addEventListener('pointerup', (e) => {
            isPanning = false;
            viewport.releasePointerCapture(e.pointerId);
        });

        // Pause Button
        const pauseBtn = document.getElementById('btn-pause');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.togglePause());
        }

        // Save Button
        const saveBtn = document.getElementById('btn-save');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.save());
        }

        // Keyboard Shortcuts
        window.addEventListener('keydown', (e) => {
            if (this.paused && (e.key.toLowerCase() !== 'p')) return;
            switch (e.key.toLowerCase()) {
                case '1': this.selectTool('road'); break;
                case '2': this.selectTool('residential'); break;
                case '3': this.selectTool('commercial'); break;
                case '4': this.selectTool('industrial'); break;
                case '5': this.selectTool('powerplant'); break;
                case '6': this.selectTool('park'); break;
                case 'b': this.selectTool('bulldozer'); break;
                case 'p': this.togglePause(); break;
            }
        });
    },

    togglePause() {
        this.paused = !this.paused;
        const btn = document.getElementById('btn-pause');
        if (btn) {
            btn.textContent = this.paused ? 'RESUME' : 'PAUSE';
            btn.classList.toggle('active', this.paused);
        }
        this.notify(this.paused ? "Game Paused" : "Game Resumed");
    },

    selectTool(tool) {
        if (this.paused) return;
        this.selectedTool = tool;
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tool === tool);
        });
    },

    handleTileClick(x, y) {
        if (this.paused) return;
        const cell = Grid.getTileData(x, y);

        if (this.selectedTool === 'bulldozer') {
            if (cell.type !== 'empty') {
                Buildings.remove(x, y);
                Grid.setTileType(x, y, 'empty');
                Economy.refund(cell.type);
            }
            return;
        }

        if (cell.type !== 'empty') {
            if (cell.type === this.selectedTool && this.selectedTool !== 'road') {
                if (Economy.canAfford(this.selectedTool)) {
                    Economy.spend(this.selectedTool);
                    Buildings.upgrade(x, y);
                }
            }
            return;
        }

        if (this.selectedTool !== 'road' && !Grid.isAdjacentToRoad(x, y)) {
            this.notify("Buildings must be adjacent to a road!", "error");
            return;
        }

        if (Economy.canAfford(this.selectedTool)) {
            Economy.spend(this.selectedTool);
            Grid.setTileType(x, y, this.selectedTool);

            if (this.selectedTool !== 'road') {
                Buildings.place(x, y, this.selectedTool);
            }
        } else {
            this.notify("Not enough money!", "error");
        }
    },

    handleTileHover(x, y) {
        if (this.paused) return;
        const cell = Grid.getTileData(x, y);
        const tileEl = document.getElementById(`tile-${x}-${y}`);
        if (!tileEl) return;

        document.querySelectorAll('.tile').forEach(t => t.classList.remove('preview-valid', 'preview-invalid'));

        if (this.selectedTool === 'bulldozer') {
            if (cell.type !== 'empty') tileEl.classList.add('preview-invalid');
            return;
        }

        if (cell.type === 'empty') {
            const isValid = this.selectedTool === 'road' || Grid.isAdjacentToRoad(x, y);
            tileEl.classList.add(isValid ? 'preview-valid' : 'preview-invalid');
        }
    },

    save() {
        const saveData = {
            money: Economy.money,
            population: Economy.population,
            time: Cycle.time,
            grid: Grid.data.map(row => row.map(cell => ({ ...cell })))
        };
        localStorage.setItem('isoCitySave', JSON.stringify(saveData));
        this.notify("City saved to local storage!");
    },

    load() {
        const saved = localStorage.getItem('isoCitySave');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                Economy.money = data.money;
                Economy.population = data.population;
                Cycle.time = data.time;

                // Re-apply grid
                for (let y = 0; y < Grid.size; y++) {
                    for (let x = 0; x < Grid.size; x++) {
                        const cellData = data.grid[y][x];
                        if (cellData.type !== 'empty') {
                            Grid.setTileType(x, y, cellData.type);
                            if (cellData.type !== 'road') {
                                Buildings.place(x, y, cellData.type);
                                // Set levels if they were higher
                                for (let i = 1; i < cellData.level; i++) {
                                    Buildings.upgrade(x, y);
                                }
                            }
                        }
                    }
                }
                Economy.updateUI();
                Cycle.updateUI();
                Economy.processInterval(); // Recalculate power/income
                this.notify("City loaded successfully!");
            } catch (e) {
                console.error("Failed to load save:", e);
            }
        }
    },

    notify(message, type = "info") {
        const notifEl = document.getElementById('notifications');
        if (!notifEl) return;
        const msg = document.createElement('div');
        msg.className = `notification ${type}`;
        msg.textContent = message;

        notifEl.prepend(msg);
        if (notifEl.children.length > 5) {
            notifEl.lastElementChild.remove();
        }
        setTimeout(() => { if (msg) msg.style.opacity = '0.5'; }, 3000);
    }
};

// Start the game
window.addEventListener('load', () => Game.init());
