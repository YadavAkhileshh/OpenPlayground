export class CycleDetector {
    // Returns true if a cycle is detected starting from a given node
    static hasCycle(graph, startNodeId) {
        const visited = new Set();
        const recursionStack = new Set();

        const dfs = (nodeId) => {
            if (recursionStack.has(nodeId)) {
                return true; // Cycle detected
            }
            if (visited.has(nodeId)) {
                return false; // Already checked this branch
            }

            visited.add(nodeId);
            recursionStack.add(nodeId);

            // Get all outgoing connections from this node (both exec and data)
            const outgoingConnections = Array.from(graph.connections.values())
                .filter(c => c.outputNodeId === nodeId);

            for (const conn of outgoingConnections) {
                if (dfs(conn.inputNodeId)) {
                    return true;
                }
            }

            recursionStack.delete(nodeId);
            return false;
        };

        return dfs(startNodeId);
    }
}
