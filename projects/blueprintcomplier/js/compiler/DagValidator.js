import { CycleDetector } from './CycleDetector.js';

export class DagValidator {
    static validate(graph) {
        const errors = [];

        // 1. Check for cycles starting from any node
        for (const [nodeId, _] of graph.nodes) {
            if (CycleDetector.hasCycle(graph, nodeId)) {
                errors.push(`Cyclic dependency detected at Node ID: ${nodeId}`);
                break; // One cycle is enough to fail
            }
        }

        // 2. We could add more checks here (e.g. disconnected nodes, type mismatches that bypassed UI logic)

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
}
