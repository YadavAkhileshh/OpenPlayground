export function bfs(grid, startNode, endNode, allowDiagonal = false) {
    const visitedNodesInOrder = [];
    const queue = [];
    queue.push(startNode);
    startNode.isVisited = true;
    startNode.distance = 0;

    while (queue.length > 0) {
        const currentNode = queue.shift();
        visitedNodesInOrder.push(currentNode);

        if (currentNode === endNode) return visitedNodesInOrder;

        const neighbors = grid.getNeighbors(currentNode, allowDiagonal);
        for (const neighbor of neighbors) {
            if (!neighbor.isVisited && !neighbor.isWall) {
                neighbor.isVisited = true;
                neighbor.parent = currentNode;
                neighbor.distance = currentNode.distance + 1;
                queue.push(neighbor);
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
