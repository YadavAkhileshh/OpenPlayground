import { PriorityQueue } from '../structs/priorityQueue.js';

export function astar(grid, startNode, endNode) {
    const visitedNodesInOrder = [];
    startNode.g = 0;
    startNode.h = heuristic(startNode, endNode);
    startNode.f = startNode.g + startNode.h;

    const pq = new PriorityQueue();
    pq.enqueue(startNode, startNode.f);

    const visitedSet = new Set();

    while (!pq.isEmpty()) {
        const { node: currentNode } = pq.dequeue();

        if (visitedSet.has(currentNode)) continue;
        visitedSet.add(currentNode);

        if (currentNode.isWall) continue;

        visitedNodesInOrder.push(currentNode);
        currentNode.isVisited = true;

        if (currentNode === endNode) {
            return visitedNodesInOrder;
        }

        const neighbors = getNeighbors(currentNode, grid);
        for (const neighbor of neighbors) {
            if (visitedSet.has(neighbor) || neighbor.isWall) continue;

            const tentativeG = currentNode.g + neighbor.weight;

            if (tentativeG < neighbor.g) {
                neighbor.parent = currentNode;
                neighbor.g = tentativeG;
                neighbor.h = heuristic(neighbor, endNode);
                neighbor.f = neighbor.g + neighbor.h;
                pq.enqueue(neighbor, neighbor.f);
            }
        }
    }
    return visitedNodesInOrder;
}

function heuristic(nodeA, nodeB) {
    // Manhattan distance
    return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col);
}

function getNeighbors(node, grid) {
    const neighbors = [];
    const { row, col } = node;
    const dirs = [[-1, 0], [0, 1], [1, 0], [0, -1]];

    for (const [dr, dc] of dirs) {
        const r = row + dr;
        const c = col + dc;
        if (r >= 0 && r < grid.rows && c >= 0 && c < grid.cols) {
            neighbors.push(grid.nodes[r][c]);
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
