/**
 * Represents the entire state of the Blueprint
 */
export class Graph {
    constructor() {
        this.nodes = new Map(); // id -> NodeModel
        this.connections = new Map(); // id -> ConnectionModel
    }

    addNode(node) {
        this.nodes.set(node.id, node);
    }

    removeNode(nodeId) {
        this.nodes.delete(nodeId);
    }

    addConnection(connection) {
        this.connections.set(connection.id, connection);
    }

    removeConnection(connectionId) {
        this.connections.delete(connectionId);
    }

    clear() {
        this.nodes.clear();
        this.connections.clear();
    }

    getNode(nodeId) {
        return this.nodes.get(nodeId);
    }

    getConnection(connectionId) {
        return this.connections.get(connectionId);
    }
}
