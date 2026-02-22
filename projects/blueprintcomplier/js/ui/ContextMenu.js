import { MathUtils } from '../core/MathUtils.js';

export class ContextMenu {
    constructor(element, nodeRegistry) {
        this.element = element;
        this.registry = nodeRegistry;
        this.input = element.querySelector('#node-search');
        this.list = element.querySelector('#node-list');
        this.isVisible = false;

        this.lastX = 0;
        this.lastY = 0;

        this.bindEvents();
    }

    bindEvents() {
        this.input.addEventListener('input', () => this.filterList());

        // Hide if clicking outside
        document.addEventListener('pointerdown', (e) => {
            if (this.isVisible && !this.element.contains(e.target)) {
                this.hide();
            }
        });
    }

    show(x, y) {
        this.lastX = x;
        this.lastY = y;
        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;
        this.element.classList.remove('hidden');
        this.isVisible = true;
        this.input.value = '';
        this.populateList();
        this.input.focus();
    }

    hide() {
        this.element.classList.add('hidden');
        this.isVisible = false;
    }

    populateList(filter = '') {
        this.list.innerHTML = '';
        const types = this.registry.getRegisteredTypes();

        types.forEach((data, typeName) => {
            if (typeName.toLowerCase().includes(filter.toLowerCase())) {
                const li = document.createElement('li');
                li.textContent = typeName;
                li.addEventListener('click', () => {
                    this.spawnNode(typeName);
                    this.hide();
                });
                this.list.appendChild(li);
            }
        });
    }

    filterList() {
        this.populateList(this.input.value);
    }

    spawnNode(typeName) {
        const NodeClass = this.registry.getNodeClass(typeName);
        if (NodeClass) {
            const node = new NodeClass();

            // Translate screen coordinates to canvas coordinates where we clicked
            if (window.app && window.app.viewportController && window.app.graphEngine) {
                const matrix = window.app.viewportController.getMatrix();
                const pos = MathUtils.screenToCanvas(this.lastX, this.lastY, matrix);
                node.setPosition(pos.x, pos.y);
                window.app.graphEngine.addNode(node);
            }
        }
    }
}
