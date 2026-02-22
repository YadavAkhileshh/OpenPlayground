import { ConnectionModel } from '../models/ConnectionModel.js';
import { events } from '../core/EventBus.js';

export class ConnectionManager {
    constructor(graphEngine) {
        this.graphEngine = graphEngine;
        this.dragData = null;
    }

    startConnection(nodeId, portId, isInput) {
        const node = this.graphEngine.getNode(nodeId);
        if (!node) return;
        const port = isInput ? node.getInput(portId) : node.getOutput(portId);

        if (!port) return;

        this.dragData = {
            startNodeId: nodeId,
            startPortId: portId,
            startPort: port,
            isInput: isInput
        };

        events.emit('connection-drag-start', this.dragData);
    }

    finishConnection(targetNodeId, targetPortId, targetIsInput) {
        if (!this.dragData) return;

        const targetNode = this.graphEngine.getNode(targetNodeId);
        if (!targetNode) {
            this.cancelConnection();
            return;
        }

        const targetPort = targetIsInput ? targetNode.getInput(targetPortId) : targetNode.getOutput(targetPortId);

        if (!targetPort) {
            this.cancelConnection();
            return;
        }

        // Validate
        if (this.dragData.startPort.canConnectTo(targetPort)) {
            // Ensure connection goes from Output -> Input
            let outNodeId, outPortId, inNodeId, inPortId;

            if (this.dragData.isInput) {
                outNodeId = targetNodeId;
                outPortId = targetPortId;
                inNodeId = this.dragData.startNodeId;
                inPortId = this.dragData.startPortId;
            } else {
                outNodeId = this.dragData.startNodeId;
                outPortId = this.dragData.startPortId;
                inNodeId = targetNodeId;
                inPortId = targetPortId;
            }

            // Unlink existing inputs if strictly one connection allowed (for Exec ports it's often 1:1, or 1 data port input)
            // Simplified: prevent multiple incoming connections to a single input port
            const existingConns = Array.from(this.graphEngine.graph.connections.values());
            const duplicates = existingConns.filter(c => c.inputNodeId === inNodeId && c.inputPortId === inPortId);
            duplicates.forEach(d => this.graphEngine.removeConnection(d.id));

            // Also clean up if replacing an exec output connection
            if (this.dragData.startPort.isExec) {
                const execDup = existingConns.filter(c => c.outputNodeId === outNodeId && c.outputPortId === outPortId);
                execDup.forEach(d => this.graphEngine.removeConnection(d.id));
            }

            const conn = new ConnectionModel(outNodeId, outPortId, inNodeId, inPortId, this.dragData.startPort.isExec);
            this.graphEngine.addConnection(conn);
        } else {
            console.warn("Invalid connection attempted.");
        }

        this.dragData = null;
        events.emit('connection-drag-end');
    }

    cancelConnection() {
        if (this.dragData) {
            this.dragData = null;
            events.emit('connection-drag-end');
        }
    }

    clear() {
        this.dragData = null;
    }
}
