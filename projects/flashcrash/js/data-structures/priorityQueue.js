/**
 * A fast priority queue implemented as a binary heap.
 * By default a Max-Heap. Pass a custom comparator for Min-Heap.
 */
class PriorityQueue {
    constructor(comparator = (a, b) => a > b) {
        this._heap = [];
        this._comparator = comparator;
    }

    size() {
        return this._heap.length;
    }

    isEmpty() {
        return this.size() === 0;
    }

    peek() {
        return this._heap[0];
    }

    push(...values) {
        values.forEach(value => {
            this._heap.push(value);
            this._siftUp();
        });
        return this.size();
    }

    pop() {
        const poppedValue = this.peek();
        const bottom = this.size() - 1;
        if (bottom > 0) {
            this._swap(0, bottom);
        }
        this._heap.pop();
        this._siftDown();
        return poppedValue;
    }

    replace(value) {
        const replacedValue = this.peek();
        this._heap[0] = value;
        this._siftDown();
        return replacedValue;
    }

    _parent(i) {
        return ((i + 1) >>> 1) - 1;
    }

    _left(i) {
        return (i << 1) + 1;
    }

    _right(i) {
        return (i + 1) << 1;
    }

    _swap(i, j) {
        const temp = this._heap[i];
        this._heap[i] = this._heap[j];
        this._heap[j] = temp;
    }

    _siftUp() {
        let node = this.size() - 1;
        while (node > 0 && this._comparator(this._heap[node], this._heap[this._parent(node)])) {
            this._swap(node, this._parent(node));
            node = this._parent(node);
        }
    }

    _siftDown() {
        let node = 0;
        while (
            (this._left(node) < this.size() && this._comparator(this._heap[this._left(node)], this._heap[node])) ||
            (this._right(node) < this.size() && this._comparator(this._heap[this._right(node)], this._heap[node]))
        ) {
            let maxChild = (this._right(node) < this.size() && this._comparator(this._heap[this._right(node)], this._heap[this._left(node)])) ? this._right(node) : this._left(node);
            this._swap(node, maxChild);
            node = maxChild;
        }
    }
}

window.PriorityQueue = PriorityQueue;
