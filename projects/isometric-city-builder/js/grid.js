const Grid = {
    size: 20,
    tileSize: 64,
    data: [],

    init() {
        this.container = document.getElementById('grid-container');
        this.createGrid();
    },

    createGrid() {
        this.data = [];
        for (let y = 0; y < this.size; y++) {
            this.data[y] = [];
            for (let x = 0; x < this.size; x++) {
                this.data[y][x] = {
                    type: 'empty',
                    level: 0,
                    occupants: 0,
                    powered: true
                };
                this.renderTile(x, y);
            }
        }
    },

    renderTile(x, y) {
        const tile = document.createElement('div');
        tile.className = `tile grass-${Math.floor(Math.random() * 3) + 1}`;
        tile.id = `tile-${x}-${y}`;
        tile.dataset.x = x;
        tile.dataset.y = y;

        // Positioning
        tile.style.left = `${x * this.tileSize}px`;
        tile.style.top = `${y * this.tileSize}px`;

        tile.addEventListener('click', () => Game.handleTileClick(x, y));
        tile.addEventListener('mouseenter', () => Game.handleTileHover(x, y));

        this.container.appendChild(tile);
    },

    getTileData(x, y) {
        if (x < 0 || x >= this.size || y < 0 || y >= this.size) return null;
        return this.data[y][x];
    },

    setTileType(x, y, type) {
        const cell = this.getTileData(x, y);
        if (cell) {
            cell.type = type;
            const tileEl = document.getElementById(`tile-${x}-${y}`);

            // Basic road visual logic
            if (type === 'road') {
                tileEl.className = 'tile road';
                this.updateRoadConnections(x, y);
                // Update neighbors too
                this.updateRoadConnections(x + 1, y);
                this.updateRoadConnections(x - 1, y);
                this.updateRoadConnections(x, y + 1);
                this.updateRoadConnections(x, y - 1);
            } else if (type === 'empty') {
                tileEl.className = `tile grass-1`;
                // If it was a road, neighbors might need update
                this.updateRoadConnections(x + 1, y);
                this.updateRoadConnections(x - 1, y);
                this.updateRoadConnections(x, y + 1);
                this.updateRoadConnections(x, y - 1);
            }
        }
    },

    updateRoadConnections(x, y) {
        const tileEl = document.getElementById(`tile-${x}-${y}`);
        if (!tileEl || !this.getTileData(x, y) || this.getTileData(x, y).type !== 'road') return;

        const n = this.getTileData(x, y - 1)?.type === 'road';
        const s = this.getTileData(x, y + 1)?.type === 'road';
        const e = this.getTileData(x + 1, y)?.type === 'road';
        const w = this.getTileData(x - 1, y)?.type === 'road';

        tileEl.classList.remove('road-h', 'road-v', 'road-intersection');

        if ((n || s) && (e || w)) tileEl.classList.add('road-intersection');
        else if (n || s) tileEl.classList.add('road-v');
        else if (e || w) tileEl.classList.add('road-h');
        else tileEl.classList.add('road-h'); // Default
    },

    isAdjacentToRoad(x, y) {
        const neighbors = [
            this.getTileData(x + 1, y),
            this.getTileData(x - 1, y),
            this.getTileData(x, y + 1),
            this.getTileData(x, y - 1)
        ];
        return neighbors.some(n => n && n.type === 'road');
    }
};
