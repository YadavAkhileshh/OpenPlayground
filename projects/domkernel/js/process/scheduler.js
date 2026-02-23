/**
 * Process Scheduler
 * Manages CPU time effectively across Workers
 */
class Scheduler {
    constructor() {
        this.processList = new Map();
        this.runQueue = [];
        this.workerPool = new WorkerPool(CONSTANTS.WORKER_POOL_SIZE);

        EventBus.on('scheduler:coreAvailable', () => this.tick());
    }

    spawn(command, args, parentPid = 0) {
        let pid;
        try {
            pid = PIDAllocator.allocate();
        } catch (e) {
            EventBus.emit('system:error', e.message);
            throw e;
        }

        const proc = new Process(pid, command, args, parentPid);
        this.processList.set(pid, proc);

        EventBus.emit(CONSTANTS.EVENTS.PROCESS_START, { pid, command });
        return proc;
    }

    async exec(proc, type, payload, onProgress = null) {
        proc.setState('READY');
        this.runQueue.push({ proc, type, payload, onProgress });
        this.tick();

        return proc.completionPromise;
    }

    async kill(pid) {
        const proc = this.processList.get(pid);
        if (!proc) throw Errors.ESRCH(pid);

        if (proc.state === 'DEAD' || proc.state === 'ZOMBIE') return;

        // Remove from run queue
        this.runQueue = this.runQueue.filter(job => job.proc.pid !== pid);

        proc.exitCode = 137; // SIGKILL
        proc.setState('DEAD');
        PIDAllocator.free(pid);
        this.processList.delete(pid);
        EventBus.emit(CONSTANTS.EVENTS.PROCESS_EXIT, { pid, code: 137 });
    }

    tick() {
        if (this.runQueue.length === 0) return;
        if (!this.workerPool.isAvailable()) return;

        const job = this.runQueue.shift();
        const proc = job.proc;

        if (proc.state === 'DEAD') {
            this.tick();
            return;
        }

        proc.setState('RUNNING');
        const startExecutionTime = performance.now();

        this.workerPool.executeTask(job.type, job.payload, job.onProgress)
            .then(result => {
                proc.cpuTime += performance.now() - startExecutionTime;
                proc.exit(0);
                this.processList.delete(proc.pid);
            })
            .catch(err => {
                proc.cpuTime += performance.now() - startExecutionTime;
                proc.crash(err.message);
                this.processList.delete(proc.pid);
            });
    }

    getProcessList() {
        return Array.from(this.processList.values());
    }
}

window.ProcessScheduler = null; // initialized during boot
