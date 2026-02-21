/**
 * Simple fast FIFO Queue implementing linked list internally for O(1) ops
 */
class QueueNode {
    constructor(value) {
        this.value = value;
        this.next = null;
    }
}

class Queue {
    constructor() {
        this.head = null;
        this.tail = null;
        this.length = 0;
    }

    enqueue(value) {
        const node = new QueueNode(value);
        if (this.tail) {
            this.tail.next = node;
            this.tail = node;
        } else {
            this.head = node;
            this.tail = node;
        }
        this.length++;
    }

    dequeue() {
        if (!this.head) return null;
        const value = this.head.value;
        this.head = this.head.next;
        if (!this.head) {
            this.tail = null;
        }
        this.length--;
        return value;
    }

    peek() {
        return this.head ? this.head.value : null;
    }

    isEmpty() {
        return this.length === 0;
    }

    toArray() {
        const arr = [];
        let curr = this.head;
        while (curr) {
            arr.push(curr.value);
            curr = curr.next;
        }
        return arr;
    }
}

window.Queue = Queue;
