/**
 * memory-map.js
 * Renders a grid of "memory blocks" that corrupt over time.
 */

export class MemoryMap {
    constructor() {
        this.container = null;
        this.grid = null;
        this.blocks = [];
        this.cols = 20;
        this.rows = 10;
    }

    init() {
        if (!document.getElementById('memory-map-container')) {
            this.createDOM();
        }
        this.container = document.getElementById('memory-map-container');
        this.grid = this.container.querySelector('.memory-grid');
        this.buildGrid();
    }

    createDOM() {
        const div = document.createElement('div');
        div.id = 'memory-map-container';
        div.className = 'memory-widget';
        div.innerHTML = `
            <div class="memory-header">MEMORY.ALLOC</div>
            <div class="memory-grid"></div>
        `;
        document.body.appendChild(div);
    }

    buildGrid() {
        this.grid.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;

        for (let i = 0; i < this.cols * this.rows; i++) {
            const block = document.createElement('div');
            block.className = 'mem-block state-good';
            block.dataset.idx = i;

            block.addEventListener('mouseover', () => {
                block.className = 'mem-block state-active';
                setTimeout(() => {
                    block.className = 'mem-block state-good';
                }, 500);
            });

            this.grid.appendChild(block);
            this.blocks.push(block);
        }
    }

    update(chaosLevel) {
        if (chaosLevel < 0.05) return;

        const idx = Math.floor(Math.random() * this.blocks.length);
        const block = this.blocks[idx];
        const roll = Math.random();

        if (roll < chaosLevel) {
            if (block.classList.contains('state-good')) {
                block.className = 'mem-block state-warn';
            } else if (block.classList.contains('state-warn')) {
                block.className = 'mem-block state-crit';
            } else if (block.classList.contains('state-crit')) {
                block.className = (Math.random() > 0.5) ? 'mem-block state-dead' : 'mem-block state-crit';
            }
        } else if (roll > 0.98) {
            block.className = 'mem-block state-good';
        }
    }
}
