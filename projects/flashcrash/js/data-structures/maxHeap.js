/**
 * Dedicated Max-Heap using the core PriorityQueue logic, optimized for Bid matching
 */
class MaxHeap extends PriorityQueue {
    constructor(evaluator = (x) => x) {
        // Evaluate condition: a > b for Max-Heap
        super((a, b) => evaluator(a) > evaluator(b));
    }
}

window.MaxHeap = MaxHeap;
