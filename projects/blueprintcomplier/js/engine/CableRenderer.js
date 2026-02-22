import { MathUtils } from '../core/MathUtils.js';
import { Utils } from '../core/Utils.js';
import { events } from '../core/EventBus.js';

export class CableRenderer {
    constructor(svgContainer) {
        this.svg = svgContainer;
        this.cables = new Map(); // connectionId -> SVGPathElement
        this.paths = new Map(); // connectionId -> {startX, startY, endX, endY}

        events.on('connection-added', (conn) => this.addCable(conn));
        events.on('connection-removed', (conn) => this.removeCable(conn.id));
        events.on('node-moved', (node) => this.updateNodeCables(node));

        // Handle dragging connection
        this.dragCable = null;
        events.on('connection-drag-start', (data) => this.startDragCable(data));
        events.on('connection-drag-end', () => this.endDragCable());
        events.on('viewport-mousemove', (pos) => this.updateDragCable(pos.x, pos.y));
    }

    addCable(connection) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.classList.add('cable');
        if (connection.isExec) path.classList.add('exec');
        path.dataset.id = connection.id;

        // Double click to delete
        path.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            events.emit('request-delete-connection', connection.id);
        });

        this.svg.appendChild(path);
        this.cables.set(connection.id, path);
        this.paths.set(connection.id, { startX: 0, startY: 0, endX: 0, endY: 0 });

        this.updateCablePoints(connection.id, connection.outputNodeId, connection.outputPortId, connection.inputNodeId, connection.inputPortId);
    }

    removeCable(connectionId) {
        const path = this.cables.get(connectionId);
        if (path) {
            path.remove();
            this.cables.delete(connectionId);
            this.paths.delete(connectionId);
        }
    }

    updateNodeCables(node) {
        // Need to update all cables connected to this node
        // We iterate all cables and re-calculate if they touch this node
        const engine = window.app.graphEngine;
        if (!engine) return;

        const connections = engine.getConnectionsForNode(node.id);
        connections.forEach(conn => {
            this.updateCablePoints(conn.id, conn.outputNodeId, conn.outputPortId, conn.inputNodeId, conn.inputPortId);
        });
    }

    updateCablePoints(connId, outNodeId, outPortId, inNodeId, inPortId) {
        const outPortDOM = document.querySelector(`.port[data-node-id="${outNodeId}"][data-port-id="${outPortId}"]`);
        const inPortDOM = document.querySelector(`.port[data-node-id="${inNodeId}"][data-port-id="${inPortId}"]`);

        if (outPortDOM && inPortDOM && window.app.viewportController) {
            const outCenter = Utils.getElementCenter(outPortDOM);
            const inCenter = Utils.getElementCenter(inPortDOM);

            const matrix = window.app.viewportController.getMatrix();
            const startCanvas = MathUtils.screenToCanvas(outCenter.x, outCenter.y, matrix);
            const endCanvas = MathUtils.screenToCanvas(inCenter.x, inCenter.y, matrix);

            const pathStr = MathUtils.getBezierPath(startCanvas.x, startCanvas.y, endCanvas.x, endCanvas.y);
            const pathEl = this.cables.get(connId);
            if (pathEl) {
                pathEl.setAttribute('d', pathStr);

                // Color based on type could be applied here by checking DOM classes, 
                // but we rely on generic .cable logic for constraints
            }
        }
    }

    startDragCable(data) {
        this.dragCable = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.dragCable.classList.add('cable', 'dragging');
        if (data.startPort.isExec) this.dragCable.classList.add('exec');
        this.svg.appendChild(this.dragCable);

        const portDOM = document.querySelector(`.port[data-node-id="${data.startNodeId}"][data-port-id="${data.startPortId}"]`);
        if (portDOM) {
            const center = Utils.getElementCenter(portDOM);
            const matrix = window.app.viewportController.getMatrix();
            this.dragStartPoint = MathUtils.screenToCanvas(center.x, center.y, matrix);
            this.dragIsInput = data.isInput;
        }
    }

    updateDragCable(canvasX, canvasY) {
        if (!this.dragCable || !this.dragStartPoint) return;

        let startX, startY, endX, endY;
        if (this.dragIsInput) {
            startX = canvasX;
            startY = canvasY;
            endX = this.dragStartPoint.x;
            endY = this.dragStartPoint.y;
        } else {
            startX = this.dragStartPoint.x;
            startY = this.dragStartPoint.y;
            endX = canvasX;
            endY = canvasY;
        }

        const pathStr = MathUtils.getBezierPath(startX, startY, endX, endY);
        this.dragCable.setAttribute('d', pathStr);
    }

    endDragCable() {
        if (this.dragCable) {
            this.dragCable.remove();
            this.dragCable = null;
            this.dragStartPoint = null;
        }
    }

    clear() {
        this.svg.innerHTML = '';
        this.cables.clear();
        this.paths.clear();
        this.endDragCable();
    }
}
