/**
 * Dedicated Min-Heap using the core PriorityQueue logic, optimized for Ask matching
 */
class MinHeap extends PriorityQueue {
    constructor(evaluator = (x) => x) {
        // Evaluate condition: a < b for Min-Heap
        super((a, b) => evaluator(a) < evaluator(b));
    }
}

window.MinHeap = MinHeap;
