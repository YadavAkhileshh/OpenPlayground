import { PriorityQueue } from '../structs/priorityQueue.js';

export function dijkstra(grid, startNode, endNode) {
    const visitedNodesInOrder = [];
    startNode.distance = 0;
    const pq = new PriorityQueue();
    pq.enqueue(startNode, 0);

    const visitedSet = new Set(); // Keep track of visited nodes to avoid cyclic behaviors in non-monotone graphs if needed, but mainly for optimization here

    while (!pq.isEmpty()) {
        const { node: closestNode } = pq.dequeue();

        if (visitedSet.has(closestNode)) continue;
        visitedSet.add(closestNode);

        // If we hit a wall, skip (though we shouldn't have added it)
        if (closestNode.isWall) continue;

        // Visual tracking
        visitedNodesInOrder.push(closestNode);
        closestNode.isVisited = true;

        if (closestNode === endNode) {
            return visitedNodesInOrder;
        }

        updateUnvisitedNeighbors(closestNode, grid, pq);
    }
    return visitedNodesInOrder;
}

function updateUnvisitedNeighbors(node, grid, pq) {
    const unvisitedNeighbors = getUnvisitedNeighbors(node, grid);
    for (const neighbor of unvisitedNeighbors) {
        const newDist = node.distance + neighbor.weight;

        if (newDist < neighbor.distance) {
            neighbor.distance = newDist;
            neighbor.parent = node;
            pq.enqueue(neighbor, neighbor.distance);
        }
    }
}

function getUnvisitedNeighbors(node, grid) {
    const neighbors = [];
    const { row, col } = node;
    // Up, Right, Down, Left
    const dirs = [[-1, 0], [0, 1], [1, 0], [0, -1]];

    for (const [dr, dc] of dirs) {
        const r = row + dr;
        const c = col + dc;
        if (r >= 0 && r < grid.rows && c >= 0 && c < grid.cols) {
            const neighbor = grid.nodes[r][c];
            if (!neighbor.isVisited && !neighbor.isWall) {
                neighbors.push(neighbor);
            }
        }
    }
    return neighbors;
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
