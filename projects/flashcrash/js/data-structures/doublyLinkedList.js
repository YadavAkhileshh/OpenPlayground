/**
 * Doubly Linked List for rapid order deletion and insertion at price levels
 */
class ListNode {
    constructor(value) {
        this.value = value;
        this.next = null;
        this.prev = null;
    }
}

class DoublyLinkedList {
    constructor() {
        this.head = null;
        this.tail = null;
        this.length = 0;
    }

    append(value) {
        const node = new ListNode(value);
        if (this.tail) {
            this.tail.next = node;
            node.prev = this.tail;
            this.tail = node;
        } else {
            this.head = node;
            this.tail = node;
        }
        this.length++;
        return node;
    }

    removeNode(node) {
        if (node.prev) {
            node.prev.next = node.next;
        } else {
            this.head = node.next;
        }

        if (node.next) {
            node.next.prev = node.prev;
        } else {
            this.tail = node.prev;
        }

        node.next = null;
        node.prev = null;
        this.length--;
        return node.value;
    }

    peekHead() {
        return this.head ? this.head.value : null;
    }

    shift() {
        if (!this.head) return null;
        return this.removeNode(this.head);
    }

    isEmpty() {
        return this.length === 0;
    }

    *iterator() {
        let curr = this.head;
        while (curr) {
            yield curr.value;
            curr = curr.next;
        }
    }
}

window.DoublyLinkedList = DoublyLinkedList;
