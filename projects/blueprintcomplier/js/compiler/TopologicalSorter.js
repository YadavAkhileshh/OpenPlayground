export class TopologicalSorter {
    /**
     * Sorts the nodes connected via the execution path.
     * We follow the `exec` connections specifically to determine execution order.
     * Data nodes are evaluated lazily during execution, but for strict sequential
     * steps, we find the "Start" node and follow its exec lineage.
     */
    static sort(graph, startNodes) {
        const sorted = [];
        const visited = new Set();

        for (const sn of startNodes) {
            let currentId = sn.id;

            while (currentId) {
                if (visited.has(currentId)) break; // Prevent loops if somehow bypassed

                visited.add(currentId);
                const node = graph.getNode(currentId);
                if (node) {
                    sorted.push(node);
                }

                // Find next node via Exec connection
                const outgoingExecs = Array.from(graph.connections.values())
                    .filter(c => c.outputNodeId === currentId && c.isExec);

                if (outgoingExecs.length > 0) {
                    // For Branch nodes, they might have True/False outputs.
                    // This simple linear sort handles the main sequence.
                    // A true compiler generates code for all branches. Here, we just trace main flows.
                    // For a full AST, we don't just "sort", we build the AST recursively.
                    // For the sake of the project, we'll return all connected nodes chronologically 
                    // and rely on CodeGenerator to walk the graph recursively from Start.
                }

                break; // Instead of sorting flat, we will use CodeGenerator for recursive AST building
            }
        }

        // Actually, just returning the nodes isn't enough for conditional logic.
        // We will do a full recursive build in CodeGenerator.
        return sorted;
    }
}
