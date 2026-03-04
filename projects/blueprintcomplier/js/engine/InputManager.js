import { events } from '../core/EventBus.js';
import { MathUtils } from '../core/MathUtils.js';

export class InputManager {
    constructor(viewportController, nodeManager, connectionManager, contextMenu, selectionManager) {
        this.viewport = viewportController;
        this.nodeManager = nodeManager;
        this.connectionManager = connectionManager;
        this.contextMenu = contextMenu;
        this.selectionManager = selectionManager;

        // State
        this.isPanning = false;
        this.panStartX = 0;
        this.panStartY = 0;

        this.isDraggingNode = false;
        this.dragNodeId = null;
        this.nodeDragOffset = { x: 0, y: 0 };

        this.bindEvents();
    }

    bindEvents() {
        const container = document.getElementById('viewport-container');

        // Context Menu
        container.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.contextMenu.show(e.clientX, e.clientY);
        });

        // Pointer Down
        container.addEventListener('pointerdown', (e) => {
            if (e.button === 2) return; // Right click handled by contextmenu

            this.contextMenu.hide();

            const target = e.target;

            // Port Interaction
            if (target.classList.contains('port')) {
                const nodeId = target.dataset.nodeId;
                const portId = target.dataset.portId;
                const isInput = target.dataset.isInput === 'true';
                this.connectionManager.startConnection(nodeId, portId, isInput);
                return;
            }

            // Node Interaction
            const nodeEl = target.closest('.node');
            if (nodeEl) {
                this.isDraggingNode = true;
                this.dragNodeId = nodeEl.dataset.id;
                this.selectionManager.selectNode(this.dragNodeId);

                const matrix = this.viewport.getMatrix();
                const nodeCanvasPos = MathUtils.screenToCanvas(e.clientX, e.clientY, matrix);
                const node = window.app.graphEngine.getNode(this.dragNodeId);

                this.nodeDragOffset = {
                    x: nodeCanvasPos.x - node.x,
                    y: nodeCanvasPos.y - node.y
                };
                return;
            }

            // Background Panning
            this.isPanning = true;
            this.panStartX = e.clientX;
            this.panStartY = e.clientY;
            container.classList.add('panning');
            this.selectionManager.clearSelection();
        });

        // Pointer Move
        window.addEventListener('pointermove', (e) => {
            // Viewport tracking for connections
            const matrix = this.viewport.getMatrix();
            const canvasPos = MathUtils.screenToCanvas(e.clientX, e.clientY, matrix);
            events.emit('viewport-mousemove', canvasPos);

            if (this.isPanning) {
                const dx = e.clientX - this.panStartX;
                const dy = e.clientY - this.panStartY;
                this.viewport.pan(dx, dy);
                this.panStartX = e.clientX;
                this.panStartY = e.clientY;
            }

            if (this.isDraggingNode && this.dragNodeId) {
                const targetX = canvasPos.x - this.nodeDragOffset.x;
                const targetY = canvasPos.y - this.nodeDragOffset.y;
                // Currently only moves the selected node. For multiple selection, we'd offset all selected.
                this.nodeManager.updateNodePosition(this.dragNodeId, targetX, targetY);
            }
        });

        // Pointer Up
        window.addEventListener('pointerup', (e) => {
            this.isPanning = false;
            container.classList.remove('panning');

            this.isDraggingNode = false;
            this.dragNodeId = null;

            if (this.connectionManager.dragData) {
                const target = document.elementFromPoint(e.clientX, e.clientY);
                if (target && target.classList.contains('port')) {
                    const targetNodeId = target.dataset.nodeId;
                    const targetPortId = target.dataset.portId;
                    const targetIsInput = target.dataset.isInput === 'true';
                    this.connectionManager.finishConnection(targetNodeId, targetPortId, targetIsInput);
                } else {
                    this.connectionManager.cancelConnection();
                }
            }
        });

        // Wheel (Zoom)
        container.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.viewport.zoom(e.deltaY, e.clientX, e.clientY);
        }, { passive: false });

        // Keyboard commands
        window.addEventListener('keydown', (e) => {
            // Delete node/connection
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                    this.selectionManager.deleteSelection();
                }
            }
        });

        // External request to delete connection via Double Click
        events.on('request-delete-connection', (connId) => {
            window.app.graphEngine.removeConnection(connId);
        });
    }
}
