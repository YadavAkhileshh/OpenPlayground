/**
 * Fast ring-buffer for fixed-size continuous data holding (e.g. chart history)
 */
class CircularBuffer {
    constructor(capacity) {
        this.capacity = capacity;
        this.buffer = new Array(capacity);
        this.head = 0;
        this.tail = 0;
        this.size = 0;
    }

    push(item) {
        this.buffer[this.tail] = item;
        this.tail = (this.tail + 1) % this.capacity;
        if (this.size === this.capacity) {
            this.head = (this.head + 1) % this.capacity;
        } else {
            this.size++;
        }
    }

    get(index) {
        if (index < 0 || index >= this.size) return undefined;
        return this.buffer[(this.head + index) % this.capacity];
    }

    last() {
        if (this.size === 0) return undefined;
        let idx = this.tail - 1;
        if (idx < 0) idx = this.capacity - 1;
        return this.buffer[idx];
    }

    clear() {
        this.head = 0;
        this.tail = 0;
        this.size = 0;
    }

    toArray() {
        const result = new Array(this.size);
        for (let i = 0; i < this.size; i++) {
            result[i] = this.buffer[(this.head + i) % this.capacity];
        }
        return result;
    }
}

window.CircularBuffer = CircularBuffer;
