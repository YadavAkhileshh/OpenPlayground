/**
 * Pool of Web Workers to simulate CPU cores
 */
class WorkerPool {
    constructor(size) {
        this.size = size;
        this.workers = [];
        this.available = []; // indices of available workers
        this.messageIdSeq = 0;
        this.pendingResolvers = new Map();

        this.init();
    }

    init() {
        for (let i = 0; i < this.size; i++) {
            const worker = new Worker('js/process/thread.worker.js');
            worker.onmessage = this.handleMessage.bind(this);
            worker.onerror = (e) => Logger.error('WorkerPool', `Worker ${i} error: ${e.message}`);

            this.workers.push(worker);
            this.available.push(i);
        }
        Logger.info('WorkerPool', `Initialized ${this.size} vCPUs.`);
    }

    handleMessage(e) {
        const { messageId, type, success, result, error, progress } = e.data;
        const resolver = this.pendingResolvers.get(messageId);

        if (!resolver) return;

        if (type === 'PROGRESS') {
            if (resolver.onProgress) resolver.onProgress(progress);
            return;
        }

        // Job completed
        this.pendingResolvers.delete(messageId);
        this.available.push(resolver.workerId);

        // Notify scheduler that a core freed up
        EventBus.emit('scheduler:coreAvailable');

        if (success) {
            resolver.resolve(result);
        } else {
            resolver.reject(new Error(error));
        }
    }

    async executeTask(type, payload, onProgress = null) {
        if (this.available.length === 0) {
            throw new Error("No available workers"); // Handled by Scheduler Queue
        }

        const workerId = this.available.shift();
        const worker = this.workers[workerId];
        const messageId = ++this.messageIdSeq;

        return new Promise((resolve, reject) => {
            this.pendingResolvers.set(messageId, { resolve, reject, workerId, onProgress });
            worker.postMessage({ messageId, type, payload });
        });
    }

    isAvailable() {
        return this.available.length > 0;
    }
}
