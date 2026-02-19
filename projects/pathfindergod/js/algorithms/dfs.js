export function dfs(grid, startNode, endNode, allowDiagonal = false) {
    const visitedNodesInOrder = [];
    const stack = [];
    stack.push(startNode);

    // We track visited separately to avoid re-adding to stack if we want strict DFS 
    // but in a grid, standard "visited" flag is enough.

    while (stack.length > 0) {
        const currentNode = stack.pop();

        if (currentNode.isWall) continue;
        if (currentNode === endNode) {
            visitedNodesInOrder.push(currentNode);
            return visitedNodesInOrder;
        }

        if (!currentNode.isVisited) {
            currentNode.isVisited = true;
            visitedNodesInOrder.push(currentNode);

            const neighbors = grid.getNeighbors(currentNode, allowDiagonal);
            // Push reverse so that the first neighbor is popped first (natural order)
            for (let i = neighbors.length - 1; i >= 0; i--) {
                const neighbor = neighbors[i];
                if (!neighbor.isVisited && !neighbor.isWall) {
                    neighbor.parent = currentNode;
                    stack.push(neighbor);
                }
            }
        }
    }
    return visitedNodesInOrder;
}

export function getNodesInShortestPathOrder(endNode) {
    const nodesInShortestPathOrder = [];
    let currentNode = endNode;
    while (currentNode !== null) {
        nodesInShortestPathOrder.unshift(currentNode);
        currentNode = currentNode.parent;
    }
    return nodesInShortestPathOrder;
}
