export class SelectionManager {
    constructor(viewportController, nodeManager) {
        this.viewport = viewportController;
        this.nodeManager = nodeManager;
        this.selectedNodes = new Set();
    }

    selectNode(nodeId) {
        this.clearSelection();
        this.selectedNodes.add(nodeId);

        const el = this.nodeManager.nodeElements.get(nodeId);
        if (el) {
            el.classList.add('selected');
        }
    }

    clearSelection() {
        this.selectedNodes.forEach(nodeId => {
            const el = this.nodeManager.nodeElements.get(nodeId);
            if (el) {
                el.classList.remove('selected');
            }
        });
        this.selectedNodes.clear();
    }

    deleteSelection() {
        if (!window.app || !window.app.graphEngine) return;
        this.selectedNodes.forEach(nodeId => {
            window.app.graphEngine.removeNode(nodeId);
        });
        this.selectedNodes.clear();
    }
}
