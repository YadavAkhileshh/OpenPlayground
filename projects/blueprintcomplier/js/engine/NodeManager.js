import { events } from '../core/EventBus.js';

export class NodeManager {
    constructor(graphEngine, containerElement) {
        this.graphEngine = graphEngine;
        this.container = containerElement;
        this.nodeElements = new Map(); // nodeId -> DOM element

        events.on('node-added', (node) => this.renderNode(node));
        events.on('node-removed', (nodeId) => this.destroyNode(nodeId));
    }

    renderNode(node) {
        const el = document.createElement('div');
        el.className = `node ${node.category}`;
        el.dataset.id = node.id;
        el.style.transform = `translate(${node.x}px, ${node.y}px)`;

        // Header
        const header = document.createElement('div');
        header.className = 'node-header';
        header.textContent = node.title;
        el.appendChild(header);

        // Body
        const body = document.createElement('div');
        body.className = 'node-body';

        // Input Ports
        const inContainer = document.createElement('div');
        inContainer.className = 'ports-in';
        node.inputs.forEach(port => {
            const row = this.createPortRow(port);
            inContainer.appendChild(row);
        });

        // Output Ports
        const outContainer = document.createElement('div');
        outContainer.className = 'ports-out';
        node.outputs.forEach(port => {
            const row = this.createPortRow(port, true);
            outContainer.appendChild(row);
        });

        body.appendChild(inContainer);
        body.appendChild(outContainer);
        el.appendChild(body);

        // Append to container
        this.container.appendChild(el);
        this.nodeElements.set(node.id, el);
    }

    createPortRow(port, reverse = false) {
        const row = document.createElement('div');
        row.className = 'port-row';

        const portEl = document.createElement('div');
        portEl.className = `port ${port.type}`;
        if (port.isExec) portEl.classList.add('exec');
        portEl.dataset.nodeId = port.parentNodeId;
        portEl.dataset.portId = port.id;
        portEl.dataset.isInput = port.isInput;

        const label = document.createElement('div');
        label.className = 'port-label';
        label.textContent = port.name;

        if (reverse) {
            row.appendChild(label);
            row.appendChild(portEl);
        } else {
            row.appendChild(portEl);
            row.appendChild(label);

            // Add input field for literal data inputs if they type is not exec and it's a data node
            if (!port.isExec && ['number', 'string'].includes(port.type) && port.defaultValue !== undefined) {
                const input = document.createElement('input');
                input.type = port.type === 'number' ? 'number' : 'text';
                input.className = 'node-input-control';
                input.value = port.defaultValue;
                input.addEventListener('input', (e) => {
                    port.defaultValue = port.type === 'number' ? parseFloat(e.target.value) : e.target.value;
                });
                // Provide some spacing
                const wrapper = document.createElement('div');
                wrapper.style.display = 'flex';
                wrapper.style.flexDirection = 'column';
                wrapper.appendChild(row);
                wrapper.appendChild(input);
                return wrapper;
            }
        }

        return row;
    }

    updateNodePosition(nodeId, x, y) {
        const node = this.graphEngine.getNode(nodeId);
        const el = this.nodeElements.get(nodeId);
        if (node && el) {
            node.setPosition(x, y);
            el.style.transform = `translate(${x}px, ${y}px)`;
            events.emit('node-moved', node);
        }
    }

    destroyNode(nodeId) {
        const el = this.nodeElements.get(nodeId);
        if (el) {
            el.remove();
            this.nodeElements.delete(nodeId);
        }
    }

    clear() {
        this.container.innerHTML = '';
        this.nodeElements.clear();
    }
}
