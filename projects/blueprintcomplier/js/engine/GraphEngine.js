import { Graph } from '../models/Graph.js';
import { events } from '../core/EventBus.js';

export class GraphEngine {
    constructor() {
        this.graph = new Graph();
    }

    addNode(node) {
        this.graph.addNode(node);
        events.emit('node-added', node);
    }

    removeNode(nodeId) {
        const node = this.graph.getNode(nodeId);
        if (node) {
            // Find and remove all connected cables first
            const connectionsToRemove = Array.from(this.graph.connections.values())
                .filter(c => c.outputNodeId === nodeId || c.inputNodeId === nodeId);

            connectionsToRemove.forEach(c => this.removeConnection(c.id));

            this.graph.removeNode(nodeId);
            events.emit('node-removed', nodeId);
        }
    }

    addConnection(connection) {
        this.graph.addConnection(connection);
        events.emit('connection-added', connection);
    }

    removeConnection(connectionId) {
        const conn = this.graph.getConnection(connectionId);
        if (conn) {
            this.graph.removeConnection(connectionId);
            events.emit('connection-removed', conn);
        }
    }

    clear() {
        this.graph.clear();
        events.emit('graph-cleared');
    }

    getNode(nodeId) {
        return this.graph.getNode(nodeId);
    }

    getConnectionsForNode(nodeId) {
        return Array.from(this.graph.connections.values())
            .filter(c => c.outputNodeId === nodeId || c.inputNodeId === nodeId);
    }
}
