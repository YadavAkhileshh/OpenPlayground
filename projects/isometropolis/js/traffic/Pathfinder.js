/**
 * A* Pathfinding Algorithm Implementation
 */
export class Pathfinder {
    /**
     * @param {RoadNetwork} network
     */
    constructor(network) {
        this.network = network;
    }

    /**
     * Heuristic for A* (Manhattan distance)
     */
    _heuristic(x1, y1, x2, y2) {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }

    /**
     * Finds the shortest path using A*
     * @param {number} startX
     * @param {number} startY
     * @param {number} endX
     * @param {number} endY
     * @returns {Array<{x, y}>|null} Array of path nodes, or null if no path.
     */
    findPath(startX, startY, endX, endY) {
        if (startX === endX && startY === endY) return [];

        const startKey = `${startX},${startY}`;
        const endKey = `${endX},${endY}`;

        if (!this.network.graph.has(startKey) || !this.network.graph.has(endKey)) {
            return null; // Start or end not on a road
        }

        // Min-Priority Queue (using simple array sorting for brevity/size constraints)
        const openSet = [{ x: startX, y: startY, f: 0, g: 0 }];
        const openSetMap = new Map();
        openSetMap.set(startKey, openSet[0]);

        const cameFrom = new Map();

        const gScore = new Map();
        gScore.set(startKey, 0);

        while (openSet.length > 0) {
            // Sort to get lowest f score (Can be optimized with binary heap for huge scale)
            openSet.sort((a, b) => a.f - b.f);
            const current = openSet.shift();
            const currentKey = `${current.x},${current.y}`;
            openSetMap.delete(currentKey);

            if (current.x === endX && current.y === endY) {
                return this._reconstructPath(cameFrom, currentKey);
            }

            const edges = this.network.getEdges(current.x, current.y);

            for (const edge of edges) {
                const neighborKey = `${edge.x},${edge.y}`;
                const tentativeG = gScore.get(currentKey) + edge.cost;

                const currG = gScore.has(neighborKey) ? gScore.get(neighborKey) : Infinity;

                if (tentativeG < currG) {
                    cameFrom.set(neighborKey, { x: current.x, y: current.y });
                    gScore.set(neighborKey, tentativeG);

                    const fScore = tentativeG + this._heuristic(edge.x, edge.y, endX, endY);

                    if (!openSetMap.has(neighborKey)) {
                        const node = { x: edge.x, y: edge.y, f: fScore, g: tentativeG };
                        openSet.push(node);
                        openSetMap.set(neighborKey, node);
                    } else {
                        const node = openSetMap.get(neighborKey);
                        node.g = tentativeG;
                        node.f = fScore;
                    }
                }
            }
        }

        return null; // No path found
    }

    _reconstructPath(cameFrom, currentKey) {
        const path = [];
        let curr = currentKey;

        while (cameFrom.has(curr)) {
            const [x, y] = curr.split(',').map(Number);
            path.unshift({ x, y });
            const prev = cameFrom.get(curr);
            curr = `${prev.x},${prev.y}`;
        }

        // Push start node as well if wanted, but usually vehicles move TO the first node.
        return path;
    }
}
