/**
 * Object Pool Class
 * Manages reuse of objects to prevent garbage collection spikes.
 */

export class ObjectPool {
    constructor(createFn, resetFn, initialSize = 100) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.pool = [];

        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.createFn());
        }
    }

    get() {
        if (this.pool.length > 0) {
            const item = this.pool.pop();
            this.resetFn(item);
            return item;
        } else {
            return this.createFn();
        }
    }

    release(item) {
        this.pool.push(item);
    }
}
