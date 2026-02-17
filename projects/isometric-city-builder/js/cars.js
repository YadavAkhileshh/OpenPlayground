const Cars = {
    carContainer: null,
    maxCars: 12,
    activeCars: 0,

    init() {
        this.carContainer = document.getElementById('car-layer');
        setInterval(() => this.trySpawn(), 3000);
    },

    trySpawn() {
        if (Game.paused || this.activeCars >= this.maxCars) return;

        // Find all roads
        const roads = [];
        for (let y = 0; y < Grid.size; y++) {
            for (let x = 0; x < Grid.size; x++) {
                if (Grid.data[y][x].type === 'road') {
                    roads.push({ x, y });
                }
            }
        }

        if (roads.length < 2) return;

        // Pick random start and end
        const start = roads[Math.floor(Math.random() * roads.length)];
        let end = roads[Math.floor(Math.random() * roads.length)];

        if (start.x === end.x && start.y === end.y) return;

        const path = this.findPath(start, end);
        if (path && path.length > 1) {
            this.spawnCar(path);
        }
    },

    findPath(start, end) {
        const queue = [[start]];
        const visited = new Set();
        visited.add(`${start.x}-${start.y}`);

        while (queue.length > 0) {
            const path = queue.shift();
            const pos = path[path.length - 1];

            if (pos.x === end.x && pos.y === end.y) return path;

            const neighbors = [
                { x: pos.x + 1, y: pos.y },
                { x: pos.x - 1, y: pos.y },
                { x: pos.x, y: pos.y + 1 },
                { x: pos.x, y: pos.y - 1 }
            ];

            for (const n of neighbors) {
                const id = `${n.x}-${n.y}`;
                const cell = Grid.getTileData(n.x, n.y);
                if (cell && cell.type === 'road' && !visited.has(id)) {
                    visited.add(id);
                    queue.push([...path, n]);
                }
            }
        }
        return null;
    },

    spawnCar(path) {
        this.activeCars++;
        const car = document.createElement('div');
        car.className = 'car';

        // Random car color
        const colors = ['#ef4444', '#3b82f6', '#f59e0b', '#10b981'];
        car.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

        this.carContainer.appendChild(car);
        this.moveCar(car, path, 0);
    },

    moveCar(car, path, index) {
        if (Game.paused) {
            setTimeout(() => this.moveCar(car, path, index), 500);
            return;
        }
        if (index >= path.length) {
            car.remove();
            this.activeCars--;
            return;
        }

        const point = path[index];
        const nextPoint = path[index + 1];

        const x = point.x * Grid.tileSize + (Grid.tileSize / 2) - 4;
        const y = point.y * Grid.tileSize + (Grid.tileSize / 2) - 4;

        car.style.transform = `translate3d(${x}px, ${y}px, 2px)`;

        // Determine rotation based on direction
        if (nextPoint) {
            let angle = 0;
            if (nextPoint.x > point.x) angle = 0;
            else if (nextPoint.x < point.x) angle = 180;
            else if (nextPoint.y > point.y) angle = 90;
            else if (nextPoint.y < point.y) angle = -90;
            // Note: isometric rotation adjustment might be needed, but flat on grid is easier for performance
        }

        setTimeout(() => this.moveCar(car, path, index + 1), 600);
    }
};

// Add CSS for car inside the file since it's small or I could add to grid.css
// I'll add to grid.css later or just inject it here.
const carStyle = document.createElement('style');
carStyle.textContent = `
    .car {
        position: absolute;
        width: 10px;
        height: 6px;
        border-radius: 2px;
        transition: transform 0.6s linear;
        z-index: 20;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
`;
document.head.appendChild(carStyle);
