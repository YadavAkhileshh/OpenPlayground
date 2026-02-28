const Buildings = {
    registry: {}, // Map of "x-y" to building elements

    place(x, y, type) {
        if (this.registry[`${x}-${y}`]) return;

        const container = document.getElementById('grid-container');
        const b = document.createElement('div');
        b.className = `building ${type} construction`;
        b.id = `building-${x}-${y}`;
        b.dataset.x = x;
        b.dataset.y = y;
        b.dataset.level = 1;

        // Grid Position
        b.style.left = `${x * Grid.tileSize}px`;
        b.style.top = `${y * Grid.tileSize}px`;

        // No translateZ for the unit itself to maintain ground alignment
        // Sort purely by DOM order for isometric
        this.insertSorted(b, x, y);

        // Create 4 Walls
        ['front', 'back', 'left', 'right'].forEach(side => {
            const wall = document.createElement('div');
            wall.className = `wall ${side}`;

            // Add specific details to the front wall
            if (side === 'front') {
                if (type === 'commercial') {
                    const shop = document.createElement('div');
                    shop.className = 'storefront';
                    wall.appendChild(shop);
                }
                if (type === 'industrial') {
                    const garage = document.createElement('div');
                    garage.className = 'garage';
                    wall.appendChild(garage);
                }
            }
            b.appendChild(wall);
        });

        // Create Roof
        const roof = document.createElement('div');
        roof.className = 'roof-plane';

        // Add roof details
        if (type === 'industrial') {
            const unit = document.createElement('div');
            unit.className = 'hvac';
            unit.style.position = 'absolute';
            unit.style.width = '10px';
            unit.style.height = '10px';
            unit.style.background = '#ccc';
            unit.style.top = '10px';
            unit.style.left = '10px';
            unit.style.border = '1px solid #999';
            roof.appendChild(unit);
        }

        b.appendChild(roof);
        this.registry[`${x}-${y}`] = b;

        // Animation
        requestAnimationFrame(() => b.classList.remove('construction'));

        // Economy Stats
        if (type === 'residential') Economy.addPopulation(10);
        else if (type === 'industrial') Economy.addPopulation(5);
        else if (type === 'powerplant') Economy.processInterval();
    },

    insertSorted(building, x, y) {
        const container = document.getElementById('grid-container');
        const buildings = Array.from(container.children).filter(el => el.classList.contains('building'));

        const score = x + y;
        let inserted = false;

        for (let i = 0; i < buildings.length; i++) {
            const bX = parseInt(buildings[i].dataset.x);
            const bY = parseInt(buildings[i].dataset.y);
            if (bX + bY > score) {
                container.insertBefore(building, buildings[i]);
                inserted = true;
                break;
            }
        }

        if (!inserted) {
            container.appendChild(building);
        }
    },

    remove(x, y) {
        const id = `${x}-${y}`;
        const b = this.registry[id];
        if (b) {
            if (b.classList.contains('residential')) Economy.removePopulation(10);
            if (b.classList.contains('industrial')) Economy.removePopulation(5);
            b.classList.add('construction');
            setTimeout(() => {
                b.remove();
                delete this.registry[id];
            }, 500);
        }
    },

    upgrade(x, y) {
        const b = this.registry[`${x}-${y}`];
        if (b) {
            let level = parseInt(b.dataset.level);
            if (level < 3) {
                level++;
                b.dataset.level = level;
                b.classList.remove('level-1', 'level-2', 'level-3');
                b.classList.add(`level-${level}`);
                if (b.classList.contains('residential')) Economy.addPopulation(15);
                if (b.classList.contains('industrial')) Economy.addPopulation(10);
            }
        }
    }
};
